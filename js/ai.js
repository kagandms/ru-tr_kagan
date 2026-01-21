/**
 * AI Manager - DeepSeek AI entegrasyonu
 * Vercel serverless function üzerinden AI API'ye erişir
 */

class AIManager {
    constructor() {
        this.apiUrl = '/api/ai';
        this.loading = false;
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
        return await this.callAI('generateExample', { word });
    }

    // Kelime açıklaması
    async explainWord(word) {
        return await this.callAI('explainWord', { word });
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
