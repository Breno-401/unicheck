// Gerencia sincronização de perfil entre páginas
(function () {
    function getProfile() {
        try {
            const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
            const savedProfile = localStorage.getItem(key);
            return savedProfile ? JSON.parse(savedProfile) : null;
        } catch (error) {
            console.warn('Erro ao carregar dados do perfil:', error);
            return null;
        }
    }

    function setAvatar(container, textElement, profile) {
        if (!container) return;

        const avatarUrl = profile.avatarImage || profile.foto_url || profile.photo_url || null;

        if (avatarUrl) {
            container.style.backgroundImage = `url(${avatarUrl})`;
            container.style.backgroundSize = 'cover';
            container.style.backgroundPosition = 'center';
            if (textElement) {
                textElement.style.opacity = '0';
            }
            return;
        }

        container.style.backgroundImage = 'none';
        container.style.backgroundSize = '';
        container.style.backgroundPosition = '';
        if (textElement) {
            textElement.style.opacity = '1';
            textElement.textContent = profile.avatarText || 'JS';
        }
    }

    function updateInterface(profile) {
        if (!profile) return;

        setAvatar(
            document.querySelector('.user-avatar-small'),
            document.querySelector('.user-avatar-small span'),
            profile
        );
        setAvatar(
            document.querySelector('.user-profile .user-avatar'),
            document.querySelector('.user-profile .user-avatar span'),
            profile
        );
        setAvatar(
            document.querySelector('.user-dropdown-avatar'),
            document.querySelector('.user-dropdown-avatar span'),
            profile
        );

        const sidebarName = document.querySelector('.user-profile h4');
        if (sidebarName && profile.nome) sidebarName.textContent = profile.nome;

        const userNameIndicator = document.querySelector('.user-name-indicator');
        if (userNameIndicator && profile.nome) userNameIndicator.textContent = profile.nome;

        const dropdownName = document.querySelector('.user-dropdown-info h4');
        if (dropdownName && profile.nome) dropdownName.textContent = profile.nome;

        const dropdownEmail = document.querySelector('.user-dropdown-info p');
        if (dropdownEmail && profile.email) dropdownEmail.textContent = profile.email;
    }

    function sync() {
        const profile = getProfile();
        if (profile) {
            updateInterface(profile);
        }
    }

    function bindAutoSync() {
        window.addEventListener('focus', sync);
        window.addEventListener('storage', event => {
            const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
            if (event.key === key) {
                sync();
            }
        });
    }

    window.ProfileManager = {
        sync,
        bindAutoSync
    };
})();
