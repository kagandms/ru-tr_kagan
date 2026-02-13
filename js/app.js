/**
 * Ana Uygulama - Tema ve Navigasyon Yönetimi
 */

class App {
    constructor() {
        this.currentMode = null;
        this.pendingMode = null;
        this.selectedQuestionCount = null;
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
        this.setupModals();
        this.updateStatsDisplay();
        this.checkWords();

        // Günlük hedef ve streak göster
        window.goalsManager?.updateDisplay();

        this.setupPWA();
    }

    // ===== PWA Kurulum Yönetimi =====
    setupPWA() {
        this.deferredPrompt = null;
        const installBtn = document.getElementById('install-btn');

        window.addEventListener('beforeinstallprompt', (e) => {
            // Chrome 67 ve öncesi için otomatik prompt'u engelle
            e.preventDefault();
            // Etkinliği daha sonra kullanmak üzere sakla
            this.deferredPrompt = e;
            // Kurulum butonunu göster
            installBtn.style.display = 'flex';
        });

        installBtn.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;
            // Kurulum prompt'unu göster
            this.deferredPrompt.prompt();
            // Kullanıcının cevabını bekle
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            // Prompt bir kez kullanılabilir, sıfırla
            this.deferredPrompt = null;
            // Butonu gizle
            installBtn.style.display = 'none';
        });

        window.addEventListener('appinstalled', () => {
            // Kurulum tamamlandı, butonu gizle
            installBtn.style.display = 'none';
            this.deferredPrompt = null;
            console.log('PWA installed');
        });
    }

    // ===== Tema Yönetimi =====
    setupTheme() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);

        const toggle = document.getElementById('theme-toggle');
        toggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // ... (previous code)

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
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent double firing
                this.closeMode();
            });
        });
    }

    // ... (previous code)

    openMode(mode) {
        if (WORDS.length === 0) {
            this.showNoWords();
            return;
        }

        // Soru sayısı sorulacak modlar
        const modesWithCount = ['flashcard', 'quiz', 'typing', 'hardwords', 'reversequiz'];

        if (modesWithCount.includes(mode)) {
            this.pendingMode = mode;
            document.getElementById('questionCountModal').classList.remove('hidden');
        } else if (mode === 'allwords') {
            this.showAllWords();
        } else if (mode === 'daily') {
            this.startMode('daily'); // Günün kelimeleri
        } else {
            this.startMode(mode);
        }
    }

    startMode(mode, questionCount = null) {
        const modeScreen = document.getElementById(`${mode}Mode`);

        // Hata ayıklama: Mod ekranı var mı kontrol et
        if (!modeScreen) {
            console.error(`Mode screen for ${mode} not found!`);
            return;
        }

        if (modeScreen) {
            document.getElementById('mainMenu').classList.add('hidden');
            modeScreen.classList.remove('hidden');
            this.currentMode = mode;

            // Mod'u başlat
            switch (mode) {
                case 'flashcard':
                    window.flashcardMode?.init(questionCount);
                    break;
                case 'quiz':
                    window.quizMode?.init(questionCount);
                    break;
                case 'typing':
                    window.typingMode?.init(questionCount);
                    break;
                case 'hardwords':
                    window.hardWordsMode?.init(questionCount);
                    break;
                case 'reversequiz':
                    window.reverseQuizMode?.init(questionCount);
                    break;
                case 'matching':
                    window.matchingMode?.init();
                    break;
                case 'synonyms':
                    window.synonymsMode?.init();
                    break;
                case 'ielts':
                    window.ieltsMode?.init();
                    break;
                case 'torfl':
                    window.torflMode?.init();
                    break;
                case 'daily':
                    window.dailyMode?.init();
                    break;
            }
        }
    }

    // ... (previous code)

    closeMode() {
        if (this.currentMode) {
            const modeScreen = document.getElementById(`${this.currentMode}Mode`);
            if (modeScreen) {
                modeScreen.classList.add('hidden');
            }
            document.getElementById('mainMenu').classList.remove('hidden');
            this.currentMode = null;
            this.updateStatsDisplay();

            // Günlük kelimeler modundan çıkınca ana menüyü yenile
            if (window.dailyMode && typeof window.dailyMode.reset === 'function') {
                window.dailyMode.reset();
            }
        }
    }

    // ... (previous code)


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
        if (!this.stats) return; // Koruma

        document.getElementById('totalWords').textContent = WORDS.length;
        document.getElementById('masteredWords').textContent = this.stats.masteredWords ? this.stats.masteredWords.length : 0;

        const total = this.stats.totalCorrect + this.stats.totalWrong;
        const accuracy = total > 0 ? Math.round((this.stats.totalCorrect / total) * 100) : 0;
        document.getElementById('accuracy').textContent = `%${accuracy}`;
    }

    recordAnswer(wordId, isCorrect) {
        if (isCorrect) {
            this.stats.totalCorrect++;
            // Günlük hedef için kaydet
            window.goalsManager?.recordWord();
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
