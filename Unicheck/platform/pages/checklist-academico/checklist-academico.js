(function () {
    function initializeChecklistAcademicPage() {
        if (!window.UniCheckChecklistView) {
            console.error("Modulo de navegacao dos checklists nao foi carregado.");
            return;
        }

        window.UniCheckChecklistView.init();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeChecklistAcademicPage);
    } else {
        initializeChecklistAcademicPage();
    }
})();
