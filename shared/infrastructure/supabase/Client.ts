import { createClient } from "@supabase/supabase-js";

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = (url: string, anonKey: string) => {
	if (!supabaseInstance) {
		supabaseInstance = createClient(url, anonKey);
	}
	return supabaseInstance;
};
