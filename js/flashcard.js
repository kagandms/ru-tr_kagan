/**
 * Flashcard Modu
 */

class FlashcardMode {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.direction = 'ru-tr'; // ru-tr veya tr-ru
        this.isFlipped = false;
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
        this.isFlipped = false;
        this.setupEventListeners();
        this.updateCard();
        this.updateProgress();
        this.updateFavoriteButton();
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

        // Favori butonu
        document.getElementById('flashcardFavorite').onclick = (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        };
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

    updateFavoriteButton() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const btn = document.getElementById('flashcardFavorite');
        const isFav = window.favoritesManager?.isFavorite(word.id);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFavorite() {
        const word = this.words[this.currentIndex];
        if (!word) return;

        const isNowFav = window.favoritesManager?.toggleFavorite(word.id);
        const btn = document.getElementById('flashcardFavorite');
        btn.classList.toggle('active', isNowFav);
        btn.textContent = isNowFav ? '★' : '☆';
    }

    answer(isCorrect) {
        const word = this.words[this.currentIndex];
        app.recordAnswer(word.id, isCorrect);

        if (isCorrect) {
            this.correctCount++;
        }

        // Sonraki kart
        this.currentIndex++;

        // Tamamlandı mı kontrol et
        if (this.currentIndex >= this.words.length) {
            app.showCompletion(this.correctCount, this.words.length);
            return;
        }

        // Kartı resetle
        this.isFlipped = false;
        document.getElementById('flashcard').classList.remove('flipped');

        this.updateCard();
        this.updateProgress();
        this.updateFavoriteButton();
    }
}

window.flashcardMode = new FlashcardMode();
