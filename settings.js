
document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("settingsContainer");

    // Dashboard sections
    const sections = [
        { id: "dailyStats", name: "Daily Statistics" },
        { id: "dailyGoals", name: "Daily Goals" },
        { id: "studyTimer", name: "Study Timer" },
        { id: "weeklyAnalytics", name: "Weekly Analytics" },
        { id: "examCountdown", name: "Exam Countdown" }
    ];

    const visibilityKey = "studyspace_dashboard_visibility";
    const accentKey = "studyspace_accent_colour";

    // Accent colour options
    const colours = [
        { name: "Purple", main: "#9565ff", light: "#c4a5ff", dark: "#7045f5", soft: "rgba(149,101,255,0.16)", glow: "rgba(149,101,255,0.30)" },
        { name: "Blue", main: "#3b82f6", light: "#93c5fd", dark: "#2563eb", soft: "rgba(59,130,246,0.16)", glow: "rgba(59,130,246,0.30)" },
        { name: "Green", main: "#10b981", light: "#6ee7b7", dark: "#059669", soft: "rgba(16,185,129,0.16)", glow: "rgba(16,185,129,0.30)" },
        { name: "Orange", main: "#f97316", light: "#fdba74", dark: "#ea580c", soft: "rgba(249,115,22,0.16)", glow: "rgba(249,115,22,0.30)" },
        { name: "Pink", main: "#ec4899", light: "#f9a8d4", dark: "#db2777", soft: "rgba(236,72,153,0.16)", glow: "rgba(236,72,153,0.30)" }
    ];

    // Read saved visibility settings
    let savedVisibility = {};

    try {
        savedVisibility = JSON.parse(localStorage.getItem(visibilityKey)) || {};
    } catch (error) {
        savedVisibility = {};
    }

    // Create settings card
    const card = document.createElement("section");
    card.className = "dashboard-settings-card";

    card.innerHTML = `
        <h2>📊 Dashboard Sections</h2>
        <p class="dashboard-settings-description">
            Choose which sections you want to display on your dashboard.
        </p>

        <div class="dashboard-visibility-options"></div>

        <button class="dashboard-reset-button" id="showAllSections">
            Show All Sections
        </button>

        <p class="dashboard-settings-status" id="visibilityStatus"></p>

        <hr>

        <h2>🎨 Accent Colours</h2>
        <p class="dashboard-settings-description">
            Choose your favourite colour for your StudySpace dashboard.
        </p>

        <div class="accent-colour-options"></div>

        <p class="dashboard-settings-status" id="colourStatus"></p>
    `;

    container.appendChild(card);

    // Create visibility checkboxes
    const optionsContainer = card.querySelector(".dashboard-visibility-options");

    sections.forEach(function (section) {

        const isVisible = savedVisibility[section.id] !== false;

        const label = document.createElement("label");
        label.className = "dashboard-visibility-option";

        label.innerHTML = `
            <input type="checkbox" ${isVisible ? "checked" : ""}>
            <span>${section.name}</span>
        `;

        const checkbox = label.querySelector("input");

        checkbox.addEventListener("change", function () {

            savedVisibility[section.id] = checkbox.checked;

            localStorage.setItem(
                visibilityKey,
                JSON.stringify(savedVisibility)
            );

            document.getElementById("visibilityStatus").textContent =
                "Dashboard preferences saved!";
        });

        optionsContainer.appendChild(label);
    });

    // Show all dashboard sections
    document.getElementById("showAllSections").addEventListener("click", function () {

        savedVisibility = {};

        localStorage.setItem(
            visibilityKey,
            JSON.stringify(savedVisibility)
        );

        optionsContainer.querySelectorAll("input").forEach(function (checkbox) {
            checkbox.checked = true;
        });

        document.getElementById("visibilityStatus").textContent =
            "All dashboard sections are now enabled!";
    });

    // Apply accent colour
    function applyAccent(colour) {

        const root = document.documentElement;

        root.style.setProperty("--ss-accent", colour.main);
        root.style.setProperty("--ss-accent-light", colour.light);
        root.style.setProperty("--ss-accent-dark", colour.dark);
        root.style.setProperty("--ss-accent-soft", colour.soft);
        root.style.setProperty("--ss-accent-glow", colour.glow);
    }

    // Create colour buttons
    const colourContainer = card.querySelector(".accent-colour-options");
    const savedColour = localStorage.getItem(accentKey) || "Purple";

    colours.forEach(function (colour) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "accent-colour-button";
        button.textContent = colour.name;
        button.style.setProperty("background-color", colour.main, "important");
        button.style.color = "#ffffff";

        button.addEventListener("click", function () {

            localStorage.setItem(accentKey, colour.name);

            applyAccent(colour);

            document.getElementById("colourStatus").textContent =
                colour.name + " accent colour saved!";

            colourContainer.querySelectorAll("button").forEach(function (item) {
                item.style.outline = "none";
            });

            button.style.outline = "3px solid var(--ss-accent-light)";
        });

        colourContainer.appendChild(button);

        if (colour.name === savedColour) {
            applyAccent(colour);
            button.style.outline = "3px solid var(--ss-accent-light)";
        }
    });

});

    // Theme settings
    const themeKey = "studyspace_theme";

    let currentTheme = localStorage.getItem(themeKey) || "dark";

    // Apply saved theme
    document.body.setAttribute("data-theme", currentTheme);

    // Create theme settings section
    const themeSection = document.createElement("div");

    themeSection.innerHTML = `
        <hr>
        <h2>🌙 Appearance</h2>

        <p class="dashboard-settings-description">
            Switch between dark mode and light mode.
        </p>

        <button type="button"
                class="dashboard-reset-button"
                id="settingsThemeToggle">
        </button>

        <p class="dashboard-settings-status" id="themeStatus"></p>
    `;

    card.appendChild(themeSection);

    const themeButton = document.getElementById("settingsThemeToggle");

    // Update button text
    function updateThemeButton() {
        themeButton.textContent =
            currentTheme === "dark"
                ? "☀️ Switch to Light Mode"
                : "🌙 Switch to Dark Mode";
    }

    updateThemeButton();

    // Change theme
    themeButton.addEventListener("click", function () {

        currentTheme = currentTheme === "dark" ? "light" : "dark";

        localStorage.setItem(themeKey, currentTheme);

        document.body.setAttribute("data-theme", currentTheme);

        updateThemeButton();

        document.getElementById("themeStatus").textContent =
            "Appearance preference saved!";
    });
