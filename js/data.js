/**
 * Kelime Verileri - kelimeler_tam.txt dosyasından yüklenir
 */

let WORDS = [];
let SYNONYMS = [];

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
                    if (russian.includes('-') && turkish.includes('-')) {
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
