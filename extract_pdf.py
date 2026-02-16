import pypdf
import re
import os

PDF_FILE = "b2_c1.pdf"
OUTPUT_FILE = "ielts_words.txt"

def clean_line(line):
    # Remove CEFR levels like B2, C1 at the end
    line = re.sub(r'\s+(B2|C1)$', '', line)
    
    # Remove parts of speech tags
    tags = [r'v\.', r'n\.', r'adj\.', r'adv\.', r'prep\.', r'pron\.', r'conj\.', r'det\.', r'num\.', r'aux\.']
    tag_pattern = r'\b(' + '|'.join(tags) + r')'
    
    line = re.sub(tag_pattern, '', line)
    line = re.sub(r',\s*,', ',', line) 
    line = re.sub(r',\s*$', '', line)
    line = re.sub(r'^\d+\s+', '', line)
    
    if "Oxford 5000" in line:
        return None
        
    line = line.strip()
    
    # Remove non-alpha start
    if not line or len(line) < 2 or not re.match(r'^[a-zA-Z]', line):
        return None
        
    return line

def extract_and_append():
    # Load existing words
    existing_words = set()
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            for line in f:
                existing_words.add(line.strip().lower())
    
    print(f"📚 Loaded {len(existing_words)} existing words.")
    print(f"📄 Reading {PDF_FILE}...")
    
    try:
        reader = pypdf.PdfReader(PDF_FILE)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        new_words = []
        
        for line in text.split('\n'):
            cleaned = clean_line(line)
            if cleaned:
                word_lower = cleaned.lower()
                if word_lower not in existing_words:
                    new_words.append(cleaned)
                    existing_words.add(word_lower)

        # Sort new words
        new_words.sort()
        
        if new_words:
            with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
                for word in new_words:
                    f.write(word + "\n")
            print(f"✅ Added {len(new_words)} NEW unique words to {OUTPUT_FILE}")
        else:
            print("⚠️ No new unique words found.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    extract_and_append()
