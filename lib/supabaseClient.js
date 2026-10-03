import { createClient } from "@supabase/supabase-js";

const url = "https://awymwlzpzkqjovygenda.supabase.co";
const key = "sb_publishable_1PwoBzvc_K_ftlJ5rrazBw_437izYL1";

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
