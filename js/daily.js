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
            // Bugünün kelimeleri zaten var
            const ids = JSON.parse(savedIds);
            this.dailyWords = WORDS.filter(w => ids.includes(w.id));

            // Eğer kelime sayısı 5'ten azsa (örn: kelime silinmişse) yeniden seç
            if (this.dailyWords.length < 5) {
                this.dailyWords = []; // Reset triggers re-selection below
            }
        }

        if (this.dailyWords.length === 0) {
            // Yeni kelime seç
            // Öğrenilmemiş kelimelerden seçmeye çalış
            const savedStats = JSON.parse(localStorage.getItem('stats') || '{"masteredWords":[]}');
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
        // Bu 5 kelimeyle Quiz modunu başlat
        // Quiz modunda customWords desteği eklememiz gerekebilir veya 
        // Quiz moduna geçmeden basit bir test overlay'i yapabiliriz.
        // En kolayı: app.startMode('quiz') ama quiz modu rastgele seçiyor.
        // Quiz modunu hack'leyelim ya da app.js'e custom list support ekleyelim.
        // Basitlik için: Quiz moduna "verilen kelimelerle başla" özelliği ekleyelim.

        // Hızlı çözüm: Quiz moduna özel bir metod ekleyeceğiz veya global bir "activeQuizWords" değişkeni kullanabiliriz.

        // Quiz modunun instance'ına erişip kelimeleri set edelim
        if (window.quizMode) {
            // Quiz modunu manuel başlat
            document.getElementById('dailyMode').classList.add('hidden');
            document.getElementById('quizMode').classList.remove('hidden');
            app.currentMode = 'quiz';

            // Quiz moduna özel kelimeleri ver
            window.quizMode.startWithWords(this.dailyWords);
        } else {
            alert("Quiz modu yüklenemedi.");
        }
    }

    reset() {
        // Moddan çıkınca yapılacaklar
    }
}

window.dailyMode = new DailyMode();
