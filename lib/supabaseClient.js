import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경변수가 설정돼야 동작 (Vercel/.env.local)
export const isSupabaseReady = Boolean(url && key);
export const supabase = isSupabaseReady ? createClient(url, key) : null;
