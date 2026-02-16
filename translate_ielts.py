import json
from deep_translator import GoogleTranslator
import concurrent.futures
import time
import random
import os

INPUT_FILE = "ielts_words.txt"
OUTPUT_JS_FILE = "js/ielts_data.js"
PARTIAL_FILE = "js/ielts_progress.json"
MAX_WORKERS = 5

def translate_word(word_tuple):
    """Translates a single word to RU and TR with retries."""
    word, level = word_tuple
    
    for attempt in range(3):
        try:
            time.sleep(random.uniform(0.1, 0.5))
            
            to_ru = GoogleTranslator(source='en', target='ru')
            to_tr = GoogleTranslator(source='en', target='tr')
            
            ru_text = to_ru.translate(word)
            tr_text = to_tr.translate(word)
            
            if not ru_text or not tr_text:
                raise ValueError("Empty translation")
                
            return {
                "en": word,
                "ru": ru_text,
                "tr": tr_text,
                "level": level
            }
        except Exception as e:
            if attempt == 2:
                print(f"⚠️ Failed translating {word}: {e}", flush=True)
                return None
            time.sleep(1 * (attempt + 1))

def save_progress(data, final=False):
    """Saves current progress to partial JSON file."""
    try:
        with open(PARTIAL_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        if final:
            # Create final JS file
            # Sort alphabetically
            data.sort(key=lambda x: x['en'])
            
            js_content = f"""
// Auto-generated IELTS Data (B1-C1 Levels)
// Source: {INPUT_FILE}
// Count: {len(data)}

const IELTS_DATA = {json.dumps(data, ensure_ascii=False, indent=4)};

window.IELTS_DATA = IELTS_DATA;
"""
            with open(OUTPUT_JS_FILE, "w", encoding="utf-8") as f:
                f.write(js_content)
    except Exception as e:
        print(f"❌ Error saving progress: {e}", flush=True)

def translate_and_generate():
    print(f"📖 Reading {INPUT_FILE}...", flush=True)
    words_with_levels = {}
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if "|" in line:
                    parts = line.strip().split("|")
                    words_with_levels[parts[0]] = parts[1]
                else:
                    # Fallback if no level
                    words_with_levels[line.strip()] = "B2" 
    except FileNotFoundError:
        print("❌ File not found.", flush=True)
        return

    # Check for existing progress
    translated_data = []
    processed_map = {} # en -> {ru, tr}
    
    if os.path.exists(PARTIAL_FILE):
        try:
            with open(PARTIAL_FILE, "r", encoding="utf-8") as f:
                existing_list = json.load(f)
                for item in existing_list:
                    processed_map[item['en']] = item
            print(f"🔄 Loaded existing translations for {len(processed_map)} words.", flush=True)
        except (json.JSONDecodeError, KeyError, TypeError):
            print("⚠️ Corrupt progress file, starting fresh.", flush=True)

    # Rebuild translated_data list based on CURRENT input file
    # This effectively updates levels if they changed, and keeps translations
    final_list = []
    words_to_translate = []
    
    for word, level in words_with_levels.items():
        if word in processed_map:
            # Reuse translation, update level
            item = processed_map[word]
            item['level'] = level
            final_list.append(item)
        else:
            words_to_translate.append((word, level))
            
    print(f"🔍 Found {len(words_with_levels)} total words.")
    print(f"✅ Reused {len(final_list)} translations.")
    print(f"🚀 Need to translate {len(words_to_translate)} new words.")

    if not words_to_translate:
        save_progress(final_list, final=True)
        print("✅ All words processed!", flush=True)
        return

    # Process new words
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_word = {executor.submit(translate_word, item): item[0] for item in words_to_translate}
        
        completed_since_save = 0
        
        for future in concurrent.futures.as_completed(future_to_word):
            data = future.result()
            if data:
                final_list.append(data)
            
            completed_since_save += 1
            
            if completed_since_save >= 20:
                save_progress(final_list)
                print(f"💾 Saved progress: {len(final_list)}/{len(words_with_levels)} words...", flush=True)
                completed_since_save = 0

    # Final save
    save_progress(final_list, final=True)
    print(f"🎉 Completed! Total: {len(final_list)} words saved to {OUTPUT_JS_FILE}", flush=True)

if __name__ == "__main__":
    translate_and_generate()
