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


---

## 5. CẬP NHẬT NGÀY 23/10/2026 — THAY ĐỔI VÀ HIỆN TRẠNG BỔ SUNG

> Phần này ghi nối tiếp (không thay thế) các mục 1–4 ở trên. Nếu có chỗ khác với mục 1–4 thì ưu tiên mục 5 vì phản ánh kết quả rà soát trực tiếp mã nguồn và giao diện đang chạy.

### 5.1. Menu nội bộ hiện hành (Sidebar)
| Nhóm menu | Mục con | Route (hash) |
| :--- | :--- | :--- |
| TỔNG QUAN ĐIỀU HÀNH | — | `#/dashboard` |
| NHẬP LIỆU | — | `#/data-entry` |
| QUẢN LÝ CHỈ TIÊU | — | `#/indicators` |
| QUẢN LÝ KPI | — | `#/kpi-manage` |
| QUẢN LÝ CÔNG BỐ | Báo cáo thường niên ESG · Điều chỉnh số liệu công bố · Kho tài liệu PTBV chung · CMS | `#/esg-report` · `#/publish-adjust` · `#/documents` · `#/cms-manage` |
| KHUYẾN NGHỊ CLAIM SAF | — | `#/netzero-simulation-v2` |
| CÀI ĐẶT HỆ THỐNG | Nguồn dữ liệu & Kết nối · Quản lý Người dùng · Quản lý Ban / Đơn vị · Phân quyền & Vai trò · **Lịch sử đăng nhập (mới)** · Cài đặt chung | `#/data-sources` · `#/sys-org` · `#/sys-departments` · `#/sys-roles` · `#/sys-login-history` · `#/settings` |

- Mục **"Quản lý log hệ thống"** (`#/sys-logs`) đã được **ẩn khỏi menu** (comment trong `components/Layout.tsx`); mã trang và route vẫn còn nên vẫn mở được bằng URL trực tiếp.
- Trang công khai: `#/public` (Landing page), `#/public/pillar/<environment|social|governance>`; `#/public/about` và `#/public/esg-reports` chỉ vào được bằng URL.
- **Lưu ý đặt tên route:** `App.tsx` coi mọi hash bắt đầu bằng `#/login` là trang đăng nhập, nên route mới không được đặt tên bắt đầu bằng `login` (vì vậy trang Lịch sử đăng nhập dùng `sys-login-history`).

### 5.2. Chức năng bổ sung sau tháng 10/2026
| # | Chức năng | Vị trí | File chính | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Vùng thống kê **Tổng lượt truy cập Landing page** | Trang CMS, dải mỏng dưới tiêu đề trang, trên 6 tab | `components/LandingVisitStats.tsx`, `components/public-site/landingVisits.ts`; nối vào `pages/CMSManage.tsx` (3 dòng) và `components/public-site/PublicSite.tsx` (6 dòng) | Mỗi phiên trình duyệt mở Landing page (người chưa đăng nhập) tính 1 lượt; lưu localStorage `vna_landing_visits`; chỉ hiển thị tổng lượt |
| 2 | **Lịch sử đăng nhập** | Cài đặt hệ thống > Lịch sử đăng nhập | `pages/LoginHistory.tsx`, `components/loginHistory.ts`, `components/LoginSessionTracker.tsx`; nối vào `App.tsx`, `components/Layout.tsx`, `types.ts` | Hiển thị Tài khoản, Cơ quan đơn vị, Thời gian login, Thời gian logout (`hh:mm dd/MM/yyyy`); bộ lọc nằm trong từng cột; lưu localStorage `vna_login_history` (tối đa 500 dòng) |
| 3 | Chỉnh **Footer Landing page** theo phản hồi khách hàng | `components/public-site/PublicSite.tsx` (component `Footer`), `components/public-site/i18n.ts` | Giảm chiều cao, làm mảnh/dịu đường viền vàng, làm rõ thanh bản quyền, năm bản quyền tự lấy theo năm hiện tại (`{{year}}`), thu nhỏ nút mạng xã hội. Nhãn "ESG REPORT 2024" giữ nguyên (nhãn kỳ báo cáo) |
| 4 | Ẩn mục Quản lý log hệ thống khỏi menu | `components/Layout.tsx` | Comment dòng khai báo menu |

Cách ghi nhận Lịch sử đăng nhập: ghi 1 dòng khi người dùng vào hệ thống; ghi giờ logout khi bấm "Đăng xuất"; đổi "Tài khoản mô phỏng" ở header = tài khoản cũ đăng xuất + tài khoản mới đăng nhập; cùng tài khoản trong cùng phiên trình duyệt không ghi trùng; đóng trình duyệt không đăng xuất thì cột logout hiển thị "—".

### 5.3. Khóa lưu trữ (localStorage/sessionStorage) bổ sung
| Khóa | Nội dung |
| :--- | :--- |
| `vna_landing_visits` | `{ total, daily{yyyy-MM-dd:n}, lastVisit }` — thống kê lượt truy cập Landing page (sự kiện `vna_landing_visits_updated`) |
| `vna_login_history` | Danh sách phiên đăng nhập `{ id, account, userName, department, loginAt, logoutAt }` (sự kiện `vna_login_history_updated`) |
| `vna_login_session` (sessionStorage) | Phiên đăng nhập đang mở của tab trình duyệt hiện tại |
| `vna_landing_visit_counted` (sessionStorage) | Cờ đã đếm lượt truy cập của phiên hiện tại |
| `vna_cms_vision`, `vna_cms_news_header`, `vna_cms_pillars`, `vna_cms_indicator_visibility`, `vna_chart_publish_descriptions`, `vna_rejected_backlog_items` | Cấu hình CMS Website ESG (tự lưu ngay khi nhập) |
| `vna_esg_kpi_audit_logs` | Nhật ký chỉnh sửa KPI (tên khóa thật; tài liệu cũ ghi `vna_kpi_audit_logs`) |
| `vna_esg_roles`, `vna_esg_users`, `vna_esg_departments`, `vna_mail_settings` | Phân quyền, người dùng, Ban/Đơn vị, cấu hình SMTP |

### 5.4. Hiện trạng thật của hệ thống (kết quả rà soát toàn bộ để viết lại SRS)
- **Đăng nhập là giả lập:** nhập gì cũng vào; không kiểm tra mật khẩu, không khóa tài khoản, không hết phiên; "Ghi nhớ đăng nhập" không có tác dụng; không có SSO Microsoft và "Quên mật khẩu?" (đã bị comment). Mở thẳng `#/dashboard` vẫn vào được màn nội bộ vì `isAuthenticated` khởi tạo là `true`.
- **Header:** có bộ chọn "Tài khoản mô phỏng" (9 tài khoản mẫu) và "Tổ ban nghiệp vụ" (9 Tổ ban, chi phối danh sách chỉ tiêu ở Nhập liệu); ngôn ngữ VI/EN chọn trong hộp thông tin người dùng; thông báo là 2 mục mẫu cố định.
- **Số liệu thật:** 55 chỉ tiêu (Môi trường 13, Xã hội 21, Quản trị 21), tất cả hình thức "Số liệu"; 9 Ban/Đơn vị (DEPT-001…009); 7 vai trò; Nguồn dữ liệu có 14 dòng (Manual + 13 hệ thống).
- **Route chết (có `case` trong `App.tsx` nhưng không có menu/nút dẫn tới):** `formulas`, `sys-forms`, `alerts-manage`, `sys-accounts`, `data-warehouse-raw`, `document-approval`, `report-drafting`, `report-pending`, `report-approved`, `netzero-simulation`, `netzero-solution`, `netzero-comparison`, `kpi-targets`, `kpi-performance`, các route `ops-*`/`tech-ops`. Component `DataEntryWorkspace.tsx`, `ESGNewsTab.tsx`, `ManualDataEntry.tsx` không còn được dùng.
- **Lỗi đã tái hiện (chưa sửa, cần DEV xử lý):**
  1. `ExecutiveDashboard.tsx`: bấm dòng KPI có link Metabase báo `ReferenceError: Download is not defined` (thiếu import `Download` và state `isExportRawDataModalOpen`).
  2. `Indicators.tsx`: "Xem chi tiết" trong Lịch sử nhập liệu báo `UnifiedDataEntryForm is not defined` (thiếu import).
  3. `CMSManage.tsx`: nút "Gom nhóm theo mã chỉ tiêu" báo `clusterDetailReportsByIndicator is not defined`.
  4. `SysOrg.tsx`: ba ô chọn Đơn vị/Vai trò/Trạng thái trong modal Thêm/Sửa người dùng không đổi được giá trị.
  5. Tên chỉ tiêu có dấu "/" bị tách sai (ví dụ "Tai nạn mức A /10,000 chuyến bay" hiển thị "10,000 chuyến bay").
  6. Dữ liệu CQĐV của nhiều chỉ tiêu không khớp danh sách chọn ở form sửa chỉ tiêu.
- **Phân quyền chưa có hiệu lực đầy đủ:** `data/accessControl.ts` chỉ chặn menu `data-entry`; ma trận ở "Phân quyền & Vai trò" chỉ lưu cấu hình, không đổi hiển thị menu.

### 5.5. Triển khai (Vercel) và công cụ
- Dự án Vercel: `netzero-vietnamairlines-com` (đã liên kết trong `.vercel/project.json`); CLI đăng nhập sẵn với tài khoản `congnt1991993-2376`. Lệnh triển khai production: `npx vercel --prod --yes` (chỉ chạy khi người dùng yêu cầu rõ).
- Đã thêm `.vercelignore` (loại `images`, `scratch`, `CURRENT_STATE`, `dist`, `*.ps1`, `*.xlsx`, `.DS_Store`) vì gói upload ban đầu 207 MB làm deploy thất bại. Ứng dụng không tham chiếu thư mục `images/` (ảnh chạy thật nằm ở `public/`).
- Các lần deploy production gần nhất: 22/10/2026 (thêm thống kê lượt truy cập; footer; Lịch sử đăng nhập và ẩn Quản lý log hệ thống). Alias: `netzero-vietnamairlines-com-delta.vercel.app`. Link có thể bị Vercel chuyển hướng đăng nhập do Deployment Protection.
- Bản deploy lấy trực tiếp từ thư mục làm việc (chưa nhất thiết đã commit). Vercel chưa kết nối Git.
- Công cụ chụp ảnh màn hình phục vụ SRS: Playwright-core + Chrome sẵn có trong cache (`~/Library/Caches/ms-playwright`), chạy trên `http://localhost:3000`.

### 5.6. Tài liệu đã tạo/cập nhật (trong `images/document/`)
| File | Nội dung |
| :--- | :--- |
| `SRS_Trang_QuanTri_VNA_Netzero_v3.docx` | SRS khu vực quản trị nội bộ viết lại theo hệ thống đang chạy (78 mục, 182 hình); phần chỉnh sửa lần gần nhất bôi vàng; có mục 6 "Hiện trạng triển khai và các nội dung chưa có trên giao diện" |
| `SRS_Trang_QuanTri_VNA_Netzero_v2.docx` | Bản cũ, giữ nguyên để đối chiếu |
| `BAO_CAO_RA_SOAT_SRS_vs_HE_THONG.md` | Báo cáo 8 nhóm rà soát: SRS sai so với hệ thống, chức năng thiếu/bỏ, route chết, câu hỏi cho BA/DEV |
| `SRS_v3_screenshots/` | Ảnh màn hình gốc (G1–G8) dùng cho SRS |
| `7. Tài liệu thiết kế hệ thống … - BA sửa A1 bỏ luồng duyệt.docx` | Bản sao tài liệu thiết kế (SDD) đã bỏ luồng phê duyệt dữ liệu, phần sửa đánh dấu gạch ngang/bôi màu |
| `BA DOC/Danh_Sach_Ma_Chi_Tieu_95.xlsx` | 95 mã chỉ tiêu: STT, GRI Code, Tên, Tổ ban, Mô tả tiếng Anh / tiếng Việt (định nghĩa trích từ GRI Standards và IATA ASRH, kèm link tham chiếu) |
