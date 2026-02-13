/**
 * IELTS Mode (B1, B2, C1 Vocabulary)
 */
class IELTSMode {
    constructor() {
        this.currentLevel = 'b1';
        this.data = {
            'b1': [
                { en: 'Accomodation', tr: 'Konaklama', ru: 'Жильё' },
                { en: 'Avoid', tr: 'Kaçınmak', ru: 'Избегать' },
                { en: 'Behavior', tr: 'Davranış', ru: 'Поведение' },
                { en: 'Cancel', tr: 'İptal etmek', ru: 'Отменить' },
                { en: 'Decade', tr: 'On yıl', ru: 'Десятилетие' }
            ],
            'b2': [
                { en: 'Abandon', tr: 'Terk etmek', ru: 'Покидать' },
                { en: 'Abstract', tr: 'Soyut', ru: 'Абстрактный' },
                { en: 'Accumulate', tr: 'Biriktirmek', ru: 'Накапливать' },
                { en: 'Bias', tr: 'Önyargı', ru: 'Предвзятость' },
                { en: 'Clarify', tr: 'Açıklığa kavuşturmak', ru: 'Уточнить' }
            ],
            'c1': [
                { en: 'Advocate', tr: 'Savunmak', ru: 'Отстаивать' },
                { en: 'Ambiguous', tr: 'Belirsiz', ru: 'Двусмысленный' },
                { en: 'Coherent', tr: 'Tutarlı', ru: 'Последовательный' },
                { en: 'Deduce', tr: 'Sonuç çıkarmak', ru: 'Делать вывод' },
                { en: 'Empirical', tr: 'Deneysel', ru: 'Эмпирический' }
            ]
        };
    }

    init() {
        this.setupTabs();
        this.loadLevel('b1');
    }

    setupTabs() {
        document.querySelectorAll('.ielts-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ielts-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.loadLevel(tab.dataset.level);
            });
        });
    }

    loadLevel(level) {
        this.currentLevel = level;
        const list = document.getElementById('ieltsWordsList');
        list.innerHTML = '';

        const words = this.data[level];
        if (!words) return;

        words.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            // Custom styling for 3 languages
            item.innerHTML = `
                <div class="word-text" style="display:grid; grid-template-columns: 1fr 1fr 1fr; width:100%; gap:0.5rem;">
                    <span class="english" style="font-weight:bold; color:var(--accent);">${word.en}</span>
                    <span class="russian">${word.ru}</span>
                    <span class="turkish" style="color:var(--text-muted);">${word.tr}</span>
                </div>
            `;
            list.appendChild(item);
        });
    }
}

window.ieltsMode = new IELTSMode();
