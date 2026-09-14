// ============================================================
// CARS 13 V13 — STABILITY + GAME MODE PATCH
// ============================================================

(function () {
    "use strict";

    if (typeof window.updateInfiniteRoad === "function") {
        window.updateInfiniteRoad = function () {};
    }

    if (typeof window.updateDriving === "function") {
        const originalUpdateDriving = window.updateDriving;
        window.updateDriving = function (delta) {
            originalUpdateDriving(Math.min(delta, 0.05));
        };
    }

    if (typeof window.updateOnFoot === "function") {
        const originalUpdateOnFoot = window.updateOnFoot;
        window.updateOnFoot = function (delta) {
            originalUpdateOnFoot(Math.min(delta, 0.05));
        };
    }

    function ensureGameModeButtons() {
        const garagePanel = document.getElementById("garagePanel");
        if (!garagePanel) return;

        let picker = garagePanel.querySelector(".modePicker");

        if (!picker) {
            const startButton = document.getElementById("startDrive");
            picker = document.createElement("div");
            picker.className = "modePicker";
            picker.style.display = "flex";
            picker.style.gap = "10px";
            picker.style.margin = "22px 0 14px";

            const career = document.createElement("button");
            career.id = "careerMode";
            career.type = "button";
            career.textContent = "CAREER";

            const free = document.createElement("button");
            free.id = "freeMode";
            free.type = "button";
            free.textContent = "FREE DRIVE";

            [career, free].forEach((button) => {
                button.style.flex = "1";
                button.style.minHeight = "42px";
                button.style.pointerEvents = "auto";
                button.style.cursor = "pointer";
            });

            picker.append(career, free);

            if (startButton) {
                startButton.parentNode.insertBefore(picker, startButton);
            } else {
                garagePanel.querySelector(".garageCard")?.appendChild(picker);
            }
        }

        const career = document.getElementById("careerMode");
        const free = document.getElementById("freeMode");
        if (!career || !free) return;

        if (!career.dataset.v13ModeReady) {
            career.dataset.v13ModeReady = "1";
            career.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                selectedMode = "career";
                career.classList.add("is-selected");
                free.classList.remove("is-selected");
                if (typeof renderGarage === "function") renderGarage();
            });
        }

        if (!free.dataset.v13ModeReady) {
            free.dataset.v13ModeReady = "1";
            free.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                selectedMode = "free";
                free.classList.add("is-selected");
                career.classList.remove("is-selected");
                if (typeof renderGarage === "function") renderGarage();
            });
        }

        career.classList.toggle("is-selected", selectedMode === "career");
        free.classList.toggle("is-selected", selectedMode === "free");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", ensureGameModeButtons);
    } else {
        ensureGameModeButtons();
    }

    setTimeout(ensureGameModeButtons, 100);

    console.log("CARS 13 V13 game-mode patch loaded");
})();
