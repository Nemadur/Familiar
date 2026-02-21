import * as React from "react";
import { getUserById } from "@/data/user";
import { supabase } from "@/lib/supabase";
import type { LoginData } from "@/types/auth/schema/login";
import type { User } from "@/types/user";

interface AuthContext {
	user: User | null;
	pending: boolean;
	refreshSession: () => Promise<void>;
	login: (data: LoginData) => Promise<void>;
	logout: () => Promise<void>;
	onAuthStateChange: (callback: (user: User | null) => void) => () => void;
}

const AuthContext = React.createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null);
	const [pending, setPending] = React.useState(true);
	const listeners = React.useRef<((user: User | null) => void)[]>([]);

	const notifyListeners = React.useCallback((newUser: User | null) => {
		listeners.current.forEach((listener) => {
			listener(newUser);
		});
	}, []);

	const refreshSession = React.useCallback(async () => {
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
				const fetchedUser = await getUserById({
					data: { uuid: user.id },
				});

				if (fetchedUser) {
					setUser(fetchedUser);
					notifyListeners(fetchedUser);
				} else {
					console.warn(
						"User authenticated in Supabase but not found in database.",
					);
					setUser(null);
					notifyListeners(null);
				}
			} else {
				setUser(null);
				notifyListeners(null);
			}
		} catch (error) {
			console.error("Failed to refresh session:", error);
			setUser(null);
			notifyListeners(null);
		} finally {
			setPending(false);
		}
	}, [notifyListeners]);

	const login = React.useCallback(
		async (data: LoginData) => {
			setPending(true);
			try {
				const { error } = await supabase.auth.signInWithPassword({
					email: data.email,
					password: data.password,
				});

				if (error) {
					throw new Error(error.message);
				}

				await refreshSession();
			} catch (error) {
				console.error("Login failed:", error);
				throw error;
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
			console.error("Logout failed:", error);
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
					const fetchedUser = await getUserById({
						data: { uuid: session.user.id },
					});
					if (fetchedUser) {
						setUser(fetchedUser);
						notifyListeners(fetchedUser);
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
			logout,
			onAuthStateChange,
		}),
		[user, pending, refreshSession, login, logout, onAuthStateChange],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
