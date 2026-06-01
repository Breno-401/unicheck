(function () {
    const SUPABASE_URL = "https://fmejskidoobfslrrgvit.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_3YuCQ9FEsI218vMSKjYBqA_2Ro_WJMa";

    const hasLibrary =
        typeof window !== "undefined" &&
        window.supabase &&
        typeof window.supabase.createClient === "function";

    let client = null;

    if (!hasLibrary) {
        console.warn("Supabase JS nao foi carregado. Inclua o CDN antes de js/config.js.");
    } else {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }

    window.UniCheckSupabase = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        client,
        isConfigured: Boolean(client)
    };
})();