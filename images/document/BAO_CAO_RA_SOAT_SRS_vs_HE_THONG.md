# BÁO CÁO RÀ SOÁT SRS "KHU VỰC QUẢN TRỊ NỘI BỘ VNA NETZERO" SO VỚI HỆ THỐNG ĐANG CHẠY

Ngày: 19/10/2026 · Nguồn đối chiếu: mã nguồn dự án + giao diện thực tế trên localhost (đăng nhập giả lập, dữ liệu mẫu).

Tài liệu SRS đã cập nhật: `SRS_Trang_QuanTri_VNA_Netzero_v3.docx`. File này tổng hợp phát hiện của 8 nhóm rà soát để BA/DEV xử lý.


## G1 – Header, Đăng nhập, Tổng quan điều hành (3.x, 4.1–4.3, 5)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- Mục 4.1.2 SSO Microsoft: SRS cũ mô tả đăng nhập SSO, ô Email @vietnamairlines.com, Sign in/Next/Back; hệ thống thật không có nút/luồng này (code đã comment) => xóa mục 4.1.2 và cập nhật thuật ngữ SSO, mục 5.2 (Entra ID)
- Mục 4.1.1: SRS cũ ghi giới hạn độ dài 50, khóa tài khoản khi sai nhiều lần, hết phiên, link 'Quên mật khẩu?', nút Microsoft, báo lỗi sai thông tin; hệ thống thật không có maxLength, không kiểm tra mật khẩu (nhập gì cũng vào), không khóa, không hết phiên, chưa có Quên mật khẩu/Microsoft; 'Ghi nhớ đăng nhập' chỉ là checkbox không tác dụng
- Mục 3.5.2: SRS cũ ghi 2 nút VI/EN ở header; thực tế là hộp chọn ngôn ngữ mở bằng cách bấm vào khu vực thông tin người dùng, có alert của trình duyệt sau khi đổi, ngôn ngữ được lưu localStorage (không chỉ trong phiên)
- Mục 3.5.1: SRS cũ ghi thông báo có thời gian thực, giới hạn số sự kiện gần nhất, kết quả phê duyệt; thực tế 2 thông báo mẫu cố định, thời gian là văn bản tĩnh, chấm đỏ luôn hiện, không đọc/chưa đọc, đóng bằng cách bấm lại chuông (không phải bấm ra ngoài); một thông báo mẫu còn nhắc 'phê duyệt' (nội dung tĩnh)
- Mục 4.2: SRS cũ ghi có hộp thoại xác nhận và vô hiệu token; thực tế đăng xuất ngay, không modal, không có token; điều hướng về #/public
- Mục 4.3: SRS cũ ghi bộ lọc Năm/Quý/Tháng và CQĐV là Select của ứng dụng, 96/55 chỉ tiêu, Core KPI card, tuân thủ quốc tế CORSIA/EU/UK, Discrepancy badge, Xuất Excel/PDF, drill-down, phân quyền Public/Private, công thức Tiến độ = round(...,1) và 'Đạt >=100%'; thực tế: bộ lọc Năm/Quý/Tháng nằm trong iframe Metabase, không có bộ lọc CQĐV của ứng dụng, không có Discrepancy/Xuất Excel-PDF/Public-Private, 55 chỉ tiêu (E13,S21,G21), bảng KPI 10 dòng cố định năm 2026 với 10 cột kèm ô lọc từng cột, công thức Tiến độ làm tròn số nguyên, chiều giảm dùng (2xKH - TH)/KH, giới hạn 0-100, nhãn ĐẠT/CHƯA ĐẠT (không có 'Chưa đánh giá'), YoY theo KPI năm trước cùng CQĐV+mã chỉ tiêu
- Mục 4.3: SRS cũ ghi cột Tiến độ/Tỷ lệ hoàn thành (%), CQĐV, Kế hoạch năm, Thực hiện năm; thực tế cột là Mã chỉ tiêu, CQĐV phụ trách, Tên KPI, ĐVT, Kế hoạch, Thực hiện, Đánh giá, Cùng kỳ, Xem
- Mục 4.3 tab Quản trị: SRS cũ chưa nêu việc bảng KPI bị ẩn ở tab Quản trị (thực tế ẩn)
- Mục 5.2: Entra ID không dùng; Spirit VNA chỉ là nút giả lập (alert), Metabase là hệ thống ngoài thực sự được dùng
- Mục 3.3: thuật ngữ SSO ghi 'đăng nhập qua Microsoft' không đúng thực tế

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Bộ chọn 'Tài khoản mô phỏng' (9 tài khoản mẫu) ở header (đã thêm 3.5.3)
- Bộ chọn 'Tổ ban nghiệp vụ' (9 Tổ ban) ở header, ảnh hưởng màn Nhập liệu (đã thêm 3.5.4)
- Khu vực thông tin người dùng (tên, Tổ ban, nhãn VI/EN, avatar) (đã thêm 3.5.5)
- Thu gọn/mở rộng Sidebar, nút Mở menu trên màn hình hẹp, menu nhóm mở/đóng (đã thêm 3.5.6)
- Bảng KPI: sắp xếp 3 cột, lọc mã/CQĐV/tên KPI/đánh giá, 'Xóa lọc', nhãn ADJ khi có điều chỉnh số liệu công bố, cột Cùng kỳ (đã thêm vào 4.3.1)
- Màn hình chi tiết chỉ tiêu khi bấm dòng KPI (nhúng Metabase hoặc văn bản báo cáo), nút Export raw data, Xem chi tiết trên Metabase, Sao chép văn bản (đã thêm vào 4.3.1)
- Nút 'Metabase ↗' mở dashboard ở thẻ mới (đã thêm vào 4.3.1)

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Đăng nhập SSO Microsoft (4.1.2) và nút 'Đăng nhập với tài khoản Microsoft'
- Liên kết 'Quên mật khẩu?', khóa tài khoản, hết phiên, token phiên, hộp thoại xác nhận đăng xuất
- Bộ lọc CQĐV, Dashboard Tuân thủ Quốc tế (CORSIA/EU ETS/UK ETS), Dashboard So sánh Hợp nhất, Badge Cảnh báo sai lệch, Nút Xuất Excel/PDF trên Tổng quan điều hành (có thể nằm trong Metabase nhưng không có trong ứng dụng), drill-down từ biểu đồ, cờ Public/Private ở dashboard
- Cập nhật thời gian thực của thông báo, danh sách thông báo từ sự kiện thật

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- LỖI HIỆN HỮU: Bấm một dòng KPI có chỉ tiêu gắn liên kết Metabase (8/10 dòng) làm màn hình báo 'ReferenceError: Download is not defined' (thiếu import icon Download và state isExportRawDataModalOpen trong pages/ExecutiveDashboard.tsx), khiến ErrorBoundary hiện lỗi; SRS đã mô tả theo chức năng dự kiến (chi tiết chỉ tiêu + Export raw data). Cần dev sửa hoặc BA quyết định bỏ.
- Hệ thống chưa có xác thực thật (mọi thông tin đều vào được; truy cập thẳng URL #/dashboard không cần đăng nhập, ngay cả mở http://localhost:3000/ không hash cũng vào thẳng màn nội bộ). BA cần chốt: giữ mô tả 'giả lập' hay yêu cầu phát triển xác thực/SSO thật.
- Thông báo mẫu vẫn chứa câu 'Báo cáo ESG quý 1 đã được Trần Thị B phê duyệt' trong khi hệ thống đã chốt không có luồng phê duyệt: BA quyết định đổi nội dung mẫu; đồng thời nội dung SRS mô tả trung thực theo code (và nhắc tên người thật trong thông báo mẫu).
- Tên KPI 'Tai nạn mức A /10,000 chuyến bay' hiển thị sai thành '10,000 chuyến bay' ở bảng KPI do hàm tách tên song ngữ cắt theo dấu '/' (getLocalizedIndicatorName).
- Màu/mũi tên cột Cùng kỳ chỉ dựa trên dấu của tỷ lệ (>=0 xanh, <0 vàng cam), không dựa vào chiều tốt-xấu của chỉ tiêu (biến isBetter được tính nhưng không dùng) - ví dụ giảm phát thải hiển thị mũi tên xuống màu vàng dù là kết quả tốt.
- Chế độ 'Toàn màn hình' chỉ là lớp phủ trong khung ứng dụng (không dùng Fullscreen API của trình duyệt), Sidebar/Header vẫn hiển thị và nút 'Thu nhỏ' có thể nằm ngoài vùng nhìn thấy trên màn hình 1440px (cần xác nhận hành vi mong muốn).
- Bảng KPI hiển thị cố định năm 2026 (không có control đổi năm) và bộ lọc Năm/Quý/Tháng của Metabase không đồng bộ với bảng KPI; bộ lọc mặc định giữa các tab Metabase khác nhau (tab Môi trường mặc định Năm 2025). Cần BA xác nhận.
- Header: bộ chọn Tài khoản mô phỏng và Tổ ban nghiệp vụ là công cụ giả lập, chỉ hiển thị >=1280px; BA cần chốt có đưa vào SRS chính thức hay chỉ ghi chú.
- Số hiệu mục: SRS cũ có H2 '4.2 ĐĂNG XUẤT' và H3 '4.2 Đăng xuất...' (tương tự 4.3) trùng số; đề xuất đổi H3 thành 4.2.1 và 4.3.1 (các tham chiếu '4.3' trong mục 5 hiểu là phân hệ Tổng quan điều hành).
- Các số mục tham chiếu trong 5.1/5.2 (4.4, 4.5, 4.6.3, 4.7, 4.8.x) giữ theo SRS cũ, cần đối chiếu với đánh số mới của các nhóm khác.

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- Nút 'Đăng nhập với tài khoản Microsoft' (SSO) trên Login.tsx: đã bị comment trong mã, không hiển thị
- Liên kết 'Quên mật khẩu?' trên Login.tsx: đã bị comment, không hiển thị
- Nút 'Cổng đối ngoại' (Public Portal) ở footer Sidebar trong Layout.tsx: đã bị comment, không hiển thị (vào Cổng công khai chỉ bằng Đăng xuất hoặc URL #/public)
- Mục menu 'PHÊ DUYỆT SỐ LIỆU' (data-approval) và 'Mô phỏng Net Zero' (netzero-solution), 'Phân tích & Chiến lược' trong MENU_TRANSLATIONS/MENU_ITEMS: có khai báo nhưng không có menu hiển thị
- Các route chỉ vào được bằng URL, không có menu: dashboard-tech/-flight/-service/-gov (cùng render ExecutiveDashboard), pages/Dashboard.tsx (DashboardPage, route mặc định cho hash lạ), data-warehouse-raw, kpi-targets, countries, airports, aircrafts, fuels, suppliers, flights, carbon-credits, tech-ops, ops-flight, ops-atcl, ops-service, ops-ttbsv, ops-hr, ops-digital, ops-comm, ops-planning, netzero-simulation, netzero-solution, netzero-comparison, netzero-reports, esg-data-analysis, data-logs, kpi-performance, report-env/-soc/-gov, publishing, report-drafting, report-pending, report-approved, document-approval, formulas, sys-accounts, sys-forms, alerts-manage
- selectedYear trong ExecutiveDashboard.tsx không có control thay đổi: năm cố định 2026, ứng dụng không có bộ lọc Năm/Quý/Tháng riêng
- Chế độ xem trực tiếp 'view as role' (viewAsRoleId, setViewAsRoleId) có trong AccessContext nhưng không có control trên giao diện Header


## G2 – Quản lý chỉ tiêu (4.4)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- SRS cũ ghi 96 chỉ tiêu; hệ thống thật có 55 (E13, S21, G21), tất cả Hoạt động, 55/55 hình thức Số liệu, 0 dạng Văn bản; 9 Ban/Đơn vị: TCNL 16, KHPT 15, DVHK 8, Khai thác 6, ATCL 3, Kỹ thuật 3, Truyền thông 2, TT Bông Sen Vàng 1, Chuyển đổi số 1 (mục 4.4.1).
- SRS cũ ghi ô tìm kiếm 'Từ khóa' + 5 bộ lọc (Trụ cột, Chủ đề ASRH, Chương trình tuân thủ, Tổ ban, Trạng thái); thật là hàng lọc dưới tiêu đề cột: Lọc mã, Lọc tên, Trụ cột, Chủ đề, CQĐV, Trạng thái; KHÔNG có bộ lọc Chương trình tuân thủ, không có ô Từ khóa; có sắp xếp theo Mã/Tên; không phân trang.
- SRS cũ ghi nút 'Thêm chỉ tiêu'; thật là 'Thêm mới'. Có thêm nút 'Import Excel' mà SRS không có.
- SRS cũ ghi 'Xuất Excel' tải toàn bộ metadata ra .xlsx; thật chỉ hiện alert mô phỏng, không có file.
- SRS cũ ghi Xóa = chuyển 'Ngừng hoạt động', cấm xóa cứng; thật là xóa cứng bằng window.confirm, không kiểm tra dữ liệu phát sinh (đã test: số dòng giảm).
- SRS cũ ghi Thêm/Sửa là modal; thật là trang riêng (viewMode DETAIL) dùng chung form.
- SRS cũ ghi trùng mã bị chặn, bắt buộc/maxLength (50/255/100/1000/2000), Hình thức báo cáo radio, Tag multi-select, 'Topic ASRH' là Select; thật là các trường text không có maxLength, không validate khi lưu (đã test lưu form trống và mã trùng GRI 302-1 đều thành công), Chủ đề là text tự do, Hình thức báo cáo là Select, Tag là checkbox CORSIA/EU ETS/UK ETS (không có 'GRI Standards').
- SRS cũ ghi Mã chỉ tiêu readonly khi sửa; thật là sửa được (isEditable = true).
- SRS cũ ghi tự động gán quyền nhập liệu khi thêm, cảnh báo đổi ĐVT/tần suất ảnh hưởng YoY, ghi SysLogs/Audit Trail, nút 'Kiểm tra cú pháp công thức', kiểm tra tham chiếu vòng tròn, Formula textarea 1000 ký tự hỗ trợ SUM/AVG: tất cả KHÔNG có trong code.
- SRS cũ ghi trường 'Biểu mẫu (Template)'/'Đơn vị chủ trì & Phối hợp'/'ĐVT (Select)'; thật: 'Chọn biểu mẫu nhập liệu' (đa chọn từ danh sách biểu mẫu), 'CQĐV Phụ trách' (1 Select 8 giá trị), ĐVT text; tần suất 'Theo tháng/quý/năm'.
- Công thức tính: SRS cũ mô tả là nơi nhập công thức; thật có khối 'Công thức tính toán' + 'Lịch sử công thức' + hộp thoại 'Sửa công thức' chỉ cho sửa hệ số số học (trường dữ liệu khóa), có phiên bản/ngày hiệu lực/lý do - được giữ lại và mô tả đúng như code.

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Import Excel (modal, validate từng ô, ghi đè theo mã) - thêm mục 4.4.4.
- Trang Xem biểu đồ phân tích (3 chế độ: Metabase/văn bản/xu hướng), bảng Lịch sử nhập liệu, hộp thoại Export raw data - thêm mục 4.4.5.
- Sắp xếp theo Mã/Tên, nút 'Xóa lọc', trường Trạng thái chỉ tiêu, Link Báo cáo, Link Metabase, Mô tả, chọn biểu mẫu nhập liệu, bảng Lịch sử công thức tính toán, hộp thoại Sửa công thức (phiên bản, ngày hiệu lực) - đã thêm vào 4.4.1-4.4.3.

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Ô tìm kiếm 'Từ khóa', bộ lọc Chương trình tuân thủ; cột Hình thức báo cáo, Tag tuân thủ riêng trên bảng; ràng buộc xóa mềm; kiểm tra trùng mã; gán quyền tự động; cảnh báo YoY; SysLogs/Audit Trail; nút Kiểm tra cú pháp công thức; kiểm tra tham chiếu vòng tròn; mã chỉ tiêu bất biến; các độ dài tối đa trong SRS cũ.

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- LỖI HỆ THỐNG: bấm 'Xem chi tiết' trong bảng Lịch sử nhập liệu (4.4.5) gây màn hình lỗi 'ReferenceError: UnifiedDataEntryForm is not defined' (Indicators.tsx dùng UnifiedDataEntryForm và FORM_DEFINITIONS nhưng không import). Cần dev sửa hoặc BA quyết định bỏ nút khỏi SRS.
- Dữ liệu CQĐV của 34/55 chỉ tiêu (KHPT, DVHK, Khai thác, ATCL, TT BSV, Chuyển đổi số) không trùng với 8 lựa chọn của Select 'CQĐV Phụ trách' nên form sửa hiển thị 'Chọn...' và nếu Lưu có thể làm mất giá trị; mặc định thêm mới 'Ban Quản lý vật tư' cũng không có trong danh sách. BA cần chốt danh mục Ban/Đơn vị.
- Có 4 chỉ tiêu mã 'Chưa có mã' và mã GRI 406-1 trùng 2 dòng; 'Energy and Emission' và 'Energy and Emissions' là 2 chủ đề riêng; do hệ thống không chặn trùng mã. BA cần chốt có bổ sung kiểm tra trùng mã/bắt buộc/maxLength không.
- Hình thức báo cáo: toàn bộ 55 chỉ tiêu (kể cả 21 chỉ tiêu có văn bản báo cáo như GRI 2-9) đang là 'Số liệu'; chưa có chỉ tiêu 'Nội dung văn bản' nào trong dữ liệu.
- Xuất Excel danh sách chỉ tiêu chỉ là mô phỏng (alert); lịch sử nhập liệu, biểu đồ xu hướng, lịch sử công thức là dữ liệu giả lập.
- Không có phân quyền riêng cho Quản lý chỉ tiêu (mọi tài khoản mô phỏng đều thấy menu); thao tác Lưu công thức ghi người cập nhật cố định 'Nguyễn Minh Hải (Admin)'.
- Bảng 'Lịch sử công thức tính toán' không tự làm mới ngay sau 'Lưu công thức' (phải mở lại chỉ tiêu mới thấy dòng mới).

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- Route #/formulas (FormulasPage), #/sys-forms (SysFormsPage), #/alerts-manage (AlertsManagePage): chỉ có case trong App.tsx, không có mục menu Sidebar hay nút/liên kết nào dẫn tới (đã grep toàn bộ App.tsx, components, pages) - không đưa vào SRS.
- Biến tìm kiếm legacy searchText và bộ lọc selectedProgram (Chương trình tuân thủ) có trong code Indicators.tsx nhưng không có ô nhập/Select tương ứng trên giao diện.
- Prop departmentFilter của IndicatorsPage (lọc theo đơn vị) không được truyền từ App.tsx nên không dùng được.
- Khối modal 'Sửa hệ số công thức' thứ hai ở chế độ danh sách (kèm nút 'Thêm hệ số (* 1.0)' gọi handleAddMultiplier chưa định nghĩa) không thể mở được từ giao diện.
- Khối 'Điều kiện mô tả' (Có/Không) trong biểu mẫu chỉ tiêu dạng văn bản bị comment trong code, không hiển thị.
- Hằng MOCK_FORMULAS/formulaHistory là dữ liệu mô phỏng cố định theo mã chỉ tiêu (GRI 302-1, 305-1, 302-4...).


## G3 – Quản lý KPI (4.9)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- SRS cũ ghi nút "Chỉnh sửa kế hoạch", "Lưu thay đổi", "Hủy"; hệ thống thật là "Chỉnh sửa", "Lưu kế hoạch", "Hủy" (mục 4.9).
- SRS cũ ghi 3 "thẻ tóm tắt" (Clickable Badge); thật là 3 dòng chữ có chấm màu trên thanh phía trên bảng: "Tổng số KPI:", "Chưa có KPI:", "KPI chưa đạt:" (11 / 45 / 5 ở năm 2026, Tab Năm).
- SRS cũ ghi năm chọn 2026/2025/2024; thật có thêm Năm 2027.
- SRS cũ ghi Nhật ký ghi 3 loại (Cấu hình, Chỉnh sửa kế hoạch, Xóa) với đủ Mã chỉ tiêu, nội dung cũ/mới; thật chỉ "Lưu kế hoạch" (inline edit) mới ghi log, với mã chỉ tiêu cố định "ALL_MODIFIED" và mô tả chung, không có giá trị cũ/mới. Cấu hình và Xóa KPI KHÔNG ghi log.
- SRS cũ ghi Modal Audit Log có bộ lọc loại thao tác, cột Ban/Đơn vị, Loại thao tác; thật không có (đã comment); cột hiển thị: STT, Thời gian, Người thực hiện, Mã chỉ tiêu, Tên KPI, Mô tả thay đổi. Tiêu đề modal thật: "Lịch sử thay đổi & Thiết lập KPI (Audit Log)" (SRS cũ: "Nhật ký chỉnh sửa KPI (Audit Log)").
- SRS cũ ghi Tỷ lệ hoàn thành = round(x,1) và "-" khi chưa có kế hoạch/thực hiện; thật: tỷ lệ năm là giá trị lưu sẵn (không tính lại), tỷ lệ tháng làm tròn số nguyên và hiển thị "0%"; cột hiển thị là "ĐÁNH GIÁ" (nhãn + %), không có cột "Tỷ lệ hoàn thành" riêng; cột "CÙNG KỲ" chứ không phải "So sánh cùng kỳ".
- SRS cũ ghi YoY làm tròn 1 chữ số, mũi tên xanh/đỏ-xám; thật: xanh lá (≥0) / vàng cam (<0), "—" khi mẫu số = 0 hoặc thiếu dữ liệu.
- SRS cũ ghi Thực hiện "tự động tổng hợp từ dữ liệu nhập liệu hoặc nguồn tích hợp"; thật là dữ liệu mẫu lưu sẵn, không liên kết Nhập liệu.
- SRS cũ ghi Modal Cấu hình có nút "Xóa lọc cột" và cấu hình có hiệu lực khi bấm "Hoàn tất & Đóng"; thật: nút nhỏ "Xóa" ở cột STT, giá trị lưu ngay khi chọn, nút "Hoàn tất & Đóng" chỉ đóng modal. Nhãn chiều đánh giá thật: "Thực hiện ≥ Kế hoạch (Đạt khi tăng)" / "Thực hiện ≤ Kế hoạch (Đạt khi giảm)".
- SRS cũ ghi cột Chiều đánh giá (icon ≤/≥), ô Kế hoạch từng tháng ở màn chính, cột Thao tác; thật: không có cột Chiều đánh giá ở bảng chính (chỉ trong Modal Cấu hình); Tab Tháng mở rộng 12 dòng tháng theo KPI tần suất Tháng.
- SRS cũ ghi xóa KPI "ghi log loại XÓA"; thật không ghi log, là xóa cứng sau hộp thoại confirm của trình duyệt.
- SRS cũ ghi phân quyền không rõ; thật: nhập kế hoạch/xóa chỉ cho Tổ ban của người dùng (trừ Quản trị viên).

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Tab Tháng với dòng KPI mở rộng/thu gọn 12 tháng, kế hoạch tháng sửa trực tiếp (đã thêm vào mục 4.9).
- Sắp xếp theo cột Mã chỉ tiêu / Tổ ban / Tên KPI, bộ lọc Đánh giá "Chưa thiết lập", dòng chỉ tiêu "Chưa lập" và việc tạo KPI mới bằng cách nhập kế hoạch vào dòng này (đã thêm).
- Phân quyền chỉnh sửa theo Tổ ban; popup từ 3 thẻ tóm tắt (đã thêm).
- Dữ liệu Tab: số liệu tóm tắt tính theo tab đang xem (Tab Tháng: 3 / 3 / 0).

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Ghi log cho thao tác Cấu hình và Xóa KPI; nội dung cũ/mới trong log; bộ lọc loại thao tác trong Audit Log; nút "Thêm KPI"; trọng số; công thức tính tự động Thực hiện từ Nhập liệu; tên nút "Chỉnh sửa kế hoạch"/"Lưu thay đổi" (đã bỏ/sửa).

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- Đồng bộ nhật ký: ngoài ra tài liệu định dạng Format_Mo_Ta_Thay_Doi_Lich_Su_KPI.xlsx mô tả 12 mẫu mô tả thay đổi (CREATE/CONFIG/UPDATE_PLAN với giá trị cũ->mới) nhưng mã hiện chỉ sinh mẫu #6 và #12 ("Lưu thay đổi kế hoạch trực tiếp trên bảng tại Tab Năm/Tháng (Năm <năm>)"); các mẫu còn lại chỉ có trong dữ liệu mẫu. BA cần quyết định giữ hiện trạng hay yêu cầu bổ sung ghi log cho Cấu hình/Xóa/giá trị cũ-mới.
- Khóa lưu nhật ký thật là localStorage `vna_esg_kpi_audit_logs` (không phải `vna_kpi_audit_logs`); KPI: `vna_esg_kpis`; cấu hình: `vna_esg_kpi_configs`; Tổ ban: `vna_esg_departments`. Toàn bộ chỉ lưu trên trình duyệt, không có backend.
- Tỷ lệ/nhãn Đạt-Chưa đạt của KPI năm là giá trị gán sẵn trong dữ liệu mẫu, không tính lại khi sửa kế hoạch; KPI tạo mới từ dòng "Chưa lập" có Thực hiện "--" nhưng nhãn hiển thị "ĐẠT" 0% (isPass mặc định true). Cần BA quyết định công thức tự tính chuẩn (≥: Thực hiện/Kế hoạch; ≤: Kế hoạch/Thực hiện) cho cả tab Năm.
- Dữ liệu mẫu có KPI tần suất "Quý" (4 bản ghi năm 2026: GRI 302-1 "Kỳ 1", chỉ tiêu 5, GRI 418-1, GRI 303-3) nhưng giao diện cấu hình chỉ có Năm/Tháng; KPI Quý chỉ hiện ở Tab Năm.
- Chỉ tiêu mã "9" hiển thị tên "10,000 chuyến bay" và mã "13" hiển thị tên "13" do dữ liệu tên chỉ tiêu bị tách theo dấu "/" - lỗi dữ liệu mẫu cần BA kiểm tra.
- Dòng Tab Tháng nếu Thực hiện tháng = 0 và chiều ≤ thì mã tính ra "Infinity%" (không xử lý mẫu số 0); công thức tháng làm tròn số nguyên khác công thức SRS cũ (1 chữ số thập phân).
- Modal Cấu hình: Select Chiều đánh giá của dòng chưa lập KPI luôn hiển thị "≥" dù cấu hình đã lưu là ≤ (mã đọc từ KPI, không đọc từ bảng cấu hình) - cần BA xác nhận hành vi mong muốn.
- Chiều đánh giá/Tần suất cấu hình theo mã chỉ tiêu (áp dụng chung mọi Tổ ban); chưa có trọng số và chưa giao KPI theo từng đơn vị trực thuộc.
- Hộp thoại xác nhận xóa là confirm() của trình duyệt nên không chụp được ảnh trong tài liệu.

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- pages/KPIManage.tsx: Modal "Thiết lập KPI năm <năm>" / "Cập nhật KPI" (form Chỉ tiêu, Mã KPI, Tên, ĐVT, Kế hoạch, Thực hiện, Tần suất, Chiều đánh giá, Từ ngày/Đến ngày, nút Lưu/Hủy) và hàm handleAddNewForDept/handleEdit/handleSave - không có nút nào gọi, không truy cập được từ giao diện; ngoài ra danh mục gợi ý KPI_MAPPINGS (mã KPI-SAF-01...), cờ historyModalTarget và state thanh tìm kiếm/lọc ngày/collapsedDepts không còn dùng.
- Bộ lọc loại thao tác (CONFIG / CREATE / UPDATE_PLAN / DELETE) và cột "Hành động" trong Modal Audit Log bị comment trong mã, không hiển thị.
- components/OpsKPIConfig.tsx, data/kpiFormConfig.ts, components/NetzeroGRI_KPI_Rules.json: không được trang Quản lý KPI sử dụng (kpiFormConfig dùng cho biểu mẫu nhập liệu; OpsKPIConfig chỉ bọc trang Quản lý chỉ tiêu).
- Trường weight (trọng số) trong kiểu KPIItem: khai báo nhưng không dùng/không hiển thị.
- Route kpi-targets và kpi-performance (KPIPage mode targets/performance) trong App.tsx: không có menu/nút dẫn tới, không thuộc Quản lý KPI.


## G4 – Nhập liệu (4.5)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- 4.5.1: SRS cũ mô tả Stat Cards tiến độ, bộ lọc Năm báo cáo/Tần suất kỳ, Bảng Danh sách Kỳ báo cáo (Hạn nộp, Tỷ lệ hoàn thành, Đang mở/Đã khóa/Quá hạn), Progress bar, nút "Vào nhập liệu" - hệ thống thật không có; màn hình thật là danh sách thẻ chỉ tiêu + ô tìm kiếm + lọc Trụ cột + nút "Chi tiết". Cũng không có cơ chế khóa kỳ / mở lại có phê duyệt của Quản trị viên TCT.
- 4.5.2: SRS cũ mô tả Breadcrumb, tab lọc E-S-G, bảng chỉ tiêu với Giá trị kỳ trước/kỳ này, Tệp minh chứng, Trạng thái (Chưa nhập/Đã nộp/Cần chỉnh sửa), nút "Nhập số liệu", "Tải biểu mẫu Excel", "Import Excel" - thật là form riêng cho một chỉ tiêu với nút Xuất Excel, Nhập Excel, Chỉnh sửa, Hủy, Lưu; không có bảng nhiều chỉ tiêu/trạng thái. Không có nút "Tạo kỳ báo cáo mới".
- 4.5.2: Bắt buộc đính kèm minh chứng cho chỉ tiêu trọng yếu (Scope 1, Jet A-1, giờ đào tạo, tai nạn lao động) - không có trong hệ thống (data/kpiFormConfig.ts có trường file nhưng không được dùng).
- 4.5.3: SRS cũ có Breadcrumb, Header Card metadata (ĐVT, tần suất, nguồn tích hợp, hạn nộp), nút Thêm dòng/Xóa dòng/Xem trước dữ liệu Raw/Lưu nháp/Xác nhận & Commit dữ liệu, bắt buộc Preview, validate đa tầng khi lưu, Audit Log 4 thông tin - thật chỉ có bảng sửa ô, ô lọc cột, Chỉnh sửa/Hủy/Lưu; Lưu chỉ hiển thị thông báo và không kiểm tra hợp lệ.
- 4.5.3: Câu "12 nguồn dữ liệu tác nghiệp (TMS, FOC, OCC, ERP, Lotusmiles...)" không có trên màn hình Nhập liệu; đã bỏ.
- 4.5.4: SRS cũ ghi Dropzone kéo-thả, giới hạn 20MB, thanh tiến độ, bảng xem trước đối soát huy hiệu xanh/đỏ, nút "Xác nhận Import", tùy chọn Bổ sung/Ghi đè - thật chỉ có nút chọn tệp (.xlsx, .xls, .csv, không giới hạn dung lượng), không có bảng xem trước/tiến độ, danh sách lỗi theo ô, luôn thay thế toàn bộ dòng, không có tùy chọn Bổ sung, không ghi Audit Log. Kiểm tra miền "tỷ lệ % 0-100" và định dạng DD/MM/YYYY bắt buộc không có (ngày chấp nhận YYYY-MM-DD hoặc DD/MM/YYYY).
- Vai trò/quyền: quyền chi tiết theo biểu mẫu (nhập kỳ hiện tại, sửa dữ liệu cũ, Import Excel...) chỉ được cấu hình mà không áp vào màn Nhập liệu; danh sách chỉ tiêu theo Tổ ban chọn ở thanh tiêu đề (kể cả Quản trị viên) chứ không theo vai trò.

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Form định tính GRI 2 (Đáp ứng/Không đáp ứng, nội dung thuyết minh VI/EN, yêu cầu GRI/ASRH) - thêm mục 4.5.5.
- Bảng Lịch sử thay đổi + cửa sổ Xem bản dữ liệu cũ - thêm mục 4.5.6.
- Bộ lọc cột (Lọc...) trong bảng nhập liệu; sheet con của GRI 302-1 và GRI 204-1; ô tự tính (jeta1) - đã bổ sung vào 4.5.3.
- Bộ chọn "Tổ ban nghiệp vụ" / "Tài khoản mô phỏng" ở thanh tiêu đề quyết định tập chỉ tiêu - đã bổ sung vào 4.5.1.

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Bảng kỳ báo cáo, hạn nộp, trạng thái khóa/quá hạn, tỷ lệ hoàn thành, bộ lọc năm/tần suất (4.5.1).
- Trạng thái Chưa nhập/Đã nộp/Cần chỉnh sửa, cột giá trị kỳ trước/kỳ này, tệp minh chứng (4.5.2).
- Thêm/Xóa dòng, Xem trước Raw, Lưu nháp, Xác nhận & Commit, Audit Log chi tiết (4.5.3).
- Dropzone, giới hạn 20MB, bảng xem trước, chế độ Bổ sung/Ghi đè, Xác nhận Import (4.5.4).
- Cảnh báo lệch ±% và đối soát KPI trong form nhập liệu: không có (tab Kế hoạch bị ẩn).

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- Mock hiện tại: Lưu chỉ hiển thị thông báo và không lưu bền vững dữ liệu; Lịch sử thay đổi là dữ liệu mẫu cố định. BA cần quyết định ghi trong SRS là hành vi mô phỏng hay yêu cầu chức năng cần phát triển (lưu, ghi lịch sử thật, Audit Log).
- Giá trị 47400/44872 của GRI 302-1 dòng 1-2 bị gán cứng trong giao diện (khi import hoặc sửa tay vẫn hiển thị 47400/44872) - lỗi mô phỏng cần dev xác nhận.
- Kỳ báo cáo không có bộ chọn (mặc định Tháng 02/2026 hoặc Năm 2026): BA xác nhận có cần chọn kỳ tháng/quý/năm không.
- Quyền Nhập liệu theo vai trò (FormGrant) chưa áp dụng: BA xác nhận ai được nhập/sửa quá khứ/import/xuất.
- 4 chỉ tiêu mã "Chưa có mã" (Ban Kỹ thuật, ATCL) hiển thị ô định tính tự do thay vì bảng SAF/ETS đã có lược đồ (mã 4, 5, 13): cần BA/dev xác nhận.
- Chức năng "Xuất dữ liệu thô (RawDataExportModal)" không nằm trong Nhập liệu (thuộc Quản lý chỉ tiêu/Tổng quan): nhóm phụ trách các mục đó cần mô tả (modal: Từ thời gian*, Đến thời gian* mặc định 01/01/2025 - 31/05/2026, nút Hủy bỏ, Xuất dữ liệu Excel; lỗi: chưa chọn ngày, từ > đến).

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- components/DataEntryWorkspace.tsx: màn Nhập liệu cũ (chọn biểu mẫu theo Form, phân quyền FormGrant, kỳ báo cáo, nộp dữ liệu) không còn được import ở đâu; route data-entry dùng IndicatorDataEntryWorkspace.
- Route #/tech-ops, #/ops-flight, #/ops-atcl, #/ops-service, #/ops-ttbsv, #/ops-hr, #/ops-digital, #/ops-comm, #/ops-planning (trang nhập liệu theo từng Ban: pages/TechOps, OpsFlight, OpsATCL, OpsService, OpsTTBSV, OpsHR, OpsDigital, OpsComm, OpsPlanning): không có menu/nút dẫn tới.
- components/ManualDataEntry.tsx và data/kpiFormConfig.ts (cấu hình trường KPI, trường file minh chứng): không được trang nào sử dụng.
- Tab "Kế hoạch thực hiện" trong UnifiedDataEntryForm: bị ẩn cứng (showPlanTab = false); bộ lọc Tần suất trong IndicatorDataEntryWorkspace bị comment, không hiển thị.
- Các trường quyền FormGrant (enterCurrent, updateHistory, importExcel, submit, approve) cấu hình tại Vai trò & Phân quyền nhưng không chi phối biểu mẫu Nhập liệu hiện hành.
- IndicatorImportModal, IndicatorHistoryTable, RawDataExportModal/exportRawData.ts: không dùng trong màn Nhập liệu; IndicatorImportModal/IndicatorHistoryTable/RawDataExportModal thuộc trang Quản lý chỉ tiêu (pages/Indicators.tsx), RawDataExportModal còn dùng ở Tổng quan điều hành (ExecutiveDashboard, DashboardVNA) - đề nghị nhóm phụ trách các mục đó mô tả.


## G5 – Báo cáo thường niên, Kho tài liệu, Điều chỉnh số liệu công bố (4.6.1, 4.6.2, 4.6.4)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- 4.6.1.1: SRS cũ mô tả form tạo đợt có Năm (2026/2025/2024), Kỳ, Tiêu đề (max 255), Deadline 'ngày và giờ', Đơn vị nhận multi-select bắt buộc, Nội dung max 2000 và nút 'Tạo & Gửi yêu cầu đôn đốc'. Thực tế: nút 'Tạo Yêu cầu mới' mở modal; Năm là ô số; hạn nộp chỉ có ngày; đơn vị nhận là 8 checkbox không có tác dụng; nút 'Gửi Yêu cầu'; không có trường bắt buộc, maxLength, hay kiểm tra nào; không có email/thông báo chuông thật (chỉ toast).
- 4.6.1.1: SRS cũ ghi tự động gán nhãn 'Quá hạn' ở cấp đơn vị và gửi email/thông báo nhắc nhở; thực tế chỉ có nhãn 'QUÁ HẠN NỘP' ở cấp đợt, không gửi gì. Số đơn vị thực tế là 8 (không phải 12): Khối Kỹ thuật, Khối Khai thác, Khối Dịch vụ, Ban ATCL, Đoàn bay, Đoàn tiếp viên, Ban Nhân sự, Trung tâm BSV.
- 4.6.1.1: SRS cũ nêu Mã đợt ví dụ BC-2026-Q1; thực tế gợi ý REQ-<Năm>-<FY|Q1..Q4|HY|P1|P2>. Màn hình thực có bảng danh sách với sắp xếp theo 5 cột và 4 bộ lọc theo cột (không có ở SRS cũ).
- 4.6.1.2: SRS cũ mô tả 4 thẻ thống kê, cột Khối trực thuộc, Số chỉ tiêu giao/hoàn thành, Tỷ lệ %, nút 'Gửi đôn đốc nhắc nhở', 'Gửi đôn đốc toàn bộ', 'Xuất báo cáo tiến độ (Excel)', nhật ký đôn đốc, và 'Chỉ Quản trị viên TCT được đóng/khóa đợt'. Thực tế: không có các thẻ, cột, nút, nhật ký đó và không kiểm tra vai trò; chi tiết gồm thẻ Thông tin yêu cầu + bảng CQĐV/Trạng thái/Tài khoản/Thời gian/Tệp đính kèm (docx, pdf)/Thao tác với Upload, Tải xuống, Xóa tệp.
- 4.6.1.2: SRS cũ ghi trạng thái nộp 'Đúng hạn/Quá hạn'; thực tế chỉ 'Đã gửi (n tệp)' / 'Chưa gửi'. Đóng đợt thực tế bằng nút 'Kết thúc đợt & Upload Báo cáo cuối' > modal 'Kết thúc đợt & Xuất bản' > 'Xuất bản sang CMS'; khu upload trong modal chưa hoạt động và chưa ghi dữ liệu sang CMS.
- 4.6.2.1: SRS cũ mô tả cột Mã tài liệu, Tên tài liệu, Định dạng, Dung lượng, Phạm vi, Người đăng, Ngày đăng riêng biệt; bộ lọc Định dạng (PDF/Word/Excel/Hình ảnh); thao tác Xem/Sửa/Tải xuống/Xóa trên từng dòng; modal xem trước. Thực tế: cột Thông tin Tài liệu gộp tên-mã-dung lượng-biểu tượng loại; chỉ có lọc tên/mã và phạm vi; dòng chỉ có nút Tải xuống và mũi tên mở trang chi tiết; Sửa, Xóa, xem trước nằm ở trang chi tiết (toàn trang, không phải modal); xem trước chỉ là khung minh họa 'Trang 1 / 15'.
- 4.6.2.1/4.6.2.2: Mâu thuẫn phạm vi công bố: 4.6.2.1 cũ nói tài liệu 'Công bố' hiển thị ra Landing Page, còn 4.6.2.2 cũ nói 'không yêu cầu cấu hình phạm vi'. Thực tế: nhãn Public/Internal có trong dữ liệu và bộ lọc, nhưng form Thêm/Sửa không có control chọn; tài liệu mới luôn Internal; không có liên kết nào từ kho này ra website công khai (việc công bố đi qua CMS).
- 4.6.2.2: SRS cũ mô tả modal với vùng kéo-thả bắt buộc (PDF/DOCX/XLSX/PPTX, 50MB), Danh mục, Năm ban hành, Thẻ (Tags) và Mô tả max 500, chặn .exe/.bat/.sh, tự sinh hậu tố _v2/_v3. Thực tế: màn hình toàn trang chỉ có Mã tài liệu (tự sinh DOC-<năm>-<số ngẫu nhiên>), Tên, Mô tả; không có Danh mục/Năm/Tags; vùng upload chưa hoạt động; ghi chú 'Max 20MB' (không phải 50MB) và PDF, Excel, Word, Image; không kiểm tra định dạng/dung lượng; bản ghi mới luôn PDF 1.2 MB, Internal, v1.0, người đăng 'Admin'.
- 4.6.2.1 (quy tắc 3) cũ: 'mỗi lần chỉnh sửa tệp ghi nhận phiên bản mới v1.0, v1.1 cùng người cập nhật, ngày giờ'. Thực tế: màn hình Sửa có 2 thẻ tăng phiên bản (nhỏ +0.1 / chính thức +1.0), chỉ lưu số phiên bản hiện hành, không lưu người cập nhật, ngày giờ hay lịch sử; không thay được tệp gốc.
- 4.6.4: SRS cũ ghi các điều khiển 'Kỳ báo cáo' (năm/quý/tháng), 'Chọn biểu đồ' (Select/Tree thuộc 3 trụ cột), 'Lý do điều chỉnh & Thuyết minh' bắt buộc max 1000, nút 'Lưu phiên bản mới', 'Đề nghị công bố' (gửi Tổ Thư ký phê duyệt), 'Khôi phục dữ liệu gốc'. Thực tế: Năm báo cáo (2026/2025/2024) + danh sách chỉ tiêu 55 chỉ tiêu có lọc; kỳ theo tần suất chỉ tiêu; lý do KHÔNG bắt buộc, không maxLength, nhập theo từng kỳ; nút là 'Lưu'; không có 'Khôi phục dữ liệu gốc'.
- 4.6.4: SRS cũ mô tả luồng Nháp > Đã gửi đề nghị công bố > Công bố (Tổ Thư ký duyệt) và 'mã version tự sinh'. Thực tế: phiên bản chỉ có Active/Deactive; 'Đề nghị công bố' kích hoạt ngay (không duyệt) và tự chuyển các phiên bản khác của biểu đồ-năm sang Deactive; mã phiên bản do người dùng chọn Minor (vX.Y+1) / Major (v(X+1).0) dựa trên phiên bản đang xem. Nhãn Nháp/Đã gửi/Công bố thật sự là trạng thái cấp biểu đồ (theo phiên bản Active và việc gắn vào CMS).
- 4.6.4: SRS cũ ghi mọi thao tác tạo version, sửa, gửi đề nghị, gỡ công bố đều ghi Audit Log; thực tế chỉ thao tác Lưu phiên bản ghi lịch sử điều chỉnh và nhật ký hệ thống (mỗi kỳ có thay đổi); Đề nghị công bố/gỡ công bố không ghi nhật ký.
- 4.6.4: SRS cũ nhắc '12 nguồn hệ thống tác nghiệp' là dữ liệu gốc; thực tế số liệu gốc là giá trị mô phỏng sinh sẵn trong mã (không đọc từ nguồn tích hợp).
- Mục 4.6 (cha): SRS cũ ghi Sidebar > 'Báo cáo & Công bố'; nhãn nhóm menu thực tế hiển thị là 'QUẢN LÝ CÔNG BỐ' (id/mã là reporting, văn bản BÁO CÁO & CÔNG BỐ trong mã nhưng bản dịch VI hiển thị 'QUẢN LÝ CÔNG BỐ'). Đã dùng 'Quản lý công bố' theo ảnh chụp giao diện.

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- 4.6.1.1: bảng danh sách đợt có sắp xếp 5 cột, 4 bộ lọc theo cột, 'Xóa lọc', nhãn 'QUÁ HẠN NỘP' (đã thêm vào 4.6.1.1).
- 4.6.1.2: Upload/Thêm tệp .pdf/.docx cho từng đơn vị, Tải xuống, Xóa tệp, tiến độ tự tính lại (đã thêm).
- 4.6.2.3 Chi tiết và xem trước tài liệu; 4.6.2.4 Chỉnh sửa tài liệu với 2 mức tăng phiên bản (đã thêm với status=new).
- 4.6.4: danh sách chỉ tiêu có lọc trụ cột/định dạng/trạng thái, chế độ chỉ tiêu văn bản (Nội dung gốc / Nội dung điều chỉnh / Sao chép), Xem trước biểu đồ/ấn phẩm, Đề nghị gỡ công bố (đã thêm).
- 4.6.4: tác động qua lại với CMS: gỡ công bố sẽ gỡ biểu đồ khỏi detailReports của CMS; trạng thái 'Công bố' của biểu đồ phụ thuộc việc gắn vào CMS.

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- 4.6.1.1/4.6.1.2: chức năng gửi email nhắc nhở/đôn đốc, 'Gửi đôn đốc toàn bộ', nhật ký đôn đốc, xuất báo cáo tiến độ Excel, 4 thẻ thống kê, cột Khối trực thuộc/Số chỉ tiêu/Tỷ lệ %, cờ đỏ quá hạn theo từng đơn vị, hạn nộp có giờ, chọn đơn vị nhận có hiệu lực, hạn chế 'chỉ Quản trị viên TCT được khóa đợt' (đã bỏ).
- 4.6.2.1/4.6.2.2: bộ lọc Định dạng, modal xem trước online thật, nút Xem/Sửa/Xóa trên dòng, Danh mục, Năm ban hành, Thẻ (Tags), chặn tệp thực thi, giới hạn 50MB, hậu tố _v2/_v3, lưu server (đã bỏ).
- 4.6.4: nút 'Khôi phục dữ liệu gốc', luồng duyệt của Tổ Thư ký, trạng thái 'Đã gửi đề nghị công bố' ở cấp phiên bản, mã version tự sinh, lý do bắt buộc max 1000, chọn Kỳ báo cáo dạng năm/quý/tháng (đã bỏ).

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- Hệ thống không kiểm tra vai trò cho Báo cáo thường niên ESG, Kho tài liệu, Điều chỉnh số liệu (mọi tài khoản đều thao tác; data/accessControl.ts liệt kê feature 'esg-report'/'documents' cho vài vai trò nhưng sidebar không lọc các mục con). BA cần xác nhận ai được tạo/đóng đợt, thêm/sửa/xóa tài liệu và điều chỉnh/công bố số liệu.
- Đóng đợt ở 4.6.1.2: modal nói 'khóa đợt' và 'đẩy sang CMS', nhưng mã không khóa upload/xóa tệp sau khi đóng, không bắt buộc có tệp báo cáo cuối, và chưa ghi gì sang CMS hay Kho tài liệu. Đã mô tả đúng như mã; cần BA quyết định có giữ nguyên hay yêu cầu bổ sung.
- Kho tài liệu: giao diện chưa có điều khiển Public/Internal, Danh mục, Năm, Thẻ và chưa upload/preview/download thật; SRS chỉ mô tả đúng hiện trạng. BA cần quyết định có thêm các trường này vào hệ thống hay bỏ khỏi SRS.
- Điều chỉnh số liệu: số phiên bản mới tính theo phiên bản đang xem (không theo phiên bản lớn nhất), nên có thể sinh mã trùng (ví dụ lưu hai lần từ v1.0 đều ra v1.1); hệ thống không kiểm tra trùng.
- Điều chỉnh số liệu: bộ lọc trạng thái 'Đã gửi'/'Nháp' ở mức chỉ tiêu (dòng cha) không loại chỉ tiêu nào (chỉ lọc dòng con khi mở rộng); riêng 'Công bố' hoạt động theo trạng thái xuất bản. Nhãn Nháp/Đã gửi/Công bố (cấp biểu đồ) và Active/Deactive (cấp phiên bản) là hai khái niệm khác nhau; BA cần xác nhận thuật ngữ.
- Điều chỉnh số liệu: 'Người thực hiện' và nhật ký dùng tài khoản cố định (hai tên khác nhau: hai.nv và hai.nm@vietnamairlines.com) thay vì người dùng đăng nhập thực tế.
- Đề nghị công bố/gỡ công bố hiện không ghi Audit Log, trái với yêu cầu ghi nhật ký mọi thao tác; cần BA xác nhận có bổ sung vào hệ thống không.
- Số liệu gốc trong 4.6.4 là giá trị mô phỏng sinh theo mã chỉ tiêu, không lấy từ dữ liệu nhập liệu thực tế.

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- pages/DocumentApproval.tsx - route 'document-approval' (Phê duyệt yêu cầu tài liệu): đã đăng ký trong App.tsx nhưng không có menu/nút nào dẫn tới; chỉ vào được bằng URL.
- pages/ReportDrafting.tsx - route 'report-drafting' (Soạn thảo báo cáo): không có menu/nút dẫn tới.
- pages/ReportPending.tsx - route 'report-pending' (Chờ phê duyệt): không có menu/nút dẫn tới.
- pages/ReportApproved.tsx - route 'report-approved' (Đã phê duyệt): không có menu/nút dẫn tới.
- components/DocumentUploadRequestTab.tsx (tab 'Yêu cầu tải tài liệu' với trạng thái Chờ duyệt/Đã duyệt/Từ chối): chỉ được Documents.tsx render khi mainTab='REQUESTS' nhưng setMainTab không bao giờ được gọi và không có giao diện tab, nên không truy cập được.
- pages/Documents.tsx: state filterType (lọc Định dạng) có trong mã nhưng không có control trên giao diện.
- pages/PublishAdjust.tsx: hàm handleCreateNewVersion (nút '+ Tạo version mới' đã bị comment), handleToggleSubChartPublish (không có nút gọi), và lời gọi handleSetVersionPublished (hàm không tồn tại) là mã chết; nút 'Khôi phục dữ liệu gốc' không tồn tại.
- pages/EsgReport.tsx: biến isDeptOverdue (cờ quá hạn theo từng đơn vị) được tính nhưng không hiển thị; checkbox chọn đơn vị nhận trong modal không có state (không tác dụng).


## G6 – CMS Website ESG và Landing Page (4.6.3, 4.10)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- Mục 4.6.3 ghi có Dropdown "Phiên bản dữ liệu" (Phiên bản hiện tại / Bản nháp), tab chọn ngôn ngữ chung trên thanh công cụ, Mã phiên bản CMS_vX.Y, Audit Log (User ID, IP, Diff): hệ thống thật không có dropdown phiên bản, không có phiên bản/snapshot/audit; chọn ngôn ngữ VI/EN nằm trong từng tab.
- "Lưu & Public" trong SRS cũ kiểm tra hợp lệ, chặn khi thiếu song ngữ, tạo snapshot và xuất bản: trong code nút chưa gắn onClick, không validation, không có thông báo.
- "Lưu nháp" lưu vào Draft Store tách biệt: thực tế chỉ bật chấm vàng và hiện toast; dữ liệu đã tự lưu vào localStorage ngay khi nhập (không tách bản nháp/bản công bố).
- SRS cũ nói quyền ESG_EDITOR/Admin/Chuyên viên Truyền thông mới được vào CMS: code không kiểm tra quyền cho CMS (accessControl.ts chỉ chặn menu data-entry và data-approval); mọi tài khoản đều thấy.
- Hero: SRS cũ ghi Tiêu đề 255/100 ký tự, Subtitle 500, ảnh Desktop 1920x600 và ảnh Mobile 750x600, nén WebP, nút "Lưu phần Đầu trang", khung Banner Preview thời gian thực: code chỉ có Tiêu đề chính, Hình ảnh Banner (URL + Upload ≤5MB, khuyến nghị 1920x1080), Mô tả phụ; không maxLength, không ảnh mobile, không nén WebP, không có nút lưu riêng.
- Thông điệp Lãnh đạo: SRS cũ ghi giới hạn 100/100/1000 ký tự và 100-800 ký tự, ảnh bắt buộc, khung Live Quote Preview, nút "Lưu Thông điệp": code không có giới hạn/bắt buộc/khung preview/nút lưu; ngoài ra có thêm Nhãn trên, Ảnh section, Title ảnh, Nội dung ảnh. Ví dụ "Ông Đặng Ngọc Hòa" trong SRS cũ không còn (mặc định "Ông Lê Hồng Hà").
- Trụ cột E/S/G: SRS cũ ghi maxLength 150/300/20/255/1000/2000, ảnh 16:9 1280x720, tự nén, đối chiếu GRI: code không có maxLength; khuyến nghị ảnh 1000x600 hoặc 1200x800, tối đa 5MB; 'Mã định danh Trụ cột' là ô disabled; trường "Nội dung bài viết" (futureGoals) có 2 dòng.
- Tin tức & Hoạt động: SRS cũ mô tả bộ lọc Nguồn/Trạng thái, ô tìm kiếm, phân trang 10 bài, nút Toggle, modal Biên tập bài viết (Rich Text, ảnh đại diện, Lưu biên tập), gọi API Spirit thật, bài do nhân viên đề xuất qua phê duyệt: thực tế chỉ có 3 trường tiêu đề giới thiệu khối (lưu thật) và bảng 3 dòng mẫu với 2 icon hành động chỉ hiện toast; nút Sửa không có hành động; nút Đồng bộ Spirit API chỉ hiện toast.
- Lưu trữ Báo cáo: SRS cũ mô tả modal Tải lên/Chỉnh sửa (Tên VI/EN, Năm, Phân loại, PDF ≤50MB), cột Lượt tải, nút Xóa, "Xác nhận lưu": thực tế bảng 2 dòng mẫu, nút Tải báo cáo lên chỉ hiện toast, không có Xóa/Lượt tải/modal; Phân loại hiện là "Bền vững"/"Thường niên".
- Chỉ tiêu công bố: SRS cũ ghi "Ẩn thẻ/Hiện thẻ", tích chọn/kéo thả biểu đồ, thuyết minh bắt buộc và modal xem trước tương tác: thực tế có sub-tab 1 (bảng chỉ tiêu có sắp xếp/lọc/ẩn-hiện), sub-tab 2 (Sprint đính kèm + Backlog + khung xem trước bên phải); mô tả biểu đồ không bắt buộc; kéo thả có thật nhưng thứ tự trong Sprint luôn bị tự sắp theo mã chỉ tiêu; không có cột 'Đơn vị tính' ở Backlog.
- Preview: SRS cũ ghi kiểm tra responsive Desktop và Mobile và mô phỏng chính xác 100%: thực tế modal mô phỏng đơn giản chỉ xem Desktop, tiêu đề banner VI để trống (code dùng visionData.headline không tồn tại), bản EN dùng văn bản cứng.
- 4.10: SRS cũ ghi khối "Biểu đồ & Chỉ tiêu Công bố" trên trang chủ, tin đồng bộ Spirit API, thư viện báo cáo tải PDF theo CMS, Cổng đăng nhập dạng Modal hỗ trợ Microsoft SSO, "Tổ Thư ký duyệt công bố": thực tế trang chủ không có khối biểu đồ; tin và báo cáo là danh sách cố định; Đăng nhập chuyển sang trang #/login; không có SSO trên Landing Page.
- Landing Page: Hero, trụ cột (tiêu đề, mô tả, ảnh), chỉ tiêu ẩn/hiện, Sprint, danh sách bài viết, danh sách báo cáo ở CMS không có tác dụng lên trang công khai (trang dùng constants.ts); chỉ các mục Thông điệp lãnh đạo, tiêu đề khối tin tức, mô tả biểu đồ và trạng thái công bố biểu đồ được đọc từ localStorage.

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Tab con "Phê duyệt tin bài nội bộ" không hiển thị (đã comment) nên không đưa vào SRS.
- Thêm mục 4.6.3.10 Quản lý Biểu đồ công bố (Sprint, Backlog, Từ chối biểu đồ kèm lý do, Khôi phục, Sửa mô tả, khung xem trước, Gom nhóm theo mã chỉ tiêu).
- Thêm Nhãn trên, Ảnh section, Title ảnh, Nội dung ảnh vào mục Thông điệp Lãnh đạo.
- Thêm các khung hướng dẫn kích thước ảnh và ràng buộc 5MB (Hero, Ảnh Lãnh đạo, ảnh thẻ trụ cột).
- Thêm bộ lọc/sắp xếp bảng chỉ tiêu CMS (Lọc mã, Lọc tên, bộ lọc Trạng thái, sắp xếp theo mã/tên).
- Thêm 4.10.1 Trang chi tiết Trụ cột và 4.10.2 Trang chi tiết Chỉ tiêu của Landing Page, nút chuyển ngôn ngữ EN/VI, chân trang.

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Dropdown phiên bản dữ liệu, mã phiên bản CMS_vX.Y, Audit Log xuất bản, Diff nội dung.
- Validation song ngữ bắt buộc, kiểm tra trường bắt buộc trước Public, ràng buộc 5MB+WebP+LCP, nén ảnh tự động.
- Ảnh banner mobile, khung Banner Preview/Live Quote Preview, nút lưu riêng từng tab ("Lưu phần Đầu trang", "Lưu Thông điệp", "Lưu phần Chỉ tiêu & Biểu đồ").
- Bộ lọc/tìm kiếm/phân trang/Modal biên tập bài viết, bài do nhân viên đề xuất, phê duyệt tin bài.
- Modal Tải lên báo cáo, Lượt tải, nút Xóa báo cáo, PDF ≤50MB.
- Modal xem trước biểu đồ tương tác riêng cho CMS tab 4 (thực tế dùng khung xem trước bên phải).
- Khối Biểu đồ & Chỉ tiêu Công bố trên trang chủ Landing Page; Cổng đăng nhập dạng modal + Microsoft SSO.

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- Nút "Lưu & Public" hiện chưa có xử lý: BA cần xác nhận hành vi mong muốn (kiểm tra hợp lệ gì, có phiên bản/nhật ký không) hay bỏ nút khỏi SRS.
- Nút "Gom nhóm theo mã chỉ tiêu" gây lỗi ReferenceError (clusterDetailReportsByIndicator chưa khai báo) khi bấm; SRS đã ghi "chưa hoạt động". Cần dev sửa hoặc bỏ nút.
- Kéo thả đổi vị trí trong Sprint không giữ thứ tự vì luôn tự sắp theo mã chỉ tiêu: BA quyết định có cho phép thứ tự thủ công không.
- Hai trang công khai #/public/about (Giới thiệu chỉ tiêu ESG) và #/public/esg-reports (Báo cáo ESG) chỉ vào được bằng URL: BA có muốn bổ sung liên kết trên menu (khi đó sẽ đưa vào SRS) hay xem là chức năng chết.
- CMS (Hero, Trụ cột, ẩn/hiện chỉ tiêu, Sprint, tin tức, báo cáo) chưa kết nối với Landing Page: cần xác nhận phạm vi thật mong muốn của CMS.
- Tên menu: Sidebar hiển thị "CMS" (nhãn tiếng Việt) trong khi code cấu hình menu ghi "CMS Website ESG"; tiêu đề trang là "Quản trị Website ESG (Public)" - cần thống nhất tên gọi.
- Preview: tiêu đề banner VI để trống (lỗi truy cập visionData.headline), chỉ tiêu 'Chưa có mã' dùng chung một khóa ẩn/hiện; cần dev xác nhận có sửa không.
- Landing Page: nút "Xem tất cả tin tức" chưa có hành động; ảnh chân trang ghi cố định "ESG REPORT 2024".
- Phân quyền CMS: hiện không giới hạn vai trò; cần BA quyết định vai trò được biên tập/xuất bản (Quản trị viên, Người phê duyệt ESG...) theo accessControl.ts.

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- Route #/public/about (trang "Giới thiệu chỉ tiêu ESG", IntroductionPage.tsx): chỉ vào được bằng URL, không có menu/nút dẫn tới trên Landing Page (menu header chỉ có Tổng quan, Chiến lược ESG, Tin tức & Hoạt động, Lưu trữ báo cáo). Đã chụp ảnh shots/G6/4.10_gioi_thieu.png.
- Route #/public/esg-reports (trang "Báo cáo Phát triển Bền vững & Thường niên", ESGReports.tsx, có breadcrumb, ô tìm kiếm và lọc theo năm): chỉ vào được bằng URL, không có liên kết dẫn tới. Đã chụp ảnh shots/G6/4.10_bao_cao_esg.png.
- components/ESGNewsTab.tsx (tab tin bài ESG theo Ban với trạng thái Nháp/Chờ duyệt/Đã duyệt/Từ chối): không được import ở bất kỳ trang nào.
- Tab con "Phê duyệt tin bài nội bộ" trong CMS tab 5 (newsSubTab='approve'): nút tab đã bị comment, không hiển thị.
- components/public-site/components/Charts.tsx (EmissionsChart) và khối lọc Năm/Loại + nút lọc loại chỉ tiêu (Tất cả/Động/Text) trong ReportArchive/PillarDetail: mã bị comment hoặc không được dùng.
- Các biến dữ liệu CMS không có ô nhập: complianceVi/En, attachmentName/Url, chartUrl, newsCategory/newsPublishDate, newsBody, newsReports (chỉ xuất hiện trong cửa sổ xem trước); imageSubtitleVi/En của thẻ ảnh Thông điệp.


## G7 – Khuyến nghị Claim SAF (4.7)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- SRS cũ mô tả Kỳ báo cáo áp dụng (Select năm/quý/tháng) và Trạng thái kịch bản (Nháp/Đã phê duyệt): thực tế chỉ có bộ chọn "Năm mô phỏng" (lưới năm), không có trạng thái kịch bản hay khóa/phê duyệt (bỏ quy tắc 8)
- SRS cũ nói bảng tách nhiều dòng theo cơ chế với rowSpan/align-middle: thực tế mỗi lô 1 dòng, các cơ chế là cột song song FLS/CO2/USD; cột Apply là nhóm nút toggle, không phải radio 'Tích áp dụng'/'Đang áp dụng'
- SRS cũ: cột Mã lô & Ngày nạp, Nhà cung cấp & VAT, Chi phí nếu chọn & nhãn 'Tiết kiệm nhất': không còn trên bảng (chỉ BATCH No, DEP, ARR, NEAT SAF, FLS, CO2, USD, Apply, Thao tác); không có nhãn 'Tiết kiệm nhất' và công thức Credit Saved/Net Batch Cost
- SRS cũ: preset giá Default/High/Low, nút 'Chạy tối ưu chi phí', 'Export báo cáo' (Excel hoặc PDF), 'Lịch sử kịch bản', tỷ giá USD/VND nhập được, chế độ Tự động/Thủ công chuyển được: đều không có/ẩn; chỉ có 'Xuất Excel' bảng lô, 'Danh sách kịch bản', 'So sánh kịch bản'
- SRS cũ: khối 'Chi phí mua SAF dự kiến' có Tổng + 3 cơ chế theo USD và VND: thực tế chỉ USD, nằm trong thẻ 'Tổng Chi phí Tuân thủ', đơn giá SAF cố định 2.450 USD/tấn
- Công thức nghĩa vụ CORSIA thực: Sectoral = Phát thải × Tăng trưởng × Tỷ trọng Sectoral; Individual = max(0, Phát thải − Baseline) × Tỷ trọng Individual; làm tròn; mặc định ra 9.600 tCO₂
- SRS cũ: nút xóa lô có; thực tế có kèm xác nhận; không có thêm/sửa lô trên giao diện

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- Khối tham số TÍN CHỈ CO2 (giá, phát thải, hạn ngạch miễn giảm, tăng trưởng ngành, Sectoral/Individual, Baseline) – 4.7.2
- Bộ lọc/sắp xếp bảng lô, dòng tổng cộng, chân bảng claim EU/UK/CORSIA, xuất Excel – 4.7.3
- Thẻ chỉ số tài chính – 4.7.4; Lưu kịch bản – 4.7.5; Danh sách kịch bản – 4.7.6; So sánh kịch bản có hộp chọn – 4.7.7; Chế độ nhập tay – 4.7.8; nút Đồng bộ dữ liệu – 4.7.1

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- Trạng thái kịch bản Nháp/Đã phê duyệt và khóa; Lịch sử kịch bản; preset giá; Chạy tối ưu chi phí (Ledger); Export PDF; tỷ giá nhập; nhãn Tiết kiệm nhất

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- Chế độ Nhập tay hiện chỉ vào được qua mở kịch bản mẫu Manual và không quay lại được bằng nút: BA xác nhận giữ trong SRS (4.7.8) hay bỏ
- Nút Thêm lô SAF/preset giá/Tối ưu chi phí đã bị ẩn: BA xác nhận đây là chủ đích (SRS bỏ) hay sẽ bật lại
- Tỷ giá VND (25.450) và đơn giá SAF 2.450 USD/tấn là hằng số trong mã, không chỉnh được: BA xác nhận
- Hệ số hiển thị ở nhập tay (2,60/2,55) lệch hệ số tính (2,62/2,58/2,55): cần thống nhất
- Năm hiện tại cố định 2026 trong bộ chọn năm (hard-code)
- Dữ liệu lô SAF/kịch bản lưu tại localStorage của trình duyệt, không dùng chung giữa người dùng

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- Modal "Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng" (chọn mã lô từ kho SAF_WAREHOUSE_REPOSITORY, nút "Thêm vào ma trận"): chỉ mở được qua tham số URL (?modal=new), không có nút trên giao diện
- URL deep-link ?modal=list|compare|save: tương tự, không có điều hướng giao diện
- Nút chuyển tab chế độ "Tab 1: Số liệu lấy từ kho Ledger" / "Tab 2: Nhập tay": bị comment trong code
- Nút preset giá "Giá cao (+30%)", "Giá thấp (-20%)", "Mặc định" (HIGH: EUA 99,5/UKA 75/CORSIA 32; LOW: 62/45/17,5): bị comment
- Nút "Điều chỉnh chỉ số đầu vào" và "Tự động Tối ưu (Smart Optimizer)" ở thanh công cụ: bị comment; các phương án chiến lược (strategyEuPriority/Corsia/Optimal) và biểu đồ so sánh còn trong mã nhưng không hiển thị
- Tab activeTab (allocation/comparison/verifier): khai báo nhưng không dùng
- Nút "Xem Danh sách kịch bản" ở cuối trang: bị comment
- Trang "Mô phỏng Net Zero 2050" (netzero-simulation), netzero-solution, netzero-comparison: không có menu


## G8 – Cài đặt hệ thống (4.8)

### SRS cũ ghi sai so với hệ thống thật (đã sửa trong SRS v3)

- 4.8.1: SRS ghi 12 nguồn (TMS, FOC, OCC, SAP ERP, Lotusmiles, Skywise, HRM...) - thực tế 14 dòng: Manual + 13 hệ thống (FIMS, ACARS-SITA, Netlines, CMS, SkyHR, E-learning, Revera, Central Hub, Qualtrics, SF CO2, TIMS, RPS, BI-CLM).
- 4.8.1: SRS ghi 3 trạng thái (Đã kết nối/Mất kết nối/Đang đồng bộ) - thực tế 2 trạng thái 'Kết nối tốt'/'Mất kết nối'; giao thức thực tế API/Database/Excel (không có SFTP/CSV); nút thực tế chỉ 'Đồng bộ' từng dòng (không có 'Kiểm tra kết nối', 'Xem Log đồng bộ'); không có retry 3 lần/15 phút và không có cảnh báo gửi quản trị viên (chỉ mô phỏng).
- 4.8.1: SRS ghi 'Khóa dữ liệu lịch sử / kho Raw bất biến' - màn hình không có cơ chế này.
- 4.8.2.1: SRS ghi bộ lọc Ban/Đơn vị, Vai trò, Trạng thái, cột STT/Mã NV/Ngày tạo, nút 'Đặt lại mật khẩu', quy tắc email @vietnamairlines.com, duy nhất Email/Mã NV, bảo vệ Super Admin - thực tế chỉ có ô tìm kiếm; cột Tài khoản/Đơn vị/Vai trò/Chỉ tiêu phụ trách/Trạng thái/Thao tác; thao tác Sửa, Khóa/Mở khóa, Xóa (xóa thật sau confirm); không đặt lại mật khẩu; không kiểm tra email/trùng/Super Admin.
- 4.8.2.2: SRS ghi các trường Mã nhân viên, Số điện thoại, Mật khẩu khởi tạo, Trạng thái dạng Radio, độ dài 100/20/50, chính sách mật khẩu mạnh, đổi mật khẩu lần đầu, gửi email thông báo - thực tế form chỉ 5 trường + cây Chỉ tiêu phụ trách; bắt buộc chỉ Họ tên & Email; không maxLength; không có mật khẩu/email thông báo. Vai trò SRS (Quản trị viên TCT, Quản trị viên Ban, Chuyên viên nhập liệu ESG, Biên tập viên CMS, Người xem) khác 07 vai trò thật.
- 4.8.3: SRS ghi 12 CQĐV (Đoàn bay 919, VACS, Skypec...), mã DEPT code tay (BAN_KT...), Tên viết tắt, Khối (5 khối), Cán bộ đầu mối, Email đầu mối @vietnamairlines.com, cột 'Số chỉ tiêu', bộ lọc Khối, ràng buộc khóa đơn vị - thực tế 9 Ban/Đơn vị (DEPT-001..009) chỉ có Tên + chỉ tiêu gán + trạng thái; mã tự sinh DEPT-xxx; bộ lọc Trạng thái; nút Sửa/Tạm ngưng-Kích hoạt/Xóa (không có 'Xem danh sách chỉ tiêu').
- 4.8.4: SRS ghi 5 vai trò (Admin, Executive, Secretary, Editor, Viewer) và ma trận Read/Write/Config/Publish/Export/Delete + Data Scope + nút 'Lưu cấu hình quyền' - thực tế 7 vai trò (Quản trị viên, Người phê duyệt ESG, Nhập liệu Kỹ thuật/Xã hội/Quản trị/Chuyển đổi số, Người xem), ma trận 16 tính năng x 4 quyền (Xem/Thêm mới/Chỉnh sửa/Xóa), không có Data Scope, nút là 'Lưu thay đổi', 'Thêm mới' (không phải 'Thêm vai trò mới'); quy tắc 'Tổ Thư ký/Ban Lãnh đạo/Tổ Ban chuyên môn' và 'chỉ Publish được công bố' không còn khớp.
- 4.8.5: SRS ghi bộ lọc khoảng ngày, phân hệ (10 giá trị), loại thao tác (LOGIN/LOGOUT/CREATE/UPDATE/DELETE/CONFIG/PUBLISH/EXPORT), cột IP/Đối tượng/giá trị cũ->mới, xuất Excel, lưu 5 năm, ghi log tự động - thực tế 07 log mẫu cố định, 3 bộ lọc (từ khóa, Chức năng, Hành động CREATE/UPDATE/DELETE), cột Thời gian tạo/sửa + Tài khoản tạo/sửa, không có IP, ngày, Excel, thời hạn lưu; không tự ghi log.
- 4.8.6: SRS ghi định dạng YYYY-MM-DD, Timeout nhập số 15-120, SMTP 4 trường + bắt buộc Test Connection, ngưỡng sai lệch CORSIA/EU ETS (2%/5%), ngôn ngữ mặc định - thực tế định dạng MM/DD/YYYY, Timeout là select 15/30/60/Không bao giờ, SMTP 7 trường + loại gửi + thời gian nhắc nhở, không Test Connection, không ngưỡng sai lệch, không ngôn ngữ; có thêm Popup/Âm thanh và Đổi mật khẩu (SRS chỉ nhắc đổi mật khẩu trong phần mô tả).
- Tên menu 'Cài đặt chung' nhưng tiêu đề trang là 'Thiết lập chung'.

### Có trên hệ thống nhưng SRS cũ chưa có (đã bổ sung)

- 4.8.2.1/4.8.2.2: Cột 'Chỉ tiêu phụ trách' với nhãn kế thừa từ Ban (xanh lá) và gán riêng (xanh dương); cây chọn Chỉ tiêu phụ trách theo biểu mẫu con (56 biểu mẫu từ 55 chỉ tiêu), 'Chọn tất cả chỉ tiêu'; nút Xóa tài khoản (xóa thật).
- 4.8.3: Cây gán chỉ tiêu (theo biểu mẫu) và nút Xóa ban/Tạm ngưng trên từng Ban.
- 4.8.4: Danh sách vai trò bên trái với nhãn 'N form', modal 'Thêm nhóm quyền mới' (Mã/Tên/Mô tả).
- 4.8.6: Công tắc Thông báo Popup, Âm thanh thông báo; Thời gian gửi email nhắc nhở trước; MAIL_TRANSPORT, EMAIL_SMTP_SECURE, EMAIL_SMTP_USER; khối Đổi mật khẩu hoàn chỉnh (3 ô) - đã đưa vào các mục tương ứng.
- 4.8.1: Bộ lọc Giao thức/Trạng thái và dòng 'Manual' (nhập qua form dữ liệu).

### SRS cũ có nhưng hệ thống không có (đã bỏ)

- 4.8.1: Kiểm tra kết nối (Ping/Health Check), Xem Log đồng bộ, cơ chế retry/cảnh báo, trạng thái 'Đang đồng bộ' dạng badge, kho Raw bất biến - đã bỏ.
- 4.8.2: Đặt lại mật khẩu, Mã nhân viên, Số điện thoại, Mật khẩu khởi tạo/đổi mật khẩu lần đầu, email thông báo, bộ lọc Ban/Vai trò/Trạng thái, kiểm tra trùng email/Mã NV, bảo vệ Super Admin - đã bỏ.
- 4.8.3: Tên viết tắt, Khối, Cán bộ đầu mối, Email đầu mối, cột Số chỉ tiêu, bộ lọc Khối, nút Xem danh sách chỉ tiêu, ràng buộc khóa đơn vị - đã bỏ.
- 4.8.4: Data Scope, quyền Config/Publish/Export, nút 'Lưu cấu hình quyền', ghi log kiểm toán khi lưu quyền - đã bỏ.
- 4.8.5: Bộ lọc khoảng ngày, bộ lọc Phân hệ 10 giá trị, loại thao tác LOGIN/LOGOUT/CONFIG/PUBLISH/EXPORT, cột IP/Đối tượng, diff giá trị cũ -> mới, Xuất Excel, thời hạn lưu 5 năm, bất biến/ghi vết tự động - đã bỏ.
- 4.8.6: Ngôn ngữ mặc định, ngưỡng cảnh báo sai lệch số liệu, Test Connection SMTP, ràng buộc timeout 15-120 - đã bỏ.

### Câu hỏi / lỗi cần BA hoặc DEV quyết định

- LỖI GIAO DIỆN cần DEV xác nhận: ở modal Thêm/Sửa người dùng (4.8.2.2) ba ô chọn Đơn vị / Vai trò / Trạng thái không đổi được giá trị (SysOrg.tsx dùng e.target.value trong khi Select chung trả về trực tiếp giá trị -> lỗi 'Cannot read properties of undefined (reading value)'); và bộ lọc Trạng thái ở 4.8.3.1 hiển thị 'Chọn...' không có lựa chọn (Departments.tsx truyền <option> con và e.target.value). SRS đã mô tả theo hành vi dự kiến; BA cần quyết định có yêu cầu sửa không.
- Hệ thống chưa có luồng phê duyệt nhưng vai trò mặc định vẫn có tên 'Người phê duyệt ESG' (mô tả 'phê duyệt dữ liệu các đơn vị', featureIds có 'data-approval'). SRS giữ nguyên tên vai trò như trên giao diện - BA cần quyết định có đổi tên vai trò hay không.
- Ma trận quyền tính năng (4.8.4) chỉ lưu localStorage 'vna_esg_roles', không làm thay đổi hiển thị menu; menu Cài đặt hệ thống hiển thị cho mọi tài khoản (đã kiểm chứng với tài khoản Người phê duyệt ESG, vào được sys-roles). BA cần quyết định ai được truy cập Cài đặt hệ thống.
- Cây gán chỉ tiêu của Ban lưu mã biểu mẫu con (ví dụ 'GRI 302-1-form-jet') trong khi dữ liệu mặc định lưu mã chỉ tiêu cha; khi sửa Ban mặc định các chỉ tiêu đã gán không được tích sẵn, và sau khi lưu cột 'Chỉ tiêu quản lý' có thể hiển thị mã biểu mẫu thay vì mã chỉ tiêu. Đề nghị BA/DEV thống nhất cách lưu.
- Danh sách chỉ tiêu: file JSON có 55 chỉ tiêu, cây chọn hiển thị 56 biểu mẫu (GRI 302-1 có 02 biểu mẫu); chỉ tiêu 'GRI 406-1' được gán đồng thời cho 2 Ban (Tổ Dịch vụ và Ban Tổ chức Nhân lực) trong dữ liệu mặc định.
- Ma trận quyền có ghi quyền theo biểu mẫu (Xem/Nhập kỳ hiện tại/Sửa dữ liệu cũ/Import Excel/Gửi duyệt/Phê duyệt) trong dữ liệu vai trò nhưng giao diện đã ẩn; số 'N form' trên nhãn vai trò lấy từ đây - BA xác nhận có giữ khái niệm 'form' trong SRS không.
- Nhật ký log chỉ là dữ liệu mẫu (không phát sinh từ thao tác thật); xác nhận mức độ yêu cầu đối với tính năng audit log (IP, xuất Excel, lưu 5 năm) thuộc phạm vi triển khai thật.
- Màn Cài đặt chung: Test Connection SMTP, ngưỡng sai lệch, ngôn ngữ mặc định, áp dụng thật định dạng ngày/tiền tệ/timeout chưa có - BA xác nhận giữ ở SRS hay bỏ. Mật khẩu SMTP đang lưu dạng rõ trong localStorage.
- Xóa tài khoản/Ban là xóa cứng (có confirm) - mâu thuẫn nguyên tắc 'không xóa cứng' của SRS cũ; BA xác nhận nghiệp vụ mong muốn.

### Chức năng/route không truy cập được từ giao diện (không đưa vào SRS)

- Route sys-accounts (pages/SysAccounts.tsx - SysAccountsPage) và sys-forms (pages/SysForms.tsx - SysFormsPage): có case trong App.tsx nhưng không có menu/nút dẫn tới (menu Cài đặt hệ thống chỉ có 6 mục) - route chết, không đưa vào SRS.
- Route data-warehouse-raw (pages/DataWarehouseRaw.tsx): chỉ được dẫn tới từ ô "Dữ liệu thô" của pages/Dashboard.tsx (DashboardPage), trang này không được hiển thị ở route nào trên menu ('dashboard' hiển thị ExecutiveDashboard) - không có nút dẫn từ trang Nguồn dữ liệu & Kết nối -> route chết.
- SysRoles.tsx: hai tab 'Form nhập liệu' (ma trận Xem / Nhập kỳ hiện tại / Sửa dữ liệu cũ / Import Excel / Gửi duyệt / Phê duyệt) và 'Phân bổ Chỉ tiêu' (kèm modal 'Thêm chỉ tiêu mới') đã bị comment khỏi thanh tab - mã còn nhưng không truy cập được từ giao diện; cột 'Gửi duyệt/Phê duyệt' nằm trong phần này nên không đưa vào SRS.
- DataSources.tsx: hàm handleRefresh (làm mới/đồng bộ tất cả nguồn) không có nút kích hoạt; handleDetail (xem chi tiết nguồn khi bấm dòng hoặc mũi tên) chỉ console.log, không mở giao diện nào.
- Settings.tsx: Các giá trị Định dạng ngày giờ, Tiền tệ, Timeout, Popup, Âm thanh chưa được lưu/áp dụng (chỉ state cục bộ); Đổi mật khẩu chỉ là mô phỏng.
- SysLogs.tsx: kiểu hành động 'SYNC' có trong interface nhưng không có dữ liệu và không có trong bộ lọc.
