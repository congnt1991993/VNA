import zipfile
import xml.etree.ElementTree as ET
import os

docx_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/Document/01. Tài liệu URD_v2.0.docx"
output_path = "/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Work/04. Company/Synodus/GOV/01.VNA/VNA/scratch/urd_content.txt"

# Resolve path just in case
docx_path = os.path.abspath(docx_path)
output_path = os.path.abspath(output_path)

if not os.path.exists(docx_path):
    print("DOCX file not found at:", docx_path)
    exit(1)

print("Opening docx...")
try:
    with zipfile.ZipFile(docx_path) as z:
        # Check files in zip
        namelist = z.namelist()
        print("Zip contents count:", len(namelist))
        
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        
        # We want to extract text from w:p elements (paragraphs)
        # XML tags use namespaces, e.g. {http://schemas.openxmlformats.org/wordprocessingml/2006/main}p
        # We can extract text from w:p, w:tr, w:tc, etc.
        # Let's traverse the tree and extract paragraph and table cell text.
        
        paragraphs = []
        
        # A simple recursive function to walk the XML tree
        def get_text(element):
            tag_local = element.tag.split('}')[-1]
            
            # Paragraph
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
            
            # If not a paragraph, keep recursing down to children (but not if we already handled w:p)
            for child in element:
                get_text(child)

        get_text(root)
        
        print(f"Extracted {len(paragraphs)} paragraphs.")
        
        # Let's write them to the output file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            for p in paragraphs:
                f.write(p + "\n")
        print("Success! Written to:", output_path)
except Exception as e:
    print("Error:", e)
