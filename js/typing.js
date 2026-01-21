/**
 * Yazma Modu
 */

class TypingMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
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
        this.answered = false;
        this.setupEventListeners();
        this.showQuestion();
        this.updateProgress();
    }

    setupEventListeners() {
        const input = document.getElementById('typingInput');
        const checkBtn = document.getElementById('typingCheck');
        const nextBtn = document.getElementById('typingNext');

        checkBtn.onclick = () => this.checkAnswer();
        nextBtn.onclick = () => this.nextQuestion();

        // Enter tuşu ile kontrol
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                if (this.answered) {
                    this.nextQuestion();
                } else {
                    this.checkAnswer();
                }
            }
        };

        // Favori butonu
        document.getElementById('typingFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };
    }

    showQuestion() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        this.answered = false;

        document.getElementById('typingWord').textContent = word.russian;
        document.getElementById('typingExample').textContent = word.example.russian;
        document.getElementById('typingInput').value = '';
        document.getElementById('typingInput').focus();
        document.getElementById('typingFeedback').classList.add('hidden');

        // Favori butonunu güncelle
        this.updateFavoriteButton();
    }

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('typingFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('typingFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    async checkAnswer() {
        if (this.answered) return;

        const word = this.words[this.currentIndex];
        const input = document.getElementById('typingInput').value.trim().toLowerCase();
        const correct = word.turkish.toLowerCase();

        // Basit eşleşme kontrolü (tam eşleşme veya içeriyor)
        const isCorrect = this.isAnswerCorrect(input, correct);

        this.answered = true;

        const feedbackText = document.getElementById('typingFeedbackText');
        const correctAnswerEl = document.getElementById('typingCorrectAnswer');

        if (isCorrect) {
            this.correctCount++;
            feedbackText.textContent = '✅ Doğru!';
            feedbackText.style.color = 'var(--success)';
            correctAnswerEl.textContent = '';
        } else {
            feedbackText.textContent = '❌ Yanlış!';
            feedbackText.style.color = 'var(--error)';
            correctAnswerEl.innerHTML = `Doğru cevap: ${word.turkish}<br><br>🔄 AI değerlendiriyor...`;

            // AI çeviri kontrolü (sadece yanlış cevaplar için)
            if (window.aiManager && input) {
                const aiResult = await window.aiManager.checkTranslation(word, input, word.turkish);
                if (aiResult) {
                    correctAnswerEl.innerHTML = `Doğru cevap: ${word.turkish}<br><br>🤖 <strong>AI:</strong> ${aiResult}`;
                }
            }
        }

        document.getElementById('typingFeedback').classList.remove('hidden');
        app.recordAnswer(word.id, isCorrect);
    }

    isAnswerCorrect(input, correct) {
        if (!input) return false;

        // Tam eşleşme
        if (input === correct) return true;

        // "/" ile ayrılmış cevaplar için kontrol (örn: "Rica ederim / Lütfen")
        const alternatives = correct.split('/').map(s => s.trim().toLowerCase());
        if (alternatives.some(alt => alt === input)) return true;

        // Benzerlik kontrolü (ufak yazım hataları için)
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

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

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

        // Tamamlandı mı kontrol et
        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        this.showQuestion();
        this.updateProgress();
    }

    updateProgress() {
        document.getElementById('typingCurrent').textContent = this.currentIndex + 1;
        document.getElementById('typingTotal').textContent = this.words.length;
    }
}

window.typingMode = new TypingMode();
