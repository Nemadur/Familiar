import * as React from "react";
import { toast } from "sonner";
import { getCurrentUser } from "@/api/users";
import { getMe } from "@/data/user";
import { apiFetch, getApiBaseUrl } from "@/lib/fetch";
import i18n from "@/lib/i18n";
import { getSupabaseStorageKey, supabase } from "@/lib/supabase";
import type { LoginData } from "@/types/auth/schema/login";
import type { RegisterData } from "@/types/auth/schema/register";
import type { TUserResponse } from "@/types/user";

interface AuthContextValue {
	user: TUserResponse | null;
	pending: boolean;
	refreshSession: () => Promise<void>;
	login: (data: LoginData) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
	onAuthStateChange: (
		callback: (user: TUserResponse | null) => void,
	) => () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
	undefined,
);

function getOptimisticUserFromStorage(): TUserResponse | null {
	try {
		const storageKey = getSupabaseStorageKey();
		if (!storageKey) return null;

		const sessionStr = localStorage.getItem(storageKey);
		if (!sessionStr) return null;

		const parsed = JSON.parse(sessionStr);
		const restoredUser =
			parsed?.currentSession?.user ??
			parsed?.session?.user ??
			parsed?.user ??
			null;

		if (!restoredUser) return null;

		return {
			uuid: restoredUser.id,
			username: restoredUser.user_metadata?.username || "",
			display_name: restoredUser.user_metadata?.display_name || "",
			email: restoredUser.email || "",
			role: "user",
			created_at: restoredUser.created_at,
		} as unknown as TUserResponse;
	} catch (e) {
		console.error("Failed to parse auth session from storage", e);
		return null;
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<TUserResponse | null>(
		getOptimisticUserFromStorage(),
	);
	const [pending, setPending] = React.useState(true);
	const listeners = React.useRef<Array<(user: TUserResponse | null) => void>>(
		[],
	);

	const notifyListeners = React.useCallback((newUser: TUserResponse | null) => {
		listeners.current.forEach((listener) => {
			listener(newUser);
		});
	}, []);

	React.useEffect(() => {
		try {
			const storageKey = getSupabaseStorageKey();
			if (!storageKey) return;

			const sessionStr = localStorage.getItem(storageKey);
			if (!sessionStr) return;

			const parsed = JSON.parse(sessionStr);
			const restoredUser =
				parsed?.currentSession?.user ??
				parsed?.session?.user ??
				parsed?.user ??
				null;

			if (!restoredUser) return;

			setUser({
				uuid: restoredUser.id,
				username: restoredUser.user_metadata?.username || "",
				display_name: restoredUser.user_metadata?.display_name || "",
				email: restoredUser.email || "",
				role: "CLIENT",
				created_at: restoredUser.created_at,
			} as unknown as TUserResponse);
		} catch (error) {
			console.error("Failed to get current user from storage", error);
		}
	}, []);

	const refreshSession = React.useCallback(async () => {
		setPending(true);

		try {
			const [
				{
					data: { session },
					error: sessionError,
				},
				{
					data: { user: authUser },
					error: userError,
				},
			] = await Promise.all([
				supabase.auth.getSession(),
				supabase.auth.getUser(),
			]);

			if (sessionError) {
				throw sessionError;
			}

			if (userError && userError.message !== "Auth session missing!") {
				throw userError;
			}

			if (!authUser || !session?.access_token) {
				setUser(null);
				notifyListeners(null);
				return;
			}

			const me = await getCurrentUser();
			setUser(me);
			notifyListeners(me);
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
	}, [notifyListeners]);

	const login = React.useCallback(
		async (data: LoginData) => {
			setPending(true);

			const promise = (async () => {
				const { error } = await supabase.auth.signInWithPassword({
					email: data.email.trim().toLowerCase(),
					password: data.password,
				});

				if (error) {
					throw new Error(i18n.t("auth.errors.invalid_credentials"));
				}

				await refreshSession();
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
					i18n.t("auth.errors.login_failed", {
						error: (error as Error).message,
					}),
					error,
				);
				throw error;
			} finally {
				setPending(false);
			}
		},
		[refreshSession],
	);

	const register = React.useCallback(
		async (data: RegisterData) => {
			setPending(true);

			const promise = (async () => {
				const { data: signUpData, error } = await supabase.auth.signUp({
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
					if (error.message?.toLowerCase().includes("rate limit")) {
						throw new Error(i18n.t("auth.errors.rate_limit"));
					}

					throw new Error(
						i18n.t("auth.errors.registration_failed", {
							error: error.message,
						}),
					);
				}

				if (signUpData.session) {
					await refreshSession();
				} else {
					setUser(null);
					notifyListeners(null);
				}

				if (
					signUpData.session &&
					(data.avatar_url ||
						data.cover_url ||
						data.bio ||
						(data.socials && data.socials.length > 0))
				) {
					// try {
					// } catch (e) {
					// 	console.error("Failed to update profile with extra details:", e);
					// }
					// TODO: send data to backend
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
		[notifyListeners, refreshSession],
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
		(callback: (user: TUserResponse | null) => void) => {
			listeners.current.push(callback);

			return () => {
				listeners.current = listeners.current.filter((l) => l !== callback);
			};
		},
		[],
	);

	React.useEffect(() => {
		void refreshSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (
				event === "SIGNED_IN" ||
				event === "TOKEN_REFRESHED" ||
				event === "USER_UPDATED"
			) {
				void refreshSession();
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				notifyListeners(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [notifyListeners, refreshSession]);

	const value = React.useMemo<AuthContextValue>(
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
