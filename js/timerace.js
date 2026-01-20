/**
 * Zaman Yarışı Modu
 * 60 saniyede kaç kelime bilirsin
 */

class TimeRaceMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.timer = null;
        this.isActive = false;
        this.highScore = this.loadHighScore();
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('timeRaceHighScore')) || 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('timeRaceHighScore', this.highScore);
            return true;
        }
        return false;
    }

    init() {
        this.words = app.shuffleArray([...WORDS]);
        this.currentIndex = 0;
        this.score = 0;
        this.timeLeft = 60;
        this.isActive = false;

        // UI'ı ayarla
        document.getElementById('timeraceStart').classList.remove('hidden');
        document.getElementById('timeraceGame').classList.add('hidden');
        document.getElementById('timeraceResult').classList.add('hidden');
        document.getElementById('timeraceHighScore').textContent = this.highScore;

        document.getElementById('timeraceStartBtn').onclick = () => this.startGame();
    }

    startGame() {
        this.isActive = true;
        document.getElementById('timeraceStart').classList.add('hidden');
        document.getElementById('timeraceGame').classList.remove('hidden');

        this.updateTimerDisplay();
        this.showQuestion();

        // Timer başlat
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerEl = document.getElementById('timeraceTimer');
        timerEl.textContent = this.timeLeft;

        // Son 10 saniye kırmızı
        if (this.timeLeft <= 10) {
            timerEl.classList.add('timer-warning');
        } else {
            timerEl.classList.remove('timer-warning');
        }
    }

    showQuestion() {
        if (!this.isActive) return;

        const word = this.words[this.currentIndex];
        if (!word) {
            // Kelimeler bitti, tekrar karıştır
            this.words = app.shuffleArray([...WORDS]);
            this.currentIndex = 0;
            this.showQuestion();
            return;
        }

        document.getElementById('timeraceWord').textContent = word.russian;
        document.getElementById('timeraceScore').textContent = this.score;

        // Seçenekler oluştur
        const options = this.generateOptions(word);
        const container = document.getElementById('timeraceOptions');
        container.innerHTML = '';

        options.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt.turkish;
            btn.onclick = () => this.selectOption(opt.id === word.id);
            container.appendChild(btn);
        });
    }

    generateOptions(correctWord) {
        const wrongs = app.getRandomWords(3, correctWord.id);
        const options = [correctWord, ...wrongs];
        return app.shuffleArray(options);
    }

    selectOption(isCorrect) {
        if (!this.isActive) return;

        if (isCorrect) {
            this.score++;
            // Bonus zaman (isteğe bağlı)
            // this.timeLeft += 2;
        }

        this.currentIndex++;
        this.showQuestion();
    }

    endGame() {
        this.isActive = false;
        clearInterval(this.timer);

        const isNewHighScore = this.saveHighScore();

        document.getElementById('timeraceGame').classList.add('hidden');
        document.getElementById('timeraceResult').classList.remove('hidden');

        document.getElementById('timeraceFinalScore').textContent = this.score;

        if (isNewHighScore) {
            document.getElementById('timeraceNewHighScore').classList.remove('hidden');
        } else {
            document.getElementById('timeraceNewHighScore').classList.add('hidden');
        }

        document.getElementById('timeracePlayAgain').onclick = () => this.init();
    }
}

window.timeRaceMode = new TimeRaceMode();
