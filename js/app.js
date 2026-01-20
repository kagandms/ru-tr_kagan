/**
 * Ana Uygulama - Tema ve Navigasyon Yönetimi
 */

class App {
    constructor() {
        this.currentMode = null;
        this.stats = this.loadStats();
        this.init();
    }

    async init() {
        this.setupTheme();

        // Önce kelimeleri yükle
        if (typeof loadWords === 'function') {
            await loadWords();
        }

        this.setupNavigation();
        this.updateStatsDisplay();
        this.checkWords();
    }

    // ===== Tema Yönetimi =====
    setupTheme() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);

        const toggle = document.getElementById('themeToggle');
        toggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // ===== Navigasyon =====
    setupNavigation() {
        // Mod kartlarına tıklama
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.openMode(mode);
            });
        });

        // Geri butonları
        document.querySelectorAll('[data-back]').forEach(btn => {
            btn.addEventListener('click', () => this.closeMode());
        });
    }

    openMode(mode) {
        if (WORDS.length === 0) {
            this.showNoWords();
            return;
        }

        const modeScreen = document.getElementById(`${mode}Mode`);
        if (modeScreen) {
            document.getElementById('mainMenu').classList.add('hidden');
            modeScreen.classList.remove('hidden');
            this.currentMode = mode;

            // Mod'u başlat
            switch (mode) {
                case 'flashcard':
                    window.flashcardMode?.init();
                    break;
                case 'quiz':
                    window.quizMode?.init();
                    break;
                case 'typing':
                    window.typingMode?.init();
                    break;
                case 'matching':
                    window.matchingMode?.init();
                    break;
                case 'srs':
                    window.srsMode?.init();
                    break;
            }
        }
    }

    closeMode() {
        if (this.currentMode) {
            document.getElementById(`${this.currentMode}Mode`).classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
            this.currentMode = null;
            this.updateStatsDisplay();
        }
    }

    checkWords() {
        if (WORDS.length === 0) {
            document.getElementById('noWordsMessage').classList.remove('hidden');
        }
    }

    showNoWords() {
        const msg = document.getElementById('noWordsMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    }

    // ===== İstatistikler =====
    loadStats() {
        const saved = localStorage.getItem('stats');
        return saved ? JSON.parse(saved) : {
            totalCorrect: 0,
            totalWrong: 0,
            masteredWords: [],
            wordProgress: {}
        };
    }

    saveStats() {
        localStorage.setItem('stats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        document.getElementById('totalWords').textContent = WORDS.length;
        document.getElementById('masteredWords').textContent = this.stats.masteredWords.length;

        const total = this.stats.totalCorrect + this.stats.totalWrong;
        const accuracy = total > 0 ? Math.round((this.stats.totalCorrect / total) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    recordAnswer(wordId, isCorrect) {
        if (isCorrect) {
            this.stats.totalCorrect++;
        } else {
            this.stats.totalWrong++;
        }

        // Kelime ilerlemesini güncelle
        if (!this.stats.wordProgress[wordId]) {
            this.stats.wordProgress[wordId] = { correct: 0, wrong: 0 };
        }

        if (isCorrect) {
            this.stats.wordProgress[wordId].correct++;
            // 5 kez doğru cevaplarsa "öğrenildi" say
            if (this.stats.wordProgress[wordId].correct >= 5 &&
                !this.stats.masteredWords.includes(wordId)) {
                this.stats.masteredWords.push(wordId);
            }
        } else {
            this.stats.wordProgress[wordId].wrong++;
            // Yanlış cevaplarsa öğrenilmişlerden çıkar
            const idx = this.stats.masteredWords.indexOf(wordId);
            if (idx > -1) {
                this.stats.masteredWords.splice(idx, 1);
            }
        }

        this.saveStats();
    }

    // Yardımcı fonksiyonlar
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getRandomWords(count, excludeId = null) {
        let available = WORDS.filter(w => w.id !== excludeId);
        return this.shuffleArray(available).slice(0, count);
    }
}

// Global app instance
const app = new App();
