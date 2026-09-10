import { createClient, type Session, type User } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
	| string
	| undefined;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY as
	| string
	| undefined;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		// Consume the session returned in the URL after email confirmation.
		detectSessionInUrl: true,
	},
});

export function getSupabaseStorageKey() {
	try {
		if (typeof window === "undefined" || !window.localStorage) return null;

		const hostname = new URL(supabaseUrl as string).hostname;
		const projectId = hostname.split(".")[0];

		return `sb-${projectId}-auth-token`;
	} catch {
		return null;
	}
}

function parseStoredSession(raw: string | null): Session | null {
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw);

		return (
			parsed?.currentSession ??
			parsed?.session ??
			(parsed?.access_token ? parsed : null) ??
			null
		);
	} catch {
		return null;
	}
}

export function getStoredSession(): Session | null {
	try {
		if (typeof window === "undefined" || !window.localStorage) return null;

		const storageKey = getSupabaseStorageKey();
		if (!storageKey) return null;

		return parseStoredSession(localStorage.getItem(storageKey));
	} catch {
		return null;
	}
}

export function getStoredAccessToken(): string | null {
	return getStoredSession()?.access_token ?? null;
}

export function getStoredSupabaseUser(): User | null {
	return getStoredSession()?.user ?? null;
}

export async function getAccessToken() {
	try {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw error;

		const token = data.session?.access_token ?? null;
		if (token) return token;

		return getStoredAccessToken();
	} catch {
		return getStoredAccessToken();
	}
}
