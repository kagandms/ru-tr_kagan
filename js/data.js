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

    // Create word array for strict matching
    const trWords = trLower.replace(/,/g, ' ').split(/\s+/).map(w => w.trim());

    const argoTr = ['siktir', 'göt', 'amk', 'piç', 'kaltak', 'kahpe', 'am', 'yarrak', 'yuh', 'hay anasını', 'vah canına', 'bok', 'şerefsiz', 'çüş', 's*kmek', 'sıçmak', 'çuvallamak'];
    const argoRu = ['хуй', 'бля', 'пздц', 'ебать', 'ебан', 'говно', 'сука', 'мудак', 'дерьмо', 'пизда', 'ублюдок'];
    if (trWords.some(w => argoTr.includes(w)) || argoRu.some(w => ruLower.includes(w))) return 'Argo & Günlük İfadeler';

    const yemekTr = ['yemek', 'çorba', 'ekmek', 'et', 'tavuk', 'dana', 'meyve', 'sebze', 'elma', 'armut', 'pancar', 'lahana', 'şeftali', 'kayısı', 'kavun', 'karpuz', 'çilek', 'peynir', 'zeytin', 'kahve', 'çay', 'süt', 'su', 'soğan', 'sarımsak', 'patlıcan', 'fırın', 'çörek', 'somun', 'kuzu', 'koyun', 'hindi', 'yemiş', 'içmek', 'aç', 'şeker'];
    if (trWords.some(w => yemekTr.includes(w))) return 'Yemek & Mutfak';

    const yonTr = ['sağ', 'sol', 'üst', 'alt', 'ileri', 'geri', 'yukarı', 'aşağı', 'iç', 'dış', 'arka', 'ön', 'burada', 'şurada', 'orada', 'bura', 'şura', 'ora', 'sağa', 'sola', 'yukarıda', 'aşağıda', 'önde', 'arkada', 'içinde', 'dışında', 'altında', 'üstünde'];
    if (trWords.some(w => yonTr.includes(w))) return 'Yönler & Konum';

    const zamanTr = ['gün', 'ay', 'yıl', 'saat', 'dakika', 'saniye', 'sabah', 'akşam', 'dün', 'bugün', 'yarın', 'hafta', 'gece', 'zaman', 'önce', 'sonra', 'şimdi', 'bazen', 'zamanlarda', 'günlerde', 'zamanında', 'dünkü'];
    if (trWords.some(w => zamanTr.includes(w))) return 'Zaman & Takvim';

    const egitimTr = ['sınav', 'ders', 'okul', 'meslek', 'öğretmen', 'üniversite', 'lise', 'sınıf', 'eğitim', 'öğrenmek', 'öğrenci', 'lisans'];
    if (egitimTr.some(w => trLower.includes(w))) return 'Meslek & Eğitim';

    const aileTr = ['anne', 'baba', 'kardeş', 'abi', 'abla', 'dede', 'nine', 'çocuk', 'bebek', 'adam', 'kadın', 'insan', 'arkadaş', 'eş', 'oğul', 'kız', 'nüfus'];
    if (trWords.some(w => aileTr.includes(w))) return 'İnsan & Aile';

    const sifatTr = ['büyük', 'küçük', 'iyi', 'kötü', 'güzel', 'çirkin', 'hızlı', 'yavaş', 'geniş', 'dar', 'uzun', 'kısa', 'sıcak', 'soğuk', 'yeni', 'eski', 'zor', 'kolay', 'pahalı', 'ucuz', 'zengin', 'fakir', 'tuhaf', 'açık', 'belirgin', 'soluk', 'kibar', 'güçlü', 'kuvvetli'];
    if (trWords.some(w => sifatTr.includes(w))) return 'Sıfatlar';

    if (trWords.some(w => w.endsWith('mak') || w.endsWith('mek')) || trLower.endsWith('mak') || trLower.endsWith('mek')) {
        return 'Fiiller';
    }

    return 'Genel Kelimeler';
}

async function loadWords() {
    try {
        const response = await fetch('kelimeler_tam.txt');
        if (!response.ok) {
            throw new Error('Dosya yüklenemedi');
        }

        const text = await response.text();
        const lines = text.split('\n');

        WORDS = []; // Reset words
        let idCounter = 1;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // "Rusça : Türkçe" formatını işle
            // Bazen birden fazla : olabilir, ilkini ayırıcı olarak alacağız
            const separatorIndex = line.indexOf(':');

            if (separatorIndex !== -1) {
                const russian = line.substring(0, separatorIndex).trim();
                const turkish = line.substring(separatorIndex + 1).trim();

                if (russian && turkish) {
                    // Eş/Zıt Anlam kontrolü (Her iki tarafta da "-" varsa)
                    // Örn: Радость - Грусть : Neşe - Hüzün
                    // Eş/Zıt Anlam kontrolü (Her iki tarafta da "-" varsa)
                    // Örn: Радость - Грусть : Neşe - Hüzün
                    // Regex kullanarak - işaretini kontrol et (boşluklu veya boşluksuz olabilir ama standart ' - ' dedik)

                    // Daha gevşek kontrol: İçinde tire var mı?
                    if (russian.includes(' - ') && turkish.includes(' - ')) {
                        // ' - ' ayracına göre bölmeye çalış, eğer başarısız olursa sadece '-' ile dene
                        let ruParts = russian.split(' - ').map(s => s.trim());
                        let trParts = turkish.split(' - ').map(s => s.trim());

                        // Eğer ' - ' ile bölünemediyse ama tire varsa (örn: kelime-kelime bitişik)
                        if (ruParts.length < 2 && russian.includes('-')) {
                            ruParts = russian.split('-').map(s => s.trim());
                        }
                        if (trParts.length < 2 && turkish.includes('-')) {
                            trParts = turkish.split('-').map(s => s.trim());
                        }

                        if (ruParts.length === 2 && trParts.length === 2) {
                            SYNONYMS.push({
                                id: idCounter++,
                                w1: { ru: ruParts[0], tr: trParts[0] },
                                w2: { ru: ruParts[1], tr: trParts[1] },
                                type: 'antonym' // Varsayılan olarak zıt anlam
                            });
                        }
                    }

                    // Standart kelime olarak da ekle (Flashcard vb. için)
                    WORDS.push({
                        id: idCounter++,
                        russian: russian,
                        turkish: turkish,
                        category: getWordCategory(russian, turkish),
                        example: { russian: "", turkish: "" }
                    });
                }
            } else {
                // Özel formatlı satırlar için (örn: zamanlar 12.00 = ...)
                // Eğer = varsa onu ayıraç olarak kullan
                const equalIndex = line.indexOf('=');
                if (equalIndex !== -1) {
                    const russian = line.substring(0, equalIndex).trim();
                    const turkish = line.substring(equalIndex + 1).trim();

                    if (russian && turkish) {
                        WORDS.push({
                            id: idCounter++,
                            russian: russian,
                            turkish: turkish,
                            category: getWordCategory(russian, turkish),
                            example: { russian: "", turkish: "" }
                        });
                    }
                }
            }
        });

        return true;

    } catch (error) {
        console.error('Kelimeler yüklenirken hata:', error);
        // Hata durumunda boş dizi veya yedek veri kullanılabilir
        return false;
    }
}
