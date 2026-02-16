/**
 * Eşleştirme Modu
 */

class MatchingMode {
    constructor() {
        this.pairs = [];
        this.selectedLeft = null;
        this.selectedRight = null;
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.startTime = null;
    }

    init() {
        // 5 kelime seç (ekrana sığması için)
        const selected = app.shuffleArray([...WORDS]).slice(0, 5);
        this.pairs = selected;
        this.totalPairs = selected.length;
        this.matchedPairs = 0;
        this.selectedLeft = null;
        this.selectedRight = null;
        this.startTime = Date.now();

        this.render();
        this.updateProgress();
        document.getElementById('matchingResult').classList.add('hidden');
    }

    render() {
        const leftColumn = document.getElementById('matchingLeft');
        const rightColumn = document.getElementById('matchingRight');

        leftColumn.innerHTML = '';
        rightColumn.innerHTML = '';

        // Sol taraf - Rusça (karışık sıra)
        const leftItems = app.shuffleArray([...this.pairs]);
        leftItems.forEach(word => {
            const item = document.createElement('div');
            item.className = 'match-item';
            item.textContent = word.russian;
            item.dataset.id = word.id;
            item.dataset.side = 'left';
            item.onclick = () => this.selectItem(item);
            leftColumn.appendChild(item);
        });

        // Sağ taraf - Türkçe (farklı karışık sıra)
        const rightItems = app.shuffleArray([...this.pairs]);
        rightItems.forEach(word => {
            const item = document.createElement('div');
            item.className = 'match-item';
            item.textContent = word.turkish;
            item.dataset.id = word.id;
            item.dataset.side = 'right';
            item.onclick = () => this.selectItem(item);
            rightColumn.appendChild(item);
        });
    }

    selectItem(item) {
        if (item.classList.contains('matched')) return;

        const side = item.dataset.side;

        if (side === 'left') {
            // Önceki sol seçimi kaldır
            if (this.selectedLeft) {
                this.selectedLeft.classList.remove('selected');
            }
            this.selectedLeft = item;
            item.classList.add('selected');
        } else {
            // Önceki sağ seçimi kaldır
            if (this.selectedRight) {
                this.selectedRight.classList.remove('selected');
            }
            this.selectedRight = item;
            item.classList.add('selected');
        }

        // İki taraf da seçildiyse kontrol et
        if (this.selectedLeft && this.selectedRight) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const leftId = this.selectedLeft.dataset.id;
        const rightId = this.selectedRight.dataset.id;

        if (leftId === rightId) {
            // Doğru eşleşme
            this.selectedLeft.classList.add('matched');
            this.selectedRight.classList.add('matched');
            this.selectedLeft.classList.remove('selected');
            this.selectedRight.classList.remove('selected');

            this.matchedPairs++;
            app.recordAnswer(leftId, true);
            this.updateProgress();

            if (this.matchedPairs === this.totalPairs) {
                this.showResult();
            }
        } else {
            // Yanlış eşleşme
            this.selectedLeft.classList.add('wrong');
            this.selectedRight.classList.add('wrong');

            setTimeout(() => {
                this.selectedLeft.classList.remove('wrong', 'selected');
                this.selectedRight.classList.remove('wrong', 'selected');
                this.selectedLeft = null;
                this.selectedRight = null;
            }, 400);

            return;
        }

        this.selectedLeft = null;
        this.selectedRight = null;
    }

    updateProgress() {
        document.getElementById('matchingPairs').textContent = this.matchedPairs;
        document.getElementById('matchingTotal').textContent = this.totalPairs;
    }

    showResult() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        document.getElementById('matchingTime').textContent = elapsed;
        document.getElementById('matchingResult').classList.remove('hidden');

        document.getElementById('matchingRestart').onclick = () => this.init();
    }
}

window.matchingMode = new MatchingMode();
