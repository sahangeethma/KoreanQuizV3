// Get references to the necessary HTML elements
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const directionButton = document.getElementById("direction-button");
const settingButton = document.getElementById("setting-button");
const adminElement = document.getElementById("admin");

// Initialize the quiz data, score, and direction
let vocabularyData = [];
let correctCount = 0;
let wrongCount = 0;
let quizDirection = "korean-to-sinhalese"; // or "sinhalese-to-korean"
let adminPassword = "admin"; // Default admin password
let randomIndex;
let currentWord;
let incorrectAnswerIndexes = [];

// Fetch the vocabulary data from the JSON file
fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    vocabularyData = data;
    loadQuiz();
  })
  .catch((error) => {
    console.error("Error fetching words:", error);
  });

// Function to load a new quiz question
function loadQuiz() {
  showElement("quiz-container");
  hideElement("admin");

  // Ensure we don't select the same word or the words before/after it
  do {
    randomIndex = Math.floor(Math.random() * vocabularyData.length);
    currentWord = vocabularyData[randomIndex];
  } while (
    randomIndex === 0 ||
    randomIndex === vocabularyData.length - 1 ||
    currentWord === vocabularyData[randomIndex - 1] ||
    currentWord === vocabularyData[randomIndex + 1]
  );

  // Prepare the question and answer options
  if (quizDirection === "korean-to-sinhalese") {
    questionElement.innerHTML = `<span class="korean-word fw-bold fs-1">${currentWord.korean}</span><br>Translate this Korean word:`;
  } else {
    questionElement.innerHTML = `<span class="sinhalese-word fw-bold fs-1">${currentWord.sinhalese}</span><br>Translate this Sinhalese word:`;
  }

  // Get the correct answer and 3 random incorrect answers
  const correctAnswer =
    quizDirection === "korean-to-sinhalese"
      ? currentWord.sinhalese
      : currentWord.korean;
  const incorrectAnswers = [];
  let i = 0;
  while (incorrectAnswers.length < 3) {
    const randomIndex = Math.floor(Math.random() * vocabularyData.length);
    const word = vocabularyData[randomIndex];
    const answer =
      quizDirection === "korean-to-sinhalese" ? word.sinhalese : word.korean;
    if (answer !== correctAnswer && !incorrectAnswers.includes(answer)) {
      incorrectAnswers.push(answer);
    }
    i++;
    if (i > 100) {
      // Prevent an infinite loop in case there are not enough unique incorrect answers
      break;
    }
  }

  const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
    () => Math.random() - 0.5
  );

  // Create the answer buttons
  answersElement.innerHTML = "";
  const answerButtonsContainer = document.createElement("div");
  answerButtonsContainer.classList.add(
    "row",
    "row-cols-1",
    "row-cols-lg-2",
    "g-2"
  );

  allAnswers.forEach((answer) => {
    const answerBtn = document.createElement("div");
    answerBtn.classList.add("col");
    answerBtn.innerHTML = `<button class="btn btn-lg btn-outline-dark w-100 mb-2">${answer}</button>`;
    answerBtn
      .querySelector("button")
      .addEventListener("click", () => checkAnswer(correctAnswer, answer));
    answerButtonsContainer.appendChild(answerBtn);
  });

  answersElement.appendChild(answerButtonsContainer);

  // Reset the result
  resultElement.textContent = "";

  // Update the score display
  scoreElement.textContent = `Score: ${correctCount} / ${
    correctCount + wrongCount
  } (${((correctCount / (correctCount + wrongCount)) * 100).toFixed(2)} %)`;

  // Update the direction button text
  directionButton.textContent =
    quizDirection === "korean-to-sinhalese" ? "සිං > 한" : "한 > සිං";
}

// Update the displayVocabularyData function to clear previous content
function displayVocabularyData() {
  const wordListDiv = document.getElementById("wordList");
  wordListDiv.innerHTML = ""; // Clear existing content

  vocabularyData.forEach((item) => {
    const wordRow = document.createElement("div");
    wordRow.classList.add("row", "mb-2");

    const koreanWordCol = document.createElement("div");
    koreanWordCol.classList.add("col-5", "text-start");
    koreanWordCol.textContent = item.korean;

    const sinhalseWordCol = document.createElement("div");
    sinhalseWordCol.classList.add("col-5", "text-start");
    sinhalseWordCol.textContent = item.sinhalese;

    const actionCol = document.createElement("div");
    actionCol.classList.add("col-2", "text-end");

    wordRow.appendChild(koreanWordCol);
    wordRow.appendChild(sinhalseWordCol);
    wordListDiv.appendChild(wordRow);
  });
}

function checkPassword() {
  const password = document.getElementById("password").value;
  if (password === adminPassword) {
    showAdmin();
  } else {
    alert("Incorrect password. Please try again.");
  }
}

function showAdmin() {
  showElement("admin");
  hideElement("quiz-container");

  displayVocabularyData();
}

function logout() {
  showElement("quiz-container");
  hideElement("admin");
  correctCount = 0;
  wrongCount = 0;
}

// Function to check the user's answer
function checkAnswer(correctAnswer, userAnswer) {
  const answerButtons = document.querySelectorAll("#answers button");

  if (userAnswer === correctAnswer) {
    correctCount++;
    answerButtons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct-answer");
      } else {
        btn.classList.add("wrong-answer");
      }
    });
    resultElement.textContent = "Correct!";
    setTimeout(loadQuiz, 100);
  } else {
    wrongCount++;
    answerButtons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct-answer");
      }
      btn.classList.add("wrong-answer");
    });
    resultElement.textContent = "Incorrect. Try again.";
    setTimeout(loadQuiz, 1000);
  }

  // Disable all answer buttons to prevent further submissions
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });
}

// Add event listeners
directionButton.addEventListener("click", () => {
  quizDirection =
    quizDirection === "korean-to-sinhalese"
      ? "sinhalese-to-korean"
      : "korean-to-sinhalese";
  loadQuiz();
});

settingButton.addEventListener("click", () => {
  showAdmin();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  logout();
});

document.getElementById("w2json-btn").addEventListener("click", () => {
  window.location.replace("https://sahangeethma.github.io/Vocabulary2Json/");
});

// Helper functions
function showElement(id) {
  document.getElementById(id).style.display = "block";
}

function hideElement(id) {
  document.getElementById(id).style.display = "none";
}
