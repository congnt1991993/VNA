# Template Output chuẩn theo Phụ lục III — QĐ 671/QĐ-BTTTT

Kết quả danh sách Use Case phải được trình bày theo format dưới đây, tuân thủ Phụ lục III của Quyết định 671/QĐ-BTTTT ngày 26/04/2024 của Bộ Thông tin và Truyền thông.

---

## Bảng 1: Danh sách Tác nhân (Actor)

```markdown
### BẢNG DANH SÁCH TÁC NHÂN

| STT | Mã tác nhân | Tên tác nhân | Mô tả | Phân loại |
|-----|-------------|-------------|-------|-----------|
| 1 | AC-01 | [Tên tác nhân] | [Mô tả vai trò và trách nhiệm] | Đơn giản / Trung bình / Phức tạp |
| 2 | AC-02 | ... | ... | ... |

**Tổng hợp điểm Tác nhân (TAW):**

| Phân loại | Số lượng | Trọng số | Điểm |
|-----------|----------|----------|------|
| Đơn giản | [SL] | 1 | [SL × 1] |
| Trung bình | [SL] | 2 | [SL × 2] |
| Phức tạp | [SL] | 3 | [SL × 3] |
| **Tổng TAW** | | | **[Tổng]** |
```

### Quy tắc phân loại tác nhân:
- **Đơn giản (W=1)**: Hệ thống khác tương tác qua API đã được định nghĩa sẵn
- **Trung bình (W=2)**: Hệ thống khác tương tác qua giao thức (TCP/IP, HTTP...) hoặc người dùng qua giao diện dòng lệnh
- **Phức tạp (W=3)**: Người dùng tương tác qua giao diện đồ họa (GUI)

---

## Bảng 2: Danh sách Use Case (Bảng chuyển đổi yêu cầu chức năng sang trường hợp sử dụng)

Đây là bảng chính, trình bày theo từng **Nhóm chức năng / Module**:

```markdown
### BẢNG CHUYỂN ĐỔI YÊU CẦU CHỨC NĂNG SANG TRƯỜNG HỢP SỬ DỤNG

#### [Tên nhóm chức năng / Module]

| STT | Mã UC | Tên Use Case | Tác nhân | Mô tả kịch bản chính | Danh sách giao dịch (Transaction) | Số Trans | Phân loại BMT | Độ phức tạp | Trọng số |
|-----|-------|-------------|----------|----------------------|-----------------------------------|----------|---------------|-------------|----------|
| 1 | UC-[XX]-01 | [Tên UC] | [Tác nhân] | [Mô tả ngắn gọn kịch bản] | 1. [Trans 1]\n2. [Trans 2]\n3. [Trans 3] | [Số] | B/M/T | ĐG/TB/PT | 5/10/15 |
```

### Quy ước mã UC:
- Format: `UC-[Mã Module]-[Số thứ tự]`
- Ví dụ: `UC-QL-01` (UC Quản lý - số 01), `UC-TK-01` (UC Tích hợp - số 01)

### Quy ước viết Mô tả kịch bản:
Mô tả ngắn gọn luồng chính (happy path). Bao gồm cả ngoại lệ nhưng không cần liệt kê chi tiết từng bước. Tập trung vào **chức năng** mà hệ thống cung cấp, không mô tả thao tác trên giao diện.

### Quy ước viết Danh sách giao dịch:
Liệt kê tất cả transaction theo số thứ tự. Mỗi transaction là 1 tương tác nghiệp vụ có ý nghĩa. Ví dụ:
```
1. Hiển thị danh sách hồ sơ
2. Thêm mới hồ sơ
3. Cập nhật hồ sơ
4. Xóa hồ sơ
5. Xem chi tiết hồ sơ
```

---

## Bảng 3: Tổng hợp điểm Use Case (TBF)

```markdown
### BẢNG TỔNG HỢP ĐIỂM TRƯỜNG HỢP SỬ DỤNG (TBF)

| Phân loại BMT | Đơn giản (W=5) | Trung bình (W=10) | Phức tạp (W=15) | Tổng UC | Tổng điểm |
|---------------|----------------|--------------------|-----------------|---------|-----------| 
| **B** | [SL] × 5 = [Điểm] | [SL] × 10 = [Điểm] | [SL] × 15 = [Điểm] | [Tổng SL] | [Tổng Điểm] |
| **M** | [SL] × 5 = [Điểm] | [SL] × 10 = [Điểm] | [SL] × 15 = [Điểm] | [Tổng SL] | [Tổng Điểm] |
| **T** | [SL] × 5 = [Điểm] | [SL] × 10 = [Điểm] | [SL] × 15 = [Điểm] | [Tổng SL] | [Tổng Điểm] |
| **Tổng** | | | | **[Tổng UC]** | **TBF = [Tổng Điểm]** |
```

---

## Bảng 4: Tổng hợp điểm UUCP

```markdown
### TỔNG HỢP ĐIỂM UUCP (Unadjusted Use Case Points)

| Thành phần | Giá trị |
|-----------|---------|
| TAW (Total Actor Weight) | [Giá trị] |
| TBF (Total Business Function) | [Giá trị] |
| **UUCP = TAW + TBF** | **[Giá trị]** |
```

---

## Bảng 5 (Tùy chọn): Tổng hợp theo Module/Nhóm nghiệp vụ

```markdown
### TỔNG HỢP USE CASE THEO MODULE

| STT | Mã Module | Tên Module | Số UC (B) | Số UC (M) | Số UC (T) | Tổng UC | Tổng điểm |
|-----|-----------|-----------|-----------|-----------|-----------|---------|-----------|
| 1 | MOD-01 | [Tên Module] | [SL] | [SL] | [SL] | [Tổng] | [Điểm] |
| 2 | MOD-02 | ... | ... | ... | ... | ... | ... |
| | | **Tổng cộng** | **[SL]** | **[SL]** | **[SL]** | **[Tổng]** | **[Điểm]** |
```

---

## Lưu ý quan trọng khi sử dụng template

1. **Mỗi dự án** cần điều chỉnh mã module, tác nhân cho phù hợp với nghiệp vụ cụ thể
2. **Bảng 1 + 2 + 3 + 4** là **bắt buộc** theo QĐ 671
3. **Bảng 5** là tùy chọn nhưng rất hữu ích cho việc quản lý và trình bày
4. Khi viết xong, cần **kiểm tra chéo** để đảm bảo:
   - Tổng số UC trong Bảng 2 = Tổng trong Bảng 3
   - Tất cả tác nhân trong Bảng 2 đều xuất hiện trong Bảng 1
   - Không có UC nào trùng tên hoặc trùng transaction
   - Mỗi UC có tối đa 12 transaction (nếu > 12, xem xét tách)
