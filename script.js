/* =================================
   STUDYSPACE - COMPLETE JAVASCRIPT
   Corrected and consolidated version
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

const currentDate = today.toLocaleDateString("en-IN", dateOptions);

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

let dailyData = JSON.parse(localStorage.getItem(storageKey)) || {
    goals: [],
    studySeconds: 0,
    sessions: 0
};

function saveDailyData() {
    localStorage.setItem(storageKey, JSON.stringify(dailyData));

    // Refresh weekly analytics whenever today's data changes.
    renderWeeklyAnalytics();
}


/* =================================
   DASHBOARD STATISTICS
================================= */

function updateStats() {
    const totalStudy = document.getElementById("totalStudy");
    const completedGoals = document.getElementById("completedGoals");
    const sessions = document.getElementById("sessions");

    if (totalStudy) {
        totalStudy.textContent =
            Math.floor(dailyData.studySeconds / 60) + " min";
    }

    if (completedGoals) {
        completedGoals.textContent = dailyData.goals.filter(
            goal => goal.completed
        ).length;
    }

    if (sessions) {
        sessions.textContent = dailyData.sessions;
    }
}


/* =================================
   DAILY GOALS
================================= */

const goalInput = document.getElementById("goalInput");
const addGoalButton = document.getElementById("addGoal");
const goalList = document.getElementById("goalList");

function displayGoals() {
    if (!goalList) return;

    goalList.innerHTML = "";

    dailyData.goals.forEach(function (goal, index) {
        const li = document.createElement("li");

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

        const taskText = document.createElement("span");
        taskText.textContent = goal.text;
        taskText.style.flex = "1";

        if (goal.completed) {
            taskText.style.textDecoration = "line-through";
            taskText.style.opacity = "0.6";
        }

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            dailyData.goals.splice(index, 1);
            saveDailyData();
            displayGoals();
            updateStats();
        });

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
    if (!goalInput) return;

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

if (addGoalButton) {
    addGoalButton.addEventListener("click", addGoal);
}

if (goalInput) {
    goalInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addGoal();
        }
    });
}


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

function displayTimer() {
    if (!timerDisplay || !timerRing || !timerMode) return;

    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    const totalDuration = isBreak ? breakDuration : studyDuration;
    const progress =
        ((totalDuration - remainingTime) / totalDuration) * 100;

    timerRing.style.setProperty("--progress", progress + "%");

    if (isBreak) {
        timerRing.classList.add("break-mode");
        timerMode.textContent = "BREAK MODE";
    } else {
        timerRing.classList.remove("break-mode");
        timerMode.textContent = "FOCUS MODE";
    }
}

// =================================

// =================================
// STUDY SESSION HISTORY
// =================================

const historyStorageKey = "studyspace_session_history";

function getSessionHistory() {
    try {
        return JSON.parse(
            localStorage.getItem(historyStorageKey)
        ) || [];
    } catch (error) {
        return [];
    }
}

let sessionHistory = getSessionHistory();

function saveSessionHistory() {
    localStorage.setItem(
        historyStorageKey,
        JSON.stringify(sessionHistory)
    );
}

function renderSessionHistory() {
    const list = document.getElementById("sessionHistoryList");
    const totalSessions = document.getElementById("historyTotalSessions");
    const totalTime = document.getElementById("historyTotalTime");
    const count = document.getElementById("historySessionCount");

    if (!list || !totalSessions || !totalTime || !count) return;

    totalSessions.textContent = sessionHistory.length;

    const minutes = sessionHistory.reduce(
        (total, session) => total + session.durationMinutes,
        0
    );

    totalTime.textContent = minutes + " min";
    count.textContent = sessionHistory.length + " records";

    if (sessionHistory.length === 0) {
        list.innerHTML = `
            <p class="empty-session-history">
                Your completed study sessions will appear here.
            </p>
        `;
        return;
    }

    list.innerHTML = sessionHistory.map(session => `
        <div class="session-history-item">
            <div>
                <strong>🎯 Focus Session</strong>
                <p>${session.date} • ${session.completedAt}</p>
            </div>
            <strong>${session.durationMinutes} min</strong>
        </div>
    `).join("");
}


// =========================================
// STUDY STREAK TRACKER
// =========================================

const streakStorageKey = "studyspace_best_streak";

function getSessionDateKey(dateString) {
    const parts = dateString.split("/");

    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return year + "-" +
        String(month).padStart(2, "0") + "-" +
        String(day).padStart(2, "0");
}

function getLocalDateKey(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function renderStudyStreak() {
    const currentElement =
        document.getElementById("currentStudyStreak");

    const bestElement =
        document.getElementById("bestStudyStreak");

    const messageElement =
        document.getElementById("streakMessage");

    const weekElement =
        document.getElementById("streakWeekDays");

    if (
        !currentElement ||
        !bestElement ||
        !messageElement ||
        !weekElement
    ) return;

    const activeDates = new Set();

    sessionHistory.forEach(function(session) {
        const key = getSessionDateKey(session.date);

        if (key) {
            activeDates.add(key);
        }
    });

    // Calculate current streak
    const today = new Date();
    const todayKey = getLocalDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    let checkDate = new Date(today);

    if (!activeDates.has(todayKey)) {
        if (activeDates.has(getLocalDateKey(yesterday))) {
            checkDate = yesterday;
        } else {
            checkDate = null;
        }
    }

    while (
        checkDate &&
        activeDates.has(getLocalDateKey(checkDate))
    ) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate best streak
    const sortedDates = Array.from(activeDates).sort();

    let bestStreak = 0;
    let runningStreak = 0;
    let previousDate = null;

    sortedDates.forEach(function(key) {
        const parts = key.split("-").map(Number);

        const date = new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );

        if (previousDate) {
            const difference = Math.round(
                (date - previousDate) / 86400000
            );

            runningStreak =
                difference === 1 ? runningStreak + 1 : 1;
        } else {
            runningStreak = 1;
        }

        bestStreak = Math.max(bestStreak, runningStreak);
        previousDate = date;
    });

    const savedBest = Number(
        localStorage.getItem(streakStorageKey)
    ) || 0;

    bestStreak = Math.max(bestStreak, savedBest);

    localStorage.setItem(
        streakStorageKey,
        String(bestStreak)
    );

    currentElement.textContent = currentStreak + " days";
    bestElement.textContent = bestStreak + " days";

    // Update weekly activity
    const startOfWeek = new Date(today);
    const mondayOffset = (today.getDay() + 6) % 7;

    startOfWeek.setDate(today.getDate() - mondayOffset);

    const dayCards =
        weekElement.querySelectorAll(".streak-day");

    dayCards.forEach(function(card) {
        const dayNumber = Number(card.dataset.day);

        const date = new Date(startOfWeek);
        date.setDate(
            startOfWeek.getDate() + ((dayNumber + 6) % 7)
        );

        const key = getLocalDateKey(date);
        const completed = activeDates.has(key);

        card.classList.toggle("completed", completed);

        const symbol = card.querySelector("strong");

        if (symbol) {
            symbol.textContent = completed ? "✓" : "○";
        }
    });

    // Update streak message
    if (currentStreak === 0) {
        messageElement.textContent =
            "Complete a focus session today to start your streak!";
    } else if (currentStreak === 1) {
        messageElement.textContent =
            "Great start! Come back tomorrow to continue your streak.";
    } else {
        messageElement.textContent =
            "Amazing! You have studied for " +
            currentStreak + " consecutive days. Keep going!";
    }
}


// =================================
// RECORD ONE COMPLETED SESSION
// =================================

function recordCompletedSession() {
    const now = new Date();

    const session = {
        date: now.toLocaleDateString("en-IN"),
        completedAt: now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        }),
        durationMinutes: 25
    };

    sessionHistory.unshift(session);
    sessionHistory = sessionHistory.slice(0, 100);

    saveSessionHistory();
    renderSessionHistory();
    renderStudyStreak();
}


// Display saved information when website loads
renderSessionHistory();
renderStudyStreak();


// =================================
// POMODORO TIMER CONTROLS
// =================================

function startTimer() {
    if (timerInterval !== null || !timerRing) return;

    timerRing.classList.remove("celebration");
    timerRing.classList.add("timer-running");

    timerInterval = setInterval(function () {
        remainingTime--;

        if (!isBreak) {
            dailyData.studySeconds++;
            saveDailyData();
            updateStats();
        }

        displayTimer();

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            timerRing.classList.remove("timer-running");
            timerRing.classList.add("celebration");

            if (!isBreak) {
                dailyData.sessions++;
                saveDailyData();
                updateStats();

                // Record the session ONLY once when completed.
                recordCompletedSession();

                isBreak = true;
                remainingTime = breakDuration;

                if (timerNote) {
                    timerNote.textContent =
                        "☕ Break time! Relax for 5 minutes.";
                }

                displayTimer();

                alert(
                    "Excellent work! Your study session is complete. Enjoy your 5-minute break!"
                );

            } else {
                isBreak = false;
                remainingTime = studyDuration;

                if (timerNote) {
                    timerNote.textContent =
                        "25 minutes study • 5 minutes break";
                }

                displayTimer();

                alert(
                    "Your break is complete! Ready for another study session?"
                );
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    if (timerRing) {
        timerRing.classList.remove("timer-running");
    }
}

function resetTimer() {
    pauseTimer();

    if (timerRing) {
        timerRing.classList.remove("celebration");
    }

    isBreak = false;
    remainingTime = studyDuration;

    if (timerNote) {
        timerNote.textContent =
            "25 minutes study • 5 minutes break";
    }

    displayTimer();
}

if (startButton) startButton.addEventListener("click", startTimer);
if (pauseButton) pauseButton.addEventListener("click", pauseTimer);
if (resetButton) resetButton.addEventListener("click", resetTimer);

/* =================================
   EXAM COUNTDOWN UPGRADE
================================= */

const examName = document.getElementById("examName");
const examDate = document.getElementById("examDate");
const examColor = document.getElementById("examColor");
const saveExamButton = document.getElementById("saveExam");
const examResult = document.getElementById("examResult");

let exams = JSON.parse(localStorage.getItem("studyspace_exams")) || [];

function saveExams() {
    localStorage.setItem("studyspace_exams", JSON.stringify(exams));
}

function displayExams() {
    if (!examResult) return;

    examResult.innerHTML = "";

    if (exams.length === 0) {
        examResult.textContent = "No upcoming exam added yet.";
        return;
    }

    exams.forEach(function (exam, index) {
        const examCard = document.createElement("div");
        examCard.className = "exam-card";

        const selectedColor = exam.color || "#8b5cf6";

        examCard.style.padding = "18px";
        examCard.style.marginBottom = "15px";
        examCard.style.background = "rgba(255,255,255,0.06)";
        examCard.style.borderRadius = "12px";
        examCard.style.borderLeft = "5px solid " + selectedColor;
        examCard.style.boxShadow = "0 5px 18px rgba(0,0,0,0.12)";

        const name = document.createElement("h3");
        name.textContent = "📚 " + exam.name;
        name.style.color = selectedColor;
        name.style.marginBottom = "10px";

        const examDay = new Date(exam.date + "T00:00:00");
        const currentDay = new Date();
        currentDay.setHours(0, 0, 0, 0);

        const difference = Math.round(
            (examDay - currentDay) / (1000 * 60 * 60 * 24)
        );

        const countdown = document.createElement("p");
        countdown.className = "exam-countdown";

        const urgency = document.createElement("span");
        urgency.className = "exam-urgency";

        if (difference > 30) {
            countdown.textContent = difference + " days remaining";
            urgency.textContent = "Plenty of time";
            urgency.style.background = "rgba(34,197,94,0.18)";
            urgency.style.color = "#4ade80";
        } else if (difference > 7) {
            countdown.textContent = difference + " days remaining";
            urgency.textContent = "Getting closer";
            urgency.style.background = "rgba(59,130,246,0.18)";
            urgency.style.color = "#60a5fa";
        } else if (difference > 1) {
            countdown.textContent = difference + " days remaining";
            urgency.textContent = "Coming soon!";
            urgency.style.background = "rgba(245,158,11,0.18)";
            urgency.style.color = "#fbbf24";
        } else if (difference === 1) {
            countdown.textContent = "Tomorrow is your exam!";
            urgency.textContent = "Almost here!";
            urgency.style.background = "rgba(245,158,11,0.18)";
            urgency.style.color = "#fbbf24";
        } else if (difference === 0) {
            countdown.textContent = "Your exam is today!";
            urgency.textContent = "Exam day";
            urgency.style.background = "rgba(239,68,68,0.18)";
            urgency.style.color = "#f87171";
        } else {
            countdown.textContent = "This exam date has passed.";
            urgency.textContent = "Completed";
            urgency.style.background = "rgba(148,163,184,0.18)";
            urgency.style.color = "#cbd5e1";
        }

        urgency.style.display = "inline-block";
        urgency.style.padding = "5px 10px";
        urgency.style.borderRadius = "20px";
        urgency.style.fontSize = "12px";
        urgency.style.fontWeight = "bold";
        urgency.style.marginTop = "8px";

        const dateText = document.createElement("p");
        dateText.textContent = "📅 Exam Date: " + exam.date;
        dateText.style.marginTop = "10px";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Exam";

        deleteButton.addEventListener("click", function () {
            exams.splice(index, 1);
            saveExams();
            displayExams();
        });

        examCard.appendChild(name);
        examCard.appendChild(countdown);
        examCard.appendChild(urgency);
        examCard.appendChild(dateText);
        examCard.appendChild(deleteButton);
        examResult.appendChild(examCard);
    });
}

if (saveExamButton) {
    saveExamButton.addEventListener("click", function () {
        const name = examName ? examName.value.trim() : "";
        const date = examDate ? examDate.value : "";
        const color = examColor ? examColor.value : "#8b5cf6";

        if (name === "" || date === "") {
            alert("Please enter the exam name and date!");
            return;
        }

        const selectedDate = new Date(date + "T00:00:00");
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (selectedDate < todayDate) {
            alert("Please select today or a future date.");
            return;
        }

        exams.push({
            name: name,
            date: date,
            color: color
        });

        saveExams();

        examName.value = "";
        examDate.value = "";

        if (examColor) {
            examColor.value = "#8b5cf6";
        }

        displayExams();
    });
}

setInterval(displayExams, 60000);


/* =========================================
   STAGE 2 - WEEKLY STUDY ANALYTICS
========================================= */

function getStudySpaceDateKey(date) {
    return date.toLocaleDateString("en-CA");
}

function getStudySpaceDayData(date) {
    const key = "studyspace_" + getStudySpaceDateKey(date);

    try {
        const savedData = JSON.parse(localStorage.getItem(key));
        return savedData || {
            goals: [],
            studySeconds: 0,
            sessions: 0
        };
    } catch (error) {
        return {
            goals: [],
            studySeconds: 0,
            sessions: 0
        };
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
    const todayDate = new Date();

    for (let offset = 6; offset >= 0; offset--) {
        const date = new Date(todayDate);
        date.setHours(0, 0, 0, 0);
        date.setDate(todayDate.getDate() - offset);

        const data = getStudySpaceDayData(date);
        const studySeconds = Number(data.studySeconds) || 0;
        const goals = Array.isArray(data.goals) ? data.goals : [];
        const completedGoals = goals.filter(
            goal => goal && goal.completed
        ).length;
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

    const weeklyStudyTime = document.getElementById("weeklyStudyTime");
    const weeklyGoals = document.getElementById("weeklyGoals");
    const weeklySessions = document.getElementById("weeklySessions");
    const productiveDayElement = document.getElementById("productiveDay");

    if (weeklyStudyTime) {
        weeklyStudyTime.textContent = formatStudyDuration(totalStudySeconds);
    }

    if (weeklyGoals) {
        weeklyGoals.textContent = goalPercentage + "%";
    }

    if (weeklySessions) {
        weeklySessions.textContent = totalSessions;
    }

    const mostProductiveDay = weeklyDays.reduce((best, day) => {
        return day.studySeconds > best.studySeconds ? day : best;
    }, weeklyDays[0]);

    if (productiveDayElement) {
        if (totalStudySeconds === 0) {
            productiveDayElement.textContent = "Not yet available";
        } else {
            productiveDayElement.textContent =
                mostProductiveDay.label + " (" +
                formatStudyDuration(mostProductiveDay.studySeconds) + ")";
        }
    }

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

        if (
            getStudySpaceDateKey(day.date) ===
            getStudySpaceDateKey(todayDate)
        ) {
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

    const summary = document.getElementById("weeklySummary");

    if (summary) {
        if (
            totalStudySeconds === 0 &&
            totalGoals === 0 &&
            totalSessions === 0
        ) {
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
}


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

applyStudySpaceTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const currentTheme =
            document.body.getAttribute("data-theme") || "dark";
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
            nameSaveMessage.textContent =
                "Name cleared. Showing the default greeting.";
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

updatePersonalGreeting();


/* =========================================
   STAGE 3 - DASHBOARD CUSTOMISATION
   SHOW / HIDE DASHBOARD CARDS
========================================= */

(function initialiseDashboardCustomisation() {
    const settingsStorageKey = "studyspace_dashboard_visibility";

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

    let savedVisibility = {};

    try {
        savedVisibility =
            JSON.parse(localStorage.getItem(settingsStorageKey)) || {};
    } catch (error) {
        savedVisibility = {};
    }

    function findSectionContainer(selector) {
        const element = document.querySelector(selector);

        if (!element) return null;
        if (element.matches(".stats")) return element;

        return element.closest(".card, section") || element.parentElement;
    }

    const settingsCard = document.createElement("section");
    settingsCard.className = "dashboard-settings-card";
    settingsCard.id = "dashboardCustomisation";
    settingsCard.setAttribute(
        "aria-labelledby",
        "dashboardSettingsTitle"
    );

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

        if (!sectionContainer) return;

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

        sectionContainer.hidden = !checkbox.checked;

        checkbox.addEventListener("change", function () {
            sectionContainer.hidden = !checkbox.checked;
            savedVisibility[section.key] = checkbox.checked;

            localStorage.setItem(
                settingsStorageKey,
                JSON.stringify(savedVisibility)
            );

            statusMessage.textContent =
                section.label +
                (checkbox.checked ? " is now visible." : " is now hidden.");
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

        statusMessage.textContent =
            "All dashboard sections are visible again.";
    });

    settingsCard.appendChild(heading);
    settingsCard.appendChild(description);
    settingsCard.appendChild(optionsContainer);
    settingsCard.appendChild(resetButton);
    settingsCard.appendChild(statusMessage);

    const welcome = document.querySelector(".welcome");

    if (welcome) {
        welcome.insertAdjacentElement("afterend", settingsCard);
    } else {
        const container =
            document.querySelector(".container") || document.body;
        container.insertBefore(settingsCard, container.firstChild);
    }
})();


/* =========================================
   STAGE 4 - CUSTOM ACCENT COLOURS
========================================= */

(function initialiseAccentColours() {
    const settingsCard =
        document.getElementById("dashboardCustomisation");

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

        picker.querySelectorAll("button").forEach(function (button) {
            const selected = button.dataset.colour === colour.name;

            button.classList.toggle("selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });

        status.textContent =
            colour.name + " accent colour selected!";
    }

    colours.forEach(function (colour) {
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

    const savedColour = localStorage.getItem(storageKey);

    const selectedColour =
        colours.find(colour => colour.name === savedColour) ||
        colours[0];

    applyAccentColour(selectedColour, false);
})();


/* =====================================
   STAGE 5 - IMMERSIVE FOCUS MODE
   Uses the controls already in index.html.
   Does not create duplicate buttons or headings.
===================================== */

(function initialiseImmersiveFocusMode() {
    const timerCard = document.querySelector(".timer-card");
    const enterButton = document.getElementById("enterFocusMode");
    const controls = document.getElementById("focusModeControls");
    const exitButton = document.getElementById("exitFocusMode");
    const environmentOptions =
        document.querySelector(".environment-options");

    if (
        !timerCard ||
        !enterButton ||
        !controls ||
        !exitButton ||
        !environmentOptions
    ) {
        console.warn(
            "Immersive Focus Mode was not initialised: one or more HTML controls are missing."
        );
        return;
    }

    // Use the existing HTML controls. Do not create new copies.
    controls.style.display = "none";

    const environmentButtons =
        environmentOptions.querySelectorAll(".environment-option");

    function enterFocusMode() {
        timerCard.classList.add("focus-mode-active");
        document.body.classList.add("focus-mode-open");

        controls.style.display = "block";
        enterButton.style.display = "none";
    }

    function exitFocusMode() {
        timerCard.classList.remove("focus-mode-active");
        document.body.classList.remove("focus-mode-open");

        controls.style.display = "none";
        enterButton.style.display = "";
    }

    enterButton.addEventListener("click", enterFocusMode);
    exitButton.addEventListener("click", exitFocusMode);

    environmentButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const selectedEnvironment = button.dataset.environment;

            timerCard.dataset.environment = selectedEnvironment;

            environmentButtons.forEach(function (item) {
                item.classList.remove("selected", "active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("selected");
            button.setAttribute("aria-pressed", "true");
        });
    });

    // Select Cosmic Night by default.
    timerCard.dataset.environment = "cosmic";

    environmentButtons.forEach(function (button) {
        const selected = button.dataset.environment === "cosmic";

        button.classList.toggle("selected", selected);
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    // Escape key exits Focus Mode.
    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            timerCard.classList.contains("focus-mode-active")
        ) {
            exitFocusMode();
        }
    });
})();


/* =========================================
   INITIALISE WEBSITE FEATURES
========================================= */

displayGoals();
displayTimer();
displayExams();
updateStats();
renderWeeklyAnalytics();

/* =========================================
   STAGE 6 - FOCUS SESSION COMPLETION SCREEN
   Works with the existing Pomodoro timer.
========================================= */

(function initialiseFocusCompletionScreen() {

    const originalAlert = window.alert;

    window.alert = function (message) {

        // Intercept only the focus-session completion alert.
        if (
            message !==
            "Excellent work! Your study session is complete. Enjoy your 5-minute break!"
        ) {
            originalAlert.call(window, message);
            return;
        }

        // Prevent multiple completion screens.
        if (document.getElementById("focusCompletionOverlay")) {
            return;
        }

        const overlay = document.createElement("div");
        overlay.id = "focusCompletionOverlay";

        overlay.innerHTML = `
            <div class="completion-card">

                <div class="completion-trophy">🏆</div>

                <h2>Focus Session Complete!</h2>

                <p class="completion-message">
                    Excellent work! You completed 25 minutes of focused study.
                    Take a well-deserved break.
                </p>

                <div class="completion-stats">

                    <div class="completion-stat">
                        <span>⏱️</span>
                        <strong>25 min</strong>
                        <small>Focus Time</small>
                    </div>

                    <div class="completion-stat">
                        <span>🎯</span>
                        <strong>${dailyData.sessions}</strong>
                        <small>Sessions Today</small>
                    </div>

                    <div class="completion-stat">
                        <span>📚</span>
                        <strong>${formatStudyDuration(dailyData.studySeconds)}</strong>
                        <small>Total Study Time</small>
                    </div>

                </div>

                <p class="completion-quote">
                    "Every focused minute brings you closer to your goals."
                </p>

                <button id="continueBreakButton" type="button">
                    ☕ Start 5-Minute Break
                </button>

            </div>
        `;

        const style = document.createElement("style");

        style.textContent = `
            #focusCompletionOverlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(5, 8, 25, 0.88);
                backdrop-filter: blur(14px);
                animation: completionFade 0.4s ease;
            }

            .completion-card {
                width: 100%;
                max-width: 520px;
                padding: 35px 25px;
                text-align: center;
                color: white;
                background: linear-gradient(
                    145deg,
                    #211b45,
                    #111827
                );
                border: 1px solid rgba(255,255,255,0.16);
                border-radius: 25px;
                box-shadow: 0 20px 70px rgba(0,0,0,0.5);
                animation: completionPop 0.5s ease;
            }

            .completion-trophy {
                font-size: 65px;
                margin-bottom: 15px;
                animation: trophyFloat 2s ease-in-out infinite;
            }

            .completion-card h2 {
                font-size: 27px;
                margin-bottom: 12px;
                color: #c4a5ff;
            }

            .completion-message {
                color: #d1d5db;
                line-height: 1.6;
                margin-bottom: 25px;
            }

            .completion-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 25px;
            }

            .completion-stat {
                padding: 15px 7px;
                border-radius: 15px;
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.08);
            }

            .completion-stat span {
                display: block;
                font-size: 23px;
                margin-bottom: 8px;
            }

            .completion-stat strong {
                display: block;
                font-size: 17px;
                color: #c4a5ff;
                overflow-wrap: anywhere;
            }

            .completion-stat small {
                display: block;
                font-size: 11px;
                color: #cbd5e1;
                margin-top: 6px;
            }

            .completion-quote {
                font-style: italic;
                color: #cbd5e1;
                margin-bottom: 25px;
                line-height: 1.5;
            }

            #continueBreakButton {
                width: 100%;
                padding: 14px;
                border: none;
                border-radius: 12px;
                background: linear-gradient(
                    135deg,
                    #9565ff,
                    #7045f5
                );
                color: white;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            #continueBreakButton:hover {
                transform: translateY(-3px);
            }

            @keyframes completionFade {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes completionPop {
                from {
                    opacity: 0;
                    transform: scale(0.85);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            @keyframes trophyFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }

            @media (max-width: 450px) {
                .completion-card {
                    padding: 25px 15px;
                }

                .completion-card h2 {
                    font-size: 22px;
                }

                .completion-stats {
                    gap: 6px;
                }

                .completion-stat {
                    padding: 12px 4px;
                }

                .completion-stat strong {
                    font-size: 14px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #focusCompletionOverlay,
                .completion-card,
                .completion-trophy {
                    animation: none;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);

        const continueButton =
            document.getElementById("continueBreakButton");

        continueButton.addEventListener("click", function () {

            overlay.remove();

            // The existing timer has already switched to break mode.
            // Start its five-minute countdown.
            if (startButton) {
                startButton.click();
            }
        });
    };

})();

/* =========================================
   STAGE 9 - PERSONAL STUDY CALENDAR
========================================= */

(function initialiseStudyCalendar() {

    if (document.getElementById("studyCalendar")) return;

    const calendarStorageKey = "studyspace_calendar_notes";

    let displayedDate = new Date();
    let selectedDate = new Date();

    function getDateKey(date) {
        return date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0") + "-" +
            String(date.getDate()).padStart(2, "0");
    }

    function getDayData(date) {
        const key = "studyspace_" + date.toLocaleDateString("en-CA");

        try {
            return JSON.parse(localStorage.getItem(key)) || {
                goals: [],
                studySeconds: 0,
                sessions: 0
            };
        } catch (error) {
            return {
                goals: [],
                studySeconds: 0,
                sessions: 0
            };
        }
    }

    function getCalendarNotes() {
        try {
            return JSON.parse(
                localStorage.getItem(calendarStorageKey)
            ) || {};
        } catch (error) {
            return {};
        }
    }

    function saveCalendarNotes(notes) {
        localStorage.setItem(
            calendarStorageKey,
            JSON.stringify(notes)
        );
    }

    const calendar = document.createElement("section");
    calendar.className = "card study-calendar-card";
    calendar.id = "studyCalendar";

    calendar.innerHTML = `
        <h2>🗓️ Personal Study Calendar</h2>
        <p>Track your daily study activity and progress.</p>

        <div class="calendar-header">
            <button type="button" id="calendarPrevious">←</button>
            <h3 id="calendarMonth"></h3>
            <button type="button" id="calendarNext">→</button>
        </div>

        <div class="calendar-weekdays">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>

        <div class="calendar-legend">
            <span><i class="legend-today"></i> Today</span>
            <span><i class="legend-active"></i> Study completed</span>
        </div>

        <div class="calendar-details" id="calendarDetails">
            <h3>📚 Daily Details</h3>
            <p>Select a date to see your study progress.</p>
        </div>

        <div class="calendar-note-area">
            <label for="calendarNote">📝 Personal note for selected date</label>
            <textarea id="calendarNote"
                placeholder="Write your study plan or a reminder..."
                rows="3"></textarea>
            <button type="button" id="saveCalendarNote">
                Save Note
            </button>
            <p id="calendarNoteMessage" aria-live="polite"></p>
        </div>
    `;

    const analyticsSection = document.getElementById("analytics");

    if (analyticsSection) {
        analyticsSection.insertAdjacentElement("afterend", calendar);
    } else {
        const container = document.querySelector(".container");
        if (container) container.appendChild(calendar);
    }

    // Add navigation link
    const navigation = document.querySelector(".navbar nav");

    if (
        navigation &&
        !navigation.querySelector('a[href="#studyCalendar"]')
    ) {
        const link = document.createElement("a");
        link.href = "#studyCalendar";
        link.textContent = "Study Calendar";
        navigation.appendChild(link);
    }

    const monthTitle = document.getElementById("calendarMonth");
    const calendarGrid = document.getElementById("calendarGrid");
    const details = document.getElementById("calendarDetails");
    const noteInput = document.getElementById("calendarNote");
    const noteMessage = document.getElementById("calendarNoteMessage");

    function showSelectedDate() {
        const data = getDayData(selectedDate);
        const key = getDateKey(selectedDate);
        const notes = getCalendarNotes();

        const studyMinutes = Math.floor(
            (Number(data.studySeconds) || 0) / 60
        );

        const goals = Array.isArray(data.goals) ? data.goals : [];

        const completedGoals = goals.filter(
            goal => goal && goal.completed
        ).length;

        details.innerHTML = `
            <h3>📚 Daily Details</h3>
            <p id="selectedCalendarDate"></p>
            <div class="calendar-detail-stats">
                <div>
                    <strong id="calendarStudyTime"></strong>
                    <span>Study Time</span>
                </div>
                <div>
                    <strong id="calendarSessions"></strong>
                    <span>Focus Sessions</span>
                </div>
                <div>
                    <strong id="calendarGoals"></strong>
                    <span>Goals Completed</span>
                </div>
            </div>
            <p id="calendarGoalList"></p>
        `;

        document.getElementById("selectedCalendarDate").textContent =
            selectedDate.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });

        document.getElementById("calendarStudyTime").textContent =
            studyMinutes + " min";

        document.getElementById("calendarSessions").textContent =
            Number(data.sessions) || 0;

        document.getElementById("calendarGoals").textContent =
            completedGoals + "/" + goals.length;

        const goalList = document.getElementById("calendarGoalList");

        if (goals.length === 0) {
            goalList.textContent = "No study goals recorded for this date.";
        } else {
            goalList.textContent = "Goals: " +
                goals.map(goal =>
                    (goal.completed ? "✓ " : "○ ") + goal.text
                ).join(" | ");
        }

        noteInput.value = notes[key] || "";
        noteMessage.textContent = "";
    }

    function renderCalendar() {
        const year = displayedDate.getFullYear();
        const month = displayedDate.getMonth();

        monthTitle.textContent = displayedDate.toLocaleDateString(
            "en-IN",
            { month: "long", year: "numeric" }
        );

        calendarGrid.innerHTML = "";

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const mondayOffset = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < mondayOffset; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-empty";
            calendarGrid.appendChild(empty);
        }

        const todayKey = getDateKey(new Date());

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const key = getDateKey(date);
            const data = getDayData(date);

            const hasActivity =
                (Number(data.studySeconds) || 0) > 0 ||
                (Number(data.sessions) || 0) > 0;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendar-day";
            button.textContent = day;

            if (key === todayKey) {
                button.classList.add("calendar-today");
            }

            if (hasActivity) {
                button.classList.add("calendar-active");
            }

            if (key === getDateKey(selectedDate)) {
                button.classList.add("calendar-selected");
            }

            button.setAttribute(
                "aria-label",
                date.toDateString() +
                (hasActivity ? ", study activity recorded" : "")
            );

            button.addEventListener("click", function() {
                selectedDate = new Date(date);
                renderCalendar();
                showSelectedDate();
            });

            calendarGrid.appendChild(button);
        }
    }

    document.getElementById("calendarPrevious")
        .addEventListener("click", function() {
            displayedDate.setMonth(displayedDate.getMonth() - 1);
            renderCalendar();
        });

    document.getElementById("calendarNext")
        .addEventListener("click", function() {
            displayedDate.setMonth(displayedDate.getMonth() + 1);
            renderCalendar();
        });

    document.getElementById("saveCalendarNote")
        .addEventListener("click", function() {
            const notes = getCalendarNotes();
            const key = getDateKey(selectedDate);
            const note = noteInput.value.trim();

            if (note) {
                notes[key] = note;
            } else {
                delete notes[key];
            }

            saveCalendarNotes(notes);
            noteMessage.textContent = "Your calendar note has been saved!";
        });

    // Add calendar styling
    const calendarStyle = document.createElement("style");

    calendarStyle.textContent = `
        .study-calendar-card {
            margin-bottom: 30px;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 22px;
        }

        .calendar-header h3 {
            color: #d9c5ff;
            text-align: center;
            font-size: 21px;
        }

        .calendar-header button {
            min-width: 42px;
            padding: 10px;
        }

        .calendar-weekdays,
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 8px;
        }

        .calendar-weekdays {
            margin-bottom: 10px;
            text-align: center;
            color: #c4a8ff;
            font-size: 13px;
            font-weight: bold;
        }

        .calendar-day {
            min-width: 0;
            aspect-ratio: 1;
            margin: 0;
            padding: 4px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.07);
            color: white;
            border-radius: 12px;
            font-size: 14px;
        }

        .calendar-day:hover {
            background: rgba(149,101,255,0.3);
        }

        .calendar-day.calendar-today {
            border: 2px solid #9565ff;
        }

        .calendar-day.calendar-active {
            background: rgba(22,163,112,0.3);
            border-color: #34d399;
        }

        .calendar-day.calendar-selected {
            outline: 2px solid #c4a5ff;
            outline-offset: 2px;
        }

        .calendar-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
            color: #c9c4df;
            font-size: 13px;
        }

        .calendar-legend span {
            display: flex;
            align-items: center;
            gap: 7px;
        }

        .calendar-legend i {
            width: 11px;
            height: 11px;
            display: inline-block;
            border-radius: 50%;
        }

        .legend-today {
            background: #9565ff;
        }

        .legend-active {
            background: #34d399;
        }

        .calendar-details {
            margin-top: 25px;
            padding: 22px;
            border-radius: 16px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
        }

        .calendar-details h3 {
            color: #d9c5ff;
            margin-bottom: 15px;
        }

        .calendar-details p {
            color: #c9c4df;
            line-height: 1.7;
            overflow-wrap: anywhere;
        }

        .calendar-detail-stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin: 18px 0;
        }

        .calendar-detail-stats div {
            padding: 15px 8px;
            border-radius: 12px;
            text-align: center;
            background: rgba(149,101,255,0.12);
        }

        .calendar-detail-stats strong,
        .calendar-detail-stats span {
            display: block;
        }

        .calendar-detail-stats strong {
            color: #c4a5ff;
            font-size: 20px;
            overflow-wrap: anywhere;
        }

        .calendar-detail-stats span {
            color: #c9c4df;
            font-size: 12px;
            margin-top: 6px;
        }

        .calendar-note-area {
            margin-top: 25px;
        }

        .calendar-note-area label {
            display: block;
            color: #d9c5ff;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .calendar-note-area textarea {
            width: 100%;
            resize: vertical;
            padding: 14px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.07);
            color: white;
            font: inherit;
            line-height: 1.5;
        }

        .calendar-note-area textarea:focus {
            outline: 2px solid #9565ff;
        }

        .calendar-note-area p {
            color: #86efac;
            margin-top: 8px;
            font-size: 13px;
        }

        @media (max-width: 500px) {
            .calendar-weekdays,
            .calendar-grid {
                gap: 4px;
            }

            .calendar-day {
                border-radius: 8px;
                font-size: 12px;
            }

            .calendar-detail-stats {
                gap: 6px;
            }

            .calendar-detail-stats div {
                padding: 12px 4px;
            }

            .calendar-detail-stats strong {
                font-size: 16px;
            }

            .calendar-detail-stats span {
                font-size: 10px;
            }
        }
    `;

    document.head.appendChild(calendarStyle);

    renderCalendar();
    showSelectedDate();

})();
