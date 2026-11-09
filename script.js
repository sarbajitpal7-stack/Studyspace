
/* =================================
   STUDYSPACE - JAVASCRIPT
================================= */

// Display the current date

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

// Display a motivational quote

const quotes = [
    "Small steps lead to big achievements.",
    "Believe in yourself and keep learning.",
    "Your future is created by what you do today.",
    "Stay focused and never stop improving.",
    "Every day is a new opportunity to learn."
];

const randomNumber = Math.floor(
    Math.random() * quotes.length
);

const selectedQuote = quotes[randomNumber];

// Add date and quote to the welcome section

const welcomeSection = document.querySelector(".welcome");

if (welcomeSection) {

    const dateElement = document.createElement("p");

    dateElement.textContent = "📅 " + currentDate;

    dateElement.style.marginTop = "18px";

    welcomeSection.appendChild(dateElement);

    const quoteElement = document.createElement("p");

    quoteElement.textContent = "✨ " + selectedQuote;

    quoteElement.style.marginTop = "12px";

    welcomeSection.appendChild(quoteElement);
}
