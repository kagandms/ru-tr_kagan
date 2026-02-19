/**
 * IELTS Mode (B2, C1 Vocabulary) — Multi-Activity Engine
 * Activities: Word List, Flashcard, Quiz
 * Includes count selection for Flashcard & Quiz
 */
class IELTSMode {
    constructor() {
        this.currentLevel = 'b2';
        this.allWords = Array.isArray(window.IELTS_DATA) ? window.IELTS_DATA : [];
        this.filteredWords = [];
        this.activeWords = []; // Words used in current session (limited by count)
        this.flashcardIndex = 0;
        this.quizIndex = 0;
        this.quizScore = 0;
        this.quizTotal = 10;
        this.quizWords = [];
        this.pendingActivity = null; // 'flashcard' or 'quiz'
    }

    init() {
        this.updateCounts();

        if (!this.initialized) {
            this.setupTabs();
            this.setupActivities();
            this.setupFlashcard();
            this.setupQuiz();
            this.initialized = true;
        }

        this.filterByLevel(this.currentLevel);
    }

    // ─── Counts ────────────────────────────────
    updateCounts() {
        const counts = this.allWords.reduce((acc, w) => {
            if (w.level === 'B2') acc.b2++;
            else if (w.level === 'C1') acc.c1++;
            return acc;
        }, { b2: 0, c1: 0 });
        const b2El = document.getElementById('countB2');
        const c1El = document.getElementById('countC1');
        if (b2El) b2El.textContent = `(${counts.b2})`;
        if (c1El) c1El.textContent = `(${counts.c1})`;
    }

    // ─── Level Tabs ────────────────────────────
    setupTabs() {
        document.querySelectorAll('#ieltsLevelTabs .ielts-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#ieltsLevelTabs .ielts-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterByLevel(tab.dataset.level);
                // Re-render word list if words view is visible
                const wordsView = document.getElementById('ieltsWordsView');
                if (wordsView && !wordsView.classList.contains('hidden')) {
                    this.loadWords();
                }
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
                if (activity === 'words') {
                    this.showSubView('words');
                } else {
                    // Use the global question count modal (same as quiz/flashcard modes)
                    this.pendingActivity = activity;
                    this.showGlobalCountModal(activity);
                }
            });
        });

        // Back buttons from sub-views
        const wordsBack = document.getElementById('ieltsWordsBack');
        const flashBack = document.getElementById('ieltsFlashcardBack');
        const quizBack = document.getElementById('ieltsQuizBack');
        if (wordsBack) wordsBack.addEventListener('click', () => this.hideAllSubViews());
        if (flashBack) flashBack.addEventListener('click', () => this.hideAllSubViews());
        if (quizBack) quizBack.addEventListener('click', () => this.hideAllSubViews());

        // Favorite buttons
        const flashFav = document.getElementById('ieltsFlashcardFavorite');
        const quizFav = document.getElementById('ieltsQuizFavorite');
        if (flashFav) flashFav.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFlashcardFavorite();
        });
        if (quizFav) quizFav.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleQuizFavorite();
        });
    }

    // ─── Global Count Modal ─────────────────────
    showGlobalCountModal(activity) {
        const modal = document.getElementById('questionCountModal');
        if (!modal) return;

        // Abort any previous IELTS-specific listeners
        if (this._modalAbort) this._modalAbort.abort();
        this._modalAbort = new AbortController();
        const signal = this._modalAbort.signal;

        // Show the modal
        modal.classList.remove('hidden');

        const buttons = modal.querySelectorAll('.modal-btn[data-count]');

        // Add listeners with AbortController — automatically cleaned up
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const count = parseInt(e.target.dataset.count);
                if (!count) return;
                modal.classList.add('hidden');
                this._modalAbort.abort(); // Clean up all listeners
                this.startActivityWithCount(this.pendingActivity, count);
            }, { signal });
        });

        const cancelBtn = document.getElementById('questionCountCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                this._modalAbort.abort(); // Clean up all listeners
            }, { signal });
        }
    }

    startActivityWithCount(activity, count) {
        // Limit words to count
        const shuffledWords = app.shuffleArray(this.filteredWords);
        this.activeWords = shuffledWords.slice(0, Math.min(count, shuffledWords.length));

        this.showSubView(activity);
    }

    showSubView(activity) {
        const landing = document.getElementById('ieltsLanding');
        if (landing) landing.classList.add('hidden');
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

        const fragment = document.createDocumentFragment();
        this.filteredWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            let badgeColor = '#8b5cf6';
            if (word.level === 'C1') badgeColor = '#ef4444';
            item.innerHTML = `
                <div class="word-content" style="display:flex;align-items:center;width:100%;gap:1rem;">
                    <div style="background:${badgeColor};color:white;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:bold;min-width:25px;text-align:center;">${word.level}</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;width:100%;gap:0.5rem;align-items:center;">
                        <span class="english" style="font-weight:bold;color:var(--accent);">${app.sanitizeHTML(word.en)}</span>
                        <span class="russian">${app.sanitizeHTML(word.ru)}</span>
                        <span class="turkish" style="color:var(--text-muted);">${app.sanitizeHTML(word.tr)}</span>
                    </div>
                </div>
            `;
            fragment.appendChild(item);
        });
        list.appendChild(fragment);
    }

    // ─── Flashcard ─────────────────────────────
    setupFlashcard() {
        const card = document.getElementById('ieltsFlashcard');
        const prevBtn = document.getElementById('ieltsFlashcardPrev');
        const nextBtn = document.getElementById('ieltsFlashcardNext');

        if (card) card.addEventListener('click', () => card.classList.toggle('flipped'));
        if (prevBtn) prevBtn.addEventListener('click', () => {
            if (this.flashcardIndex > 0) { this.flashcardIndex--; this.showFlashcard(); }
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            if (this.flashcardIndex < this.activeWords.length - 1) {
                this.flashcardIndex++;
                this.showFlashcard();
            }
        });
    }

    startFlashcard() {
        this.flashcardIndex = 0;
        this.showFlashcard();
    }

    showFlashcard() {
        const card = document.getElementById('ieltsFlashcard');
        if (card) card.classList.remove('flipped');

        const word = this.activeWords[this.flashcardIndex];
        if (!word) return;

        const wordEl = document.getElementById('ieltsFlashcardWord');
        const ruEl = document.getElementById('ieltsFlashcardRu');
        const trEl = document.getElementById('ieltsFlashcardTr');
        const progressEl = document.getElementById('ieltsFlashcardProgress');

        if (wordEl) wordEl.textContent = word.en;
        if (ruEl) ruEl.textContent = word.ru;
        if (trEl) trEl.textContent = word.tr;
        if (progressEl) progressEl.textContent = `${this.flashcardIndex + 1}/${this.activeWords.length}`;
        this.updateIeltsFavorite('ieltsFlashcardFavorite', word);
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
        this.quizTotal = this.activeWords.length;
        this.quizWords = [...this.activeWords];
        this.showQuizQuestion();
    }

    showQuizQuestion() {
        const word = this.quizWords[this.quizIndex];
        if (!word) return;

        const wordEl = document.getElementById('ieltsQuizWord');
        const optionsEl = document.getElementById('ieltsQuizOptions');
        const feedbackEl = document.getElementById('ieltsQuizFeedback');
        const progressEl = document.getElementById('ieltsQuizProgress');

        if (wordEl) wordEl.innerHTML = `<span style="color:var(--accent)">${word.en}</span> <br> <span style="font-size:0.8em;color:var(--text-muted)">(${word.tr})</span>`;
        if (feedbackEl) feedbackEl.classList.add('hidden');
        if (progressEl) progressEl.textContent = `${this.quizIndex + 1}/${this.quizTotal}`;
        this.updateIeltsFavorite('ieltsQuizFavorite', word);

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
        // Hedef: Rusça anlamını bulmak
        const options = [{ text: correctWord.ru, correct: true }];
        const pool = this.allWords.filter(w => w.en !== correctWord.en);
        if (pool.length < 3) {
            pool.forEach(w => options.push({ text: w.ru, correct: false }));
        } else {
            const shuffledPool = app.shuffleArray(pool);
            for (let i = 0; i < 3; i++) {
                options.push({ text: shuffledPool[i].ru, correct: false });
            }
        }
        return app.shuffleArray(options);
    }

    checkQuizAnswer(btn, opt, word) {
        document.querySelectorAll('#ieltsQuizOptions .quiz-option').forEach(b => b.classList.add('disabled'));

        if (opt.correct) {
            btn.classList.add('correct');
            this.quizScore++;
        } else {
            btn.classList.add('wrong');
            document.querySelectorAll('#ieltsQuizOptions .quiz-option').forEach(b => {
                if (b.textContent === word.ru) b.classList.add('correct');
            });
        }

        // Record answer for stats and daily goal/streak
        if (typeof app !== 'undefined' && app.recordAnswer) {
            app.recordAnswer(`ielts_${word.en}`, opt.correct);
        }

        const feedbackEl = document.getElementById('ieltsQuizFeedback');
        const feedbackText = document.getElementById('ieltsQuizFeedbackText');
        if (feedbackEl) feedbackEl.classList.remove('hidden');
        if (feedbackText) {
            feedbackText.innerHTML = opt.correct
                ? `✅ Doğru! <strong>${app.sanitizeHTML(word.en)}</strong> = ${app.sanitizeHTML(word.ru)} / ${app.sanitizeHTML(word.tr)}`
                : `❌ Yanlış! <strong>${app.sanitizeHTML(word.en)}</strong> = ${app.sanitizeHTML(word.ru)} / ${app.sanitizeHTML(word.tr)}`;
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
        if (nextBtn) {
            nextBtn.textContent = 'Tekrar Başla 🔄';
            nextBtn.onclick = () => {
                nextBtn.textContent = 'Sonraki Soru →';
                nextBtn.onclick = null;
                this.setupQuiz();
                this.startQuiz();
            };
        }
    }

    // ─── Favorites ────────────────────────────────
    updateIeltsFavorite(btnId, word) {
        const btn = document.getElementById(btnId);
        if (!btn || !word) return;
        // Use 'ielts_' + en as a unique identifier for IELTS favorites
        const wordKey = 'ielts_' + word.en;
        const isFav = window.favoritesManager?.isFavorite(wordKey);
        btn.classList.toggle('active', isFav);
        btn.textContent = isFav ? '★' : '☆';
    }

    toggleFlashcardFavorite() {
        const word = this.activeWords[this.flashcardIndex];
        if (!word) return;
        const wordKey = 'ielts_' + word.en;
        const isNowFav = window.favoritesManager?.toggleFavorite(wordKey);
        const btn = document.getElementById('ieltsFlashcardFavorite');
        if (btn) {
            btn.classList.toggle('active', isNowFav);
            btn.textContent = isNowFav ? '★' : '☆';
        }
    }

    toggleQuizFavorite() {
        const word = this.quizWords[this.quizIndex];
        if (!word) return;
        const wordKey = 'ielts_' + word.en;
        const isNowFav = window.favoritesManager?.toggleFavorite(wordKey);
        const btn = document.getElementById('ieltsQuizFavorite');
        if (btn) {
            btn.classList.toggle('active', isNowFav);
            btn.textContent = isNowFav ? '★' : '☆';
        }
    }
}

window.ieltsMode = new IELTSMode();
