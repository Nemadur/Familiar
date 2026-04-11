import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useUserById } from "@/hooks/use-user";
import i18n from "@/lib/i18n";
import { getStoredSupabaseUser, supabase } from "@/lib/supabase";
import type { LoginData } from "@/types/auth/schema/login";
import type { RegisterData } from "@/types/auth/schema/register";
import type { TUserResponse } from "@/types/user";

interface AuthContextValue {
	user: TUserResponse | null;
	isPending: boolean;
	error: Error | null;
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

function toOptimisticUser(restoredUser: User): TUserResponse {
	return {
		userId: restoredUser.id,
		username: String(restoredUser.user_metadata?.username ?? ""),
		displayName: String(
			restoredUser.user_metadata?.display_name ??
				restoredUser.user_metadata?.displayName ??
				"",
		),
		pronouns: null,
		bio: null,
		avatarPath: null,
		// coverPath: null,
		accentColor: null,
		isVerified: false,
		isPremium: false,
		// isPrivate: false,
		createdAt: restoredUser.created_at ?? new Date().toISOString(),
		roles: [],
	};
}

function getOptimisticUserFromStorage(): TUserResponse | null {
	try {
		const restoredUser = getStoredSupabaseUser();
		if (!restoredUser) return null;
		return toOptimisticUser(restoredUser);
	} catch (e) {
		console.error("Failed to parse auth session from storage", e);
		return null;
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = React.useState<Session | null | undefined>(
		undefined,
	);
	const [authBusy, setAuthBusy] = React.useState(true);
	const listeners = React.useRef<Array<(user: TUserResponse | null) => void>>(
		[],
	);

	const sessionUserId = session?.user?.id ?? null;
	const optimisticUser = React.useMemo(() => {
		if (session?.user) {
			return toOptimisticUser(session.user);
		}

		if (session === undefined) {
			return getOptimisticUserFromStorage();
		}

		return null;
	}, [session]);

	const {
		user: fetchedUser,
		isPending: userQueryPending,
		error: userQueryError,
	} = useUserById(
		sessionUserId ?? "",
		!!sessionUserId && session !== undefined,
	);

	const user = fetchedUser ?? optimisticUser ?? null;
	const error = userQueryError instanceof Error ? userQueryError : null;
	const isPending =
		authBusy || session === undefined || (!!sessionUserId && userQueryPending);
	const pending = isPending;

	const notifyListeners = React.useCallback((newUser: TUserResponse | null) => {
		listeners.current.forEach((listener) => {
			listener(newUser);
		});
	}, []);

	const refreshSession = React.useCallback(async () => {
		setAuthBusy(true);

		try {
			const { data, error } = await supabase.auth.getSession();
			if (error) throw error;
			setSession(data.session ?? null);
		} catch (error) {
			console.error(
				i18n.t("auth.errors.failed_refresh_session", {
					error: (error as Error).message,
				}),
				error,
			);
			setSession(null);
		} finally {
			setAuthBusy(false);
		}
	}, []);

	const login = React.useCallback(async (data: LoginData) => {
		setAuthBusy(true);

		const promise = (async () => {
			const { data: signInData, error } =
				await supabase.auth.signInWithPassword({
					email: data.email.trim().toLowerCase(),
					password: data.password,
				});

			if (error) {
				throw new Error(i18n.t("auth.errors.invalid_credentials"));
			}

			setSession(signInData.session ?? null);
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
			setAuthBusy(false);
		}
	}, []);

	const register = React.useCallback(async (data: RegisterData) => {
		setAuthBusy(true);

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

			setSession(signUpData.session ?? null);
		})();

		toast.promise(promise, {
			loading: i18n.t("auth.register.pending"),
			success: i18n.t("auth.register.success"),
			error: (err) => err.message,
		});

		try {
			await promise;
		} finally {
			setAuthBusy(false);
		}
	}, []);

	const logout = React.useCallback(async () => {
		setAuthBusy(true);

		try {
			await supabase.auth.signOut();
			setSession(null);
			notifyListeners(null);
		} catch (error) {
			console.error(
				i18n.t("auth.errors.logout_failed", {
					error: (error as Error).message,
				}),
				error,
			);
		} finally {
			setAuthBusy(false);
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
		} = supabase.auth.onAuthStateChange((event, nextSession) => {
			if (
				event === "INITIAL_SESSION" ||
				event === "SIGNED_IN" ||
				event === "TOKEN_REFRESHED" ||
				event === "USER_UPDATED"
			) {
				setSession(nextSession ?? null);
				setAuthBusy(false);
			} else if (event === "SIGNED_OUT") {
				setSession(null);
				setAuthBusy(false);
				notifyListeners(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [notifyListeners, refreshSession]);

	React.useEffect(() => {
		if (!isPending) {
			notifyListeners(user);
		}
	}, [isPending, notifyListeners, user]);

	const value = React.useMemo<AuthContextValue>(
		() => ({
			user,
			pending,
			isPending,
			error,
			refreshSession,
			login,
			register,
			logout,
			onAuthStateChange,
		}),
		[
			user,
			pending,
			isPending,
			error,
			refreshSession,
			login,
			register,
			logout,
			onAuthStateChange,
		],
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
