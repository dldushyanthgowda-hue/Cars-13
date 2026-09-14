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

    function makeButtonClickable(button) {
        button.style.pointerEvents = "auto";
        button.style.touchAction = "manipulation";
        button.style.cursor = "pointer";
        button.style.position = "relative";
        button.style.zIndex = "5";
    }

    function ensureGameModeUI() {
        const garagePanel = document.getElementById("garagePanel");
        if (!garagePanel) return;

        let picker = garagePanel.querySelector(".modePicker");
        const card = garagePanel.querySelector(".garageCard");
        const startButton = document.getElementById("startDrive");

        if (!picker && card) {
            picker = document.createElement("div");
            picker.className = "modePicker";
            card.insertBefore(picker, document.getElementById("carList"));
        }

        if (!picker) return;

        let career = document.getElementById("careerMode");
        let free = document.getElementById("freeMode");

        if (!career) {
            career = document.createElement("button");
            career.id = "careerMode";
            career.type = "button";
            career.textContent = "CAREER";
            picker.appendChild(career);
        }

        if (!free) {
            free = document.createElement("button");
            free.id = "freeMode";
            free.type = "button";
            free.textContent = "FREE DRIVE";
            picker.appendChild(free);
        }

        [career, free].forEach(makeButtonClickable);

        if (!career.dataset.v13ModeReady) {
            career.dataset.v13ModeReady = "1";
            career.addEventListener("click", function (event) {
                event.preventDefault();
                selectedMode = "career";
                career.classList.add("is-selected");
                free.classList.remove("is-selected");
                showCareerTypes();
                if (typeof renderGarage === "function") renderGarage();
            });
        }

        if (!free.dataset.v13ModeReady) {
            free.dataset.v13ModeReady = "1";
            free.addEventListener("click", function (event) {
                event.preventDefault();
                selectedMode = "free";
                free.classList.add("is-selected");
                career.classList.remove("is-selected");
                hideCareerTypes();
                if (typeof renderGarage === "function") renderGarage();
            });
        }

        career.classList.toggle("is-selected", selectedMode === "career");
        free.classList.toggle("is-selected", selectedMode === "free");

        if (selectedMode === "career") showCareerTypes();
        else hideCareerTypes();

        if (startButton) makeButtonClickable(startButton);
    }

    function showCareerTypes() {
        const card = document.querySelector(".garageCard");
        const carList = document.getElementById("carList");
        if (!card || !carList) return;

        let panel = document.getElementById("careerTypes");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "careerTypes";
            panel.innerHTML = `
                <div class="careerTypesTitle">CAREER CHALLENGES</div>
                <div class="careerTypeGrid">
                    <button type="button" data-career="sprint">
                        <strong>CITY SPRINT</strong>
                        <span>Reach the checkpoint quickly</span>
                    </button>
                    <button type="button" data-career="checkpoint">
                        <strong>CHECKPOINT RUN</strong>
                        <span>Clear checkpoints and level up</span>
                    </button>
                    <button type="button" data-career="longrun">
                        <strong>LONG ROUTE</strong>
                        <span>Take on a longer city route</span>
                    </button>
                </div>
            `;
            card.insertBefore(panel, carList);

            panel.querySelectorAll("button").forEach((button) => {
                makeButtonClickable(button);
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    panel.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
                    button.classList.add("is-selected");
                    localStorage.setItem("cars13-career-type", button.dataset.career);
                });
            });
        }

        panel.style.display = "block";

        const savedType = localStorage.getItem("cars13-career-type") || "checkpoint";
        const selected = panel.querySelector(`[data-career="${savedType}"]`) || panel.querySelector('[data-career="checkpoint"]');
        panel.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
        if (selected) selected.classList.add("is-selected");
    }

    function hideCareerTypes() {
        const panel = document.getElementById("careerTypes");
        if (panel) panel.style.display = "none";
    }

    function addStyles() {
        if (document.getElementById("v13-mode-styles")) return;
        const style = document.createElement("style");
        style.id = "v13-mode-styles";
        style.textContent = `
            #garagePanel, #garagePanel * { -webkit-tap-highlight-color: transparent; }
            #garagePanel .modePicker button,
            #garagePanel #startDrive,
            #careerTypes button { pointer-events:auto !important; touch-action:manipulation; }
            #careerTypes { margin: 0 0 14px; }
            .careerTypesTitle { color:#ffe27a; font-size:11px; font-weight:800; letter-spacing:1.5px; margin:4px 0 8px; }
            .careerTypeGrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
            #careerTypes button { min-height:78px; padding:10px; border:1px solid rgba(255,255,255,.2); border-radius:10px; background:rgba(255,255,255,.07); color:white; text-align:left; }
            #careerTypes button.is-selected { border-color:#ffe27a; background:rgba(255,226,122,.16); }
            #careerTypes strong { display:block; font-size:10px; margin-bottom:6px; }
            #careerTypes span { display:block; color:rgba(255,255,255,.68); font-size:9px; line-height:1.3; }
            @media(max-width:600px){ .careerTypeGrid { grid-template-columns:1fr; } #careerTypes button { min-height:58px; } }
        `;
        document.head.appendChild(style);
    }

    function init() {
        addStyles();
        ensureGameModeUI();
        setTimeout(ensureGameModeUI, 150);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    console.log("CARS 13 V13 game-mode patch loaded");
})();
