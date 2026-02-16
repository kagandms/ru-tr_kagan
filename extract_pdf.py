import pypdf
import re

PDF_FILE = "b2_oxford.pdf"
OUTPUT_FILE = "ielts_words.txt"

def clean_line(line):
    # Remove CEFR levels like B2, C1 at the end
    line = re.sub(r'\s+(B2|C1)$', '', line)
    
    # Remove parts of speech tags
    # standard tags: v., n., adj., adv., prep., pron., conj., det., num., aux.
    # formatting can be "n., v." or "adj."
    # We remove them if they appear at the end or surrounded by spaces
    tags = [r'v\.', r'n\.', r'adj\.', r'adv\.', r'prep\.', r'pron\.', r'conj\.', r'det\.', r'num\.', r'aux\.']
    tag_pattern = r'\b(' + '|'.join(tags) + r')'
    
    # Remove tags (repeatedly in case of "n., v.")
    line = re.sub(tag_pattern, '', line)
    
    # Remove commas left behind like " ," or ", "
    line = re.sub(r',\s*,', ',', line) 
    line = re.sub(r',\s*$', '', line)
    
    # Remove leading/trailing numbers (e.g. "1 v.")
    line = re.sub(r'^\d+\s+', '', line)
    
    # Remove "The Oxford 5000..." headers
    if "Oxford 5000" in line:
        return None
        
    # Clean whitespace
    line = line.strip()
    
    # Remove lines that are just symbols or too short
    if not line or len(line) < 2:
        return None
        
    return line

def extract_words():
    print(f"📄 Reading {PDF_FILE}...")
    try:
        reader = pypdf.PdfReader(PDF_FILE)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        words = []
        seen = set()
        
        for line in text.split('\n'):
            cleaned = clean_line(line)
            if cleaned:
                # If it's a valid word line, it usually starts with a letter
                if re.match(r'^[a-zA-Z]', cleaned):
                    # Check duplication
                    if cleaned not in seen:
                        words.append(cleaned)
                        seen.add(cleaned)

        words.sort()
        
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            for word in words:
                f.write(word + "\n")
                
        print(f"✅ Extracted and cleaned {len(words)} lines to {OUTPUT_FILE}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    extract_words()
