import pypdf

PDF_FILE = "b2_oxford.pdf"
OUTPUT_DEBUG_FILE = "debug_oxford_raw.txt"

def dump_raw_text():
    print(f"📄 Dumping raw text from {PDF_FILE}...")
    try:
        reader = pypdf.PdfReader(PDF_FILE)
        with open(OUTPUT_DEBUG_FILE, "w", encoding="utf-8") as f:
            # Just first 2 pages
            for i in range(min(2, len(reader.pages))):
                f.write(f"--- Page {i+1} ---\n")
                f.write(reader.pages[i].extract_text())
                f.write("\n\n")
        print(f"✅ Raw text saved to {OUTPUT_DEBUG_FILE}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    dump_raw_text()
