import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined or provide a fallback/error
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: { autoRefreshToken: true },
});

// Service role client for admin tasks (server-side only)
export const supabaseAdmin = supabaseServiceKey
	? createClient(supabaseUrl, supabaseServiceKey, {
			auth: { autoRefreshToken: true },
		})
	: null;

export async function getAccessToken() {
	if (typeof window === "undefined") return null;

	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();
	if (error) throw error;
	return session?.access_token ?? null;
}

export function getSupabaseStorageKey() {
	try {
		if (typeof window === "undefined" || !window.localStorage) return null;

		const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
		if (!supabaseUrl) return null;

		const hostname = new URL(supabaseUrl).hostname;
		const projectId = hostname.split(".")[0];

		return `sb-${projectId}-auth-token`;
	} catch {
		return null;
	}
}
