---
name: srs-document-creator
description: Generate a System Requirement Specification (SRS) or Functional Requirement Document (FRD) based on a standard template. Use this skill whenever the user asks to write, draft, create, or generate an SRS, FRD, or technical design document for a feature, module, or project.
---

# SRS / FRD Document Creator

This skill helps you generate a standardized System Requirement Specification (SRS) or Functional Requirement Document (FRD) in Vietnamese. 

## When to use

Use this skill when the user provides business requirements, user stories, or a feature description and asks you to create a technical/functional design document, SRS, or FRD.

## Output Format

ALWAYS use the following Markdown template to structure your response. Fill in the placeholders (`<...>`) based on the context provided by the user. If the user hasn't provided enough information for a specific section, you may make reasonable assumptions or leave it as a placeholder for the user to fill out, but do not omit the section.

```markdown
# TÀI LIỆU MÔ TẢ YÊU CẦU / THAY ĐỔI NÂNG CẤP
**Mã hiệu dự án:** <Mã hiệu dự án>
**Mã hiệu tài liệu:** <Mã hiệu tài liệu>
**Ngày:** <Ngày hiện tại>

## 1. BẢNG GHI NHẬN THAY ĐỔI
| Ngày thay đổi | Vị trí thay đổi | Thao tác (A/M/D)* | Ticket | Đầu mối | Mô tả thay đổi | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- |
| <Date> | <Vị trí> | <A/M/D> | <Ticket ID> | <Người yêu cầu> | <Mô tả> | <Ghi chú> |
*(A - Tạo mới, M - Sửa đổi, D - Xóa bỏ)*

## 2. TRANG KÝ
- **Người lập:** <Tên> - <Chức danh> - <Ngày lập>
- **Người xem xét 1:** <Tên> - <Chức danh> - <Ngày Review>
- **Người xem xét 2:** <Tên> - <Chức danh> - <Ngày Review>
- **Người phê duyệt:** <Tên> - <Chức danh> - <Ngày phê duyệt>

## 3. TỔNG QUAN

### 3.1 VẤN ĐỀ HIỆN TẠI
- **Reporter:** <Tên người đưa yêu cầu>
- <Giải trình vấn đề được đề cập đến>

### 3.2 GIẢI PHÁP ĐỀ XUẤT
- <Nêu rõ giải pháp đề xuất để giải quyết vấn đề>

### 3.3 CÁC THUẬT NGỮ SỬ DỤNG TRONG TÀI LIỆU
| STT | THUẬT NGỮ | GIẢI THÍCH |
| --- | --- | --- |
| 1 | <Thuật ngữ> | <Giải thích> |

### 3.4 SƠ ĐỒ TỔNG QUAN CHỨC NĂNG
(Sơ đồ Business Flow hoặc Activities Diagram)
```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Chèn mã XML mxGraphModel cho sơ đồ Business Flow / Activity Diagram ở đây -->
  </root>
</mxGraphModel>
```

## 4. MONG MUỐN

### 4.1 IN SCOPE (USER STORIES)
| STT | USER STORY | MÔ TẢ | ƯU TIÊN | GHI CHÚ |
| --- | --- | --- | --- | --- |
| 1 | <User story> | <Mô tả> | <High/Medium/Low> | <Ghi chú> |

### 4.2 OUT OF SCOPE (Những phần chưa làm ngay)
| STT | USER STORY | LÝ DO |
| --- | --- | --- |
| 1 | <User story> | <Lý do> |

## 5. MÔ TẢ CHI TIẾT CHỨC NĂNG
*(Lặp lại phần này cho mỗi chức năng được yêu cầu)*

### 5.1 <NÂNG CẤP/TẠO MỚI> <TÊN CHỨC NĂNG>
**Thông tin chung về chức năng:**
<Mô tả tính năng của chức năng cần phát triển>
**Truy cập:** <Đường dẫn đến chức năng>

**Màn hình chức năng:**
<Chèn placeholder hình ảnh màn hình>

**Sơ đồ chức năng (Swimlane - Horizontal pool):**
```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Chèn mã XML mxGraphModel cho sơ đồ dạng Swimlane Horizontal pool thể hiện các bước thực hiện của chức năng này -->
  </root>
</mxGraphModel>
```

**Mô tả thành phần giao diện:**
| STT | Tên | Loại control | Bắt buộc | Độ dài tối đa | Readonly | Mô tả |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | <Tên thành phần> | <Combobox/Text/EditText/...> | <x> | <Maxlength nếu có> | <x> | <Mô tả thành phần hiển thị: Lấy dữ liệu ở đâu, hàm nào?> |

**Luồng xử lý logic:**
| Bước | Mô tả |
| --- | --- |
| 1 | <Diễn giải logic cần xử lý cho từng thành phần giao diện. VD: Lấy dữ liệu từ hàm nào?/ Các case giả định> |

## 6. HÀM SERVICE
*(Lặp lại phần này cho mỗi API/Hàm được yêu cầu)*

### 6.1 <NÂNG CẤP/TẠO MỚI> <TÊN HÀM SERVICE>
**Thông tin chung về hàm service:**
<Mô tả tính năng của hàm cần phát triển>
**Đầu hàm:** <Tên đầu hàm>

**Mô tả chi tiết Input:**
| STT | Tham số | Kiểu dữ liệu | Ý nghĩa | Bắt buộc | Mô tả |
| --- | --- | --- | --- | --- | --- |
| 1 | <Tên param> | <String, int, boolean,...> | <Ý nghĩa> | <x> | <Mô tả dữ liệu lấy ở đâu để truyền vào/Service tự truyền> |

**Mô tả chi tiết Output:**
| STT | Tham số | Kiểu dữ liệu | Ý nghĩa |
| --- | --- | --- | --- |
| 1 | <Tên Param> | <String, int, boolean,...> | <Mô tả ý nghĩa của dữ liệu trả về> |

**Sơ đồ luồng (Sequence Diagram):**
```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Chèn mã XML mxGraphModel cho sơ đồ Sequence Diagram thể hiện sự tương tác API/Hệ thống ở đây -->
  </root>
</mxGraphModel>
```

**Xử lý luồng logic:**
| Bước | Mô tả |
| --- | --- |
| 1 | <Diễn giải logic xử lý thông tin/dữ liệu dưới Service> |

## 7. CHI TIẾT CÁC NGHIỆP VỤ ẢNH HƯỞNG

### 7.1 Các nghiệp vụ trong cùng hệ thống
- <Các chức năng bị ảnh hưởng và diễn giải ảnh hưởng>

### 7.2 Chức năng của hệ thống khác
- <Các chức năng của hệ thống khách bị ảnh hưởng và diễn giải ảnh hưởng>
```

## Instructions

1. **Understand Requirements**: Before generating the document, ensure you understand the business context and the feature requirements. If critical information is missing (like what the specific screens are, or what data needs to be saved), ask the user for clarification before generating the full document, OR clearly state in the document what needs to be filled out.
2. **Translate to Template**: Map the user's requirements into the structured format. 
3. **Be Precise**: For the "Mô tả thành phần giao diện" and "Hàm service", provide realistic and technically sound suggestions (e.g., proper control types, data types like `String`, `Integer`, JSON structures if applicable) based on standard web/app development practices.
4. **Draw.io / mxGraphModel Diagrams**: For diagrams (Business Flow, Swimlane, Sequence), generate valid `mxGraphModel` XML blocks. Ensure nodes (`mxCell` with `vertex="1"`) and edges (`mxCell` with `edge="1"`) are connected logically and have distinct IDs and geometries (`mxGeometry`). Since generating complex XML manually is challenging, focus on clarity, correct IDs, source/target referencing, and standard Draw.io styling elements so the user can directly copy and paste the XML into Draw.io (app.diagrams.net) via 'Extras -> Edit Diagram...'.
5. **Logic Flows**: Write logic flows in clear, step-by-step Vietnamese. Mention validations, error handling, and database updates where relevant.
