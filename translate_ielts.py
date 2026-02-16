import json
from deep_translator import GoogleTranslator
import concurrent.futures
import time
import random
import os

INPUT_FILE = "ielts_words.txt"
OUTPUT_JS_FILE = "js/ielts_data.js"
PARTIAL_FILE = "js/ielts_progress.json"
MAX_WORKERS = 5  # Reduced threads

def translate_word(word):
    """Translates a single word to RU and TR with retries."""
    for attempt in range(3):
        try:
            # Random sleep to avoid simple rate limits
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
                "tr": tr_text
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
            # Sort alphabetially
            data.sort(key=lambda x: x['en'])
            
            js_content = f"""
// Auto-generated IELTS Data (B2 Level)
// Source: {INPUT_FILE}
// Count: {len(data)}

const IELTS_DATA = {{
    'b1': [],
    'b2': {json.dumps(data, ensure_ascii=False, indent=4)},
    'c1': []
}};

window.IELTS_DATA = IELTS_DATA;
"""
            with open(OUTPUT_JS_FILE, "w", encoding="utf-8") as f:
                f.write(js_content)
    except Exception as e:
        print(f"❌ Error saving progress: {e}", flush=True)

def translate_and_generate():
    print(f"📖 Reading {INPUT_FILE}...", flush=True)
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            words = [line.strip() for line in f if line.strip()]
    except FileNotFoundError:
        print("❌ File not found.", flush=True)
        return

    # Check for existing progress
    translated_data = []
    processed_words = set()
    
    if os.path.exists(PARTIAL_FILE):
        try:
            with open(PARTIAL_FILE, "r", encoding="utf-8") as f:
                translated_data = json.load(f)
                processed_words = {item['en'] for item in translated_data}
            print(f"🔄 Resuming from progress: {len(translated_data)} words loaded.", flush=True)
        except:
            print("⚠️ Corrupt progress file, starting fresh.", flush=True)

    words_to_process = [w for w in words if w not in processed_words]
    print(f"🔍 Found {len(words)} total words. Processing {len(words_to_process)} remaining...", flush=True)

    if not words_to_process:
        save_progress(translated_data, final=True)
        print("✅ All words already processed!", flush=True)
        return

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_word = {executor.submit(translate_word, word): word for word in words_to_process}
        
        completed_since_save = 0
        
        for future in concurrent.futures.as_completed(future_to_word):
            data = future.result()
            if data:
                translated_data.append(data)
            
            completed_since_save += 1
            
            # Save every 20 words
            if completed_since_save >= 20:
                save_progress(translated_data)
                print(f"💾 Saved progress: {len(translated_data)}/{len(words)} words...", flush=True)
                completed_since_save = 0

    # Final save
    save_progress(translated_data, final=True)
    print(f"🎉 Completed! Total: {len(translated_data)} words saved to {OUTPUT_JS_FILE}", flush=True)

if __name__ == "__main__":
    translate_and_generate()
