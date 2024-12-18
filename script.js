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
    items: ["1-4. 안녕하세요", "5. 주말 잘 보내세요"],
  },
  {
    section: "Basic Life",
    disabled: true,
    items: [
      "6. 저는 투안입니다",
      "7. 여기가 사무실이에요",
      "8. 12시 30분에 점심을 먹어요",
      "9. 가족이 몇 명이에요?",
      "10. 어제 도서관에서 한국어를 공부했어요",
      "11. 사과 다섯 개 주세요",
      "12. 병원 옆에 약국이 있어요",
      "13. 시청 앞에서 일곱 시에 만나요",
      "14. 저는 비빔밥을 먹을래요",
      "15. 날씨가 맑아서 기분이 좋아요",
    ],
  },
  {
    section: "Daily and Leisure Life",
    disabled: true,
    items: [
      "16. 시간이 있을 때 주로 테니스를 치러 가요",
      "17. 휴가 때 제주도에 다녀올 거예요",
      "18. 버스나 지하철을 타고 가요",
      "19. 거기 한국가구지요?",
      "20. 저는 설거지를 할게요",
      "21. 상 차리는 것을 도와줄까요?",
      "22. 무단횡단을 하면 안 돼요",
      "23. 어르신께는 두 손으로 물건을 드려야 돼요",
      "24. 한국 영화를 보면서 공부해요",
      "25. 일요일마다 교회에 가요",
    ],
  },
  {
    section: "Public Institutions",
    disabled: true,
    items: [
      "26. 밥을 먹은 후에 이 약을 드세요",
      "27. 어디가 아프십니까?",
      "28. 통장을 만들려고 왔어요",
      "29. 필리핀으로 엽서를 보내고 싶은데요",
      "30. 거기에서 태권도를 배울 수 있어요?",
    ],
  },
  {
    section: "Understanding Korea",
    disabled: true,
    items: [
      "31. 우리 고향은 서울보다 공기가 맑아요",
      "32. 복날에는 삼계탕을 먹어요",
      "33. 송편을 만드는 체험도 할 수 있어요",
      "34. 아기 옷을 선물하는 게 어때요?",
      "35. 한국 드라마가 재미있잖아요",
    ],
  },
  {
    section: "Workplace Culture",
    disabled: true,
    items: [
      "36. 단정한 모습이 좋아 보여요",
      "37. 출입문은 꼭 닫읍시다",
      "38. 일할 맛이 나요",
      "39. 오늘 회식을 하자고 해요",
      "40. 불쾌감을 느꼈다면 그건 성희롱이에요",
    ],
  },
  {
    section: "Work Life",
    disabled: true,
    items: [
      "41. 드라이버로 해 보세요",
      "42. 이 기계 어떻게 작동하는지 알아요?",
      "43. 철근을 옮겨 놓으세요",
      "44. 페인트 작업을 했거든요",
      "45. 허리를 챙겼는데요",
      "46. 더 신경 쓰도록 하자",
      "47. 재고를 파악하는 것이 중요해요",
      "48. 다치지 않도록 조심하세요",
      "49. 안전화를 안 신으면 다칠 수 있어요",
      "50. 열심히 해 준 덕분이에요",
    ],
  },
  {
    section: "Laws and Regulations",
    disabled: true,
    items: [
      "51. 한국에 가서 일을 하고 싶은데요",
      "52. 근로 조건이 좋은 편이에요",
      "53. 외국인 등록을 하러 가요",
      "54. 보험금을 신청하려고 해요",
      "55. 급여 명세서를 확인해 보세요",
      "56. 이번 여름 휴가 계획은 세웠어요?",
      "57. 사업장을 변경하고 싶은데",
      "58. 체류 기간을 연장한 후에 꼭 신고해야 해",
    ],
  },
  {
    section: "Work Life Team",
    disabled: true,
    items: ["59. 산업 안전Ⅰ", "60. 산업 안전Ⅱ"],
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
