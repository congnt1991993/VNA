# BÁO CÁO HIỆN TRẠNG & TỔNG QUAN KIẾN TRÚC HỆ THỐNG
## VNA ESG DATA MANAGER (VIETNAM AIRLINES)

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án**: `vna-esg-data-manager`
- **Chủ đầu tư / Đơn vị thụ hưởng**: Tổng công ty Hàng không Việt Nam (Vietnam Airlines).
- **Mục tiêu hệ thống**: 
  1. Số hóa toàn diện quy trình thu thập, kiểm tra, phê duyệt và hợp nhất dữ liệu Phát triển Bền vững (ESG - Môi trường, Xã hội, Quản trị).
  2. Quản lý hệ thống chỉ tiêu tiêu chuẩn quốc tế (GRI Standards, ICAO CORSIA, EU ETS, UK ETS, ReFuelEU Aviation) và các chỉ tiêu đặc thù ngành hàng không.
  3. Cung cấp công cụ hỗ trợ ra quyết định phân bổ và claim nhiên liệu bay bền vững (SAF - Sustainable Aviation Fuel) nhằm tối ưu hóa chi phí tuân thủ quốc tế.
  4. Quản trị mục tiêu và đánh giá hiệu quả thực hiện (KPI ESG) của từng Ban/Đơn vị chuyên trách.
  5. Quản lý quy trình xuất bản, kiểm soát phiên bản số liệu và vận hành Cổng thông tin công bố ESG đối ngoại (Public Portal & CMS).

---

## 2. KIẾN TRÚC CÔNG NGHỆ (TECHNICAL ARCHITECTURE)

### 2.1. Tech Stack
- **Core Framework**: React 19 (`19.2.1`), TypeScript (`~5.8.2`), Vite (`^6.2.0`).
- **Styling**: Tailwind CSS (`^3.4.17`), PostCSS (`^8.5.6`), Autoprefixer.
- **Iconography**: Lucide React (`^0.555.0`).
- **Trực quan hóa dữ liệu (Charts)**: Recharts (`^3.5.1`).
- **Xử lý Bảng tính Excel**: SheetJS / `xlsx` (`^0.18.5`) - hỗ trợ import/export biểu mẫu nhập liệu và báo cáo.
- **Đa ngôn ngữ (i18n)**: `i18next` (`^26.3.1`), `react-i18next` (`^17.0.8`) kết hợp hệ thống từ điển song ngữ VI/EN động.

### 2.2. Kiến trúc Điều hướng & Routing
- Hệ thống sử dụng **Client-side Hash Routing** (`window.location.hash`) xử lý điều hướng mượt mà, không phụ thuộc vào server cấu hình rewrite URL:
  - **Khu vực Đối ngoại (Public Portal)**: `#/public`, `#/public/pillar/:pillar` (môi trường, xã hội, quản trị), `#/public/about`, `#/public/esg-reports`.
  - **Màn hình Đăng nhập**: `#/login`.
  - **Khu vực Quản trị Nội bộ (Internal Workspace)**: `#/dashboard`, `#/data-entry`, `#/indicators`, `#/kpi-manage`, `#/netzero-simulation-v2`, `#/publish-adjust`, `#/cms-manage`,...

### 2.3. Quản lý Trạng thái & Cơ chế Đồng bộ (State Management & Event-Driven Sync)
- **AccessContext / AccessProvider**: Quản lý phiên làm việc của người dùng hiện tại (`currentUser`), vai trò hiệu lực (`viewAsRoleId`), đơn vị được chọn (`selectedDepartment`), quyền hạn trên biểu mẫu (`effectiveFormGrants`).
- **Client Storage Persistence (`localStorage`)**:
  - `vna_esg_indicators`: Từ điển hơn 100 chỉ tiêu ESG.
  - `vna_esg_departments`: 9 Ban/Đơn vị phụ trách và danh sách mã chỉ tiêu phân công.
  - `vna_all_submissions`: Bản ghi nhập liệu và trạng thái phê duyệt qua từng kỳ báo cáo.
  - `vna_esg_kpis`: Danh sách cấu hình KPI mục tiêu, kế hoạch năm/tháng, kết quả thực hiện.
  - `vna_kpi_audit_logs`: Nhật ký kiểm toán chi tiết lịch sử thay đổi kế hoạch KPI.
  - `vna_esg_forms`: Danh sách biểu mẫu nhập liệu động do quản trị viên thiết lập.
  - `vna_esg_chart_versions`: Phiên bản dữ liệu biểu đồ công bố (gốc, hiệu chỉnh, kiểm toán).
  - `vna_esg_cms_data`: Dữ liệu bài viết tin tức và cấu hình hiển thị Cổng thông tin công bố.
  - `vna_esg_lang`: Ngôn ngữ hiển thị hệ thống (`vi` | `en`).
- **Reactive Custom Event Bus**:
  - `vna_language_changed`: Đồng bộ thay đổi ngôn ngữ trên toàn bộ component và header.
  - `vna_forms_updated`: Thông báo khi có biểu mẫu mới được tạo hoặc cập nhật trong `SysForms`.
  - `vna_kpis_updated`: Cập nhật lại chỉ tiêu kế hoạch khi có thao tác điều chỉnh.
  - `vna_chart_versions_updated`: Đồng bộ phiên bản biểu đồ sang màn hình công bố và CMS.

---

## 3. DANH MỤC CÁC PHÂN HỆ ĐÃ XÂY DỰNG (FEATURE INVENTORY)

| Phân hệ | Màn hình chính / Component | File Nguồn | Mô tả Chức năng |
| :--- | :--- | :--- | :--- |
| **Tổng quan điều hành** | Executive Dashboard | `pages/ExecutiveDashboard.tsx` | Dashboard tổng hợp KPI, phân tích 3 trụ cột E-S-G, tiến độ chiến dịch nộp báo cáo, cảnh báo rủi ro phát thải. |
| | Dashboard Chuyên đề | `pages/DashboardVNA.tsx`, `DashboardEnv.tsx`, `DashboardSoc.tsx`, `DashboardGov.tsx` | Phân tích sâu theo từng lĩnh vực: Môi trường (nhiên liệu, CO2), Xã hội (nhân sự, an toàn), Quản trị. |
| **Thu thập & Nhập liệu** | Workspace Nhập liệu | `components/IndicatorDataEntryWorkspace.tsx` | Giao diện điều hướng theo ban/đơn vị, lọc danh sách chỉ tiêu được giao nhập. |
| | Biểu mẫu Hợp nhất | `components/UnifiedDataEntryForm.tsx` | Form nhập liệu tự động thích ứng chỉ tiêu định lượng hoặc định tính (GRI 2), đối soát KPI, xem lịch sử. |
| | Import Excel | `components/ExcelImportModal.tsx` | Tải template, import dữ liệu từ file Excel, kiểm tra định dạng và dữ liệu trước khi ghi nhận. |
| | Lịch sử & Kiểm toán | `components/IndicatorHistoryTable.tsx` | Hiển thị lịch sử nhập liệu qua các kỳ (tháng/quý/năm), người tạo, người duyệt. |
| | Phê duyệt Dữ liệu | `pages/DataApproval.tsx`, `components/ApprovalWorkflow.tsx` | Quy trình duyệt số liệu nộp từ các Ban, hỗ trợ Trả về yêu cầu giải trình hoặc Phê duyệt. |
| **Quản lý Chỉ tiêu & KPI** | Quản lý Chỉ tiêu | `pages/Indicators.tsx` | Quản lý danh mục hơn 100 chỉ tiêu GRI/Hàng không, cấu hình đơn vị tính, tần suất, đơn vị phụ trách. |
| | Quản lý KPI | `pages/KPIManage.tsx` | Thiết lập mục tiêu năm/tháng, tỷ trọng (weight), chiều hướng (`asc`/`desc`), tự động tính % hoàn thành và ghi log kiểm toán. |
| | Quản lý Công thức | `pages/Formulas.tsx` | Xây dựng công thức tính toán chỉ tiêu tự động (Scope 1, Cường độ CO2, RTK). |
| **Phân tích Net Zero & SAF** | Khuyến nghị Claim SAF | `pages/NetZeroV2.tsx` | Quản lý sổ cái lô SAF, phân bổ tối ưu giữa EU ETS, UK ETS, CORSIA, tính toán chi phí tài chính & CO2 giảm trừ. |
| | Mô phỏng Net Zero | `pages/NetZero.tsx`, `pages/NetZeroSolution.tsx` | Mô phỏng lộ trình Net Zero 2050 theo các kịch bản đội bay, công nghệ, SAF và bù trừ carbon. |
| **Báo cáo & Công bố** | Chiến dịch Báo cáo | `pages/EsgReport.tsx` | Khởi tạo đợt nộp số liệu Báo cáo Thường niên, theo dõi tiến độ nộp của 8 khối/đoàn/ban. |
| | Điều chỉnh Công bố | `pages/PublishAdjust.tsx` | Quản lý phiên bản số liệu (v1.0, v1.1, v2.0), ghi đè số liệu có lý do trước khi công bố. |
| | Kho Tài liệu PTBV | `pages/Documents.tsx`, `pages/DocumentApproval.tsx` | Quản lý tài liệu phát triển bền vững, quy trình phê duyệt yêu cầu cấp phát tài liệu. |
| | Quản trị CMS | `pages/CMSManage.tsx` | Quản trị bài viết, tin tức, biểu đồ và thông điệp hiển thị trên Website ESG đối ngoại. |
| | Cổng Thông tin Đối ngoại | `components/public-site/PublicSite.tsx` | Cổng thông tin công bố ESG đối ngoại dành cho cổ đông, khách hàng và tổ chức quốc tế. |
| **Quản trị Hệ thống** | Cơ cấu Tổ chức | `pages/SysOrg.tsx` | Quản lý danh sách người dùng, chức danh, phân bổ vào các phòng ban. |
| | Quản lý Ban / Đơn vị | `pages/Departments.tsx` | Cấu hình 9 Ban/Đơn vị nghiệp vụ và gán danh sách chỉ tiêu ESG phụ trách. |
| | Phân quyền & Vai trò | `pages/SysRoles.tsx`, `data/accessControl.ts` | Cấu hình 7 nhóm vai trò (`ROLE_ADMIN`, `ROLE_APPROVER`, `ROLE_TECH_ENTRY`...), quyền trên biểu mẫu. |
| | Quản lý Biểu mẫu | `pages/SysForms.tsx` | Trình tạo biểu mẫu nhập liệu động với các trường text, number, date, dropdown. |
| | Nguồn Dữ liệu & Tích hợp | `pages/DataSources.tsx`, `pages/DataWarehouseRaw.tsx` | Quản lý kết nối hệ thống nguồn (SAP/ERP, PMS, RPS, Qualtrics) và kho dữ liệu thô. |
| | Danh mục Hàng không | `pages/Aircrafts.tsx`, `Airports.tsx`, `Countries.tsx`, `Fuels.tsx`, `Suppliers.tsx`, `Flights.tsx`, `CarbonCredits.tsx` | Các danh mục chuẩn hóa phục vụ đo đạc phát thải và nghiệp vụ bay. |

---

## 4. TỔNG KẾT HIỆN TRẠNG KỸ THUẬT

1. **Giao diện & Trải nghiệm (UI/UX)**: Đã hoàn thiện toàn diện với ngôn ngữ thiết kế đồng nhất theo bộ nhận diện thương hiệu Vietnam Airlines (Tone màu VNA Blue & VNA Gold), hỗ trợ Responsive từ Desktop đến Tablet/Mobile.
2. **Logic Nghiệp vụ**: Đã triển khai đầy đủ các bài toán phức tạp nhất của ngành hàng không (tính toán giảm trừ CO2 theo từng cơ chế EU ETS/UK ETS/CORSIA, phân bổ lô SAF, quản lý KPI theo chiều hướng asc/desc, quy trình kiểm soát phiên bản số liệu trước khi công bố).
3. **Tính Độc lập Môi trường**: Toàn bộ ứng dụng có thể chạy hoàn chỉnh ở môi trường phát triển cục bộ (`localhost`) với mock data phong phú, không phụ thuộc cứng vào backend hay dịch vụ bên ngoài, sẵn sàng kết nối API khi hệ thống máy chủ được đưa vào vận hành.
