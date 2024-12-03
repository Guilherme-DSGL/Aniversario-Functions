import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

export const supabaseUrl = Deno.env.get("SUPABASE_URL");
export const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

export const createSupabaseClient = (authHeader: string) => {
    return createClient(supabaseUrl ?? "", supabaseKey ?? "", { global: { headers: { Authorization: authHeader } } });
}