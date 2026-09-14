// ============================================================
// CARS 13 V13 — STABILITY PATCH
// Road flicker + smoother car and on-foot controls
// Loaded AFTER game-v12.js
// ============================================================

(function () {
    "use strict";

    // --------------------------------------------------------
    // ROAD FLICKER FIX
    // --------------------------------------------------------
    // V12 can rebuild the infinite road while the player drives.
    // Rebuilding visible road meshes can cause depth/shimmer issues.
    // The V12 road is already generated over the playable area, so
    // keep the existing road stable while playing.
    if (typeof window.updateInfiniteRoad === "function") {
        window.updateInfiniteRoad = function () {
            // Intentionally empty: keep the existing road meshes stable.
        };
    }

    // --------------------------------------------------------
    // CAR CONTROL STABILITY
    // --------------------------------------------------------
    // Limit a large frame delta so a temporary browser lag spike does
    // not make the car jump, turn sharply, or behave inconsistently.
    if (typeof window.updateDriving === "function") {
        const originalUpdateDriving = window.updateDriving;

        window.updateDriving = function (delta) {
            const safeDelta = Math.min(delta, 0.05);
            originalUpdateDriving(safeDelta);
        };
    }

    // --------------------------------------------------------
    // ON-FOOT CONTROL STABILITY
    // --------------------------------------------------------
    // Same protection for WASD/arrow keys and the mobile joystick.
    if (typeof window.updateOnFoot === "function") {
        const originalUpdateOnFoot = window.updateOnFoot;

        window.updateOnFoot = function (delta) {
            const safeDelta = Math.min(delta, 0.05);
            originalUpdateOnFoot(safeDelta);
        };
    }

    console.log("CARS 13 V13 stability patch loaded");
})();
