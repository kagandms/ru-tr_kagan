/**
 * AI Manager - DeepSeek AI entegrasyonu
 * Vercel serverless function üzerinden AI API'ye erişir
 */

class AIManager {
    constructor() {
        this.apiUrl = '/api/ai';
        this.loading = false;
        // Cache'i yükle
        try {
            this.cache = JSON.parse(localStorage.getItem('rutr_ai_cache')) || {};
        } catch (e) {
            this.cache = {};
        }
    }

    saveCache() {
        try {
            localStorage.setItem('rutr_ai_cache', JSON.stringify(this.cache));
        } catch (e) {
            console.error('Cache save failed', e);
        }
    }

    async callAI(action, data) {
        if (this.loading) return null;

        this.loading = true;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, ...data })
            });

            if (!response.ok) {
                throw new Error('AI request failed');
            }

            const result = await response.json();
            return result.result;

        } catch (error) {
            console.error('AI Error:', error);
            return null;
        } finally {
            this.loading = false;
        }
    }

    // Cümle gramer kontrolü
    async checkGrammar(sentence) {
        return await this.callAI('checkGrammar', { sentence });
    }

    // Kelime için örnek cümle üret
    async generateExample(word) {
        const key = `ex_${word.id}`;
        if (this.cache[key]) return this.cache[key];

        const result = await this.callAI('generateExample', { word });
        if (result) {
            this.cache[key] = result;
            this.saveCache();
        }
        return result;
    }

    // Kelime açıklaması
    async explainWord(word) {
        const key = `expl_${word.id}`;
        if (this.cache[key]) return this.cache[key];

        const result = await this.callAI('explainWord', { word });
        if (result) {
            this.cache[key] = result;
            this.saveCache();
        }
        return result;
    }

    // Çeviri kontrolü
    async checkTranslation(word, userTranslation, correctTranslation) {
        return await this.callAI('checkTranslation', {
            word,
            userTranslation,
            correctTranslation
        });
    }

    // Loading durumunu kontrol et
    isLoading() {
        return this.loading;
    }
}

window.aiManager = new AIManager();
