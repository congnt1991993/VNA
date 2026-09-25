# BỘ QUY TẮC THIẾT KẾ & CHUẨN MỰC LẬP TRÌNH (DESIGN RULES)
## ÁP DỤNG KẾ THỪA CHO PHIÊN LÀM VIỆC HIỆN TẠI VÀ CÁC PHIÊN TIẾP THEO

Tài liệu này định nghĩa toàn bộ quy tắc thiết kế kiến trúc, giao diện người dùng (UI/UX), quản lý trạng thái, chuẩn hóa dữ liệu và các ràng buộc vận hành bắt buộc phải kế thừa trong dự án **VNA ESG Data Manager**.

---

## 1. QUY TẮC THIẾT KẾ THƯƠNG HIỆU & GIAO DIỆN (BRAND & DESIGN SYSTEM)

### 1.1. Bảng màu Nhận diện Thương hiệu Vietnam Airlines
Mọi giao diện mới hoặc chỉnh sửa bắt buộc phải tuân thủ bảng màu thương hiệu:
- **VNA Lotus Blue (Màu chủ đạo)**: `#006885`
  - Gradient Header / Sidebar: `from-[#006885] to-[#004b61]`
  - Hover state: `#00556e`
  - Nhạt / Background phụ trợ: `bg-blue-50`, `text-vna-blue`
- **VNA Golden Lotus (Màu điểm nhấn / Phụ trợ)**: `#DBA410`
  - Hover state: `#b5870b`
  - Nhạt / Accent background: `bg-amber-50`, `text-[#DBA410]`
- **Màu nền ứng dụng (Background Canvas)**: `#F4F6F8` (class Tailwind: `bg-vna-bg`)
- **Màu chữ chuẩn (Typography Tokens)**:
  - Tiêu đề & Văn bản chính: `text-black/85` hoặc `text-gray-900`
  - Văn bản phụ, chú thích, nhãn mô tả: `text-black/45` hoặc `text-gray-500`
  - Trạng thái vô hiệu (Disabled): `text-black/25` hoặc `text-gray-300`

### 1.2. Quy chuẩn Màu sắc 3 Trụ cột ESG
Khi hiển thị huy hiệu (Badge), biểu đồ hoặc khối phân loại thuộc 3 trụ cột ESG, phải sử dụng đúng màu quy ước:
- **Trụ cột Môi trường (Environment - E)**: 
  - Màu xanh lục (Emerald / Green)
  - Badge class: `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Trụ cột Xã hội (Social - S)**: 
  - Màu xanh dương (Sky / Blue)
  - Badge class: `bg-blue-50 text-blue-700 border-blue-200`
- **Trụ cột Quản trị (Governance - G)**: 
  - Màu tím / chàm (Purple / Indigo)
  - Badge class: `bg-purple-50 text-purple-700 border-purple-200`

### 1.3. Tái sử dụng Design System từ `components/UI.tsx`
Tuyệt đối **không viết lại các phần tử giao diện cơ bản (ad-hoc buttons/inputs/modals)**. Luôn import và sử dụng trực tiếp các components chuẩn:
- `<Button variant="primary" | "secondary" | "danger" | "ghost" | "outline">`
- `<Card title="..." subtitle="..." actions={...}>`
- `<Input label="..." error="..." />`, `<TextArea />`
- `<Select options={...} value={...} onChange={...} />` (Đã xử lý dropdown click outside)
- `<Modal isOpen={...} onClose={...} title="..." size="md" | "lg" | "xl">`
- `<Badge>`, `<PillarBadge pillar="Environment" | "Social" | "Governance">`
- `<StatusChip status="Approved" | "Pending" | "Rejected" | "Draft">`
- `<Toast message="..." type="success" | "error" | "info" onClose={...} />`

---

## 2. QUY TẮC QUẢN LÝ TRẠNG THÁI & LƯU TRỮ (STATE & STORAGE RULES)

### 2.1. Cấu trúc Đồng bộ Dữ liệu Client (`localStorage`)
Hệ thống vận hành theo kiến trúc Local-First, mọi dữ liệu nghiệp vụ phải được đồng bộ qua các key chuẩn:

| Storage Key | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `vna_esg_indicators` | `EsgIndicator[]` | Danh mục chỉ tiêu ESG toàn hệ thống. |
| `vna_esg_departments` | `Department[]` | Danh sách 9 Ban/Đơn vị và mảng `indicatorIds` được gán. |
| `vna_all_submissions` | `SubmissionRecord[]` | Các lượt nộp số liệu theo đơn vị, kỳ báo cáo, trạng thái duyệt. |
| `vna_esg_kpis` | `KPIItem[]` | Danh sách mục tiêu kế hoạch năm/tháng, kết quả thực hiện và tiến độ. |
| `vna_kpi_audit_logs` | `KPIAuditLogItem[]` | Lịch sử kiểm toán chi tiết thay đổi kế hoạch KPI. |
| `vna_esg_forms` | `SystemForm[]` | Biểu mẫu động do Admin cấu hình trong `SysForms`. |
| `vna_esg_chart_versions`| `ChartVersionItem[]` | Các phiên bản số liệu biểu đồ (gốc, hiệu chỉnh, kiểm toán). |
| `vna_esg_lang` | `vi \| en` | Ngôn ngữ đang được chọn trên toàn hệ thống. |

### 2.2. Quy tắc Phát và Lắng nghe Event (Custom Event Bus)
Khi một component thay đổi dữ liệu trong `localStorage`, bắt buộc phải phát (dispatch) event tương ứng qua `window.dispatchEvent(new Event(...))` để các component khác tự động cập nhật mà không cần reload trang:
- Thay đổi ngôn ngữ: `vna_language_changed`
- Thay đổi biểu mẫu: `vna_forms_updated`
- Thay đổi KPI: `vna_kpis_updated`
- Thay đổi phiên bản biểu đồ: `vna_chart_versions_updated`

---

## 3. QUY TẮC XỬ LÝ ĐA NGÔN NGỮ (I18N) & ĐỊNH DẠNG SỐ

### 3.1. Xử lý Tên Chỉ tiêu Song ngữ (Bilingual Indicator Parsing)
Trong cơ sở dữ liệu `indicators_main_list.json`, tên chỉ tiêu thường được lưu dưới dạng song ngữ: `"English / Tiếng Việt"` hoặc `"English (Tiếng Việt)"`. 
Mọi component khi hiển thị tên chỉ tiêu bắt buộc phải sử dụng helper chuẩn:
```typescript
export const getLocalizedIndicatorName = (name?: string, lang: "vi" | "en" = "vi"): string => {
  if (!name) return "";
  if (name.includes("/")) {
    const parts = name.split("/").map(p => p.trim());
    if (parts.length >= 2) {
      return lang === "vi" ? (parts[1] || parts[0]) : (parts[0] || parts[1]);
    }
  }
  const parenMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const enPart = parenMatch[1].trim();
    const viPart = parenMatch[2].trim();
    return lang === "vi" ? (viPart || enPart) : (enPart || viPart);
  }
  return name;
};
```

### 3.2. Quy chuẩn Định dạng Số học & Tiền tệ
Tuyệt đối không định dạng số thô bằng `toString()`. Phải tuân thủ chuẩn kế toán:
- **Tiếng Việt (`vi-VN`)**: 
  - Phân cách hàng nghìn bằng dấu chấm (`.`)
  - Phân cách thập phân bằng dấu phẩy (`,`)
  - Ví dụ: `1.250.000,50`
- **Tiếng Anh (`en-US`)**: 
  - Phân cách hàng nghìn bằng dấu phẩy (`,`)
  - Phân cách thập phân bằng dấu chấm (`.`)
  - Ví dụ: `1,250,000.50`
- Sử dụng hàm chuẩn:
  ```typescript
  const locale = lang === "en" ? "en-US" : "vi-VN";
  val.toLocaleString(locale, { maximumFractionDigits: maxDecimals });
  ```

---

## 4. QUY TẮC PHÂN QUYỀN TRUY CẬP (RBAC & ACCESS CONTROL)

Hệ thống triển khai mô hình kiểm soát quyền chặt chẽ thông qua `data/accessControl.ts`:

### 4.1. Danh mục 7 Vai trò Chuẩn
1. `ROLE_ADMIN` (Quản trị viên): Toàn quyền trên tất cả các tính năng và biểu mẫu.
2. `ROLE_APPROVER` (Người phê duyệt ESG): Phê duyệt số liệu của các đơn vị nộp lên, kiểm tra tính hợp lệ trước khi khóa sổ.
3. `ROLE_TECH_ENTRY` (Nhập liệu Kỹ thuật): Phụ trách các biểu mẫu kỹ thuật, SAF, tiêu thụ nhiên liệu bay (`tech-ops`, `ops-flight`).
4. `ROLE_SOCIAL_ENTRY` (Nhập liệu Xã hội): Phụ trách nhân sự, dịch vụ hành khách, hội viên Bông Sen Vàng, truyền thông (`ops-service`, `ops-ttbsv`, `ops-hr`, `ops-comm`).
5. `ROLE_GOV_ENTRY` (Nhập liệu Quản trị): Phụ trách an toàn chất lượng, kế hoạch, tuân thủ (`ops-digital`, `ops-planning`, `ops-atcl`).
6. `ROLE_DIGITAL_ENTRY` (Nhập liệu Chuyển đổi số): Phụ trách bảo mật và an toàn dữ liệu khách hàng (`ops-digital`).
7. `ROLE_VIEWER` (Người xem): Chỉ có quyền xem dashboard và các báo cáo đã xuất bản.

### 4.2. Ma trận Quyền trên Biểu mẫu (`FormGrant`)
Mỗi vai trò được cấp quyền chi tiết trên 6 hành vi:
- `view`: Quyền xem biểu mẫu.
- `enterCurrent`: Quyền nhập số liệu kỳ hiện tại.
- `updateHistory`: Quyền sửa số liệu các kỳ quá khứ (yêu cầu ghi nhận lý do).
- `importExcel`: Quyền tải lên file Excel để nhập hàng loạt.
- `submit`: Quyền nộp số liệu lên cấp trên phê duyệt.
- `approve`: Quyền phê duyệt hoặc từ chối số liệu.

---

## 5. CÁC RÀNG BUỘC VẬN HÀNH & TRIỂN KHAI (OPERATIONAL CONSTRAINTS)

Bất kỳ AI Agent hay lập trình viên nào khi làm việc trên codebase này **BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT**:
1. **Ràng buộc Triển khai (Deployment Constraint)**:
   - **KHÔNG ĐƯỢC TỰ Ý** kích hoạt lệnh triển khai lên Vercel (`vercel --prod` hoặc các lệnh tương tự).
   - Chỉ được phép triển khai khi có chỉ đạo rõ ràng từ người dùng.
2. **Ràng buộc Kiểm thử Trình duyệt (Testing Constraint)**:
   - **KHÔNG ĐƯỢC TỰ Ý** khởi chạy các công cụ kiểm thử trình duyệt tự động (`browser_subagent`) sau mỗi chỉnh sửa.
   - Chỉ thực hiện kiểm thử tự động khi người dùng yêu cầu cụ thể.
3. **Môi trường Phát triển**:
   - Mọi thay đổi phải được kiểm tra và xác nhận an toàn trên môi trường máy chủ cục bộ (`localhost` / `npm run dev`).
4. **Bảo tồn Chú thích & Cấu trúc Code**:
   - Giữ nguyên các comment giải thích nghiệp vụ, đặc biệt là các quy định hàng không (ICAO, CORSIA, EU ETS, ReFuelEU).
