(function () {
    "use strict";

    let currentProgression = null;
    let transitionToken = 0;

    function prefersReducedMotion() {
        return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function ensureSurface() {
        const profile = document.querySelector(".sidebar .user-profile");
        if (!profile) return null;
        let surface = profile.querySelector(".sidebar-profile-progression");
        if (surface) return surface;

        surface = document.createElement("div");
        surface.className = "sidebar-profile-progression";
        surface.tabIndex = 0;
        surface.innerHTML = `
            <span class="sidebar-level-indicator" data-progression-indicator aria-hidden="true">1</span>
            <div class="sidebar-progress-details">
                <div class="sidebar-progress-heading">
                    <strong data-progression-level>Calouro · Nível 1</strong>
                </div>
                <div class="sidebar-progress-track" role="progressbar" aria-label="Progresso para o próximo nível" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <span data-progression-fill></span>
                </div>
                <div class="sidebar-progress-meta">
                    <span data-progression-xp>0 / 100 XP</span>
                    <small data-progression-next>Carregando progresso...</small>
                </div>
            </div>
        `;
        profile.appendChild(surface);
        return surface;
    }

    function getLevelXp(progression) {
        if (Number.isFinite(progression?.levelXp)) return progression.levelXp;
        return Math.max(0, (progression?.xp || 0) - (progression?.currentLevel?.minXp || 0));
    }

    function getLevelXpMax(progression) {
        if (Number.isFinite(progression?.levelXpMax)) return progression.levelXpMax;
        if (!progression?.nextLevel) return null;
        return progression.nextLevel.minXp - progression.currentLevel.minXp;
    }

    function updateSurface(progression, options = {}) {
        if (!progression?.currentLevel) return null;
        const surface = ensureSurface();
        if (!surface) return null;
        const displayedLevelXp = Number.isFinite(options.levelXp) ? options.levelXp : getLevelXp(progression);
        const levelXpMax = getLevelXpMax(progression);
        const displayedProgress = Number.isFinite(options.levelProgress)
            ? options.levelProgress
            : progression.levelProgress;

        surface.querySelector("[data-progression-level]").textContent =
            `${progression.currentLevel.name} · Nível ${progression.currentLevel.level}`;
        surface.querySelector("[data-progression-indicator]").textContent = progression.currentLevel.level;
        surface.querySelector("[data-progression-xp]").textContent = levelXpMax
            ? `${Math.round(displayedLevelXp)} / ${levelXpMax} XP`
            : `${progression.xp} XP total`;
        const track = surface.querySelector(".sidebar-progress-track");
        track.setAttribute("aria-valuenow", String(Math.round(displayedProgress)));
        const fill = surface.querySelector("[data-progression-fill]");
        if (options.instant) fill.style.transition = "none";
        fill.style.width = `${Math.max(0, Math.min(100, displayedProgress))}%`;
        if (options.instant) {
            void fill.offsetWidth;
            fill.style.removeProperty("transition");
        }
        surface.querySelector("[data-progression-next]").textContent = progression.nextLevel
            ? `${Math.max(0, progression.nextLevel.minXp - progression.xp)} XP para ${progression.nextLevel.name}`
            : "Nível máximo alcançado";
        surface.setAttribute("aria-label", progression.nextLevel
            ? `${progression.currentLevel.name}, nível ${progression.currentLevel.level}. ${Math.round(displayedLevelXp)} de ${levelXpMax} XP neste nível.`
            : `${progression.currentLevel.name}, nível ${progression.currentLevel.level}. ${progression.xp} XP no total.`);
        return surface;
    }

    function animateXpValue(surface, progression, from, to, duration, token) {
        if (!surface || prefersReducedMotion() || from === to) {
            updateSurface(progression, { levelXp: to });
            return;
        }
        const startedAt = performance.now();
        const tick = now => {
            if (token !== transitionToken) return;
            const ratio = Math.min((now - startedAt) / duration, 1);
            const eased = 1 - Math.pow(1 - ratio, 3);
            const value = Math.round(from + (to - from) * eased);
            const label = surface.querySelector("[data-progression-xp]");
            const maximum = getLevelXpMax(progression);
            if (label) label.textContent = maximum ? `${value} / ${maximum} XP` : `${progression.xp} XP total`;
            if (ratio < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
    }

    function showLevelUp(progression, detail = {}) {
        document.querySelector(".level-up-celebration")?.remove();
        const celebration = document.createElement("div");
        celebration.className = "level-up-celebration";
        celebration.setAttribute("role", "status");
        celebration.setAttribute("aria-live", "polite");
        const particles = Array.from({ length: 10 }, (_, index) =>
            `<span class="level-up-particle" style="--particle-angle:${index * 36}deg;--particle-delay:${index * 24}ms" aria-hidden="true"></span>`
        ).join("");
        const phaseMessage = detail.phaseCompleted ? `
            <div class="level-up-phase-note">
                <i data-lucide="badge-check" aria-hidden="true"></i>
                <span><strong>Fase concluída</strong>${escapeHtml(detail.phaseTitle || "")}</span>
            </div>
            ${detail.nextPhaseTitle ? `<p>Próxima fase liberada: <strong>${escapeHtml(detail.nextPhaseTitle)}</strong></p>` : ""}
        ` : "";

        celebration.innerHTML = `
            <div class="level-up-backdrop" aria-hidden="true"></div>
            <div class="level-up-card">
                ${particles}
                <span class="level-up-symbol" aria-hidden="true"><i data-lucide="sparkles"></i></span>
                <span class="level-up-kicker">Você subiu de nível</span>
                <strong class="level-up-number">Nível ${progression.currentLevel.level}</strong>
                <span class="level-up-name">${escapeHtml(progression.currentLevel.name)}</span>
                ${detail.gainedXp ? `<span class="level-up-xp">+${detail.gainedXp} XP</span>` : ""}
                ${phaseMessage}
            </div>
        `;
        document.body.appendChild(celebration);
        window.lucide?.createIcons?.();
        window.setTimeout(() => celebration.remove(), prefersReducedMotion() ? 2200 : 2850);
    }

    function animateTransition(previous, progression, detail = {}) {
        if (!progression?.currentLevel) return;
        const token = ++transitionToken;
        const surface = ensureSurface();
        if (!surface || !previous?.currentLevel || prefersReducedMotion()) {
            updateSurface(progression, { instant: true });
            if (previous?.currentLevel?.level < progression.currentLevel.level) {
                showLevelUp(progression, detail);
            }
            currentProgression = progression;
            return;
        }

        surface.classList.add("is-xp-updating");
        window.setTimeout(() => surface.classList.remove("is-xp-updating"), 900);
        const levelChanged = previous.currentLevel.level < progression.currentLevel.level;
        if (!levelChanged) {
            updateSurface(previous, { instant: true });
            window.requestAnimationFrame(() => {
                if (token !== transitionToken) return;
                updateSurface(progression, { levelXp: getLevelXp(previous) });
                animateXpValue(surface, progression, getLevelXp(previous), getLevelXp(progression), 520, token);
            });
            currentProgression = progression;
            return;
        }

        const previousMaximum = getLevelXpMax(previous) || getLevelXp(previous);
        updateSurface(previous, { instant: true });
        window.requestAnimationFrame(() => {
            if (token !== transitionToken) return;
            updateSurface(previous, { levelProgress: 100 });
            animateXpValue(surface, previous, getLevelXp(previous), previousMaximum, 560, token);
        });

        window.setTimeout(() => {
            if (token !== transitionToken) return;
            showLevelUp(progression, detail);
            updateSurface(progression, { levelXp: 0, levelProgress: 0, instant: true });
            window.setTimeout(() => {
                if (token !== transitionToken) return;
                updateSurface(progression, { levelXp: 0 });
                animateXpValue(surface, progression, 0, getLevelXp(progression), 460, token);
            }, 140);
        }, 660);
        currentProgression = progression;
    }

    function render(progression) {
        if (!progression) return;
        if (
            currentProgression?.xp === progression.xp
            && currentProgression?.currentLevel?.level === progression.currentLevel?.level
        ) {
            currentProgression = progression;
            return;
        }
        transitionToken += 1;
        updateSurface(progression, { instant: currentProgression === null });
        currentProgression = progression;
    }

    function renderFromChecklists(checklists) {
        render(window.UniCheckProgression?.calculateFromChecklists?.(checklists));
    }

    function renderFromCounts(summary) {
        render(window.UniCheckProgression?.calculateFromCounts?.({
            completedTasks: summary?.completedTasks || 0,
            completedPhases: summary?.completedPhases || 0
        }));
    }

    window.addEventListener("unicheck:progression-updated", event => {
        const progression = event.detail?.progression
            || window.UniCheckProgression?.calculateFromChecklists?.(event.detail?.checklists || []);
        const previous = event.detail?.previousProgression || currentProgression;
        animateTransition(previous, progression, event.detail || {});
    });

    window.UniCheckProgressionProfile = {
        renderFromChecklists,
        renderFromCounts
    };
})();
