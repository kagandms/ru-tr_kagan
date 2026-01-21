/**
 * Dinleme Modu
 * Rusça'yı dinle, Türkçe karşılığını yaz
 */

class ListeningMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.answered = false;
        this.correctCount = 0;
        this.questionCount = null;
        this.synth = window.speechSynthesis;
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
        this.answered = false;
        this.setupEventListeners();
        this.showQuestion();
        this.updateProgress();
    }

    setupEventListeners() {
        document.getElementById('listeningPlay').onclick = () => this.speakWord();
        document.getElementById('listeningCheck').onclick = () => this.checkAnswer();
        document.getElementById('listeningNext').onclick = () => this.nextQuestion();

        document.getElementById('listeningFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };

        // Enter tuşu ile kontrol
        document.getElementById('listeningInput').onkeydown = (e) => {
            if (e.key === 'Enter') {
                if (this.answered) {
                    this.nextQuestion();
                } else {
                    this.checkAnswer();
                }
            }
        };
    }

    speakWord() {
        const word = this.words[this.currentIndex];
        if (!word || !this.synth) return;

        // Önceki konuşmayı durdur
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(word.russian);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.8; // Biraz yavaş

        this.synth.speak(utterance);

        // Play butonu animasyonu
        const playBtn = document.getElementById('listeningPlay');
        playBtn.classList.add('playing');
        utterance.onend = () => {
            playBtn.classList.remove('playing');
        };
    }

    showQuestion() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        this.answered = false;

        // Kelimeyi gizle, sadece dinleme
        document.getElementById('listeningHint').textContent = 'Rusça kelimeyi dinle ve Türkçe karşılığını yaz';
        document.getElementById('listeningInput').value = '';
        document.getElementById('listeningInput').focus();
        document.getElementById('listeningFeedback').classList.add('hidden');

        this.updateFavoriteButton();

        // Otomatik olarak kelimeyi söyle
        setTimeout(() => this.speakWord(), 300);
    }

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('listeningFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('listeningFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    async checkAnswer() {
        if (this.answered) return;

        const word = this.words[this.currentIndex];
        const input = document.getElementById('listeningInput').value.trim().toLowerCase();
        const correct = word.turkish.toLowerCase();

        const isCorrect = this.isAnswerCorrect(input, correct);
        this.answered = true;

        const feedbackText = document.getElementById('listeningFeedbackText');
        const correctAnswerEl = document.getElementById('listeningCorrectAnswer');

        if (isCorrect) {
            this.correctCount++;
            feedbackText.textContent = '✅ Doğru!';
            feedbackText.style.color = 'var(--success)';
            correctAnswerEl.textContent = `${word.russian} = ${word.turkish}`;
        } else {
            feedbackText.textContent = '❌ Yanlış!';
            feedbackText.style.color = 'var(--error)';
            correctAnswerEl.innerHTML = `${word.russian} = ${word.turkish}<br><br>🔄 Yapay zeka cevabı değerlendiriyor...`;

            if (window.aiManager) {
                const aiResult = await window.aiManager.explainWord(word);
                if (aiResult) {
                    correctAnswerEl.innerHTML = `${word.russian} = ${word.turkish}<br><br>🤖 ${aiResult}`;
                }
            }
        }

        document.getElementById('listeningFeedback').classList.remove('hidden');
        app.recordAnswer(word.id, isCorrect);
    }

    isAnswerCorrect(input, correct) {
        if (!input) return false;
        if (input === correct) return true;

        // "/" ile ayrılmış cevaplar için kontrol
        const alternatives = correct.split('/').map(s => s.trim().toLowerCase());
        if (alternatives.some(alt => alt === input)) return true;

        // Benzerlik kontrolü
        const similarity = this.calculateSimilarity(input, correct);
        if (similarity > 0.85) return true;

        return false;
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
        for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    nextQuestion() {
        this.currentIndex++;

        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        this.showQuestion();
        this.updateProgress();
    }

    updateProgress() {
        document.getElementById('listeningCurrent').textContent = this.currentIndex + 1;
        document.getElementById('listeningTotal').textContent = this.words.length;
    }
}

window.listeningMode = new ListeningMode();
