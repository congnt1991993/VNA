import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

print("Rebuilding HDSD_Khuyen_Nghi_Claim_SAF with embedded screenshots...")

doc = docx.Document()

# Page Setup: A4, Margins
section = doc.sections[0]
section.page_width = Inches(8.27)
section.page_height = Inches(11.69)
section.top_margin = Pt(56.7)       # 2.0 cm
section.bottom_margin = Pt(56.7)    # 2.0 cm
section.left_margin = Pt(70.85)     # 2.5 cm
section.right_margin = Pt(56.7)     # 2.0 cm
section.header_distance = Pt(35.4)
section.footer_distance = Pt(35.4)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    tcPr.append(shd)

def set_cell_borders(cell, top='D1D5DB', bottom='D1D5DB', left='D1D5DB', right='D1D5DB'):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge, color in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        if color:
            el = OxmlElement(f'w:{edge}')
            el.set(qn('w:val'), 'single')
            el.set(qn('w:sz'), '4')
            el.set(qn('w:space'), '0')
            el.set(qn('w:color'), color)
            tcBorders.append(el)
        else:
            el = OxmlElement(f'w:{edge}')
            el.set(qn('w:val'), 'none')
            tcBorders.append(el)
    tcPr.append(tcBorders)

# Header & Footer
header = section.header
p_head = header.paragraphs[0]
p_head.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r_head = p_head.add_run("TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM — HỆ THỐNG VNA NETZERO (ESG)")
r_head.font.name = 'Times New Roman'
r_head.font.size = Pt(8.5)
r_head.font.italic = True
r_head.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

footer = section.footer
p_foot = footer.paragraphs[0]
p_foot.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r_foot = p_foot.add_run("Tài liệu hướng dẫn sử dụng nội bộ — Khuyến nghị Claim SAF | Trang ")
r_foot.font.name = 'Times New Roman'
r_foot.font.size = Pt(8.5)
r_foot.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)

fldSimple = OxmlElement('w:fldSimple')
fldSimple.set(qn('w:instr'), 'PAGE')
p_foot._p.append(fldSimple)

# ----------------- COVER PAGE -----------------
p_org = doc.add_paragraph()
p_org.paragraph_format.space_before = Pt(10)
p_org.paragraph_format.space_after = Pt(2)
r_org = p_org.add_run("TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP\nVIETNAM AIRLINES JSC")
r_org.font.name = 'Times New Roman'
r_org.font.size = Pt(12)
r_org.font.bold = True
r_org.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)

p_div = doc.add_paragraph()
p_div.paragraph_format.space_after = Pt(45)
r_div = p_div.add_run("——————————————— o0o ———————————————")
r_div.font.name = 'Times New Roman'
r_div.font.size = Pt(10)
r_div.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)

p_title = doc.add_paragraph()
p_title.paragraph_format.space_before = Pt(20)
p_title.paragraph_format.space_after = Pt(10)
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_title = p_title.add_run("TÀI LIỆU HƯỚNG DẪN SỬ DỤNG")
r_title.font.name = 'Times New Roman'
r_title.font.size = Pt(24)
r_title.font.bold = True
r_title.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)

p_subtitle = doc.add_paragraph()
p_subtitle.paragraph_format.space_after = Pt(16)
p_subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_sub = p_subtitle.add_run("HỆ THỐNG QUẢN TRỊ BÁO CÁO PHÁT TRIỂN BỀN VỮNG (ESG)\nCHỨC NĂNG KHUYẾN NGHỊ CLAIM NHIÊN LIỆU HÀNG KHÔNG BỀN VỮNG (SAF)")
r_sub.font.name = 'Times New Roman'
r_sub.font.size = Pt(14)
r_sub.font.bold = True
r_sub.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

p_sub2 = doc.add_paragraph()
p_sub2.paragraph_format.space_after = Pt(50)
p_sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_sub2 = p_sub2.add_run("(CÔNG CỤ TỐI ƯU HÓA PHÂN BỔ TÍN CHỈ VÀ CHI PHÍ TUÂN THỦ EU ETS / UK ETS / CORSIA)")
r_sub2.font.name = 'Times New Roman'
r_sub2.font.size = Pt(11)
r_sub2.font.italic = True
r_sub2.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

# Metadata Table
tbl_meta = doc.add_table(rows=5, cols=2)
tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
meta_data = [
    ("Mã tài liệu:", "VNA-ESG-HDSD-SAF"),
    ("Phiên bản:", "3.0 (Cập nhật chuẩn dữ liệu BATCH No, DEP, ARR, FLS kèm hình ảnh)"),
    ("Ngày ban hành:", "01/10/2026"),
    ("Đơn vị chủ trì:", "Ban Kế hoạch Phát triển & Ban Quản lý Vật tư"),
    ("Phạm vi áp dụng:", "Toàn bộ các Tổ ban & Đơn vị trực thuộc Vietnam Airlines")
]

for row_idx, (k, v) in enumerate(meta_data):
    cell_k = tbl_meta.cell(row_idx, 0)
    cell_v = tbl_meta.cell(row_idx, 1)
    cell_k.width = Inches(2.2)
    cell_v.width = Inches(4.3)
    
    set_cell_margins(cell_k, top=60, bottom=60, left=100, right=100)
    set_cell_margins(cell_v, top=60, bottom=60, left=100, right=100)
    set_cell_borders(cell_k, top='E5E7EB', bottom='E5E7EB', left=None, right=None)
    set_cell_borders(cell_v, top='E5E7EB', bottom='E5E7EB', left=None, right=None)
    
    pk = cell_k.paragraphs[0]
    rk = pk.add_run(k)
    rk.font.name = 'Times New Roman'
    rk.font.size = Pt(10.5)
    rk.font.bold = True
    rk.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    
    pv = cell_v.paragraphs[0]
    rv = pv.add_run(v)
    rv.font.name = 'Times New Roman'
    rv.font.size = Pt(10.5)
    rv.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

doc.add_page_break()

# ----------------- MỤC LỤC -----------------
p_toc = doc.add_paragraph()
p_toc.paragraph_format.space_before = Pt(10)
p_toc.paragraph_format.space_after = Pt(10)
r_toc = p_toc.add_run("MỤC LỤC TÀI LIỆU")
r_toc.font.name = 'Times New Roman'
r_toc.font.size = Pt(15)
r_toc.font.bold = True
r_toc.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)

toc_items = [
    ("1. GIỚI THIỆU CHỨC NĂNG KHUYẾN NGHỊ CLAIM SAF", "Trang 3"),
    ("   1.1. Bối cảnh & Mục đích nghiệp vụ", "Trang 3"),
    ("   1.2. Đối tượng sử dụng & Phân quyền", "Trang 3"),
    ("   1.3. Bảng giải thích thuật ngữ chuyên môn (Glossary)", "Trang 4"),
    ("2. QUY TRÌNH NGHIỆP VỤ 4 BƯỚC TỔNG QUAN", "Trang 5"),
    ("3. HƯỚNG DẪN THAO TÁC CHI TIẾT TRÊN GIAO DIỆN", "Trang 6"),
    ("   3.1. Truy cập & Toàn cảnh giao diện (Hình 1)", "Trang 6"),
    ("   3.2. Thanh điều khiển đầu trang & Chọn năm mô phỏng (Hình 2)", "Trang 7"),
    ("   3.3. Cấu hình khối Tín chỉ CO2 & Cơ chế thị trường (Hình 3)", "Trang 8"),
    ("   3.4. Quản lý & Phân bổ Bảng Lô SAF (Hình 4, 5)", "Trang 10"),
    ("   3.5. Xuất Báo cáo Excel Bảng Phân bổ Lô SAF", "Trang 13"),
    ("   3.6. Đánh giá Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải (Hình 6)", "Trang 14"),
    ("   3.7. Thao tác Thêm mới Lô SAF (Hình 7)", "Trang 16"),
    ("   3.8. Quản lý Danh sách Kịch bản & So sánh Đối đầu (Hình 8, 9)", "Trang 17"),
    ("4. CÁC QUY TẮC NGHIỆP VỤ & LƯU Ý QUAN TRỌNG (BUSINESS RULES)", "Trang 19")
]

for title, page in toc_items:
    p_item = doc.add_paragraph()
    p_item.paragraph_format.space_after = Pt(3)
    p_item.paragraph_format.line_spacing = 1.15
    r_t = p_item.add_run(title)
    r_t.font.name = 'Times New Roman'
    r_t.font.size = Pt(11)
    if not title.startswith("   "):
        r_t.font.bold = True
        r_t.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)
    else:
        r_t.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        
    p_item.add_run(" " + "." * max(10, 68 - len(title)) + " ")
    r_p = p_item.add_run(page)
    r_p.font.name = 'Times New Roman'
    r_p.font.size = Pt(10)
    r_p.font.italic = True
    r_p.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)

doc.add_page_break()

# ----------------- CONTENT HELPERS -----------------
def add_h1(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14.5)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)
    return p

def add_h2(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(11)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12.5)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
    return p

def add_h3(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11.5)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0x1F, 0x4D, 0x78)
    return p

def add_p(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    return p

def add_bullet(text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(2.5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_b = p.add_run(bold_prefix + ": ")
        r_b.font.name = 'Times New Roman'
        r_b.font.size = Pt(11)
        r_b.font.bold = True
        r_b.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
    return p

def add_callout(title, text, box_type='note'):
    color_map = {
        'note': {'border': '005F6E', 'bg': 'F0FDF4', 'title_color': RGBColor(0x00, 0x5F, 0x6E)},
        'warning': {'border': 'D97706', 'bg': 'FEF3C7', 'title_color': RGBColor(0xD9, 0x77, 0x06)},
        'tip': {'border': '16A34A', 'bg': 'DCFCE7', 'title_color': RGBColor(0x16, 0xA3, 0x4A)}
    }
    cfg = color_map.get(box_type, color_map['note'])
    
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    
    set_cell_shading(cell, cfg['bg'])
    set_cell_margins(cell, top=90, bottom=90, left=140, right=140)
    set_cell_borders(cell, left=cfg['border'], top='E5E7EB', right='E5E7EB', bottom='E5E7EB')
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(f"{title}: ")
    r_title.bold = True
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = cfg['title_color']
    
    r_text = p.add_run(text)
    r_text.font.name = 'Times New Roman'
    r_text.font.size = Pt(10.5)
    r_text.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_after = Pt(3)

def add_image_with_caption(img_path, caption_text, width_inches=6.2):
    """Add a screenshot image with a centered caption below it."""
    if os.path.exists(img_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(img_path, width=Inches(width_inches))
        
        # Caption paragraph
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(10)
        r_cap = p_cap.add_run(caption_text)
        r_cap.font.name = 'Times New Roman'
        r_cap.font.size = Pt(10)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    else:
        print(f"Warning: Image file not found: {img_path}")

# ----------------- SECTION 1 -----------------
add_h1("1. GIỚI THIỆU CHỨC NĂNG KHUYẾN NGHỊ CLAIM SAF")

add_h2("1.1. Bối cảnh & Mục đích nghiệp vụ")
add_p("Trong chiến lược phát triển bền vững và lộ trình hướng tới Net Zero 2050 của Tổng công ty Hàng không Việt Nam (Vietnam Airlines), việc sử dụng Nhiên liệu hàng không bền vững (Sustainable Aviation Fuel - SAF) là giải pháp giảm phát thải trực tiếp quan trọng nhất nhưng cũng đòi hỏi chi phí đầu tư rất lớn do giá thành SAF hiện cao gấp 2 đến 3 lần nhiên liệu hóa thạch truyền thống (Jet A-1).")
add_p("Đồng thời, khi thực hiện các đường bay quốc tế, Vietnam Airlines phải tuân thủ đồng thời nhiều cơ chế quản lý phát thải khắt khe với các quy chế bù trừ và đơn giá tín chỉ carbon phạt rất khác nhau:")
add_bullet("Hệ thống giao dịch phát thải của Liên minh châu Âu, đi kèm quy định bắt buộc tỷ lệ pha trộn SAF (ReFuelEU Aviation) từ năm 2025 tại các sân bay thuộc khối EU (Paris CDG, Frankfurt FRA...) và cơ chế cấp hạn ngạch miễn trừ CO2 tương ứng.", "Cơ chế EU ETS (Châu Âu)")
add_bullet("Hệ thống giao dịch phát thải độc lập của Vương quốc Anh, áp dụng cho các chuyến bay khởi hành từ các sân bay Anh (London Heathrow LHR...).", "Cơ chế UK ETS (Vương quốc Anh)")
add_bullet("Chương trình giảm trừ & bù đắp carbon đối với các chuyến bay quốc tế do Tổ chức Hàng không Dân dụng Quốc tế (ICAO) ban hành, áp dụng cho các chặng bay quốc tế giữa các quốc gia thành viên.", "Cơ chế CORSIA (Quốc tế / ICAO)")

add_p("Mục đích cốt lõi của chức năng Khuyến nghị Claim SAF là giúp Vietnam Airlines giải quyết bài toán: 'Nên phân bổ và gán Claim từng lô SAF đã nạp vào cơ chế tuân thủ nào (EU ETS, UK ETS hay CORSIA) để tối đa hóa lượng CO2 được miễn trừ và tiết kiệm chi phí tài chính cao nhất cho Tổng công ty?'.")

add_h2("1.2. Đối tượng sử dụng & Phân quyền")
add_bullet("Chủ trì xây dựng kịch bản, cập nhật đơn giá tín chỉ thị trường, điều hành phân bổ lô SAF, so sánh hiệu quả kinh tế và trình Lãnh đạo phê duyệt kịch bản chính thức.", "Ban Kế hoạch Phát triển (Ban KHPT)")
add_bullet("Cập nhật thông tin chi tiết các lô nhiên liệu SAF thực tế đã mua và nạp (Mã lô BATCH No, ngày nạp, sân bay đi DEP, sân bay đến ARR, nhà cung cấp, chứng chỉ phát thải vòng đời LCA).", "Ban Quản lý Vật tư (Ban QLVT)")
add_bullet("Cung cấp số liệu khai thác chuyến bay thực tế (FLS), khối lượng nhiên liệu nạp theo từng chặng bay để đối chiếu kiểm toán.", "Trung tâm Điều hành Khai thác (TTĐHKT)")
add_bullet("Xem xét các chỉ số phân tích hiệu quả tài chính, so sánh các kịch bản phân bổ và chỉ đạo chiến lược mua nhiên liệu SAF & tín chỉ carbon.", "Ban Lãnh đạo Tổng công ty (BOD / Executive Board)")

add_h2("1.3. Bảng giải thích thuật ngữ chuyên môn (Glossary)")
tbl_glossary = doc.add_table(rows=11, cols=3)
tbl_glossary.alignment = WD_TABLE_ALIGNMENT.CENTER
gl_headers = ["Thuật Ngữ", "Tên Đầy Đủ / Tiếng Anh", "Định Nghĩa & Ý Nghĩa Nghiệp Vụ Tại VNA"]
gl_widths = [Inches(1.2), Inches(2.0), Inches(3.3)]

for c_idx, h in enumerate(gl_headers):
    c = tbl_glossary.cell(0, c_idx)
    c.width = gl_widths[c_idx]
    set_cell_shading(c, "005F6E")
    set_cell_margins(c, top=70, bottom=70, left=90, right=90)
    set_cell_borders(c, top='005F6E', bottom='005F6E', left='005F6E', right='005F6E')
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(h)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

gl_data = [
    ("SAF", "Sustainable Aviation Fuel", "Nhiên liệu hàng không bền vững có nguồn gốc sinh học hoặc tái tạo."),
    ("NEAT SAF", "Neat / Pure SAF (100%)", "Khối lượng nhiên liệu SAF nguyên chất chưa pha trộn với Jet A-1 (đơn vị: Tấn)."),
    ("BATCH No", "Batch Number / PoS Code", "Mã số định danh lô nhiên liệu do nhà cung cấp cấp theo Chứng chỉ bền vững."),
    ("DEP", "Departure Airport (IATA Code)", "Mã sân bay xuất phát/khởi hành của chuyến bay tra nạp SAF (VD: CDG, FRA, SIN)."),
    ("ARR", "Arrival Airport (IATA Code)", "Mã sân bay đến/đáp của chuyến bay (VD: HAN, SGN, LHR)."),
    ("FLS", "Flight Legs Count", "Số lượng chuyến bay đủ điều kiện áp dụng bù trừ từ lô SAF tương ứng."),
    ("EUA", "EU Allowance", "Tín chỉ hạn ngạch phát thải thuộc cơ chế EU ETS (1 EUA = 1 tCO2)."),
    ("UKA", "UK Allowance", "Tín chỉ hạn ngạch phát thải thuộc cơ chế UK ETS (1 UKA = 1 tCO2)."),
    ("CEU", "CORSIA Eligible Unit", "Tín chỉ giảm phát thải đủ điều kiện được ICAO công nhận trong cơ chế CORSIA."),
    ("Claim SAF", "SAF Claiming Process", "Hành động chính thức ghi nhận và khấu trừ lượng giảm phát thải từ lô SAF vào 1 cơ chế.")
]

for r_idx, (col1, col2, col3) in enumerate(gl_data, start=1):
    bg_col = "F9FAFB" if r_idx % 2 == 1 else "FFFFFF"
    for c_idx, val in enumerate([col1, col2, col3]):
        c = tbl_glossary.cell(r_idx, c_idx)
        c.width = gl_widths[c_idx]
        set_cell_shading(c, bg_col)
        set_cell_margins(c, top=50, bottom=50, left=80, right=80)
        set_cell_borders(c, top='E5E7EB', bottom='E5E7EB', left='E5E7EB', right='E5E7EB')
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(val)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)
        if c_idx == 0:
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

p_sp1 = doc.add_paragraph()
p_sp1.paragraph_format.space_after = Pt(4)

# ----------------- SECTION 2 -----------------
add_h1("2. QUY TRÌNH NGHIỆP VỤ 4 BƯỚC TỔNG QUAN")
add_p("Quy trình tính toán và phân bổ khuyến nghị Claim SAF trên hệ thống được chuẩn hóa qua 4 bước khép kín:")
add_bullet("Thiết lập đơn giá tín chỉ carbon thị trường (EUA, UKA, CEU), tỷ giá quy đổi VND/USD, hạn ngạch miễn trừ và phát thải cơ sở của năm mô phỏng.", "Bước 1: Cấu hình tham số thị trường")
add_bullet("Quản lý danh sách các lô nhiên liệu SAF đã tra nạp, kiểm tra sân bay đi (DEP), sân bay đến (ARR), khối lượng NEAT SAF và các cơ chế đủ điều kiện được phép claim.", "Bước 2: Quản lý & Lọc danh mục lô SAF")
add_bullet("Lựa chọn cơ chế gán Claim chính thức (Apply) cho từng lô SAF dựa trên nguyên tắc ưu tiên cơ chế có đơn giá tín chỉ phạt cao nhất (EU ETS > UK ETS > CORSIA) nhằm tối đa hóa số tiền được giảm trừ.", "Bước 3: Phân bổ & Gán cơ chế Claim")
add_bullet("Theo dõi lượng CO2 offset, số tín chỉ còn thiếu phải mua bù đắp, tổng chi phí tuân thủ toàn hãng, so sánh hiệu quả với kịch bản gốc và xuất báo cáo Excel.", "Bước 4: Đánh giá tài chính & Lưu / Xuất kịch bản")

# ----------------- SECTION 3 -----------------
add_h1("3. HƯỚNG DẪN THAO TÁC CHI TIẾT TRÊN GIAO DIỆN")

add_h2("3.1. Truy cập & Toàn cảnh giao diện")
add_p("Người dùng truy cập vào phân hệ bằng cách chọn mục 'KHUYẾN NGHỊ CLAIM SAF' trên menu điều hướng bên trái (hoặc đường dẫn /netzero-simulation-v2). Toàn bộ màn hình được thiết kế theo luồng làm việc trực quan từ trên xuống dưới:")

add_image_with_caption('images/document/BA DOC/images/saf_overview.png', 
                       'Hình 1: Toàn cảnh màn hình Khuyến nghị Claim SAF trên hệ thống VNA Netzero', 
                       width_inches=6.2)

add_h2("3.2. Thanh điều khiển đầu trang & Chọn năm mô phỏng")
add_p("Thanh điều khiển đầu trang cho phép chuyển đổi kỳ mô phỏng và truy cập nhanh các tính năng quản lý kịch bản:")

add_image_with_caption('images/document/BA DOC/images/saf_toolbar.png', 
                       'Hình 2: Thanh điều khiển đầu trang - Chọn năm mô phỏng và các nút kịch bản', 
                       width_inches=6.2)

add_bullet("Chọn năm cần lập mô phỏng phân bổ (VD: 'Năm 2026', 'Năm 2027'...). Khi đổi năm, hệ thống tự động tải bộ tham số và danh sách lô SAF tương ứng.", "Dropdown 'Năm mô phỏng'")
add_bullet("Mở popup lưu trữ kịch bản. Người dùng có thể xem lại các phương án phân bổ đã lưu trước đây, xem chi tiết tham số hoặc nạp lại (Load) kịch bản lên màn hình làm việc.", "Nút 'Danh sách kịch bản (N)'")
add_bullet("Mở modal đối chiếu đa chiều cạnh nhau (Side-by-side) giữa các kịch bản phân bổ khác nhau để đánh giá chênh lệch chi phí tài chính và lượng CO2 offset.", "Nút 'So sánh kịch bản'")
add_bullet("Lấy lại số liệu mặc định từ hệ thống kho dữ liệu trung tâm nếu người dùng đã chỉnh sửa thử nghiệm.", "Nút 'Đồng bộ dữ liệu'")

add_h2("3.3. Cấu hình khối Tín chỉ CO2 & Cơ chế Thị trường")
add_p("Khu vực đầu màn hình gồm 3 thẻ thông số song song thể hiện 3 cơ chế thị trường quốc tế:")

add_image_with_caption('images/document/BA DOC/images/saf_market_params.png', 
                       'Hình 3: Khối cấu hình Tham số Tín chỉ CO2 thị trường (EU ETS, UK ETS, CORSIA)', 
                       width_inches=6.2)

add_h3("Thẻ 1: EU ETS (Châu Âu)")
add_bullet("Đơn giá hạn ngạch EUA giao dịch trên sàn Châu Âu (mặc định tham chiếu: 76.5 $ / EUA, có badge hiển thị góc phải). Người dùng có thể nhập điều chỉnh theo biến động thị trường.", "Đơn giá tín chỉ EUA ($/tCO2)")
add_bullet("Tỷ giá chuyển đổi từ USD sang đồng Việt Nam (mặc định: 25,450 VND/USD). Hệ thống tự động tính: Giá quy đổi = ~1,946,925 VND/tCO2.", "Tỷ giá quy đổi VND")
add_bullet("Tổng nghĩa vụ phát thải CO2 của các chuyến bay VNA thuộc phạm vi Châu Âu trong năm (mặc định: 28,500 tCO2).", "Tổng phát thải CO2")
add_bullet("Số tấn CO2 được cơ quan quản lý EU cấp miễn phí theo quy chế ReFuelEU Aviation (mặc định: 5,200 tCO2, kèm badge 'Miễn trừ').", "Hạn ngạch miễn trừ")
add_bullet("Hiển thị phát thải thực tế sau khi trừ hạn ngạch miễn phí = 23,300 tCO2.", "Chỉ số chốt chân thẻ")

add_h3("Thẻ 2: UK ETS (Vương quốc Anh)")
add_bullet("Đơn vị tín chỉ UKA (mặc định: 58.0 $ / UKA, tỷ giá 25,450 VND/USD -> Giá quy đổi ~1,476,100 VND).", "Đơn giá tín chỉ UKA")
add_bullet("Tổng phát thải năm: 9,200 tCO2; Hạn ngạch miễn phí cấp theo quy chế Anh: 1,100 tCO2; Phát thải sau miễn giảm: 8,100 tCO2.", "Chỉ số phát thải UK ETS")

add_h3("Thẻ 3: CORSIA (Quốc tế / ICAO)")
add_bullet("Đơn vị tín chỉ CEU (mặc định: 22.5 $ / CEU -> Giá quy đổi ~572,625 VND).", "Đơn giá tín chỉ CORSIA")
add_bullet("Hiển thị badge 'CORSIA Rule' gồm: Tỷ lệ tăng trưởng ngành (20.0%), Tỷ trọng Sectoral (100%), Tỷ trọng Individual (0%), Baseline phát thải (2.254.192 tCO2).", "Các tham số đặc thù")
add_bullet("Hiển thị công thức tính trực quan ngay dưới kết quả: Phải bù trừ = (48.000 x 20%) x 100% = 9.600 tCO2.", "Công thức tính toán CORSIA")

add_h2("3.4. Quản lý & Phân bổ Bảng Lô SAF (Chuẩn Quốc Tế)")
add_p("Bảng 'PHÂN BỔ LÔ NHIÊN LIỆU SAF' là trung tâm điều hành nghiệp vụ của màn hình, được xây dựng theo chuẩn khai báo hàng không quốc tế với cấu trúc tiêu đề 2 tầng:")

add_image_with_caption('images/document/BA DOC/images/saf_table.png', 
                       'Hình 4: Bảng Phân bổ Lô Nhiên liệu SAF theo chuẩn quốc tế (BATCH No, DEP, ARR, NEAT SAF, FLS, CO2, USD, Apply)', 
                       width_inches=6.2)

tbl_saf_struct = doc.add_table(rows=11, cols=3)
tbl_saf_struct.alignment = WD_TABLE_ALIGNMENT.CENTER
headers_saf = ["Tên Cột (Header)", "Kiểu Dữ Liệu & Thao Tác", "Ý Nghĩa Nghiệp Vụ & Quy Tắc Tính Toán"]
widths_saf = [Inches(1.5), Inches(1.8), Inches(3.2)]

for c_idx, h in enumerate(headers_saf):
    c = tbl_saf_struct.cell(0, c_idx)
    c.width = widths_saf[c_idx]
    set_cell_shading(c, "005F6E")
    set_cell_margins(c, top=70, bottom=70, left=90, right=90)
    set_cell_borders(c, top='005F6E', bottom='005F6E', left='005F6E', right='005F6E')
    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(h)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

saf_columns_doc = [
    ("BATCH No", "Văn bản (In đậm, link chi tiết)", "Mã số định danh lô SAF (VD: SAF-2026-EU-01). Bấm vào để xem chứng chỉ và thông tin nhà cung cấp."),
    ("Ngày nạp", "Ngày (DD/MM/YYYY)", "Ngày tra nạp nhiên liệu SAF thực tế lên tàu bay."),
    ("DEP", "Badge sân bay (3 ký tự IATA)", "Sân bay xuất phát/khởi hành (VD: CDG, FRA, LHR, SIN, HAN). Quyết định điều kiện hưởng cơ chế."),
    ("ARR", "Badge sân bay (3 ký tự IATA)", "Sân bay đến/đáp của chặng bay (VD: HAN, SGN, CDG)."),
    ("NEAT SAF", "Số thực (Tấn, cho phép sửa)", "Khối lượng SAF nguyên chất 100% trong lô. Người dùng có thể chỉnh sửa số tấn trực tiếp."),
    ("FLS", "Nhóm 3 cột: FLS_EU, FLS_UK, FLS_CORSIA", "Số lượng chuyến bay được phân bổ và hưởng lợi ích giảm trừ tương ứng của từng cơ chế."),
    ("CO2", "Nhóm 3 cột: CO2_EU, CO2_UK, CO2_CORSIA", "Khối lượng CO2 giảm trừ (tCO2). Tính tự động = Khối lượng Neat SAF x Hệ số phát thải vòng đời LCA."),
    ("USD", "Nhóm 3 cột: USD_EU, USD_UK, USD_CORSIA", "Giá trị tài chính được giảm trừ ($). Tính tự động = Lượng CO2 giảm trừ x Đơn giá tín chỉ của cơ chế đó."),
    ("Apply", "Dropdown chọn cơ chế (EU / UK / CORSIA)", "Cơ chế chính thức gán Claim cho lô SAF này. Thay đổi cơ chế sẽ tự động dịch chuyển số liệu phân bổ."),
    ("Thao tác", "Icon Thùng rác (Xóa)", "Xóa lô SAF khỏi bảng tính sau khi có hộp thoại xác nhận.")
]

for r_idx, (col1, col2, col3) in enumerate(saf_columns_doc, start=1):
    bg_col = "F9FAFB" if r_idx % 2 == 1 else "FFFFFF"
    for c_idx, val in enumerate([col1, col2, col3]):
        c = tbl_saf_struct.cell(r_idx, c_idx)
        c.width = widths_saf[c_idx]
        set_cell_shading(c, bg_col)
        set_cell_margins(c, top=50, bottom=50, left=80, right=80)
        set_cell_borders(c, top='E5E7EB', bottom='E5E7EB', left='E5E7EB', right='E5E7EB')
        p = c.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(val)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)
        if c_idx == 0:
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x00, 0x5F, 0x6E)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        else:
            r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

p_sp2 = doc.add_paragraph()
p_sp2.paragraph_format.space_after = Pt(4)

add_h3("Bộ lọc thông minh trên bảng:")
add_p("Hàng bộ lọc nằm ngay dưới tiêu đề cột cho phép lọc đa chiều tức thì:")

add_image_with_caption('images/document/BA DOC/images/saf_table_filter.png', 
                       'Hình 5: Hàng bộ lọc đa chiều theo Mã lô, Sân bay xuất phát DEP và Sân bay đến ARR', 
                       width_inches=6.2)

add_bullet("Gõ từ khóa mã lô (VD 'EU-01') để lọc nhanh lô hàng.", "Tìm kiếm theo BATCH No")
add_bullet("Lọc danh sách theo sân bay khởi hành CDG, FRA, LHR, SIN hoặc Tất cả.", "Lọc theo Sân bay đi (DEP)")
add_bullet("Lọc danh sách theo sân bay hạ cánh HAN, SGN hoặc Tất cả.", "Lọc theo Sân bay đến (ARR)")
add_bullet("Lọc theo cơ chế đang gán: Tất cả / EU ETS / UK ETS / CORSIA.", "Lọc theo Cơ chế áp dụng (Apply)")

add_h2("3.5. Xuất Báo cáo Excel Bảng Phân bổ Lô SAF")
add_p("Hệ thống cung cấp nút bấm 'Xuất Excel' tại góc trên bên phải của bảng:")
add_bullet("File Excel (.xlsx) được xuất theo đúng mẫu biểu kiểm toán hàng không quốc tế, gồm 2 dòng header: Dòng 1 nhóm các cột FLS, CO2, USD; Dòng 2 chi tiết từng cơ chế (EU ETS, UK ETS, CORSIA).", "Định dạng file xuất")
add_bullet("Tự động áp dụng bộ lọc hiện tại trên màn hình (nếu đang lọc CDG thì file Excel chỉ xuất các lô CDG).", "Tính đồng bộ dữ liệu")
add_bullet("Hỗ trợ gửi trực tiếp cho đơn vị kiểm toán độc lập và nộp báo cáo ReFuelEU / CORSIA hàng năm.", "Mục đích sử dụng")

add_h2("3.6. Đánh giá Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải")
add_p("Khu vực cuối trang tự động tổng hợp kết quả của toàn bộ kịch bản phân bổ hiện thời, chia làm 2 cột phân tích chuyên sâu:")

add_image_with_caption('images/document/BA DOC/images/saf_financial_summary.png', 
                       'Hình 6: Khối Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải toàn hãng (CO2 Offset & Chi phí tuân thủ)', 
                       width_inches=6.2)

add_h3("Cột trái: 1. CO2 Offset & Giảm thiểu")
add_bullet("Tổng lượng phát thải CO2 thực tế đã được cắt giảm nhờ nạp SAF (VD: 20.150 tCO2 = Tổng cột CO2 của các lô).", "Tổng CO2 Giảm thiểu")
add_bullet("Bảng bóc tách chi tiết: Tổng phát thải thô toàn hãng (85.700 tCO2) -> Trừ Hạn ngạch miễn phí (-6.300 tCO2) -> Trừ CO2 giảm do nạp SAF (-20.150 tCO2) -> Phát thải ròng còn lại bắt buộc phải xử lý = 20.850 tCO2.", "Phân tích dòng phát thải")
add_bullet("Chi tiết số lượng tín chỉ carbon bắt buộc Tổng công ty phải mua trên thị trường sau khi đã tối ưu phân bổ SAF: Số EUA phải mua (EU ETS: 13.337 tín chỉ), Số UKA phải mua (UK ETS: 4.390 tín chỉ), Số CEU phải mua (CORSIA: 3.123 tín chỉ).", "Số tín chỉ CO2 phải mua")

add_h3("Cột phải: 2. Tổng chi phí tuân thủ & Hiệu quả kinh tế")
add_bullet("Tổng số tiền VNA phải chi trả cho việc tuân thủ các cơ chế phát thải trong năm: 20,58M $ (triệu USD), tương đương ~523,7 tỷ đồng VND.", "Tổng chi phí tuân thủ")
add_bullet("Bóc tách 2 cấu phần chi phí: (1) Chi phí mua nhiên liệu SAF (19,23M $); (2) Chi phí mua tín chỉ carbon còn lại (1,35M $).", "Cấu phần chi phí")
add_bullet("Hệ thống tự động so sánh Tổng chi phí của kịch bản hiện tại với Kịch bản cơ sở (Baseline - trường hợp không dùng SAF mà phải mua 100% tín chỉ phạt trên sàn). Giá trị tiết kiệm tài chính được ghi nhận trực quan giúp Lãnh đạo đánh giá tính khả thi kinh tế của chương trình SAF.", "Hiệu quả tiết kiệm tài chính")

add_h2("3.7. Thao tác Thêm mới Lô SAF (+ Thêm lô SAF)")
add_p("Khi cần bổ sung một lô nhiên liệu SAF mới vào kỳ mô phỏng, người dùng bấm nút '+ Thêm lô SAF' để mở modal khai báo:")

add_image_with_caption('images/document/BA DOC/images/saf_modal_new_batch.png', 
                       'Hình 7: Popup Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng', 
                       width_inches=5.8)

add_bullet("Chọn mã lô từ danh mục kho nhiên liệu hoặc nhập mã lô mới được cấp chứng chỉ bền vững (bắt buộc).", "Mã Lô (Chọn từ kho dữ liệu SAF)")
add_bullet("Nhập khối lượng nhiên liệu SAF nguyên chất 100% (đơn vị: Tấn).", "Khối lượng SAF (tấn)")
add_bullet("Chọn sân bay nạp nhiên liệu (mã IATA, e.g. CDG, FRA, SIN) và sân bay hạ cánh của chuyến bay.", "Sân bay xuất phát & Sân bay đáp")
add_bullet("Hệ số giảm phát thải do nhà cung cấp công bố trên chứng chỉ PoS (mặc định 2.60 - 2.65 tCO2 / tấn SAF).", "CO2 giảm trừ / tấn SAF")
add_bullet("Bấm 'Thêm vào ma trận' để tự động nạp dòng mới vào bảng phân bổ và tính toán lại toàn bộ chỉ số tài chính.", "Xác nhận thêm")

add_h2("3.8. Quản lý Danh sách Kịch bản & So sánh Đối đầu")
add_p("Hệ thống hỗ trợ lưu trữ nhiều kịch bản phân bổ khác nhau để phục vụ công tác lập kế hoạch ngân sách và đàm phán mua nhiên liệu:")

add_h3("Danh sách kịch bản đã lưu:")
add_p("Bấm nút 'Danh sách kịch bản (N)' tại thanh công cụ đầu trang để mở bảng danh sách các kịch bản:")

add_image_with_caption('images/document/BA DOC/images/saf_modal_list.png', 
                       'Hình 8: Popup Quản lý Danh sách Kịch bản Phân bổ SAF đã lưu trong hệ thống', 
                       width_inches=5.8)

add_bullet("Hiển thị tên kịch bản, thời gian lưu, tổng khối lượng SAF phân bổ, lượng CO2 giảm và chi phí bù đắp.", "Thông tin kịch bản")
add_bullet("Bấm 'Mở chỉnh sửa' để nạp toàn bộ cấu hình kịch bản đó lên màn hình làm việc chính.", "Thao tác nạp lại")
add_bullet("Bấm icon Thùng rác để xóa bỏ các phương án cũ không còn áp dụng.", "Xóa kịch bản")

add_h3("So sánh kịch bản đối đầu (Side-by-side):")
add_p("Bấm nút 'So sánh kịch bản' để mở giao diện đối chiếu chi tiết giữa các kịch bản đang lưu:")

add_image_with_caption('images/document/BA DOC/images/saf_modal_compare.png', 
                       'Hình 9: Bảng so sánh đối chiếu đa chiều giữa các Kịch bản Phân bổ SAF', 
                       width_inches=6.2)

add_bullet("So sánh song song 3 hoặc 4 kịch bản cạnh nhau: Phương án Hiện tại vs Kịch bản Cơ sở vs Kịch bản Giá Carbon Cao (Stress test +30%) vs Kịch bản Tự nguyện.", "Cấu trúc cột so sánh")
add_bullet("Khối 1: Tổng chi phí & Hiệu quả giảm trừ toàn hãng (Tổng chi phí tuân thủ, Chi phí mua tín chỉ, Chi phí mua SAF, Tiết kiệm so với không nạp SAF, Chênh lệch chi phí so với Hiện tại).", "Tiêu chí tài chính")
add_bullet("Khối 2: Thông tin phân bổ nhiên liệu SAF (Tổng lượng SAF phân bổ, Phân bổ cho EU ETS, UK ETS, CORSIA).", "Tiêu chí phân bổ SAF")

# ----------------- SECTION 4 -----------------
add_h1("4. CÁC QUY TẮC NGHIỆP VỤ & LƯU Ý QUAN TRỌNG (BUSINESS RULES)")

add_callout("Quy tắc chống trùng lặp (BR-SAF-01 - No Double-Counting)", 
            "Mỗi tấn nhiên liệu SAF hoặc mỗi chuyến bay chỉ được phép gán Claim cho DUY NHẤT một cơ chế tuân thủ (EU ETS, UK ETS hoặc CORSIA). Tuyệt đối không được gán 1 lô SAF cho cả EU ETS và CORSIA cùng lúc, vì sẽ vi phạm luật quốc tế về gian lận chứng chỉ xanh.", 
            "warning")

add_callout("Quy tắc nguồn gốc sân bay xuất phát (BR-SAF-02 - DEP Origin Rule)", 
            "Lô nhiên liệu SAF chỉ được hưởng ưu đãi miễn trừ ReFuelEU/EU ETS nếu được tra nạp tại sân bay khởi hành thuộc lãnh thổ Liên minh Châu Âu (như CDG, FRA). Nếu chuyến bay khởi hành từ Việt Nam (HAN, SGN) đi Châu Âu thì không được hưởng cơ chế EU ETS mà chỉ được tính cho CORSIA.", 
            "note")

add_callout("Chiến lược tối ưu hóa tài chính (BR-SAF-03 - Economic Optimization Strategy)", 
            "Do đơn giá tín chỉ EU ETS (~76.5 $/tCO2) cao hơn nhiều so với UK ETS (~58.0 $) và CORSIA (~22.5 $), nguyên tắc điều hành luôn ưu tiên dồn tối đa các lô SAF đủ điều kiện vào EU ETS cho đến khi bù đắp hết nghĩa vụ phát thải Châu Âu, lượng dư thừa tiếp tục chuyển sang UK ETS và cuối cùng mới sang CORSIA.", 
            "tip")

# Save docx
output_docx = 'images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx'
doc.save(output_docx)
print(f"Successfully saved Word docx with embedded images: {output_docx}")

# -------------------------------------------------------------
# 2. UPDATE MARKDOWN (.MD) WITH IMAGE EMBEDDINGS
# -------------------------------------------------------------
md_text = f"""# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG
## CHỨC NĂNG KHUYẾN NGHỊ CLAIM NHIÊN LIỆU HÀNG KHÔNG BỀN VỮNG (SAF)
### HỆ THỐNG QUẢN TRỊ BÁO CÁO PHÁT TRIỂN BỀN VỮNG (ESG) — VIETNAM AIRLINES

> **Mã tài liệu:** `VNA-ESG-HDSD-SAF`  
> **Phiên bản:** `3.0 (Cập nhật chuẩn dữ liệu BATCH No, DEP, ARR, FLS kèm hình ảnh minh họa)`  
> **Ngày ban hành:** `01/10/2026`  
> **Đơn vị chủ trì:** Ban Kế hoạch Phát triển & Ban Quản lý Vật tư  
> **Phạm vi áp dụng:** Toàn bộ các Tổ ban & Đơn vị trực thuộc Vietnam Airlines  
> **Tệp Word (.docx) chuẩn:** [`HDSD_Khuyen_Nghi_Claim_SAF.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx)  
> **Template văn bản dùng chung:** [`Template_HDSD_VNA.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/Template_HDSD_VNA.docx)  

---

## MỤC LỤC

1. [GIỚI THIỆU CHỨC NĂNG KHUYẾN NGHỊ CLAIM SAF](#1-giới-thiệu-chức-năng-khuyến-nghị-claim-saf)
   * 1.1. [Bối cảnh & Mục đích nghiệp vụ](#11-bối-cảnh--mục-đích-nghiệp-vụ)
   * 1.2. [Đối tượng sử dụng & Phân quyền](#12-đối-tượng-sử-dụng--phân-quyền)
   * 1.3. [Bảng giải thích thuật ngữ chuyên môn (Glossary)](#13-bảng-giải-thích-thuật-ngữ-chuyên-môn-glossary)
2. [QUY TRÌNH NGHIỆP VỤ 4 BƯỚC TỔNG QUAN](#2-quy-trình-nghiệp-vụ-4-bước-tổng-quan)
3. [HƯỚNG DẪN THAO TÁC CHI TIẾT TRÊN GIAO DIỆN](#3-hướng-dẫn-thao-tác-chi-tiết-trên-giao-diện)
   * 3.1. [Truy cập & Toàn cảnh giao diện (Hình 1)](#31-truy-cập--toàn-cảnh-giao-diện)
   * 3.2. [Thanh điều khiển đầu trang & Chọn năm mô phỏng (Hình 2)](#32-thanh-điều-khiển-đầu-trang--chọn-năm-mô-phỏng)
   * 3.3. [Cấu hình khối Tín chỉ CO2 & Cơ chế thị trường (Hình 3)](#33-cấu-hình-khối-tín-chỉ-co2--cơ-chế-thị-trường)
   * 3.4. [Quản lý & Phân bổ Bảng Lô SAF (Hình 4, 5)](#34-quản-lý--phân-bổ-bảng-lô-saf-chuẩn-quốc-tế)
   * 3.5. [Xuất Báo cáo Excel Bảng Phân bổ Lô SAF](#35-xuất-báo-cáo-excel-bảng-phân-bổ-lô-saf)
   * 3.6. [Đánh giá Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải (Hình 6)](#36-đánh-giá-chỉ-số-hiệu-quả-tài-chính--bù-trừ-phát-thải-toàn-hãng)
   * 3.7. [Thao tác Thêm mới Lô SAF (Hình 7)](#37-thao-tác-thêm-mới-lô-saf--thêm-lô-saf)
   * 3.8. [Quản lý Danh sách Kịch bản & So sánh Đối đầu (Hình 8, 9)](#38-quản-lý-danh-sách-kịch-bản--so-sánh-đối-đầu)
4. [CÁC QUY TẮC NGHIỆP VỤ & LƯU Ý QUAN TRỌNG (BUSINESS RULES)](#4-các-quy-tắc-nghiệp-vụ--lưu-ý-quan-trọng-business-rules)

---

## 1. GIỚI THIỆU CHỨC NĂNG KHUYẾN NGHỊ CLAIM SAF

### 1.1. Bối cảnh & Mục đích nghiệp vụ
Trong chiến lược phát triển bền vững và lộ trình hướng tới Net Zero 2050 của Tổng công ty Hàng không Việt Nam (Vietnam Airlines), việc sử dụng Nhiên liệu hàng không bền vững (Sustainable Aviation Fuel - SAF) là giải pháp giảm phát thải trực tiếp quan trọng nhất nhưng cũng đòi hỏi chi phí đầu tư rất lớn do giá thành SAF hiện cao gấp 2 đến 3 lần nhiên liệu hóa thạch truyền thống (Jet A-1).

Đồng thời, khi thực hiện các đường bay quốc tế, Vietnam Airlines phải tuân thủ đồng thời nhiều cơ chế quản lý phát thải khắt khe với các quy chế bù trừ và đơn giá tín chỉ carbon phạt rất khác nhau:
* **Cơ chế EU ETS (Châu Âu):** Hệ thống giao dịch phát thải của Liên minh châu Âu, đi kèm quy định bắt buộc tỷ lệ pha trộn SAF (ReFuelEU Aviation) từ năm 2025 tại các sân bay thuộc khối EU (Paris CDG, Frankfurt FRA...) và cơ chế cấp hạn ngạch miễn trừ CO2 tương ứng.
* **Cơ chế UK ETS (Vương quốc Anh):** Hệ thống giao dịch phát thải độc lập của Vương quốc Anh, áp dụng cho các chuyến bay khởi hành từ các sân bay Anh (London Heathrow LHR...).
* **Cơ chế CORSIA (Quốc tế / ICAO):** Chương trình giảm trừ & bù đắp carbon đối với các chuyến bay quốc tế do Tổ chức Hàng không Dân dụng Quốc tế (ICAO) ban hành, áp dụng cho các chặng bay quốc tế giữa các quốc gia thành viên.

**Mục đích cốt lõi:** Giúp Vietnam Airlines giải quyết bài toán: *"Nên phân bổ và gán Claim từng lô SAF đã nạp vào cơ chế tuân thủ nào (EU ETS, UK ETS hay CORSIA) để tối đa hóa lượng CO2 được miễn trừ và tiết kiệm chi phí tài chính cao nhất cho Tổng công ty?"*

### 1.2. Đối tượng sử dụng & Phân quyền
* **Ban Kế hoạch Phát triển (Ban KHPT):** Chủ trì xây dựng kịch bản, cập nhật đơn giá tín chỉ thị trường, điều hành phân bổ lô SAF, so sánh hiệu quả kinh tế và trình Lãnh đạo phê duyệt kịch bản chính thức.
* **Ban Quản lý Vật tư (Ban QLVT):** Cập nhật thông tin chi tiết các lô nhiên liệu SAF thực tế đã mua và nạp (Mã lô BATCH No, ngày nạp, sân bay đi DEP, sân bay đến ARR, nhà cung cấp, chứng chỉ phát thải vòng đời LCA).
* **Trung tâm Điều hành Khai thác (TTĐHKT):** Cung cấp số liệu khai thác chuyến bay thực tế (FLS), khối lượng nhiên liệu nạp theo từng chặng bay để đối chiếu kiểm toán.
* **Ban Lãnh đạo Tổng công ty (BOD / Executive Board):** Xem xét các chỉ số phân tích hiệu quả tài chính, so sánh các kịch bản phân bổ và chỉ đạo chiến lược mua nhiên liệu SAF & tín chỉ carbon.

### 1.3. Bảng giải thích thuật ngữ chuyên môn (Glossary)

| Thuật Ngữ | Tên Đầy Đủ / Tiếng Anh | Định Nghĩa & Ý Nghĩa Nghiệp Vụ Tại VNA |
| :--- | :--- | :--- |
| **SAF** | Sustainable Aviation Fuel | Nhiên liệu hàng không bền vững có nguồn gốc sinh học hoặc tái tạo. |
| **NEAT SAF** | Neat / Pure SAF (100%) | Khối lượng nhiên liệu SAF nguyên chất chưa pha trộn với Jet A-1 (đơn vị: Tấn). |
| **BATCH No** | Batch Number / PoS Code | Mã số định danh lô nhiên liệu do nhà cung cấp cấp theo Chứng chỉ bền vững. |
| **DEP** | Departure Airport (IATA Code) | Mã sân bay xuất phát/khởi hành của chuyến bay tra nạp SAF (VD: CDG, FRA, SIN). |
| **ARR** | Arrival Airport (IATA Code) | Mã sân bay đến/đáp của chuyến bay (VD: HAN, SGN, LHR). |
| **FLS** | Flight Legs Count | Số lượng chuyến bay đủ điều kiện áp dụng bù trừ từ lô SAF tương ứng. |
| **EUA** | EU Allowance | Tín chỉ hạn ngạch phát thải thuộc cơ chế EU ETS (1 EUA = 1 tCO2). |
| **UKA** | UK Allowance | Tín chỉ hạn ngạch phát thải thuộc cơ chế UK ETS (1 UKA = 1 tCO2). |
| **CEU** | CORSIA Eligible Unit | Tín chỉ giảm phát thải đủ điều kiện được ICAO công nhận trong cơ chế CORSIA. |
| **Claim SAF** | SAF Claiming Process | Hành động chính thức ghi nhận và khấu trừ lượng giảm phát thải từ lô SAF vào 1 cơ chế. |

---

## 2. QUY TRÌNH NGHIỆP VỤ 4 BƯỚC TỔNG QUAN

* **Bước 1: Cấu hình tham số thị trường:** Thiết lập đơn giá tín chỉ carbon thị trường (EUA, UKA, CEU), tỷ giá quy đổi VND/USD, hạn ngạch miễn trừ và phát thải cơ sở của năm mô phỏng.
* **Bước 2: Quản lý & Lọc danh mục lô SAF:** Quản lý danh sách các lô nhiên liệu SAF đã tra nạp, kiểm tra sân bay đi (DEP), sân bay đến (ARR), khối lượng NEAT SAF và các cơ chế đủ điều kiện được phép claim.
* **Bước 3: Phân bổ & Gán cơ chế Claim:** Lựa chọn cơ chế gán Claim chính thức (Apply) cho từng lô SAF dựa trên nguyên tắc ưu tiên cơ chế có đơn giá tín chỉ phạt cao nhất (EU ETS > UK ETS > CORSIA) nhằm tối đa hóa số tiền được giảm trừ.
* **Bước 4: Đánh giá tài chính & Lưu / Xuất kịch bản:** Theo dõi lượng CO2 offset, số tín chỉ còn thiếu phải mua bù đắp, tổng chi phí tuân thủ toàn hãng, so sánh hiệu quả với kịch bản gốc và xuất báo cáo Excel.

---

## 3. HƯỚNG DẪN THAO TÁC CHI TIẾT TRÊN GIAO DIỆN

### 3.1. Truy cập & Toàn cảnh giao diện
Người dùng truy cập vào phân hệ bằng cách chọn mục **`KHUYẾN NGHỊ CLAIM SAF`** trên menu điều hướng bên trái (hoặc đường dẫn `/netzero-simulation-v2`). Toàn bộ màn hình được thiết kế theo luồng làm việc trực quan từ trên xuống dưới:

![Hình 1: Toàn cảnh màn hình Khuyến nghị Claim SAF trên hệ thống VNA Netzero](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_overview.png)
*Hình 1: Toàn cảnh màn hình Khuyến nghị Claim SAF trên hệ thống VNA Netzero*

---

### 3.2. Thanh điều khiển đầu trang & Chọn năm mô phỏng
Thanh điều khiển đầu trang cho phép chuyển đổi kỳ mô phỏng và truy cập nhanh các tính năng quản lý kịch bản:

![Hình 2: Thanh điều khiển đầu trang - Chọn năm mô phỏng và các nút kịch bản](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_toolbar.png)
*Hình 2: Thanh điều khiển đầu trang - Chọn năm mô phỏng và các nút kịch bản*

* **Dropdown "Năm mô phỏng":** Chọn năm cần lập mô phỏng phân bổ (VD: `Năm 2026`, `Năm 2027`...). Khi đổi năm, hệ thống tự động tải bộ tham số và danh sách lô SAF tương ứng.
* **Nút "Danh sách kịch bản (N)":** Mở popup lưu trữ kịch bản. Người dùng có thể xem lại các phương án phân bổ đã lưu trước đây, xem chi tiết tham số hoặc nạp lại (Load) kịch bản lên màn hình làm việc.
* **Nút "So sánh kịch bản":** Mở modal đối chiếu đa chiều cạnh nhau (Side-by-side) giữa các kịch bản phân bổ khác nhau để đánh giá chênh lệch chi phí tài chính và lượng CO2 offset.
* **Nút "Đồng bộ dữ liệu":** Lấy lại số liệu mặc định từ hệ thống kho dữ liệu trung tâm nếu người dùng đã chỉnh sửa thử nghiệm.

---

### 3.3. Cấu hình khối Tín chỉ CO2 & Cơ chế Thị trường
Khu vực đầu màn hình gồm 3 thẻ thông số song song thể hiện 3 cơ chế thị trường quốc tế:

![Hình 3: Khối cấu hình Tham số Tín chỉ CO2 thị trường (EU ETS, UK ETS, CORSIA)](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_market_params.png)
*Hình 3: Khối cấu hình Tham số Tín chỉ CO2 thị trường (EU ETS, UK ETS, CORSIA)*

#### Thẻ 1: EU ETS (Châu Âu)
* **Đơn giá tín chỉ EUA ($/tCO2):** Đơn giá hạn ngạch EUA giao dịch trên sàn Châu Âu (mặc định tham chiếu: `76.5 $ / EUA`, có badge hiển thị góc phải). Người dùng có thể nhập điều chỉnh theo biến động thị trường.
* **Tỷ giá quy đổi VND:** Tỷ giá chuyển đổi từ USD sang đồng Việt Nam (mặc định: `25,450 VND/USD`). Hệ thống tự động tính: `Giá quy đổi = ~1,946,925 VND/tCO2`.
* **Tổng phát thải CO2:** Tổng nghĩa vụ phát thải CO2 của các chuyến bay VNA thuộc phạm vi Châu Âu trong năm (mặc định: `28,500 tCO2`).
* **Hạn ngạch miễn trừ:** Số tấn CO2 được cơ quan quản lý EU cấp miễn phí theo quy chế ReFuelEU Aviation (mặc định: `5,200 tCO2`, kèm badge "Miễn trừ").
* **Chỉ số chốt chân thẻ:** Hiển thị phát thải thực tế sau khi trừ hạn ngạch miễn phí = `23,300 tCO2`.

#### Thẻ 2: UK ETS (Vương quốc Anh)
* **Đơn vị tín chỉ UKA:** Mặc định `58.0 $ / UKA`, tỷ giá `25,450 VND/USD` -> Giá quy đổi `~1,476,100 VND`.
* **Tổng phát thải năm:** `9,200 tCO2`; Hạn ngạch miễn phí cấp theo quy chế Anh: `1,100 tCO2`; Phát thải sau miễn giảm: `8,100 tCO2`.

#### Thẻ 3: CORSIA (Quốc tế / ICAO)
* **Đơn vị tín chỉ CEU:** Mặc định `22.5 $ / CEU` -> Giá quy đổi `~572,625 VND`.
* **Các tham số đặc thù (Badge 'CORSIA Rule'):** Tỷ lệ tăng trưởng ngành (`20.0%`), Tỷ trọng Sectoral (`100%`), Tỷ trọng Individual (`0%`), Baseline phát thải (`2.254.192 tCO2`).
* **Công thức tính toán CORSIA:** Hiển thị công thức trực quan ngay dưới kết quả:  
  `Phải bù trừ = (48.000 x 20%) x 100% = 9.600 tCO2`.

---

### 3.4. Quản lý & Phân bổ Bảng Lô SAF (Chuẩn Quốc Tế)
Bảng **"PHÂN BỔ LÔ NHIÊN LIỆU SAF"** là trung tâm điều hành nghiệp vụ của màn hình, được xây dựng theo chuẩn khai báo hàng không quốc tế với cấu trúc tiêu đề 2 tầng:

![Hình 4: Bảng Phân bổ Lô Nhiên liệu SAF theo chuẩn quốc tế](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_table.png)
*Hình 4: Bảng Phân bổ Lô Nhiên liệu SAF theo chuẩn quốc tế (BATCH No, DEP, ARR, NEAT SAF, FLS, CO2, USD, Apply)*

| Tên Cột (Header) | Kiểu Dữ Liệu & Thao Tác | Ý Nghĩa Nghiệp Vụ & Quy Tắc Tính Toán |
| :--- | :--- | :--- |
| **BATCH No** | Văn bản (In đậm, link chi tiết) | Mã số định danh lô SAF (VD: `SAF-2026-EU-01`). Bấm vào để xem chứng chỉ và thông tin nhà cung cấp. |
| **Ngày nạp** | Ngày (`DD/MM/YYYY`) | Ngày tra nạp nhiên liệu SAF thực tế lên tàu bay. |
| **DEP** | Badge sân bay (3 ký tự IATA) | Sân bay xuất phát/khởi hành (VD: `CDG`, `FRA`, `LHR`, `SIN`, `HAN`). Quyết định điều kiện hưởng cơ chế. |
| **ARR** | Badge sân bay (3 ký tự IATA) | Sân bay đến/đáp của chặng bay (VD: `HAN`, `SGN`, `CDG`). |
| **NEAT SAF** | Số thực (Tấn, cho phép sửa) | Khối lượng SAF nguyên chất 100% trong lô. Người dùng có thể chỉnh sửa số tấn trực tiếp. |
| **FLS** | Nhóm 3 cột: `FLS_EU`, `FLS_UK`, `FLS_CORSIA` | Số lượng chuyến bay được phân bổ và hưởng lợi ích giảm trừ tương ứng của từng cơ chế. |
| **CO2** | Nhóm 3 cột: `CO2_EU`, `CO2_UK`, `CO2_CORSIA` | Khối lượng CO2 giảm trừ (tCO2). Tính tự động = Khối lượng Neat SAF x Hệ số phát thải vòng đời LCA. |
| **USD** | Nhóm 3 cột: `USD_EU`, `USD_UK`, `USD_CORSIA` | Giá trị tài chính được giảm trừ ($). Tính tự động = Lượng CO2 giảm trừ x Đơn giá tín chỉ của cơ chế đó. |
| **Apply** | Dropdown chọn cơ chế (`EU / UK / CORSIA`) | Cơ chế chính thức gán Claim cho lô SAF này. Thay đổi cơ chế sẽ tự động dịch chuyển số liệu phân bổ. |
| **Thao tác** | Icon Thùng rác (Xóa) | Xóa lô SAF khỏi bảng tính sau khi có hộp thoại xác nhận. |

#### Bộ lọc thông minh trên bảng:
Hàng bộ lọc nằm ngay dưới tiêu đề cột cho phép lọc đa chiều tức thì:

![Hình 5: Hàng bộ lọc đa chiều theo Mã lô, Sân bay xuất phát DEP và Sân bay đến ARR](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_table_filter.png)
*Hình 5: Hàng bộ lọc đa chiều theo Mã lô, Sân bay xuất phát DEP và Sân bay đến ARR*

1. **Tìm kiếm theo BATCH No:** Gõ từ khóa mã lô (VD `'EU-01'`) để lọc nhanh lô hàng.
2. **Lọc theo Sân bay đi (DEP):** Lọc danh sách theo sân bay khởi hành CDG, FRA, LHR, SIN hoặc Tất cả.
3. **Lọc theo Sân bay đến (ARR):** Lọc danh sách theo sân bay hạ cánh HAN, SGN hoặc Tất cả.
4. **Lọc theo Cơ chế áp dụng (Apply):** Lọc theo cơ chế đang gán: Tất cả / EU ETS / UK ETS / CORSIA.

---

### 3.5. Xuất Báo cáo Excel Bảng Phân bổ Lô SAF
Hệ thống cung cấp nút bấm **`Xuất Excel`** tại thanh công cụ của bảng:
* **Định dạng file xuất:** File Excel (`.xlsx`) được xuất theo đúng mẫu biểu kiểm toán hàng không quốc tế, gồm 2 dòng header: Dòng 1 nhóm các cột FLS, CO2, USD; Dòng 2 chi tiết từng cơ chế (`EU ETS`, `UK ETS`, `CORSIA`).
* **Tính đồng bộ dữ liệu:** Tự động áp dụng bộ lọc hiện tại trên màn hình (nếu đang lọc CDG thì file Excel chỉ xuất các lô CDG).
* **Mục đích sử dụng:** Hỗ trợ gửi trực tiếp cho đơn vị kiểm toán độc lập và nộp báo cáo ReFuelEU / CORSIA hàng năm.

---

### 3.6. Đánh giá Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải
Khu vực cuối trang tự động tổng hợp kết quả của toàn bộ kịch bản phân bổ hiện thời, chia làm 2 cột phân tích chuyên sâu:

![Hình 6: Khối Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải toàn hãng](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_financial_summary.png)
*Hình 6: Khối Chỉ số Hiệu quả Tài chính & Bù trừ Phát thải toàn hãng (CO2 Offset & Chi phí tuân thủ)*

#### Cột trái: 1. CO2 Offset & Giảm thiểu
* **Tổng CO2 Giảm thiểu:** Tổng lượng phát thải CO2 thực tế đã được cắt giảm nhờ nạp SAF (VD: `20.150 tCO2` = Tổng cột CO2 của các lô).
* **Phân tích dòng phát thải:** Bảng bóc tách chi tiết:  
  `Tổng phát thải thô toàn hãng (85.700 tCO2)` -> Trừ `Hạn ngạch miễn phí (-6.300 tCO2)` -> Trừ `CO2 giảm do nạp SAF (-20.150 tCO2)` -> `Phát thải ròng còn lại bắt buộc phải xử lý = 20.850 tCO2`.
* **Số tín chỉ CO2 phải mua:** Chi tiết số lượng tín chỉ carbon bắt buộc Tổng công ty phải mua trên thị trường sau khi đã tối ưu phân bổ SAF: Số EUA phải mua (EU ETS: `13.337` tín chỉ), Số UKA phải mua (UK ETS: `4.390` tín chỉ), Số CEU phải mua (CORSIA: `3.123` tín chỉ).

#### Cột phải: 2. Tổng chi phí tuân thủ & Hiệu quả kinh tế
* **Tổng chi phí tuân thủ:** Tổng số tiền VNA phải chi trả cho việc tuân thủ các cơ chế phát thải trong năm: `20,58M $` (triệu USD), tương đương `~523,7 tỷ đồng VND`.
* **Cấu phần chi phí:** Bóc tách 2 cấu phần chi phí:
  1. Chi phí mua nhiên liệu SAF (`19,23M $`).
  2. Chi phí mua tín chỉ carbon còn lại (`1,35M $`).
* **Hiệu quả tiết kiệm tài chính (Cost Savings):** Hệ thống tự động so sánh Tổng chi phí của kịch bản hiện tại với **Kịch bản cơ sở (Baseline - trường hợp không dùng SAF mà phải mua 100% tín chỉ phạt trên sàn)**. Giá trị tiết kiệm tài chính được ghi nhận trực quan giúp Lãnh đạo đánh giá tính khả thi kinh tế của chương trình SAF.

---

### 3.7. Thao tác Thêm mới Lô SAF (`+ Thêm lô SAF`)
Khi cần bổ sung một lô nhiên liệu SAF mới vào kỳ mô phỏng, người dùng bấm nút **`+ Thêm lô SAF`** để mở modal khai báo:

![Hình 7: Popup Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_new_batch.png)
*Hình 7: Popup Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng*

* **Mã Lô (Chọn từ kho dữ liệu SAF):** Chọn mã lô từ danh mục kho nhiên liệu hoặc nhập mã lô mới được cấp chứng chỉ bền vững (bắt buộc).
* **Khối lượng SAF (tấn):** Nhập khối lượng nhiên liệu SAF nguyên chất 100% (đơn vị: Tấn).
* **Sân bay xuất phát & Sân bay đáp:** Chọn sân bay nạp nhiên liệu (mã IATA, e.g. `CDG`, `FRA`, `SIN`) và sân bay hạ cánh của chuyến bay.
* **CO2 giảm trừ / tấn SAF:** Hệ số giảm phát thải do nhà cung cấp công bố trên chứng chỉ PoS (mặc định `2.60 - 2.65` tCO2 / tấn SAF).
* **Nhà cung cấp:** Tên đơn vị phân phối nhiên liệu SAF (TotalEnergies, Neste, Shell Aviation...).
* **Xác nhận thêm:** Bấm **`Thêm vào ma trận`** để tự động nạp dòng mới vào bảng phân bổ và tính toán lại toàn bộ chỉ số tài chính.

---

### 3.8. Quản lý Danh sách Kịch bản & So sánh Đối đầu
Hệ thống hỗ trợ lưu trữ nhiều kịch bản phân bổ khác nhau để phục vụ công tác lập kế hoạch ngân sách và đàm phán mua nhiên liệu:

#### Danh sách kịch bản đã lưu:
Bấm nút **`Danh sách kịch bản (N)`** tại thanh công cụ đầu trang để mở bảng danh sách các kịch bản:

![Hình 8: Popup Quản lý Danh sách Kịch bản Phân bổ SAF đã lưu trong hệ thống](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_list.png)
*Hình 8: Popup Quản lý Danh sách Kịch bản Phân bổ SAF đã lưu trong hệ thống*

* **Thông tin kịch bản:** Hiển thị tên kịch bản, thời gian lưu, tổng khối lượng SAF phân bổ, lượng CO2 giảm và chi phí bù đắp.
* **Thao tác nạp lại:** Bấm **`Mở chỉnh sửa`** để nạp toàn bộ cấu hình kịch bản đó lên màn hình làm việc chính.
* **Xóa kịch bản:** Bấm icon **Thùng rác** để xóa bỏ các phương án cũ không còn áp dụng.

#### So sánh kịch bản đối đầu (Side-by-side):
Bấm nút **`So sánh kịch bản`** để mở giao diện đối chiếu chi tiết giữa các kịch bản đang lưu:

![Hình 9: Bảng so sánh đối chiếu đa chiều giữa các Kịch bản Phân bổ SAF](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_compare.png)
*Hình 9: Bảng so sánh đối chiếu đa chiều giữa các Kịch bản Phân bổ SAF*

* **Cấu trúc cột so sánh:** So sánh song song 3 hoặc 4 kịch bản cạnh nhau: *Phương án Hiện tại* vs *Kịch bản Cơ sở (Ưu tiên EU ETS)* vs *Kịch bản Giá Carbon Cao (Stress test +30%)* vs *Kịch bản Tự nguyện Phân bổ SAF 8,000T*.
* **Khối 1 - Tiêu chí tài chính:** Tổng chi phí tuân thủ toàn diện, Chi phí mua tín chỉ carbon còn lại, Chi phí mua SAF, Tiết kiệm so với kịch bản không nạp SAF, Chênh lệch chi phí so với Hiện tại.
* **Khối 2 - Tiêu chí phân bổ SAF:** Tổng lượng SAF phân bổ (Tấn), Chi tiết phân bổ cho EU ETS, UK ETS, CORSIA.

---

## 4. CÁC QUY TẮC NGHIỆP VỤ & LƯU Ý QUAN TRỌNG (BUSINESS RULES)

> [!WARNING]
> **Quy tắc chống trùng lặp (BR-SAF-01 - No Double-Counting):**  
> Mỗi tấn nhiên liệu SAF hoặc mỗi chuyến bay chỉ được phép gán Claim cho **DUY NHẤT một cơ chế tuân thủ** (EU ETS, UK ETS hoặc CORSIA). Tuyệt đối không được gán 1 lô SAF cho cả EU ETS và CORSIA cùng lúc, vì sẽ vi phạm luật quốc tế về gian lận chứng chỉ xanh.

> [!NOTE]
> **Quy tắc nguồn gốc sân bay xuất phát (BR-SAF-02 - DEP Origin Rule):**  
> Lô nhiên liệu SAF chỉ được hưởng ưu đãi miễn trừ ReFuelEU/EU ETS nếu được tra nạp tại sân bay khởi hành thuộc lãnh thổ Liên minh Châu Âu (như CDG, FRA). Nếu chuyến bay khởi hành từ Việt Nam (HAN, SGN) đi Châu Âu thì không được hưởng cơ chế EU ETS mà chỉ được tính cho CORSIA.

> [!TIP]
> **Chiến lược tối ưu hóa tài chính (BR-SAF-03 - Economic Optimization Strategy):**  
> Do đơn giá tín chỉ EU ETS (~76.5 $/tCO2) cao hơn nhiều so với UK ETS (~58.0 $) và CORSIA (~22.5 $), nguyên tắc điều hành luôn **ưu tiên dồn tối đa các lô SAF đủ điều kiện vào EU ETS** cho đến khi bù đắp hết nghĩa vụ phát thải Châu Âu, lượng dư thừa tiếp tục chuyển sang UK ETS và cuối cùng mới sang CORSIA.

---
*Tài liệu này được tạo và lưu trữ tại đường dẫn:*  
* Microsoft Word: [`images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx)  
* Markdown: [`images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.md`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.md)  
* Thư mục hình ảnh: [`images/document/BA DOC/images/`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/)  
"""

output_md = 'images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.md'
with open(output_md, 'w', encoding='utf-8') as f:
    f.write(md_text.strip() + '\n')

print(f"Successfully saved Markdown file with embedded images: {output_md}")
