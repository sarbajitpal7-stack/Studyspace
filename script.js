
/* =================================
   STUDYSPACE - COMPLETE JAVASCRIPT
================================= */

// DATE AND MOTIVATIONAL QUOTE

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
    "Every day is a new opportunity to learn."
];

const welcomeSection = document.querySelector(".welcome");

if (welcomeSection) {
    const dateElement = document.createElement("p");
    dateElement.textContent = "📅 " + currentDate;
    dateElement.style.marginTop = "18px";
    welcomeSection.appendChild(dateElement);

    const quoteElement = document.createElement("p");
    quoteElement.textContent = "✨ " + quotes[
        Math.floor(Math.random() * quotes.length)
    ];
    quoteElement.style.marginTop = "12px";
    welcomeSection.appendChild(quoteElement);
}


// DAILY DATA STORAGE

const todayKey = new Date().toLocaleDateString("en-CA");

const storageKey = "studyspace_" + todayKey;

let dailyData = JSON.parse(localStorage.getItem(storageKey)) || {
    goals: [],
    studySeconds: 0,
    sessions: 0
};

function saveDailyData() {
    localStorage.setItem(storageKey, JSON.stringify(dailyData));
}


// DASHBOARD STATISTICS

function updateStats() {
    document.getElementById("totalStudy").textContent =
        Math.floor(dailyData.studySeconds / 60) + " min";

    document.getElementById("completedGoals").textContent =
        dailyData.goals.filter(goal => goal.completed).length;

    document.getElementById("sessions").textContent =
        dailyData.sessions;
}


// DAILY GOALS

const goalInput = document.getElementById("goalInput");
const addGoalButton = document.getElementById("addGoal");
const goalList = document.getElementById("goalList");

function displayGoals() {
    goalList.innerHTML = "";

    dailyData.goals.forEach((goal, index) => {
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

addGoalButton.addEventListener("click", addGoal);

goalInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        addGoal();
    }
});


// POMODORO STUDY TIMER

const timerDisplay = document.getElementById("timerDisplay");
const startButton = document.getElementById("startTimer");
const pauseButton = document.getElementById("pauseTimer");
const resetButton = document.getElementById("resetTimer");
const timerNote = document.querySelector(".timer-note");

const studyDuration = 25 * 60;
const breakDuration = 5 * 60;

let remainingTime = studyDuration;
let timerInterval = null;
let isBreak = false;

function displayTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {
    if (timerInterval !== null) return;

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

            if (!isBreak) {
                dailyData.sessions++;
                saveDailyData();
                updateStats();

                alert("Great work! Study session completed. Time for a 5-minute break.");

                isBreak = true;
                remainingTime = breakDuration;
                timerNote.textContent = "Break time! Relax for 5 minutes.";
            } else {
                alert("Break completed! Ready for another study session?");

                isBreak = false;
                remainingTime = studyDuration;
                timerNote.textContent = "25 minutes study • 5 minutes break";
            }

            displayTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    pauseTimer();

    isBreak = false;
    remainingTime = studyDuration;

    timerNote.textContent = "25 minutes study • 5 minutes break";

    displayTimer();
}

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);


// EXAM COUNTDOWN

const examName = document.getElementById("examName");
const examDate = document.getElementById("examDate");
const saveExamButton = document.getElementById("saveExam");
const examResult = document.getElementById("examResult");

let exams = JSON.parse(localStorage.getItem("studyspace_exams")) || [];

function saveExams() {
    localStorage.setItem("studyspace_exams", JSON.stringify(exams));
}

function displayExams() {
    examResult.innerHTML = "";

    if (exams.length === 0) {
        examResult.textContent = "No upcoming exam added yet.";
        return;
    }

    exams.forEach(function (exam, index) {
        const examCard = document.createElement("div");

        examCard.style.padding = "15px";
        examCard.style.marginBottom = "12px";
        examCard.style.background = "rgba(255,255,255,0.06)";
        examCard.style.borderRadius = "10px";

        const name = document.createElement("h3");
        name.textContent = "📚 " + exam.name;

        const countdown = document.createElement("p");

        const examDay = new Date(exam.date + "T00:00:00");
        const currentDay = new Date();
        currentDay.setHours(0, 0, 0, 0);

        const difference = Math.ceil(
            (examDay - currentDay) / (1000 * 60 * 60 * 24)
        );

        if (difference > 0) {
            countdown.textContent = difference + " days remaining!";
        } else if (difference === 0) {
            countdown.textContent = "Your exam is today!";
        } else {
            countdown.textContent = "This exam date has passed.";
        }

        const dateText = document.createElement("p");
        dateText.textContent = "Exam Date: " + exam.date;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Exam";

        deleteButton.style.marginTop = "10px";

        deleteButton.addEventListener("click", function () {
            exams.splice(index, 1);
            saveExams();
            displayExams();
        });

        examCard.appendChild(name);
        examCard.appendChild(countdown);
        examCard.appendChild(dateText);
        examCard.appendChild(deleteButton);

        examResult.appendChild(examCard);
    });
}

saveExamButton.addEventListener("click", function () {
    const name = examName.value.trim();
    const date = examDate.value;

    if (name === "" || date === "") {
        alert("Please enter the exam name and date!");
        return;
    }

    exams.push({
        name: name,
        date: date
    });

    saveExams();

    examName.value = "";
    examDate.value = "";

    displayExams();
});


// INITIALISE WEBSITE

displayGoals();
displayTimer();
displayExams();
updateStats();

/* DAILY GOALS IMPROVEMENT */

#goalList li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
}

#goalList input[type="checkbox"] {
    width: 18px;
    height: 18px;
    padding: 0;
    margin: 0;
    accent-color: #a78bfa;
    cursor: pointer;
    flex-shrink: 0;
}

#goalList span {
    flex: 1;
    color: #e5defa;
    overflow-wrap: anywhere;
}

#goalList button {
    background: #dc4565;
    padding: 9px 14px;
    margin: 0;
    flex-shrink: 0;
}

