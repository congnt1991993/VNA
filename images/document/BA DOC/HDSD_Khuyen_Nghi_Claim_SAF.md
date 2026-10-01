# TÀI LIỆU HƯỚNG DẪN VẬN HÀNH MÔ PHỎNG KỊCH BẢN (SCENARIO SIMULATION)
## PHÂN BỔ VÀ KHUYẾN NGHỊ CLAIM NHIÊN LIỆU HÀNG KHÔNG BỀN VỮNG (SAF)
### HỆ THỐNG QUẢN TRỊ BÁO CÁO PHÁT TRIỂN BỀN VỮNG (ESG) — VIETNAM AIRLINES

> **Mã tài liệu:** `VNA-ESG-HDVH-SIM-SAF`  
> **Phiên bản:** `3.1 (Chuẩn hóa ngôn ngữ Hướng dẫn vận hành Mô phỏng kịch bản - Scenario Simulation)`  
> **Ngày ban hành:** `01/10/2026`  
> **Đơn vị chủ trì:** Ban Kế hoạch Phát triển & Ban Quản lý Vật tư  
> **Phạm vi áp dụng:** Toàn bộ các Tổ ban & Đơn vị trực thuộc Vietnam Airlines  
> **Tệp Word (.docx) chuẩn:** [`HDSD_Khuyen_Nghi_Claim_SAF.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx)  
> **Template văn bản dùng chung:** [`Template_HDSD_VNA.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/Template_HDSD_VNA.docx)  

---

## MỤC LỤC

1. [GIỚI THIỆU CHỨC NĂNG MÔ PHỎNG KỊCH BẢN (SCENARIO SIMULATION) CLAIM SAF](#1-giới-thiệu-chức-năng-mô-phỏng-kịch-bản-scenario-simulation-claim-saf)
   * 1.1. [Bối cảnh & Mục tiêu vận hành mô phỏng kịch bản](#11-bối-cảnh--mục-tiêu-vận-hành-mô-phỏng-kịch-bản)
   * 1.2. [Đối tượng tham gia vận hành & Phân quyền kịch bản](#12-đối-tượng-tham-gia-vận-hành--phân-quyền-kịch-bản)
   * 1.3. [Bảng giải thích thuật ngữ chuyên môn mô phỏng (Glossary)](#13-bảng-giải-thích-thuật-ngữ-chuyên-môn-mô-phỏng-simulation-glossary)
2. [QUY TRÌNH 4 BƯỚC VẬN HÀNH MÔ PHỎNG KỊCH BẢN (SCENARIO SIMULATION WORKFLOW)](#2-quy-trình-4-bước-vận-hành-mô-phỏng-kịch-bản-scenario-simulation-workflow)
3. [HƯỚNG DẪN THAO TÁC CHI TIẾT VẬN HÀNH MÔ PHỎNG TRÊN GIAO DIỆN](#3-hướng-dẫn-thao-tác-chi-tiết-vận-hành-mô-phỏng-trên-giao-diện)
   * 3.1. [Truy cập & Toàn cảnh không gian làm việc mô phỏng kịch bản (Hình 1)](#31-truy-cập--toàn-cảnh-không-gian-làm-việc-mô-phỏng-kịch-bản)
   * 3.2. [Thanh điều khiển kịch bản & Chọn năm mô phỏng (Hình 2)](#32-thanh-điều-khiển-kịch-bản--chọn-năm-mô-phỏng)
   * 3.3. [Thiết lập biến số giả định Tín chỉ CO2 & Cơ chế thị trường (Hình 3)](#33-thiết-lập-biến-số-giả-định-tín-chỉ-co2--cơ-chế-thị-trường)
   * 3.4. [Vận hành ma trận Phân bổ Lô SAF trong Kịch bản (Hình 4, 5)](#34-vận-hành-ma-trận-phân-bổ-lô-saf-trong-kịch-bản-chuẩn-quốc-tế)
   * 3.5. [Xuất Báo cáo Excel kết quả mô phỏng kịch bản phân bổ](#35-xuất-báo-cáo-excel-kết-quả-mô-phỏng-kịch-bản-phân-bổ)
   * 3.6. [Đánh giá Chỉ số Đầu ra Tài chính & Bù trừ Phát thải của Kịch bản (Hình 6)](#36-đánh-giá-chỉ-số-đầu-ra-tài-chính--bù-trừ-phát-thải-của-kịch-bản-simulation-outcomes)
   * 3.7. [Bổ sung Giả định Lô SAF mới vào Kịch bản (+ Thêm lô SAF) (Hình 7)](#37-bổ-sung-giả-định-lô-saf-mới-vào-kịch-bản-thêm-lô-saf)
   * 3.8. [Quản lý Vòng đời Kịch bản & So sánh Đa Kịch bản (Hình 8, 9)](#38-quản-lý-vòng-đời-kịch-bản--so-sánh-đa-kịch-bản-scenario-lifecycle--comparison)
4. [CÁC QUY TẮC NGHIỆP VỤ & ĐIỀU KIỆN BIÊN KHI XÂY DỰNG KỊCH BẢN MÔ PHỎNG (BUSINESS RULES)](#4-các-quy-tắc-nghiệp-vụ--điều-kiện-biên-khi-xây-dựng-kịch-bản-mô-phỏng-business-rules)

---

## 1. GIỚI THIỆU CHỨC NĂNG MÔ PHỎNG KỊCH BẢN (SCENARIO SIMULATION) CLAIM SAF

### 1.1. Bối cảnh & Mục tiêu vận hành mô phỏng kịch bản
Trong chiến lược phát triển bền vững và lộ trình hướng tới Net Zero 2050 của Tổng công ty Hàng không Việt Nam (Vietnam Airlines), việc sử dụng Nhiên liệu hàng không bền vững (Sustainable Aviation Fuel - SAF) là giải pháp giảm phát thải trực tiếp quan trọng nhất nhưng cũng đòi hỏi chi phí đầu tư rất lớn do giá thành SAF hiện cao gấp 2 đến 3 lần nhiên liệu hóa thạch truyền thống (Jet A-1).

Đồng thời, khi thực hiện các đường bay quốc tế, Vietnam Airlines phải tuân thủ đồng thời nhiều cơ chế quản lý phát thải khắt khe với các quy chế bù trừ và đơn giá tín chỉ carbon phạt rất khác nhau:
* **Cơ chế EU ETS (Châu Âu):** Hệ thống giao dịch phát thải của Liên minh châu Âu, đi kèm quy định bắt buộc tỷ lệ pha trộn SAF (ReFuelEU Aviation) từ năm 2025 tại các sân bay thuộc khối EU (Paris CDG, Frankfurt FRA...) và cơ chế cấp hạn ngạch miễn trừ CO2 tương ứng.
* **Cơ chế UK ETS (Vương quốc Anh):** Hệ thống giao dịch phát thải độc lập của Vương quốc Anh, áp dụng cho các chuyến bay khởi hành từ các sân bay Anh (London Heathrow LHR...).
* **Cơ chế CORSIA (Quốc tế / ICAO):** Chương trình giảm trừ & bù đắp carbon đối với các chuyến bay quốc tế do Tổ chức Hàng không Dân dụng Quốc tế (ICAO) ban hành, áp dụng cho các chặng bay quốc tế giữa các quốc gia thành viên.

**Mục tiêu cốt lõi của công cụ Mô phỏng kịch bản (Scenario Simulation):** Hỗ trợ Vietnam Airlines vận hành giả lập các phương án phân bổ và gán Claim từng lô SAF vào các cơ chế tuân thủ (EU ETS, UK ETS hay CORSIA) trong điều kiện biến động giá thị trường. Công cụ giúp trả lời bài toán tối ưu hóa đa mục tiêu: *"Dưới các giả định thị trường khác nhau, kịch bản phân bổ nào sẽ giúp Vietnam Airlines tối đa hóa lượng CO2 được miễn trừ và tiết kiệm chi phí tài chính cao nhất cho Tổng công ty?"*

### 1.2. Đối tượng tham gia vận hành & Phân quyền kịch bản
* **Ban Kế hoạch Phát triển (Ban KHPT):** Chủ trì xây dựng các kịch bản mô phỏng, thiết lập biến số giả định thị trường (đơn giá tín chỉ, tỷ giá), vận hành điều chỉnh phân bổ lô SAF, so sánh và kiểm thử độ nhạy các kịch bản (Stress-test) và trình Lãnh đạo phê duyệt kịch bản tối ưu.
* **Ban Quản lý Vật tư (Ban QLVT):** Cung cấp dữ liệu nguồn các lô SAF thực tế đã mua và nạp (Mã lô BATCH No, ngày nạp, sân bay đi DEP, sân bay đến ARR, nhà cung cấp, chứng chỉ phát thải vòng đời LCA) hoặc nạp các lô SAF giả định phục vụ mô phỏng kế hoạch mua sắm.
* **Trung tâm Điều hành Khai thác (TTĐHKT):** Cung cấp số liệu khai thác chuyến bay thực tế (FLS), khối lượng nhiên liệu nạp theo từng chặng bay để đối chiếu và kiểm tra tính khả thi khai thác của kịch bản mô phỏng.
* **Ban Lãnh đạo Tổng công ty (BOD / Executive Board):** Xem xét các chỉ số phân tích đầu ra của kịch bản mô phỏng, so sánh các kịch bản đối trọng (Alternative vs Baseline) và phê duyệt kịch bản phân bổ chính thức.

### 1.3. Bảng giải thích thuật ngữ chuyên môn mô phỏng (Simulation Glossary)

| Thuật Ngữ | Tên Đầy Đủ / Tiếng Anh | Định Nghĩa & Ý Nghĩa Nghiệp Vụ Tại VNA |
| :--- | :--- | :--- |
| **Scenario Simulation** | Mô phỏng kịch bản | Quá trình thiết lập các biến số giả định và chạy thuật toán phân bổ để dự báo kết quả bù trừ CO2 và chi phí tuân thủ. |
| **Baseline Scenario** | Kịch bản cơ sở | Kịch bản mặc định hoặc kịch bản không nạp SAF dùng làm mốc đối chuẩn (Benchmark) để đánh giá hiệu quả tiết kiệm chi phí. |
| **Alternative Scenario** | Kịch bản thay thế | Kịch bản điều chỉnh các biến số phân bổ hoặc giá thị trường để tìm kiếm phương án tối ưu hơn so với cơ sở. |
| **SAF** | Sustainable Aviation Fuel | Nhiên liệu hàng không bền vững có nguồn gốc sinh học hoặc tái tạo. |
| **NEAT SAF** | Neat / Pure SAF (100%) | Khối lượng nhiên liệu SAF nguyên chất chưa pha trộn với Jet A-1 (đơn vị: Tấn). |
| **BATCH No** | Batch Number / PoS Code | Mã số định danh lô nhiên liệu do nhà cung cấp cấp theo Chứng chỉ bền vững. |
| **DEP / ARR** | Departure / Arrival Airport | Mã IATA sân bay xuất phát (DEP) và sân bay đến (ARR), quyết định điều kiện biên hợp lệ của cơ chế. |
| **FLS** | Flight Legs Count | Số lượng chuyến bay đủ điều kiện áp dụng bù trừ từ lô SAF tương ứng. |
| **EUA / UKA / CEU** | Emission Allowances / Units | Tín chỉ hạn ngạch phát thải thuộc EU ETS (EUA), UK ETS (UKA) và CORSIA (CEU). |
| **Claim SAF** | SAF Claiming Process | Hành động chính thức ghi nhận và khấu trừ lượng giảm phát thải từ lô SAF vào 1 cơ chế. |
| **Simulation Assumptions**| Giả định mô phỏng | Tập hợp các tham số đầu vào (đơn giá tín chỉ, tỷ giá, sản lượng SAF) được giả lập trước khi chạy tính toán. |
| **Sensitivity / Stress Test**| Kiểm thử độ nhạy kịch bản | Thử nghiệm kịch bản trong các điều kiện bất lợi (ví dụ giá tín chỉ carbon tăng 30-50%) để kiểm tra độ bền tài chính. |
| **Optimal Scenario** | Kịch bản tối ưu | Kịch bản phân bổ đạt mục tiêu kép: giảm thiểu tối đa phát thải CO2 và tối ưu hóa tổng chi phí tuân thủ toàn hãng. |

---

## 2. QUY TRÌNH 4 BƯỚC VẬN HÀNH MÔ PHỎNG KỊCH BẢN (SCENARIO SIMULATION WORKFLOW)

* **Bước 1: Thiết lập giả định tham số thị trường (Market Assumptions Setup):** Thiết lập các biến số đầu vào giả định về đơn giá tín chỉ carbon thị trường (EUA, UKA, CEU), tỷ giá quy đổi VND/USD, hạn ngạch miễn trừ và phát thải cơ sở của năm mô phỏng.
* **Bước 2: Nạp & Lọc dữ liệu nguồn Lô SAF vào kịch bản (Data Sourcing & Filtering):** Nạp danh mục các lô nhiên liệu SAF (thực tế hoặc giả định theo kế hoạch mua sắm) vào không gian mô phỏng, rà soát điều kiện biên về sân bay đi (DEP), sân bay đến (ARR), khối lượng NEAT SAF và các cơ chế đủ điều kiện claim.
* **Bước 3: Vận hành phân bổ & Gán cơ chế Claim trong kịch bản (Allocation Simulation & Claim Assignment):** Thao tác phân bổ và lựa chọn cơ chế gán Claim chính thức (Apply) cho từng lô SAF trên ma trận phân bổ; hệ thống tự động tái tính toán tức thời (real-time recalculation) theo nguyên tắc tối ưu hóa chi phí tuân thủ.
* **Bước 4: Đánh giá đầu ra mô phỏng, Lưu trữ & So sánh kịch bản (Simulation Evaluation, Save & Multi-scenario Comparison):** Theo dõi và đánh giá các chỉ số đầu ra của kịch bản mô phỏng (lượng CO2 offset, chi phí mua tín chỉ còn thiếu, tổng chi phí tuân thủ toàn hãng, mức tiết kiệm tài chính so với kịch bản cơ sở Baseline), lưu trữ kịch bản và mở bảng so sánh đối đầu đa kịch bản (Side-by-side comparison).

---

## 3. HƯỚNG DẪN THAO TÁC CHI TIẾT VẬN HÀNH MÔ PHỎNG TRÊN GIAO DIỆN

### 3.1. Truy cập & Toàn cảnh không gian làm việc mô phỏng kịch bản
Người dùng truy cập vào không gian mô phỏng kịch bản bằng cách chọn mục **`KHUYẾN NGHỊ CLAIM SAF`** trên menu điều hướng bên trái (hoặc đường dẫn `/netzero-simulation-v2`). Toàn bộ không gian làm việc (Scenario Simulation Workspace) được thiết kế theo luồng tương tác trực quan từ trên xuống dưới:

![Hình 1: Toàn cảnh không gian làm việc mô phỏng kịch bản Khuyến nghị Claim SAF trên hệ thống VNA Netzero](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_overview.png)
*Hình 1: Toàn cảnh không gian làm việc mô phỏng kịch bản Khuyến nghị Claim SAF trên hệ thống VNA Netzero*

Không gian làm việc bao gồm 3 phân khu chức năng mô phỏng liên kết chặt chẽ:
* **Tầng 1: Điều khiển & Quản trị kịch bản (Header Controls):** Thanh công cụ điều khiển kịch bản, chuyển đổi năm mô phỏng, thư viện kịch bản đã lưu và tính năng so sánh đa kịch bản.
* **Tầng 2: Thiết lập giả định & Ma trận phân bổ (Assumptions & Allocation Matrix):** Khối 3 thẻ thông số giả định thị trường và Ma trận phân bổ lô SAF với bảng dữ liệu chi tiết đa cơ chế.
* **Tầng 3: Đánh giá đầu ra & Hiệu quả kinh tế (Outcomes & Financial Impact):** Khối tổng hợp đầu ra mô phỏng (Simulation Outcomes) phân tích chi tiết lượng CO2 giảm trừ và hiệu quả tài chính so với kịch bản cơ sở.

---

### 3.2. Thanh điều khiển kịch bản & Chọn năm mô phỏng
Thanh điều khiển đầu trang cho phép chuyển đổi kỳ mô phỏng và truy cập nhanh các công cụ quản lý vòng đời kịch bản:

![Hình 2: Thanh điều khiển kịch bản - Chọn năm mô phỏng và các công cụ quản lý kịch bản](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_toolbar.png)
*Hình 2: Thanh điều khiển kịch bản - Chọn năm mô phỏng và các công cụ quản lý kịch bản*

* **Dropdown "Năm mô phỏng":** Chọn năm cần lập mô phỏng phân bổ (VD: `Năm 2026`, `Năm 2027`...). Khi thay đổi năm, hệ thống tự động tải bộ tham số thị trường và ma trận lô SAF tương ứng với kỳ mô phỏng đó.
* **Nút "Danh sách kịch bản (N)":** Mở thư viện lưu trữ các kịch bản mô phỏng. Người dùng có thể xem lại các kịch bản đã lưu trước đây, xem chi tiết tham số giả định hoặc nạp lại (Load) kịch bản lên không gian làm việc.
* **Nút "So sánh kịch bản":** Kích hoạt công cụ đối chiếu đa kịch bản mô phỏng cạnh nhau (Side-by-side Scenario Comparison) để đánh giá chênh lệch chi phí tài chính và lượng CO2 offset giữa các phương án.
* **Nút "Đồng bộ dữ liệu":** Lấy lại số liệu mặc định từ kho dữ liệu trung tâm nếu người dùng muốn hủy các thao tác thử nghiệm và reset kịch bản về trạng thái ban đầu.
* **Nút "Lưu kịch bản":** Ghi nhận trạng thái phân bổ và các tham số giả định hiện tại thành một kịch bản mô phỏng mới có định danh riêng để phục vụ lưu trữ hoặc báo cáo.

---

### 3.3. Thiết lập biến số giả định Tín chỉ CO2 & Cơ chế thị trường
Khu vực đầu màn hình gồm 3 thẻ thông số song song thể hiện 3 cơ chế thị trường quốc tế, cho phép người dùng thiết lập các biến số giả định đầu vào của kịch bản mô phỏng:

![Hình 3: Khối thiết lập các biến số giả định thị trường tín chỉ carbon (EU ETS, UK ETS, CORSIA)](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_market_params.png)
*Hình 3: Khối thiết lập các biến số giả định thị trường tín chỉ carbon (EU ETS, UK ETS, CORSIA)*

#### Thẻ 1: Cơ chế EU ETS (Châu Âu)
* **Đơn giá giả định EUA ($/tCO2):** Đơn giá hạn ngạch EUA giao dịch trên sàn Châu Âu (mặc định tham chiếu: `76.5 $ / EUA`). Người vận hành kịch bản có thể trực tiếp điều chỉnh tăng/giảm đơn giá này để kiểm thử độ nhạy kịch bản (Stress testing khi giá carbon biến động).
* **Tỷ giá quy đổi VND:** Tỷ giá chuyển đổi từ USD sang VND (mặc định: `25,450 VND/USD`). Hệ thống tự động tính giá quy đổi = `~1,946,925 VND/tCO2` phục vụ tính toán ngân sách nội tệ.
* **Tổng phát thải CO2 trong kỳ:** Tổng nghĩa vụ phát thải CO2 của các chuyến bay VNA thuộc phạm vi Châu Âu trong năm (mặc định: `28,500 tCO2`).
* **Hạn ngạch miễn trừ:** Số tấn CO2 được cơ quan quản lý EU cấp miễn phí theo quy chế ReFuelEU Aviation (mặc định: `5,200 tCO2`).
* **Chỉ số chốt chân thẻ:** Hiển thị phát thải thực tế sau khi trừ hạn ngạch miễn phí = `23,300 tCO2` (đây là ngưỡng phát thải tối đa cần bù đắp trong kịch bản).

#### Thẻ 2: Cơ chế UK ETS (Vương quốc Anh)
* **Đơn giá giả định UKA:** Đơn vị tín chỉ UKA (mặc định: `58.0 $ / UKA`, tỷ giá `25,450 VND/USD` -> Giá quy đổi `~1,476,100 VND`).
* **Chỉ số phát thải UK ETS:** Tổng phát thải năm: `9,200 tCO2`; Hạn ngạch miễn phí cấp theo quy chế Anh: `1,100 tCO2`; Phát thải sau miễn giảm cần xử lý trong kịch bản: `8,100 tCO2`.

#### Thẻ 3: Cơ chế CORSIA (Quốc tế / ICAO)
* **Đơn giá giả định CORSIA:** Đơn vị tín chỉ CEU (mặc định: `22.5 $ / CEU` -> Giá quy đổi `~572,625 VND`).
* **Các tham số giả định đặc thù:** Hiển thị badge 'CORSIA Rule' gồm: Tỷ lệ tăng trưởng ngành (`20.0%`), Tỷ trọng Sectoral (`100%`), Tỷ trọng Individual (`0%`), Baseline phát thải (`2.254.192 tCO2`).
* **Công thức tính toán CORSIA:** Hiển thị công thức tính trực quan ngay dưới kết quả:  
  `Phải bù trừ = (48.000 x 20%) x 100% = 9.600 tCO2`.

---

### 3.4. Vận hành ma trận Phân bổ Lô SAF trong Kịch bản (Chuẩn Quốc Tế)
Bảng **"PHÂN BỔ LÔ NHIÊN LIỆU SAF"** là trung tâm vận hành ma trận mô phỏng kịch bản, được xây dựng theo chuẩn khai báo hàng không quốc tế với cấu trúc tiêu đề 2 tầng:

![Hình 4: Ma trận Phân bổ Lô Nhiên liệu SAF theo chuẩn quốc tế phục vụ mô phỏng kịch bản](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_table.png)
*Hình 4: Ma trận Phân bổ Lô Nhiên liệu SAF theo chuẩn quốc tế phục vụ mô phỏng kịch bản (BATCH No, DEP, ARR, NEAT SAF, FLS, CO2, USD, Apply)*

| Tên Cột (Header) | Kiểu Dữ Liệu & Thao Tác | Ý Nghĩa Trong Vận Hành Mô Phỏng Kịch Bản |
| :--- | :--- | :--- |
| **BATCH No** | Văn bản (In đậm, link chi tiết) | Mã số định danh lô SAF (VD: `SAF-2026-EU-01`). Bấm vào để xem chứng chỉ và thông tin nhà cung cấp. |
| **Ngày nạp** | Ngày (`DD/MM/YYYY`) | Ngày tra nạp nhiên liệu SAF thực tế lên tàu bay. |
| **DEP** | Badge sân bay (3 ký tự IATA) | Sân bay xuất phát/khởi hành (VD: `CDG`, `FRA`, `LHR`, `SIN`, `HAN`). Quyết định điều kiện biên hợp lệ của cơ chế. |
| **ARR** | Badge sân bay (3 ký tự IATA) | Sân bay đến/đáp của chặng bay (VD: `HAN`, `SGN`, `CDG`). |
| **NEAT SAF** | Số thực (Tấn, cho phép sửa) | Khối lượng SAF nguyên chất trong lô. Người vận hành có thể điều chỉnh số tấn để giả lập các phương án nạp khác nhau. |
| **FLS** | Nhóm 3 cột: `FLS_EU`, `FLS_UK`, `FLS_CORSIA` | Số lượng chuyến bay được phân bổ và hưởng lợi ích giảm trừ tương ứng của từng cơ chế. |
| **CO2** | Nhóm 3 cột: `CO2_EU`, `CO2_UK`, `CO2_CORSIA` | Khối lượng CO2 giảm trừ (tCO2). Tính tự động = Khối lượng Neat SAF x Hệ số phát thải vòng đời LCA. |
| **USD** | Nhóm 3 cột: `USD_EU`, `USD_UK`, `USD_CORSIA` | Giá trị tài chính được giảm trừ ($). Tính tự động = Lượng CO2 giảm trừ x Đơn giá tín chỉ giả định của cơ chế đó. |
| **Apply** | Dropdown chọn cơ chế (`EU / UK / CORSIA`) | Cơ chế chính thức gán Claim cho lô SAF trong kịch bản. Chuyển đổi dropdown sẽ kích hoạt tính toán lại tức thời toàn bộ kịch bản. |
| **Thao tác** | Icon Thùng rác (Xóa) | Loại bỏ lô SAF khỏi ma trận kịch bản mô phỏng sau khi xác nhận. |

#### Bộ lọc thông minh phục vụ phân tích kịch bản theo phân khúc:
Hàng bộ lọc nằm ngay dưới tiêu đề cột cho phép người vận hành lọc dữ liệu đa chiều tức thì để kiểm tra các phân khúc phân bổ cụ thể trong kịch bản:

![Hình 5: Hàng bộ lọc đa chiều theo Mã lô, Sân bay xuất phát DEP và Sân bay đến ARR](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_table_filter.png)
*Hình 5: Hàng bộ lọc đa chiều theo Mã lô, Sân bay xuất phát DEP và Sân bay đến ARR*

1. **Tìm kiếm theo BATCH No:** Gõ từ khóa mã lô (VD `'EU-01'`) để lọc nhanh lô hàng cần kiểm tra giả định.
2. **Lọc theo Sân bay đi (DEP):** Lọc danh sách theo sân bay khởi hành CDG, FRA, LHR, SIN hoặc Tất cả để kiểm tra tuân thủ điều kiện biên theo từng thị trường.
3. **Lọc theo Sân bay đến (ARR):** Lọc danh sách theo sân bay hạ cánh HAN, SGN hoặc Tất cả để theo dõi các đường bay về Việt Nam.
4. **Lọc theo Cơ chế áp dụng (Apply):** Lọc theo cơ chế đang gán (Tất cả / EU ETS / UK ETS / CORSIA) để rà soát tổng khối lượng SAF đã phân bổ riêng cho từng cơ chế.

---

### 3.5. Xuất Báo cáo Excel kết quả mô phỏng kịch bản phân bổ
Hệ thống cung cấp nút bấm **`Xuất Excel`** tại góc trên bên phải của bảng để kết xuất kết quả chi tiết của kịch bản mô phỏng:
* **Định dạng file xuất:** File Excel (`.xlsx`) được xuất theo đúng mẫu biểu kiểm toán hàng không quốc tế, gồm 2 dòng header: Dòng 1 nhóm các chỉ số FLS, CO2, USD; Dòng 2 chi tiết từng cơ chế (`EU ETS`, `UK ETS`, `CORSIA`).
* **Tính đồng bộ dữ liệu kịch bản:** Tự động áp dụng bộ lọc hiện tại trên màn hình mô phỏng (ví dụ: nếu đang lọc các lô xuất phát từ CDG thì file Excel sẽ kết xuất đúng tập dữ liệu đã lọc).
* **Mục đích sử dụng:** Phục vụ công tác báo cáo phân tích kịch bản cho Ban Lãnh đạo, nộp hồ sơ kiểm toán độc lập và lưu trữ hồ sơ tuân thủ hàng năm.

---

### 3.6. Đánh giá Chỉ số Đầu ra Tài chính & Bù trừ Phát thải của Kịch bản (Simulation Outcomes)
Khu vực cuối trang tự động tổng hợp kết quả đầu ra của kịch bản mô phỏng hiện thời, chia làm 2 cột phân tích chuyên sâu:

![Hình 6: Khối Chỉ số Đầu ra Tài chính & Bù trừ Phát thải toàn hãng của kịch bản mô phỏng](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_financial_summary.png)
*Hình 6: Khối Chỉ số Đầu ra Tài chính & Bù trừ Phát thải toàn hãng của kịch bản mô phỏng (CO2 Offset & Chi phí tuân thủ)*

#### Cột trái: 1. Đầu ra CO2 Offset & Phân tích phát thải ròng của kịch bản
* **Tổng CO2 Giảm thiểu:** Tổng lượng phát thải CO2 thực tế đã được cắt giảm trong kịch bản nhờ phân bổ SAF (VD: `20.150 tCO2` = Tổng cột CO2 của các lô).
* **Cân bằng dòng phát thải kịch bản:** Bảng bóc tách cân bằng phát thải:  
  `Tổng phát thải thô toàn hãng (85.700 tCO2)` -> Trừ `Hạn ngạch miễn phí (-6.300 tCO2)` -> Trừ `CO2 giảm do nạp SAF (-20.150 tCO2)` -> `Phát thải ròng còn lại bắt buộc phải xử lý = 20.850 tCO2`.
* **Số tín chỉ CO2 phải mua bù đắp:** Chi tiết số lượng tín chỉ carbon bắt buộc Tổng công ty phải mua trên thị trường ứng với kịch bản này: Số EUA phải mua (EU ETS: `13.337` tín chỉ), Số UKA phải mua (UK ETS: `4.390` tín chỉ), Số CEU phải mua (CORSIA: `3.123` tín chỉ).

#### Cột phải: 2. Đầu ra Chi phí tuân thủ & Đánh giá hiệu quả kinh tế của kịch bản
* **Tổng chi phí tuân thủ kịch bản:** Tổng số tiền VNA dự kiến phải chi trả cho việc tuân thủ các cơ chế phát thải trong năm theo kịch bản này: `20,58M $` (triệu USD), tương đương `~523,7 tỷ đồng VND`.
* **Cấu phần chi phí mô phỏng:** Bóc tách 2 cấu phần chi phí:
  1. Chi phí mua nhiên liệu SAF (`19,23M $`).
  2. Chi phí mua tín chỉ carbon còn lại trên sàn (`1,35M $`).
* **Hiệu quả tiết kiệm tài chính (Cost Savings):** Hệ thống tự động so sánh Tổng chi phí của kịch bản hiện tại với **Kịch bản cơ sở (Baseline Scenario - trường hợp giả định không dùng SAF mà phải mua 100% tín chỉ phạt trên sàn)**. Giá trị tiết kiệm chi phí (Cost Savings) được định lượng trực quan, là cơ sở then chốt để Ban Lãnh đạo đánh giá tính khả thi và hiệu quả của kịch bản.

---

### 3.7. Bổ sung Giả định Lô SAF mới vào Kịch bản (`+ Thêm lô SAF`)
Khi cần đưa thêm một phương án giả định lô nhiên liệu SAF mới vào kịch bản mô phỏng (ví dụ: mô phỏng phương án mua thêm một lô hàng mới tại Châu Âu), người dùng bấm nút **`+ Thêm lô SAF`** để mở modal khai báo:

![Hình 7: Popup Thêm Giả định Lô Nhiên liệu SAF Mới vào Kịch bản Mô phỏng](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_new_batch.png)
*Hình 7: Popup Thêm Giả định Lô Nhiên liệu SAF Mới vào Kịch bản Mô phỏng*

* **Mã Lô (Chọn từ kho dữ liệu SAF):** Chọn mã lô từ danh mục kho nhiên liệu hoặc nhập mã lô giả định mới phục vụ thử nghiệm kịch bản.
* **Khối lượng SAF giả định (tấn):** Nhập khối lượng nhiên liệu SAF nguyên chất 100% dự kiến đưa vào kịch bản (đơn vị: Tấn).
* **Sân bay xuất phát & Sân bay đáp:** Chọn sân bay nạp nhiên liệu dự kiến (mã IATA, e.g. `CDG`, `FRA`, `SIN`) và sân bay hạ cánh của chuyến bay để xác định điều kiện cơ chế.
* **CO2 giảm trừ / tấn SAF:** Hệ số giảm phát thải do nhà cung cấp công bố trên chứng chỉ PoS hoặc hệ số giả định tiêu chuẩn (mặc định `2.60 - 2.65` tCO2 / tấn SAF).
* **Xác nhận đưa vào kịch bản:** Bấm **`Thêm vào ma trận`** để hệ thống tự động nạp lô mới vào ma trận kịch bản mô phỏng và tái tính toán toàn bộ chỉ số tài chính và phát thải.

---

### 3.8. Quản lý Vòng đời Kịch bản & So sánh Đa Kịch bản (Scenario Lifecycle & Comparison)
Hệ thống hỗ trợ quản lý toàn diện vòng đời các kịch bản mô phỏng, cho phép lưu trữ, gọi lại và so sánh đối chiếu đa kịch bản để phục vụ công tác lập kế hoạch ngân sách và đàm phán hợp đồng nhiên liệu:

#### Quản lý danh sách các kịch bản mô phỏng đã lưu:
Bấm nút **`Danh sách kịch bản (N)`** tại thanh điều khiển đầu trang để mở thư viện các kịch bản:

![Hình 8: Popup Quản lý Danh sách Kịch bản Mô phỏng SAF đã lưu trong hệ thống](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_list.png)
*Hình 8: Popup Quản lý Danh sách Kịch bản Mô phỏng SAF đã lưu trong hệ thống*

* **Thông tin kịch bản mô phỏng:** Hiển thị tên kịch bản, thời gian lưu, tổng khối lượng SAF phân bổ, lượng CO2 giảm trừ và chi phí bù đắp tương ứng của từng kịch bản.
* **Nạp kịch bản (Load Scenario):** Bấm **`Mở chỉnh sửa`** để nạp toàn bộ cấu hình và ma trận của kịch bản đã lưu lên không gian làm việc chính.
* **Xóa kịch bản:** Bấm icon **Thùng rác** để xóa bỏ các kịch bản thử nghiệm cũ không còn giá trị tham chiếu.

#### So sánh đối đầu đa kịch bản mô phỏng (Side-by-side Scenario Comparison):
Bấm nút **`So sánh kịch bản`** để kích hoạt bảng đối chiếu đa chiều giữa các kịch bản đang lưu trữ:

![Hình 9: Bảng so sánh đối chiếu đa chiều giữa các Kịch bản Mô phỏng Phân bổ SAF](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/saf_modal_compare.png)
*Hình 9: Bảng so sánh đối chiếu đa chiều giữa các Kịch bản Mô phỏng Phân bổ SAF (Scenario Comparison Matrix)*

* **Cấu trúc ma trận so sánh:** So sánh song song 3 hoặc 4 kịch bản cạnh nhau: *Phương án Hiện tại (Current)* vs *Kịch bản Cơ sở (Baseline)* vs *Kịch bản Giá Carbon Cao (Stress test +30%)* vs *Kịch bản Tự nguyện (Voluntary SAF)*.
* **Tiêu chí tài chính so sánh:** Đánh giá tổng chi phí tuân thủ toàn diện, chi phí mua tín chỉ carbon còn lại, chi phí mua SAF, số tiền tiết kiệm so với kịch bản không nạp SAF và mức chênh lệch tài chính giữa các phương án.
* **Tiêu chí phân bổ SAF:** Đánh giá tổng sản lượng SAF phân bổ (Tấn), tỷ lệ phân bổ chi tiết cho từng cơ chế EU ETS, UK ETS và CORSIA giữa các kịch bản.

---

## 4. CÁC QUY TẮC NGHIỆP VỤ & ĐIỀU KIỆN BIÊN KHI XÂY DỰNG KỊCH BẢN MÔ PHỎNG (BUSINESS RULES)

> [!WARNING]
> **Quy tắc bất biến chống trùng lặp (BR-SAF-01 - No Double-Counting Rule):**  
> Trong mọi kịch bản mô phỏng, mỗi tấn nhiên liệu SAF hoặc mỗi chuyến bay chỉ được phép gán Claim cho **DUY NHẤT một cơ chế tuân thủ** (EU ETS, UK ETS hoặc CORSIA). Thuật toán mô phỏng bắt buộc khóa không cho phép 1 lô SAF được tính đồng thời cho cả EU ETS và CORSIA, nhằm đảm bảo kịch bản mô phỏng phản ánh đúng quy định pháp lý quốc tế về chống gian lận chứng chỉ xanh.

> [!NOTE]
> **Quy tắc điều kiện biên sân bay xuất phát (BR-SAF-02 - DEP Origin Boundary Condition):**  
> Một lô nhiên liệu SAF chỉ được mô phỏng hưởng ưu đãi miễn trừ ReFuelEU/EU ETS nếu đáp ứng điều kiện biên: sân bay tra nạp khởi hành (DEP) phải thuộc lãnh thổ Liên minh Châu Âu (như CDG, FRA). Nếu chuyến bay khởi hành từ Việt Nam (HAN, SGN) đi Châu Âu thì không đủ điều kiện đưa vào kịch bản EU ETS mà chỉ được tính cho cơ chế CORSIA.

> [!TIP]
> **Chiến lược tối ưu hóa thuật toán kịch bản (BR-SAF-03 - Economic Optimization Strategy):**  
> Khi vận hành xây dựng kịch bản tối ưu chi phí, do đơn giá tín chỉ phạt EU ETS (~76.5 $/tCO2) cao hơn nhiều so với UK ETS (~58.0 $) và CORSIA (~22.5 $), nguyên tắc điều hành luôn **ưu tiên dồn tối đa các lô SAF đủ điều kiện vào cơ chế EU ETS** cho đến khi bù đắp hết nghĩa vụ phát thải Châu Âu, lượng dư thừa tiếp tục chuyển sang UK ETS và cuối cùng mới phân bổ cho CORSIA.

---
*Tài liệu này được tạo và lưu trữ tại đường dẫn:*  
* Microsoft Word: [`images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.docx)  
* Markdown: [`images/document/BA DOC/HDSD_Khuyen_Nghi_Claim_SAF.md`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/HDSD_Khuyen_Nghi_Claim_SAF.md)  
* Thư mục hình ảnh: [`images/document/BA DOC/images/`](file:///Users/congnguyen/Library/CloudStorage/OneDrive-Personal/Documents/Synodus/GOV/01.VNA/VNA/images/document/BA%20DOC/images/)
