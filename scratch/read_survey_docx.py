import zipfile
import xml.etree.ElementTree as ET
import os
import glob

survey_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/Document/2. Biên bản khảo sát EU đã xác nhận"
output_dir = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/survey_texts"

os.makedirs(output_dir, exist_ok=True)

# Find all docx files in survey directory
docx_files = glob.glob(os.path.join(survey_dir, "*.docx"))
print(f"Found {len(docx_files)} docx files.")

def extract_docx_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            paragraphs = []
            def get_text(element):
                tag_local = element.tag.split('}')[-1]
                if tag_local == 'p':
                    p_text = []
                    for child in element.iter():
                        c_tag = child.tag.split('}')[-1]
                        if c_tag == 't' and child.text:
                            p_text.append(child.text)
                    text = "".join(p_text).strip()
                    if text:
                        paragraphs.append(text)
                    return
                for child in element:
                    get_text(child)
            
            get_text(root)
            return paragraphs
    except Exception as e:
        print(f"Error parsing {docx_path}: {e}")
        return None

for docx_path in docx_files:
    basename = os.path.basename(docx_path)
    txt_name = basename.replace(".docx", ".txt")
    output_path = os.path.join(output_dir, txt_name)
    
    print(f"Parsing {basename}...")
    paragraphs = extract_docx_text(docx_path)
    if paragraphs is not None:
        with open(output_path, 'w', encoding='utf-8') as f:
            for p in paragraphs:
                f.write(p + "\n")
        print(f"Success! Written to {output_path} ({len(paragraphs)} paragraphs)")
