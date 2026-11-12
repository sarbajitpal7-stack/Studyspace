
/* =================================
   STUDYSPACE - COMPLETE JAVASCRIPT
================================= */


/* =================================
   DATE AND DAILY MOTIVATIONAL QUOTE
================================= */

const today = new Date();

const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
};

const currentDate = today.toLocaleDateString(
    "en-IN",
    dateOptions
);

const quotes = [
    "Small steps lead to big achievements.",
    "Believe in yourself and keep learning.",
    "Your future is created by what you do today.",
    "Stay focused and never stop improving.",
    "Every day is a new opportunity to learn.",
    "Success is the sum of small efforts repeated daily.",
    "Don't stop when you're tired. Stop when you're done.",
    "A little progress each day adds up to big results.",
    "Your only limit is the effort you are willing to make.",
    "Dream big, start small, and keep going."
];

// Use the local calendar date to choose one quote.
// The quote stays the same all day, even after refreshing.
const localDateNumber = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) /
    (1000 * 60 * 60 * 24)
);

const quoteIndex =
    ((localDateNumber % quotes.length) + quotes.length) % quotes.length;

const welcomeSection = document.querySelector(".welcome");

if (welcomeSection) {
    const dateElement = document.createElement("p");
    dateElement.className = "welcome-date";
    dateElement.textContent = "📅 " + currentDate;
    welcomeSection.appendChild(dateElement);

    const quoteElement = document.createElement("p");
    quoteElement.className = "daily-quote";
    quoteElement.textContent = "✨ " + quotes[quoteIndex];
    welcomeSection.appendChild(quoteElement);
}


/* =================================
   DAILY DATA STORAGE
================================= */

const todayKey = new Date().toLocaleDateString("en-CA");

const storageKey = "studyspace_" + todayKey;

let dailyData = JSON.parse(
    localStorage.getItem(storageKey)
) || {
    goals: [],
    studySeconds: 0,
    sessions: 0
};

function saveDailyData() {
    localStorage.setItem(
        storageKey,
        JSON.stringify(dailyData)
    );

    // Refresh weekly analytics whenever today's data changes.
    renderWeeklyAnalytics();
}


/* =================================
   DASHBOARD STATISTICS
================================= */

function updateStats() {

    document.getElementById("totalStudy").textContent =
        Math.floor(dailyData.studySeconds / 60) + " min";

    document.getElementById("completedGoals").textContent =
        dailyData.goals.filter(
            goal => goal.completed
        ).length;

    document.getElementById("sessions").textContent =
        dailyData.sessions;

}


/* =================================
   DAILY GOALS
================================= */

const goalInput = document.getElementById("goalInput");

const addGoalButton = document.getElementById("addGoal");

const goalList = document.getElementById("goalList");


function displayGoals() {

    goalList.innerHTML = "";

    dailyData.goals.forEach(function (goal, index) {

        const li = document.createElement("li");

        // CHECKBOX

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = goal.completed;

        checkbox.style.width = "18px";
        checkbox.style.margin = "0";

        checkbox.addEventListener("change", function () {

            goal.completed = checkbox.checked;

            saveDailyData();

            displayGoals();

            updateStats();

        });


        // GOAL TEXT

        const taskText = document.createElement("span");

        taskText.textContent = goal.text;

        taskText.style.flex = "1";

        if (goal.completed) {

            taskText.style.textDecoration = "line-through";

            taskText.style.opacity = "0.6";

        }


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {

            dailyData.goals.splice(index, 1);

            saveDailyData();

            displayGoals();

            updateStats();

        });


        // ADD ELEMENTS TO LIST

        li.appendChild(checkbox);

        li.appendChild(taskText);

        li.appendChild(deleteButton);

        goalList.appendChild(li);

    });

}


/* =================================
   ADD NEW GOAL
================================= */

function addGoal() {

    const text = goalInput.value.trim();

    if (text === "") {

        alert("Please enter a study goal!");

        return;

    }

    dailyData.goals.push({

        text: text,

        completed: false

    });

    goalInput.value = "";

    saveDailyData();

    displayGoals();

    updateStats();

}


// ADD BUTTON EVENT

addGoalButton.addEventListener("click", addGoal);


// ENTER KEY EVENT

goalInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        addGoal();

    }

});


/* =================================
   PREMIUM CIRCULAR POMODORO TIMER
================================= */

const timerDisplay = document.getElementById("timerDisplay");

const startButton = document.getElementById("startTimer");

const pauseButton = document.getElementById("pauseTimer");

const resetButton = document.getElementById("resetTimer");

const timerNote = document.querySelector(".timer-note");

const timerRing = document.getElementById("timerRing");

const timerMode = document.getElementById("timerMode");


const studyDuration = 25 * 60;

const breakDuration = 5 * 60;

let remainingTime = studyDuration;

let timerInterval = null;

let isBreak = false;


// DISPLAY TIMER AND PROGRESS

function displayTimer() {

    const minutes = Math.floor(remainingTime / 60);

    const seconds = remainingTime % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");


    // Calculate circular progress

    const totalDuration = isBreak
        ? breakDuration
        : studyDuration;

    const progress =
        ((totalDuration - remainingTime) / totalDuration) * 100;

    timerRing.style.setProperty(
        "--progress",
        progress + "%"
    );


    // Change appearance during break

    if (isBreak) {

        timerRing.classList.add("break-mode");

        timerMode.textContent = "BREAK MODE";

    } else {

        timerRing.classList.remove("break-mode");

        timerMode.textContent = "FOCUS MODE";

    }

}


// START TIMER

function startTimer() {

    if (timerInterval !== null) return;

    // Start pulsing animation

    timerRing.classList.remove("celebration");

    timerRing.classList.add("timer-running");


    timerInterval = setInterval(function () {

        remainingTime--;


        // Count study time only

        if (!isBreak) {

            dailyData.studySeconds++;

            saveDailyData();

            updateStats();

        }

        displayTimer();


        // WHEN TIMER FINISHES

        if (remainingTime <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;


            // Stop pulse and show celebration

            timerRing.classList.remove("timer-running");

            timerRing.classList.add("celebration");


            if (!isBreak) {

                // Increase completed focus sessions

                dailyData.sessions++;

                saveDailyData();

                updateStats();


                // Start break mode

                isBreak = true;

                remainingTime = breakDuration;

                timerNote.textContent =
                    "☕ Break time! Relax for 5 minutes.";

                displayTimer();

                alert(
                    "Excellent work! Your study session is complete. Enjoy your 5-minute break!"
                );

            } else {

                // Break completed

                isBreak = false;

                remainingTime = studyDuration;

                timerNote.textContent =
                    "25 minutes study • 5 minutes break";

                displayTimer();

                alert(
                    "Your break is complete! Ready for another study session?"
                );

            }

        }

    }, 1000);

}


// PAUSE TIMER

function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    // Stop pulsing animation

    timerRing.classList.remove("timer-running");

}


// RESET TIMER

function resetTimer() {

    pauseTimer();

    // Remove celebration animation

    timerRing.classList.remove("celebration");

    isBreak = false;

    remainingTime = studyDuration;

    timerNote.textContent =
        "25 minutes study • 5 minutes break";

    displayTimer();

}


// BUTTON EVENTS

startButton.addEventListener("click", startTimer);

pauseButton.addEventListener("click", pauseTimer);

resetButton.addEventListener("click", resetTimer);


/* =================================
   EXAM COUNTDOWN UPGRADE
================================= */

const examName = document.getElementById("examName");

const examDate = document.getElementById("examDate");

const examColor = document.getElementById("examColor");

const saveExamButton = document.getElementById("saveExam");

const examResult = document.getElementById("examResult");


let exams = JSON.parse(
    localStorage.getItem("studyspace_exams")
) || [];


// SAVE EXAMS

function saveExams() {

    localStorage.setItem(
        "studyspace_exams",
        JSON.stringify(exams)
    );

}


// DISPLAY EXAMS

function displayExams() {

    examResult.innerHTML = "";

    if (exams.length === 0) {

        examResult.textContent =
            "No upcoming exam added yet.";

        return;

    }


    exams.forEach(function (exam, index) {

        const examCard = document.createElement("div");

        examCard.className = "exam-card";

        // Default purple for older saved exams

        const selectedColor = exam.color || "#8b5cf6";


        // EXAM CARD DESIGN

        examCard.style.padding = "18px";

        examCard.style.marginBottom = "15px";

        examCard.style.background =
            "rgba(255,255,255,0.06)";

        examCard.style.borderRadius = "12px";

        examCard.style.borderLeft =
            "5px solid " + selectedColor;

        examCard.style.boxShadow =
            "0 5px 18px rgba(0,0,0,0.12)";


        // EXAM NAME

        const name = document.createElement("h3");

        name.textContent = "📚 " + exam.name;

        name.style.color = selectedColor;

        name.style.marginBottom = "10px";


        // CALCULATE DAYS REMAINING

        const examDay = new Date(
            exam.date + "T00:00:00"
        );

        const currentDay = new Date();

        currentDay.setHours(0, 0, 0, 0);

        const difference = Math.round(
            (examDay - currentDay) /
            (1000 * 60 * 60 * 24)
        );


        // COUNTDOWN TEXT

        const countdown = document.createElement("p");

        countdown.className = "exam-countdown";


        // URGENCY LABEL

        const urgency = document.createElement("span");

        urgency.className = "exam-urgency";


        if (difference > 30) {

            countdown.textContent =
                difference + " days remaining";

            urgency.textContent = "Plenty of time";

            urgency.style.background =
                "rgba(34,197,94,0.18)";

            urgency.style.color = "#4ade80";

        } else if (difference > 7) {

            countdown.textContent =
                difference + " days remaining";

            urgency.textContent = "Getting closer";

            urgency.style.background =
                "rgba(59,130,246,0.18)";

            urgency.style.color = "#60a5fa";

        } else if (difference > 1) {

            countdown.textContent =
                difference + " days remaining";

            urgency.textContent = "Coming soon!";

            urgency.style.background =
                "rgba(245,158,11,0.18)";

            urgency.style.color = "#fbbf24";

        } else if (difference === 1) {

            countdown.textContent =
                "Tomorrow is your exam!";

            urgency.textContent = "Almost here!";

            urgency.style.background =
                "rgba(245,158,11,0.18)";

            urgency.style.color = "#fbbf24";

        } else if (difference === 0) {

            countdown.textContent =
                "Your exam is today!";

            urgency.textContent = "Exam day";

            urgency.style.background =
                "rgba(239,68,68,0.18)";

            urgency.style.color = "#f87171";

        } else {

            countdown.textContent =
                "This exam date has passed.";

            urgency.textContent = "Completed";

            urgency.style.background =
                "rgba(148,163,184,0.18)";

            urgency.style.color = "#cbd5e1";

        }


        // URGENCY LABEL DESIGN

        urgency.style.display = "inline-block";

        urgency.style.padding = "5px 10px";

        urgency.style.borderRadius = "20px";

        urgency.style.fontSize = "12px";

        urgency.style.fontWeight = "bold";

        urgency.style.marginTop = "8px";


        // EXAM DATE

        const dateText = document.createElement("p");

        dateText.textContent =
            "📅 Exam Date: " + exam.date;

        dateText.style.marginTop = "10px";


        // DELETE BUTTON

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete Exam";

        deleteButton.style.marginTop = "12px";

        deleteButton.addEventListener("click", function () {

            exams.splice(index, 1);

            saveExams();

            displayExams();

        });


        // ADD ELEMENTS TO CARD

        examCard.appendChild(name);

        examCard.appendChild(countdown);

        examCard.appendChild(urgency);

        examCard.appendChild(dateText);

        examCard.appendChild(deleteButton);

        examResult.appendChild(examCard);

    });

}


// ADD NEW EXAM

saveExamButton.addEventListener("click", function () {

    const name = examName.value.trim();

    const date = examDate.value;

    const color = examColor
        ? examColor.value
        : "#8b5cf6";


    if (name === "" || date === "") {

        alert("Please enter the exam name and date!");

        return;

    }


    // CHECK EXAM DATE

    const selectedDate = new Date(
        date + "T00:00:00"
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    if (selectedDate < today) {

        alert("Please select today or a future date.");

        return;

    }


    // SAVE EXAM

    exams.push({

        name: name,

        date: date,

        color: color

    });


    saveExams();


    // CLEAR INPUTS

    examName.value = "";

    examDate.value = "";

    if (examColor) {

        examColor.value = "#8b5cf6";

    }


    displayExams();

});


// UPDATE COUNTDOWN EVERY MINUTE

setInterval(displayExams, 60000);


/* =================================
   INITIALISE WEBSITE
================================= */

displayGoals();

displayTimer();

displayExams();

updateStats();

/* =========================================
   STAGE 2 - WEEKLY STUDY ANALYTICS
========================================= */

// Use the same date-key format as the existing daily storage.
function getStudySpaceDateKey(date) {
    return date.toLocaleDateString("en-CA");
}

// Read one day's saved information. Missing days count as zero.
function getStudySpaceDayData(date) {
    const key = "studyspace_" + getStudySpaceDateKey(date);

    try {
        const savedData = JSON.parse(localStorage.getItem(key));
        return savedData || { goals: [], studySeconds: 0, sessions: 0 };
    } catch (error) {
        return { goals: [], studySeconds: 0, sessions: 0 };
    }
}

function formatStudyDuration(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return hours + " hr " + minutes + " min";
    }

    return totalMinutes + " min";
}

function renderWeeklyAnalytics() {
    const chart = document.getElementById("weeklyChart");
    if (!chart) return;

    const weeklyDays = [];
    const today = new Date();

    // Collect today and the previous six calendar days.
    for (let offset = 6; offset >= 0; offset--) {
        const date = new Date(today);
        date.setHours(0, 0, 0, 0);
        date.setDate(today.getDate() - offset);

        const data = getStudySpaceDayData(date);
        const studySeconds = Number(data.studySeconds) || 0;
        const goals = Array.isArray(data.goals) ? data.goals : [];
        const completedGoals = goals.filter(goal => goal && goal.completed).length;
        const sessions = Number(data.sessions) || 0;

        weeklyDays.push({
            date: date,
            label: date.toLocaleDateString("en-IN", { weekday: "short" }),
            studySeconds: studySeconds,
            completedGoals: completedGoals,
            totalGoals: goals.length,
            sessions: sessions
        });
    }

    const totalStudySeconds = weeklyDays.reduce(
        (total, day) => total + day.studySeconds, 0
    );
    const totalCompletedGoals = weeklyDays.reduce(
        (total, day) => total + day.completedGoals, 0
    );
    const totalGoals = weeklyDays.reduce(
        (total, day) => total + day.totalGoals, 0
    );
    const totalSessions = weeklyDays.reduce(
        (total, day) => total + day.sessions, 0
    );

    const goalPercentage = totalGoals > 0
        ? Math.round((totalCompletedGoals / totalGoals) * 100)
        : 0;

    document.getElementById("weeklyStudyTime").textContent =
        formatStudyDuration(totalStudySeconds);

    document.getElementById("weeklyGoals").textContent =
        goalPercentage + "%";

    document.getElementById("weeklySessions").textContent =
        totalSessions;

    // Find the day with the most recorded study time.
    const mostProductiveDay = weeklyDays.reduce((best, day) => {
        return day.studySeconds > best.studySeconds ? day : best;
    }, weeklyDays[0]);

    const productiveDayElement = document.getElementById("productiveDay");

    if (totalStudySeconds === 0) {
        productiveDayElement.textContent = "Not yet available";
    } else {
        productiveDayElement.textContent =
            mostProductiveDay.label + " (" +
            formatStudyDuration(mostProductiveDay.studySeconds) + ")";
    }

    // Draw the seven-day bar chart.
    const maximumStudySeconds = Math.max(
        ...weeklyDays.map(day => day.studySeconds),
        1
    );

    chart.innerHTML = "";

    weeklyDays.forEach(day => {
        const barColumn = document.createElement("div");
        barColumn.className = "chart-column";

        const barValue = document.createElement("span");
        barValue.className = "chart-value";
        barValue.textContent = day.studySeconds > 0
            ? formatStudyDuration(day.studySeconds)
            : "0 min";

        const barTrack = document.createElement("div");
        barTrack.className = "chart-bar-track";

        const bar = document.createElement("div");
        bar.className = "chart-bar";

        const heightPercentage = day.studySeconds > 0
            ? Math.max((day.studySeconds / maximumStudySeconds) * 100, 4)
            : 0;

        bar.style.height = heightPercentage + "%";
        bar.setAttribute(
            "aria-label",
            day.label + ": " + formatStudyDuration(day.studySeconds)
        );

        if (getStudySpaceDateKey(day.date) === getStudySpaceDateKey(today)) {
            bar.classList.add("today-bar");
        }

        barTrack.appendChild(bar);

        const dayLabel = document.createElement("span");
        dayLabel.className = "chart-day";
        dayLabel.textContent = day.label;

        barColumn.appendChild(barValue);
        barColumn.appendChild(barTrack);
        barColumn.appendChild(dayLabel);
        chart.appendChild(barColumn);
    });

    // Write a short summary based on the saved weekly figures.
    const summary = document.getElementById("weeklySummary");

    if (totalStudySeconds === 0 && totalGoals === 0 && totalSessions === 0) {
        summary.textContent =
            "Your weekly summary will appear here as you study. Start a focus session to begin tracking your progress!";
    } else {
        summary.textContent =
            "Over the last seven days, you studied for " +
            formatStudyDuration(totalStudySeconds) +
            ", completed " + totalCompletedGoals + " of " + totalGoals +
            " goals (" + goalPercentage + "%), and finished " +
            totalSessions + " focus sessions.";
    }
}

// Render analytics when the page first opens.
renderWeeklyAnalytics();


/* =========================================
   STAGE 3 - DARK / LIGHT THEME TOGGLE
========================================= */

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("studyspace_theme") || "dark";

function applyStudySpaceTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.body.setAttribute("data-theme", selectedTheme);

    if (themeToggle) {
        const isLight = selectedTheme === "light";
        themeToggle.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
        themeToggle.setAttribute("aria-pressed", String(isLight));
        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark mode" : "Switch to light mode"
        );
    }
}

// Restore the user's last selected theme when the website opens.
applyStudySpaceTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const currentTheme = document.body.getAttribute("data-theme") || "dark";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        applyStudySpaceTheme(nextTheme);
        localStorage.setItem("studyspace_theme", nextTheme);
    });
}


/* =========================================
   STAGE 3 - PERSONALISED WELCOME GREETING
========================================= */

const studentNameInput = document.getElementById("studentNameInput");
const saveStudentNameButton = document.getElementById("saveStudentName");
const welcomeTitle = document.getElementById("welcomeTitle");
const nameSaveMessage = document.getElementById("nameSaveMessage");
const studentNameStorageKey = "studyspace_student_name";

function updatePersonalGreeting() {
    const savedName = localStorage.getItem(studentNameStorageKey) || "";
    const displayName = savedName.trim() || "Student";

    if (welcomeTitle) {
        welcomeTitle.textContent = "Welcome Back, " + displayName + "! 👋";
    }

    if (studentNameInput) {
        studentNameInput.value = savedName;
    }
}

function savePersonalName() {
    if (!studentNameInput) return;

    const enteredName = studentNameInput.value.trim();

    if (enteredName.length === 0) {
        localStorage.removeItem(studentNameStorageKey);
        if (nameSaveMessage) {
            nameSaveMessage.textContent = "Name cleared. Showing the default greeting.";
        }
    } else {
        localStorage.setItem(studentNameStorageKey, enteredName);
        if (nameSaveMessage) {
            nameSaveMessage.textContent = "Your name has been saved!";
        }
    }

    updatePersonalGreeting();
}

if (saveStudentNameButton) {
    saveStudentNameButton.addEventListener("click", savePersonalName);
}

if (studentNameInput) {
    studentNameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            savePersonalName();
        }
    });
}

// Restore the saved name whenever StudySpace opens.
updatePersonalGreeting();

/* =========================================
   STAGE 3 - DASHBOARD CUSTOMISATION
   SHOW / HIDE DASHBOARD CARDS
========================================= */

(function initialiseDashboardCustomisation() {
    const settingsStorageKey = "studyspace_dashboard_visibility";

    // Each selector points to an existing StudySpace section.
    const dashboardSections = [
        {
            key: "dailyStats",
            label: "Daily Statistics",
            selector: ".stats"
        },
        {
            key: "dailyGoals",
            label: "Daily Goals",
            selector: "#goalInput"
        },
        {
            key: "studyTimer",
            label: "Study Timer",
            selector: "#timerRing"
        },
        {
            key: "weeklyAnalytics",
            label: "Weekly Analytics",
            selector: "#weeklyChart"
        },
        {
            key: "examCountdown",
            label: "Exam Countdown",
            selector: "#examName"
        }
    ];

    // Load saved choices. If storage is empty or invalid, show everything.
    let savedVisibility = {};

    try {
        savedVisibility = JSON.parse(
            localStorage.getItem(settingsStorageKey)
        ) || {};
    } catch (error) {
        savedVisibility = {};
    }

    // Find the outer card that contains a feature.
    function findSectionContainer(selector) {
        const element = document.querySelector(selector);

        if (!element) {
            return null;
        }

        if (element.matches(".stats")) {
            return element;
        }

        return element.closest(".card, section") || element.parentElement;
    }

    // Create the customisation panel without requiring changes to index.html.
    const settingsCard = document.createElement("section");
    settingsCard.className = "dashboard-settings-card";
    settingsCard.id = "dashboardCustomisation";
    settingsCard.setAttribute("aria-labelledby", "dashboardSettingsTitle");

    const heading = document.createElement("h2");
    heading.id = "dashboardSettingsTitle";
    heading.textContent = "⚙️ Customise Your Dashboard";

    const description = document.createElement("p");
    description.className = "dashboard-settings-description";
    description.textContent =
        "Choose which sections you want to see. Your preferences are saved automatically.";

    const optionsContainer = document.createElement("div");
    optionsContainer.className = "dashboard-visibility-options";

    const statusMessage = document.createElement("p");
    statusMessage.className = "dashboard-settings-status";
    statusMessage.setAttribute("aria-live", "polite");

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.className = "dashboard-reset-button";
    resetButton.textContent = "Show All Sections";

    dashboardSections.forEach(function (section) {
        const sectionContainer = findSectionContainer(section.selector);

        // Skip a section if it is not present in the current HTML.
        if (!sectionContainer) {
            return;
        }

        if (!sectionContainer.id) {
            sectionContainer.id = "studyspace-section-" + section.key;
        }

        const optionLabel = document.createElement("label");
        optionLabel.className = "dashboard-visibility-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = savedVisibility[section.key] !== false;
        checkbox.setAttribute("aria-controls", sectionContainer.id);

        const optionText = document.createElement("span");
        optionText.textContent = section.label;

        optionLabel.appendChild(checkbox);
        optionLabel.appendChild(optionText);
        optionsContainer.appendChild(optionLabel);

        // Apply the saved visibility setting.
        sectionContainer.hidden = !checkbox.checked;

        checkbox.addEventListener("change", function () {
            sectionContainer.hidden = !checkbox.checked;

            savedVisibility[section.key] = checkbox.checked;

            localStorage.setItem(
                settingsStorageKey,
                JSON.stringify(savedVisibility)
            );

            statusMessage.textContent =
                section.label + (checkbox.checked ? " is now visible." : " is now hidden.");
        });
    });

    resetButton.addEventListener("click", function () {
        savedVisibility = {};

        localStorage.removeItem(settingsStorageKey);

        const checkboxes = optionsContainer.querySelectorAll(
            'input[type="checkbox"]'
        );

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = true;

            const targetId = checkbox.getAttribute("aria-controls");
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.hidden = false;
            }
        });

        statusMessage.textContent = "All dashboard sections are visible again.";
    });

    settingsCard.appendChild(heading);
    settingsCard.appendChild(description);
    settingsCard.appendChild(optionsContainer);
    settingsCard.appendChild(resetButton);
    settingsCard.appendChild(statusMessage);

    // Place the settings panel just below the welcome area.
    const welcome = document.querySelector(".welcome");

    if (welcome) {
        welcome.insertAdjacentElement("afterend", settingsCard);
    } else {
        const container = document.querySelector(".container") || document.body;
        container.insertBefore(settingsCard, container.firstChild);
    }
})();

/* =========================================
   STAGE 4 - CUSTOM ACCENT COLOURS
========================================= */

(function initialiseAccentColours() {

    const settingsCard = document.getElementById(
        "dashboardCustomisation"
    );

    if (!settingsCard) return;

    const storageKey = "studyspace_accent_colour";

    const colours = [
        {
            name: "Purple",
            main: "#9565ff",
            light: "#c4a5ff",
            dark: "#7045f5",
            soft: "rgba(149,101,255,0.16)",
            glow: "rgba(149,101,255,0.30)"
        },
        {
            name: "Blue",
            main: "#3b82f6",
            light: "#93c5fd",
            dark: "#2563eb",
            soft: "rgba(59,130,246,0.16)",
            glow: "rgba(59,130,246,0.30)"
        },
        {
            name: "Green",
            main: "#10b981",
            light: "#6ee7b7",
            dark: "#059669",
            soft: "rgba(16,185,129,0.16)",
            glow: "rgba(16,185,129,0.30)"
        },
        {
            name: "Orange",
            main: "#f97316",
            light: "#fdba74",
            dark: "#ea580c",
            soft: "rgba(249,115,22,0.16)",
            glow: "rgba(249,115,22,0.30)"
        },
        {
            name: "Pink",
            main: "#ec4899",
            light: "#f9a8d4",
            dark: "#db2777",
            soft: "rgba(236,72,153,0.16)",
            glow: "rgba(236,72,153,0.30)"
        }
    ];

    const root = document.documentElement;

    const heading = document.createElement("h3");
    heading.className = "accent-settings-heading";
    heading.textContent = "🎨 Custom Accent Colours";

    const description = document.createElement("p");
    description.className = "accent-settings-description";
    description.textContent =
        "Choose your favourite colour to personalise your dashboard.";

    const picker = document.createElement("div");
    picker.className = "accent-colour-picker";
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "Choose accent colour");

    const status = document.createElement("p");
    status.className = "accent-settings-status";
    status.setAttribute("aria-live", "polite");

    function applyAccentColour(colour, save = true) {

        root.style.setProperty("--ss-accent", colour.main);
        root.style.setProperty("--ss-accent-light", colour.light);
        root.style.setProperty("--ss-accent-dark", colour.dark);
        root.style.setProperty("--ss-accent-soft", colour.soft);
        root.style.setProperty("--ss-accent-glow", colour.glow);

        if (save) {
            localStorage.setItem(storageKey, colour.name);
        }

        picker.querySelectorAll("button").forEach(button => {

            const selected = button.dataset.colour === colour.name;

            button.classList.toggle("selected", selected);

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );

        });

        status.textContent = colour.name + " accent colour selected!";
    }

    colours.forEach(colour => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "accent-colour-option";
        button.dataset.colour = colour.name;

        button.style.setProperty("--swatch-colour", colour.main);

        button.textContent = colour.name;

        button.setAttribute(
            "aria-label",
            "Select " + colour.name + " accent colour"
        );

        button.addEventListener("click", function () {
            applyAccentColour(colour);
        });

        picker.appendChild(button);

    });

    settingsCard.appendChild(heading);
    settingsCard.appendChild(description);
    settingsCard.appendChild(picker);
    settingsCard.appendChild(status);

    // Restore the previously selected colour.
    const savedColour = localStorage.getItem(storageKey);

    const selectedColour =
        colours.find(colour => colour.name === savedColour)
        || colours[0];

    applyAccentColour(selectedColour, false);

})();

/* =====================================
   STUDYSPACE - IMMERSIVE FOCUS MODE
===================================== */

(function () {

    const timerCard = document.querySelector(".timer-card");
    const enterButton = document.getElementById("enterFocusMode");

    if (!timerCard || !enterButton) return;

    // Create Exit Focus Mode button
    const exitButton = document.createElement("button");

    exitButton.type = "button";
    exitButton.className = "focus-mode-exit";
    exitButton.textContent = "✕ Exit Focus Mode";
    exitButton.style.display = "none";

    // Create environment selector
    const environment = document.createElement("div");

    environment.className = "focus-environment";

    environment.innerHTML = `
        <h3>Choose Your Environment</h3>
        <div class="focus-environment-options">
            <button type="button" data-environment="cosmic" class="selected">
                🌌 Cosmic Night
            </button>
            <button type="button" data-environment="rain">
                🌧️ Rainy Window
            </button>
            <button type="button" data-environment="nature">
                🌿 Nature Retreat
            </button>
        </div>
    `;

    // Add controls to the existing timer card
    timerCard.appendChild(exitButton);
    timerCard.appendChild(environment);

    const environmentButtons =
        environment.querySelectorAll("button");

    // Enter full-screen focus mode
    function enterFocusMode() {

        timerCard.classList.add("focus-mode-active");
        document.body.classList.add("focus-mode-open");

        timerCard.dataset.environment = "cosmic";

        enterButton.style.display = "none";
        exitButton.style.display = "block";

    }

    // Exit full-screen focus mode
    function exitFocusMode() {

        timerCard.classList.remove("focus-mode-active");
        document.body.classList.remove("focus-mode-open");

        enterButton.style.display = "inline-block";
        exitButton.style.display = "none";

    }

    // Change the focus environment
    environmentButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedEnvironment =
                button.dataset.environment;

            timerCard.dataset.environment =
                selectedEnvironment;

            environmentButtons.forEach(function (item) {

                item.classList.remove("selected");
                item.setAttribute("aria-pressed", "false");

            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");

        });

    });

    // Button events
    enterButton.addEventListener("click", enterFocusMode);

    exitButton.addEventListener("click", exitFocusMode);

    // Escape key exits focus mode
    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            timerCard.classList.contains("focus-mode-active")
        ) {
            exitFocusMode();
        }

    });

    // Set initial environment button state
    environmentButtons[0].setAttribute("aria-pressed", "true");

})();

/* =====================================
   STUDYSPACE - IMMERSIVE FOCUS MODE
===================================== */

(function () {
    const timerCard = document.querySelector(".timer-card");
    const enterButton = document.getElementById("enterFocusMode");

    if (!timerCard || !enterButton) {
        console.error("Focus Mode: Timer card or button not found.");
        return;
    }

    // Prevent adding the controls more than once.
    if (timerCard.dataset.focusModeReady === "true") return;
    timerCard.dataset.focusModeReady = "true";

    // Exit button
    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.className = "focus-mode-exit";
    exitButton.textContent = "✕ Exit Focus Mode";
    exitButton.style.display = "none";

    // Environment selector
    const environment = document.createElement("div");
    environment.className = "focus-environment";

    environment.innerHTML = `
        <h3>Choose Your Environment</h3>
        <div class="focus-environment-options">
            <button type="button" data-environment="cosmic"
                class="selected" aria-pressed="true">
                🌌 Cosmic Night
            </button>

            <button type="button" data-environment="rain"
                aria-pressed="false">
                🌧️ Rainy Window
            </button>

            <button type="button" data-environment="nature"
                aria-pressed="false">
                🌿 Nature Retreat
            </button>
        </div>
    `;

    timerCard.appendChild(exitButton);
    timerCard.appendChild(environment);

    const environmentButtons =
        environment.querySelectorAll("button");

    function enterFocusMode() {
        timerCard.classList.add("focus-mode-active");
        document.body.classList.add("focus-mode-open");

        enterButton.style.display = "none";
        exitButton.style.display = "block";
    }

    function exitFocusMode() {
        timerCard.classList.remove("focus-mode-active");
        document.body.classList.remove("focus-mode-open");

        enterButton.style.display = "";
        exitButton.style.display = "none";
    }

    enterButton.addEventListener("click", enterFocusMode);
    exitButton.addEventListener("click", exitFocusMode);

    environmentButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            timerCard.dataset.environment =
                button.dataset.environment;

            environmentButtons.forEach(function (item) {
                item.classList.remove("selected");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        });
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            timerCard.classList.contains("focus-mode-active")
        ) {
            exitFocusMode();
        }
    });

    timerCard.dataset.environment = "cosmic";
})();
