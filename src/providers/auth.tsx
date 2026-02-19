import * as React from "react";
import { getUserByUsername } from "@/data/user";
import type { User } from "@/types/user";

interface AuthContext {
	user: User | null;
	pending: boolean;
	refreshSession: () => Promise<void>;
	login: (username: string) => Promise<void>;
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
			const storedUsername = localStorage.getItem("familiar-username");
			if (storedUsername) {
				const fetchedUser = await getUserByUsername({
					data: { username: storedUsername },
				});

				if (fetchedUser) {
					setUser(fetchedUser);
					notifyListeners(fetchedUser);
				}

				setUser(null);
				notifyListeners(null);
				localStorage.removeItem("familiar-username");
			}

			setUser(null);
			notifyListeners(null);
		} catch (error) {
			console.error("Failed to refresh session:", error);
			setUser(null);
			notifyListeners(null);
		} finally {
			setPending(false);
		}
	}, [notifyListeners]);

	const login = React.useCallback(
		async (username: string) => {
			setPending(true);
			try {
				const fetchedUser = await getUserByUsername({ data: { username } });
				if (fetchedUser) {
					localStorage.setItem("familiar-username", username);
					setUser(fetchedUser);
					notifyListeners(fetchedUser);
				}

				throw new Error("User not found");
			} catch (error) {
				console.error("Login failed:", error);
				throw error;
			} finally {
				setPending(false);
			}
		},
		[notifyListeners],
	);

	const logout = React.useCallback(async () => {
		setPending(true);
		try {
			localStorage.removeItem("familiar-username");
			setUser(null);
			notifyListeners(null);
		} finally {
			setPending(false);
		}
	}, [notifyListeners]);

	const onAuthStateChange = React.useCallback(
		(callback: (user: User | null) => void) => {
			listeners.current.push(callback);
			// Call immediately with current state
			// callback(user); // Optional: depends on desired behavior, but usually subscription implies future updates.
			return () => {
				listeners.current = listeners.current.filter((l) => l !== callback);
			};
		},
		[],
	);

	React.useEffect(() => {
		refreshSession();
	}, [refreshSession]);

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
