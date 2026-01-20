/**
 * Quiz Modu
 */

class QuizMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
    }

    init() {
        this.words = app.shuffleArray([...WORDS]);
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.setupEventListeners();
        this.showQuestion();
        this.updateScore();
    }

    setupEventListeners() {
        document.getElementById('quizNext').onclick = () => this.nextQuestion();
    }

    showQuestion() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        this.answered = false;

        // Soru
        document.getElementById('quizWord').textContent = word.russian;
        document.getElementById('quizExample').textContent = word.example.russian;

        // Seçenekler oluştur
        const options = this.generateOptions(word);
        const container = document.getElementById('quizOptions');
        container.innerHTML = '';

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt.turkish;
            btn.dataset.correct = opt.id === word.id;
            btn.onclick = () => this.selectOption(btn, word.id);
            container.appendChild(btn);
        });

        // Geri bildirimi gizle
        document.getElementById('quizFeedback').classList.add('hidden');
    }

    generateOptions(correctWord) {
        // Doğru cevap + 3 yanlış
        const wrongs = app.getRandomWords(3, correctWord.id);
        const options = [correctWord, ...wrongs];
        return app.shuffleArray(options);
    }

    selectOption(btn, correctId) {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = btn.dataset.correct === 'true';

        // Tüm butonları devre dışı bırak
        document.querySelectorAll('.quiz-option').forEach(opt => {
            opt.classList.add('disabled');
            if (opt.dataset.correct === 'true') {
                opt.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.score += 10;
            document.getElementById('quizFeedbackText').textContent = '✅ Doğru!';
        } else {
            btn.classList.add('wrong');
            document.getElementById('quizFeedbackText').textContent = '❌ Yanlış!';
        }

        app.recordAnswer(correctId, isCorrect);
        this.updateScore();

        // Geri bildirimi göster
        document.getElementById('quizFeedback').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex >= this.words.length) {
            this.words = app.shuffleArray([...WORDS]);
            this.currentIndex = 0;
        }
        this.showQuestion();
    }

    updateScore() {
        document.getElementById('quizScore').textContent = this.score;
    }
}

window.quizMode = new QuizMode();
