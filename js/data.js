/**
 * Kelime Verileri - kelimeler_tam.txt dosyasından yüklenir
 */

let WORDS = [];

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
                    WORDS.push({
                        id: idCounter++,
                        russian: russian,
                        turkish: turkish,
                        example: {
                            russian: "", // Metin dosyasında örnek cümle yok
                            turkish: ""
                        }
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
        
        console.log(`${WORDS.length} kelime yüklendi.`);
        return true;
        
    } catch (error) {
        console.error('Kelimeler yüklenirken hata:', error);
        // Hata durumunda boş dizi veya yedek veri kullanılabilir
        return false;
    }
}
