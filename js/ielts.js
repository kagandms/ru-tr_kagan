/**
 * IELTS Mode (B2, C1 Vocabulary) — Multi-Activity Engine
 * Activities: Word List, Flashcard, Quiz
 */
class IELTSMode {
    constructor() {
        this.currentLevel = 'b2';
        this.allWords = Array.isArray(window.IELTS_DATA) ? window.IELTS_DATA : [];
        this.filteredWords = [];
        this.flashcardIndex = 0;
        this.quizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = 10;
        this.quizWords = [];
    }

    init() {
        this.updateCounts();
        this.setupTabs();
        this.setupActivities();
        this.setupFlashcard();
        this.setupQuiz();
        this.filterByLevel(this.currentLevel);
    }

    // ─── Counts ────────────────────────────────
    updateCounts() {
        const b2Count = this.allWords.filter(w => w.level === 'B2').length;
        const c1Count = this.allWords.filter(w => w.level === 'C1').length;

        const b2El = document.getElementById('countB2');
        const c1El = document.getElementById('countC1');
        if (b2El) b2El.textContent = `(${b2Count})`;
        if (c1El) c1El.textContent = `(${c1Count})`;
    }

    // ─── Level Tabs ────────────────────────────
    setupTabs() {
        document.querySelectorAll('#ieltsLevelTabs .ielts-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#ieltsLevelTabs .ielts-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterByLevel(tab.dataset.level);
            });
        });
    }

    filterByLevel(level) {
        this.currentLevel = level;
        const normalized = level.toUpperCase();
        this.filteredWords = this.allWords.filter(w => w.level === normalized);
    }

    // ─── Activity Cards ────────────────────────
    setupActivities() {
        document.querySelectorAll('.ielts-activity-card').forEach(card => {
            card.addEventListener('click', () => {
                const activity = card.dataset.activity;
                this.showSubView(activity);
            });
        });

        // Back buttons
        const wordsBack = document.getElementById('ieltsWordsBack');
        const flashBack = document.getElementById('ieltsFlashcardBack');
        const quizBack = document.getElementById('ieltsQuizBack');

        if (wordsBack) wordsBack.addEventListener('click', () => this.hideAllSubViews());
        if (flashBack) flashBack.addEventListener('click', () => this.hideAllSubViews());
        if (quizBack) quizBack.addEventListener('click', () => this.hideAllSubViews());
    }

    showSubView(activity) {
        // Hide landing
        const landing = document.getElementById('ieltsLanding');
        if (landing) landing.classList.add('hidden');

        // Hide all sub-views first
        document.querySelectorAll('.ielts-subview').forEach(v => v.classList.add('hidden'));

        if (activity === 'words') {
            document.getElementById('ieltsWordsView').classList.remove('hidden');
            this.loadWords();
        } else if (activity === 'flashcard') {
            document.getElementById('ieltsFlashcardView').classList.remove('hidden');
            this.startFlashcard();
        } else if (activity === 'quiz') {
            document.getElementById('ieltsQuizView').classList.remove('hidden');
            this.startQuiz();
        }
    }

    hideAllSubViews() {
        document.querySelectorAll('.ielts-subview').forEach(v => v.classList.add('hidden'));
        const landing = document.getElementById('ieltsLanding');
        if (landing) landing.classList.remove('hidden');
    }

    // ─── Word List ─────────────────────────────
    loadWords() {
        const list = document.getElementById('ieltsWordsList');
        if (!list) return;
        list.innerHTML = '';

        if (this.filteredWords.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">Bu seviyede kelime yok.</div>';
            return;
        }

        this.filteredWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';

            let badgeColor = '#8b5cf6';
            if (word.level === 'C1') badgeColor = '#ef4444';

            item.innerHTML = `
                <div class="word-content" style="display:flex;align-items:center;width:100%;gap:1rem;">
                    <div style="background:${badgeColor};color:white;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:bold;min-width:25px;text-align:center;">${word.level}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;width:100%;gap:0.5rem;align-items:center;">
                        <span class="english" style="font-weight:bold;color:var(--accent);">${word.en}</span>
                        <span class="russian">${word.ru}</span>
                        <span class="turkish" style="color:var(--text-muted);">${word.tr}</span>
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // ─── Flashcard ─────────────────────────────
    setupFlashcard() {
        const card = document.getElementById('ieltsFlashcard');
        const prevBtn = document.getElementById('ieltsFlashcardPrev');
        const nextBtn = document.getElementById('ieltsFlashcardNext');

        if (card) {
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.flashcardIndex > 0) {
                    this.flashcardIndex--;
                    this.showFlashcard();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.flashcardIndex < this.filteredWords.length - 1) {
                    this.flashcardIndex++;
                    this.showFlashcard();
                }
            });
        }
    }

    startFlashcard() {
        this.flashcardIndex = 0;
        // Shuffle array
        this.filteredWords = this.filteredWords.sort(() => Math.random() - 0.5);
        this.showFlashcard();
    }

    showFlashcard() {
        const card = document.getElementById('ieltsFlashcard');
        if (card) card.classList.remove('flipped');

        const word = this.filteredWords[this.flashcardIndex];
        if (!word) return;

        const wordEl = document.getElementById('ieltsFlashcardWord');
        const ruEl = document.getElementById('ieltsFlashcardRu');
        const trEl = document.getElementById('ieltsFlashcardTr');
        const progressEl = document.getElementById('ieltsFlashcardProgress');

        if (wordEl) wordEl.textContent = word.en;
        if (ruEl) ruEl.textContent = word.ru;
        if (trEl) trEl.textContent = word.tr;
        if (progressEl) progressEl.textContent = `${this.flashcardIndex + 1}/${this.filteredWords.length}`;
    }

    // ─── Quiz ──────────────────────────────────
    setupQuiz() {
        const nextBtn = document.getElementById('ieltsQuizNext');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.quizIndex++;
                if (this.quizIndex >= this.quizTotal) {
                    this.showQuizResult();
                } else {
                    this.showQuizQuestion();
                }
            });
        }
    }

    startQuiz() {
        this.quizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = Math.min(10, this.filteredWords.length);

        // Shuffle and pick quizTotal words
        const shuffled = [...this.filteredWords].sort(() => Math.random() - 0.5);
        this.quizWords = shuffled.slice(0, this.quizTotal);

        this.showQuizQuestion();
    }

    showQuizQuestion() {
        const word = this.quizWords[this.quizIndex];
        if (!word) return;

        const wordEl = document.getElementById('ieltsQuizWord');
        const optionsEl = document.getElementById('ieltsQuizOptions');
        const feedbackEl = document.getElementById('ieltsQuizFeedback');
        const progressEl = document.getElementById('ieltsQuizProgress');

        if (wordEl) wordEl.textContent = word.en;
        if (feedbackEl) feedbackEl.classList.add('hidden');
        if (progressEl) progressEl.textContent = `${this.quizIndex + 1}/${this.quizTotal}`;

        // Generate 4 options (1 correct + 3 distractors)
        const options = this.generateOptions(word);

        if (optionsEl) {
            optionsEl.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt.text;
                btn.addEventListener('click', () => this.checkQuizAnswer(btn, opt, word));
                optionsEl.appendChild(btn);
            });
        }
    }

    generateOptions(correctWord) {
        const options = [{ text: correctWord.tr, correct: true }];
        const pool = this.allWords.filter(w => w.en !== correctWord.en);
        const shuffledPool = pool.sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(3, shuffledPool.length); i++) {
            options.push({ text: shuffledPool[i].tr, correct: false });
        }

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    checkQuizAnswer(btn, opt, word) {
        // Disable all options
        document.querySelectorAll('#ieltsQuizOptions .quiz-option').forEach(b => {
            b.classList.add('disabled');
        });

        if (opt.correct) {
            btn.classList.add('correct');
            this.quizScore++;
        } else {
            btn.classList.add('wrong');
            // Highlight correct answer
            document.querySelectorAll('#ieltsQuizOptions .quiz-option').forEach(b => {
                if (b.textContent === word.tr) b.classList.add('correct');
            });
        }

        const feedbackEl = document.getElementById('ieltsQuizFeedback');
        const feedbackText = document.getElementById('ieltsQuizFeedbackText');

        if (feedbackEl) feedbackEl.classList.remove('hidden');
        if (feedbackText) {
            feedbackText.innerHTML = opt.correct
                ? `✅ Doğru! <strong>${word.en}</strong> = ${word.ru} / ${word.tr}`
                : `❌ Yanlış! <strong>${word.en}</strong> = ${word.ru} / ${word.tr}`;
        }
    }

    showQuizResult() {
        const wordEl = document.getElementById('ieltsQuizWord');
        const optionsEl = document.getElementById('ieltsQuizOptions');
        const feedbackEl = document.getElementById('ieltsQuizFeedback');
        const feedbackText = document.getElementById('ieltsQuizFeedbackText');
        const nextBtn = document.getElementById('ieltsQuizNext');
        const progressEl = document.getElementById('ieltsQuizProgress');

        if (wordEl) wordEl.textContent = '🏁 Quiz Bitti!';
        if (optionsEl) optionsEl.innerHTML = '';
        if (progressEl) progressEl.textContent = `${this.quizTotal}/${this.quizTotal}`;

        const pct = Math.round((this.quizScore / this.quizTotal) * 100);
        let emoji = '🔴';
        if (pct >= 80) emoji = '🟢';
        else if (pct >= 50) emoji = '🟡';

        if (feedbackEl) feedbackEl.classList.remove('hidden');
        if (feedbackText) {
            feedbackText.innerHTML = `${emoji} Sonuç: <strong>${this.quizScore}/${this.quizTotal}</strong> (%${pct})`;
        }
        if (nextBtn) nextBtn.textContent = 'Tekrar Başla 🔄';
        nextBtn.onclick = () => {
            nextBtn.textContent = 'Sonraki Soru →';
            nextBtn.onclick = null;
            this.setupQuiz();
            this.startQuiz();
        };
    }
}

window.ieltsMode = new IELTSMode();
