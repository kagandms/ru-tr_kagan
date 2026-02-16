import pypdf
import re
import os

PDF_FILES = ["b2_oxford.pdf", "b2_c1.pdf"]
OUTPUT_FILE = "ielts_words.txt"

def clean_line(line):
    # Remove CEFR levels globally (B1, B2, C1, etc.)
    line = re.sub(r'\b(A1|A2|B1|B2|C1|C2)\b', '', line)
    
    # Remove parts of speech tags
    tags = [r'v\.', r'n\.', r'adj\.', r'adv\.', r'prep\.', r'pron\.', r'conj\.', r'det\.', r'num\.', r'aux\.']
    tag_pattern = r'\b(' + '|'.join(tags) + r')'
    
    line = re.sub(tag_pattern, '', line)
    
    # Remove content in parentheses e.g. "counter (long flat surface)"
    line = re.sub(r'\(.*?\)', '', line)
    
    line = re.sub(r'[,.]', '', line) # Remove remaining commas/dots
    line = re.sub(r'\d+$', '', line) # Remove trailing numbers like in "bass1"
    line = re.sub(r'^\d+\s+', '', line) # Remove leading numbers
    
    if "Oxford 5000" in line:
        return None
        
    line = line.strip()
    
    # Remove non-alpha start (allow letters and hyphens)
    if not line or len(line) < 2 or not re.match(r'^[a-zA-Z]', line):
        return None
        
    return line

def extract_and_append():
    # Load existing words from file if exists, to avoid re-adding
    # But since we want to ensure *completeness* from these 2 PDFs, 
    # we might want to start fresh or just append differences.
    # The user said "skisksiz" (flawless) and "çakışma olmadan" (without conflict).
    # Best approach: Read all words from both PDFs, merge them, then write to file.
    # We will read existing file just to know what we had, but we'll overwrite 
    # or ensure the final list contains everything.
    
    all_words = set()
    
    # If we want to preserve words that were ALREADY in ielts_words.txt but NOT in these PDFs
    # (e.g. if user added some manually), we should load them.
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            for line in f:
                all_words.add(line.strip())
    
    print(f"📚 Initially loaded {len(all_words)} words from {OUTPUT_FILE}")

    for pdf_file in PDF_FILES:
        print(f"📄 Processing {pdf_file}...")
        try:
            reader = pypdf.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            count = 0
            for line in text.split('\n'):
                cleaned = clean_line(line)
                if cleaned:
                    # case-insensitive check but store original case
                    # Actually, let's store exactly what clean_line returns
                    # But we need to avoid duplicates like "Abandon" and "abandon".
                    # The list seems to be lowercase mostly, or capitalized.
                    # Let's check if the lowercase version exists.
                    
                    is_duplicate = False
                    for w in all_words:
                        if w.lower() == cleaned.lower():
                            is_duplicate = True
                            break
                    
                    if not is_duplicate:
                        all_words.add(cleaned)
                        count += 1
            print(f"   ✅ Found {count} new unique words in {pdf_file}")
            
        except Exception as e:
            print(f"   ❌ Error reading {pdf_file}: {e}")

    # Sort and write back
    sorted_words = sorted(list(all_words), key=lambda x: x.lower())
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for word in sorted_words:
            f.write(word + "\n")
            
    print(f"💾 Final total: {len(sorted_words)} words written to {OUTPUT_FILE}")

if __name__ == "__main__":
    extract_and_append()
