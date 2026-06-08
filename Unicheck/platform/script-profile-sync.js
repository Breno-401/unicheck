// Sincronização de perfil entre páginas
(function () {
    function getStoredProfile() {
        try {
            const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
            const savedProfile = localStorage.getItem(key);
            return savedProfile ? JSON.parse(savedProfile) : null;
        } catch (error) {
            console.warn('Erro ao carregar dados do perfil:', error);
            return null;
        }
    }

    async function getCurrentAuthUserId() {
        try {
            const debug = await window.UniCheckAuth?.getAuthDebugSnapshot?.('script-profile-sync');
            return debug?.user?.id || null;
        } catch (error) {
            console.warn('Erro ao validar usuario autenticado:', error);
            return null;
        }
    }

    function clearProfileDisplay() {
        const selectors = [
            { container: '.user-profile .user-avatar', text: '.user-profile .user-avatar span' },
            { container: '.user-dropdown-avatar', text: '.user-dropdown-avatar span' },
            { container: '.user-avatar-small', text: '.user-avatar-small span' }
        ];

        selectors.forEach(({ container, text }) => {
            const element = document.querySelector(container);
            const textElement = document.querySelector(text);

            if (element) {
                element.style.backgroundImage = 'none';
                element.style.backgroundSize = '';
                element.style.backgroundPosition = '';
            }

            if (textElement) {
                textElement.style.opacity = '1';
                textElement.textContent = 'US';
            }
        });

        const sidebarName = document.querySelector('.user-profile h4');
        if (sidebarName) sidebarName.textContent = 'Usuario';

        const userNameIndicator = document.querySelector('.user-name-indicator');
        if (userNameIndicator) userNameIndicator.textContent = 'Usuario';

        const dropdownName = document.querySelector('.user-dropdown-info h4');
        if (dropdownName) dropdownName.textContent = 'Usuario';

        const dropdownEmail = document.querySelector('.user-dropdown-info p');
        if (dropdownEmail) dropdownEmail.textContent = '';
    }

    async function loadProfileData() {
        try {
            const currentUserId = await getCurrentAuthUserId();

            if (window.UniCheckProfile && typeof window.UniCheckProfile.getMyProfile === 'function') {
                const profile = await window.UniCheckProfile.getMyProfile();
                if (profile && currentUserId && profile.id === currentUserId) {
                    updateProfileDisplay(profile);
                    return;
                }

                if (profile && currentUserId && profile.id !== currentUserId) {
                    const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
                    localStorage.removeItem(key);
                    console.warn('Perfil local ignorado por pertencer a outro usuario.', {
                        profileId: profile.id || null,
                        currentUserId
                    });
                }
            }
        } catch (error) {
            console.warn('Erro ao sincronizar perfil com Supabase:', error);
        }

        const profile = getStoredProfile();
        const currentUserId = await getCurrentAuthUserId();
        if (profile && currentUserId && profile.id === currentUserId) {
            updateProfileDisplay(profile);
            return;
        }

        clearProfileDisplay();
    }

    function updateProfileDisplay(profile) {
        const avatarUrl = profile.avatarImage || profile.foto_url || profile.photo_url || null;

        const sidebarAvatar = document.querySelector('.user-profile .user-avatar span');
        if (sidebarAvatar && profile.avatarText) {
            sidebarAvatar.textContent = profile.avatarText;
            const sidebarAvatarContainer = document.querySelector('.user-profile .user-avatar');
            if (avatarUrl) {
                sidebarAvatarContainer.style.backgroundImage = `url(${avatarUrl})`;
                sidebarAvatarContainer.style.backgroundSize = 'cover';
                sidebarAvatarContainer.style.backgroundPosition = 'center';
                sidebarAvatar.textContent = '';
            } else {
                sidebarAvatarContainer.style.backgroundImage = 'none';
                sidebarAvatar.textContent = profile.avatarText || 'JS';
            }
        }

        const sidebarName = document.querySelector('.user-profile h4');
        if (sidebarName && profile.nome) {
            sidebarName.textContent = profile.nome;
        }

        const userNameIndicator = document.querySelector('.user-name-indicator');
        if (userNameIndicator && profile.nome) {
            userNameIndicator.textContent = profile.nome;
        }

        const dropdownEmail = document.querySelector('.user-dropdown-info p');
        if (dropdownEmail && profile.email) {
            dropdownEmail.textContent = profile.email;
        }

        const dropdownName = document.querySelector('.user-dropdown-info h4');
        if (dropdownName && profile.nome) {
            dropdownName.textContent = profile.nome;
        }

        const dropdownAvatar = document.querySelector('.user-dropdown-avatar span');
        if (dropdownAvatar && profile.avatarText) {
            dropdownAvatar.textContent = profile.avatarText;
            const dropdownAvatarContainer = document.querySelector('.user-dropdown-avatar');
            if (avatarUrl) {
                dropdownAvatarContainer.style.backgroundImage = `url(${avatarUrl})`;
                dropdownAvatarContainer.style.backgroundSize = 'cover';
                dropdownAvatarContainer.style.backgroundPosition = 'center';
                dropdownAvatar.textContent = '';
            } else {
                dropdownAvatarContainer.style.backgroundImage = 'none';
                dropdownAvatar.textContent = profile.avatarText || 'JS';
            }
        }

        const navbarAvatar = document.querySelector('.user-avatar-small');
        if (navbarAvatar) {
            if (avatarUrl) {
                navbarAvatar.style.backgroundImage = `url(${avatarUrl})`;
                navbarAvatar.style.backgroundSize = 'cover';
                navbarAvatar.style.backgroundPosition = 'center';
                const span = navbarAvatar.querySelector('span');
                if (span) span.style.opacity = '0';
            } else {
                navbarAvatar.style.backgroundImage = 'none';
                const span = navbarAvatar.querySelector('span');
                if (span) {
                    span.style.opacity = '1';
                    span.textContent = profile.avatarText || 'JS';
                }
            }
        }
    }

    function initializeProfile() {
        loadProfileData();

        window.addEventListener('focus', loadProfileData);
        window.addEventListener('storage', event => {
            const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
            if (event.key === key) {
                loadProfileData();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProfile);
    } else {
        initializeProfile();
    }
})();
