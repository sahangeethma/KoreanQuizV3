// Get references to the necessary HTML elements
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const resultElement = document.getElementById("result");
const scoreElement = document.getElementById("score");
const directionButton = document.getElementById("direction-button");
const settingButton = document.getElementById("setting-button");
const mainButtons = document.getElementById("main-buttons");
const adminButtons = document.getElementById("admin-buttons");
const adminElement = document.getElementById("admin");
const allOrEachLessonSwitch = document.getElementById("allOrEachLesson");
const manualSelectorDiv = document.getElementById("manualSelector");
const wordCategorySelect = document.getElementById("word-category");
const setButton = document.querySelector("#manualSelector .btn");

// Initialize the quiz data, score, and direction
let vocabularyData = [];
let activeVocabularyData = [];
let correctCount = 0;
let wrongCount = 0;
let quizDirection = "korean-to-sinhalese"; // or "sinhalese-to-korean"
let randomIndex;
let currentWord;

// Fetch and initialize data
fetch("words.json")
  .then((response) => response.json())
  .then((data) => {
    vocabularyData = data;
    activeVocabularyData = Object.values(vocabularyData).flat();
    loadQuiz();
  })
  .catch((error) => {
    console.error("Error fetching words:", error);
  });

// Function to update active vocabulary based on switch and selection
function updateActiveVocabularyData() {
  if (allOrEachLessonSwitch.checked) {
    // Single lesson mode
    const selectedLesson = wordCategorySelect.value;
    if (!selectedLesson) {
      alert("Please select a lesson first");
      return false;
    }
    activeVocabularyData = vocabularyData[selectedLesson] || [];
  } else {
    // All words mode
    activeVocabularyData = Object.values(vocabularyData).flat();
  }
  return true;
}

// Function to load a new quiz question
function loadQuiz() {
  showElement("quiz-container");
  showElement("main-buttons");
  hideElement("admin");
  hideElement("admin-buttons");
  hideElement("customize");

  // Check if we have enough words to create a quiz
  if (activeVocabularyData.length < 4) {
    questionElement.innerHTML =
      "Not enough words available for quiz. Please select a different lesson or switch to all words mode.";
    answersElement.innerHTML = "";
    return;
  }

  // Ensure we don't select the same word
  do {
    randomIndex = Math.floor(Math.random() * activeVocabularyData.length);
    currentWord = activeVocabularyData[randomIndex];
  } while (
    randomIndex === 0 ||
    randomIndex === activeVocabularyData.length - 1 ||
    currentWord === activeVocabularyData[randomIndex - 1] ||
    currentWord === activeVocabularyData[randomIndex + 1]
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
    const randomIndex = Math.floor(Math.random() * activeVocabularyData.length);
    const word = activeVocabularyData[randomIndex];
    const answer =
      quizDirection === "korean-to-sinhalese" ? word.sinhalese : word.korean;
    if (answer !== correctAnswer && !incorrectAnswers.includes(answer)) {
      incorrectAnswers.push(answer);
    }
    i++;
    if (i > 100) break;
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

  // Disable all answer buttons
  answerButtons.forEach((btn) => {
    btn.disabled = true;
  });
}

// Function to display vocabulary data in admin view
function displayVocabularyData() {
  const wordListDiv = document.getElementById("wordList");
  wordListDiv.innerHTML = "";

  Object.keys(vocabularyData).forEach((sectionTitle) => {
    const section = vocabularyData[sectionTitle];

    const sectionTitleRow = document.createElement("div");
    sectionTitleRow.classList.add("row", "mb-2", "fw-bold");
    sectionTitleRow.textContent = sectionTitle;

    wordListDiv.appendChild(sectionTitleRow);

    section.forEach((item, index) => {
      const wordRow = document.createElement("div");
      wordRow.classList.add("row", "mb-3");

      const indexItem = document.createElement("div");
      indexItem.classList.add("col-2");
      indexItem.textContent = index + 1;

      const koreanWordCol = document.createElement("div");
      koreanWordCol.classList.add("col-4", "text-start");
      koreanWordCol.textContent = item.korean;

      const sinhalseWordCol = document.createElement("div");
      sinhalseWordCol.classList.add("col-6", "text-start");
      sinhalseWordCol.textContent = item.sinhalese;

      wordRow.appendChild(indexItem);
      wordRow.appendChild(koreanWordCol);
      wordRow.appendChild(sinhalseWordCol);

      wordListDiv.appendChild(wordRow);
    });

    const hr = document.createElement("hr");
    hr.classList.add("my-3");
    wordListDiv.appendChild(hr);
  });
}

// Admin functions
function showAdmin() {
  showElement("admin");
  showElement("admin-buttons");
  hideElement("main-buttons");
  hideElement("quiz-container");
  hideElement("customize");

  displayVocabularyData();
}

function logout() {
  showElement("quiz-container");
  showElement("main-buttons");
  hideElement("admin");
  hideElement("admin-buttons");
  hideElement("customize");
  correctCount = 0;
  wrongCount = 0;
}

// Predefined categories for the dropdown
const categories = [
  {
    section: "Preparatory Lessons",
    disabled: true,
    items: ["1-4. Hello", "5. Have A Great Weekend"],
  },
  {
    section: "Basic Life",
    disabled: true,
    items: [
      "6. My Name Is Tuan",
      "7. This Is The Office",
      "8. I Have Lunch At 12:30 Pm",
      "9. How Many Family Members Do You Have?",
      "10. I Studied Korean At The Library Yesterday",
      "11. Please Give Me Five Apples",
      "12. There Is A Pharmacy Next To The Hospital",
      "13. Let's Meet In Front Of City Hall At 7 O'clock",
      "14. I Would Like To Have Bibimbap",
      "15. I Feel Good Because The Weather Is Clear And Sunny",
    ],
  },
  {
    section: "Daily and Leisure Life",
    disabled: true,
    items: [
      "16. I Usually Go Play Tennis When I Have Time",
      "17. I Will Go Visit Jejudo Over The Break",
      "18. I Go By Bus Or By Subway",
      "19. This Is Hangook Furniture, Isn't It?",
      "20. I’ll Wash The Dishes",
      "21. Would You Like Some Help Setting The Table?",
      "22. Do Not Jaywalk",
      "23. Use Both Hands When Giving Something To Your Elders",
      "24. I Watch Korean Movies To Study The Korean Language",
      "25. I Go To Church Every Sunday",
    ],
  },
  {
    section: "Public Institutions",
    disabled: true,
    items: [
      "26. Please Take This Medicine After A Meal",
      "27. Where Does It Hurt?",
      "28. I Came To Open A Bank Account",
      "29. I Would Like To Send A Postcard To The Philippines",
      "30. Can I Learn Taekwondo There?",
    ],
  },
  {
    section: "Understanding Korea",
    disabled: true,
    items: [
      "31. It's Much Fresher In My Hometown Than It Is In Seoul",
      "32. We Eat Samgyetang On The Hottest Day Of The Year In Summer",
      "33. You Can Try Making Songpyeon",
      "34. How About Giving Baby Clothes As A Gift?",
      "35. You Know That Korean Dramas Are Fun, Don't You?",
    ],
  },
  {
    section: "Workplace Culture",
    disabled: true,
    items: [
      "36. It's Good That You Look Neat And Tidy",
      "37. Keep The Entrance Closed",
      "38. I Like Working Here",
      "39. I Was Told That We Would Have A Company Dinner Today",
      "40. If You Felt Uncomfortable, Then That Was Sexual Harassment",
    ],
  },
  {
    section: "Work Life",
    disabled: true,
    items: [
      "41. Try A Screwdriver",
      "42. Do You Know How To Operate This Machine?",
      "43. Please Move The Rebar",
      "44. It's Because I Was Painting",
      "45. I Have My Hoe Ready",
      "46. Let's Keep An Eye On Them",
      "47. It's Important To Keep Track Of Stock",
      "48. Please Make Sure That You Don't Get Injured",
      "49. If You Don't Wear Safety Shoes, You May Get Injured",
      "50. You Should Take Credit For This",
    ],
  },
  {
    section: "Laws And Regulations",
    disabled: true,
    items: [
      "51. I Would Like To Work In Korea",
      "52. I Have Been Offered Pretty Decent Working Conditions",
      "53. I'm On My Way To Apply For Alien Registration",
      "54. I Plan To File An Insurance Claim",
      "55. Please Check Your Pay Stub",
      "56. Have You Planned Your Summer Vacation?",
      "57. I Would Like To Change My Work Location",
      "58. You Have To Report To The Office After Extending Your Stay",
    ],
  },
  {
    section: "Work Life Team",
    disabled: true,
    items: ["59. Industrial Safety I", "60. Industrial Safety II"],
  },
];

// Function to create category dropdown
function createCategoryDropdown() {
  const select = document.getElementById("word-category");

  categories.forEach((section) => {
    const sectionOption = document.createElement("option");
    sectionOption.textContent = section.section;
    sectionOption.disabled = section.disabled;
    sectionOption.style.fontWeight = "bold";
    select.appendChild(sectionOption);

    section.items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  });
}

// Helper functions
function showElement(id) {
  document.getElementById(id).style.display = "block";
}

function hideElement(id) {
  document.getElementById(id).style.display = "none";
}

// Event Listeners
directionButton.addEventListener("click", () => {
  quizDirection =
    quizDirection === "korean-to-sinhalese"
      ? "sinhalese-to-korean"
      : "korean-to-sinhalese";

  if (quizDirection === "korean-to-sinhalese") {
    directionButton.classList.remove("btn-primary");
    directionButton.classList.add("btn-outline-primary");
  } else {
    directionButton.classList.remove("btn-outline-primary");
    directionButton.classList.add("btn-primary");
  }

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

document.getElementById("custom-button").addEventListener("click", () => {
  var cuzDiv = document.getElementById("customize");
  if (cuzDiv.style.display == "none") {
    cuzDiv.style.display = "block";
  } else {
    cuzDiv.style.display = "none";
  }
});

// Switch and Set button event listeners
allOrEachLessonSwitch.addEventListener("change", () => {
  if (allOrEachLessonSwitch.checked) {
    manualSelectorDiv.style.display = "block";
  } else {
    manualSelectorDiv.style.display = "none";
    correctCount = 0;
    wrongCount = 0;
    updateActiveVocabularyData();
    loadQuiz();
  }
});

setButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (allOrEachLessonSwitch.checked) {
    if (updateActiveVocabularyData()) {
      correctCount = 0;
      wrongCount = 0;
      loadQuiz();
    }
  }
});

// Initialize the UI
window.onload = function () {
  showElement("quiz-container");
  showElement("main-buttons");
  hideElement("admin");
  hideElement("admin-buttons");
  hideElement("customize");
  createCategoryDropdown();
};
