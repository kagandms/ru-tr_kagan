/**
 * Kelime Verileri - kelimeler_tam.txt dosyasından yüklenir
 */

let WORDS = [];
let SYNONYMS = [];

/**
 * Automagic categorizer running in runtime
 */
function getWordCategory(ru, tr) {
    const ruLower = ru.toLowerCase();
    const trLower = tr.toLowerCase();

    // Check for Eş/Zıt Anlamlılar
    if (ru.includes(' - ') && tr.includes(' - ')) {
        return 'Eş/Zıt Anlamlılar';
    }

    const trWords = trLower.replace(/[,()]/g, ' ').split(/\s+/).map(w => w.trim()).filter(w => w);

    // Helpers
    const hasAny = (list) => trWords.some(w => list.includes(w));
    const findPartial = (list) => list.some(item => trLower.includes(item));

    const argoTr = ['siktir', 'göt', 'amk', 'piç', 'kaltak', 'kahpe', 'am', 'yarrak', 'yuh', 'bok', 'şerefsiz', 'çüş'];
    const argoRu = ['хуй', 'бля', 'пздц', 'ебать', 'ебан', 'говно', 'сука', 'мудак', 'дерьмо', 'пизда', 'ублюдок'];
    if (hasAny(argoTr) || argoRu.some(w => ruLower.includes(w))) return 'Argo & Günlük İfadeler';

    const yemekTr = ['yemek', 'çorba', 'ekmek', 'et', 'tavuk', 'dana', 'meyve', 'sebze', 'elma', 'armut', 'pancar', 'lahana', 'peynir', 'zeytin', 'kahve', 'çay', 'süt', 'su', 'soğan', 'sarımsak', 'patlıcan', 'fırın', 'şeker', 'tatlı', 'içmek', 'aç', 'tok', 'mutfak', 'restoran', 'yemekhane'];
    if (hasAny(yemekTr) || findPartial(['kahvalt', 'akşam yeme', 'öğle yeme'])) return 'Yemek & Mutfak';

    const yonTr = ['sağ', 'sol', 'üst', 'alt', 'ileri', 'geri', 'yukarı', 'aşağı', 'iç', 'dış', 'arka', 'ön', 'burada', 'şurada', 'orada', 'bura', 'şura', 'ora', 'sağa', 'sola', 'yakın', 'uzak', 'yanında', 'karşısında', 'ortasında', 'doğu', 'batı', 'kuzey', 'güney'];
    if (hasAny(yonTr)) return 'Yönler & Konum';

    const zamanTr = ['gün', 'ay', 'yıl', 'saat', 'dakika', 'saniye', 'sabah', 'akşam', 'dün', 'bugün', 'yarın', 'hafta', 'gece', 'zaman', 'önce', 'sonra', 'şimdi', 'bazen', 'erken', 'geç', 'asır', 'yüzyıl', 'haftasonu'];
    if (hasAny(zamanTr) || findPartial(['zamanlarda', 'günlerde', 'zamanında', 'dünkü'])) return 'Zaman & Takvim';

    const egitimTr = ['sınav', 'ders', 'okul', 'meslek', 'öğretmen', 'üniversite', 'lise', 'sınıf', 'eğitim', 'öğrenmek', 'öğrenci', 'lisans', 'doktora', 'kitap', 'defter', 'kalem', 'okumak', 'yazmak', 'çalışmak'];
    if (hasAny(egitimTr)) return 'Meslek & Eğitim';

    const aileTr = ['anne', 'baba', 'kardeş', 'abi', 'abla', 'dede', 'nine', 'çocuk', 'bebek', 'adam', 'kadın', 'insan', 'arkadaş', 'eş', 'oğul', 'kız', 'nüfus', 'koca', 'karı', 'teyze', 'amca', 'dayı', 'hala', 'insanlar', 'halk'];
    if (hasAny(aileTr)) return 'İnsan & Aile';

    const sifatTr = ['büyük', 'küçük', 'iyi', 'kötü', 'güzel', 'çirkin', 'hızlı', 'yavaş', 'geniş', 'dar', 'uzun', 'kısa', 'sıcak', 'soğuk', 'yeni', 'eski', 'zor', 'kolay', 'pahalı', 'ucuz', 'zengin', 'fakir', 'tuhaf', 'açık', 'belirgin', 'soluk', 'kibar', 'güçlü', 'kuvvetli', 'tembel', 'sağlam', 'katı', 'hasta', 'sağlıklı', 'mutlu', 'üzgün', 'yorgun', 'dinç', 'temiz', 'pis', 'kirli', 'doğru', 'yanlış', 'önemli', 'gereksiz', 'akıllı', 'aptal', 'şişman', 'zayıf', 'ilginç', 'sıkıcı', 'komik', 'ciddi', 'korkunç', 'harika', 'mükemmel'];
    const baglacTr = ['ama', 'fakat', 'lakin', 'ancak', 've', 'veya', 'ya da', 'belki', 'muhtemelen', 'elbette', 'çünkü', 'eğer', 'rağmen'];

    if (hasAny(sifatTr) || findPartial(['renkli', 'lezzetli'])) return 'Sıfatlar';
    if (hasAny(baglacTr) || findPartial(['tabii ki'])) return 'Bağlaç & Zarflar';

    if (trWords.some(w => w.endsWith('mak') || w.endsWith('mek')) || trLower.endsWith('mak') || trLower.endsWith('mek')) {
        return 'Fiiller';
    }

    return 'Genel Kelimeler';
}

async function loadWords() {
    try {
        // İki dosyayı aynı anda (paralel) asenkron çek
        const [wordsResponse, sentencesResponse] = await Promise.all([
            fetch('kelimeler_tam.txt'),
            fetch('sentences.json').catch(() => null) // sentences.json yoksa çökmeyi önle
        ]);

        if (!wordsResponse.ok) {
            throw new Error('Dosya yüklenemedi');
        }

        const text = await wordsResponse.text();
        const lines = text.split('\n');

        let sentencesDb = {};
        if (sentencesResponse && sentencesResponse.ok) {
            sentencesDb = await sentencesResponse.json();
        }

        WORDS = []; // Reset words
        let idCounter = 1;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // "Rusça : Türkçe" formatını işle
            const separatorIndex = line.indexOf(':');

            if (separatorIndex !== -1) {
                const russian = line.substring(0, separatorIndex).trim();
                const turkish = line.substring(separatorIndex + 1).trim();

                if (russian && turkish) {
                    // Eş/Zıt Anlam kontrolü
                    if (russian.includes(' - ') && turkish.includes(' - ')) {
                        let ruParts = russian.split(' - ').map(s => s.trim());
                        let trParts = turkish.split(' - ').map(s => s.trim());

                        if (ruParts.length < 2 && russian.includes('-')) {
                            ruParts = russian.split('-').map(s => s.trim());
                        }
                        if (trParts.length < 2 && turkish.includes('-')) {
                            trParts = turkish.split('-').map(s => s.trim());
                        }

                        if (ruParts.length === 2 && trParts.length === 2) {
                            SYNONYMS.push({
                                id: idCounter,
                                w1: { ru: ruParts[0], tr: trParts[0] },
                                w2: { ru: ruParts[1], tr: trParts[1] },
                                type: 'antonym'
                            });
                        }
                    }

                    // Dinamik Cümleleri Ata
                    const currentId = idCounter++;
                    let wordSentences = [];
                    if (sentencesDb[String(currentId)]) {
                        wordSentences = sentencesDb[String(currentId)];
                    }

                    // Standart kelime olarak da ekle
                    WORDS.push({
                        id: currentId,
                        russian: russian,
                        turkish: turkish,
                        category: getWordCategory(russian, turkish),
                        example: { russian: "", turkish: "" },
                        sentences: wordSentences
                    });
                }
            } else {
                // Zamanlar vb. (= ile ayrılanlar)
                const equalIndex = line.indexOf('=');
                if (equalIndex !== -1) {
                    const russian = line.substring(0, equalIndex).trim();
                    const turkish = line.substring(equalIndex + 1).trim();

                    if (russian && turkish) {
                        const currentId = idCounter++;
                        let wordSentences = [];
                        if (sentencesDb[String(currentId)]) {
                            wordSentences = sentencesDb[String(currentId)];
                        }

                        WORDS.push({
                            id: currentId,
                            russian: russian,
                            turkish: turkish,
                            category: getWordCategory(russian, turkish),
                            example: { russian: "", turkish: "" },
                            sentences: wordSentences
                        });
                    }
                }
            }
        });

        return true;

    } catch (error) {
        console.error('Kelimeler ve Cümleler yüklenirken hata:', error);
        return false;
    }
}
