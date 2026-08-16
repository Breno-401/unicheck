// script.js - Funcionalidades do Dashboard UniCheck (Melhorado)

// ==========================
// INICIALIZAÇÃO DOS ÍCONES
// ==========================

/**
 * Inicializa os ícones Lucide de forma segura
 */
function initializeIcons() {
    try {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons();
        }
    } catch (error) {
        console.warn('Erro ao inicializar ícones Lucide:', error);
    }
}

// ==========================
// GERENCIAMENTO DE TEMA
// ==========================

// Elementos do tema
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const htmlElement = document.documentElement;

/**
 * Verifica e aplica o tema salvo ou a preferência do sistema
 */
function initializeTheme() {
    // Verificar se os elementos existem
    if (!themeToggle && !themeToggleMobile) return;
    
    try {
        // Verificar tema salvo no localStorage ou preferência do sistema
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || 'theme';
        const savedTheme = localStorage.getItem(themeKey) || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // Aplicar tema
        htmlElement.setAttribute('data-theme', savedTheme);
        
        // Atualizar ícones do tema
        updateThemeIcon();
        
        // Adicionar listener para mudanças de preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(themeKey)) {
                htmlElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                updateThemeIcon();
            }
        });
    } catch (error) {
        console.warn('Erro ao inicializar tema:', error);
        // Tema padrão como fallback
        htmlElement.setAttribute('data-theme', 'light');
    }
}

/**
 * Atualiza os ícones do tema (lua/sol) conforme o tema atual
 */
function updateThemeIcon() {
    try {
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const moonIcons = document.querySelectorAll('[data-lucide="moon"]');
        
        // Substituir ícones de lua por sol no modo escuro
        moonIcons.forEach(icon => {
            if (isDark) {
                icon.setAttribute('data-lucide', 'sun');
            } else {
                icon.setAttribute('data-lucide', 'moon');
            }
        });
        
        // Re-inicializar ícones Lucide
        initializeIcons();
    } catch (error) {
        console.warn('Erro ao atualizar ícones do tema:', error);
    }
}

/**
 * Alterna entre os temas claro e escuro
 */
function toggleTheme() {
    try {
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Aplicar novo tema
        htmlElement.setAttribute('data-theme', newTheme);
        
        // Salvar preferência
        const themeKey = window.UniCheckConfig?.STORAGE_KEYS?.THEME || 'theme';
        localStorage.setItem(themeKey, newTheme);
        
        // Atualizar ícones
        updateThemeIcon();
    } catch (error) {
        console.warn('Erro ao alternar tema:', error);
    }
}

// Event listeners para os botões de tema (com verificação de segurança)
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}
if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', toggleTheme);
}

// ==========================
// TELA DE LOADING
// ==========================

/**
 * Loading interno removido.
 * Mantido como no-op para preservar a assinatura usada pela inicialização.
 */
function simulateLoading() {
    return;
}

// ==========================
// NAVBAR/SIDEBAR MELHORADA
// ==========================

// Elementos da sidebar
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.querySelector('.main-content');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileOverlay = document.getElementById('mobileOverlay');
const navLinks = document.querySelectorAll('.nav-link');

/**
 * Alterna o estado da sidebar (expandida/recolhida) com animação suave
 */
function toggleSidebar() {
    if (sidebar && mainContent) {
        // Adicionar classe de transição suave
        sidebar.style.transition = 'width var(--transition-normal), transform var(--transition-normal)';
        mainContent.style.transition = 'margin-left var(--transition-normal)';
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Controlar visibilidade da logo baseada no estado da sidebar
        updateLogoVisibility();
        
        // Forçar re-inicialização dos ícones após a transição
        setTimeout(() => {
            initializeIcons();
        }, 300);
        
        // Salvar estado da sidebar no localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        const sidebarKey = window.UniCheckConfig?.STORAGE_KEYS?.SIDEBAR_COLLAPSED || 'sidebarCollapsed';
        localStorage.setItem(sidebarKey, isCollapsed);
    }
}

/**
 * Atualiza a visibilidade da logo baseada no estado da sidebar
 */
function updateLogoVisibility() {
    const sidebar = document.getElementById('sidebar');
    const logoSection = document.querySelector('.logo-section');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar || !logoSection || !sidebarToggle) return;
    
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Sidebar colapsada: esconder logo e texto
        logoSection.style.opacity = '0';
        logoSection.style.transform = 'translateX(-10px)';
        logoSection.style.width = '0';
        
        // Mostrar apenas o botão hambúrguer centralizado
        sidebarToggle.style.display = 'flex';
        sidebarToggle.style.justifyContent = 'center';
        sidebarToggle.style.alignItems = 'center';
        sidebarToggle.style.width = '100%';
        sidebarToggle.style.marginRight = '0';
    } else {
        // Sidebar expandida: mostrar logo e texto
        logoSection.style.opacity = '1';
        logoSection.style.transform = 'translateX(0)';
        logoSection.style.width = 'auto';
        
        // Restaurar comportamento normal do botão hambúrguer
        sidebarToggle.style.width = '32px';
        sidebarToggle.style.justifyContent = 'center';
        sidebarToggle.style.alignItems = 'center';
        sidebarToggle.style.marginRight = '0';
    }
}

/**
 * Alterna o menu móvel (aberto/fechado)
 */
function toggleMobileMenu() {
    if (sidebar && mobileOverlay) {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('active');
        
        // Prevenir scroll da página quando menu mobile estiver aberto
        if (sidebar.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Fecha o menu móvel ao clicar em um link
 */
function closeMobileMenuOnLinkClick() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                toggleMobileMenu();
                // Restaurar scroll da página
                document.body.style.overflow = '';
            }
        });
    });
}

/**
 * Restaura o estado da sidebar ao carregar a página
 */
function restoreSidebarState() {
    try {
        const sidebarKey = window.UniCheckConfig?.STORAGE_KEYS?.SIDEBAR_COLLAPSED || 'sidebarCollapsed';
        const savedState = localStorage.getItem(sidebarKey);
        if (savedState === 'true' && sidebar && mainContent) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
            
            // Atualizar visibilidade da logo após restaurar estado
            updateLogoVisibility();
        }
    } catch (error) {
        console.warn('Erro ao restaurar estado da sidebar:', error);
    }
}

/**
 * Atualiza os ícones quando a sidebar é recolhida/expandida
 */
function updateIconsOnSidebarToggle() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            // Pequeno delay para garantir que a transição CSS aconteceu
            setTimeout(() => {
                initializeIcons();
            }, 300);
        });
    }
}

/**
 * Adiciona funcionalidade de active state aos itens do menu
 */
function setupMenuActiveState() {
    // Detectar a página atual e definir o item ativo correto
    setActiveMenuItemBasedOnCurrentPage();
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Não prevenir navegação - permitir que os links funcionem normalmente
            // e.preventDefault(); - REMOVIDO
            
            // Remover active de todos os itens
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            
            // Adicionar active ao item clicado
            this.parentElement.classList.add('active');
            
            // Adicionar feedback visual imediato
            const clickedItem = this.parentElement;
            clickedItem.style.transform = 'scale(0.98)';
            setTimeout(() => {
                clickedItem.style.transform = 'scale(1)';
            }, 150);
            
            // Se estiver no mobile, fechar o menu após selecionar
            if (window.innerWidth <= 1024) {
                setTimeout(() => {
                    toggleMobileMenu();
                    document.body.style.overflow = '';
                }, 300);
            }
        });
    });
}

function getStoredProfile() {
    try {
        const key = window.UniCheckConfig?.STORAGE_KEYS?.USER_PROFILE || 'userProfile';
        const rawProfile = localStorage.getItem(key);
        return rawProfile ? JSON.parse(rawProfile) : null;
    } catch (error) {
        console.warn('Erro ao ler perfil armazenado:', error);
        return null;
    }
}

function getChecklistProgressKey(userId) {
    return `unicheck_checklist_progress_v2:${userId || 'anonymous'}`;
}

function getStoredChecklistProgress(userId) {
    if (!userId) return {};

    try {
        const raw = localStorage.getItem(getChecklistProgressKey(userId));
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.warn('Erro ao ler progresso dos checklists do dashboard:', error);
        return {};
    }
}

function getDashboardChecklistSummary(progressMap = {}) {
    const checklists = window.UniCheckChecklistData?.getChecklists?.() || [];
    const phases = checklists.map(checklist => {
        const tasks = Array.isArray(checklist.items) ? checklist.items : (checklist.tasks || []);
        const storedTasks = progressMap[checklist.id]?.tasks || {};
        const completedTasks = tasks.filter(task => storedTasks[task.id] === true).length;

        return {
            ...checklist,
            tasks,
            completedTasks,
            completed: tasks.length > 0 && completedTasks === tasks.length
        };
    });
    const totalTasks = phases.reduce((total, phase) => total + phase.tasks.length, 0);
    const completedTasks = phases.reduce((total, phase) => total + phase.completedTasks, 0);
    const completedPhases = phases.filter(phase => phase.completed).length;
    const currentPhase = phases.find(phase => !phase.completed) || null;
    const nextTask = currentPhase?.tasks.find(task => progressMap[currentPhase.id]?.tasks?.[task.id] !== true) || null;

    return {
        phases,
        totalTasks,
        completedTasks,
        completedPhases,
        currentPhase,
        nextTask,
        percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
}

async function updateDashboardMetrics(syncRemote = false) {
    const dashboardSurface = document.getElementById('academicProgressBar')
        || document.getElementById('journeyTimeline');

    if (!dashboardSurface) return;

    try {
        const session = await window.UniCheckAuth?.getSession?.();
        const sessionUserId = session?.user?.id || null;
        if (sessionUserId) {
            renderDashboardForUser(sessionUserId);
            if (syncRemote === true) {
                void reconcileDashboardRemote(sessionUserId);
            }
        }
    } catch (error) {
        console.warn('Erro ao atualizar métricas do dashboard:', error);
    }
}

async function reconcileDashboardRemote(userId) {
    const progressRequest = syncAndFetchDashboardProgress(userId);
    const activityRequest = window.UniCheckActivity?.restore?.(userId);
    const [progressResult, activityResult] = await Promise.allSettled([
        progressRequest || Promise.resolve(null),
        activityRequest || Promise.resolve(null)
    ]);

    if (progressResult.status === 'fulfilled' && progressResult.value) {
        const localProgress = window.UniCheckChecklist.readCachedProgress(userId);
        const pendingProgress = window.UniCheckChecklist.readPendingProgress(userId);
        const reconciled = window.UniCheckChecklist.reconcileProgressMaps(
            progressResult.value,
            localProgress,
            pendingProgress
        );
        window.UniCheckChecklist.writeCachedProgress(userId, reconciled);
    } else if (progressResult.status === 'rejected') {
        console.error('[UniCheckDashboard] Progresso remoto indisponivel; cache local preservado', {
            message: progressResult.reason?.message || String(progressResult.reason),
            userId
        });
    }

    if (activityResult.status === 'rejected') {
        console.error('[UniCheckDashboard] Atividades remotas indisponiveis; cache local preservado', {
            message: activityResult.reason?.message || String(activityResult.reason),
            userId
        });
    }

    renderDashboardForUser(userId);
}

async function syncAndFetchDashboardProgress(userId) {
    try {
        await window.UniCheckChecklist?.flushPendingProgress?.(userId);
    } catch (error) {
        console.error('[UniCheckDashboard] Fila de progresso continua pendente; reconciliando sem apagar o cache', {
            message: error?.message || String(error),
            userId
        });
    }
    return window.UniCheckChecklist?.fetchUserProgressMap?.(userId) || null;
}

function renderAcademicProgress(summary) {
    const phasesEl = document.getElementById('academicProgressPhases');
    const percentEl = document.getElementById('academicProgressPercent');
    const barEl = document.getElementById('academicProgressBar');
    const fillEl = document.getElementById('academicProgressFill');
    const currentEl = document.getElementById('academicCurrentPhase');
    const nextTaskEl = document.getElementById('academicNextTask');
    const continueButton = document.getElementById('academicContinueButton');
    const totalPhases = summary.phases.length;

    if (phasesEl) phasesEl.textContent = `${summary.completedPhases} de ${totalPhases} fases concluídas`;
    if (percentEl) percentEl.textContent = `${summary.percentage}%`;
    if (fillEl) fillEl.style.width = `${summary.percentage}%`;
    if (barEl) barEl.setAttribute('aria-valuenow', String(summary.percentage));

    if (!summary.currentPhase) {
        if (currentEl) currentEl.textContent = 'Jornada acadêmica concluída';
        if (nextTaskEl) nextTaskEl.textContent = 'Revise suas fases sempre que precisar.';
        if (continueButton) {
            continueButton.href = 'CHECKLIST ACADEMICO/checklist-academico.html';
            continueButton.querySelector('span').textContent = 'Revisar checklists';
        }
        return;
    }

    if (currentEl) currentEl.textContent = summary.currentPhase.title;
    if (nextTaskEl) nextTaskEl.textContent = summary.nextTask?.title || summary.nextTask?.text || 'Continue de onde parou.';
    if (continueButton) {
        continueButton.href = `CHECKLIST ACADEMICO/checklist-academico.html#checklist=${encodeURIComponent(summary.currentPhase.id)}`;
        continueButton.querySelector('span').textContent = 'Continuar';
    }
}

function renderDashboardForUser(userId) {
    const progress = getStoredChecklistProgress(userId);
    const summary = getDashboardChecklistSummary(progress);

    renderAcademicProgress(summary);
    window.UniCheckProgressionProfile?.renderFromCounts?.(summary);
    renderJourneyTimeline(summary);
}

function escapeDashboardHtml(value) {
    const element = document.createElement('span');
    element.textContent = String(value || '');
    return element.innerHTML;
}

function renderJourneyTimeline(summary) {
    const timeline = document.getElementById('journeyTimeline');
    if (!timeline) return;

    const currentIndex = summary.phases.findIndex(phase => !phase.completed);
    timeline.innerHTML = summary.phases.map((phase, index) => {
        let state = 'locked';
        let stateLabel = 'Bloqueada';
        let detail = 'Conclua a fase anterior';
        let icon = 'lock-keyhole';

        if (phase.completed && (currentIndex === -1 || index < currentIndex)) {
            state = 'completed';
            stateLabel = 'Concluída';
            detail = `${phase.tasks.length} de ${phase.tasks.length} itens`;
            icon = 'check';
        } else if (index === currentIndex && phase.completedTasks > 0) {
            state = 'current';
            stateLabel = 'Em andamento';
            detail = `${phase.completedTasks} de ${phase.tasks.length} itens`;
            icon = 'circle-dot';
        } else if (index === currentIndex) {
            state = 'next';
            stateLabel = 'Próxima';
            detail = 'Não iniciada';
            icon = 'circle';
        }

        const title = escapeDashboardHtml(phase.title);
        const accessibleLabel = escapeDashboardHtml(`Fase ${index + 1}: ${phase.title}. ${stateLabel}. ${detail}.`);
        const content = `
            <span class="journey-phase-marker" aria-hidden="true"><i data-lucide="${icon}"></i></span>
            <span class="journey-phase-number">Fase ${index + 1}</span>
            <strong>${title}</strong>
            <span class="journey-phase-state">${stateLabel}</span>
            <small>${detail}</small>`;

        if (state === 'locked') {
            return `<li class="journey-phase journey-phase--locked"><div class="journey-phase-content" aria-label="${accessibleLabel}" aria-disabled="true">${content}</div></li>`;
        }

        const href = `CHECKLIST ACADEMICO/checklist-academico.html#checklist=${encodeURIComponent(phase.id)}`;
        return `<li class="journey-phase journey-phase--${state}"><a class="journey-phase-content" href="${href}" aria-label="${accessibleLabel}">${content}</a></li>`;
    }).join('');
    initializeIcons();
}

/**
 * Define o item ativo do menu baseado na página atual
 */
function setActiveMenuItemBasedOnCurrentPage() {
    // Obter o caminho atual da página
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Remover classe active de todos os itens primeiro
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Detectar qual página estamos
    let activeLink = null;
    
    // Verificar se estamos na página de checklist acadêmico
    if (currentPath.includes('CHECKLIST ACADEMICO') || currentPath.includes('checklist-academico')) {
        activeLink = document.querySelector('.nav-link[href*="checklist-academico"]');
    } 
    // Verificar se estamos na página de checklist de plataformas
    else if (currentPath.includes('plataformas-gratuitas')) {
        activeLink = document.querySelector('.nav-link[href*="plataformas-gratuitas"]');
    }
    // Verificar se estamos na página de configurações
    else if (currentPath.includes('CONFIGURACOES') || currentPath.includes('configuracoes')) {
        // Não marcar nenhum item do menu principal como ativo
        return;
    }
    // Página inicial ou qualquer outra página
    else {
        // Procurar o link "Início" (que tem o ícone home)
        const homeLinks = document.querySelectorAll('.nav-link');
        for (const link of homeLinks) {
            const homeIcon = link.querySelector('i[data-lucide="home"]');
            if (homeIcon) {
                activeLink = link;
                break;
            }
        }
    }
    
    // Aplicar classe active ao item correto
    if (activeLink && activeLink.parentElement) {
        activeLink.parentElement.classList.add('active');
        console.log('✅ Item de menu ativo definido:', activeLink.querySelector('span')?.textContent);
    }
}

// ==========================
// MENU DROPDOWN DO USUÁRIO CORRIGIDO
// ==========================

// Elementos do dropdown do usuário
const userMenuTrigger = document.getElementById('userMenuTrigger');
const userDropdown = document.getElementById('userDropdown');

/**
 * Alterna a visibilidade do dropdown do usuário com correção de posicionamento
 */
function toggleUserDropdown() {
    if (userDropdown) {
        userDropdown.classList.toggle('active');
        
        // Rotacionar seta indicadora
        const dropdownIndicator = userMenuTrigger?.querySelector('.dropdown-indicator');
        if (dropdownIndicator) {
            if (userDropdown.classList.contains('active')) {
                dropdownIndicator.style.transform = 'rotate(180deg)';
            } else {
                dropdownIndicator.style.transform = 'rotate(0deg)';
            }
        }
        
        // Ajustar posição do dropdown se necessário
        if (userDropdown.classList.contains('active')) {
            adjustDropdownPosition();
        }
    }
}

/**
 * Ajusta a posição do dropdown para evitar cortes na tela
 */
function adjustDropdownPosition() {
    if (!userDropdown) return;
    
    const dropdownRect = userDropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Se o dropdown está sendo cortado na parte inferior
    if (dropdownRect.bottom > viewportHeight - 20) {
        userDropdown.style.top = 'auto';
        userDropdown.style.bottom = '100%';
        userDropdown.style.transform = 'translateY(10px)';
    }
    
    // Se o dropdown está sendo cortado na lateral direita
    if (dropdownRect.right > viewportWidth - 20) {
        userDropdown.style.left = 'auto';
        userDropdown.style.right = '0';
    }
    
    // Aplicar transição suave
    if (userDropdown.classList.contains('active')) {
        requestAnimationFrame(() => {
            userDropdown.style.transform = 'translateY(0)';
        });
    }
}

/**
 * Fecha o dropdown do usuário ao clicar fora dele
 */
function closeUserDropdownOnClickOutside() {
    document.addEventListener('click', function(e) {
        if (userMenuTrigger && userDropdown && !userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
            userMenuTrigger.setAttribute('aria-expanded', 'false');
            
            // Resetar rotação da seta
            const dropdownIndicator = userMenuTrigger.querySelector('.dropdown-indicator');
            if (dropdownIndicator) {
                dropdownIndicator.style.transform = 'rotate(0deg)';
            }
            
            // Resetar posição
            userDropdown.style.top = '';
            userDropdown.style.bottom = '';
            userDropdown.style.left = '';
            userDropdown.style.right = '';
            userDropdown.style.transform = '';
        }
    });
}

/**
 * Fecha o dropdown do usuário ao pressionar ESC
 */
function closeUserDropdownOnEscape() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && userDropdown) {
            userDropdown.classList.remove('active');
            userMenuTrigger?.setAttribute('aria-expanded', 'false');
            
            // Resetar rotação da seta
            if (userMenuTrigger) {
                const dropdownIndicator = userMenuTrigger.querySelector('.dropdown-indicator');
                if (dropdownIndicator) {
                    dropdownIndicator.style.transform = 'rotate(0deg)';
                }
            }
            
            // Resetar posição
            userDropdown.style.top = '';
            userDropdown.style.bottom = '';
            userDropdown.style.left = '';
            userDropdown.style.right = '';
            userDropdown.style.transform = '';
        }
    });
}

// ==========================
// MELHORIAS NO BOTÃO HAMBURGUER
// ==========================

/**
 * Melhora a acessibilidade e usabilidade do botão hambúrguer
 */
function improveHamburgerButton() {
    if (sidebarToggle) {
        // Adicionar eventos de teclado para acessibilidade
        sidebarToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSidebar();
            }
        });
        
        // Melhorar feedback visual
        sidebarToggle.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px) scale(1.05)';
        });
        
        sidebarToggle.addEventListener('mouseleave', function() {
            if (!sidebar.classList.contains('collapsed')) {
                this.style.transform = '';
            }
        });
    }
}

// ==========================
// RESPONSIVIDADE MELHORADA
// ==========================

/**
 * Gerencia as mudanças de responsividade
 */
function handleResponsiveChanges() {
    // Ajustar dropdown quando a janela for redimensionada
    window.addEventListener('resize', function() {
        // Fechar menu mobile se redimensionar para desktop
        if (window.innerWidth > 1024) {
            if (sidebar) sidebar.classList.remove('open');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Ajustar dropdown do usuário
        if (userDropdown && userDropdown.classList.contains('active')) {
            setTimeout(adjustDropdownPosition, 100);
        }
        
        // Forçar re-renderização dos ícones
        setTimeout(initializeIcons, 100);
    });
}

// ==========================
// ANIMAÇÕES SUAVES
// ==========================

/**
 * Adiciona animações suaves aos elementos interativos
 */
function addSmoothAnimations() {
    // Animação dos cards
    const cards = document.querySelectorAll('.content-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Animação dos itens de atividade
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Animação suave para hover dos botões
    const buttons = document.querySelectorAll('button, .nav-link, .card-action');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ==========================
// PERFORMANCE E OTIMIZAÇÃO
// ==========================

/**
 * Otimiza a performance das animações e transições
 */
function optimizePerformance() {
    // Usar requestAnimationFrame para animações suaves
    function smoothAnimate(callback) {
        if (window.requestAnimationFrame) {
            requestAnimationFrame(callback);
        } else {
            setTimeout(callback, 16);
        }
    }
    
    // Otimizar redimensionamento
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            smoothAnimate(() => {
                initializeIcons();
                if (userDropdown && userDropdown.classList.contains('active')) {
                    adjustDropdownPosition();
                }
            });
        }, 150);
    });
    
    // Prevenir layout shift durante carregamento
    if (window.requestAnimationFrame) {
        requestAnimationFrame(() => {
            document.body.classList.add('dashboard-loaded');
        });
    }
}

// ==========================
// TRATAMENTO DE ERROS
// ==========================

/**
 * Trata erros de forma elegante
 */
function setupErrorHandling() {
    window.addEventListener('error', function(e) {
        console.warn('Erro capturado:', e.error);
        // Não interromper a experiência do usuário por erros não críticos
    });
    
    // Tratamento para promises rejeitadas
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Promise rejeitada:', e.reason);
        e.preventDefault();
    });
}

// ==========================
// ACESSIBILIDADE MELHORADA
// ==========================

/**
 * Melhora a acessibilidade da interface
 */
function improveAccessibility() {
    // Adicionar indicadores visuais para navegação por teclado
    const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--unisales-blue)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
    
    // Adicionar suporte para leitores de tela
    const hamburgerButton = document.getElementById('sidebarToggle');
    if (hamburgerButton) {
        hamburgerButton.setAttribute('aria-label', 'Alternar menu lateral');
        hamburgerButton.setAttribute('aria-expanded', 'false');
        
        // Atualizar atributo aria-expanded quando o menu for alternado
        const originalToggleSidebar = toggleSidebar;
        toggleSidebar = function() {
            originalToggleSidebar();
            const isExpanded = !sidebar.classList.contains('collapsed');
            hamburgerButton.setAttribute('aria-expanded', isExpanded.toString());
        };
    }
    
    // Melhorar semântica do dropdown do usuário
    if (userMenuTrigger) {
        userMenuTrigger.setAttribute('aria-haspopup', 'true');
        userMenuTrigger.setAttribute('aria-expanded', 'false');
        
        const originalToggleUserDropdown = toggleUserDropdown;
        toggleUserDropdown = function() {
            originalToggleUserDropdown();
            const isExpanded = userDropdown.classList.contains('active');
            userMenuTrigger.setAttribute('aria-expanded', isExpanded.toString());
        };
    }
}

// ==========================
// INICIALIZAÇÃO PRINCIPAL
// ==========================

/**
 * Inicializa todas as funcionalidades do dashboard
 */
function initializeDashboard() {
    try {
        console.log('🚀 Inicializando Dashboard UniCheck...');
        window.UniCheckNotifications?.init?.();
        
        // Inicializar tema
        initializeTheme();
        
        // Restaurar estado da sidebar
        restoreSidebarState();
        
        // Inicializar visibilidade da logo
        updateLogoVisibility();
        
        // Configurar eventos da sidebar (com verificação de segurança)
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', toggleSidebar);
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }
        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', toggleMobileMenu);
        }
        
        // Configurar funcionalidades do menu
        closeMobileMenuOnLinkClick();
        updateIconsOnSidebarToggle();
        setupMenuActiveState();
        
        // Configurar dropdown do usuário
        if (userMenuTrigger) {
            userMenuTrigger.addEventListener('click', toggleUserDropdown);
        }
        closeUserDropdownOnClickOutside();
        closeUserDropdownOnEscape();
        
        // Melhorar botão hambúrguer
        improveHamburgerButton();
        
        // Adicionar animações suaves
        addSmoothAnimations();
        
        // Configurar responsividade
        handleResponsiveChanges();
        
        // Otimizar performance
        optimizePerformance();
        
        // Configurar tratamento de erros
        setupErrorHandling();
        
        // Melhorar acessibilidade
        improveAccessibility();
        
        // Sincronizar dados do perfil
        if (window.ProfileManager && typeof window.ProfileManager.sync === 'function') {
            window.ProfileManager.sync();
        }
        if (window.ProfileManager && typeof window.ProfileManager.bindAutoSync === 'function') {
            window.ProfileManager.bindAutoSync();
        }

        updateDashboardMetrics(true);
        window.addEventListener('focus', () => updateDashboardMetrics(false));
        window.addEventListener('storage', () => updateDashboardMetrics(false));
        window.addEventListener('unicheck:activity', () => updateDashboardMetrics(false));
        
        // Configurar redimensionamento da janela
        window.addEventListener('resize', function() {
            try {
                // Fechar menu móvel se a tela for redimensionada para desktop
                if (window.innerWidth > 1024) {
                    if (sidebar) sidebar.classList.remove('open');
                    if (mobileOverlay) mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Forçar re-renderização dos ícones
                setTimeout(initializeIcons, 100);
            } catch (error) {
                console.warn('Erro no redimensionamento:', error);
            }
        });
        
        // Emitir evento de inicialização completa
        document.dispatchEvent(new CustomEvent('dashboardInitialized'));
        
        console.log('✅ Dashboard UniCheck inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na inicialização do dashboard:', error);
    }
}

// ==========================
// INICIALIZAÇÃO SEGURA DOS ÍCONES
// ==========================

/**
 * Aguarda o carregamento da biblioteca Lucide e inicializa os ícones
 */
function initializeLucideIcons() {
    // Se o Lucide já estiver disponível
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        initializeIcons();
        return;
    }
    
    // Se não, aguardar o carregamento
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    const checkLucide = () => {
        attempts++;
        
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            initializeIcons();
        } else if (attempts < maxAttempts) {
            setTimeout(checkLucide, 100);
        } else {
            console.warn('Biblioteca Lucide não foi carregada após 5 segundos');
        }
    };
    
    // Iniciar verificação
    setTimeout(checkLucide, 100);
}

// ==========================
// INICIALIZAÇÃO AUTOMÁTICA
// ==========================

// Aguardar o carregamento completo antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLucideIcons);
} else {
    initializeLucideIcons();
}

// Inicializar o dashboard quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeDashboard);

// ==========================
// UTILITÁRIOS GLOBAIS
// ==========================

// Função para recarregar ícones (útil para desenvolvedores)
window.reloadIcons = function() {
    initializeIcons();
    console.log('🔄 Ícones recarregados');
};

// Função para alternar tema rapidamente (útil para desenvolvedores)
window.toggleTheme = function() {
    toggleTheme();
    console.log('🌙 Tema alternado');
};

// Função para debug da sidebar (útil para desenvolvedores)
window.debugSidebar = function() {
    console.log('Sidebar State:', {
        isCollapsed: sidebar?.classList.contains('collapsed'),
        isOpen: sidebar?.classList.contains('open'),
        width: sidebar?.style.width,
        mainContentMargin: mainContent?.style.marginLeft
    });
};

// ========================================
// SINCRONIZAÇÃO DE PERFIL
// ========================================

/**
 * Carrega e sincroniza os dados do perfil com a interface
 */
// ==========================
// FUNCIONALIDADE DE LOGOUT
// ==========================

/**
 * Função para fazer logout e retornar à landing page
 */
async function handleLogout() {
    if (window.UniCheckAuth && typeof window.UniCheckAuth.logout === 'function') {
        try {
            await window.UniCheckAuth.logout();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            alert(window.UniCheckAuth.normalizeErrorMessage(error));
        }
        return;
    }
    // Limpar dados do usuário (opcional)
    // localStorage.removeItem('userProfile');
    // sessionStorage.clear();
    
    // Redirecionar para a landing page
    const normalizePath = window.UniCheckConfig?.normalizePath || (value => value);
    const normalizedPath = normalizePath(window.location.pathname);
    const platformIndex = normalizedPath.toLowerCase().lastIndexOf('/platform/');
    const fallbackLanding = window.UniCheckConfig?.ROUTES?.LANDING || '../landing/index.html';
    window.location.href = platformIndex !== -1
        ? `${normalizedPath.slice(0, platformIndex)}/landing/index.html`
        : fallbackLanding;
}

// Adicionar evento de clique ao botão de logout
document.addEventListener('DOMContentLoaded', function() {
    if (window.UniCheckAuth && typeof window.UniCheckAuth.requireAuth === 'function') {
        window.UniCheckAuth.requireAuth().catch(function(error) {
            console.error('Erro ao validar sessao:', error);
        });
    }

    const logoutButtons = document.querySelectorAll('.logout-action, .logout-btn');
    logoutButtons.forEach(logoutBtn => {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Confirmação opcional
            if (confirm('Deseja realmente sair da plataforma?')) {
                handleLogout();
            }
        });
    });
});

// Exportar funções principais (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDashboard,
        initializeIcons,
        toggleTheme,
        toggleSidebar,
        toggleUserDropdown,
        handleLogout
    };
}
