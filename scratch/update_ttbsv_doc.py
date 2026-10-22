# -*- coding: utf-8 -*-
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import shutil
import os

target_path = '/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA DOC/URD/Phụ lục Trung tâm Bông Sen Vàng v2_CĐSCN edited.docx'
backup_path = '/Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA DOC/URD/Phụ lục Trung tâm Bông Sen Vàng v2_CĐSCN edited_backup.docx'

if not os.path.exists(backup_path):
    print("Creating backup: " + backup_path)
    shutil.copy2(target_path, backup_path)

doc = docx.Document(target_path)

def set_cell_font(cell, text, font_name="Times New Roman", font_size=10, bold=False, italic=False, color_rgb=(0x1F, 0x29, 0x37)):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    if color_rgb:
        run.font.color.rgb = RGBColor(*color_rgb)
    return p

# 1. Update Section 4: Phân quyền (Paragraphs around P26-P29)
print("Updating Section 4: Phân quyền...")
for i, p in enumerate(doc.paragraphs):
    if "Bổ sung/chỉnh sửa sau khi chốt tài liệu phân quyền bên BA" in p.text:
        p.text = "- Lãnh đạo đơn vị (TTBSV): Có quyền tra cứu, xem Dashboard chỉ tiêu Airline B-2 (tổng số hội viên, cơ cấu phân hạng thẻ Platinum, Gold, Titanium, Silver, xu hướng tăng trưởng theo tháng/quý/năm) và theo dõi tiến độ hoàn thành kế hoạch KPI phát triển hội viên của đơn vị (việc ký duyệt báo cáo thực hiện ngoại tuyến theo quy chế nội bộ của TCT).\n- Đầu mối nghiệp vụ đơn vị (TTBSV): Có quyền tra cứu dữ liệu hội viên đồng bộ từ CLM, thực hiện nhập số liệu mục tiêu kế hoạch hoặc số liệu khảo sát tương tác khách hàng (nếu có), Import file Excel đối soát và lưu trữ dữ liệu trực tiếp vào hệ thống Clean DB.\n- Quản trị viên (Admin): Quản trị tài khoản người dùng, phân quyền truy cập và giám sát kết nối tích hợp dữ liệu giữa hệ thống CLM và Data Warehouse."
        p.runs[0].font.name = "Times New Roman"
        p.runs[0].font.size = Pt(10)
        p.runs[0].font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        break

# 2. Update Section 5: Cảnh báo và workflow khi nhập liệu (Paragraphs around P30-P31)
print("Updating Section 5: Cảnh báo và workflow khi nhập liệu...")
for i, p in enumerate(doc.paragraphs):
    if "5. Cảnh báo và workflow khi nhập liệu" in p.text:
        if i + 1 < len(doc.paragraphs):
            p_next = doc.paragraphs[i + 1]
            p_next.text = "Quy trình phê duyệt số liệu được thực hiện ngoại tuyến (offline) theo quy chế vận hành thực tế của Vietnam Airlines. Hệ thống phần mềm không áp dụng luồng phê duyệt trực tuyến (không có tính năng gửi duyệt, phê duyệt hay từ chối online); số liệu sau khi được người dùng kiểm tra định dạng và bấm Lưu (hoặc Import Excel thành công / đồng bộ tự động từ hệ thống CLM) sẽ được ghi nhận trực tiếp vào cơ sở dữ liệu Clean DB và cập nhật tức thời lên Dashboard báo cáo.\n\nCảnh báo khi nhập liệu: Hệ thống kích hoạt cơ chế tiền kiểm soát (Data Validation Engine) khi người dùng nhập dữ liệu hoặc tải file Excel đối soát. Tự động cảnh báo và chặn ghi nhận khi phát hiện giá trị âm (số lượng hội viên < 0), nhập sai định dạng số, trường thông tin bắt buộc bị bỏ trống hoặc kỳ báo cáo không hợp lệ; hiển thị thông báo popup hướng dẫn người dùng hiệu chỉnh trước khi lưu vào CSDL."
            p_next.runs[0].font.name = "Times New Roman"
            p_next.runs[0].font.size = Pt(10)
            p_next.runs[0].font.italic = False
            p_next.runs[0].font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        break

# 3. Update Table 1: Danh mục chỉ tiêu (Điền Đơn vị đo & Công thức tính)
print("Updating Table 1: Danh mục chỉ tiêu...")
tbl1 = doc.tables[1]
set_cell_font(tbl1.cell(1, 3), "Hội viên", font_size=9.5)
set_cell_font(tbl1.cell(1, 4), "Tổng số hội viên đang tham gia chương trình Bông Sen Vàng của Vietnam Airlines còn hiệu lực tại thời điểm báo cáo (chốt số liệu lũy kế đến ngày cuối cùng của kỳ báo cáo tháng/quý/năm).", font_size=9.5)

# 4. Update Table 2: Bộ lọc/drill-down
print("Updating Table 2: Bộ lọc/drill-down...")
tbl2 = doc.tables[2]
set_cell_font(tbl2.cell(1, 3), "Năm, Quý, Tháng, Hạng thẻ (Bạch Kim, Vàng, Titan, Bạc)", font_size=9.5)
set_cell_font(tbl2.cell(1, 4), "Hàng ngày", font_size=9.5)
set_cell_font(tbl2.cell(2, 3), "Năm, Hạng thẻ hội viên", font_size=9.5)
set_cell_font(tbl2.cell(3, 3), "Năm, Quý, Hạng thẻ hội viên", font_size=9.5)
set_cell_font(tbl2.cell(4, 3), "Năm, Tháng, Hạng thẻ hội viên", font_size=9.5)

# 5. Update Table 3, 4, 5 (Đúng chuyên môn TTBSV)
print("Updating Table 3, 4, 5: Nghiệp vụ TTBSV...")
tbl3 = doc.tables[3]
set_cell_font(tbl3.cell(0, 0), "STT", font_size=9.5, bold=True)
set_cell_font(tbl3.cell(0, 1), "Tên chỉ số", font_size=9.5, bold=True)
set_cell_font(tbl3.cell(0, 2), "Loại dữ liệu", font_size=9.5, bold=True)
set_cell_font(tbl3.cell(1, 0), "1", font_size=9.5)
set_cell_font(tbl3.cell(1, 1), "Tổng số hội viên Bông Sen Vàng và phân loại theo hạng thẻ (Million Miler, Platinum, Gold, Titanium, Silver)", font_size=9.5)
set_cell_font(tbl3.cell(1, 2), "Dữ liệu tự động (Hệ thống CLM)", font_size=9.5)
if len(tbl3.rows) < 3:
    r_add = tbl3.add_row()
    set_cell_font(r_add.cells[0], "2", font_size=9.5)
    set_cell_font(r_add.cells[1], "Khảo sát tương tác khách hàng & Điểm NPS hội viên", font_size=9.5)
    set_cell_font(r_add.cells[2], "Dữ liệu nhập thủ công / File Excel", font_size=9.5)

tbl4 = doc.tables[4]
set_cell_font(tbl4.cell(0, 0), "STT", font_size=9.5, bold=True)
set_cell_font(tbl4.cell(0, 1), "Tên chỉ số", font_size=9.5, bold=True)
set_cell_font(tbl4.cell(0, 2), "Phương thức cập nhật", font_size=9.5, bold=True)
set_cell_font(tbl4.cell(1, 1), "Tổng số hội viên Bông Sen Vàng (Total Members)", font_size=9.5)
set_cell_font(tbl4.cell(1, 2), "Tự động (Hệ thống CLM)", font_size=9.5)
set_cell_font(tbl4.cell(2, 1), "Cơ cấu hội viên theo hạng thẻ (Tier Distribution)", font_size=9.5)
set_cell_font(tbl4.cell(2, 2), "Tự động (Hệ thống CLM)", font_size=9.5)
set_cell_font(tbl4.cell(3, 1), "Tăng trưởng hội viên mới (New Member Acquisition)", font_size=9.5)
set_cell_font(tbl4.cell(3, 2), "Tự động (Hệ thống CLM)", font_size=9.5)
set_cell_font(tbl4.cell(4, 1), "Kế hoạch KPI hội viên & Khảo sát NPS (Target & Survey)", font_size=9.5)
set_cell_font(tbl4.cell(4, 2), "Nhập thủ công (Excel / Form)", font_size=9.5)

tbl5 = doc.tables[5]
set_cell_font(tbl5.cell(0, 0), "STT", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(0, 1), "Tên KPI", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(0, 2), "Dữ liệu khai thác", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(0, 3), "Nguồn dữ liệu", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(0, 4), "Tần suất", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(0, 5), "Phương thức", font_size=9.5, bold=True)

set_cell_font(tbl5.cell(1, 0), "1", font_size=9.5)
set_cell_font(tbl5.cell(1, 1), "Airline B-2: Tổng số hội viên Bông Sen Vàng", font_size=9.5, bold=True)
set_cell_font(tbl5.cell(1, 2), "Số lượng hội viên còn hiệu lực phân loại theo 4 hạng thẻ và thời gian gia nhập", font_size=9.5)
set_cell_font(tbl5.cell(1, 3), "Hệ thống CLM (Customer Loyalty Management)", font_size=9.5)
set_cell_font(tbl5.cell(1, 4), "Hàng ngày", font_size=9.5)
set_cell_font(tbl5.cell(1, 5), "Tự động (API / DB Connection)", font_size=9.5)

if len(tbl5.rows) < 3:
    r_kpi2 = tbl5.add_row()
    set_cell_font(r_kpi2.cells[0], "2", font_size=9.5)
    set_cell_font(r_kpi2.cells[1], "Mục tiêu KPI & Khảo sát tương tác khách hàng", font_size=9.5, bold=True)
    set_cell_font(r_kpi2.cells[2], "Điểm NPS mục tiêu, điểm thực tế và số lượng khảo sát khách hàng thu về", font_size=9.5)
    set_cell_font(r_kpi2.cells[3], "Báo cáo khảo sát nội bộ TTBSV / File Excel", font_size=9.5)
    set_cell_font(r_kpi2.cells[4], "Tháng/Quý/Năm", font_size=9.5)
    set_cell_font(r_kpi2.cells[5], "Nhập thủ công (Form / Import Excel)", font_size=9.5)

# 6. Update Table 7: Ma trận truy vết
print("Updating Table 7: Ma trận truy vết...")
tbl7 = doc.tables[7]
set_cell_font(tbl7.cell(1, 0), "YCQ-BSV-01", font_size=9.5, bold=True, color_rgb=(0x00, 0x5F, 0x6E))
set_cell_font(tbl7.cell(1, 1), "Hình 01: Giao diện dashboard Airline B-2 (Tổng số hội viên, cơ cấu hạng thẻ, xu hướng tăng trưởng)", font_size=9.5)
set_cell_font(tbl7.cell(1, 2), "Dữ liệu hội viên tích hợp tự động từ hệ thống CLM và lưu trữ tại Data Warehouse", font_size=9.5)
set_cell_font(tbl7.cell(1, 3), "Kiểm thử hiển thị thẻ số tổng hội viên, biểu đồ tròn cơ cấu hạng thẻ, biểu đồ cột xu hướng theo tháng/quý/năm, kiểm tra tooltip hover, bộ lọc thời gian và tính năng xuất PDF báo cáo.", font_size=9.5)

set_cell_font(tbl7.cell(2, 0), "YCQ-BSV-02", font_size=9.5, bold=True, color_rgb=(0x00, 0x5F, 0x6E))
set_cell_font(tbl7.cell(2, 1), "Hình 02: Màn hình nhập liệu & Import Excel chỉ tiêu TTBSV", font_size=9.5)
set_cell_font(tbl7.cell(2, 2), "Số hội viên mục tiêu (Plan), số thực tế (Actual), số lượng khảo sát khách hàng thu về (Surveys)", font_size=9.5)
set_cell_font(tbl7.cell(2, 3), "Kiểm thử form nhập liệu trực tiếp, kiểm tra lỗi định dạng file Excel, lưu trữ trực tiếp vào CSDL Clean DB và cập nhật lên Dashboard.", font_size=9.5)

# 7. Update Table 10: Kết quả đối soát dữ liệu UAT
print("Updating Table 10: Kết quả đối soát dữ liệu...")
tbl10 = doc.tables[10]
set_cell_font(tbl10.cell(1, 0), "Airline B-2 (Tổng số hội viên Bông Sen Vàng)", font_size=9.5, bold=True)
set_cell_font(tbl10.cell(1, 1), "Năm 2024 - 2026", font_size=9.5)
set_cell_font(tbl10.cell(1, 2), "Hệ thống quản lý khách hàng thân thiết CLM đối chiếu với Data Warehouse", font_size=9.5)
set_cell_font(tbl10.cell(1, 3), "Khớp 100% (Số lượng hội viên tổng và số lượng theo từng hạng thẻ Platinum, Gold, Titanium, Silver khớp hoàn toàn với số liệu chốt kỳ của CLM)", font_size=9.5)
set_cell_font(tbl10.cell(1, 4), "0%", font_size=9.5)
set_cell_font(tbl10.cell(1, 5), "Đạt", font_size=9.5, bold=True, color_rgb=(0x16, 0xA3, 0x4A))

# 8. Update Table 11: Kết quả phân quyền UAT
print("Updating Table 11: Kết quả phân quyền...")
tbl11 = doc.tables[11]
set_cell_font(tbl11.cell(1, 0), "Đầu mối TTBSV", font_size=9.5, bold=True)
set_cell_font(tbl11.cell(1, 1), "Tra cứu số liệu hội viên Airline B-2, thực hiện nhập số liệu khảo sát/mục tiêu (nếu có), nạp file Excel đối soát và lưu dữ liệu trực tiếp vào hệ thống", font_size=9.5)
set_cell_font(tbl11.cell(1, 2), "Đạt", font_size=9.5, bold=True, color_rgb=(0x16, 0xA3, 0x4A))
set_cell_font(tbl11.cell(1, 3), "Đã phân quyền đúng vai trò Đầu mối nghiệp vụ TTBSV (nhập liệu và lưu trực tiếp vào CSDL Clean DB)", font_size=9.5)

if len(tbl11.rows) < 3:
    r_ld = tbl11.add_row()
    set_cell_font(r_ld.cells[0], "Ban Lãnh đạo TTBSV", font_size=9.5, bold=True)
    set_cell_font(r_ld.cells[1], "Xem dashboard báo cáo TTBSV, rà soát đối chiếu số lượng hội viên và xu hướng tăng trưởng theo thời gian", font_size=9.5)
    set_cell_font(r_ld.cells[2], "Đạt", font_size=9.5, bold=True, color_rgb=(0x16, 0xA3, 0x4A))
    set_cell_font(r_ld.cells[3], "Đã phân quyền đúng vai trò Xem báo cáo và tra cứu dữ liệu của Ban Lãnh đạo (không thao tác phê duyệt online)", font_size=9.5)

# 9. Update Table 12: Danh sách tồn tại sau UAT (Defects & Issues Log)
print("Updating Table 12: Danh sách tồn tại...")
tbl12 = doc.tables[12]

def fill_tbl12_row(row, code, content, level, solution, deadline, owner):
    set_cell_font(row.cells[0], code, font_size=9.5, bold=True, color_rgb=(0x00, 0x5F, 0x6E))
    set_cell_font(row.cells[1], content, font_size=9.5)
    level_color = (0xD9, 0x77, 0x06) if level == "Trung bình" else (0x4B, 0x55, 0x63)
    set_cell_font(row.cells[2], level, font_size=9.5, bold=True, color_rgb=level_color)
    set_cell_font(row.cells[3], solution, font_size=9.5)
    set_cell_font(row.cells[4], deadline, font_size=9.5)
    set_cell_font(row.cells[5], owner, font_size=9.5)

fill_tbl12_row(tbl12.rows[1],
    "DEF-BSV-01",
    "Tần suất đồng bộ dữ liệu tự động từ hệ thống CLM sang Data Warehouse cần được tối ưu hóa vào khung giờ thấp điểm (sau 00:00 hàng ngày) để tránh ảnh hưởng đến hiệu năng truy vấn giao dịch dặm bay của hội viên.",
    "Trung bình",
    "Cấu hình lại lịch trình ETL (ETL Job Schedule) tự động chạy đồng bộ vào 01:00 AM hàng ngày; đồng thời bổ sung cơ chế nạp bù (retry mechanism) và ghi log chi tiết khi phát sinh gián đoạn kết nối mạng.",
    "30/11/2026",
    "Ban CĐSCN, TTBSV, Đơn vị phát triển"
)

# Row 2
row2 = tbl12.add_row()
fill_tbl12_row(row2,
    "DEF-BSV-02",
    "Cần bổ sung tính năng lọc drill-down theo từng nhóm đối tác liên kết tích lũy dặm (Ngân hàng, Khách sạn, Viễn thông) trên biểu đồ cơ cấu hội viên tích cực (Active Members).",
    "Thấp",
    "Bổ sung thêm chiều phân tích đối tác (Partner Segment Slicer) trên giao diện Dashboard Metabase của TTBSV trong đợt phát hành phiên bản tiếp theo.",
    "15/11/2026",
    "Đơn vị phát triển"
)

# Row 3
row3 = tbl12.add_row()
fill_tbl12_row(row3,
    "DEF-BSV-03",
    "Tệp xuất báo cáo PDF Dashboard Airline B-2 cần căn chỉnh bố cục để hiển thị rõ nét biểu đồ cột tăng trưởng theo 12 tháng liên tục trên khổ giấy in chuẩn A4.",
    "Thấp",
    "Tối ưu hóa template xuất PDF của Metabase cho chỉ tiêu Airline B-2, tự động căn chỉnh tỷ lệ co giãn biểu đồ (Responsive vector render) theo khổ giấy A4.",
    "31/10/2026",
    "Đơn vị phát triển"
)

doc.save(target_path)
print("Successfully updated and saved: " + target_path)
