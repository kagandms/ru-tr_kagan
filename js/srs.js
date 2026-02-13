/**
 * Spaced Repetition System (SRS) - Aralıklı Tekrar Modu
 * SM-2 algoritmasının basitleştirilmiş versiyonu
 */

class SRSMode {
    constructor() {
        this.srsData = this.loadSRSData();
        this.dueWords = [];
        this.currentIndex = 0;
        this.showingAnswer = false;
    }

    loadSRSData() {
        const saved = localStorage.getItem('srsData');
        if (saved) {
            return JSON.parse(saved);
        }

        // Her kelime için başlangıç verisi oluştur
        const data = {};
        WORDS.forEach(word => {
            data[word.id] = {
                interval: 1,           // Gün cinsinden tekrar aralığı
                easeFactor: 2.5,       // Kolaylık faktörü
                repetitions: 0,        // Başarılı tekrar sayısı
                nextReview: Date.now() // Sonraki tekrar zamanı
            };
        });
        return data;
    }

    saveSRSData() {
        localStorage.setItem('srsData', JSON.stringify(this.srsData));
    }

    init() {
        this.findDueWords();
        this.currentIndex = 0;
        this.showingAnswer = false;
        this.setupEventListeners();
        this.updateDueCount();
        this.showCard();
    }

    findDueWords() {
        const now = Date.now();
        this.dueWords = WORDS.filter(word => {
            const data = this.srsData[word.id];
            // Eğer srs verisi yoksa (yeni kelime), varsayılan olarak hemen göster (due)
            // Ya da init() çalışırken loadSRSData zaten oluşturuyor ama yine de koruma ekleyelim.
            if (!data) return true;
            return data.nextReview <= now;
        });

        // Öncelik sıralaması: daha düşük ease factor = daha zor = önce göster
        this.dueWords.sort((a, b) => {
            return this.srsData[a.id].easeFactor - this.srsData[b.id].easeFactor;
        });
    }

    setupEventListeners() {
        document.getElementById('srsShowAnswer').onclick = () => this.revealAnswer();

        document.querySelectorAll('.srs-btn').forEach(btn => {
            btn.onclick = () => this.rateCard(parseInt(btn.dataset.rating));
        });
    }

    showCard() {
        if (this.dueWords.length === 0 || this.currentIndex >= this.dueWords.length) {
            this.showEmpty();
            return;
        }

        const word = this.dueWords[this.currentIndex];
        this.showingAnswer = false;

        document.getElementById('srsWord').textContent = word.russian;
        document.getElementById('srsExample').textContent = word.example.russian;
        document.getElementById('srsTranslation').textContent = word.turkish;
        document.getElementById('srsExampleTr').textContent = word.example.turkish;

        document.getElementById('srsAnswer').classList.add('hidden');
        document.getElementById('srsButtons').classList.add('hidden');
        document.getElementById('srsShowAnswer').classList.remove('hidden');
        document.getElementById('srsCard').classList.remove('hidden');
        document.getElementById('srsEmpty').classList.add('hidden');
    }

    revealAnswer() {
        this.showingAnswer = true;
        document.getElementById('srsAnswer').classList.remove('hidden');
        document.getElementById('srsShowAnswer').classList.add('hidden');
        document.getElementById('srsButtons').classList.remove('hidden');
    }

    rateCard(rating) {
        const word = this.dueWords[this.currentIndex];
        const data = this.srsData[word.id];

        // SM-2 algoritması
        if (rating === 1) {
            // Tekrar (başarısız) - sıfırla
            data.repetitions = 0;
            data.interval = 1;
            app.recordAnswer(word.id, false);
        } else {
            // Başarılı
            if (data.repetitions === 0) {
                data.interval = 1;
            } else if (data.repetitions === 1) {
                data.interval = 6;
            } else {
                data.interval = Math.round(data.interval * data.easeFactor);
            }

            data.repetitions++;

            // Ease factor güncelle
            const easeChange = 0.1 - (4 - rating) * 0.08;
            data.easeFactor = Math.max(1.3, data.easeFactor + easeChange);

            app.recordAnswer(word.id, true);
        }

        // Sonraki tekrar zamanını hesapla
        data.nextReview = Date.now() + (data.interval * 24 * 60 * 60 * 1000);

        this.saveSRSData();

        // Sonraki karta geç
        this.currentIndex++;
        this.updateDueCount();
        this.showCard();
    }

    updateDueCount() {
        const remaining = Math.max(0, this.dueWords.length - this.currentIndex);
        document.getElementById('srsDue').textContent = remaining;
    }

    showEmpty() {
        document.getElementById('srsCard').classList.add('hidden');
        document.getElementById('srsShowAnswer').classList.add('hidden');
        document.getElementById('srsButtons').classList.add('hidden');
        document.getElementById('srsEmpty').classList.remove('hidden');
    }
}

window.srsMode = new SRSMode();
