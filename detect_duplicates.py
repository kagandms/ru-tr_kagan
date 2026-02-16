import os
from typing import Set, List, Tuple

# Dosya yolları / File paths
EXISTING_FILE = "kelimeler_tam.txt"
NEW_WORDS_FILE = "yeni_kelimeler.txt"
OUTPUT_FILE = "clean_words.txt"

def load_existing_keys(filepath: str) -> Set[str]:
    """
    Mevcut dosyadaki Rusça kelimeleri (anahtarları) yükler.
    Loads existing Russian keys from the file.
    """
    keys = set()
    if not os.path.exists(filepath):
        print(f"UYARI: {filepath} bulunamadı! Yeni bir veritabanı gibi davranılacak.")
        return keys

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or ":" not in line:
                    continue
                # İlk ':' karakterine kadar olan kısmı al (Rusça kelime)
                # Take the part before the first ':' (Russian word)
                key = line.split(":", 1)[0].strip().lower()
                keys.add(key)
    except Exception as e:
        print(f"HATA ({filepath} okunurken): {e}")
    
    return keys

def process_new_words(existing_keys: Set[str]) -> None:
    """
    Yeni kelimeleri kontrol eder ve kopyaları filtreler.
    Checks new words and filters out duplicates.
    """
    if not os.path.exists(NEW_WORDS_FILE):
        print(f"HATA: {NEW_WORDS_FILE} bulunamadı! Lütfen bu dosyayı oluşturun ve kelimeleri ekleyin.")
        return

    new_unique_lines: List[str] = []
    duplicates: List[str] = []

    try:
        with open(NEW_WORDS_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()

        print(f"\n--- {NEW_WORDS_FILE} Analizi ---")
        print(f"Toplam Satır: {len(lines)}")

        for line in lines:
            original_line = line.strip()
            if not original_line or ":" not in original_line:
                continue

            # Ayrıştırma / Parsing
            parts = original_line.split(":", 1)
            key = parts[0].strip().lower()

            if key in existing_keys:
                duplicates.append(parts[0].strip())
            else:
                new_unique_lines.append(original_line)
                # Aynı dosya içinde tekrarı önlemek için seti güncelle
                # Update set to prevent duplicates within the same file
                existing_keys.add(key) 

        # Sonuçları Kaydet / Save Results
        if new_unique_lines:
            with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                f.write("\n".join(new_unique_lines) + "\n")
            print(f"\n✅ BAŞARILI: {len(new_unique_lines)} yeni kelime '{OUTPUT_FILE}' dosyasına kaydedildi.")
        else:
            print("\nℹ️ Eklenecek yeni (benzersiz) kelime bulunamadı.")

        # Raporlama / Reporting
        if duplicates:
            print(f"\n⚠️ TESPİT EDİLEN KOPYALAR ({len(duplicates)} adet):")
            for dup in duplicates:
                print(f"  - {dup}")
        
        print("\n---------------------------------------------------")
        print(f"\nİşlem tamamlandı. '{OUTPUT_FILE}' dosyasındaki kelimeleri '{EXISTING_FILE}' dosyasına ekleyebilirsiniz.")

    except Exception as e:
        print(f"KRİTİK HATA: {e}")

if __name__ == "__main__":
    print("🚀 Kelime Çakışma Kontrolcüsü Başlatılıyor...")
    existing = load_existing_keys(EXISTING_FILE)
    print(f"📦 Mevcut Veritabanı: {len(existing)} kelime yüklendi.")
    process_new_words(existing)
