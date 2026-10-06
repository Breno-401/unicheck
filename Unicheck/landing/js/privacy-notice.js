(() => {
    const notice = document.querySelector("[data-privacy-notice]");
    if (!notice) return;

    const storageKey = "unicheck.privacy-notice-dismissed.v1";
    const dismissButton = notice.querySelector("[data-privacy-notice-dismiss]");

    try {
        if (window.localStorage.getItem(storageKey) === "true") notice.hidden = true;
    } catch {
        // The notice remains usable when browser storage is unavailable.
    }

    dismissButton?.addEventListener("click", () => {
        notice.hidden = true;
        try {
            window.localStorage.setItem(storageKey, "true");
        } catch {
            // Dismissing the notice must not depend on browser storage.
        }
    });
})();
