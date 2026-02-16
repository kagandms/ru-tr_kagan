/**
 * Günün Kelimeleri Modu
 */
class DailyMode {
    constructor() {
        this.dailyWords = [];
    }

    init() {
        this.checkAndSetDailyWords();
        this.renderList();

        document.getElementById('dailyTestBtn').onclick = () => this.startTest();
    }

    checkAndSetDailyWords() {
        const today = new Date().toDateString(); // "Fri Feb 14 2026"
        const savedDate = localStorage.getItem('dailyWordsDate');
        const savedIds = localStorage.getItem('dailyWordsIds');

        if (savedDate === today && savedIds) {
            try {
                const ids = JSON.parse(savedIds);
                this.dailyWords = WORDS.filter(w => ids.includes(w.id));
                if (this.dailyWords.length < 5) {
                    this.dailyWords = [];
                }
            } catch (e) {
                this.dailyWords = [];
            }
        }

        if (this.dailyWords.length === 0) {
            // Yeni kelime seç
            // Öğrenilmemiş kelimelerden seçmeye çalış
            let savedStats;
            try { savedStats = JSON.parse(localStorage.getItem('stats') || '{"masteredWords":[]}'); } catch (e) { savedStats = { masteredWords: [] }; }
            const masteredIds = savedStats.masteredWords || [];

            let candidates = WORDS.filter(w => !masteredIds.includes(w.id));

            // Eğer hepsi öğrenildiyse, tümünden seç
            if (candidates.length < 5) {
                candidates = [...WORDS];
            }

            // Rastgele 5 tane
            const selected = app.shuffleArray(candidates).slice(0, 5);
            this.dailyWords = selected;

            // Kaydet
            const selectedIds = selected.map(w => w.id);
            localStorage.setItem('dailyWordsDate', today);
            localStorage.setItem('dailyWordsIds', JSON.stringify(selectedIds));
        }

        // Başlığı güncelle
        const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
        document.getElementById('dailyDate').textContent = dateStr;
    }

    renderList() {
        const container = document.getElementById('dailyWordsList');
        container.innerHTML = '';

        if (this.dailyWords.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:1rem;">Kelime verisi yok.</p>';
            return;
        }

        this.dailyWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item daily-item';
            // Custom style for daily items if needed, mostly re-using word-item
            item.innerHTML = `
                <div class="word-text" style="width:100%; text-align:center;">
                    <span class="russian" style="font-size:1.2rem; font-weight:bold; display:block;">${word.russian}</span>
                    <span class="turkish" style="color:var(--text-muted);">${word.turkish}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    startTest() {
        // Use quiz mode with daily words via proper app flow
        if (window.quizMode) {
            app.startMode('quiz');
            window.quizMode.startWithWords(this.dailyWords);
        }
    }

    reset() {
        // Moddan çıkınca yapılacaklar
    }
}

window.dailyMode = new DailyMode();
