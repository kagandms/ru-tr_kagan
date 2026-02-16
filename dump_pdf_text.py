import pypdf

PDF_FILE = "b2_c1.pdf"
OUTPUT_DEBUG_FILE = "debug_pdf_raw.txt"

def dump_raw_text():
    print(f"📄 Dumping raw text from {PDF_FILE}...")
    try:
        reader = pypdf.PdfReader(PDF_FILE)
        with open(OUTPUT_DEBUG_FILE, "w", encoding="utf-8") as f:
            for i, page in enumerate(reader.pages):
                f.write(f"--- Page {i+1} ---\n")
                f.write(page.extract_text())
                f.write("\n\n")
        print(f"✅ Raw text saved to {OUTPUT_DEBUG_FILE}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    dump_raw_text()
