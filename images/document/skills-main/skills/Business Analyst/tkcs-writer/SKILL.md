---
name: tkcs-writer
description: "Skill để viết tài liệu Thiết kế Cơ sở (TKCS) cho dự án CNTT cấp chính phủ Việt Nam, đặc biệt trong lĩnh vực Nông nghiệp và Môi trường (Bộ NN&MT). Sử dụng skill này khi người dùng yêu cầu viết TKCS, thiết kế cơ sở, thiết kế hệ thống CSDL quốc gia, hoặc soạn tài liệu dự án đầu tư CNTT cho cơ quan nhà nước. Cũng sử dụng khi người dùng cần bổ sung, hoàn thiện hoặc kiểm tra tính đầy đủ của một tài liệu TKCS hiện có. Trigger bao gồm: 'TKCS', 'thiết kế cơ sở', 'technical design', 'dự án CNTT chính phủ', 'CSDL quốc gia', 'xây dựng cơ sở dữ liệu Bộ', hoặc bất kỳ yêu cầu soạn thảo tài liệu kỹ thuật theo chuẩn Nghị định 45/2026."
---

# Skill Viết Thiết kế Cơ sở (TKCS) — Dự án CNTT Chính phủ

## Tổng quan

Skill này hướng dẫn viết tài liệu Thiết kế Cơ sở (TKCS) cho dự án đầu tư ứng dụng CNTT sử dụng nguồn vốn ngân sách nhà nước, tuân thủ Nghị định 45/2026/NĐ-CP. Tài liệu TKCS là sản phẩm bắt buộc trong giai đoạn lập dự án, phục vụ thẩm tra, phê duyệt đầu tư.

Cấu trúc chuẩn gồm **5 Phần chính + 2 Phụ lục**, mỗi phần có vai trò rõ ràng trong việc chứng minh tính khả thi và cần thiết của dự án.

---

## Cấu trúc chuẩn tài liệu TKCS

### PHẦN I: GIỚI THIỆU NỘI DUNG THIẾT KẾ CƠ SỞ

Phần này xác lập ngữ cảnh pháp lý và hành chính của dự án. Viết ngắn gọn, chính xác.

**Bắt buộc gồm 14 mục:**

```
I.1.  Tên hạng mục
I.2.  Mục (nhóm lĩnh vực chuyên ngành)
I.3.  Tiểu mục (lĩnh vực cụ thể)
I.4.  Thuộc dự án (tên dự án mẹ)
I.5.  Chủ đầu tư
I.6.  Cơ quan chủ quản chủ đầu tư
I.7.  Tổng mức đầu tư
I.8.  Thời gian thực hiện dự án
I.9.  Địa điểm thực hiện dự án
I.10. Nguồn vốn đầu tư
I.11. Đơn vị tư vấn khảo sát, lập dự án
I.12. Tóm tắt nhiệm vụ
I.13. Phạm vi
I.14. Yêu cầu dự án
```

**Lưu ý quan trọng:**
- I.12 (Tóm tắt nhiệm vụ): Viết 2-3 câu mô tả mục tiêu tổng thể, nhấn mạnh "tập trung, liên thông, phục vụ quản lý điều hành dựa trên dữ liệu"
- I.13 (Phạm vi): Liệt kê rõ các nhóm CSDL/module nghiệp vụ, phạm vi địa lý, đối tượng. Kết thúc bằng câu về tiêu chí dữ liệu "đúng – đủ – sạch – sống – thống nhất – dùng chung"
- I.14 (Yêu cầu): 3 đoạn: (1) yêu cầu chức năng, (2) kế thừa hệ thống hiện có, (3) tuân thủ tiêu chuẩn + ATTT

---

### PHẦN II: HIỆN TRẠNG

Phần này phân tích thực trạng để chứng minh sự cần thiết đầu tư. Cần khảo sát thực tế, không viết chung chung.

**Gồm 6 mục:**

```
II.1. Hiện trạng về nghiệp vụ
II.2. Hiện trạng về ứng dụng CNTT
II.3. Hiện trạng về dữ liệu (chi tiết từng CSDL)
II.4. Hiện trạng hạ tầng kỹ thuật
II.5. Hiện trạng tích hợp, kết nối, chia sẻ dữ liệu
II.6. Đánh giá hiện trạng
```

**Cách viết hiệu quả:**
- II.1: Liệt kê nghiệp vụ chính → nêu 5-7 hạn chế cụ thể (quy trình phức tạp, phụ thuộc giấy, thiếu liên thông...)
- II.2: Liệt kê từng hệ thống CNTT hiện có, mô tả chức năng, hạn chế. Kết thúc bằng "*(Chi tiết xem Phụ lục 02)*"
- II.3: Viết MỖI CSDL thành 1 mục con riêng (II.3.1, II.3.2...). Mỗi mục: hiện trạng dữ liệu → hạn chế → kết luận "chưa đáp ứng yêu cầu chuyển đổi số"
- II.4: Chia thành hạ tầng cấp Bộ (II.4.1) và hạ tầng cấp Cục (II.4.2). Nếu dùng chung → ghi rõ
- II.5: Nêu 5-6 hạn chế về tích hợp (thiếu nền tảng trung gian, chuẩn dữ liệu không thống nhất, cục bộ...)
- II.6: Tổng kết → kết luận "việc xây dựng CSDL mới theo hướng tập trung... là yêu cầu hết sức cấp thiết"

---

### PHẦN III: CÁC YÊU CẦU KỸ THUẬT CẦN ĐÁP ỨNG

Phần kỹ thuật cốt lõi, chứa kiến trúc hệ thống và giải pháp công nghệ.

**Gồm 4 nhóm chính:**

#### III.1. Yêu cầu tuân thủ Khung kiến trúc
Tham chiếu đến BCNCKT của dự án.

#### III.2. Quy chuẩn kỹ thuật, tiêu chuẩn áp dụng

```
III.2.1. Tiêu chí chung (10-12 tiêu chí: công nghệ mở, mở rộng, ổn định, bảo mật...)
III.2.2. Tiêu chí cụ thể (7 mục: kiến trúc chuẩn, tính mở, đáp ứng cao, sẵn sàng, mô đun hóa, quản trị, an ninh)
III.2.3. Quy chuẩn áp dụng (TT 39/2017, NĐ 45/2026, TT 16/2024, QĐ ngành...)
III.2.4. Nguyên tắc kết nối chia sẻ dữ liệu (NĐ 278/2025: bắt buộc, thống nhất, sẵn sàng)
```

#### III.3. Phân tích phương án công nghệ

```
III.3.1. Phân tích giải pháp (tham chiếu BCNCKT)
III.3.2. Phương án kỹ thuật, thiết bị, ATTT
III.3.3. Phương án kết nối, liên thông — QUAN TRỌNG:
    - Liệt kê hệ thống cần kết nối (SSO, VNeID, TTHC, LGSP, NDXP, TTDLQG...)
    - Phân tích 2 phương án: File-based vs API-led Connectivity
    - Mỗi phương án: sơ đồ + đặc điểm + hạn chế/ưu điểm
    - Kết luận chọn API-led (REST, OAuth2, Zipkin)
III.3.4. Yêu cầu IPv6 (5 điểm: kiến trúc, giao tiếp, dual-stack, lưu trữ địa chỉ, bảo mật)
```

#### III.4. Kiến trúc tổng thể hệ thống — 7 mô hình

Đây là phần quan trọng nhất của TKCS. Mỗi mô hình cần có **sơ đồ (Hình) + thuyết minh chi tiết**.

```
III.4.1. Mô hình kiến trúc nghiệp vụ (BRM)
    - Sơ đồ nhóm nghiệp vụ
    - Bảng ánh xạ BRM ↔ Module ↔ DRM
    
III.4.2. Mô hình kiến trúc dữ liệu (DRM)
    - 6 tầng dữ liệu theo QĐ 2439: Nguồn → Thô → Chủ → Giao dịch → Chia sẻ → Phân tích
    - Lớp điều phối (LGSP/NDXP/TTDLQG)
    - Lớp quản trị xuyên suốt (Metadata, Data Quality, ATTT)

III.4.3. Mô hình kiến trúc ứng dụng
    - 4 lớp: Kênh tương tác → Dịch vụ/Tích hợp → Lưu trữ → Tích hợp ngoài
    
III.4.4. Mô hình kiến trúc hạ tầng công nghệ
    - Data Center, Compute, Storage, Network, Security, DR
    
III.4.5. Mô hình logic (Container Diagram C4)
    - System Boundary, Frontend, API Gateway, Core Services, Data Stores, External
    
III.4.6. Mô hình triển khai
    - Site chính + site dự phòng
    - Bảng sizing hạ tầng tối thiểu (vCPU/RAM/Storage)
    
III.4.7. Yêu cầu ATTT
    - Đề xuất cấp độ (thường Cấp độ 3 cho hệ thống quốc gia)
    - Bảng giải pháp ATTT (12+ giải pháp: AntiDDoS, Firewall, WAF, SIEM, VPN, PAM...)
    - Phân vùng mạng (VLAN APP/DB/DMZ/MGMT)
```

---

### PHẦN IV: NỘI DUNG THIẾT KẾ CƠ SỞ

Phần này chiếm phần lớn tài liệu. Gồm 3 khối lớn:

#### IV.1. Thiết kế phần mềm và nền tảng

```
IV.1.1. Quy trình nghiệp vụ
    - Bảng "Danh mục quy trình nghiệp vụ" tổng hợp tất cả CSDL
    - Với MỖI CSDL/Module: 1 lưu đồ (Flowchart) + 1 bảng mô tả bước

    Bảng mô tả bước nghiệp vụ theo format:
    | Bước | Tên bước | Chủ thể | Diễn giải chi tiết |
    
IV.1.2. Danh sách yêu cầu người dùng
    - Bảng UC với các cột: STT, Yêu cầu chức năng, Mô tả, Số giao dịch, GIS, Giao diện
    - Phân nhóm theo Module/CSDL
    
IV.1.3. Yêu cầu phi chức năng (10 nhóm):
    1. Yêu cầu CSDL (6 điểm)
    2. Yêu cầu ATTT & ANMM (4 nhóm: xác thực, kiểm soát, nhật ký, mã nguồn)
    3. Thời gian xử lý (VD: "không quá 1 phút")
    4. Số người dùng đồng thời, thời gian lưu trữ
    5. Yêu cầu cài đặt, hạ tầng
    6. Ràng buộc hệ thống (ngôn ngữ, DBMS)
    7. IPv6
    8. Chịu lỗi (fault tolerance)
    9. Mỹ thuật giao diện (Unicode, resolution)
    10. Năng lực cán bộ (7 nhóm đối tượng)

IV.1.4. Đối tượng tham gia hệ thống
    - Bảng Actor: STT, Đối tượng, Vai trò, Mức độ phức tạp

IV.1.5. Quy trình thực hiện
    - Bảng 15 bước: Khảo sát → Phân tích → Thiết kế → Lập trình → Test → Triển khai → Đào tạo

IV.1.6. Sản phẩm
    - Sản phẩm trung gian (báo cáo khảo sát, đặc tả, test case)
    - Sản phẩm chính (phần mềm, tài liệu HDSD, biên bản nghiệm thu)
```

#### IV.2. Thiết kế các CSDL chuyên ngành

Viết chi tiết cho MỖI CSDL, mỗi CSDL gồm 4 phần:

```
IV.2.X. Tên CSDL

a) Nội dung CSDL:
   - Tên, phạm vi thời gian, không gian

b) Nguồn dữ liệu:
   - Mô tả hiện trạng + cơ quan quản lý
   - Bảng khối lượng dữ liệu:
     | STT | Nội dung | Đơn vị | Số lượng | Cách thức (chuyển đổi/nhập mới) |

c) Quy trình thực hiện:
   - Thu thập → Chuẩn hóa → Tích hợp → Khai thác

d) Sản phẩm:
   - Trung gian + Chính + Yêu cầu kỹ thuật
```

#### IV.3. Đào tạo, tập huấn

```
IV.3.1. Phương pháp đào tạo
IV.3.2. Hình thức (trực tiếp + trực tuyến)
IV.3.3. Nội dung đào tạo (2-3 nhóm)
IV.3.4. Đối tượng đào tạo
IV.3.5. Địa điểm
IV.3.6. Số lượng lớp — Bảng chi tiết (VD: 19-23 lớp)
```

---

### PHẦN V: DỰ KIẾN TỔNG MỨC ĐẦU TƯ

```
V.1. Căn cứ lập tổng mức đầu tư
    - Liệt kê 8-10 văn bản pháp lý (NĐ 45/2026, NĐ 254/2025, TT 18/2024, QĐ 1688, QĐ 320...)

V.2. Dự toán
    - Bảng tổng hợp 5 nhóm chi phí:
      | STT | Nội dung | Trước thuế | VAT | Sau thuế | Căn cứ |
      | I   | Xây dựng phần mềm | | | | NĐ 45 |
      | II  | Triển khai, cài đặt | | | | |
      | III | Đào tạo, chuyển giao | | | | |
      | IV  | Dịch vụ (Pentest) | | | | |
      | V   | Bảo trì 12 tháng | | | | |
    
    - Chi tiết từng mục (Phụ lục 01)
```

---

### PHỤ LỤC 01: DỰ TOÁN SƠ BỘ

Chi tiết tính toán:
- Chi phí phần mềm (số giao dịch × đơn giá TT 18/2024)
- Chi phí tạo lập CSDL, số hóa
- Chi phí đào tạo (chi tiết/lớp: giảng viên, giáo trình, thuê phòng, thiết bị, đi lại)

### PHỤ LỤC 02: DỮ LIỆU KHẢO SÁT

```
- Hiện trạng hạ tầng CNTT tại Bộ (3 TTDL: trụ sở Bộ, Cục CĐS, Chi cục phía Nam)
- Sơ đồ mô hình kết nối mạng
- Bảng thống kê năng lực tính toán (vCPU, RAM, Storage, % sử dụng)
- Thống kê phần mềm, ứng dụng hiện có
- Thống kê dữ liệu hiện có
```

---

## Danh mục Bảng biểu tiêu chuẩn

Một TKCS hoàn chỉnh thường có 25-27 bảng:

| # | Tên bảng | Vị trí |
|---|---|---|
| 1 | Bảng thông số sizing hạ tầng tối thiểu | III.4.6 |
| 2 | Danh mục quy trình nghiệp vụ | IV.1.1 |
| 3-9 | Quy trình nghiệp vụ từng CSDL (1 bảng/CSDL) | IV.1.1 |
| 10 | Danh sách yêu cầu người dùng (UC) | IV.1.2 |
| 11 | Đối tượng tham gia hệ thống | IV.1.4 |
| 12 | Quy trình xây dựng hệ thống | IV.1.5 |
| 13-19 | Khối lượng dữ liệu từng CSDL (1 bảng/CSDL) | IV.2.X |
| 20 | Dự kiến số lượng lớp đào tạo | IV.3.6 |
| 21 | Tổng hợp dự toán sơ bộ | V.2 |
| 22-24 | Chi tiết chi phí (PM, CSDL, Đào tạo) | PL01 |
| 25-27 | Năng lực hạ tầng (3 TTDL) | PL02 |

## Danh mục Hình vẽ tiêu chuẩn

| # | Tên hình | Vị trí |
|---|---|---|
| 1-2 | Phương án kết nối (File vs API) | III.3.3 |
| 3 | Mô hình kiến trúc tổng thể | III.4 |
| 4 | Mô hình kiến trúc nghiệp vụ (BRM) | III.4.1 |
| 5 | Mô hình kiến trúc dữ liệu (DRM) | III.4.2 |
| 6 | Mô hình kiến trúc ứng dụng | III.4.3 |
| 7 | Mô hình kiến trúc hạ tầng | III.4.4 |
| 8 | Mô hình logic C4 | III.4.5 |
| 9 | Mô hình triển khai | III.4.6 |
| 10-16 | Lưu đồ nghiệp vụ từng CSDL | IV.1.1 |
| 17-18 | Sơ đồ mạng hạ tầng (PL02) | PL02 |

---

## Quy tắc viết

### Văn phong
- Sử dụng văn phong hành chính, trang trọng, khách quan
- Tránh dùng từ cảm tính ("rất tốt", "tuyệt vời"). Dùng ngôn ngữ định lượng ("đáp ứng 99.5% SLA")
- Mỗi đoạn mô tả hạn chế kết thúc bằng: "chưa đáp ứng yêu cầu chuyển đổi số" hoặc tương đương

### Tham chiếu pháp lý
- Luôn ghi đầy đủ: Số văn bản + Ngày + Cơ quan ban hành + Tên văn bản
- VD: "Nghị định số 278/2025/NĐ-CP ngày 22/10/2025 của Chính phủ quy định về kết nối, chia sẻ dữ liệu"

### Bảng biểu
- Mỗi bảng phải có **tiêu đề** (Bảng X. Tên bảng)
- Mỗi hình phải có **chú thích** (Hình X. Tên hình)
- Đánh số liên tục xuyên suốt tài liệu

### Thuật ngữ viết tắt
- Lần đầu xuất hiện: viết đầy đủ + viết tắt trong ngoặc
- Có bảng DANH MỤC THUẬT NGỮ VIẾT TẮT ở đầu tài liệu

### Các cụm từ khóa bắt buộc
Tài liệu TKCS cấp chính phủ cần nhắc đến:
- "đúng – đủ – sạch – sống – thống nhất – dùng chung" (tiêu chí dữ liệu)
- "tập trung, liên thông, phục vụ quản lý điều hành dựa trên dữ liệu"
- "kế thừa, tận dụng tối đa các hệ thống... tránh trùng lặp, lãng phí"
- "an toàn, an ninh thông tin cấp độ 3"
- "khả năng mở rộng, nâng cấp và tích hợp trong dài hạn"

---

## Checklist kiểm tra TKCS

Sử dụng checklist này để kiểm tra tính đầy đủ:

- [ ] Phần I: 14 mục đầy đủ (I.1→I.14)
- [ ] Phần II: 6 mục hiện trạng, mỗi CSDL có mục con riêng
- [ ] Phần III: 7 mô hình kiến trúc có sơ đồ + thuyết minh
- [ ] Phần III: Bảng sizing hạ tầng (vCPU/RAM/Storage)
- [ ] Phần III: Đề xuất cấp độ ATTT + bảng giải pháp
- [ ] Phần III: Phương án kết nối (2 PA + kết luận)
- [ ] Phần III: IPv6 (5 điểm)
- [ ] Phần IV: Bảng danh mục quy trình nghiệp vụ tổng hợp
- [ ] Phần IV: Lưu đồ + bảng mô tả bước cho MỖI CSDL
- [ ] Phần IV: Bảng UC với cột "Số giao dịch"
- [ ] Phần IV: 10 nhóm yêu cầu phi chức năng (không có placeholder XXX)
- [ ] Phần IV: Bảng Actor
- [ ] Phần IV: Quy trình 15 bước xây dựng
- [ ] Phần IV: Sản phẩm (trung gian + chính)
- [ ] Phần IV: Thiết kế chi tiết MỖI CSDL (4 phần: nội dung, nguồn, quy trình, sản phẩm)
- [ ] Phần IV: Đào tạo (6 mục + bảng số lớp)
- [ ] Phần V: Căn cứ pháp lý + Bảng tổng hợp dự toán
- [ ] Phụ lục 01: Dự toán chi tiết
- [ ] Phụ lục 02: Dữ liệu khảo sát hạ tầng
- [ ] Danh mục thuật ngữ viết tắt
- [ ] Danh mục hình vẽ
- [ ] Danh mục bảng biểu
- [ ] Mục lục
