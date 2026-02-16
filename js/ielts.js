/**
 * IELTS Mode (B1, B2, C1 Vocabulary)
 */
class IELTSMode {
    constructor() {
        this.currentLevel = 'b1'; // Default tab
        // Data is now a flat array with 'level' property: {en, ru, tr, level}
        this.allWords = Array.isArray(window.IELTS_DATA) ? window.IELTS_DATA : [];
    }

    init() {
        this.setupTabs();
        this.loadWords('b1'); // Initial load
    }

    setupTabs() {
        document.querySelectorAll('.ielts-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Formatting tabs
                document.querySelectorAll('.ielts-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Get level from data-level attribute (b1, b2, c1)
                const level = tab.dataset.level;
                this.loadWords(level);
            });
        });
    }

    loadWords(targetLevel) {
        this.currentLevel = targetLevel;
        const list = document.getElementById('ieltsWordsList');
        list.innerHTML = '';

        // Filter words based on target level
        // The data has levels like "B1", "B2", "C1" (uppercase)
        // targetLevel is "b1", "b2" (lowercase) from HTML
        const normalizedTarget = targetLevel.toUpperCase();

        const filteredWords = this.allWords.filter(word => {
            // Some words might have multiple levels or just one
            // We expect word.level to be "B2", "C1" etc.
            return word.level === normalizedTarget;
        });

        if (filteredWords.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No words found for ${normalizedTarget} level.</div>`;
            return;
        }

        filteredWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';

            // Level Badge Color
            let badgeColor = '#3b82f6'; // B1 Blue
            if (word.level === 'B2') badgeColor = '#8b5cf6'; // Purple
            if (word.level === 'C1') badgeColor = '#ef4444'; // Red

            item.innerHTML = `
                <div class="word-content" style="display:flex; align-items:center; width:100%; gap:1rem;">
                    <div style="
                        background:${badgeColor}; 
                        color:white; 
                        padding:2px 6px; 
                        border-radius:4px; 
                        font-size:0.7rem; 
                        font-weight:bold;
                        min-width: 25px;
                        text-align:center;
                    ">${word.level}</div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; width:100%; gap:0.5rem; align-items:center;">
                        <span class="english" style="font-weight:bold; color:var(--accent);">${word.en}</span>
                        <span class="russian">${word.ru}</span>
                        <span class="turkish" style="color:var(--text-muted);">${word.tr}</span>
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }
}

window.ieltsMode = new IELTSMode();
