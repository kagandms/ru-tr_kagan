import pypdf
import re
import os

PDF_FILES = ["b2_oxford.pdf", "b2_c1.pdf"]
OUTPUT_FILE = "ielts_words.txt"

def extract_level_and_clean(line, current_section_level):
    # Check for explicit level at end of line
    explicit_level_match = re.search(r'\b(A1|A2|B1|B2|C1|C2)$', line)
    level = current_section_level
    
    if explicit_level_match:
        level = explicit_level_match.group(1)
        # Remove the level from the line
        line = re.sub(r'\s+(A1|A2|B1|B2|C1|C2)$', '', line)
    
    # Remove parts of speech tags
    tags = [r'v\.', r'n\.', r'adj\.', r'adv\.', r'prep\.', r'pron\.', r'conj\.', r'det\.', r'num\.', r'aux\.']
    tag_pattern = r'\b(' + '|'.join(tags) + r')'
    
    line = re.sub(tag_pattern, '', line)
    
    # Remove content in parentheses
    line = re.sub(r'\(.*?\)', '', line)
    
    line = re.sub(r'[,.]', '', line) 
    line = re.sub(r'\d+$', '', line)
    line = re.sub(r'^\d+\s+', '', line)
    
    if "Oxford 5000" in line:
        return None, level
        
    line = line.strip()
    
    # Remove non-alpha start
    if not line or len(line) < 2 or not re.match(r'^[a-zA-Z]', line):
        return None, level
        
    return line, level

def extract_and_append():
    all_words = {} # format: {word_lower: (word_case, level)}
    
    # We will rebuild the list from scratch to ensure levels are correct.
    # If we rely on existing file, it has no levels.
    
    print(f"📄 Processing PDFs to extract words with levels...")

    for pdf_file in PDF_FILES:
        print(f"   Reading {pdf_file}...")
        try:
            reader = pypdf.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            # Default level logic
            # If filename contains b2 or c1, we might guess, but let's rely on content
            current_section_level = "B2" # Default to B2 if not found? Or None?
            # Oxford 5000 typically starts with B2
            
            for line in text.split('\n'):
                line = line.strip()
                if not line: continue
                
                # Check if line is JUST a level header
                if re.match(r'^(B1|B2|C1|C2)$', line):
                    current_section_level = line
                    continue
                
                cleaned_word, extracted_level = extract_level_and_clean(line, current_section_level)
                
                if cleaned_word:
                    # Priority logic: C1 > B2? Or keep first found?
                    # Generally keeping first found is safe, or overwrite if we find same word
                    # Let's overwrite to ensure we get the latest observed state
                    all_words[cleaned_word.lower()] = (cleaned_word, extracted_level)

        except Exception as e:
            print(f"   ❌ Error reading {pdf_file}: {e}")

    # Sort and write back
    sorted_items = sorted(all_words.values(), key=lambda x: x[0].lower())
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for word, level in sorted_items:
            f.write(f"{word}|{level}\n")
            
    print(f"💾 Final total: {len(sorted_items)} words written to {OUTPUT_FILE} (Format: word|level)")

if __name__ == "__main__":
    extract_and_append()
