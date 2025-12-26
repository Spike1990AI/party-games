// Game state
let questions = [];
let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let timeLeft = 20;
let timerInterval;
let questionStartTime;
let answerTimes = [];

// DOM elements
const loadingScreen = document.getElementById('loadingScreen');
const gameScreen = document.getElementById('gameScreen');
const resultsScreen = document.getElementById('resultsScreen');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const questionNumber = document.getElementById('questionNumber');
const timerDisplay = document.getElementById('timer');
const categoryDisplay = document.getElementById('category');
const questionDisplay = document.getElementById('question');
const answersContainer = document.getElementById('answersContainer');
const feedback = document.getElementById('feedback');

// Get player settings
const playerName = localStorage.getItem('playerName') || 'Player';
const difficulty = localStorage.getItem('difficulty') || 'medium';
const category = localStorage.getItem('category') || 'any';

// Fetch questions from Open Trivia DB
async function fetchQuestions() {
    const amount = 10;
    const categoryParam = category !== 'any' ? `&category=${category}` : '';
    const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}${categoryParam}&type=multiple`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.response_code === 0) {
            questions = data.results.map(q => {
                // Decode HTML entities
                const decoded = {
                    category: decodeHTML(q.category),
                    question: decodeHTML(q.question),
                    correct: decodeHTML(q.correct_answer),
                    incorrect: q.incorrect_answers.map(a => decodeHTML(a))
                };

                // Shuffle answers
                const allAnswers = [...decoded.incorrect, decoded.correct];
                shuffleArray(allAnswers);

                return {
                    category: decoded.category,
                    question: decoded.question,
                    answers: allAnswers,
                    correct: decoded.correct
                };
            });

            startGame();
        } else {
            showError('Failed to load questions. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please check your connection.');
    }
}

// Decode HTML entities
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Show error message
function showError(message) {
    loadingScreen.innerHTML = `
        <h2 style="color: #f44336;">⚠️ Error</h2>
        <p>${message}</p>
        <button onclick="location.href='index.html'" class="btn-primary" style="margin-top: 20px;">
            Back to Home
        </button>
    `;
}

// Start game
function startGame() {
    loadingScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    playerNameDisplay.textContent = playerName;
    showQuestion();
}

// Show current question
function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentQuestion];

    questionNumber.textContent = `${currentQuestion + 1}/${questions.length}`;
    categoryDisplay.textContent = q.category;
    questionDisplay.textContent = q.question;

    // Clear previous answers and feedback
    answersContainer.innerHTML = '';
    feedback.classList.add('hidden');

    // Create answer buttons (multi-select enabled)
    q.answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.dataset.answer = answer;
        btn.addEventListener('click', () => toggleAnswer(btn));
        answersContainer.appendChild(btn);
    });

    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.id = 'submitAnswerBtn';
    submitBtn.className = 'submit-answer-btn';
    submitBtn.textContent = '✓ Submit Answer';
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', submitAnswers);
    answersContainer.appendChild(submitBtn);

    // Start timer
    timeLeft = 20;
    questionStartTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 5) {
        timerDisplay.classList.add('warning');
    } else {
        timerDisplay.classList.remove('warning');
    }

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timeOut();
    } else {
        timeLeft--;
    }
}

// Toggle answer selection (multi-select)
function toggleAnswer(btn) {
    btn.classList.toggle('selected');

    // Enable submit button if at least one answer selected
    const selectedAnswers = answersContainer.querySelectorAll('.answer-btn.selected');
    const submitBtn = document.getElementById('submitAnswerBtn');
    submitBtn.disabled = selectedAnswers.length === 0;
}

// Submit selected answers
function submitAnswers() {
    clearInterval(timerInterval);

    const answerTime = Math.round((Date.now() - questionStartTime) / 1000);
    answerTimes.push(answerTime);

    const q = questions[currentQuestion];
    const selectedBtns = answersContainer.querySelectorAll('.answer-btn.selected');
    const selectedAnswers = Array.from(selectedBtns).map(btn => btn.dataset.answer);

    // Check if correct answer is selected
    const isCorrect = selectedAnswers.includes(q.correct) && selectedAnswers.length === 1;

    // Disable all buttons and submit button
    const allBtns = answersContainer.querySelectorAll('.answer-btn');
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === q.correct) {
            btn.classList.add('correct');
        }
    });
    document.getElementById('submitAnswerBtn').disabled = true;

    // Mark selected answers
    selectedBtns.forEach(btn => {
        if (!btn.classList.contains('correct')) {
            btn.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        correctCount++;

        // Calculate points: base 100 + time bonus (max 100)
        const timeBonus = Math.round((timeLeft / 20) * 100);
        const points = 100 + timeBonus;
        score += points;

        feedback.textContent = `✓ Correct! +${points} points`;
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `✗ Wrong! The answer was: ${q.correct}`;
        feedback.className = 'feedback incorrect';
    }

    feedback.classList.remove('hidden');
    scoreDisplay.textContent = `${score} pts`;

    // Next question after delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2500);
}

// Handle timeout
function timeOut() {
    const q = questions[currentQuestion];
    answerTimes.push(20);

    // Show correct answer
    const allBtns = answersContainer.querySelectorAll('.answer-btn');
    allBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === q.correct) {
            btn.classList.add('correct');
        }
    });

    feedback.textContent = `⏱️ Time's up! The answer was: ${q.correct}`;
    feedback.className = 'feedback incorrect';
    feedback.classList.remove('hidden');

    // Next question after delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2500);
}

// Show results
function showResults() {
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    document.getElementById('playerFinalName').textContent = playerName;
    document.getElementById('finalScore').textContent = `${score} points`;
    document.getElementById('correctAnswers').textContent = `${correctCount}/${questions.length} correct`;

    // Calculate stats
    const validTimes = answerTimes.filter(t => t < 20);
    const avgTime = validTimes.length > 0
        ? (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(1)
        : '-';
    const fastestTime = validTimes.length > 0
        ? Math.min(...validTimes)
        : '-';

    document.getElementById('avgTime').textContent = avgTime !== '-' ? `${avgTime}s` : '-';
    document.getElementById('fastestTime').textContent = fastestTime !== '-' ? `${fastestTime}s` : '-';

    // Save high score
    const highScore = localStorage.getItem('highScore') || 0;
    if (score > highScore) {
        localStorage.setItem('highScore', score);
        localStorage.setItem('highScoreName', playerName);
    }
}

// Play again button
document.getElementById('playAgainBtn').addEventListener('click', () => {
    location.reload();
});

// Home button
document.getElementById('homeBtn').addEventListener('click', () => {
    location.href = 'index.html';
});

// Start fetching questions
fetchQuestions();
