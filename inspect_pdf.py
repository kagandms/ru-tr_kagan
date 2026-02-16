import pypdf
import re

PDF_FILE = "b2_c1.pdf"
EXISTING_FILE = "ielts_words.txt"

def analyze_pdf():
    print(f"🕵️‍♂️ Analyzing {PDF_FILE}...")
    try:
        reader = pypdf.PdfReader(PDF_FILE)
        raw_text = ""
        for page in reader.pages:
            raw_text += page.extract_text() + "\n"
            
        print(f"📄 Raw PDF Length: {len(raw_text)} characters")
        
        # Simple split to see how many "tokens" exist
        tokens = raw_text.split()
        print(f"🔢 Total tokens in PDF: {len(tokens)}")
        
        # Count lines that look like definitions/entries
        # Oxford list usually has format: "word part_of_speech CEFR"
        # e.g., "abandon v. B2"
        potential_entries = re.findall(r'^[a-zA-Z-]+\s+[a-z.,]+\s+(?:B2|C1)', raw_text, re.MULTILINE)
        print(f"🧐 Potential entries matching 'word pos level': {len(potential_entries)}")
        
        with open(EXISTING_FILE, 'r') as f:
            existing_count = len(f.readlines())
        
        print(f"📚 Current extracted words: {existing_count}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_pdf()
