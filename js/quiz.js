/**
 * Quiz Modu
 */

class QuizMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.questionCount = null;
        this.correctCount = 0;
    }

    init(questionCount = null) {
        this.questionCount = questionCount;
        this.correctCount = 0;
        let allWords = app.shuffleArray([...WORDS]);

        // Soru sayısını sınırla
        if (questionCount && questionCount < allWords.length) {
            allWords = allWords.slice(0, questionCount);
        }

        this.words = allWords;
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.setupEventListeners();
        this.showQuestion();
        this.updateScore();
    }

    setupEventListeners() {
        document.getElementById('quizNext').onclick = () => this.nextQuestion();

        // Favori butonu
        document.getElementById('quizFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };
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
            btn.onclick = () => this.selectOption(btn, word);
            container.appendChild(btn);
        });

        // Geri bildirimi gizle
        document.getElementById('quizFeedback').classList.add('hidden');

        // Favori butonunu güncelle
        this.updateFavoriteButton();
    }

    generateOptions(correctWord) {
        // Doğru cevap + 3 yanlış
        const wrongs = app.getRandomWords(3, correctWord.id);
        const options = [correctWord, ...wrongs];
        return app.shuffleArray(options);
    }

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('quizFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('quizFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    async selectOption(btn, correctWord) {
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

        const feedbackText = document.getElementById('quizFeedbackText');

        if (isCorrect) {
            btn.classList.add('correct');
            this.score += 10;
            this.correctCount++;
            feedbackText.textContent = '✅ Doğru!';
        } else {
            btn.classList.add('wrong');
            feedbackText.innerHTML = '❌ Yanlış!<br><br>🔄 AI açıklıyor...';

            // AI açıklaması al
            if (window.aiManager) {
                const aiResult = await window.aiManager.explainWord(correctWord);
                if (aiResult) {
                    feedbackText.innerHTML = `❌ Yanlış! Doğru: <strong>${correctWord.turkish}</strong><br><br>🤖 ${aiResult}`;
                } else {
                    feedbackText.innerHTML = `❌ Yanlış! Doğru: <strong>${correctWord.turkish}</strong>`;
                }
            }
        }

        app.recordAnswer(correctWord.id, isCorrect);
        this.updateScore();

        // Geri bildirimi göster
        document.getElementById('quizFeedback').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;

        // Tamamlandı mı kontrol et
        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        this.showQuestion();
    }

    updateScore() {
        document.getElementById('quizScore').textContent = this.score;
    }
}

window.quizMode = new QuizMode();
