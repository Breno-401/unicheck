(function () {
    "use strict";

    const XP_REWARD_DURATION_MS = 3400;
    const XP_REWARD_QUEUE_GAP_MS = 120;
    const XP_TRANSFER_DELAY_MS = 2150;
    const XP_TRANSFER_DURATION_MS = 560;
    const XP_RECEIVED_PULSE_MS = 320;
    let currentProgression = null;
    let transitionToken = 0;
    let activeXpReward = null;
    let xpRewardTimer = null;
    let xpTransferTimer = null;
    let xpParticleTimer = null;
    let xpPulseTimer = null;
    let activeXpParticle = null;
    let activeXpAnimation = null;
    const xpRewardQueue = [];

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

    function clampProgress(value) {
        return Math.max(0, Math.min(100, Number(value) || 0));
    }

    function getRewardAccent(value) {
        const accent = typeof value === "string" ? value.trim() : "";
        return accent && window.CSS?.supports?.("color", accent) ? accent : null;
    }

    function getSidebarProgressTarget() {
        if (prefersReducedMotion() || window.matchMedia?.("(max-width: 1024px)").matches) return null;

        const sidebar = document.querySelector(".sidebar");
        const target = sidebar?.querySelector(".sidebar-progress-track");
        if (!sidebar || !target || sidebar.classList.contains("collapsed")) return null;

        const sidebarStyle = window.getComputedStyle(sidebar);
        const targetStyle = window.getComputedStyle(target);
        if (
            sidebarStyle.display === "none"
            || sidebarStyle.visibility === "hidden"
            || Number(sidebarStyle.opacity) === 0
            || targetStyle.display === "none"
            || targetStyle.visibility === "hidden"
        ) return null;

        const rect = target.getBoundingClientRect();
        const hasValidRect = Number.isFinite(rect.left)
            && Number.isFinite(rect.top)
            && rect.width > 0
            && rect.height > 0
            && rect.right > 0
            && rect.bottom > 0
            && rect.left < window.innerWidth
            && rect.top < window.innerHeight;
        return hasValidRect ? target : null;
    }

    function pulseSidebarProgress(target) {
        const surface = target?.closest(".sidebar-profile-progression");
        if (!surface?.isConnected || prefersReducedMotion()) return;

        if (xpPulseTimer) window.clearTimeout(xpPulseTimer);
        surface.classList.remove("is-xp-receiving");
        void surface.offsetWidth;
        surface.classList.add("is-xp-receiving");
        xpPulseTimer = window.setTimeout(() => {
            surface.classList.remove("is-xp-receiving");
            xpPulseTimer = null;
        }, XP_RECEIVED_PULSE_MS);
    }

    function transferXpToSidebar(element) {
        if (!element?.isConnected || element !== activeXpReward || prefersReducedMotion()) return;

        const target = getSidebarProgressTarget();
        if (!target) return;

        const originRect = element.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const fillRect = target.querySelector("[data-progression-fill]")?.getBoundingClientRect();
        const originX = originRect.left + Math.min(originRect.width * .28, 92);
        const originY = originRect.top + Math.min(originRect.height * .34, 54);
        const destinationX = fillRect?.width > 0
            ? Math.min(fillRect.right, targetRect.right - 2)
            : targetRect.left + 3;
        const destinationY = targetRect.top + targetRect.height / 2;
        if (![originX, originY, destinationX, destinationY].every(Number.isFinite)) return;

        const particle = document.createElement("span");
        particle.className = "xp-energy-particle";
        particle.setAttribute("aria-hidden", "true");
        const accent = window.getComputedStyle(element).getPropertyValue("--reward-accent").trim();
        if (accent) particle.style.setProperty("--reward-accent", accent);
        document.body.appendChild(particle);
        activeXpParticle = particle;

        if (typeof particle.animate !== "function") {
            particle.remove();
            activeXpParticle = null;
            return;
        }

        const middleX = originX + (destinationX - originX) * .52;
        const middleY = Math.min(originY, destinationY) - 34;
        const animation = particle.animate([
            { opacity: 0, transform: `translate3d(${originX}px, ${originY}px, 0) scale(.45)` },
            { opacity: 1, offset: .14, transform: `translate3d(${originX}px, ${originY}px, 0) scale(1)` },
            { opacity: .92, offset: .58, transform: `translate3d(${middleX}px, ${middleY}px, 0) scale(.82)` },
            { opacity: 0, transform: `translate3d(${destinationX}px, ${destinationY}px, 0) scale(.42)` }
        ], {
            duration: XP_TRANSFER_DURATION_MS,
            easing: "cubic-bezier(.4, 0, .2, 1)",
            fill: "forwards"
        });
        activeXpAnimation = animation;

        animation.addEventListener("finish", () => {
            if (xpParticleTimer) window.clearTimeout(xpParticleTimer);
            xpParticleTimer = null;
            particle.remove();
            if (activeXpParticle === particle) activeXpParticle = null;
            if (activeXpAnimation === animation) activeXpAnimation = null;
            pulseSidebarProgress(target);
        }, { once: true });
        animation.addEventListener("cancel", () => {
            particle.remove();
            if (activeXpParticle === particle) activeXpParticle = null;
            if (activeXpAnimation === animation) activeXpAnimation = null;
        }, { once: true });
        xpParticleTimer = window.setTimeout(() => {
            xpParticleTimer = null;
            if (activeXpAnimation === animation) activeXpAnimation = null;
            animation.cancel();
            particle.remove();
            if (activeXpParticle === particle) activeXpParticle = null;
            pulseSidebarProgress(target);
        }, XP_TRANSFER_DURATION_MS);
    }

    function ensureXpRewardRegion() {
        let region = document.querySelector("body > .xp-reward-region");
        if (region) return region;

        region = document.createElement("div");
        region.className = "xp-reward-region";
        document.body.appendChild(region);
        return region;
    }

    function showNextXpReward() {
        if (activeXpReward || !xpRewardQueue.length) return;

        const reward = xpRewardQueue.shift();
        const progression = reward.progression;
        const levelXp = Math.round(getLevelXp(progression));
        const levelXpMax = getLevelXpMax(progression);
        const progress = clampProgress(progression.levelProgress);
        const sameLevel = reward.previousProgression?.currentLevel?.level === progression.currentLevel.level;
        const previousProgress = sameLevel
            ? clampProgress(reward.previousProgression.levelProgress)
            : progress;
        const remainingXp = progression.nextLevel
            ? Math.max(0, progression.nextLevel.minXp - progression.xp)
            : null;
        const destination = progression.nextLevel
            ? `${remainingXp} XP para ${progression.nextLevel.name}`
            : "Nível máximo alcançado";
        const progressValue = levelXpMax
            ? `${levelXp} / ${levelXpMax} XP`
            : `${progression.xp} XP total`;
        const accessibleMessage = progression.nextLevel
            ? `${reward.label}. Você ganhou ${reward.gainedXp} XP. ${levelXp} de ${levelXpMax} XP. Faltam ${remainingXp} XP para o nível ${progression.nextLevel.name}.`
            : `${reward.label}. Você ganhou ${reward.gainedXp} XP. ${progression.xp} XP no total. Nível máximo alcançado.`;
        const region = ensureXpRewardRegion();
        const element = document.createElement("div");
        element.className = `xp-reward${reward.phaseCompleted ? " xp-reward--phase" : ""}`;
        const rewardAccent = getRewardAccent(reward.accent);
        if (rewardAccent) element.style.setProperty("--reward-accent", rewardAccent);
        element.setAttribute("role", "status");
        element.setAttribute("aria-live", "polite");
        element.setAttribute("aria-atomic", "true");
        element.setAttribute("aria-label", accessibleMessage);
        element.innerHTML = `
            <div class="xp-reward-heading">
                <span class="xp-reward-symbol" aria-hidden="true">✦</span>
                <span class="xp-reward-copy">
                    <strong class="xp-reward-amount">+${reward.gainedXp} <span>XP</span></strong>
                    <span class="xp-reward-label">${escapeHtml(reward.label)}</span>
                </span>
            </div>
            <div class="xp-reward-progress" aria-hidden="true">
                <strong class="xp-reward-progress-value">${escapeHtml(progressValue)}</strong>
                <span class="xp-reward-track"><span data-xp-reward-fill data-progress-from="${previousProgress}" data-progress-to="${progress}" style="width: ${previousProgress}%"></span></span>
                <span class="xp-reward-destination">${escapeHtml(destination)}</span>
            </div>
        `;
        region.appendChild(element);
        activeXpReward = element;

        const fill = element.querySelector("[data-xp-reward-fill]");
        if (fill) {
            void fill.offsetWidth;
            fill.style.width = `${progress}%`;
        }

        xpTransferTimer = window.setTimeout(() => {
            xpTransferTimer = null;
            transferXpToSidebar(element);
        }, XP_TRANSFER_DELAY_MS);

        xpRewardTimer = window.setTimeout(() => {
            element.remove();
            activeXpReward = null;
            xpRewardTimer = null;
            if (xpRewardQueue.length) {
                window.setTimeout(showNextXpReward, XP_REWARD_QUEUE_GAP_MS);
            } else {
                region.remove();
            }
        }, XP_REWARD_DURATION_MS);
    }

    function enqueueXpReward(previousProgression, progression, detail = {}) {
        const gainedXp = Number(detail.gainedXp) || 0;
        if (!progression?.currentLevel || gainedXp <= 0) return;

        xpRewardQueue.push({
            previousProgression,
            progression,
            gainedXp,
            label: detail.phaseCompleted ? "Fase concluída" : "Etapa concluída",
            phaseCompleted: detail.phaseCompleted === true,
            accent: detail.phaseAccent
        });
        showNextXpReward();
    }

    function clearXpRewards() {
        xpRewardQueue.length = 0;
        if (xpRewardTimer) window.clearTimeout(xpRewardTimer);
        if (xpTransferTimer) window.clearTimeout(xpTransferTimer);
        if (xpParticleTimer) window.clearTimeout(xpParticleTimer);
        if (xpPulseTimer) window.clearTimeout(xpPulseTimer);
        xpRewardTimer = null;
        xpTransferTimer = null;
        xpParticleTimer = null;
        xpPulseTimer = null;
        activeXpAnimation?.cancel();
        activeXpAnimation = null;
        activeXpParticle?.remove();
        activeXpParticle = null;
        document.querySelector(".sidebar-profile-progression.is-xp-receiving")
            ?.classList.remove("is-xp-receiving");
        activeXpReward?.remove();
        activeXpReward = null;
        document.querySelector("body > .xp-reward-region")?.remove();
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
            const ratio = Math.max(0, Math.min((now - startedAt) / duration, 1));
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
        const levelChanged = Boolean(
            previous?.currentLevel?.level < progression?.currentLevel?.level
        );
        if (levelChanged) {
            clearXpRewards();
        } else {
            enqueueXpReward(previous, progression, event.detail || {});
        }
        animateTransition(previous, progression, event.detail || {});
    });

    window.UniCheckProgressionProfile = {
        renderFromChecklists,
        renderFromCounts
    };
})();
