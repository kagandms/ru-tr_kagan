import json

def create_synthetic_sentences():
    words = []
    with open('kelimeler_tam.txt', 'r', encoding='utf-8') as f:
        # data.js mantığına benzemesi için line index'i tutuyoruz.
        # js tarafında word.id = (line_idx + 1) olarak assign edilmiştir.
        # Ama burada 1'den başlatacağız çünkü data.js'te: const wordId = index + 1;
        for line_idx, line in enumerate(f):
            line = line.strip()
            if not line or ':' not in line: 
                continue
            
            parts = line.split(':')
            ru = parts[0].strip()
            tr = parts[1].strip()
            
            # Basit Kural Motoruyla Kelime Tipini Tahmin Et
            word_type = 'general'
            tr_lower = tr.lower()
            if tr_lower.endswith('mak') or tr_lower.endswith('mek') or tr_lower.endswith('mak)') or tr_lower.endswith('mek)'):
                word_type = 'verb'
            elif tr_lower.endswith('lı') or tr_lower.endswith('li') or tr_lower.endswith('lu') or tr_lower.endswith('lü'):
                word_type = 'adjective'
            elif ' ' not in tr_lower and len(tr_lower) > 3:
                word_type = 'noun'
                
            word_id = str(line_idx + 1) # data.js'teki ID matchlemesi için çok kritik!
            words.append({'id': word_id, 'ru': ru, 'tr': tr, 'type': word_type})
            
    sentences_db = {}
    
    verb_patterns = [
        ("Я хочу {ru} это сейчас.", "Bunu şimdi {tr} istiyorum."),
        ("Она любит {ru} каждый день.", "O, her gün {tr}i sever."),
        ("Нам нужно срочно {ru}.", "Acilen {tr}miz gerekiyor.")
    ]
    noun_patterns = [
        ("Это мой новый {ru}.", "Bu benim yeni {tr} (şeyim)."),
        ("Где находится {ru}?", "{tr} nerede bulunuyor?"),
        ("Я не вижу {ru} здесь.", "Burada {tr} göremiyorum.")
    ]
    adj_patterns = [
        ("Какой {ru} человек!", "Ne kadar {tr} bir insan!"),
        ("Это был очень {ru} день.", "Bu çok {tr} bir gündü."),
        ("Мне кажется, что это слишком {ru}.", "Bana öyle geliyor ki bu fazlasıyla {tr}.")
    ]
    general_patterns = [
        ("Мы обсуждали слово «{ru}».", "Biz '{ru}' kelimesi üzerine konuştuk."),
        ("Как сказать «{ru}» в предложении?", "Bir cümlede '{ru}' nasıl söylenir?"),
        ("Он неожиданно сказал «{ru}».", "Birdenbire '{ru}' dedi.")
    ]

    for w in words:
        sents = []
        patterns = general_patterns
        if w['type'] == 'verb': patterns = verb_patterns
        elif w['type'] == 'noun': patterns = noun_patterns
        elif w['type'] == 'adjective': patterns = adj_patterns
        
        # Temiz ve küçük harfli kelimeler türet
        ru_word = w['ru'].lower()
        # Türkçe kelimenin en kök halini almaya çalış (parantezleri ve okunuşları sil)
        tr_word = w['tr'].split('/')[0].split('(')[0].split(',')[0].strip().lower()
        
        for p_ru, p_tr in patterns:
            sents.append({
                "ru": p_ru.format(ru=ru_word),
                "tr": p_tr.format(tr=tr_word, ru=ru_word) # Bazı genel kalıplar ru da isteyebilir
            })
        
        sentences_db[w['id']] = sents
        
    with open('sentences.json', 'w', encoding='utf-8') as f:
        json.dump(sentences_db, f, ensure_ascii=False, indent=2)
        
    print(f"Bitti! Tüm kelimeler taranıp tam {len(words) * 3} adet örnek cümle başarıyla sentences.json dosyasına yazıldı.")

if __name__ == "__main__":
    create_synthetic_sentences()
