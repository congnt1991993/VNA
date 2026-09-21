---
name: mo-ta-man-hinh
description: Thiết kế, biên soạn và đặc tả chi tiết thành phần màn hình (Screen Element Description) chuẩn Senior BA từ mockup hoặc hình ảnh giao diện được cung cấp. Tự động gộp tất cả trường dữ liệu và tab của màn hình vào 1 bảng duy nhất có số thứ tự (STT) dạng phân cấp cha-con (1., 2., 2.1, 2.2,...). Hỗ trợ tự động xuất tài liệu ra định dạng Word (.docx) thông qua script PowerShell có sẵn.
---

# Skill Đặc tả & Mô tả thành phần màn hình (Senior Business Analyst)

Skill này giúp bạn đóng vai trò là một **Senior Business Analyst (BA)** chuyên nghiệp, phân tích hình ảnh thiết kế (Mockup/Figma/Ảnh chụp giao diện) hoặc tài liệu thô để biên soạn cuốn tài liệu **Mô tả thành phần màn hình (UI/Screen Element Specification)** đạt chuẩn chất lượng cao.

---

## 1. Quy trình thực hiện tổng quát

1. **Phân tích giao diện:** Quan sát hình ảnh giao diện được cung cấp, nhận diện các khu vực (Header, Tabs, Bộ lọc Tìm kiếm, Bảng danh sách kết quả, Popups, Form khai báo, Phân trang).
2. **Liệt kê thành phần:** Xác định toàn bộ các control tương tác (Text box, Button, Dropdown, Checkbox/Radio, Tabs, Text, Badge,...) trên màn hình.
3. **Biên soạn bảng đặc tả:** Tạo **1 bảng duy nhất** bao gồm toàn bộ các thành phần trên giao diện theo đúng cấu trúc chuẩn.
4. **Áp dụng số thứ tự phân cấp:** Sử dụng cấu trúc phân cấp cha - con để gom nhóm trực quan theo tab hoặc theo khu vực chức năng.
5. **Chuyển đổi sang tài liệu Word (.docx):** Chạy script PowerShell đi kèm để tự động xuất bản file Word đẹp mắt cho người dùng.

---

## 2. Tiêu chuẩn cấu trúc bảng đặc tả

Bảng đặc tả thành phần màn hình **bắt buộc** phải bao gồm 5 cột sau:

1. **STT (Số thứ tự):** Định dạng dạng phân cấp cha - con (Ví dụ: `1`, `2`, `2.1`, `2.2`...) để thể hiện cấu trúc nhóm và tab.
2. **Tên trường dữ liệu:** Tên nhãn (Label) hiển thị của trường. Nếu là trường bắt buộc nhập thì phải thêm dấu sao đỏ `*` cạnh tên trường (Ví dụ: `Email *`).
3. **Kiểu điều khiển:** Xác định rõ loại control:
   - `Text box` (Dùng để nhập text, ngày tháng dạng Datepicker, số).
   - `Button` (Nút bấm, nút bấm dropdown).
   - `Dropdown list` (Danh sách chọn duy nhất).
   - `Radio button / Checkbox` (Chọn 1 hoặc chọn nhiều).
   - `Tab` (Tab điều hướng).
   - `Text / Badge` (Hiển thị nhãn, thông tin dạng tĩnh hoặc nhãn màu).
4. **Bắt buộc:** Ghi rõ `Có` hoặc `Không`.
5. **Mô tả:** Nơi chứa toàn bộ quy tắc nghiệp vụ (Business Rules), quy tắc kiểm tra ràng buộc dữ liệu (Validation Rules) và hành vi hệ thống:
   - *Phạm vi hiển thị:* Định rõ thành phần thuộc khu vực nào hoặc tab nào (Ví dụ: `[Bộ lọc - Chỉ ở Tab Lịch sử thao tác]`).
   - *Giới hạn ký tự:* Độ dài tối đa, tối thiểu.
   - *Định dạng dữ liệu:* Validate định dạng Email, Số điện thoại, Số nguyên, Ngày tháng, v.v.
   - *Giá trị mặc định (Default value):* Giá trị hiển thị ngay khi tải trang.
   - *Ràng buộc validate và nội dung lỗi (Error Message):* Mô tả hành vi khi nhập sai và thông báo hiển thị (Ví dụ: *Nếu để trống, báo lỗi: "Tên đăng nhập không được để trống."*).
   - *Hành vi hệ thống (System behaviors):* Khi click nút, khi chuyển tab, khi thay đổi giá trị.

---

## 3. Cách đánh số thứ tự (STT) phân cấp

Để mô tả được nhiều tab hoặc nhiều nhóm thành phần trong **1 bảng duy nhất** mà vẫn khoa học, hãy áp dụng quy tắc STT sau:

* **STT mức 1 (Số nguyên: 1, 2, 3...):** Dành cho các thành phần dùng chung ở cấp độ lớn như Tiêu đề, các Tab chính hoặc tiêu đề cho nhóm Dùng chung.
* **STT mức 2 (Số phân cấp: 2.1, 2.2, 3.1, 3.2...):** Dành cho các thành phần con nằm bên trong các Tab hoặc Nhóm tương ứng.

**Ví dụ thực tế cấu trúc STT:**
- **1** - Tiêu đề "Quản lý người dùng" (Header chung)
- **2** - **Tab "Lịch sử thao tác"** (Tab cha)
  - **2.1** - Nút "Tìm kiếm nâng cao" (Con của tab Lịch sử thao tác)
  - **2.2** - Tên người dùng (Con - Bộ lọc của tab Lịch sử thao tác)
  - **2.3** - Danh sách kết quả thao tác (Con - Bảng của tab Lịch sử thao tác)
- **3** - **Tab "Chi tiết thay đổi"** (Tab cha)
  - **3.1** - Loại thay đổi (Con - Bộ lọc của tab Chi tiết thay đổi)
  - **3.2** - Bảng so sánh thay đổi (Con - Bảng của tab Chi tiết thay đổi)
- **4** - **Thành phần Dùng chung bộ lọc & Bảng** (Nhóm cha dùng chung)
  - **4.1** - Ngày bắt đầu (Dùng chung cho cả hai Tab)
  - **4.2** - Ngày kết thúc (Dùng chung cho cả hai Tab)
  - **4.3** - Phân trang (Dùng chung cho cả hai Tab)

---

## 4. Hướng dẫn tự động xuất bản tệp Word (.docx)

Sau khi tạo/chỉnh sửa file đặc tả Markdown (`.md`), bạn có thể tự động chuyển đổi file này thành file tài liệu Word (`.docx`) chuyên nghiệp bằng cách sử dụng script PowerShell tích hợp sẵn trong skill này.

### Cách chạy chuyển đổi:
Sử dụng công cụ thực thi dòng lệnh (`run_command`) để chạy script PowerShell theo cú pháp sau:

```powershell
powershell -ExecutionPolicy Bypass -File "[Đường dẫn tới folder skill]\scripts\convert_md_to_docx.ps1" -SourcePath "[Đường dẫn tuyệt đối file nguồn .md]" -DestPath "[Đường dẫn tuyệt đối file đích .docx]"
```

*Ví dụ:*
```powershell
powershell -ExecutionPolicy Bypass -File "c:\Users\congnt\OneDrive - Synodus.com\GOV\skills-main\skills\mo-ta-man-hinh\scripts\convert_md_to_docx.ps1" -SourcePath "c:\Users\congnt\OneDrive - Synodus.com\GOV\Quản lý dữ liệu\Mô tả giao diện\Mo_ta_thanh_phan_man_hinh.md" -DestPath "c:\Users\congnt\OneDrive - Synodus.com\GOV\Quản lý dữ liệu\Mô tả giao diện\Mo_ta_thanh_phan_man_hinh.docx"
```

### Ưu điểm của bộ chuyển đổi đi kèm:
- Tự động phân tích các thẻ Markdown (Headers, Bảng, In đậm, Danh sách, Thẻ `<br>` xuống dòng trong ô).
- Tự động áp dụng Style chuyên nghiệp cho file Word: font chữ Arial, khoảng cách dòng thoáng rộng, định dạng border và màu nền header bảng rõ nét, giúp tài liệu sẵn sàng cho in ấn và báo cáo trực tiếp.
