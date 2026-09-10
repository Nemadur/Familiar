import type { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	use,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from "react";
import { toast } from "sonner";
import type {
	AuthResponse,
	AuthRole,
	RegistrationSocials,
} from "@/api/auth/auth-types";
import { useRegisterAccount } from "@/hooks/auth/use-register";
import { useUserById } from "@/hooks/user/use-user";
import { ApiFetchError } from "@/lib/fetch";
import i18n from "@/lib/i18n";
import { getStoredSupabaseUser, supabase } from "@/lib/supabase";
import type { AccountType } from "@/types/auth/schema/accounts";
import type { LoginData } from "@/types/auth/schema/login";
import type { RegisterData } from "@/types/auth/schema/register";
import type { TUserResponse } from "@/types/user";

interface AuthContextValue {
	user: TUserResponse | null;
	authEmail: string | null;
	isEmailVerified: boolean;
	pending: boolean;
	isPending: boolean;
	error: Error | null;
	refreshSession: () => Promise<void>;
	login: (data: LoginData) => Promise<void>;
	register: (data: RegisterData) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	onAuthStateChange: (
		callback: (user: TUserResponse | null) => void,
	) => () => void;
}

type AuthState = {
	session: Session | null | undefined;
	authBusy: boolean;
};

type AuthAction =
	| { type: "start" }
	| { type: "stop" }
	| { type: "set-session"; session: Session | null };

const initialAuthState: AuthState = {
	session: undefined,
	authBusy: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case "start":
			return {
				...state,
				authBusy: true,
			};

		case "stop":
			return {
				...state,
				authBusy: false,
			};

		case "set-session":
			return {
				session: action.session,
				authBusy: false,
			};

		default:
			return state;
	}
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const REGISTRATION_ROLE_BY_ACCOUNT_TYPE = {
	client: "CLIENT",
	artist: "ARTIST",
} satisfies Record<AccountType, AuthRole>;

export type RegistrationErrorField = Extract<keyof RegisterData, string>;

export class RegistrationError extends Error {
	readonly field?: RegistrationErrorField;
	readonly status?: number;

	constructor(
		message: string,
		options: { field?: RegistrationErrorField; status?: number } = {},
	) {
		super(message);
		this.name = "RegistrationError";
		this.field = options.field;
		this.status = options.status;
	}
}

function optionalTrimmedValue(value: string) {
	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getRegistrationSocials(
	socials: RegisterData["socials"],
): RegistrationSocials | undefined {
	const entries = Object.entries(socials)
		.map(([platform, value]) => [platform, value.trim()] as const)
		.filter(([, value]) => value.length > 0);

	return entries.length > 0
		? (Object.fromEntries(entries) as RegistrationSocials)
		: undefined;
}

function getApiErrorMessage(error: ApiFetchError) {
	if (!error.body) {
		return undefined;
	}

	try {
		const body = JSON.parse(error.body) as {
			message?: unknown;
			error?: unknown;
		};
		const message =
			typeof body.message === "string"
				? body.message
				: typeof body.error === "string"
					? body.error
					: undefined;

		return message?.trim() || undefined;
	} catch {
		return error.body.trim() || undefined;
	}
}

function getRegistrationErrorField(
	message: string | undefined,
): RegistrationErrorField | undefined {
	const normalizedMessage = message?.toLowerCase() ?? "";

	if (normalizedMessage.includes("invite")) return "invite_key";
	if (normalizedMessage.includes("username")) return "username";
	if (normalizedMessage.includes("email")) return "email";
	if (normalizedMessage.includes("password")) return "password";
	if (normalizedMessage.includes("bio")) return "bio";
	if (normalizedMessage.includes("social")) return "socials";
	if (normalizedMessage.includes("cover")) return "cover";
	if (normalizedMessage.includes("avatar")) return "avatar";

	return undefined;
}

function getRegistrationError(error: unknown): RegistrationError {
	if (error instanceof ApiFetchError) {
		const apiMessage = getApiErrorMessage(error);
		const field = getRegistrationErrorField(apiMessage);

		switch (error.status) {
			case 400:
				return new RegistrationError(
					field === "invite_key"
						? i18n.t("auth.errors.invalid_invite_key")
						: apiMessage || i18n.t("auth.errors.invalid_registration"),
					{ field, status: error.status },
				);
			case 409:
				return new RegistrationError(
					field === "username"
						? i18n.t("auth.errors.username_taken")
						: i18n.t("auth.errors.email_registered"),
					{ field, status: error.status },
				);
			case 415:
				return new RegistrationError(
					i18n.t("auth.errors.unsupported_registration_image"),
					{ field: field ?? "avatar", status: error.status },
				);
			case 429:
				return new RegistrationError(
					apiMessage || i18n.t("auth.errors.rate_limit"),
					{ field, status: error.status },
				);
			case 502:
				return new RegistrationError(
					i18n.t("auth.errors.registration_provider_failed"),
					{ status: error.status },
				);
			case 503:
				return new RegistrationError(
					i18n.t("auth.errors.registration_service_unavailable"),
					{ status: error.status },
				);
		}
	}

	const message = error instanceof Error ? error.message : String(error);

	return new RegistrationError(
		i18n.t("auth.errors.registration_failed", {
			error: message,
		}),
	);
}

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
		accentColor: null,
		isVerified: false,
		isPremium: false,
		createdAt: restoredUser.created_at ?? new Date().toISOString(),
		roles: [],
	};
}

function getOptimisticUserFromStorage(): TUserResponse | null {
	try {
		const restoredUser = getStoredSupabaseUser();
		if (!restoredUser) return null;

		return toOptimisticUser(restoredUser);
	} catch (error) {
		console.error("Failed to parse auth session from storage", error);
		return null;
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const { mutateAsync: registerAccount } = useRegisterAccount();
	const [{ session, authBusy }, dispatchAuth] = useReducer(
		authReducer,
		initialAuthState,
	);

	const listeners = useRef<Array<(user: TUserResponse | null) => void>>([]);

	const sessionUserId = session?.user?.id ?? null;

	const optimisticUser = useMemo(() => {
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
	const authEmail = session?.user?.email?.trim().toLowerCase() ?? null;
	const isEmailVerified = Boolean(
		session?.user?.email_confirmed_at ?? session?.user?.confirmed_at,
	);
	const error = userQueryError instanceof Error ? userQueryError : null;

	const isPending =
		authBusy || session === undefined || (!!sessionUserId && userQueryPending);

	const pending = isPending;

	const notifyListeners = useCallback((newUser: TUserResponse | null) => {
		listeners.current.forEach((listener) => {
			listener(newUser);
		});
	}, []);

	const refreshSession = useCallback(async () => {
		dispatchAuth({ type: "start" });

		try {
			const { data, error } = await supabase.auth.getSession();

			if (error) {
				throw error;
			}

			dispatchAuth({
				type: "set-session",
				session: data.session ?? null,
			});
		} catch (error) {
			console.error(
				i18n.t("auth.errors.failed_refresh_session", {
					error: (error as Error).message,
				}),
				error,
			);

			dispatchAuth({
				type: "set-session",
				session: null,
			});
		}
	}, []);

	const login = useCallback(async (data: LoginData) => {
		dispatchAuth({ type: "start" });

		const promise = (async () => {
			const { data: signInData, error } =
				await supabase.auth.signInWithPassword({
					email: data.email.trim().toLowerCase(),
					password: data.password,
				});

			if (error) {
				throw new Error(i18n.t("auth.errors.invalid_credentials"));
			}

			dispatchAuth({
				type: "set-session",
				session: signInData.session ?? null,
			});
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

			dispatchAuth({ type: "stop" });
			throw error;
		}
	}, []);

	const register = useCallback(
		async (data: RegisterData) => {
			dispatchAuth({ type: "start" });

			const promise = (async () => {
				try {
					const username = optionalTrimmedValue(data.username);
					const displayName = optionalTrimmedValue(data.display_name);
					const bio = optionalTrimmedValue(data.bio);
					const socials = getRegistrationSocials(data.socials);

					const response = await registerAccount({
						request: {
							email: data.email.trim().toLowerCase(),
							password: data.password,
							roleKey: REGISTRATION_ROLE_BY_ACCOUNT_TYPE[data.account_type],
							inviteKey: data.invite_key,
							...(username ? { username } : null),
							...(displayName ? { displayName } : null),
							...(bio ? { bio } : null),
							...(socials ? { socials } : null),
						},
						avatar: data.avatar,
						cover: data.cover,
					});

					if (!response.access_token || !response.refresh_token) {
						dispatchAuth({ type: "set-session", session: null });
						return response;
					}

					const { data: sessionData, error: sessionError } =
						await supabase.auth.setSession({
							access_token: response.access_token,
							refresh_token: response.refresh_token,
						});

					if (sessionError) {
						throw sessionError;
					}

					dispatchAuth({
						type: "set-session",
						session: sessionData.session ?? null,
					});

					return response;
				} catch (error) {
					throw getRegistrationError(error);
				}
			})();

			toast.promise(promise, {
				loading: i18n.t("auth.register.pending"),
				success: (response) =>
					response.access_token
						? i18n.t("auth.register.success")
						: i18n.t("auth.register.confirm_email"),
				error: (error) => ({
					message: i18n.t("auth.register.error_title"),
					description:
						error instanceof Error
							? error.message
							: i18n.t("auth.errors.invalid_registration"),
					duration: 7_000,
					closeButton: true,
				}),
			});

			try {
				return await promise;
			} catch (error) {
				dispatchAuth({ type: "stop" });
				throw error;
			}
		},
		[registerAccount],
	);

	const logout = useCallback(async () => {
		dispatchAuth({ type: "start" });

		try {
			await supabase.auth.signOut();

			dispatchAuth({
				type: "set-session",
				session: null,
			});

			notifyListeners(null);
		} catch (error) {
			console.error(
				i18n.t("auth.errors.logout_failed", {
					error: (error as Error).message,
				}),
				error,
			);

			dispatchAuth({ type: "stop" });
		}
	}, [notifyListeners]);

	const onAuthStateChange = useCallback(
		(callback: (user: TUserResponse | null) => void) => {
			listeners.current.push(callback);

			return () => {
				listeners.current = listeners.current.filter((l) => l !== callback);
			};
		},
		[],
	);

	useEffect(() => {
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
				dispatchAuth({
					type: "set-session",
					session: nextSession ?? null,
				});

				return;
			}

			if (event === "SIGNED_OUT") {
				dispatchAuth({
					type: "set-session",
					session: null,
				});

				notifyListeners(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [notifyListeners, refreshSession]);

	useEffect(() => {
		if (!isPending) {
			notifyListeners(user);
		}
	}, [isPending, notifyListeners, user]);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			authEmail,
			isEmailVerified,
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
			authEmail,
			isEmailVerified,
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
	const context = use(AuthContext);

	if (context === undefined) {
		throw new Error(i18n.t("auth.errors.use_auth_provider"));
	}

	return context;
}
