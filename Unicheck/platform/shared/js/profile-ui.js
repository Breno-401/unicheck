// Compatibility entry point. Rendering and lifecycle live in profile-sync.js.
(function () {
    window.ProfileManager = window.ProfileManager || { sync() {}, bindAutoSync() {} };
})();
