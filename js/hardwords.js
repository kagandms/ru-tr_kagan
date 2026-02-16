/**
 * Zor Kelimeler Modu
 * Sadece yanlış cevaplanan kelimeleri çalıştırır
 */

class HardWordsMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.correctCount = 0;
    }

    getHardWords() {
        const stats = app.stats.wordProgress;
        return WORDS.filter(word => {
            const progress = stats[word.id];
            return progress && progress.wrong > 0;
        }).sort((a, b) => {
            // En çok yanlış yapılanlar önce
            const aWrong = stats[a.id]?.wrong || 0;
            const bWrong = stats[b.id]?.wrong || 0;
            return bWrong - aWrong;
        });
    }

    init(questionCount = null) {
        this.correctCount = 0;
        let hardWords = this.getHardWords();

        if (hardWords.length === 0) {
            this.showNoHardWords();
            return;
        }

        // Slice first (keep most-missed words), then shuffle the selection
        if (questionCount && questionCount < hardWords.length) {
            hardWords = hardWords.slice(0, questionCount);
        }
        hardWords = app.shuffleArray(hardWords);

        this.words = hardWords;
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.setupEventListeners();
        this.showQuestion();
        this.updateScore();
    }

    showNoHardWords() {
        document.getElementById('hardwordsEmpty').classList.remove('hidden');
        document.getElementById('hardwordsContainer').classList.add('hidden');
    }

    setupEventListeners() {
        document.getElementById('hardwordsNext').onclick = () => this.nextQuestion();

        document.getElementById('hardwordsFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };
    }

    showQuestion() {
        document.getElementById('hardwordsEmpty').classList.add('hidden');
        document.getElementById('hardwordsContainer').classList.remove('hidden');

        const word = this.words[this.currentIndex];
        if (!word) return;

        this.answered = false;

        document.getElementById('hardwordsWord').textContent = word.russian;
        document.getElementById('hardwordsExample').textContent = word.example.russian;

        const options = this.generateOptions(word);
        const container = document.getElementById('hardwordsOptions');
        container.innerHTML = '';

        options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt.turkish;
            btn.dataset.correct = opt.id === word.id;
            btn.onclick = () => this.selectOption(btn, word);
            container.appendChild(btn);
        });

        document.getElementById('hardwordsFeedback').classList.add('hidden');
        this.updateFavoriteButton();
        this.updateProgress();
    }

    generateOptions(correctWord) {
        const wrongs = app.getRandomWords(3, correctWord.id, correctWord.turkish);
        const options = [correctWord, ...wrongs];
        return app.shuffleArray(options);
    }

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('hardwordsFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('hardwordsFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    async selectOption(btn, correctWord) {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = btn.dataset.correct === 'true';

        document.querySelectorAll('#hardwordsOptions .quiz-option').forEach(opt => {
            opt.classList.add('disabled');
            if (opt.dataset.correct === 'true') {
                opt.classList.add('correct');
            }
        });

        const feedbackText = document.getElementById('hardwordsFeedbackText');

        if (isCorrect) {
            btn.classList.add('correct');
            this.score += 10;
            this.correctCount++;
            feedbackText.textContent = '✅ Doğru!';
        } else {
            btn.classList.add('wrong');
            await app.showWrongFeedback(feedbackText, correctWord.turkish, correctWord);
        }

        app.recordAnswer(correctWord.id, isCorrect);
        this.updateScore();

        document.getElementById('hardwordsFeedback').classList.remove('hidden');
    }

    nextQuestion() {
        this.currentIndex++;

        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        this.showQuestion();
    }

    updateScore() {
        document.getElementById('hardwordsScore').textContent = this.score;
    }

    updateProgress() {
        document.getElementById('hardwordsCurrent').textContent = this.currentIndex + 1;
        document.getElementById('hardwordsTotal').textContent = this.words.length;
    }
}

window.hardWordsMode = new HardWordsMode();
