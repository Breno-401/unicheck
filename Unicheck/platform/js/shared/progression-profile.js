(function () {
    "use strict";

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
                    <span data-progression-xp>0 XP</span>
                    <small data-progression-next>Carregando progresso...</small>
                </div>
            </div>
        `;
        profile.appendChild(surface);
        return surface;
    }

    function render(progression) {
        if (!progression) return;
        const surface = ensureSurface();
        if (!surface) return;
        const nextThreshold = progression.nextLevel?.minXp;
        surface.querySelector("[data-progression-level]").textContent =
            `${progression.currentLevel.name} · Nível ${progression.currentLevel.level}`;
        surface.querySelector("[data-progression-indicator]").textContent = progression.currentLevel.level;
        surface.querySelector("[data-progression-xp]").textContent = progression.nextLevel
            ? `${progression.xp} / ${nextThreshold} XP`
            : `${progression.xp} XP`;
        const track = surface.querySelector(".sidebar-progress-track");
        track.setAttribute("aria-valuenow", String(progression.levelProgress));
        surface.querySelector("[data-progression-fill]").style.width = `${progression.levelProgress}%`;
        surface.querySelector("[data-progression-next]").textContent = progression.nextLevel
            ? `${progression.nextLevel.minXp - progression.xp} XP para ${progression.nextLevel.name}`
            : "Nível máximo alcançado";
        surface.setAttribute("aria-label", progression.nextLevel
            ? `${progression.currentLevel.name}, nível ${progression.currentLevel.level}. ${progression.xp} de ${nextThreshold} XP.`
            : `${progression.currentLevel.name}, nível ${progression.currentLevel.level}. ${progression.xp} XP.`);
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
        renderFromChecklists(event.detail?.checklists || []);
    });

    window.UniCheckProgressionProfile = {
        renderFromChecklists,
        renderFromCounts
    };
})();
