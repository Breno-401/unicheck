// One renderer for the sidebar (expanded/rail), header and profile menu.
(function () {
    if (window.ProfileManager?.initialized) return;
    const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
    const readyKey = 'unicheck:avatar-ready';
    const selectors = ['.user-profile .user-avatar', '.user-avatar-small', '.user-dropdown-avatar', '#profile-avatar'];
    let profile = null, currentUserId, generation = 0, syncVersion = 0, bound = false;
    let requestedUrl, loadedUrl = null, image = null;
    const read = () => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
    const ready = () => { try { return JSON.parse(sessionStorage.getItem(readyKey) || 'null'); } catch (_) { return null; } };
    const remember = value => { try { value ? sessionStorage.setItem(readyKey, JSON.stringify(value)) : sessionStorage.removeItem(readyKey); } catch (_) { /* Optional performance hint. */ } };
    function validUrl(value) {
        if (!value) return null;
        try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch (_) { return null; }
    }
    function paint(url, pending = false) {
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                if (container.dataset?.avatarPreview === 'true') return;
                container.style.backgroundImage = url ? `url("${url.replaceAll('"', '%22')}")` : '';
                container.style.backgroundSize = url ? 'cover' : '';
                container.style.backgroundPosition = url ? 'center' : '';
                container.setAttribute('aria-busy', String(pending));
                const span = container.querySelector('span');
                if (span) { span.style.opacity = url || pending ? '0' : '1'; span.textContent = profile?.avatarText || 'US'; }
                else container.textContent = url || pending ? '' : profile?.avatarText || 'US';
            });
        });
    }
    function labels() {
        for (const selector of ['.user-profile h4', '.user-name-indicator', '.user-dropdown-info h4']) {
            const element = document.querySelector(selector); if (element) element.textContent = profile?.nome || 'Usuário';
        }
        const email = document.querySelector('.user-dropdown-info p'); if (email) email.textContent = profile?.email || '';
    }
    function clear(userId = null) {
        generation++; syncVersion++; currentUserId = userId; profile = null;
        requestedUrl = undefined; loadedUrl = null; image = null;
        remember(null); labels(); paint(null, Boolean(userId));
    }
    function render(next) {
        if (!next?.id || (currentUserId !== undefined && next.id !== currentUserId)) return;
        if (profile?.id && profile.id !== next.id) clear(next.id);
        profile = next; labels();
        if (next.profilePending) { paint(loadedUrl, !loadedUrl); return; }
        const url = validUrl(next.foto_url);
        if (requestedUrl === url) { paint(loadedUrl, Boolean(url && image)); return; }
        requestedUrl = url;
        const ticket = ++generation;
        if (!url) { loadedUrl = null; image = null; remember(null); paint(null); return; }
        const hint = ready();
        if (hint?.id === next.id && hint.url === url) loadedUrl = url;
        paint(loadedUrl, !loadedUrl);
        const candidate = new Image(); image = candidate;
        candidate.onload = () => {
            if (ticket !== generation) return;
            loadedUrl = url; image = null; remember({ id: next.id, url }); paint(url);
        };
        candidate.onerror = () => {
            if (ticket !== generation) return;
            image = null;
            if (loadedUrl === url) { loadedUrl = null; remember(null); }
            paint(loadedUrl);
        };
        candidate.src = url;
    }
    async function sync() {
        const ticket = ++syncVersion;
        try {
            const session = await window.UniCheckAuth?.getSession?.();
            if (ticket !== syncVersion) return;
            if (!session?.user) return; // Restoration/network ambiguity is not sign-out.
            if (currentUserId !== undefined && currentUserId !== session.user.id) clear(session.user.id);
            currentUserId = session.user.id;
            const cached = read(); if (cached?.id === currentUserId) render(cached);
        } catch (_) { /* Keep the last successfully rendered avatar. */ }
    }
    async function load() {
        await sync();
        try {
            // Service emits profile-updated only for a current response.
            await window.UniCheckProfile?.getMyProfile?.();
        } catch (error) { console.warn('Não foi possível atualizar o perfil.', error); }
    }
    function bindAutoSync() {
        if (bound) return; bound = true;
        window.addEventListener('unicheck:profile-updated', event => render(event.detail?.profile));
        window.addEventListener('unicheck:session-changed', event => {
            const id = event.detail?.userId;
            if (event.detail?.signedOut) { clear(); return; }
            if (id && id !== currentUserId) {
                if (currentUserId === undefined) currentUserId = id;
                else clear(id);
                // Do not call Supabase from inside its auth callback.
                setTimeout(load, 0);
            }
        });
        window.addEventListener('storage', event => { if (event.key === key || event.key === null) sync(); });
        window.addEventListener('pageshow', () => sync());
        // Visibility/focus do not invalidate a loaded image or refetch the profile.
    }
    window.ProfileManager = { initialized: true, sync, bindAutoSync, refreshAvatar: () => paint(loadedUrl, Boolean(image) || Boolean(profile?.profilePending)) };
    bindAutoSync();
    paint(null, true);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once: true });
    else load();
})();
