class TrackerManager {
    constructor() {
        this.storageKey = 'ru_tr_tracker_data';
        this.data = this.loadData();
        // UI yüklendiğinde render yapılması için DOMContentLoaded ekleyelim
        // Fakat script sona ekleneceği için direkt çağırılabilir
    }

    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {
            streak: 0,
            lastActiveDate: null,
            activity: {} // { 'YYYY-MM-DD': count }
        };
    }

    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    recordActivity() {
        // Yerel saate göre YYYY-MM-DD
        const dateObj = new Date();
        // Saat dilimi kaymasını telafi et
        const offset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj - offset)).toISOString().slice(0, 10);
        const today = localISOTime;

        if (this.data.lastActiveDate !== today) {
            if (this.data.lastActiveDate) {
                const lastDate = new Date(this.data.lastActiveDate);
                const currDate = new Date(today);
                const diffTime = Math.abs(currDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    this.data.streak += 1;
                } else if (diffDays > 1) {
                    this.data.streak = 1; // Serisi bozuldu
                }
            } else {
                this.data.streak = 1;
            }
            this.data.lastActiveDate = today;
        }

        if (!this.data.activity[today]) {
            this.data.activity[today] = 0;
        }
        this.data.activity[today] += 1;

        this.saveData();
        this.renderHeatmap();
    }

    renderHeatmap() {
        const container = document.getElementById('heatmapContainer');
        const streakEl = document.getElementById('streakCount');

        if (streakEl) {
            streakEl.textContent = this.data.streak;
            // Alev efekti
            if (this.data.streak > 0) {
                streakEl.parentElement.classList.add('active-streak');
            } else {
                streakEl.parentElement.classList.remove('active-streak');
            }
        }

        if (!container) return;
        container.innerHTML = '';

        const dateObj = new Date();

        // Son 7 günü (bugün dahil) çizdir
        for (let i = 6; i >= 0; i--) {
            const d = new Date(dateObj);
            d.setDate(d.getDate() - i);

            // Yerel timezone fix
            const offset = d.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(d - offset)).toISOString().slice(0, 10);
            const dateStr = localISOTime;
            const count = this.data.activity[dateStr] || 0;

            const box = document.createElement('div');
            box.className = 'heatmap-box';

            if (count > 0) {
                if (count >= 30) box.classList.add('level-3');
                else if (count >= 10) box.classList.add('level-2');
                else box.classList.add('level-1');
            }

            box.title = `${dateStr}: ${count} işlem`;

            const wrapper = document.createElement('div');
            wrapper.className = 'heatmap-item';

            const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            const label = document.createElement('span');
            label.className = 'heatmap-label';
            label.textContent = dayName[0]; // P, S, Ç...

            wrapper.appendChild(box);
            wrapper.appendChild(label);

            container.appendChild(wrapper);
        }
    }
}

window.trackerManager = new TrackerManager();
// Başlangıçta render
document.addEventListener('DOMContentLoaded', () => {
    window.trackerManager.renderHeatmap();
});
