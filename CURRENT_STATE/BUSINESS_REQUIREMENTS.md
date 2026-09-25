# ĐẶC TẢ NGHIỆP VỤ TOÀN HỆ THỐNG (BUSINESS DOMAIN & REQUIREMENTS)
## HỆ THỐNG QUẢN LÝ DỮ LIỆU & BÁO CÁO ESG - VIETNAM AIRLINES

---

## 1. BỐI CẢNH NGÀNH HÀNG KHÔNG & PHÁT TRIỂN BỀN VỮNG

Ngành hàng không dân dụng toàn cầu đóng góp khoảng 2-2.5% tổng lượng phát thải khí nhà kính toàn cầu từ hoạt động của con người. Để đạt được mục tiêu trung hòa carbon vào năm 2050 (Net Zero 2050) do Tổ chức Hàng không Dân dụng Quốc tế (ICAO) và Hiệp hội Vận tải Hàng không Quốc tế (IATA) cam kết, Vietnam Airlines phải tuân thủ nghiêm ngặt hàng loạt khung pháp lý và cơ chế giảm phát thải mang tính bắt buộc:

1. **ICAO CORSIA (Carbon Offsetting and Reduction Scheme for International Aviation)**:
   - Cơ chế bù trừ và giảm thiểu carbon cho các chuyến bay quốc tế giữa các quốc gia tham gia.
   - Bắt buộc các hãng hàng không phải đo đạc, báo cáo và thẩm tra (MRV) phát thải hàng năm.
   - Bắt buộc bù trừ lượng phát thải vượt quá mức cơ sở (Baseline) thông qua việc nạp nhiên liệu bay bền vững (SAF) hoặc mua tín chỉ carbon đủ điều kiện (CORSIA Eligible Emissions Units).

2. **EU ETS (Hệ thống giao dịch phát thải Liên minh Châu Âu)**:
   - Áp dụng cho tất cả các chuyến bay nội khối EU và các chuyến bay khởi hành từ hoặc đến sân bay thuộc Khu vực Kinh tế Châu Âu (EEA).
   - Yêu cầu hãng hàng không phải nộp lại hạn ngạch phát thải (EUA) tương ứng với tổng lượng CO2 phát thải. Hạn ngạch miễn phí đang bị cắt giảm dần theo lộ trình và tiến tới bị bãi bỏ hoàn toàn vào năm 2026.

3. **UK ETS (Hệ thống giao dịch phát thải Vương quốc Anh)**:
   - Áp dụng độc lập sau Brexit cho các chuyến bay trong phạm vi Vương quốc Anh và các chuyến bay từ Anh đi các nước thuộc EEA. Tương tự như EU ETS, sử dụng hạn ngạch UKA.

4. **Sắc lệnh ReFuelEU Aviation (Liên minh Châu Âu)**:
   - Quy định bắt buộc các nhà cung cấp nhiên liệu tại các sân bay EU phải phối trộn tỷ lệ SAF tối thiểu tăng dần: 2% từ 2025, 6% từ 2030, 20% từ 2035 và lên tới 70% vào năm 2050.
   - Hãng hàng không phải có cơ chế ghi nhận, đối soát và "claim" (khấu trừ nghĩa vụ phát thải) chính xác số lượng SAF đã nạp để không bị xử phạt và tối ưu chi phí tuân thủ.

---

## 2. BỘ CHỈ TIÊU CHUẨN HÓA & TRÁCH NHIỆM 9 BAN/ĐƠN VỊ

Hệ thống quản lý từ điển hơn 100 chỉ tiêu ESG theo tiêu chuẩn Sáng kiến Báo cáo Toàn cầu (GRI Standards) và các chỉ tiêu ngành hàng không, được phân công trách nhiệm cho 9 Ban/Đơn vị nghiệp vụ:

### 2.1. Danh mục 9 Ban/Đơn vị & Chỉ tiêu Phụ trách
| STT | Ban / Đơn vị | Mã Đơn vị | Lĩnh vực Phụ trách | Danh sách Chỉ tiêu Tiêu biểu Phụ trách |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Tổ Khai thác (TTĐHKT)** | `DEPT-001` | Khai thác bay, tiêu hao nhiên liệu, phát thải trực tiếp | `GRI 302-1` (Năng lượng tiêu thụ - Jet A-1, SAF), `GRI 302-4` (Tiết kiệm năng lượng), `GRI 305-1` (Scope 1 CO2), `GRI 305-4` (Cường độ CO2/RTK), `GRI 305-5` (Giảm phát thải), `GRI 305-7` (NOx, SOx). |
| 2 | **Ban An toàn chất lượng (Ban ATCL)** | `DEPT-002` | An toàn bay, quản lý tiếng ồn, chứng chỉ chất lượng | `Airline E-1` (Sự cố MOR/1.000 chuyến bay, Tiếng ồn), `9` (Tai nạn mức A/10.000 chuyến bay), `GRI 403-2` (Đánh giá rủi ro an toàn). |
| 3 | **Tổ Kỹ thuật (Ban QLVT)** | `DEPT-003` | Quản lý vật tư, bảo dưỡng kỹ thuật, nạp nhiên liệu SAF | `4`, `5`, `13`, `SAF` (Chứng chỉ lô SAF, ReFuelEU, bảo dưỡng động cơ tối ưu tiêu hao). |
| 4 | **Trung tâm Bông Sen Vàng (TTBSV)** | `DEPT-004` | Khách hàng thân thiết, chương trình đổi dặm xanh | `Airline B-2` (Hội viên Active, tương tác khách hàng, quyên góp dặm trồng rừng). |
| 5 | **Ban Chuyển đổi số & CNTT** | `DEPT-005` | An toàn thông tin, bảo mật dữ liệu, số hóa quy trình | `GRI 418-1` (Vi phạm quyền riêng tư và sự cố mất dữ liệu khách hàng theo ISO 27001 & NĐ 13/2023/NĐ-CP). |
| 6 | **Tổ Dịch vụ (Ban DVHK)** | `DEPT-006` | Dịch vụ trên chuyến bay, suất ăn, nước, nhà cung cấp | `GRI 303-3` (Khai thác nước), `GRI 303-5` (Tiêu thụ nước), `Airline B-1` (Chỉ số hài lòng khách hàng NPS), `GRI 204-1` (Mua sắm địa phương), `GRI 406-1` (Không phân biệt đối xử), `GRI 416-1`, `GRI 416-2` (Sức khỏe & an toàn dịch vụ), `GRI 417-2` (Ghi nhãn dịch vụ). |
| 7 | **Ban Tổ chức Nhân lực (TCNL)** | `DEPT-007` | Nhân sự, tiền lương, đào tạo, tai nạn lao động | `GRI 2-7` (Cơ cấu lao động: phi công, tiếp viên, kỹ sư, mặt đất), `GRI 2-30` (Thỏa ước LĐTT), `GRI 201-3` (Phúc lợi hưu trí), `GRI 202-1`, `GRI 202-2` (Tỷ lệ lương tối thiểu), `GRI 401-1`, `GRI 401-2` (Tuyển dụng & nghỉ việc), `GRI 403-4`, `GRI 403-9` (Thương tật do tai nạn LĐ), `GRI 403-10` (Bệnh nghề nghiệp), `GRI 404-2`, `GRI 404-3` (Giờ đào tạo trung bình), `GRI 405-1` (Đa dạng giới & tuổi), `Airline D-1`, `Airline F-2`. |
| 8 | **Ban Kế hoạch Phát triển (KHPT)** | `DEPT-008` | Quản trị doanh nghiệp, phòng chống tham nhũng, KPI tổng thể | `GRI 2-9` đến `GRI 2-29` (Cơ cấu HĐQT, thẩm định ESG, kiêm nhiệm chéo, đạo đức kinh doanh), `GRI 3-3` (Chủ đề trọng yếu), `GRI 201-4` (Hỗ trợ tài chính từ chính phủ), `GRI 205-2`, `GRI 205-3` (Đào tạo phòng chống tham nhũng), `GRI 206-1` (Hành vi chống cạnh tranh), `GRI 415-1` (Đóng góp chính trị). |
| 9 | **Ban Truyền thông** | `DEPT-009` | Hoạt động xã hội, từ thiện, truyền thông thương hiệu xanh | `Airline F-1` (Giờ tình nguyện, quỹ đóng góp cộng đồng, dự án Vạn Dặm Nâng Bước), `GRI 417-3` (Vi phạm truyền thông tiếp thị). |

---

## 3. NGHIỆP VỤ PHÂN BỔ LÔ NHIÊN LIỆU SAF (SAF CLAIM RECOMMENDATIONS)

Đây là phân hệ nghiệp vụ cốt lõi và phức tạp nhất của hệ thống, giúp Ban Kỹ thuật và Ban Kế hoạch tối ưu hóa hàng triệu USD chi phí tuân thủ phát thải mỗi năm:

### 3.1. Dữ liệu Quản lý Lô SAF (SAF Batch Registry)
Mỗi lô nhiên liệu bay bền vững nạp cho tàu bay Vietnam Airlines tại các sân bay quốc tế (đặc biệt là sân bay Châu Âu như CDG, FRA, LHR) được cấp chứng chỉ bền vững (Proof of Sustainability - PoS) với các tham số:
- **Mã lô (Batch No)**, Nhà cung cấp (Supplier), Sân bay nạp (Origin), Sân bay đến (Destination).
- **Khối lượng nạp (Tonnes)**: Số tấn SAF nguyên chất (neat) hoặc hỗn hợp (blend).
- **Phát thải vòng đời LCA (Lifecycle Emission - $gCO_2eq/MJ$)**: Mức phát thải tính trên toàn bộ chu kỳ sản xuất và vận chuyển của loại nguyên liệu sinh học (dầu ăn qua sử dụng UCO, mỡ động vật...).
- **Tỷ lệ giảm phát thải cơ sở ($tCO_2$ giảm trừ / tấn SAF)**:
  - Giá trị cơ sở tính theo hệ số nhiên liệu hóa thạch truyền thống (Jet A-1: $89 gCO_2eq/MJ$).
  - Ví dụ: Lô SAF có phát thải LCA $19.8 gCO_2eq/MJ$ mang lại mức giảm trừ tương đương $3.15 tCO_2$ trên mỗi tấn SAF.

### 3.2. Quy tắc Tính toán Giảm trừ theo Từng Cơ chế
Do mỗi cơ chế quốc tế có phương pháp luận MRV (Đo đạc, Báo cáo, Thẩm tra) khác nhau, cùng một tấn SAF khi khai báo vào từng hệ thống sẽ được công nhận mức giảm trừ khác nhau:
- **EU ETS (ReFuelEU Aviation)**: Được công nhận nguyên vẹn theo hệ số kiểm toán Châu Âu:
  $$	ext{CO}_2 	ext{ Saved (EU)} = 	ext{Tonnes} 	imes 	ext{BaseRate}$$
- **UK ETS (Anh quốc)**: Áp dụng hệ số chuyển đổi UK MRV:
  $$	ext{CO}_2 	ext{ Saved (UK)} = 	ext{Tonnes} 	imes (	ext{BaseRate} 	imes 0.99)$$
- **CORSIA (ICAO Quốc tế)**: Áp dụng hệ số LCA ICAO CORSIA:
  $$	ext{CO}_2 	ext{ Saved (CORSIA)} = 	ext{Tonnes} 	imes (	ext{BaseRate} 	imes 0.97)$$

### 3.3. Bài toán Khuyến nghị & Tối ưu hóa Quyết định Phân bổ
Một lô SAF đủ điều kiện cho nhiều cơ chế (ví dụ chuyến bay từ London LHR về Hà Nội HAN vừa thuộc diện CORSIA, vừa đủ điều kiện UK ETS). Hệ thống giải bài toán tối ưu:
- **Giá trị hạn ngạch tiết kiệm được**:
  - Tiết kiệm EU ETS ($) = $	ext{CO}_2 	ext{ Saved} 	imes 	ext{Giá hạn ngạch EUA (USD/tCO}_2)$
  - Tiết kiệm UK ETS ($) = $	ext{CO}_2 	ext{ Saved} 	imes 	ext{Giá hạn ngạch UKA (USD/tCO}_2)$
  - Tiết kiệm CORSIA ($) = $	ext{CO}_2 	ext{ Saved} 	imes 	ext{Giá tín chỉ CORSIA (USD/tCO}_2)$
- **Mức độ ưu tiên**:
  - Thông thường giá hạn ngạch EU ETS / UK ETS dao động từ 65 - 90 USD/tCO2, cao hơn rất nhiều so với giá tín chỉ bù trừ CORSIA (chỉ từ 5 - 15 USD/tCO2).
  - Hệ thống tự động khuyến nghị ưu tiên phân bổ lô SAF cho **EU ETS và UK ETS trước** để thỏa mãn nghĩa vụ hạn ngạch bắt buộc có mức phạt vi phạm rất cao (100 EUR/tCO2 phạt của EU), sau đó lượng SAF còn lại mới phân bổ cho **CORSIA**.

---

## 4. NGHIỆP VỤ QUẢN LÝ MỤC TIÊU & ĐÁNH GIÁ KPI ESG

Hệ thống chuyển đổi các chỉ tiêu phát triển bền vững thành các chỉ tiêu kế hoạch hành động cụ thể cho từng Ban:

### 4.1. Cấu trúc Mục tiêu Kế hoạch (Plan vs Actual)
- Mỗi KPI được gán:
  - Chỉ tiêu kế hoạch năm (Annual Target).
  - Phân bổ kế hoạch 12 tháng (Monthly Targets) phản ánh tính thời vụ của ngành hàng không (mùa cao điểm hè tháng 6-8, Tết tháng 1-2).
  - Tỷ trọng đánh giá (Weight %).
  - Kết quả thực hiện thực tế (Actual) được tổng hợp từ dữ liệu nhập liệu hoặc hệ thống nguồn.

### 4.2. Chiều hướng Đánh giá (Direction: `asc` vs `desc`)
Đây là đặc thù sống còn của dữ liệu ESG:
- **Chiều thuận (`asc` - Càng lớn càng tốt)**:
  - Áp dụng cho: Doanh thu, Tỷ lệ nạp SAF, Tỷ lệ rác tái chế, Điểm hài lòng khách hàng (NPS), Số giờ đào tạo cán bộ, Tỷ lệ nữ lãnh đạo.
  - Công thức Đạt (Pass): $	ext{Thực hiện (Actual)} \ge 	ext{Kế hoạch (Plan)}$.
- **Chiều nghịch (`desc` - Càng nhỏ càng tốt)**:
  - Áp dụng cho: Tổng lượng phát thải CO2, Suất tiêu hao nhiên liệu/100 RTK, Tỷ lệ sự cố an toàn bay MOR, Tỷ lệ tai nạn lao động, Số vụ rò rỉ dữ liệu, Khiếu nại tiếng ồn.
  - Công thức Đạt (Pass): $	ext{Thực hiện (Actual)} \le 	ext{Kế hoạch (Plan)}$.

### 4.3. Nhật ký Kiểm toán Thay đổi Kế hoạch (KPI Audit Trail)
Để đảm bảo tính minh bạch theo chuẩn kiểm toán quốc tế, mọi thao tác tạo mới, sửa mục tiêu kế hoạch hoặc điều chỉnh tỷ trọng đều được hệ thống ghi vết tự động (`KPIAuditLogItem`):
- Định danh người sửa (Account ID & Tên).
- Đơn vị công tác, thời gian chính xác (Timestamp).
- Phạm vi thay đổi (Toàn năm hoặc theo tháng cụ thể).
- Chi tiết thay đổi: Giá trị cũ $	o$ Giá trị mới, lý do điều chỉnh kế hoạch.

---

## 5. NGHIỆP VỤ THU THẬP, PHÊ DUYỆT & CÔNG BỐ SỐ LIỆU

### 5.1. Quy trình Thu thập 3 Bước (Collection & Approval Workflow)
1. **Bước 1 - Khởi tạo & Nhập liệu**:
   - Chuyên viên đơn vị sử dụng `UnifiedDataEntryForm` để nhập số liệu kỳ báo cáo (tháng/quý/năm).
   - Hỗ trợ Import file Excel đối với các đơn vị có khối lượng dữ liệu lớn (Ban Kỹ thuật, TTĐHKT, Ban Nhân lực).
   - Hệ thống tự động kiểm tra định dạng và cảnh báo nếu số liệu thực tế lệch quá $\pm 20\%$ so với cùng kỳ hoặc kế hoạch.
2. **Bước 2 - Phê duyệt Cấp Đơn vị**:
   - Lãnh đạo Ban/Đơn vị (vai trò `ROLE_APPROVER`) rà soát số liệu kèm tài liệu minh chứng (bản scan phiếu kiểm định, biên bản nghiệm thu, hóa đơn nạp nhiên liệu).
   - Quyết định: Phê duyệt hoặc Trả về yêu cầu giải trình / chỉnh sửa.
3. **Bước 3 - Thẩm định & Khóa sổ Cấp Tổng công ty**:
   - Tổ công tác ESG (Ban KHPT) tổng hợp số liệu toàn TCT, đối soát với hệ thống ERP/SAP và khóa sổ số liệu chính thức.

### 5.2. Quản lý Phiên bản Số liệu Công bố (Disclosure Versioning)
Số liệu sau khi thu thập nội bộ không được công bố ngay ra công chúng mà phải trải qua quá trình soát xét:
- **Phiên bản v1.0 (Dữ liệu gốc hệ thống)**: Số liệu thô tổng hợp từ các Ban và tích hợp tự động.
- **Phiên bản v1.1 (Hiệu chỉnh nội bộ)**: Số liệu sau khi đã được Ban KHPT và Ban Lãnh đạo đối soát, hiệu chỉnh định mức tiêu hao hoặc phân bổ lại chi phí. Mọi ô số liệu bị ghi đè bắt buộc phải kèm **Lý do điều chỉnh (Override Reason)**.
- **Phiên bản v2.0 (Bản kiểm toán phê duyệt)**: Số liệu đã được các tổ chức độc lập (như KPMG, IATA ASRH, Cục Hàng không) thẩm tra và xác nhận, sẵn sàng xuất bản lên Báo cáo thường niên và Cổng thông tin đối ngoại.

### 5.3. Cổng Thông tin Đối ngoại & CMS ESG
- Hệ thống CMS cho phép Ban Truyền thông quản lý toàn bộ nội dung công bố:
  - Chọn phiên bản biểu đồ nào được hiển thị công khai trên từng trụ cột E-S-G.
  - Quản lý bài viết tin tức, thông cáo báo chí về phát triển bền vững (ví dụ: Chuyến bay nạp SAF đầu tiên của VNA, Dự án tái chế trang phục tiếp viên).
  - Cung cấp tính năng tải Báo cáo Thường niên PTBV định dạng PDF chất lượng cao cho các cổ đông và nhà đầu tư quốc tế.
