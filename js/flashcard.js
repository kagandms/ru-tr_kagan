/**
 * Flashcard Modu
 */

class FlashcardMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.direction = 'ru-tr'; // ru-tr veya tr-ru
        this.isFlipped = false;
    }

    init() {
        this.words = app.shuffleArray([...WORDS]);
        this.currentIndex = 0;
        this.isFlipped = false;
        this.setupEventListeners();
        this.updateCard();
        this.updateProgress();
    }

    setupEventListeners() {
        // Kart çevirme
        const card = document.getElementById('flashcard');
        card.onclick = () => this.flipCard();

        // Biliyorum / Bilmiyorum
        document.getElementById('flashcardCorrect').onclick = () => this.answer(true);
        document.getElementById('flashcardWrong').onclick = () => this.answer(false);

        // Yön değiştirme
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.direction = btn.dataset.dir;
                this.isFlipped = false;
                document.getElementById('flashcard').classList.remove('flipped');
                this.updateCard();
            };
        });
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        document.getElementById('flashcard').classList.toggle('flipped');
    }

    updateCard() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        if (this.direction === 'ru-tr') {
            document.getElementById('flashcardWord').textContent = word.russian;
            document.getElementById('flashcardExample').textContent = word.example.russian;
            document.getElementById('flashcardTranslation').textContent = word.turkish;
            document.getElementById('flashcardExampleTr').textContent = word.example.turkish;
        } else {
            document.getElementById('flashcardWord').textContent = word.turkish;
            document.getElementById('flashcardExample').textContent = word.example.turkish;
            document.getElementById('flashcardTranslation').textContent = word.russian;
            document.getElementById('flashcardExampleTr').textContent = word.example.russian;
        }
    }

    updateProgress() {
        document.getElementById('flashcardCurrent').textContent = this.currentIndex + 1;
        document.getElementById('flashcardTotal').textContent = this.words.length;
    }

    answer(isCorrect) {
        const word = this.words[this.currentIndex];
        app.recordAnswer(word.id, isCorrect);

        // Sonraki kart
        this.currentIndex++;
        if (this.currentIndex >= this.words.length) {
            // Tekrar karıştır
            this.words = app.shuffleArray([...WORDS]);
            this.currentIndex = 0;
        }

        // Kartı resetle
        this.isFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');

        this.updateCard();
        this.updateProgress();
    }
}

window.flashcardMode = new FlashcardMode();
