# Bảng Nguyên tắc Mô tả Yêu cầu Người sử dụng (Use Case)

Tài liệu này quy định **13 nguyên tắc bắt buộc** khi xây dựng danh sách Use Case cho dự án phần mềm chính phủ Việt Nam, nhằm đảm bảo tính nhất quán, tránh trùng lặp, và phù hợp với phương pháp tính chi phí theo QĐ 671/QĐ-BTTTT.

---

## Nguyên tắc 1: Gộp CRUD cho UC quản lý đối tượng

Đối với các chức năng quản lý đối tượng dữ liệu (danh mục, hồ sơ, biểu mẫu...):

- **Gộp Thêm mới + Sửa + Xóa + Xem** thành **1 UC duy nhất** (VD: "Quản lý danh mục loài cây")
- **Trình duyệt** (gửi phê duyệt): tối đa **1 UC**, loại **Đơn giản**
- **Phê duyệt** (Ký số): tối đa **1 UC**, loại **Đơn giản**
- **Từ chối**: tối đa **1 UC**, loại **Đơn giản**
- Có thể **ghép Phê duyệt + Từ chối** thành **1 UC** loại **Trung bình**

**Ví dụ:**

| UC | Tên UC | Loại |
|----|--------|------|
| UC-01 | Quản lý hồ sơ rừng (Thêm/Sửa/Xóa/Xem) | Trung bình |
| UC-02 | Phê duyệt và từ chối hồ sơ rừng | Trung bình |

---

## Nguyên tắc 2: Tách UC Thêm mới khi nghiệp vụ phức tạp

Khi nghiệp vụ "Thêm mới" quá phức tạp (nhiều bước xác nhận, tính toán, validate đặc thù):

- **Tách riêng UC Thêm mới** thành 1 UC độc lập
- UC còn lại (Sửa + Xóa) gộp chung, tối đa **Trung bình**
- Hạn chế sử dụng nguyên tắc này — chỉ áp dụng khi thực sự cần thiết

**Khi nào nên tách:** Quy trình thêm mới có trên 5 bước nghiệp vụ, cần validate chéo nhiều bảng dữ liệu, hoặc có luồng phê duyệt riêng.

---

## Nguyên tắc 3: Gộp Tìm kiếm và Kết xuất

- **Tìm kiếm + Xem chi tiết + Sắp xếp kết quả** = **1 UC**, tối đa **Trung bình**
- **Kết xuất** (Excel, PDF, CSV, tạo lệnh in) = **1 UC riêng**, tối đa **Trung bình**

**Ví dụ:**

| UC | Tên UC | Loại |
|----|--------|------|
| UC-03 | Tìm kiếm và xem chi tiết hồ sơ rừng | Trung bình |
| UC-04 | Kết xuất báo cáo hồ sơ rừng | Trung bình |

---

## Nguyên tắc 4: Tác nhân = Đối tượng thực hiện quy trình

- Tác nhân (Actor) phải là **người hoặc hệ thống thực sự tham gia** vào quy trình nghiệp vụ
- Danh sách tác nhân phải **tuân theo QĐ 671/QĐ-BTTTT** (phân loại Đơn giản/Trung bình/Phức tạp)
- Không sử dụng tác nhân chung chung như "Người dùng" — phải cụ thể hóa (VD: "Cán bộ kiểm lâm", "Quản trị hệ thống")

---

## Nguyên tắc 5: Không mô tả hành động thao tác trên giao diện

- **KHÔNG** viết: "Nhấn nút Thêm mới", "Click vào menu Quản lý", "Kéo thả file"
- **PHẢI** viết: "Hệ thống cho phép thêm mới hồ sơ rừng", "Hệ thống hiển thị danh sách hồ sơ"
- Lý do: UC mô tả **chức năng** cho hệ thống, không phải hướng dẫn sử dụng

---

## Nguyên tắc 6: Đầy đủ kịch bản (Success + Exception)

- Mỗi UC phải mô tả **cả trường hợp thành công VÀ ngoại lệ**
- Ngoại lệ bao gồm: lỗi validate dữ liệu, trùng lặp, hết phiên, không có quyền...
- **KHÔNG tách transaction** cho từng ngoại lệ — tất cả thuộc cùng 1 UC

**Mẫu kịch bản:**
```
Kịch bản chính (Thành công):
  1. Tác nhân yêu cầu thêm mới hồ sơ
  2. Hệ thống hiển thị biểu mẫu nhập liệu
  3. Tác nhân nhập thông tin và xác nhận
  4. Hệ thống kiểm tra và lưu hồ sơ

Ngoại lệ:
  3a. Dữ liệu không hợp lệ → Hệ thống thông báo lỗi
  3b. Hồ sơ trùng lặp → Hệ thống cảnh báo
```

---

## Nguyên tắc 7: Tránh mô tả giao diện (UI/UX)

- **KHÔNG** đề cập đến UI/UX trong mô tả UC trừ khi cần thiết
- Các hành động sau được coi là **yêu cầu phi chức năng** của hệ thống, KHÔNG tạo thành transaction riêng:
  - Nhấn nút "Làm mới" / "Thêm mới"
  - Xác nhận Lưu / Hủy khi thêm mới, chỉnh sửa
  - Xóa tiêu chí tìm kiếm
  - Các tác vụ nhập liệu (input fields, dropdown, datepicker...)

---

## Nguyên tắc 8: Gộp UC tương tự, tránh trùng đắm

- UC có tính chất tương tự **PHẢI được gộp** để tránh trùng lặp
- **Quy tắc vàng**: Một đối tượng dữ liệu chỉ nên có **1 UC tìm kiếm duy nhất**
- KHÔNG tách UC tìm kiếm theo các tiêu chí khác nhau (tìm theo tên, theo mã, theo ngày...)
- KHÔNG tách UC tìm kiếm theo các trạng thái xử lý khác nhau (chờ duyệt, đã duyệt, từ chối...)

**Sai:** UC Tìm kiếm hồ sơ chờ duyệt + UC Tìm kiếm hồ sơ đã duyệt + UC Tìm kiếm hồ sơ từ chối

**Đúng:** UC Tìm kiếm hồ sơ (bao gồm lọc theo trạng thái)

---

## Nguyên tắc 9: Không trùng tên UC và Transaction

- Mỗi UC phải có **tên duy nhất** trong toàn dự án
- Mỗi Transaction phải có **tên duy nhất** trong toàn UC
- Quy ước đặt tên UC: `[Hành động] + [Đối tượng]` (VD: "Quản lý hồ sơ rừng", "Phê duyệt báo cáo")

---

## Nguyên tắc 10: Ghi logs là 1 Transaction

- Chức năng **ghi logs** (audit trail) chỉ được tính là **1 transaction** trong UC có chứa nó
- KHÔNG tạo UC riêng cho việc ghi log của từng chức năng

---

## Nguyên tắc 11: Cấu hình và tra cứu Logs = 1 UC quản trị

- **Cấu hình ghi logs** + **Tra cứu logs nghiệp vụ** = **1 UC duy nhất** của Quản trị viên hệ thống
- Tác nhân: Quản trị hệ thống

---

## Nguyên tắc 12: Gọi API tích hợp

- Trên giao diện, việc gọi API tích hợp chỉ tính **1 transaction** trong UC chứa nó
- Nếu tích hợp với **nhiều hệ thống bên ngoài khác nhau** → **tách UC riêng** cho mỗi hệ thống
- UC tích hợp thuộc phân loại **M** (liên thông, kết nối)

**Ví dụ:**

| UC | Tên UC | Loại BMT |
|----|--------|----------|
| UC-10 | Đồng bộ dữ liệu với CSDL Quốc gia về dân cư | M |
| UC-11 | Liên thông với hệ thống Một cửa điện tử | M |

---

## Nguyên tắc 13: Danh sách tác nhân hệ thống tham khảo

Tùy theo dự án cụ thể, các tác nhân có thể bao gồm (nhưng không giới hạn):

- **Quản trị hệ thống tại TTDLQG** (Trung tâm Dữ liệu Quốc gia)
- **Quản trị hệ thống BNDP, TCDN** (Bộ/Ngành/Địa phương, Tổ chức/Đơn vị)
- **Công dân**
- **Cán bộ TCDN** (Cán bộ tại Tổ chức/Đơn vị)
- **Các tác nhân khác** theo quy trình nghiệp vụ cụ thể của dự án

> **Lưu ý**: Danh sách trên là tham khảo. Khi áp dụng cho dự án cụ thể, cần xác định lại danh sách tác nhân phù hợp với nghiệp vụ và tổ chức của dự án đó.
