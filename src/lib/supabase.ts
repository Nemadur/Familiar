import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined or provide a fallback/error
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
