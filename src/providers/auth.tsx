import * as React from "react";
import { toast } from "sonner";
import { ensureUserProfile, getUserById } from "@/data/user";
import i18n from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { getQueryClient } from "@/providers/query-client";
import type { LoginData } from "@/types/auth/schema/login";
import type { RegisterData } from "@/types/auth/schema/register";
import type { User } from "@/types/user";

interface AuthContext {
	user: User | null;
	pending: boolean;
	refreshSession: (metadata?: {
		username?: string;
		display_name?: string;
	}) => Promise<void>;
	login: (data: LoginData) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
	onAuthStateChange: (callback: (user: User | null) => void) => () => void;
}

const AuthContext = React.createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Initialize user to null to prevent hydration mismatch
	const [user, setUser] = React.useState<User | null>(null);

	// Optimistically restore session from localStorage on mount
	React.useEffect(() => {
		try {
			if (typeof window === "undefined" || !window.localStorage) return;

			const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
			if (!supabaseUrl) return;

			const hostname = new URL(supabaseUrl).hostname;
			const projectId = hostname.split(".")[0];
			const storageKey = `sb-${projectId}-auth-token`;
			const sessionStr = localStorage.getItem(storageKey);

			if (sessionStr) {
				const session = JSON.parse(sessionStr);
				if (session?.user) {
					setUser({
						uuid: session.user.id,
						username: session.user.user_metadata?.username || "",
						display_name: session.user.user_metadata?.display_name || "",
						email: session.user.email || "",
						role: "user",
						created_at: session.user.created_at,
					} as unknown as User);
				}
			}
		} catch (e) {
			console.error("Failed to parse auth session from storage", e);
		}
	}, []);
	const [pending, setPending] = React.useState(true);
	const listeners = React.useRef<((user: User | null) => void)[]>([]);

	const notifyListeners = React.useCallback((newUser: User | null) => {
		listeners.current.forEach((listener) => {
			listener(newUser);
		});
	}, []);

	const refreshSession = React.useCallback(
		async (metadata?: { username?: string; display_name?: string }) => {
			setPending(true);
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error) {
					// Only log unexpected errors. "Auth session missing!" is expected when not logged in.
					if (error.message !== "Auth session missing!") {
						console.error("Failed to get user:", error);
					}
					setUser(null);
					notifyListeners(null);
					return;
				}

				if (user) {
					// Fetch user details from database using Supabase User ID
					const queryClient = getQueryClient();
					const fetchedUser = await queryClient.fetchQuery({
						queryKey: ["user", user.id],
						queryFn: () => getUserById({ data: { uuid: user.id } }),
						staleTime: 60 * 1000,
					});

					console.log(fetchedUser);

					if (fetchedUser) {
						setUser(fetchedUser);
						notifyListeners(fetchedUser);
					} else {
						// Attempt to create profile if metadata exists (fix for missing trigger)
						const { username, display_name } = user.user_metadata || {};
						if (username && display_name) {
							try {
								await ensureUserProfile({
									data: { uuid: user.id, username, display_name },
								});
								// Retry fetch
								await queryClient.invalidateQueries({
									queryKey: ["user", user.id],
								});
								const retriedUser = await queryClient.fetchQuery({
									queryKey: ["user", user.id],
									queryFn: () => getUserById({ data: { uuid: user.id } }),
								});
								if (retriedUser) {
									setUser(retriedUser);
									notifyListeners(retriedUser);
									return;
								}
							} catch (e) {
								console.error(
									i18n.t("auth.errors.failed_auto_create_profile", {
										error: (e as Error).message,
									}),
									e,
								);
							}
						}

						console.warn(i18n.t("auth.errors.user_authenticated_not_found"));
						setUser(null);
						notifyListeners(null);
					}
				} else {
					setUser(null);
					notifyListeners(null);
				}
			} catch (error) {
				console.error(
					i18n.t("auth.errors.failed_refresh_session", {
						error: (error as Error).message,
					}),
					error,
				);
				setUser(null);
				notifyListeners(null);
			} finally {
				setPending(false);
			}
		},
		[notifyListeners],
	);

	const login = React.useCallback(async (data: LoginData) => {
		setPending(true);
		const promise = (async () => {
			const { error } = await supabase.auth.signInWithPassword({
				email: data.email.trim(),
				password: data.password,
			});

			if (error) {
				// Prevent user enumeration
				throw new Error(i18n.t("auth.errors.invalid_credentials"));
			}
			// refreshSession will be triggered by onAuthStateChange if successful
		})();

		toast.promise(promise, {
			loading: i18n.t("auth.login.pending"),
			success: i18n.t("auth.login.success"),
			error: (err) => err.message,
		});

		try {
			await promise;
		} catch (error) {
			console.error(
				i18n.t("auth.errors.login_failed", { error: (error as Error).message }),
				error,
			);
			throw error;
		} finally {
			setPending(false);
		}
	}, []);

	const register = React.useCallback(
		async (data: RegisterData) => {
			setPending(true);

			const promise = (async () => {
				const { error } = await supabase.auth.signUp({
					email: data.email.trim().toLowerCase(),
					password: data.password,
					options: {
						data: {
							display_name: data.display_name,
							username: data.username,
							account_type: data.account_type,
							invite_key: data.invite_key,
						},
					},
				});

				if (error) {
					if (error.message?.includes("rate limit")) {
						throw new Error(i18n.t("auth.errors.rate_limit"));
					}
					throw new Error(
						i18n.t("auth.errors.registration_failed", { error: error.message }),
					);
				}

				// Manually refresh session to ensure profile creation logic runs
				// The onAuthStateChange might fire before profile is created, so we need the retry logic in refreshSession
				await refreshSession({
					username: data.username,
					display_name: data.display_name,
				});

				// Update profile with additional data
				if (
					data.avatar_url ||
					data.cover_url ||
					data.bio ||
					(data.socials && data.socials.length > 0)
				) {
					try {
						// Wait for user to be available (refreshSession should have set it or handled it)
						const {
							data: { user },
						} = await supabase.auth.getUser();

						if (user) {
							await ensureUserProfile({
								data: {
									uuid: user.id,
									username: data.username,
									display_name: data.display_name,
									bio: data.bio,
									avatar_url: data.avatar_url,
									cover_url: data.cover_url,
									socials: data.socials,
								},
							});
						}
					} catch (e) {
						console.error("Failed to update profile with extra details:", e);
						// Don't throw, registration was successful
					}
				}
			})();

			toast.promise(promise, {
				loading: i18n.t("auth.register.pending"),
				success: i18n.t("auth.register.success"),
				error: (err) => err.message,
			});

			try {
				await promise;
			} finally {
				setPending(false);
			}
		},
		[refreshSession],
	);

	const logout = React.useCallback(async () => {
		setPending(true);
		try {
			await supabase.auth.signOut();
			setUser(null);
			notifyListeners(null);
		} catch (error) {
			console.error(
				i18n.t("auth.errors.logout_failed", {
					error: (error as Error).message,
				}),
				error,
			);
		} finally {
			setPending(false);
		}
	}, [notifyListeners]);

	const onAuthStateChange = React.useCallback(
		(callback: (user: User | null) => void) => {
			listeners.current.push(callback);
			return () => {
				listeners.current = listeners.current.filter((l) => l !== callback);
			};
		},
		[],
	);

	React.useEffect(() => {
		// Initial session check
		refreshSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
				if (session?.user) {
					try {
						const queryClient = getQueryClient();
						const fetchedUser = await queryClient.fetchQuery({
							queryKey: ["user", session.user.id],
							queryFn: () => getUserById({ data: { uuid: session.user.id } }),
							staleTime: 60 * 1000,
						});
						if (fetchedUser) {
							setUser(fetchedUser);
							notifyListeners(fetchedUser);
						}
					} catch (error) {
						console.error(
							i18n.t("auth.errors.failed_fetch_user_auth_change", {
								error: (error as Error).message,
							}),
							error,
						);
					}
				}
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				notifyListeners(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [refreshSession, notifyListeners]);

	const value = React.useMemo(
		() => ({
			user,
			pending,
			refreshSession,
			login,
			register,
			logout,
			onAuthStateChange,
		}),
		[user, pending, refreshSession, login, register, logout, onAuthStateChange],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error(i18n.t("auth.errors.use_auth_provider"));
	}
	return context;
}
