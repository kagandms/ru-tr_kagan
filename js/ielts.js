/**
 * IELTS Mode (B1, B2, C1 Vocabulary)
 */
class IELTSMode {
    constructor() {
        this.currentLevel = 'b1';
        this.data = window.IELTS_DATA || {
            'b1': [],
            'b2': [],
            'c1': []
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
