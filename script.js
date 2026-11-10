
/* =================================
   STUDYSPACE - COMPLETE JAVASCRIPT
================================= */


/* =================================
   DATE AND MOTIVATIONAL QUOTE
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
    "Every day is a new opportunity to learn."
];

const welcomeSection = document.querySelector(".welcome");

if (welcomeSection) {

    const dateElement = document.createElement("p");

    dateElement.textContent = "📅 " + currentDate;
    dateElement.style.marginTop = "18px";

    welcomeSection.appendChild(dateElement);

    const quoteElement = document.createElement("p");

    quoteElement.textContent =
        "✨ " + quotes[
            Math.floor(Math.random() * quotes.length)
        ];

    quoteElement.style.marginTop = "12px";

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
   EXAM COUNTDOWN
================================= */

const examName = document.getElementById("examName");

const examDate = document.getElementById("examDate");

const saveExamButton = document.getElementById("saveExam");

const examResult = document.getElementById("examResult");


let exams = JSON.parse(
    localStorage.getItem("studyspace_exams")
) || [];


function saveExams() {

    localStorage.setItem(
        "studyspace_exams",
        JSON.stringify(exams)
    );

}


function displayExams() {

    examResult.innerHTML = "";

    if (exams.length === 0) {

        examResult.textContent =
            "No upcoming exam added yet.";

        return;

    }


    exams.forEach(function (exam, index) {

        const examCard = document.createElement("div");

        examCard.style.padding = "15px";

        examCard.style.marginBottom = "12px";

        examCard.style.background =
            "rgba(255,255,255,0.06)";

        examCard.style.borderRadius = "10px";


        const name = document.createElement("h3");

        name.textContent = "📚 " + exam.name;


        const countdown = document.createElement("p");

        const examDay = new Date(
            exam.date + "T00:00:00"
        );

        const currentDay = new Date();

        currentDay.setHours(0, 0, 0, 0);


        const difference = Math.ceil(

            (examDay - currentDay) /

            (1000 * 60 * 60 * 24)

        );


        if (difference > 0) {

            countdown.textContent =
                difference + " days remaining!";

        } else if (difference === 0) {

            countdown.textContent =
                "Your exam is today!";

        } else {

            countdown.textContent =
                "This exam date has passed.";

        }


        const dateText = document.createElement("p");

        dateText.textContent =
            "Exam Date: " + exam.date;


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


// SAVE EXAM BUTTON

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


/* =================================
   INITIALISE WEBSITE
================================= */

displayGoals();

displayTimer();

displayExams();

updateStats();
