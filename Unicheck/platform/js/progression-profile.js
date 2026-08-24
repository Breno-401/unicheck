(function () {
    "use strict";

    function ensureSurface() {
        const header = document.querySelector(".user-dropdown-header");
        if (!header) return null;
        let surface = header.parentElement?.querySelector(".progression-profile");
        if (surface) return surface;

        surface = document.createElement("div");
        surface.className = "progression-profile";
        surface.innerHTML = `
            <div class="progression-profile-heading">
                <span data-progression-level>Nivel 1</span>
                <strong data-progression-xp>0 XP</strong>
            </div>
            <div class="progression-profile-track" role="progressbar" aria-label="Progresso para o proximo nivel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <span data-progression-fill></span>
            </div>
            <small data-progression-next>Comece concluindo uma tarefa</small>`;
        header.insertAdjacentElement("afterend", surface);
        return surface;
    }

    function render(progression) {
        if (!progression) return;
        const surface = ensureSurface();
        if (!surface) return;
        surface.querySelector("[data-progression-level]").textContent =
            `Nivel ${progression.currentLevel.level} · ${progression.currentLevel.name}`;
        surface.querySelector("[data-progression-xp]").textContent = `${progression.xp} XP`;
        const track = surface.querySelector(".progression-profile-track");
        track.setAttribute("aria-valuenow", String(progression.levelProgress));
        surface.querySelector("[data-progression-fill]").style.width = `${progression.levelProgress}%`;
        surface.querySelector("[data-progression-next]").textContent = progression.nextLevel
            ? `${progression.nextLevel.minXp - progression.xp} XP para ${progression.nextLevel.name}`
            : "Nivel maximo alcancado";
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
