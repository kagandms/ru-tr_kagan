/**
 * Cümle Yazma Modu
 * Kullanıcı verilen kelimeyi kullanarak kendi cümlesini yazar
 */

class SentenceMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.correctCount = 0;
        this.questionCount = null;
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
        this.setupEventListeners();
        this.showWord();
    }

    setupEventListeners() {
        document.getElementById('sentenceCheck').onclick = () => this.checkSentence();
        document.getElementById('sentenceSkip').onclick = () => this.skipWord();
        document.getElementById('sentenceNext').onclick = () => this.nextWord();

        document.getElementById('sentenceFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };

        // Enter tuşu ile kontrol
        document.getElementById('sentenceInput').onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.checkSentence();
            }
        };
    }

    showWord() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        document.getElementById('sentenceWordRu').textContent = word.russian;
        document.getElementById('sentenceWordTr').textContent = word.turkish;
        document.getElementById('sentenceInput').value = '';
        document.getElementById('sentenceInput').focus();

        document.getElementById('sentenceFeedback').classList.add('hidden');
        document.getElementById('sentenceCheck').disabled = false;

        this.updateFavoriteButton();
        this.updateProgress();
    }

    async checkSentence() {
        const word = this.words[this.currentIndex];
        const input = document.getElementById('sentenceInput').value.trim();

        if (!input) {
            alert('Lütfen bir cümle yazın!');
            return;
        }

        const feedback = document.getElementById('sentenceFeedback');
        const feedbackText = document.getElementById('sentenceFeedbackText');
        const checkBtn = document.getElementById('sentenceCheck');

        // Kelimenin cümlede geçip geçmediğini kontrol et
        const inputLower = input.toLowerCase();
        const wordLower = word.russian.toLowerCase();
        const wordRoot = wordLower.length > 3 ? wordLower.substring(0, wordLower.length - 2) : wordLower;
        const containsWord = inputLower.includes(wordLower) || inputLower.includes(wordRoot);

        checkBtn.disabled = true;
        checkBtn.textContent = '🔄 AI Kontrol Ediyor...';

        // AI gramer kontrolü
        let aiResult = null;
        if (window.aiManager) {
            aiResult = await window.aiManager.checkGrammar(input);
        }

        if (containsWord) {
            let html = `✅ <strong>Harika!</strong> Cümleniz: "${input}"`;
            if (aiResult) {
                html += `<br><br>🤖 <strong>AI Değerlendirmesi:</strong><br>${aiResult}`;
            }
            feedbackText.innerHTML = html;
            this.correctCount++;
            app.recordAnswer(word.id, true);
        } else {
            let html = `⚠️ Cümlede "<strong>${word.russian}</strong>" kelimesi bulunamadı.`;
            if (aiResult) {
                html += `<br><br>🤖 <strong>AI Değerlendirmesi:</strong><br>${aiResult}`;
            }
            feedbackText.innerHTML = html;
            app.recordAnswer(word.id, false);
        }

        feedback.classList.remove('hidden');
        feedback.classList.remove('hidden');
        checkBtn.textContent = 'Kontrol Et';
        checkBtn.disabled = false;
    }

    skipWord() {
        const word = this.words[this.currentIndex];
        app.recordAnswer(word.id, false);
        this.nextWord();
    }

    nextWord() {
        this.currentIndex++;

        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        this.showWord();
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

    updateProgress() {
        document.getElementById('sentenceCurrent').textContent = this.currentIndex + 1;
        document.getElementById('sentenceTotal').textContent = this.words.length;
    }
}

window.sentenceMode = new SentenceMode();
