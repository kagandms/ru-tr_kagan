const RATE_LIMIT = new Map();
const MAX_REQ_PER_MIN = 30;

export default async function handler(req, res) {
    // CORS headers — restrict to production domain
    const allowedOrigins = ['https://moyslovar.vercel.app', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = RATE_LIMIT.get(ip) || { count: 0, ts: now };
    if (now - entry.ts > 60000) { entry.count = 0; entry.ts = now; }
    entry.count++;
    RATE_LIMIT.set(ip, entry);
    if (entry.count > MAX_REQ_PER_MIN) {
        return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }

    const { action, word, sentence, userTranslation, correctTranslation } = req.body;

    const API_KEY = process.env.OPENROUTER_API_KEY;
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
        case 'checkGrammar':
            systemPrompt = 'Sen bir Rusça dil öğretmenisin. Kullanıcının yazdığı Rusça cümleyi kontrol et. Gramer hatalarını bul ve düzelt. Cevabını Türkçe ver. Kısa ve öz ol. Yıldız işareti (*) veya markdown kullanma. Sadece düz metin kullan.';
            userPrompt = `Şu cümleyi kontrol et: "${sentence}"`;
            break;

        case 'generateExample':
            systemPrompt = 'Sen bir Rusça dil öğretmenisin. Verilen kelime için basit ve anlaşılır bir örnek cümle oluştur. Cümleyi hem Rusça hem Türkçe yaz. Çok kısa ol. Yıldız işareti (*) veya markdown kullanma. Sadece düz metin kullan.';
            userPrompt = `Şu kelime için örnek cümle yaz: ${word.russian} (${word.turkish})`;
            break;

        case 'explainWord':
            systemPrompt = 'Sen bir Rusça dil öğretmenisin. Verilen kelimeyi Türkçe açıkla: kullanım alanları, dikkat edilecekler, eş/zıt anlamlar. Kısa ve öz ol. Yıldız işareti (*) veya markdown kullanma. Sadece düz metin kullan.';
            userPrompt = `Şu kelimeyi açıkla: ${word.russian} (${word.turkish})`;
            break;

        case 'checkTranslation':
            systemPrompt = 'Sen bir Rusça-Türkçe çeviri uzmanısın. Kullanıcının çevirisini değerlendir. Doğruysa onayla, yanlışsa düzelt ve açıkla. Türkçe cevap ver, kısa ol. Yıldız işareti (*) veya markdown kullanma. Sadece düz metin kullan.';
            userPrompt = `Rusça: "${word.russian}"\nKullanıcının çevirisi: "${userTranslation}"\nDoğru çeviri: "${correctTranslation}"`;
            break;

        default:
            return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://moyslovar.vercel.app',
                'X-Title': 'Rusca-Turkce Kelime'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return res.status(response.status).json({ error: 'AI API error' });
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || 'Cevap alınamadı';

        return res.status(200).json({ result: aiResponse });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
