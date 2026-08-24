(function () {
    'use strict';

    let currentUserId = null;
    let currentProgression = null;

    function getProfileElement() {
        return document.querySelector('.sidebar .user-profile');
    }

    function hideCompactTooltip() {
        document.querySelector('.sidebar-level-tooltip')?.remove();
    }

    function showCompactTooltip(component) {
        if (!component.closest('.sidebar')?.classList.contains('collapsed')) return;
        hideCompactTooltip();
        const tooltip = document.createElement('div');
        tooltip.className = 'sidebar-level-tooltip';
        tooltip.setAttribute('role', 'tooltip');
        tooltip.textContent = component.dataset.tooltip || component.getAttribute('aria-label') || '';
        document.body.appendChild(tooltip);
        const rect = component.getBoundingClientRect();
        tooltip.style.left = `${Math.min(rect.right + 10, window.innerWidth - tooltip.offsetWidth - 10)}px`;
        tooltip.style.top = `${Math.max(8, rect.top + (rect.height - tooltip.offsetHeight) / 2)}px`;
    }

    function ensureComponent() {
        const profile = getProfileElement();
        if (!profile) return null;
        let component = profile.querySelector('.sidebar-profile-progression');
        if (component) return component;

        component = document.createElement('div');
        component.className = 'sidebar-profile-progression';
        component.tabIndex = 0;
        component.innerHTML = `
            <span class="sidebar-level-indicator" data-sidebar-level-indicator aria-hidden="true">1</span>
            <div class="sidebar-progress-details">
                <div class="sidebar-progress-heading">
                    <strong data-sidebar-level>Nível</strong>
                </div>
                <div class="sidebar-progress-track" role="progressbar" aria-label="Progresso para o próximo nível" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-sidebar-progress-track>
                    <span data-sidebar-progress-fill></span>
                </div>
                <div class="sidebar-progress-meta">
                    <span data-sidebar-xp>— XP</span>
                    <small data-sidebar-next-level>Calculando progresso...</small>
                </div>
            </div>
        `;
        profile.appendChild(component);
        component.addEventListener('mouseenter', () => showCompactTooltip(component));
        component.addEventListener('mouseleave', hideCompactTooltip);
        component.addEventListener('focus', () => showCompactTooltip(component));
        component.addEventListener('blur', hideCompactTooltip);
        return component;
    }

    function showLevelUp(progression) {
        document.querySelector('.level-up-feedback')?.remove();
        const feedback = document.createElement('div');
        feedback.className = 'level-up-feedback';
        feedback.setAttribute('role', 'status');
        feedback.setAttribute('aria-live', 'polite');
        feedback.innerHTML = '<i data-lucide="award" aria-hidden="true"></i><span><small>Novo nível</small><strong></strong></span>';
        feedback.querySelector('strong').textContent = progression.currentLevel.name;
        document.body.appendChild(feedback);
        window.lucide?.createIcons?.();
        window.setTimeout(() => feedback.remove(), 2600);
    }

    function renderProgression(progression, options = {}) {
        const component = ensureComponent();
        if (!component || !progression) return;
        const previousLevel = Number(options.previousLevel ?? currentProgression?.currentLevel?.level ?? progression.currentLevel.level);

        component.querySelector('[data-sidebar-level]').textContent = `${progression.currentLevel.name} · Nível ${progression.currentLevel.level}`;
        const xpElement = component.querySelector('[data-sidebar-xp]');
        xpElement.textContent = progression.nextLevel
            ? `${progression.xp} / ${progression.nextLevel.threshold} XP`
            : `${progression.xp} XP`;
        component.querySelector('[data-sidebar-level-indicator]').textContent = String(progression.currentLevel.level);
        component.querySelector('[data-sidebar-next-level]').textContent = progression.nextLevel
            ? `${progression.xpToNextLevel} XP para ${progression.nextLevel.name}`
            : 'Nível máximo atual';

        const track = component.querySelector('[data-sidebar-progress-track]');
        track.setAttribute('aria-valuenow', String(progression.percentage));
        track.setAttribute('aria-valuetext', progression.nextLevel
            ? `${progression.xpToNextLevel} XP para ${progression.nextLevel.name}`
            : `Nível máximo atual com ${progression.xp} XP`);
        component.querySelector('[data-sidebar-progress-fill]').style.width = `${progression.percentage}%`;

        const compactLabel = `${progression.currentLevel.name} · ${progression.xp} XP`;
        component.setAttribute('aria-label', compactLabel);
        component.dataset.tooltip = compactLabel;

        if (currentProgression && currentProgression.xp !== progression.xp) {
            component.classList.remove('is-xp-updating');
            void component.offsetWidth;
            component.classList.add('is-xp-updating');
            window.setTimeout(() => component.classList.remove('is-xp-updating'), 380);
        }

        currentProgression = progression;
        if (options.announceLevelChange && progression.currentLevel.level > previousLevel) {
            showLevelUp(progression);
        }
    }

    function renderFromCounts(summary, options = {}) {
        const progression = window.UniCheckProgression?.calculateProgression?.({
            completedTasks: summary?.completedTasks,
            completedPhases: summary?.completedPhases
        });
        renderProgression(progression, options);
        return progression;
    }

    function renderFromChecklists(checklists, options = {}) {
        const progression = window.UniCheckProgression?.calculateFromChecklists?.(checklists || []);
        renderProgression(progression, options);
        return progression;
    }

    function renderFromCache() {
        if (!currentUserId) return null;
        const structure = window.UniCheckChecklistData?.getChecklists?.();
        const progress = window.UniCheckChecklist?.readCachedProgress?.(currentUserId);
        if (!structure || !progress) return null;
        const checklists = window.UniCheckChecklist.applyProgress(structure, progress);
        return renderFromChecklists(checklists);
    }

    async function init() {
        ensureComponent();
        try {
            const session = await window.UniCheckAuth?.getSession?.();
            currentUserId = session?.user?.id || null;
            renderFromCache();
        } catch (error) {
            console.warn('[UniCheckProgressionProfile] Progresso local indisponível', error);
        }
    }

    window.addEventListener('storage', event => {
        if (currentUserId && event.key === `unicheck_checklist_progress_v2:${currentUserId}`) renderFromCache();
    });
    window.addEventListener('unicheck:progression-updated', event => {
        const detail = event.detail || {};
        if (detail.checklists) {
            renderFromChecklists(detail.checklists, {
                announceLevelChange: detail.announceLevelChange,
                previousLevel: detail.previousLevel
            });
        } else {
            renderFromCache();
        }
    });

    window.UniCheckProgressionProfile = Object.freeze({ init, renderFromCounts, renderFromChecklists, renderFromCache });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else void init();
})();
