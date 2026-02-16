/**
 * Eş/Zıt Anlam Modu
 */
class SynonymsMode {
    constructor() {
        this.currentPair = null;
        this.score = 0;
        this.totalQuestions = 0;
        this.currentIndex = 0;
        this.pairs = [];
    }

    init() {
        if (!SYNONYMS || SYNONYMS.length === 0) {
            alert("Eş/Zıt anlamlı kelime verisi bulunamadı!");
            app.closeMode();
            return;
        }

        this.pairs = app.shuffleArray([...SYNONYMS]);
        this.currentIndex = 0;
        this.score = 0;
        this.totalQuestions = this.pairs.length; // Ya da limitli sayıda

        this.updateProgress();
        this.showQuestion();
    }

    showQuestion() {
        if (this.currentIndex >= this.pairs.length) {
            app.showCompletion(this.score, this.totalQuestions);
            return;
        }

        const pair = this.pairs[this.currentIndex];
        this.currentPair = pair;

        // Soru: Rusça kelimenin eş/zıt anlamlısını bul
        // Rastgele 1. veya 2. kelimeyi sor
        const askIndex = Math.random() < 0.5 ? 0 : 1;
        const questionWord = askIndex === 0 ? pair.w1 : pair.w2;
        const answerWord = askIndex === 0 ? pair.w2 : pair.w1;

        document.getElementById('synonymsWord').textContent = questionWord.ru + " (" + questionWord.tr + ")";
        document.getElementById('synonymsType').textContent = pair.type === 'antonym' ? 'Zıt Anlamlısı?' : 'Eş Anlamlısı?';

        // Seçenekler oluştur
        const options = [answerWord];

        // Yanlış seçenekler (Rastgele diğer çiftlerden al)
        const distractors = app.shuffleArray(
            this.pairs.filter(p => p.id !== pair.id)
        ).slice(0, 3)
            .map(p => Math.random() < 0.5 ? p.w1 : p.w2);

        options.push(...distractors);

        // Karıştır
        const shuffledOptions = app.shuffleArray(options);

        const optionsContainer = document.getElementById('synonymsOptions');
        optionsContainer.innerHTML = '';

        shuffledOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt.ru; // Sadece Rusçasını göster, zor olsun
            // ya da hem ru hem tr: btn.textContent = `${opt.ru} (${opt.tr})`;

            btn.onclick = () => this.checkAnswer(opt, answerWord, btn);
            optionsContainer.appendChild(btn);
        });

        document.getElementById('synonymsFeedback').classList.add('hidden');
    }

    checkAnswer(selected, correct, btn) {
        const buttons = document.querySelectorAll('#synonymsOptions .quiz-option');
        buttons.forEach(b => b.classList.add('disabled'));

        const isCorrect = selected.ru === correct.ru;
        if (isCorrect) {
            btn.classList.add('correct');
            this.score++;
            document.getElementById('synonymsFeedbackText').textContent = "Doğru! 🎉";
            document.getElementById('synonymsFeedbackText').className = "correct-text";
        } else {
            btn.classList.add('wrong');
            // Doğruyu göster
            buttons.forEach(b => {
                if (b.textContent.includes(correct.ru)) {
                    b.classList.add('correct');
                }
            });
            document.getElementById('synonymsFeedbackText').textContent = `Yanlış! Doğru cevap: ${correct.ru} (${correct.tr})`;
            document.getElementById('synonymsFeedbackText').className = "wrong-text";
        }

        document.getElementById('synonymsFeedback').classList.remove('hidden');
        this.updateProgress();

        document.getElementById('synonymsNext').onclick = () => {
            this.currentIndex++;
            this.showQuestion();
        };
    }

    updateProgress() {
        document.getElementById('synonymsCurrent').textContent = this.currentIndex + 1;
        document.getElementById('synonymsTotal').textContent = this.totalQuestions;
    }
}

window.synonymsMode = new SynonymsMode();
