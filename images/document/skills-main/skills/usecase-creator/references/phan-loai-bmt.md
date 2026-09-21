# Hướng dẫn Phân loại Use Case theo QĐ 671/QĐ-BTTTT

Theo Quyết định 671/QĐ-BTTTT ngày 26/04/2024 của Bộ Thông tin và Truyền thông, trường hợp sử dụng (Use Case) được phân nhóm bằng cách **kết hợp 02 phương pháp phân loại**:

1. Phân loại theo **BMT** (tính chất nghiệp vụ)
2. Phân loại theo **Độ phức tạp** (số lượng giao dịch/transaction)

---

## 1. Phân loại theo BMT

### Loại B — Nghiệp vụ (Business)

> UC có các giao dịch mô tả **yêu cầu chức năng nghiệp vụ** của phần mềm, KHÔNG bao gồm các chức năng được phân loại M và T.

**Đặc điểm nhận biết:**
- Quản lý dữ liệu nội bộ (CRUD: thêm, sửa, xóa, xem)
- Quy trình phê duyệt, trình ký nội bộ
- Tìm kiếm, báo cáo, thống kê từ dữ liệu nội bộ
- Quản trị hệ thống (phân quyền, cấu hình, logs)
- Kết xuất dữ liệu (Excel, PDF, in ấn)

**Ví dụ:**
- Quản lý danh mục loài cây
- Phê duyệt hồ sơ khai thác
- Tìm kiếm và xem chi tiết hồ sơ rừng
- Quản lý tài khoản người dùng

---

### Loại M — Liên thông (Middleware/Integration)

> UC có các giao dịch mô tả yêu cầu chức năng **kết nối, liên thông, chia sẻ dữ liệu** với các hệ thống hạ tầng kỹ thuật, phần mềm, cơ sở dữ liệu liên quan.

**Đặc điểm nhận biết:**
- Gọi/nhận API từ hệ thống bên ngoài
- Đồng bộ dữ liệu với CSDL quốc gia, CSDL ngành
- Tích hợp qua LGSP/NGSP (nền tảng tích hợp, chia sẻ dữ liệu)
- Liên thông với hệ thống Một cửa điện tử, Cổng DVC quốc gia
- Nhận/gửi dữ liệu qua WebService, Message Queue
- Kết nối với hệ thống xác thực tập trung (SSO)

**Ví dụ:**
- Đồng bộ dữ liệu công dân từ CSDL quốc gia về dân cư
- Liên thông hồ sơ với hệ thống Một cửa điện tử
- Chia sẻ dữ liệu rừng qua LGSP tỉnh
- Nhận kết quả xác thực từ hệ thống SSO

---

### Loại T — Công nghệ cao (Technology)

> UC có các giao dịch mô tả yêu cầu chức năng ứng dụng **trí tuệ nhân tạo (AI), chuỗi khối (Blockchain), thực tế ảo/thực tế tăng cường (VR/AR), Datamining, Digital Twin**... để hỗ trợ ra quyết định.

**Đặc điểm nhận biết:**
- Sử dụng mô hình AI/ML để phân tích, dự đoán, nhận dạng
- Ứng dụng Blockchain để truy xuất nguồn gốc, xác thực
- Khai phá dữ liệu (Data Mining) để phát hiện xu hướng
- Tạo bản sao số (Digital Twin) để mô phỏng
- Sử dụng VR/AR để trực quan hóa
- Xử lý ảnh vệ tinh, viễn thám bằng AI
- Chatbot/trợ lý ảo hỗ trợ người dùng

**Ví dụ:**
- Phát hiện cháy rừng bằng AI xử lý ảnh vệ tinh
- Dự báo nguy cơ sạt lở bằng mô hình Machine Learning
- Truy xuất nguồn gốc gỗ bằng Blockchain
- Chatbot hỗ trợ tra cứu thông tin lâm nghiệp

---

## 2. Phân loại theo Độ phức tạp (số Transaction)

Độ phức tạp của UC được xác định dựa trên **số lượng giao dịch (transaction)** mà UC chứa:

| Loại | Số giao dịch | Trọng số (Weight) |
|------|-------------|-------------------|
| **Đơn giản** | < 4 (tức ≤ 3) | 5 |
| **Trung bình** | 4 – 7 | 10 |
| **Phức tạp** | > 7 (tức ≥ 8) | 15 |

### Quy tắc bổ sung:
- Nếu UC có **> 12 giao dịch**: PHẢI xem xét lại mô tả UC, có thể cần **tách** thành nhiều UC nhỏ hơn
- Nếu UC có **nhiều hơn 1 mục tiêu sử dụng** của tác nhân: **BẮT BUỘC tách** thành các UC khác nhau

### Thế nào là 1 Transaction (Giao dịch)?

Transaction là **một tương tác có ý nghĩa nghiệp vụ** giữa tác nhân và hệ thống. Cụ thể:

**Được tính là Transaction:**
- Nhập và lưu dữ liệu (mỗi form nhập liệu chính = 1 trans)
- Kiểm tra/validate dữ liệu nghiệp vụ
- Tìm kiếm và hiển thị kết quả
- Xem chi tiết bản ghi
- Cập nhật trạng thái (duyệt, từ chối, hủy...)
- Xóa bản ghi (có xác nhận)
- Kết xuất/in báo cáo
- Gọi API tích hợp với hệ thống ngoài
- Ghi logs (nếu có)
- Gửi thông báo/email

**KHÔNG tính là Transaction:**
- Nhấn nút trên giao diện (nút Thêm mới, nút Lưu, nút Hủy)
- Xác nhận hành động (popup confirm)
- Điều hướng giữa các màn hình
- Xóa tiêu chí tìm kiếm / làm mới form
- Hiển thị tooltip, thông báo hệ thống

---

## 3. Ma trận Kết hợp BMT × Độ phức tạp

Khi đã xác định được cả 2 phân loại, UC sẽ rơi vào 1 trong 9 ô trong ma trận sau:

| | Đơn giản (W=5) | Trung bình (W=10) | Phức tạp (W=15) |
|---|---|---|---|
| **B** | B-Đơn giản | B-Trung bình | B-Phức tạp |
| **M** | M-Đơn giản | M-Trung bình | M-Phức tạp |
| **T** | T-Đơn giản | T-Trung bình | T-Phức tạp |

**Cách tính điểm UC (TBF - Total Business Function):**
```
TBF = Σ (Số lượng UC trong mỗi ô × Trọng số tương ứng)
```

**Ví dụ tính:**
- 10 UC loại B-Đơn giản: 10 × 5 = 50
- 15 UC loại B-Trung bình: 15 × 10 = 150
- 3 UC loại M-Trung bình: 3 × 10 = 30
- 2 UC loại T-Phức tạp: 2 × 15 = 30
- **TBF = 50 + 150 + 30 + 30 = 260**

---

## 4. Phân loại Tác nhân (Actor Weight)

Theo QĐ 671, tác nhân cũng được phân loại theo độ phức tạp:

| Loại | Đặc điểm | Trọng số (Weight) |
|------|----------|-------------------|
| **Đơn giản** | Hệ thống khác tương tác qua API đã được định nghĩa sẵn | 1 |
| **Trung bình** | Hệ thống khác tương tác qua giao thức (TCP/IP, HTTP...) hoặc người dùng qua giao diện dòng lệnh | 2 |
| **Phức tạp** | Người dùng tương tác qua giao diện đồ họa (GUI) | 3 |

**Cách tính điểm Tác nhân (TAW - Total Actor Weight):**
```
TAW = Σ (Số lượng tác nhân trong mỗi loại × Trọng số tương ứng)
```

---

## 5. Tổng hợp điểm UUCP

```
UUCP = TAW + TBF
```

Trong đó:
- **TAW**: Tổng trọng số tác nhân
- **TBF**: Tổng trọng số trường hợp sử dụng

> **Lưu ý**: UUCP là giá trị **trước hiệu chỉnh**. Giá trị sau hiệu chỉnh (AUCP) cần nhân thêm hệ số TCF (Technical Complexity Factor) và EF (Environmental Factor) theo QĐ 671.
