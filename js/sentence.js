/**
 * Cümle İçinde Kullanım Modu
 * Kelimeleri cümle içinde doğru kullanmayı öğretir
 */

class SentenceMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.correctCount = 0;
        this.questionCount = null;
    }

    // Basit cümle şablonları
    getSentenceTemplates() {
        return [
            { ru: "Я хочу сказать ___.", tr: "___ demek istiyorum." },
            { ru: "Это означает ___.", tr: "Bu ___ demek." },
            { ru: "Мне нужно ___.", tr: "___ ihtiyacım var." },
            { ru: "Я думаю о ___.", tr: "___ hakkında düşünüyorum." },
            { ru: "Можно ___?", tr: "___ olur mu?" },
            { ru: "Я люблю ___.", tr: "___ seviyorum." },
            { ru: "Где находится ___?", tr: "___ nerede?" },
            { ru: "Это очень ___.", tr: "Bu çok ___." },
            { ru: "Я вижу ___.", tr: "___ görüyorum." },
            { ru: "Дайте мне ___.", tr: "Bana ___ verin." }
        ];
    }

    init(questionCount = null) {
        this.questionCount = questionCount;
        this.correctCount = 0;
        let allWords = app.shuffleArray([...WORDS]);

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
        document.getElementById('sentenceNext').onclick = () => this.nextQuestion();

        document.getElementById('sentenceFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };
    }

    showQuestion() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        this.answered = false;

        // Rastgele bir şablon seç
        const templates = this.getSentenceTemplates();
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Cümleyi oluştur
        const sentenceRu = template.ru.replace('___', '______');
        const sentenceTr = template.tr.replace('___', '______');

        document.getElementById('sentenceRussian').textContent = sentenceRu;
        document.getElementById('sentenceTurkish').textContent = sentenceTr;
        document.getElementById('sentenceHint').textContent = `İpucu: ${word.russian}`;

        // Seçenekler oluştur
        const options = this.generateOptions(word);
        const container = document.getElementById('sentenceOptions');
        container.innerHTML = '';

        options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.innerHTML = `<span class="opt-ru">${opt.russian}</span><span class="opt-tr">${opt.turkish}</span>`;
            btn.dataset.correct = opt.id === word.id;
            btn.onclick = () => this.selectOption(btn, word);
            container.appendChild(btn);
        });

        document.getElementById('sentenceFeedback').classList.add('hidden');
        this.updateFavoriteButton();
        this.updateProgress();
    }

    generateOptions(correctWord) {
        const wrongs = app.getRandomWords(3, correctWord.id);
        const options = [correctWord, ...wrongs];
        return app.shuffleArray(options);
    }

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('sentenceFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('sentenceFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    selectOption(btn, correctWord) {
        if (this.answered) return;
        this.answered = true;

        const isCorrect = btn.dataset.correct === 'true';

        document.querySelectorAll('#sentenceOptions .quiz-option').forEach(opt => {
            opt.classList.add('disabled');
            if (opt.dataset.correct === 'true') {
                opt.classList.add('correct');
            }
        });

        if (isCorrect) {
            btn.classList.add('correct');
            this.score += 10;
            this.correctCount++;
            document.getElementById('sentenceFeedbackText').textContent = '✅ Doğru! Kelimeyi doğru kullandın.';
        } else {
            btn.classList.add('wrong');
            document.getElementById('sentenceFeedbackText').textContent = `❌ Yanlış! Doğru cevap: ${correctWord.russian} (${correctWord.turkish})`;
        }

        app.recordAnswer(correctWord.id, isCorrect);
        this.updateScore();

        document.getElementById('sentenceFeedback').classList.remove('hidden');
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
        document.getElementById('sentenceScore').textContent = this.score;
    }

    updateProgress() {
        document.getElementById('sentenceCurrent').textContent = this.currentIndex + 1;
        document.getElementById('sentenceTotal').textContent = this.words.length;
    }
}

window.sentenceMode = new SentenceMode();
