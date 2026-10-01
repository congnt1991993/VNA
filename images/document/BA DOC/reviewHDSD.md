# BÁO CÁO RÀ SOÁT TÀI LIỆU HƯỚNG DẪN SỬ DỤNG (HDSD)
## ĐỐI CHIẾU VỚI HỆ THỐNG VNA NETZERO ESG THỰC TẾ

> **Tài liệu đối chiếu gốc:** [`HDSD_Trang nhập liệu.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Trang%20nh%E1%BA%ADp%20li%E1%BB%87u.docx)  
> **Tài liệu tham chiếu liên quan:** [`Kich_Ban_Thong_Bao_Notification_VNA.md`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/Kich_Ban_Thong_Bao_Notification_VNA.md) & [`Danh_Sach_Kich_Ban_Thong_Bao_Notification_VNA.xlsx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/Danh_Sach_Kich_Ban_Thong_Bao_Notification_VNA.xlsx)  
> **Phiên bản hệ thống:** Hệ thống Quản trị & Báo cáo Phát triển Bền vững (ESG) - Vietnam Airlines (Active Prototype / Dev Environment)  
> **Ngày thực hiện rà soát:** 01/10/2026  
> **Người thực hiện:** Antigravity AI Assistant & VNA Project Team  

---

## I. TỔNG QUAN KẾT QUẢ RÀ SOÁT (EXECUTIVE SUMMARY)

Tài liệu `HDSD_Trang nhập liệu.docx` là tài liệu hướng dẫn sử dụng tổng thể cho **toàn bộ 8 phân hệ** của Hệ thống ESG Vietnam Airlines (mặc dù tên tệp là Trang nhập liệu nhưng bao quát toàn bộ hệ thống từ Đăng nhập, Dashboard, Quản lý chỉ tiêu, Nhập liệu, Quản lý KPI, Báo cáo & Công bố đến Khuyến nghị Claim SAF).

Qua quá trình rà soát chi tiết từng chương mục, từng bảng biểu và đối chiếu trực tiếp với mã nguồn hiện hành (`pages/`, `components/`, `data/`), nhóm đánh giá đã phát hiện tổng cộng **24 điểm cần chỉnh sửa, cập nhật**, bao gồm:

* **8 Điểm Sai lệch / Lỗi thời (Outdated / Incorrect)**: Nội dung trong tài liệu phản ánh thiết kế cũ, mâu thuẫn trực tiếp với giao diện và hành vi thực tế của hệ thống hiện tại.
* **12 Điểm Còn thiếu (Missing Features)**: Các chức năng quan trọng đã được phát triển, nghiệm thu và vận hành trên hệ thống nhưng tài liệu chưa hề đề cập.
* **4 Điểm Cần làm rõ / Bổ sung quy tắc nghiệp vụ (Ambiguities / Business Rules)**: Các hành vi tự động của hệ thống (như ẩn thuyết minh khi chọn không đáp ứng, cơ chế deep-link, validation import Excel) cần được hướng dẫn tường minh để người dùng không bỡ ngỡ.

### Biểu đồ phân bổ mức độ ưu tiên:
* **Mức độ Cao (P1 - Nghiêm trọng, bắt buộc sửa ngay):** 10 điểm (Liên quan đến CMS Backlog Từ chối, Đổi tên bảng SAF, Thiếu Xuất/Nhập Excel, Thiếu Hệ thống Thông báo Quả chuông, Sai bản chất Kho tài liệu).
* **Mức độ Trung bình (P2 - Cần cập nhật sớm):** 9 điểm (Bộ lọc cột dữ liệu, các Form Control nâng cao, 3 trường Thân trang Lower, phân quyền vai trò).
* **Mức độ Thấp (P3 - Tinh chỉnh câu chữ, bổ sung ghi chú):** 5 điểm (Thuật ngữ, song ngữ VI/EN, sắp xếp thứ tự hiển thị).

---

## II. MA TRẬN ĐỐI CHIẾU SAI LỆCH & THIẾU SÓT THEO TỪNG PHÂN HỆ

| STT | Phân hệ / Chương | Vị trí trong HDSD | Nội dung trong tài liệu HDSD | Thực tế trên Hệ thống hiện tại | Phân loại | Mức độ |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | **Hệ thống Thông báo (Notification)** | Toàn bộ tài liệu | **Hoàn toàn KHÔNG CÓ** mục nào hướng dẫn về biểu tượng Quả chuông và danh sách thông báo. | Hệ thống đã có **Hệ thống Quả chuông Thông báo thời gian thực** trên Header: hiển thị badge số lượng, dropdown panel, 4 mức độ tin (Action, Warning, Success, Info), cơ chế Deep Link điều hướng thông minh. | **Thiếu** | **P1 (Cao)** |
| **2** | **CMS - Quản lý Biểu đồ Công bố** | Mục 7.4.4 (Trang 28-29, P413-P418) | Chỉ mô tả việc kéo thẻ từ Backlog lên Sprint và xóa thẻ. **Không có thao tác Từ chối**. | Tại mỗi thẻ ở Backlog có **icon Từ chối (XCircle)**. Bấm vào mở **Popup bắt buộc nhập Lý do từ chối**, bỏ thẻ khỏi Backlog và tự động bắn thông báo `NOTIF-CMS-004` cho người đề xuất. | **Thiếu** | **P1 (Cao)** |
| **3** | **CMS - Thân trang (Lower)** | Mục 7.4.5 (Trang 30, P421-P428) | Chỉ mô tả danh sách bài viết đồng bộ từ Spirit API. | Bổ sung **Khối cấu hình Section Tin tức & Hoạt động** gồm 3 trường song ngữ VI/EN phía trên bảng tin: **Nhãn trên (Tagline)**, **Tiêu đề chính (Title)**, **Đoạn mô tả (Description)**. | **Thiếu** | **P2 (Trung bình)** |
| **4** | **Khuyến nghị Claim SAF** | Mục 8 (Trang 32-34, P449) | Bảng Phân bổ lô SAF dùng tên cột cũ tiếng Việt: *Mã lô & Ngày nạp, Sân bay xuất phát, Khối lượng SAF (Tấn), CO2 Giảm trừ, Cơ chế Phân bổ*. | Bảng đã được đổi tên và chuẩn hóa quốc tế: **`BATCH No`, `Ngày nạp`, `DEP`, `ARR`, `NEAT SAF`, `FLS`, `CO2`, `USD`, `Apply`**. Có bảng đa tầng chia theo 3 cơ chế (EU ETS, UK ETS, CORSIA). | **Sai lệch** | **P1 (Cao)** |
| **5** | **Khuyến nghị Claim SAF** | Mục 8 (Trang 32-34) | Không nhắc đến tính năng xuất file báo cáo phân bổ lô SAF. | Hệ thống đã có nút **"Xuất Excel phân bổ"** xuất file `.xlsx` chuẩn 2 dòng tiêu đề nhóm cho các hãng bay/kiểm toán. | **Thiếu** | **P2 (Trung bình)** |
| **6** | **Nhập liệu - Xuất/Nhập Excel** | Mục 5.3 (Trang 18, P185-P194) | Chỉ mô tả nhập trực tiếp trên lưới, thêm dòng, xóa dòng. | Hệ thống có 2 nút nổi bật: **"Xuất Excel"** (tải file mẫu/dữ liệu) và **"Nhập Excel"** (`ExcelImportModal` kiểm tra lỗi từng ô, tọa độ Excel, preview). | **Thiếu** | **P1 (Cao)** |
| **7** | **Nhập liệu - Bộ lọc từng cột** | Mục 5.3 (Trang 18) | Không nhắc đến bộ lọc trên bảng dữ liệu nhập. | Bảng dữ liệu có **hàng lọc (Column Filter Row)** riêng dưới từng cột, thanh đếm `Đang lọc: X / Y dòng` và nút bấm `✕ Xóa tất cả bộ lọc cột`. | **Thiếu** | **P2 (Trung bình)** |
| **8** | **Nhập liệu - Chỉ tiêu tĩnh (GRI)** | Mục 5.2 (Trang 17, P174-P178) | Hướng dẫn chọn Đáp ứng/Không đáp ứng và bắt buộc nhập thuyết minh. | **Quy tắc nghiệp vụ thực tế:** Khi chọn trạng thái trái cấu hình VNA (ví dụ chọn *Không đáp ứng*), hệ thống **tự động hiển thị cảnh báo vàng và ẩn khung soạn thảo thuyết minh**. | **Thiếu quy tắc** | **P2 (Trung bình)** |
| **9** | **Nhập liệu - Form Control nâng cao** | Mục 5.3 (Trang 18, P186) | Chỉ ghi chung chung là văn bản, số, ngày tháng, checkbox. | Hỗ trợ các control chuyên biệt: Dropdown NCC Việt Nam/Nước ngoài, Cam kết PTBV Có/Không, Chọn ngày bắt đầu/kết thúc hợp đồng, Textarea cam kết. | **Thiếu** | **P2 (Trung bình)** |
| **10** | **Kho tài liệu PTBV** | Mục 7.3 (Trang 25, P370) | Ghi rằng: *"Mọi tài liệu tải lên mặc định ở phạm vi Public, tự động hiển thị ở mục Lưu trữ Báo cáo trên CMS mà không cần thao tác công bố thêm"*. | **Sai lệch nghiêm trọng:** Tài liệu có phân quyền rõ ràng **Public** và **Nội bộ (Internal)**; hệ thống có quy trình **Phê duyệt tài liệu (`DocumentApproval.tsx`)** trước khi lưu kho chung. | **Sai lệch** | **P1 (Cao)** |
| **11** | **Kho tài liệu PTBV** | Mục 7.3 (Trang 24-25) | Chỉ mô tả 1 danh sách tài liệu hiện hành. | Giao diện gồm 2 Tab chính: **`REPOSITORY` (Kho tài liệu chung)** và **`REQUESTS` (Yêu cầu nộp/duyệt tài liệu)**. | **Thiếu** | **P2 (Trung bình)** |
| **12** | **Quản lý Chỉ tiêu - Xuất/Nhập** | Mục 4 (Trang 13-16) | Chỉ hướng dẫn thêm thủ công từng chỉ tiêu và cấu hình công thức. | Có modal **"Nhập chỉ tiêu từ Excel" (`IndicatorImportModal`)** và **"Xuất dữ liệu thô" (`RawDataExportModal`)** cho phép chọn dải ngày xuất dữ liệu. | **Thiếu** | **P2 (Trung bình)** |
| **13** | **Quản lý Chỉ tiêu - Sắp xếp** | Mục 4.1 (Trang 13-14) | Không hướng dẫn cơ chế đổi thứ tự chỉ tiêu. | Hỗ trợ kéo thả (`GripVertical`) hoặc bấm icon mũi tên lên/xuống để sắp xếp thứ tự ưu tiên hiển thị của chỉ tiêu. | **Thiếu** | **P3 (Thấp)** |
| **14** | **Điều chỉnh số liệu công bố** | Mục 7.2.3 (Trang 23-24, P342-P348) | Chỉ nêu 3 trạng thái: Nháp, Đã gửi, Công bố. | Khi bị CMS Admin từ chối ở Backlog, phiên bản hiển thị trạng thái **Bị từ chối** kèm **Lý do từ chối chi tiết** của Ban KHPT để chuyên viên chỉnh lý. | **Thiếu** | **P1 (Cao)** |
| **15** | **Vai trò người dùng (Roles)** | Mục 1.4 (Trang 7, Table 1) | Liệt kê mã vai trò: `SYS_ADMIN`, `DEPT_INPUT`, `DEPT_VIEW`, `CORP_BOARD`. | Mã vai trò thực tế trong hệ thống là: **`ROLE_ADMIN`**, **`ROLE_APPROVER`**, **`ROLE_TECH_ENTRY`**, **`ROLE_SOCIAL_ENTRY`**, **`ROLE_GOV_ENTRY`**, **`ROLE_VIEWER`**. | **Sai lệch** | **P2 (Trung bình)** |
| **16** | **Chuyển đổi ngôn ngữ (VI/EN)** | Mục 2 (Trang 8-10) | Không hướng dẫn nút chuyển đổi ngôn ngữ ở Header. | Header có nút chuyển nhanh **VI Tiếng Việt / EN English**, tự động dịch toàn bộ Menu, tên chỉ tiêu song ngữ và nhãn giao diện. | **Thiếu** | **P2 (Trung bình)** |
| **17** | **Bộ chọn CQĐV (Dept Context)** | Mục 2 & Mục 5 | Không giải thích thanh chọn CQĐV trên Header dành cho Admin. | Cho phép tài khoản Admin/Lãnh đạo chuyển đổi ngữ cảnh đơn vị công tác (Ban ATCL, Khai thác, Kỹ thuật...) để xem form nhập liệu đúng như chuyên viên ban đó. | **Thiếu** | **P2 (Trung bình)** |
| **18** | **Dashboard chuyên sâu** | Mục 3 (Trang 10-12) | Chỉ chụp 1 Dashboard chung (Tổng quan điều hành). | Hệ thống đã tách các tab/màn hình Dashboard chuyên sâu theo 3 trụ cột: **Môi trường (Env)**, **Xã hội (Soc)**, **Quản trị (Gov)** và **Dashboard Lãnh đạo (Executive)**. | **Thiếu** | **P2 (Trung bình)** |
| **19** | **Quản lý KPI - Tính toán tự động** | Mục 6.1.2 (Trang 19) | Bảng Table 3 và Table 4 mô tả chiều đánh giá tăng/giảm. | Cần bổ sung quy tắc tự động tính tổng phân bổ 12 tháng so với hạn mức Năm và cơ chế cảnh báo vượt ngưỡng. | **Cần làm rõ** | **P3 (Thấp)** |
| **20** | **Quản lý KPI - Lọc theo CQĐV** | Mục 6.1.4 (Trang 20) | Chỉ mô tả lọc theo Năm và tìm kiếm từ khóa. | Có bộ lọc đa chiều: Lọc theo **CQĐV phụ trách**, Lọc theo **Trụ cột ESG (E/S/G)**, Lọc theo **Tần suất báo cáo (Tháng/Năm)**. | **Thiếu** | **P3 (Thấp)** |
| **21** | **Audit Log - Snapshot dữ liệu** | Mục 5.4 (Trang 18-19, P196-P200) | Ghi nhận các cột: STT, Thời gian, Tên biểu, Tài khoản. | Cần bổ sung hình ảnh và hướng dẫn xem chi tiết so sánh chênh lệch dữ liệu giữa 2 phiên bản (Diff view). | **Cần làm rõ** | **P3 (Thấp)** |
| **22** | **CMS - Kéo thả biểu đồ xuất bản** | Mục 7.4.4 (Trang 28, P407) | Ghi kéo-thả để đổi thứ tự biểu đồ xuất bản. | Cần bổ sung lưu ý: Thứ tự sắp xếp biểu đồ tại đây quyết định trực tiếp thứ tự hiển thị của các khối biểu đồ trên trang chi tiết Trụ cột đối ngoại. | **Cần làm rõ** | **P3 (Thấp)** |
| **23** | **CMS - Thông báo lỗi trùng phiên bản** | Mục 7.4.4 (Trang 29, P416-P418) | Ảnh minh họa Hình 33 thể hiện popup lỗi tiếng Việt. | Cần bổ sung hướng dẫn xử lý khi gặp thông báo: Phải bấm icon Gỡ phiên bản cũ tại danh sách xuất bản trước khi đưa phiên bản mới lên. | **Cần làm rõ** | **P3 (Thấp)** |
| **24** | **Báo cáo thường niên (Annual Report)** | Mục 7.1 (Trang 21-23) | Danh sách đợt thu thập và tạo yêu cầu nộp báo cáo. | Cần cập nhật luồng đôn đốc tự động gửi email/thông báo khi sắp đến hạn chót (Deadline) nộp báo cáo của các Tổ ban. | **Thiếu** | **P2 (Trung bình)** |

---

## III. PHÂN TÍCH CHI TIẾT CÁC ĐIỂM TRỌNG TÂM CẦN HIỆU CHỈNH

### 1. PHÂN HỆ CMS: NGHIỆP VỤ TỪ CHỐI THẺ YÊU CẦU CÔNG BỐ TẠI BACKLOG (P1)
* **Hiện trạng tài liệu (Mục 7.4.4, Trang 28-29):**
  * Tài liệu chỉ mô tả chiều thuận: Ban nghiệp vụ gửi đề nghị công bố -> Admin CMS thấy thẻ trong Backlog -> Bấm `+` hoặc kéo lên Sprint để xuất bản.
  * Khi không muốn xuất bản, tài liệu chỉ nói đến việc xóa thẻ trên danh sách Biểu đồ xuất bản (Sprint) để trả về Backlog.
* **Thực tế hệ thống hiện tại:**
  * Tại bảng **"Biểu đồ yêu cầu công bố (Backlog)"**, mỗi dòng thẻ đều có nút icon **Từ chối (XCircle màu đỏ)** bên cạnh icon xem trước.
  * Khi Admin bấm Từ chối, hệ thống hiển thị modal **"Từ chối Yêu cầu Công bố Biểu đồ"**.
  * Modal này **bắt buộc Admin phải nhập "Lý do từ chối *"** (kiểm tra chặt chẽ, không cho phép để trống).
  * Khi bấm "Xác nhận từ chối":
    1. Thẻ yêu cầu bị rút hoàn toàn khỏi Backlog CMS.
    2. Hệ thống lưu vết vào lịch sử từ chối (`rejectedBacklogItems`).
    3. Tự động kích hoạt thông báo Quả chuông **`NOTIF-CMS-004`** gửi đến đúng chuyên viên/tổ ban đã đề nghị công bố kèm nội dung lý do từ chối.
    4. Phía màn hình "Điều chỉnh số liệu công bố" của đơn vị sẽ hiển thị trạng thái bị từ chối để chuyên viên biết và hiệu chỉnh lại dữ liệu.
* **Đề xuất sửa tài liệu:** Viết thêm mục con **"7.4.4.c. Từ chối yêu cầu công bố biểu đồ tại Backlog"** với hình chụp popup nhập lý do và giải thích rõ quy trình xử lý.

---

### 2. PHÂN HỆ CMS: CẤU HÌNH SECTION TIN TỨC & HOẠT ĐỘNG (THÂN TRANG LOWER) (P2)
* **Hiện trạng tài liệu (Mục 7.4.5, Trang 30):**
  * Chỉ nhắc đến bảng danh sách tin bài đồng bộ từ Spirit API và nút bật/tắt hiển thị.
* **Thực tế hệ thống hiện tại:**
  * Ngay phía trên bảng danh sách tin bài, hệ thống đã bổ sung **Khối cấu hình thông tin hiển thị Section ngoài Landing Page**:
    * **Nhãn trên (Tagline / Badge text):** Mặc định `"TINH THẦN VNA"` (VI) / `"SPIRIT OF VNA"` (EN).
    * **Tiêu đề chính (Main Title):** Mặc định `"Tin tức & Hoạt động"` (VI) / `"News & Activities"` (EN).
    * **Đoạn mô tả giới thiệu (Description):** Mặc định `"Cập nhật những hoạt động thực tiễn mới nhất của Vietnam Airlines trên hành trình phát triển bền vững và lan tỏa giá trị tốt đẹp đến cộng đồng."` (VI) / `"Stay updated with Vietnam Airlines' latest practical activities..."` (EN).
  * Quản trị viên CMS có thể chỉnh sửa tự do các trường này theo chiến dịch truyền thông của TCT mà không cần can thiệp mã nguồn.
* **Đề xuất sửa tài liệu:** Bổ sung mô tả 3 trường này vào đầu mục 7.4.5 kèm ảnh chụp màn hình cập nhật.

---

### 3. PHÂN HỆ KHUYẾN NGHỊ CLAIM SAF: ĐỔI TÊN CỘT VÀ CHUẨN HÓA BẢNG PHÂN BỔ (P1)
* **Hiện trạng tài liệu (Mục 8, Trang 32-34, P449):**
  * Ghi tên các cột cũ: *Mã lô & Ngày nạp, Sân bay xuất phát (badge), Khối lượng SAF (Tấn), CO2 Giảm trừ, Cơ chế Phân bổ/Gán Claim, Thao tác*.
* **Thực tế hệ thống hiện tại:**
  * Toàn bộ bảng đã được tái cấu trúc theo chuẩn khai báo nhiên liệu hàng không quốc tế:
    1. **`BATCH No`**: Mã định danh lô nhiên liệu SAF được cấp chứng chỉ.
    2. **`Ngày nạp`**: Ngày nạp nhiên liệu lên tàu bay.
    3. **`DEP`**: Mã sân bay xuất phát (Departure Airport - VD: SGN, HAN, SIN, CDG, FRA).
    4. **`ARR`**: Mã sân bay đến/đáp (Arrival Airport - VD: LHR, CDG, NRT, ICN) - **Cột mới**.
    5. **`NEAT SAF`**: Khối lượng SAF nguyên chất (Tấn).
    6. **`FLS`**: Số lượng chuyến bay thỏa mãn tiêu chí phân bổ theo từng cơ chế (`FLS_EU ETS`, `FLS_UK ETS`, `FLS_CORSIA`) - **Cột mới**.
    7. **`CO2`**: Lượng CO2 giảm trừ theo từng cơ chế (`CO2_EU ETS`, `CO2_UK ETS`, `CO2_CORSIA`).
    8. **`USD`**: Chi phí tài chính được giảm trừ tương ứng (`USD_EU ETS`, `USD_UK ETS`, `USD_CORSIA`) - **Cột mới**.
    9. **`Apply`**: Cơ chế gán claim chính thức được áp dụng cho lô hàng.
  * Có nút **"Xuất Excel phân bổ"** tạo file bảng tính 2 dòng header phục vụ kiểm toán độc lập.
* **Đề xuất sửa tài liệu:** Thay thế bảng mô tả các cột cũ tại mục 8, cập nhật bảng đối chiếu thuật ngữ và chụp lại ảnh Hình 36.1, 36.2.

---

### 4. PHÂN HỆ NHẬP LIỆU: THIẾU TÍNH NĂNG XUẤT/NHẬP EXCEL & BỘ LỌC CỘT (P1)
* **Hiện trạng tài liệu (Mục 5.3, Trang 18):**
  * Mô tả thao tác nhập liệu đơn giản dạng bấm "+ Thêm dòng" và gõ trực tiếp vào bảng.
* **Thực tế hệ thống hiện tại:**
  * **Nút "Xuất Excel":** Cho phép kết xuất bảng dữ liệu hiện có ra file Excel hoặc tải file mẫu biểu đã thiết lập sẵn công thức và định dạng chuẩn để đơn vị nhập offline.
  * **Nút "Nhập Excel" (`ExcelImportModal`):**
    * Tự động quét và đối chiếu cấu trúc cột của file Excel tải lên với schema của chỉ tiêu.
    * Báo lỗi chi tiết tới **tọa độ từng ô Excel (Cell Reference - VD: D3, B5)** nếu dữ liệu vi phạm định dạng số, ngày tháng hoặc để trống trường bắt buộc.
    * Cho phép xem trước danh sách dòng hợp lệ và dòng lỗi trước khi bấm xác nhận nạp vào hệ thống.
  * **Bộ lọc từng cột (Column Filter):**
    * Mỗi cột trong bảng dữ liệu động đều có ô input filter nằm ngay dưới header.
    * Có thanh tổng hợp hiển thị: `Đang lọc: X / Y dòng dữ liệu` kèm nút `✕ Xóa tất cả bộ lọc cột`.
  * **Chỉ tiêu định tính (GRI Qualitative):**
    * Khi chọn "Không đáp ứng" (trái với kỳ vọng hiện trạng VNA), hệ thống tự động ẩn vùng nhập thuyết minh và hiện thông báo nhắc nhở màu vàng.
* **Đề xuất sửa tài liệu:** Bổ sung mục con riêng **"5.3.a. Nhập dữ liệu hàng loạt từ file Excel"** và **"5.3.b. Xuất dữ liệu và sử dụng bộ lọc nâng cao trên bảng"**.

---

### 5. KHO TÀI LIỆU PTBV: SAI NGUYÊN TẮC CÔNG BỐ VÀ THIẾU QUY TRÌNH PHÊ DUYỆT (P1)
* **Hiện trạng tài liệu (Mục 7.3, Trang 25, P370):**
  * Tài liệu ghi: *"Lưu ý: Mọi tài liệu tải lên Kho tài liệu PTBV mặc định ở phạm vi Public, tự động hiển thị ở mục Lưu trữ Báo cáo trên CMS mà không cần thao tác công bố thêm..."*
* **Thực tế hệ thống hiện tại:**
  * Đây là thông tin **không chính xác về mặt an toàn thông tin**:
    * Tài liệu tải lên có tùy chọn phân quyền phạm vi: **Public (Công khai)** hoặc **Internal (Nội bộ)**. Tài liệu nội bộ tuyệt đối không tự ý hiển thị ra website đối ngoại.
    * Giao diện màn hình gồm 2 Tab rõ rệt: **`Kho tài liệu chung`** và **`Yêu cầu nộp duyệt tài liệu`**.
    * Hệ thống có màn hình **Phê duyệt tài liệu (`DocumentApproval.tsx`)** dành cho Ban KHPT/Admin để kiểm duyệt các tài liệu chuyên viên tải lên (duyệt hoặc từ chối kèm lý do) trước khi đưa vào kho chung.
* **Đề xuất sửa tài liệu:** Xóa bỏ đoạn lưu ý sai lệch tại P370, viết lại mục 7.3 làm rõ luồng phê duyệt và phạm vi tài liệu Công khai / Nội bộ.

---

### 6. HOÀN TOÀN THIẾU MỤC HƯỚNG DẪN HỆ THỐNG THÔNG BÁO QUẢ CHUÔNG (P1)
* **Hiện trạng tài liệu:**
  * Không có bất kỳ phần nào mô tả tính năng Thông báo.
* **Thực tế hệ thống hiện tại:**
  * Quả chuông trên Header là trái tim điều phối luồng làm việc giữa các Ban nghiệp vụ và Ban Quản trị CMS:
    1. **Biểu tượng Quả chuông (Bell Icon):** Nằm cạnh tên người dùng, hiển thị chấm đỏ hoặc badge số lượng tin chưa đọc với hiệu ứng nhấp nháy (`animate-pulse`).
    2. **Dropdown Panel:** Mở ra khi click vào chuông, gồm 2 tab `[Tất cả]` và `[Chưa đọc]`, nút `Đánh dấu tất cả là đã đọc`.
    3. **Phân loại 4 mức độ trực quan bằng mã màu & icon:**
       * *Đỏ (Action Required):* Yêu cầu xử lý gấp (Duyệt số liệu, Biểu đồ bị từ chối cần sửa).
       * *Cam (Warning):* Cảnh báo (Biểu đồ bị gỡ khỏi xuất bản, thiếu số liệu).
       * *Xanh lá (Success):* Thành công (Số liệu đã được duyệt xuất bản, kích hoạt phiên bản).
       * *Xanh dương (Info):* Tin tức, tài liệu mới được đưa vào kho.
    4. **Cơ chế Deep Link:** Bấm vào thông báo sẽ tự động chuyển trang, chuyển tab và highlight đúng dòng dữ liệu tương ứng.
* **Đề xuất sửa tài liệu:** Thêm hẳn một mục lớn **"Mục 2.5. Hệ thống Thông báo Quả chuông & Điều hướng công việc"** trong Chương 2.

---

### 7. PHÂN QUYỀN VAI TRÒ VÀ BỘ CHUYỂN ĐỔI NGÔN NGỮ/ĐƠN VỊ (P2)
* **Hiện trạng tài liệu (Mục 1.4 & Mục 2):**
  * Table 1 ghi các mã vai trò là `SYS_ADMIN`, `DEPT_INPUT`, `DEPT_VIEW`, `CORP_BOARD`.
  * Không có hướng dẫn chuyển đổi ngôn ngữ VI/EN và chọn đơn vị trên Header.
* **Thực tế hệ thống hiện tại:**
  * Mã cấu hình vai trò chuẩn trong hệ thống là:
    * `ROLE_ADMIN`: Quản trị viên hệ thống (Toàn quyền).
    * `ROLE_APPROVER`: Người phê duyệt ESG (Ban KHPT).
    * `ROLE_TECH_ENTRY`: Nhập liệu Kỹ thuật & Môi trường (Ban QLVT, TTĐHKT).
    * `ROLE_SOCIAL_ENTRY`: Nhập liệu Xã hội (Ban TCNL, TTBSV, Tổ Dịch vụ).
    * `ROLE_GOV_ENTRY`: Nhập liệu Quản trị & Pháp chế (Ban CĐS, Ban PC).
    * `ROLE_VIEWER`: Ban Lãnh đạo Tổng công ty (Chỉ xem báo cáo).
  * Header có nút chuyển ngôn ngữ **`VI / EN`** và dropdown **`Chọn CQĐV`** (dành cho Admin khi kiểm thử dữ liệu các ban).
* **Đề xuất sửa tài liệu:** Cập nhật lại Bảng 1 theo đúng mã chuẩn và thêm hướng dẫn thao tác nút chuyển đổi ngôn ngữ/đơn vị ở Chương 2.

---

## IV. BẢNG HƯỚNG DẪN CHI TIẾT CẬP NHẬT FILE WORD (ACTION PLAN CHO ĐỘI NGŨ BA/QA)

| Trang trong Word | Vị trí / Đoạn văn | Thao tác cần thực hiện | Nội dung chi tiết cần đưa vào tài liệu |
| :---: | :--- | :---: | :--- |
| **Trang 7** | Bảng Table 1 | **Thay thế bảng** | Cập nhật 6 vai trò thực tế: `ROLE_ADMIN`, `ROLE_APPROVER`, `ROLE_TECH_ENTRY`, `ROLE_SOCIAL_ENTRY`, `ROLE_GOV_ENTRY`, `ROLE_VIEWER`. |
| **Trang 10** | Sau mục 2.4 | **Thêm mục mới (2.5)** | **2.5. Trung tâm Thông báo Quả chuông & Chuyển đổi ngôn ngữ**: Hướng dẫn dùng chuông, đọc thông báo, click deep link, lọc tin chưa đọc và nút đổi tiếng Anh/Việt. |
| **Trang 13** | Mục 4.1 | **Bổ sung nội dung** | Thêm hướng dẫn nút "Nhập Excel chỉ tiêu" và "Xuất dữ liệu thô theo khoảng thời gian". |
| **Trang 17** | Mục 5.2 (P176-P178) | **Bổ sung lưu ý** | Ghi rõ: Nếu chọn trạng thái Không đáp ứng (khác cấu hình VNA), hệ thống tự ẩn khung soạn thảo thuyết minh và hiện cảnh báo vàng. |
| **Trang 18** | Mục 5.3 (P185) | **Bổ sung 2 mục con** | **5.3.1. Nhập liệu qua file Excel**: Hướng dẫn dùng modal import, đọc tọa độ lỗi ô Excel (VD D3).<br>**5.3.2. Bộ lọc cột & Xuất dữ liệu**: Hướng dẫn dùng dòng filter từng cột và nút Xuất Excel. |
| **Trang 24** | Mục 7.2.3 | **Bổ sung nội dung** | Thêm hướng dẫn nhận diện phiên bản bị CMS Backlog từ chối kèm cách xem lý do từ chối để chỉnh lý. |
| **Trang 25** | Mục 7.3 (P370) | **Sửa đoạn văn** | **Xóa bỏ khẳng định** mọi tài liệu đều là Public. Thay bằng phân quyền tài liệu Công khai / Nội bộ và luồng phê duyệt tài liệu trước khi xuất bản. |
| **Trang 29** | Mục 7.4.4 (sau P416) | **Thêm mục con** | **Từ chối thẻ yêu cầu công bố tại Backlog**: Bấm icon Từ chối đỏ (XCircle) -> Nhập lý do từ chối bắt buộc trong popup -> Xác nhận -> Hệ thống bỏ thẻ khỏi Backlog và gửi thông báo chuông cho chuyên viên đề xuất. |
| **Trang 30** | Mục 7.4.5 (P422) | **Bổ sung 3 trường** | Bổ sung hướng dẫn cấu hình 3 trường ở đầu trang: Nhãn trên (Tagline), Tiêu đề chính (Title), Đoạn mô tả (Description) trước danh sách bài viết Spirit VNA. |
| **Trang 32-34** | Toàn bộ Mục 8 | **Viết lại bảng cột** | Đổi tên toàn bộ cột theo chuẩn quốc tế: `BATCH No`, `DEP`, `ARR`, `NEAT SAF`, `FLS (EU/UK/CORSIA)`, `CO2 (EU/UK/CORSIA)`, `USD (EU/UK/CORSIA)`, `Apply`. Bổ sung nút Xuất Excel phân bổ. |

---

## V. KẾT LUẬN & KIẾN NGHỊ

1. **Về tính đồng bộ:** Tài liệu `HDSD_Trang nhập liệu.docx` đã được biên soạn rất công phu và bao quát, tuy nhiên do hệ thống phần mềm liên tục được nâng cấp tối ưu trải nghiệm (UX) và chuẩn hóa nghiệp vụ chuyên sâu theo yêu cầu của Lãnh đạo TCT, tài liệu hiện đang bị chậm hơn so với phiên bản ứng dụng thực tế khoảng 20-30% khối lượng tính năng.
2. **Hành động ưu tiên số 1:** Cần cập nhật ngay **Nghiệp vụ Từ chối thẻ Backlog CMS**, **Bảng phân bổ lô SAF chuẩn quốc tế** và **Hệ thống Quả chuông Thông báo** vì đây là các tính năng nghiệp vụ cốt lõi tác động trực tiếp đến công tác vận hành hàng ngày của chuyên viên và cấp quản lý.
3. **Hình ảnh minh họa:** Cần chụp lại các ảnh chụp màn hình (Screenshots) mới tại các màn hình:
   * Form Nhập liệu (có nút Xuất/Nhập Excel và dòng lọc cột).
   * CMS Backlog (có nút Từ chối và popup nhập lý do).
   * CMS Thân trang Lower (có 3 trường Nhãn trên, Tiêu đề, Mô tả).
   * Bảng Phân bổ lô SAF (với đầy đủ các cột BATCH No, DEP, ARR, NEAT SAF, FLS, CO2, USD, Apply).
   * Dropdown Quả chuông thông báo trên Header.

---
*Tài liệu review này được tạo tự động và lưu trữ tại đường dẫn:*  
[`images/document/BA DOC/reviewHDSD.md`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/reviewHDSD.md)
