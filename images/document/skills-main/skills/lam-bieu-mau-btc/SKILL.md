---
name: lam-bieu-mau-btc
description: >
  Tự động hóa việc xử lý biểu mẫu chỉ tiêu phân cấp của Bộ Tài Chính (BTC).
  Skill này dùng để điền dữ liệu phân cấp (Số thứ tự, Số thứ tự hiển thị,
  Cấp Cha Id, Gốc Id, Độ sâu đệ quy) vào file template DM_BieuTieuChi_Temp
  dựa trên file biểu mẫu gốc.
  Hãy sử dụng skill này khi người dùng yêu cầu: làm biểu mẫu BTC, xử lý
  file DM_BieuTieuChi, điền dữ liệu phân cấp chỉ tiêu, tính độ sâu đệ quy
  cho biểu mẫu, tạo cấu trúc cha con cho tiêu chí, xử lý file Excel BTC
  có cấu trúc STT phân cấp (A, A.1, I, I.1, 1, 1.1, a, -), hoặc bất kỳ
  yêu cầu nào liên quan đến biểu mẫu tiêu chí của Bộ Tài Chính.
---

# Làm biểu mẫu BTC

Skill này tự động hóa quy trình xử lý file biểu mẫu chỉ tiêu phân cấp của Bộ Tài Chính (BTC). Quy trình bao gồm 2 bước chính:

1. **Điền dữ liệu phân cấp** — Tính toán và ghi 4 cột: `Số thứ tự`, `Số thứ tự hiển thị`, `Cấp Cha Id`, `Gốc Id`
2. **Tính độ sâu đệ quy** — Xác định `Độ sâu đệ quy` cho từng chỉ tiêu dựa trên file gốc và quan hệ cha-con

## Bối cảnh nghiệp vụ

Biểu mẫu BTC sử dụng hệ thống phân cấp STT (Số Thứ Tự) để tổ chức chỉ tiêu theo dạng cây. Cấu trúc phân cấp tuân theo quy tắc:

```
A (gốc)
├── A.1
│   ├── I
│   │   ├── I.1
│   │   │   ├── 1
│   │   │   │   ├── 1.1
│   │   │   │   │   ├── a (chữ thường)
│   │   │   │   │   │   └── - (dấu gạch ngang)
```

### Bảng phân loại STT

| Loại STT | Ví dụ | Cha của nó | Cách tìm cha |
|---|---|---|---|
| `ALPHABET_ROOT` | A, B, C | Không có (gốc) | — |
| `ALPHABET_DOTTED` | A.1, B.2 | Chữ cái gốc trước dấu `.` | Tìm ngược lên STT = prefix |
| `ROMAN` | I, II, III | ALPHABET_DOTTED hoặc ALPHABET_ROOT gần nhất | Tìm ngược theo type |
| `ROMAN_DOTTED` | I.1, II.3 | Số La Mã gốc trước dấu `.` | Tìm ngược lên STT = prefix |
| `NUMERIC_SINGLE` | 1, 2, 3 | ROMAN_DOTTED, ROMAN, ALPHABET_DOTTED, hoặc ALPHABET_ROOT | Tìm ngược theo type |
| `NUMERIC_DOTTED` | 1.1, 2.3 | Phần trước dấu `.` cuối | Tìm ngược lên STT = prefix |
| `LOWERCASE` | a, b, c | NUMERIC_DOTTED hoặc NUMERIC_SINGLE | Tìm ngược theo type |
| `DASH` | - | Bất kỳ dòng nào không phải DASH gần nhất | Tìm ngược, bỏ qua DASH |

## Đầu vào cần thiết

Khi người dùng yêu cầu làm biểu mẫu BTC, hỏi họ cung cấp:

1. **File biểu mẫu gốc** (ví dụ `12.5_TDTT.xlsx`) — Chứa dữ liệu chuẩn, trong đó có cột `Độ sâu đệ quy` (cột N, tức cột 14)
2. **File template** (ví dụ `DM_BieuTieuChi_Temp.xlsx.xlsx`) — File cần điền dữ liệu phân cấp
3. **Sheet gốc** (sheet chứa dữ liệu đầu vào trong file template, ví dụ `Bieumaudauvao_12.5.1`)
4. **Sheet đích** (sheet cần điền kết quả, ví dụ `Sheet1`)

## Cấu trúc cột trong Sheet đích

Dữ liệu bắt đầu từ **dòng 3** (dòng 1-2 là header). Các cột quan trọng:

| Cột | Tên | Mô tả |
|---|---|---|
| A (1) | Id | Mã định danh dòng |
| D (4) | Tên chỉ tiêu | Tên của chỉ tiêu |
| H (8) | Mã tham chiếu | ThamChieuId / RefCode |
| I (9) | Tên tham chiếu | Tên tham chiếu |
| J (10) | **Số thứ tự** | ← CẦN ĐIỀN: Thứ tự tăng dần cùng cấp (sibling index) |
| K (11) | **Số thứ tự hiển thị** | ← CẦN ĐIỀN: Giá trị STT gốc (A, A.1, I, ...) |
| L (12) | **Cấp Cha Id** | ← CẦN ĐIỀN: Id của chỉ tiêu cha (trống nếu gốc) |
| M (13) | **Gốc Id** | ← CẦN ĐIỀN: Id của chỉ tiêu gốc trên cùng |
| N (14) | **Độ sâu đệ quy** | ← CẦN ĐIỀN: Chiều sâu trong cây phân cấp |

## Quy trình thực hiện

### Bước 1: Chuẩn bị

1. Xác nhận đường dẫn file gốc và file template với người dùng
2. Tạo backup file template trước khi sửa đổi (thêm đuôi `.backup`)
3. Kill tất cả tiến trình Excel đang chạy trước khi bắt đầu

### Bước 2: Điền dữ liệu phân cấp (4 cột J-M)

Chạy script `scripts/update_hierarchy.ps1` với tham số:
- `-TemplateFile`: Đường dẫn file template
- `-SheetName`: Tên sheet đích (mặc định: `Sheet1`)

Script thực hiện:
1. Mở file Excel qua COM Application
2. Đọc toàn bộ dữ liệu bằng `Value2` (mảng 2 chiều)
3. Phân loại từng dòng theo loại STT (dùng hàm `Get-STT-Type`)
4. Tìm cha cho từng dòng bằng cách duyệt ngược theo quy tắc phân cấp
5. Tính `GocId` bằng đệ quy ngược lên gốc
6. Tính `SoThuTu` (sibling index) cho các dòng cùng cha
7. Ghi kết quả bằng bulk write (mảng 2D → Range.Value2)

### Bước 3: Tính độ sâu đệ quy (cột N)

Chạy script `scripts/update_depth.ps1` với tham số:
- `-SourceFile`: Đường dẫn file gốc (chứa độ sâu chuẩn)
- `-TemplateFile`: Đường dẫn file template
- `-SourceSheet`: Tên sheet trong file gốc (mặc định: `Sheet1`)
- `-TargetSheet`: Tên sheet đích (mặc định: `Sheet1`)

Script thực hiện:
1. Đọc dữ liệu từ cả file gốc và file template
2. So khớp dòng dựa trên `RefCode` và `Name` (dùng đếm occurrence index để xử lý trùng lặp)
3. Với dòng khớp: lấy trực tiếp depth từ file gốc
4. Với dòng không khớp: tính đệ quy dựa trên `ParentId` (depth = parentDepth + 1)
5. Ghi kết quả bằng bulk write vào cột N

### Bước 4: Xác minh kết quả

Sau khi chạy xong, mở file Excel và kiểm tra:
- Các cột J-N đã được điền đầy đủ
- Quan hệ cha-con đúng logic
- Gốc Id trỏ đúng về chỉ tiêu gốc
- Độ sâu đệ quy hợp lý (gốc = 0, con = cha + 1)

## Lưu ý kỹ thuật quan trọng

### Excel COM Application trên Windows

- **Luôn kill Excel trước khi chạy**: `Stop-Process -Name excel -Force -ErrorAction SilentlyContinue`
- **Dùng bulk write thay vì ghi từng cell**: Ghi đơn lẻ dễ gặp lỗi cast kiểu dữ liệu. Dùng `Range.Value2 = $2DArray` cho hiệu suất và độ ổn định
- **Encoding UTF-8**: Đặt `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` ở đầu script
- **Giải phóng COM object**: Luôn gọi `$excel.Quit()`, `ReleaseComObject`, `GC.Collect()` trong khối `finally`
- **DisplayAlerts = false**: Tránh popup hỏi lưu file

### Backup và khôi phục

- Tạo backup lần đầu: `Copy-Item $filePath "$filePath.backup"`
- Nếu backup đã tồn tại, khôi phục từ backup trước khi chạy lại (đảm bảo chạy trên dữ liệu sạch)
- Điều này cho phép chạy lại script nhiều lần mà không lo tích lũy lỗi

### Xử lý trùng lặp tên chỉ tiêu

Khi so khớp giữa file gốc và template, có thể có nhiều chỉ tiêu trùng tên. Giải pháp:
- Dùng `occurIndex` — đếm thứ tự xuất hiện của từng key (RefCode + Name) theo chuỗi tuần tự
- So khớp dòng thứ N trong template với dòng thứ N cùng key trong file gốc
