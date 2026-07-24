import React, { useState, useEffect, useRef } from 'react';
import { Button } from './UI';
import { ArrowLeft, Save, FileSpreadsheet, ArrowRight, ShieldCheck, RefreshCw, Search } from 'lucide-react';

import kpiRules from './NetzeroGRI_KPI_Rules.json';

const GOV_INDICATOR_MAPPINGS: Record<string, {
  code: string;
  nameVi: string;
  nameEn: string;
  status: 'Yes' | 'No';
  questionVi: string;
  questionEn: string;
  mainPointsVi: string;
  mainPointsEn: string;
  defaultVnaTextVi: string;
  defaultVnaTextEn: string;
}> = {
  "GRI 2-9": {
    code: "GRI 2-9",
    nameVi: "Cơ cấu và thành phần quản trị",
    nameEn: "Governance structure and composition",
    status: "Yes",
    questionVi: "Doanh nghiệp có công bố sơ đồ cơ cấu quản trị, danh sách các Ủy ban thuộc HĐQT và thông tin thành phần HĐQT theo tiêu chuẩn GRI không?",
    questionEn: "Does the organization disclose its governance structure, composition of the Board and its committees, and board membership profile according to GRI standards?",
    mainPointsVi: "- Sơ đồ cơ cấu quản trị\n- Danh sách các Ủy ban thuộc HĐQT\n- Bảng thành phần HĐQT và từng Ủy ban theo 8 tiêu chí bắt buộc của GRI (thành viên điều hành/độc lập, nhiệm kỳ, giới tính...)",
    mainPointsEn: "- Governance structure diagram\n- List of committees of the Board of Directors\n- Composition of the Board and its committees based on the 8 mandatory GRI criteria (executive/non-executive, independence, tenure, gender, etc.)",
    defaultVnaTextVi: "Cơ cấu quản trị của Vietnam Airlines gồm ĐHĐCĐ, HĐQT, Ban Kiểm soát và TGĐ cùng bộ máy điều hành.\n\nHĐQT thành lập 02 tiểu ban: Tiểu ban Chiến lược và đầu tư; Tiểu ban Lao động và Tiền lương.\n\nThành phần Hội đồng quản trị: 07 thành viên, gồm 01 thành viên độc lập, thành viên người đại diện phần vốn nhà nước và đại diện ANA.",
    defaultVnaTextEn: "The governance structure of Vietnam Airlines consists of the General Meeting of Shareholders, the Board of Directors, the Supervisory Board, and the President & CEO along with the executive management team.\n\nThe Board of Directors established two subcommittees: the Strategy and Investment Subcommittee and the Labor and Compensation Subcommittee.\n\nComposition of the Board of Directors: 07 members, including 01 independent member, representatives of state capital, and a representative from ANA."
  },
  "GRI 2-10": {
    code: "GRI 2-10",
    nameVi: "Quy trình đề cử, lựa chọn cơ quan quản lý cao nhất",
    nameEn: "Nomination and selection of the highest governance body",
    status: "Yes",
    questionVi: "Doanh nghiệp có quy trình đề cử, lựa chọn thành viên HĐQT, thành viên các tiểu ban và tiêu chí lựa chọn liên quan đến tính độc lập, đa dạng, năng lực ESG không?",
    questionEn: "Does the organization have a process and criteria for nominating and selecting Board members and subcommittees, taking into account independence, diversity, and ESG competency?",
    mainPointsVi: "- Quy trình đề cử, lựa chọn thành viên HĐQT và các tiểu ban\n- Tiêu chí lựa chọn có xét đến ý kiến của các bên liên quan, tính đa dạng, tính độc lập, và năng lực phát triển bền vững.",
    mainPointsEn: "- Nomination and selection process for members of the Board and its subcommittees\n- Selection criteria considering stakeholder feedback, diversity, independence, and sustainability competencies.",
    defaultVnaTextVi: "Thành viên HĐQT Vietnam Airlines do ĐHĐCĐ bầu theo phương thức bầu dồn phiếu. Quyền đề cử ứng viên được thực hiện theo tỷ lệ sở hữu cổ phần; việc giới thiệu người đại diện phần vốn nhà nước thực hiện theo quy định pháp luật.\n\nTrong quá trình đề cử và lựa chọn, TCT xem xét: ý kiến của cổ đông và các bên liên quan, tính độc lập của thành viên và năng lực phù hợp ngành.",
    defaultVnaTextEn: "Members of the Board of Directors of Vietnam Airlines are elected by the General Meeting of Shareholders using the cumulative voting method. The right to nominate candidates is exercised based on share ownership ratio; the nomination of state capital representatives is carried out in accordance with regulations.\n\nDuring nomination and selection, the Corporation considers: feedback from shareholders and stakeholders, independence of members in compliance with regulations, and industry-specific expertise."
  },
  "GRI 2-11": {
    code: "GRI 2-11",
    nameVi: "Chủ tịch cơ quan quản lý cao nhất",
    nameEn: "Chair of the highest governance body",
    status: "Yes",
    questionVi: "Chủ tịch HĐQT của doanh nghiệp có đồng thời là cán bộ điều hành cấp cao (kiêm nhiệm CEO) hay không?",
    questionEn: "Is the Chair of the Board of Directors also an executive officer (CEO) within the organization?",
    mainPointsVi: "- Nêu rõ Chủ tịch HĐQT có đồng thời là cán bộ điều hành cấp cao của TCT hay không.\n- Mô tả chức năng điều hành, lý do báo trí và cách ngăn ngừa xung đột lợi ích nếu có kiêm nhiệm.",
    mainPointsEn: "- State clearly whether the Chair of the Board is also a senior executive officer.\n- Describe executive functions, rationale, and conflict of interest mitigation if they hold both positions.",
    defaultVnaTextVi: "Chủ tịch HĐQT Vietnam Airlines là ông Đặng Ngọc Hòa. Chủ tịch HĐQT không đồng thời là cán bộ điều hành cấp cao của TCT: chức danh Tổng giám đốc - người điều hành hoạt động hằng ngày - do ông Lê Hồng Hà đảm nhiệm.",
    defaultVnaTextEn: "The Chairman of the Board of Directors of Vietnam Airlines is Mr. Dang Ngoc Hoa. The Chairman of the Board does not concurrently serve as a senior executive officer of the Corporation: the position of President & CEO is held by Mr. Le Hong Ha."
  },
  "GRI 2-12": {
    code: "GRI 2-12",
    nameVi: "Vai trò của cơ quan quản lý cao nhất trong việc giám sát quản lý các tác động",
    nameEn: "Role of the highest governance body in overseeing the management of impacts",
    status: "Yes",
    questionVi: "Hội đồng quản trị có trực tiếp tham gia giám sát các quy trình thẩm định chi tiết và rà soát hiệu quả quản lý tác động kinh tế, môi trường, con người (ESG) không?",
    questionEn: "Does the Board of Directors directly oversee due diligence and review the effectiveness of managing economic, environmental, and social impacts (ESG)?",
    mainPointsVi: "- Vai trò của HĐQT trong việc xây dựng, phê duyệt tầm nhìn/sứ mệnh/chiến lược PTBV.\n- Vai trò giám sát nhận diện và quản lý tác động ESG.\n- Tần suất rà soát tính hiệu quả của các quy trình.",
    mainPointsEn: "- Role of the Board in developing and approving vision/mission/sustainability strategy.\n- Board's role in overseeing the identification and management of ESG impacts.\n- Frequency of reviewing the effectiveness of these processes.",
    defaultVnaTextVi: "HĐQT là cơ quan quản lý cao nhất của Vietnam Airlines giữ vai trò định hướng và giám sát toàn diện đối với phát triển bền vững. Ban điều hành Chương trình PTBV do Tổng giám đốc làm Trưởng ban chịu trách nhiệm xây dựng các mục tiêu báo cáo trình HĐQT.",
    defaultVnaTextEn: "The Board of Directors is the highest governing body of Vietnam Airlines, guiding and supervising sustainability. The Sustainability Steering Committee, chaired by the President & CEO, is responsible for developing objectives and reporting to the Board."
  },
  "GRI 2-13": {
    code: "GRI 2-13",
    nameVi: "Ủy quyền chịu trách nhiệm quản lý các tác động của tổ chức",
    nameEn: "Delegation of responsibility for managing impacts",
    status: "Yes",
    questionVi: "Hội đồng quản trị có bổ nhiệm phân cấp trách nhiệm quản lý tác động ESG cho Ban điều hành và các cấp thực thi dưới quyền không?",
    questionEn: "Does the Board delegate responsibility for managing ESG impacts to the executive management and lower operational levels?",
    mainPointsVi: "- Cách HĐQT phân cấp trách nhiệm quản lý tác động ESG cho cán bộ điều hành cấp cao và người lao động.\n- Quy trình báo cáo ngược lên HĐQT về quản lý tác động.",
    mainPointsEn: "- Board's delegation of responsibility for managing ESG impacts to senior executives and other employees.\n- Process for reporting back to the Board on impact management.",
    defaultVnaTextVi: "HĐQT phân cấp trách nhiệm quản lý các tác động cho Tổng giám đốc và bộ máy điều hành. Ban điều hành Chương trình PTBV là đầu mối cao nhất chịu trách nhiệm điều hành công tác PTBV của TCT. Ban điều hành tổng hợp và báo cáo HĐQT định kỳ.",
    defaultVnaTextEn: "The Board delegates responsibility for managing impacts to the President & CEO and executive management. The Sustainability Steering Committee acts as the highest executive body overseeing sustainability, consolidating reports to submit to the Board periodically."
  },
  "GRI 2-14": {
    code: "GRI 2-14",
    nameVi: "Vai trò của cơ quan quản trị cao nhất trong báo cáo phát triển bền vững",
    nameEn: "Role of the highest governance body in sustainability reporting",
    status: "Yes",
    questionVi: "Hội đồng quản trị có chịu trách nhiệm rà soát và phê duyệt các thông tin công bố trong Báo cáo phát triển bền vững (bao gồm danh mục các chủ đề trọng yếu) không?",
    questionEn: "Is the Board of Directors responsible for reviewing and approving the information disclosed in the sustainability report, including material topics?",
    mainPointsVi: "- HĐQT chịu trách nhiệm rà soát và phê duyệt thông tin công bố trong Báo cáo PTBV.\n- Mô tả quy trình rà soát và phê duyệt của HĐQT.",
    mainPointsEn: "- Board's responsibility to review and approve sustainability disclosure.\n- Describe the Board's review and approval workflow.",
    defaultVnaTextVi: "HĐQT chịu trách nhiệm rà soát và phê duyệt các thông tin công bố trong Báo cáo thường niên, bao gồm nội dung báo cáo PTBV. Quy trình bao gồm: Tổ công tác tổng hợp số liệu xây dựng dự thảo báo cáo, gửi báo cáo thường niên lên HĐQT xem xét phê duyệt trước khi công bố.",
    defaultVnaTextEn: "The Board is responsible for reviewing and approving the Annual Report, which includes sustainability details. The process: the Sustainability Working Group compiles data, drafts the report, and submits it to the Board for approval prior to publication."
  },
  "GRI 2-15": {
    code: "GRI 2-15",
    nameVi: "Xung đột lợi ích",
    nameEn: "Conflicts of interest",
    status: "Yes",
    questionVi: "Doanh nghiệp có quy trình ngăn ngừa, giảm thiểu và công bố các mối quan hệ kiêm nhiệm chéo, sở hữu chéo, hoặc giao dịch bên liên quan để tránh xung đột lợi ích không?",
    questionEn: "Does the organization have processes to prevent, mitigate, and disclose cross-board memberships, cross-ownerships, or related-party transactions to avoid conflicts of interest?",
    mainPointsVi: "- Quy trình HĐQT ngăn ngừa và giảm thiểu xung đột lợi ích.\n- Báo cáo về kiêm nhiệm chéo trong HĐQT, sở hữu chéo với nhà cung cấp, sự hiện diện của cổ đông chi phối và các giao dịch bên liên quan.",
    mainPointsEn: "- Board's processes to prevent and mitigate conflicts of interest.\n- Disclosures regarding cross-memberships, cross-ownership, controlling shareholders, and related-party transactions.",
    defaultVnaTextVi: "Điều lệ TCT quy định rõ trách nhiệm tránh xung đột quyền lợi. Cổ đông chi phối là Nhà nước (86,42% vốn điều lệ). Các kiêm nhiệm chéo của thành viên HĐQT và giao dịch với các bên liên quan được thuyết minh đầy đủ trong Báo cáo tài chính đã kiểm toán hàng năm.",
    defaultVnaTextEn: "The Corporate Charter defines duties to avoid conflicts of interest. The state is the controlling shareholder (86.42% of charter capital). Cross-board memberships and related-party transactions are fully disclosed in the audited annual financial statements."
  },
  "GRI 2-16": {
    code: "GRI 2-16",
    nameVi: "Truyền đạt các mối quan ngại nghiêm trọng",
    nameEn: "Communication of critical concerns",
    status: "Yes",
    questionVi: "Doanh nghiệp có cơ chế và quy trình để truyền đạt các mối quan ngại nghiêm trọng (về vận hành hoặc hành vi kinh doanh) lên Hội đồng quản trị không?",
    questionEn: "Does the organization have mechanisms and processes to communicate critical concerns (operational or behavioral) to the Board of Directors?",
    mainPointsVi: "- Mô tả mối quan ngại nghiêm trọng và cơ chế báo cáo lên HĐQT.\n- Tổng số và tính chất của các mối quan ngại nghiêm trọng đã được báo cáo trong kỳ.",
    mainPointsEn: "- Description of critical concerns and mechanisms for reporting to the Board.\n- Total number and nature of critical concerns reported during the period.",
    defaultVnaTextVi: "Các mối quan ngại nghiêm trọng được xác định là các tác động tiêu cực đáng kể đối với hoạt động kinh doanh hoặc quyền lợi bên liên quan. Quy trình báo cáo được thực hiện thông qua hệ thống kiểm toán nội bộ độc lập và Ban Kiểm soát báo cáo trực tiếp tại ĐHĐCĐ.",
    defaultVnaTextEn: "Critical concerns are defined as significant negative impacts on operations or stakeholder interests. Reporting is routed via the internal audit team, with independent oversight by the Supervisory Board reporting to the GSM."
  },
  "GRI 2-17": {
    code: "GRI 2-17",
    nameVi: "Kiến thức tập thể của cơ quan quản lý cao nhất",
    nameEn: "Collective knowledge of the highest governance body",
    status: "Yes",
    questionVi: "Doanh nghiệp có thực hiện các chương trình đào tạo để nâng cao kiến thức, kỹ năng và kinh nghiệm tập thể của HĐQT về phát triển bền vững không?",
    questionEn: "Does the organization implement programs to enhance the collective knowledge, skills, and experience of the Board on sustainability?",
    mainPointsVi: "- Các biện pháp đã thực hiện để nâng cao kiến thức, kỹ năng và kinh nghiệm tập thể của HĐQT về phát triển bền vững.",
    mainPointsEn: "- Actions taken to advance the collective knowledge, skills, and experience of the Board of Directors on sustainability issues.",
    defaultVnaTextVi: "Vietnam Airlines chú trọng nâng cao năng lực về PTBV cho đội ngũ quản trị và điều hành. Ban điều hành Chương trình PTBV đã hoàn thành chương trình đào tạo chuyên sâu do chuyên gia tư vấn độc lập thực hiện và đang xây dựng kế hoạch triển khai cho HĐQT.",
    defaultVnaTextEn: "Vietnam Airlines emphasizes building sustainability capacity for governance and management teams. The Sustainability Steering Committee completed professional training led by independent advisors, with a rollout plan for the Board in progress."
  },
  "GRI 2-18": {
    code: "GRI 2-18",
    nameVi: "Đánh giá hiệu quả hoạt động của cơ quan quản lý cao nhất",
    nameEn: "Evaluation of performance of the highest governance body",
    status: "Yes",
    questionVi: "Doanh nghiệp có quy trình đánh giá hiệu quả hoạt động của HĐQT trong việc giám sát và quản lý các tác động ESG không?",
    questionEn: "Does the organization have a process to evaluate the Board's performance in overseeing the management of ESG impacts?",
    mainPointsVi: "- Quy trình đánh giá hiệu quả hoạt động của HĐQT trong giám sát quản lý tác động ESG.\n- Phương pháp đánh giá (độc lập hay tự đánh giá), tần suất, và hành động sau đánh giá.",
    mainPointsEn: "- Evaluation process for the Board's performance in managing ESG impacts.\n- Evaluation methodology (independent or self-assessment), frequency, and subsequent actions.",
    defaultVnaTextVi: "Ban Kiểm soát thực hiện đánh giá độc lập hiệu quả hoạt động của Hội đồng quản trị hàng năm theo quy chế quản trị công ty đại chúng và báo cáo kết quả tại ĐHĐCĐ thường niên.",
    defaultVnaTextEn: "The Supervisory Board conducts an independent annual performance assessment of the Board of Directors in compliance with corporate governance regulations, presenting results at the Annual General Meeting."
  },
  "GRI 2-23": {
    code: "GRI 2-23",
    nameVi: "Các cam kết về chính sách",
    nameEn: "Policy commitments",
    status: "Yes",
    questionVi: "Doanh nghiệp có ban hành bằng văn bản các cam kết chính sách về ứng xử kinh doanh có trách nhiệm và tôn trọng quyền con người không?",
    questionEn: "Does the organization have written policy commitments for responsible business conduct and human rights respect?",
    mainPointsVi: "- Danh mục cam kết chính sách, các văn kiện tham chiếu, yêu cầu thẩm định và nguyên tắc phòng ngừa.\n- Cam kết riêng về tôn trọng quyền con người.\n- Đường dẫn công bố công khai, cấp phê duyệt và phạm vi áp dụng.",
    mainPointsEn: "- List of policy commitments, reference conventions, due diligence requirements, and the precautionary principle.\n- Specific commitment to human rights.\n- Public links, approval authority, and scope of application.",
    defaultVnaTextVi: "Vietnam Airlines thiết lập hệ thống cam kết chính sách bao gồm: Chương trình phòng chống tham nhũng lãng phí, Bộ Quy tắc ứng xử và văn hóa chính trực, Quy chế bảo vệ môi trường, và Chính sách An toàn thuộc SMSM được phê duyệt bởi cấp thẩm quyền cao nhất.",
    defaultVnaTextEn: "Vietnam Airlines has established policy commitments including the Anti-Corruption and Anti-Waste Program, the Code of Conduct, the Environmental Protection Regulations, and the SMSM Safety Policy, approved by the highest authority."
  },
  "GRI 2-24": {
    code: "GRI 2-24",
    nameVi: "Lồng ghép các cam kết chính sách",
    nameEn: "Embedding policy commitments",
    status: "Yes",
    questionVi: "Doanh nghiệp có thực hiện lồng ghép các cam kết chính sách vào toàn bộ hoạt động sản xuất kinh doanh và quan hệ với nhà cung cấp không?",
    questionEn: "Does the organization embed its policy commitments throughout operations and business relationships with suppliers?",
    mainPointsVi: "- Cách phân bổ trách nhiệm thực thi cam kết.\n- Tích hợp cam kết vào chiến lược, chính sách vận hành và quy trình mua sắm, đấu thầu.\n- Chương trình đào tạo và tập huấn thực thi cam kết.",
    mainPointsEn: "- Allocation of responsibility for embedding commitments.\n- Integration of commitments into strategy, operations, and procurement/tendering.\n- Training programs on implementing commitments.",
    defaultVnaTextVi: "Các cam kết PTBV được cụ thể hóa thành mục tiêu trong kế hoạch sản xuất kinh doanh hàng năm của từng đơn vị. VNA lồng ghép thực thi qua chuỗi cung ứng bằng Bộ quy tắc ứng xử dành cho nhà cung cấp và áp dụng tiêu chí sàng lọc bền vững.",
    defaultVnaTextEn: "Sustainability commitments are integrated into annual business goals across departments. VNA embeds them in supply chain relations through the Supplier Code of Conduct and sustainability screening criteria."
  },
  "GRI 2-25": {
    code: "GRI 2-25",
    nameVi: "Quy trình khắc phục các tác động tiêu cực",
    nameEn: "Processes to remediate negative impacts",
    status: "Yes",
    questionVi: "Doanh nghiệp có cam kết thực hiện hoặc hợp tác khắc phục các tác động tiêu cực do mình gây ra thông qua cơ chế giải quyết khiếu nại không?",
    questionEn: "Does the organization commit to remediating or cooperating in the remediation of negative impacts it causes through grievance mechanisms?",
    mainPointsVi: "- Cam kết khắc phục tác động tiêu cực.\n- Cách tiếp cận giải quyết khiếu nại và các quy trình khắc phục khác.\n- Cách theo dõi tính hiệu quả và sự tham gia của các bên liên quan.",
    mainPointsEn: "- Commitment to remediating negative impacts.\n- Approach to handling grievances and other remediation processes.\n- Tracking effectiveness and stakeholder involvement.",
    defaultVnaTextVi: "Vietnam Airlines cam kết thực hiện hoặc hợp tác khắc phục các tác động tiêu cực mà Tổng công ty gây ra hoặc góp phần gây ra đối với các bên liên quan trên cơ sở tuân thủ pháp luật. Kênh khiếu nại được theo dõi qua Ban Kiểm toán nội bộ.",
    defaultVnaTextEn: "Vietnam Airlines commits to cooperating in the remediation of negative impacts it causes or contributes to. Grievance mechanisms are tracked and evaluated by the Internal Audit department."
  },
  "GRI 2-26": {
    code: "GRI 2-26",
    nameVi: "Cơ chế tìm kiếm lời khuyên và nêu lên mối lo ngại",
    nameEn: "Mechanisms for seeking advice and raising concerns about ethics",
    status: "Yes",
    questionVi: "Doanh nghiệp có thiết lập các kênh tiếp nhận phản ánh quan ngại và bảo vệ người tố cáo khỏi bị trả đũa khi phản ánh trung thực về đạo đức kinh doanh không?",
    questionEn: "Has the organization established channels for raising concerns and protecting whistleblowers from retaliation for ethical reporting?",
    mainPointsVi: "- Cơ chế tư vấn về thực thi chính sách ứng xử kinh doanh có trách nhiệm.\n- Cơ chế phản ánh quan ngại về hành vi vi phạm đạo đức kinh doanh.\n- Quy định bảo mật thông tin và bảo vệ người tố giác.",
    mainPointsEn: "- Mechanisms for seeking advice on responsible conduct policies.\n- Grievance reporting channels for ethical and business concerns.\n- Confidentiality protections and safeguard policies against retaliation.",
    defaultVnaTextVi: "VNA duy trì các kênh tiếp nhận ý kiến tư vấn và phản ánh qua Ban Pháp chế và Thanh tra. Thông tin người tố cáo được bảo mật tuyệt đối theo quy định pháp luật; người tố cáo được bảo vệ toàn diện và không bị trả đũa.",
    defaultVnaTextEn: "VNA maintains channels for advice and reporting via the Legal and Inspectorate departments. Whistleblower identities are fully protected under law, ensuring complete protection from retaliation."
  },
  "GRI 2-27": {
    code: "GRI 2-27",
    nameVi: "Tuân thủ pháp luật và các quy định",
    nameEn: "Compliance with Laws and Regulations",
    status: "No",
    questionVi: "Trong kỳ báo cáo, doanh nghiệp có phát sinh bất kỳ trường hợp không tuân thủ nghiêm trọng nào dẫn đến phạt tiền đáng kể hoặc chế tài phi tiền tệ không?",
    questionEn: "During the reporting period, did the organization face significant non-compliance incidents resulting in monetary fines or non-monetary sanctions?",
    mainPointsVi: "- Tổng số trường hợp không tuân thủ đáng kể phát sinh trong kỳ (phạt tiền, chế tài phi tiền tệ).\n- Tổng số và giá trị các khoản phạt đã nộp.\n- Mô tả chi tiết từng trường hợp không tuân thủ đáng kể.",
    mainPointsEn: "- Total number of significant instances of non-compliance (monetary/non-monetary).\n- Total number and value of fines paid.\n- Detailed description of major non-compliance cases.",
    defaultVnaTextVi: "Vietnam Airlines cam kết duy trì ở mức cao nhất các tiêu chuẩn đạo đức trong hoạt động sản xuất kinh doanh. Trong năm 2025, Tổng công ty không bị phạt tiền đáng kể hoặc áp dụng bất kỳ chế tài hành chính phi tiền tệ nào do không tuân thủ pháp luật.",
    defaultVnaTextEn: "Vietnam Airlines is committed to upholding the highest standards of ethics and compliance. In 2025, the Corporation did not incur any significant fines or non-monetary sanctions for non-compliance with laws."
  },
  "GRI 2-29": {
    code: "GRI 2-29",
    nameVi: "Tiếp cận sự tham gia của các bên liên quan",
    nameEn: "Approach to stakeholder engagement",
    status: "Yes",
    questionVi: "Doanh nghiệp có danh mục đầy đủ các nhóm bên liên quan (khách hàng, nhân viên, cổ đông...) cùng phương pháp và tần suất đối thoại thực chất không?",
    questionEn: "Does the organization maintain a list of stakeholder groups along with methods and frequency for meaningful engagement?",
    mainPointsVi: "- Danh mục các nhóm bên liên quan và phương pháp nhận diện.\n- Mục đích đối thoại với từng nhóm.\n- Các kênh đối thoại chính và cách đảm bảo đối thoại thực chất.",
    mainPointsEn: "- List of stakeholder groups and identification methodology.\n- Purpose of engagement with each group.\n- Primary channels and methods to ensure meaningful dialogue.",
    defaultVnaTextVi: "Vietnam Airlines xác định và đối thoại thường xuyên với các nhóm bên liên quan chính: Cổ đông (qua ĐHĐCĐ), Khách hàng (qua khảo sát và mạng xã hội), Người lao động (qua Hội nghị NLĐ và Công đoàn), Cơ quan quản lý, và Cộng đồng xã hội.",
    defaultVnaTextEn: "Vietnam Airlines identifies and engages with key stakeholders: Shareholders (GSM), Customers (satisfaction surveys, social media), Employees (Labor Union, Conferences), Authorities, and Local Communities."
  },
  "GRI 3-3": {
    code: "GRI 3-3",
    nameVi: "Quản lý các chủ đề trọng yếu",
    nameEn: "Management of material topics",
    status: "Yes",
    questionVi: "Doanh nghiệp có quy trình riêng biệt để xác định, quản lý và báo cáo thuyết minh hiệu quả đối với từng chủ đề trọng yếu về quản trị bền vững không?",
    questionEn: "Does the organization have distinct processes to identify, manage, and report on each material topic related to governance?",
    mainPointsVi: "- Xác định các chủ đề trọng yếu thuộc trụ cột Governance.\n- Công bố chi tiết 6 nội dung (tác động, cam kết, hành động phòng ngừa, theo dõi hiệu quả và đối thoại các bên liên quan) đối với từng chủ đề.",
    mainPointsEn: "- Identify material topics under Governance pillar.\n- Disclose 6 key elements (impacts, commitments, actions, tracking, and stakeholder input) for each material topic.",
    defaultVnaTextVi: "Vietnam Airlines thực hiện DMA (Double Materiality Assessment) hàng nguyên năm để xác định các chủ đề trọng yếu. Các hoạt động quản lý, theo dõi hiệu quả được tích hợp vào kế hoạch hành động và được giám sát bởi Ban chỉ đạo ESG.",
    defaultVnaTextEn: "Vietnam Airlines conducts double materiality assessments annually to identify key ESG topics. Management actions and tracking indicators are embedded in action plans and monitored by the ESG steering committee."
  },
  "GRI 201-4": {
    code: "GRI 201-4",
    nameVi: "Trợ cấp tài chính nhận từ Chính phủ",
    nameEn: "Financial assistance received from government",
    status: "Yes",
    questionVi: "Trong kỳ báo cáo, doanh nghiệp có nhận được bất kỳ hỗ trợ tài chính, miễn giảm thuế, ưu đãi lãi suất vay hay gói cứu trợ nào từ Chính phủ không?",
    questionEn: "Did the organization receive any financial assistance, tax reliefs, subsidized loans, or bailouts from the government during the period?",
    mainPointsVi: "- Tổng giá trị tiền tệ hỗ trợ tài chính nhận từ Chính phủ (miễn giảm thuế, trợ cấp, gói vay lãi suất thấp, tài trợ đầu tư...).\n- Sự hiện diện của Nhà nước trong cơ cấu sở hữu.",
    mainPointsEn: "- Total monetary value of financial assistance received from the government (tax breaks, subsidies, low-interest loans...).\n- State ownership presence.",
    defaultVnaTextVi: "Nhà nước là cổ đông chi phối của VNA, nắm giữ 86,42% vốn điều lệ. Vietnam Airlines triển khai gói giải pháp thanh khoản do ảnh hưởng COVID-19 theo Nghị quyết Quốc hội, bao gồm khoản vay tái cấp vốn 4.000 tỷ đồng lãi suất 0% và phát hành tăng vốn.",
    defaultVnaTextEn: "The state is VNA's controlling shareholder (86.42%). In response to COVID-19 cashflow issues, VNA utilized a 12 trillion VND support package, including a 4 trillion VND interest-free loan and an 8 trillion VND equity issuance."
  },
  "GRI 205-2": {
    code: "GRI 205-2",
    nameVi: "Truyền thông và đào tạo về chính sách phòng chống tham nhũng",
    nameEn: "Communication and training about anti-corruption policies and procedures",
    status: "Yes",
    questionVi: "Doanh nghiệp có thực hiện truyền thông và tổ chức tập huấn bắt buộc về chính sách phòng chống tham nhũng cho các thành viên HĐQT, người lao động và đối tác kinh doanh không?",
    questionEn: "Does the organization communicate anti-corruption policies and conduct mandatory training for Board members, employees, and business partners?",
    mainPointsVi: "- Số lượng và tỷ lệ thành viên cơ quan quản trị, người lao động và đối tác đã được truyền thông về phòng chống tham nhũng.\n- Số lượng và tỷ lệ đã được đào tạo (phân theo khu vực/nhóm).",
    mainPointsEn: "- Number and ratio of board members, staff, and partners communicated on anti-corruption policies.\n- Number and ratio trained, broken down by category and region.",
    defaultVnaTextVi: "Ban lãnh đạo VNA ban hành Chương trình phòng chống tham nhũng tiêu cực, thực hành tiết kiệm. Nội dung chính sách được truyền đạt đến 100% cán bộ, nhân viên toàn hệ thống và tích hợp vào các khóa học e-learning bắt buộc hàng năm.",
    defaultVnaTextEn: "VNA's leadership issued the Anti-Corruption and Anti-Waste Program. The policies are communicated to 100% of staff and integrated into annual mandatory e-learning modules."
  },
  "GRI 205-3": {
    code: "GRI 205-3",
    nameVi: "Sự cố tham nhũng được xác nhận và hành động khắc phục",
    nameEn: "Confirmed incidents of corruption and actions taken",
    status: "No",
    questionVi: "Trong kỳ báo cáo, doanh nghiệp có xảy ra bất kỳ vụ việc hoặc sự cố tham nhũng nào được xác nhận dẫn đến kỷ luật lao động hoặc chấm dứt hợp đồng đối tác không?",
    questionEn: "During the reporting period, were there any confirmed incidents of corruption resulting in disciplinary action or termination of business contracts?",
    mainPointsVi: "- Tổng số và tính chất các sự cố tham nhũng được xác nhận.\n- Số lượng nhân sự bị xử lý kỷ luật/sa thải.\n- Số vụ chấm dứt hợp đồng với đối tác, hoặc vụ việc pháp lý phát sinh.",
    mainPointsEn: "- Total number and nature of confirmed corruption incidents.\n- Number of employees disciplined or dismissed.\n- Number of business contracts terminated, and public legal cases.",
    defaultVnaTextVi: "Trong kỳ báo cáo, không ghi nhận bất kỳ sự cố tham nhũng nào được phát hiện hoặc xác nhận xảy ra tại Vietnam Airlines. Không có nhân viên nào bị kỷ luật hoặc chấm dứt hợp đồng, cũng như không có vụ kiện pháp lý nào liên quan.",
    defaultVnaTextEn: "During the reporting period, no corruption incidents were confirmed at Vietnam Airlines. No staff members were disciplined or terminated, and no related legal cases were initiated."
  },
  "GRI 206-1": {
    code: "GRI 206-1",
    nameVi: "Hành động pháp lý đối với hành vi cạnh tranh không lành mạnh, chống độc quyền",
    nameEn: "Legal actions for anti-competitive behavior, anti-trust, and monopoly practices",
    status: "No",
    questionVi: "Trong kỳ báo cáo, doanh nghiệp có phải đối mặt với bất kỳ hành động pháp lý hay vụ kiện tụng nào liên quan đến hành vi cản trở cạnh tranh hoặc độc quyền không?",
    questionEn: "During the reporting period, did the organization face any legal actions related to anti-competitive behavior or monopoly practices?",
    mainPointsVi: "- Số vụ kiện đang xử lý hoặc hoàn thành trong kỳ liên quan đến hành vi hạn chế cạnh tranh/chống độc quyền.\n- Kết quả chính của các vụ kiện đã hoàn tất.",
    mainPointsEn: "- Number of active or resolved legal cases regarding anti-competitive or monopoly practices.\n- Outcomes and judgments of resolved cases.",
    defaultVnaTextVi: "Không phát sinh bất kỳ khiếu nại, hành động pháp lý hay vụ kiện tụng nào chống lại Vietnam Airlines liên quan đến hành vi cạnh tranh không lành mạnh, chống độc quyền hay độc quyền nhóm trong kỳ báo cáo.",
    defaultVnaTextEn: "No legal actions, antitrust claims, or monopoly-related lawsuits were filed or resolved against Vietnam Airlines during the reporting period."
  },
  "GRI 415-1": {
    code: "GRI 415-1",
    nameVi: "Đóng góp chính trị",
    nameEn: "Political contributions",
    status: "Yes",
    questionVi: "Doanh nghiệp có đóng góp bất kỳ khoản tiền hoặc hiện vật nào cho các đảng phái chính trị, ứng cử viên hoặc chiến dịch vận động chính trị trong kỳ báo cáo không?",
    questionEn: "Did the organization make any political contributions (monetary or in-kind) to political parties, candidates, or campaigns during the period?",
    mainPointsVi: "- Tổng giá trị các khoản đóng góp chính trị trực tiếp và gián tiếp.\n- Phương pháp quy đổi giá trị nếu đóng góp bằng hiện vật.",
    mainPointsEn: "- Total value of direct and indirect political contributions.\n- Valuation method for in-kind contributions.",
    defaultVnaTextEn: "As a national flag carrier, Vietnam Airlines does not make financial or in-kind contributions to political parties or campaigns. The company participates in policy engagement indirectly through trade association dues."
  }
};

interface UnifiedDataEntryFormProps {
  department: string;
  effectivePeriod: string;
  onBack: () => void;
  onSave: () => void;
  isNewPeriod?: boolean;
}

export const UnifiedDataEntryForm: React.FC<UnifiedDataEntryFormProps> = ({
  department,
  effectivePeriod,
  onBack,
  onSave,
  isNewPeriod,
}) => {
  const [activeSec, setActiveSec] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<string>('TAB_1');
  const [activeMainTab, setActiveMainTab] = useState<'DATA' | 'PLAN'>('DATA');
  const [inputLang, setInputLang] = useState<'VI' | 'EN'>('VI');

  useEffect(() => {
    setActiveSubTab('TAB_1');
    setActiveMainTab('DATA'); // Reset main tab khi chuyển chỉ tiêu
  }, [activeSec]);

  // Get indicators for this department from localStorage
  const indicators: string[] = React.useMemo(() => {
    const savedDeptsStr = localStorage.getItem('vna_esg_departments');
    if (savedDeptsStr) {
      try {
        const depts = JSON.parse(savedDeptsStr);
        const matched = depts.find((d: any) => d.name.toLowerCase().trim() === department.toLowerCase().trim());
        if (matched && matched.indicatorIds) {
          return matched.indicatorIds;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallbacks
    const fallback: Record<string, string[]> = {
      'Tổ Khai thác (TTĐHKT)': ["GRI 302-1", "GRI 302-4", "GRI 305-1", "GRI 305-4", "GRI 305-5", "GRI 305-7"],
      'Ban An toàn chất lượng (Ban ATCL)': ["Airline E-1", "9", "GRI 403-2"],
      'Tổ Kỹ thuật (Ban QLVT)': ["4", "5", "13"],
      'Trung tâm Bông Sen Vàng (TTBSV)': ["Airline B-2"],
      'Ban Chuyển đổi số & CNTT': ["GRI 418-1"],
      'Tổ Dịch vụ': ["GRI 303-3", "GRI 303-5", "Airline B-1", "GRI 204-1", "GRI 406-1", "GRI 416-1", "GRI 416-2", "GRI 417-2"],
      'Ban Tổ chức Nhân lực': ["Airline D-1", "Airline F-2", "GRI 202-1", "GRI 202-2", "GRI 403-9", "GRI 401-1", "GRI 401-2"],
      'Ban Kế hoạch Phát triển': ["GRI 2-9", "GRI 2-15", "GRI 2-23", "GRI 205-2", "GRI 205-3", "GRI 206-1", "GRI 415-1"],
      'Ban Truyền thông': ["Airline F-1", "GRI 417-3"],
    };
    return fallback[department] || [];
  }, [department]);

  // Load name and pillar details for each indicator
  const indicatorDetails = React.useMemo(() => {
    const savedInds = localStorage.getItem('vna_esg_indicators');
    let allIndicators: any[] = [];
    if (savedInds) {
      try {
        allIndicators = JSON.parse(savedInds);
      } catch (e) { }
    }
    return indicators.map(id => {
      const found = allIndicators.find(ind => ind.code === id || ind.id === id);
      return {
        code: id,
        displayCode: found ? (found.code === 'Chưa có mã' ? found.name : found.code) : id,
        name: found ? found.name : 'Chỉ tiêu nghiệp vụ',
        pillar: found ? found.pillar : 'E'
      };
    });
  }, [indicators]);

  // Set default active tab and hide parent page headers/tabs when editing
  useEffect(() => {
    if (indicators.length > 0) {
      setActiveSec(indicators[0]);
    }

    // Find parent page headers and tabs elements to hide
    const parentTabs = document.querySelector('.flex.border-b.border-gray-200.mb-6');
    const parentHeader = document.querySelector('.flex.flex-col.md\\:flex-row.md\\:items-center.justify-between.gap-4');

    if (parentTabs) (parentTabs as HTMLElement).style.display = 'none';
    if (parentHeader) (parentHeader as HTMLElement).style.display = 'none';

    return () => {
      // Restore on unmount
      if (parentTabs) (parentTabs as HTMLElement).style.display = '';
      if (parentHeader) (parentHeader as HTMLElement).style.display = '';
    };
  }, [indicators]);

  useEffect(() => {
    if (isNewPeriod) {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: true } });
      window.dispatchEvent(event);
    } else {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: false } });
      window.dispatchEvent(event);
    }
    return () => {
      const event = new CustomEvent('vna-period-mode-change', { detail: { isNew: false } });
      window.dispatchEvent(event);
    };
  }, [isNewPeriod]);

  useEffect(() => {
    const handleSaveEvent = () => {
      onSave();
    };
    window.addEventListener('vna-save-new-period', handleSaveEvent);
    return () => {
      window.removeEventListener('vna-save-new-period', handleSaveEvent);
    };
  }, [onSave]);

  // Scroll to element function
  const scrollToSection = (code: string) => {
    setActiveSec(code);
    const element = document.getElementById(`section-${code}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // State to hold editable cell values
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize form mock rows
  useEffect(() => {
    const initial: Record<string, any> = {};

    // 1. Tổ Khai thác
    initial["GRI 302-1_TAB_1"] = [
      { energy: "Nhiên liệu bay (Jet A-1)", value: "2450.00", unit: "Tấn" },
      { energy: "Xăng động cơ (Phương tiện mặt đất)", value: "4.20", unit: "Tấn" },
      { energy: "Dầu Diesel (Phương tiện mặt đất)", value: "12.50", unit: "Tấn" },
      { energy: "Điện năng tiêu thụ (Tòa nhà điều hành)", value: "14520.00", unit: "kWh" },
    ];
    initial["GRI 302-1_TAB_2"] = [
      { co2_source: "Phát thải CO2 từ Jet A1 tiêu thụ", value: "7717.50", unit: "Tấn" },
      { co2_source: "Phát thải CO2 từ phương tiện mặt đất", value: "48.20", unit: "Tấn" },
    ];
    initial["GRI 302-4"] = [
      { measure: "Tối ưu hóa đường bay hàng năm", saved: "45000", target: "50000", unit: "kg" },
      { measure: "Giảm phụ tải buồng lái (Paperless)", saved: "1200", target: "1500", unit: "kg" },
    ];
    initial["GRI 305-1"] = [
      { source: "Jet A-1 tiêu thụ trên chuyến bay", co2: "7717.50", method: "Khảo sát thực tế" },
      { source: "Phương tiện mặt đất (Xăng/Dầu)", co2: "48.20", method: "Khảo sát thực tế" },
    ];
    initial["GRI 305-4"] = [
      { type: "Cường độ phát thải trên RPK (Hành khách-km)", intensity: "75.40", target: "74.00", unit: "gCO2/RPK" },
    ];
    initial["GRI 305-5"] = [
      { measure: "Sử dụng hỗn hợp SAF 2% tại Pháp", reduced: "120.00", target: "125.00" },
      { measure: "Tối ưu hóa lập kế hoạch bay", reduced: "35.50", target: "40.00" },
    ];
    initial["GRI 305-7"] = [
      { gas: "Oxit Nitơ (NOx)", weight: "142.50", method: "Ước tính ICAO" },
      { gas: "Oxit Lưu huỳnh (SOx)", weight: "8.40", method: "Ước tính ICAO" },
    ];

    // 2. Ban ATCL
    initial["Airline E-1"] = [
      { type: "A320-272N", reg: "VN-A513", cert: "01-N/07/2024/GCN-CHK", chapter: "Chapter 4", date: "2024-07-20", noise: "Đạt" },
      { type: "A321-272N", reg: "VN-A515", cert: "02-N/12/2024/GCN-CHK", chapter: "Chapter 14", date: "2024-12-15", noise: "Đạt" },
      { type: "A321-231", reg: "VN-A323", cert: "01-N/04/2011/GCN-CHK", chapter: "Chapter 4", date: "2011-04-15", noise: "Đạt" },
    ];
    initial["9"] = [
      { flightType: "Chuyến bay nội địa Việt Nam", emissions: "35400.00", target: "36000.00" },
    ];
    initial["GRI 403-2"] = [
      { safety: "Số vụ tai nạn lao động phi hành đoàn", actual: "0", target: "0", ltifr: "0.00" },
      { safety: "Số vụ tai nạn lao động khối mặt đất", actual: "1", target: "0", ltifr: "0.15" },
    ];

    // 3. Tổ Kỹ thuật
    initial["4"] = [
      { icao: "LFPG", name: "Charles de Gaulle", start: "2026-03-01", end: "2026-03-31", plan: "50.00", mandated: "2.0%", total: "2500.00", actual: "52.00", jeta1: "2448.00" },
      { icao: "EGLL", name: "London Heathrow", start: "2026-03-01", end: "2026-03-31", plan: "40.00", mandated: "2.0%", total: "2000.00", actual: "41.50", jeta1: "1958.50" },
    ];
    initial["5"] = [
      { airport: "LFPG (Paris)", supplier: "TotalEnergies", batch: "BAT-2026-03A", amount: "52.00", reduction: "85.0%" },
    ];
    initial["13"] = [
      { system: "Liên minh EU ETS", allowance: "12000", purchase: "3000", price: "65.00", cost: "195000" },
      { hệthống: "Vương quốc Anh UK ETS", allowance: "8000", purchase: "2000", price: "70.00", cost: "140000" },
    ];

    // 4. TTBSV
    initial["Airline B-2"] = [
      { tier: "Hội viên Triệu dặm & Bạch Kim", satisfaction: "94.50", target: "95.00", count: "1200" },
      { tier: "Hội viên Vàng & Titan", satisfaction: "88.20", target: "88.00", count: "4500" },
      { tier: "Hội viên Bạc & Phổ thông", satisfaction: "82.10", target: "82.00", count: "15400" },
    ];

    // 5. Ban CĐS
    initial["GRI 418-1"] = [
      { type: "Khiếu nại từ khách hàng về quyền riêng tư", complaints: "0", leaks: "0", solutions: "Không ghi nhận sự cố" },
      { type: "Yêu cầu cung cấp thông tin từ cơ quan quản lý", complaints: "0", leaks: "0", solutions: "Không có" },
    ];

    // 6. Tổ Dịch vụ
    initial["GRI 303-3"] = [
      { source: "Nước ngầm tự khai thác", value: "4.25", target: "4.50" },
      { source: "Nước máy đô thị cung cấp", value: "18.40", target: "19.00" },
    ];
    initial["GRI 303-5"] = [
      { zone: "Tiêu thụ tại văn phòng tổng công ty", value: "12.50", target: "13.00" },
      { zone: "Tiêu thụ tại sân bay & phục vụ mặt đất", value: "8.15", target: "8.50" },
    ];
    initial["Airline B-1"] = [
      { service: "Dịch vụ phòng chờ Thương gia (Lounge)", npsDom: "48.5", npsInt: "52.0" },
      { service: "Dịch vụ suất ăn và đồ uống trên máy bay", npsDom: "46.0", npsInt: "51.5" },
    ];
    initial["GRI 204-1_TAB_1"] = [
      {
        name: "Petrolimex Aviation",
        countryType: "VN",
        contractFrom: "2025-01-01",
        contractTo: "2027-12-31",
        hasSustCommitment: "Có",
        sustEffectiveDate: "2025-06-01",
        sustDescription: "Cam kết cung ứng tối thiểu 5% nhiên liệu bay bền vững (SAF) tại Tân Sơn Nhất và Nội Bài kể từ 2026."
      },
      {
        name: "Shell Aviation International",
        countryType: "Foreign",
        contractFrom: "2024-03-15",
        contractTo: "2027-03-15",
        hasSustCommitment: "Có",
        sustEffectiveDate: "2024-10-01",
        sustDescription: "Hỗ trợ kỹ thuật chứng nhận bền vững ISCC đối với các lô hàng SAF pha trộn cho đội bay VNA."
      },
      {
        name: "Skytanking Holding GmbH",
        countryType: "Foreign",
        contractFrom: "2025-06-01",
        contractTo: "2026-05-31",
        hasSustCommitment: "Không",
        sustEffectiveDate: "",
        sustDescription: ""
      }
    ];
    initial["GRI 204-1_TAB_2"] = [
      { name: "NCS - Suất ăn Nội Bài", address: "Sân bay Nội Bài", type: "Nhà cung cấp Việt Nam", country: "Việt Nam", domain: "Suất ăn hàng không", start: "2026-01-01", end: "2026-12-31" },
      { name: "VACS - Suất ăn Việt Nam", address: "Sân bay Tân Sơn Nhất", type: "Nhà cung cấp Việt Nam", country: "Việt Nam", domain: "Suất ăn hàng không", start: "2026-01-01", end: "2026-12-31" },
    ];
    initial["GRI 406-1"] = [
      { code: "INC-2026-001", start: "2026-03-15", end: "2026-03-20", status: "Đã đóng (Closed)", solution: "Thư xin lỗi và tặng dặm" },
      { code: "INC-2026-002", start: "2026-03-22", end: "", status: "Đang điều tra (In review)", solution: "Đang kiểm chứng dịch vụ" },
    ];
    initial["GRI 416-1"] = [
      { category: "Suất ăn đặc biệt (BMVDAD, BMVHAN...)", standard: "ISO 22000 / HACCP", audited: "100%" },
      { category: "Hóa chất làm sạch bề mặt tàu bay", standard: "QĐ VSTB của VNA", audited: "100%" },
    ];
    initial["GRI 416-2"] = [
      { category: "Sự cố mất an toàn vệ sinh thực phẩm", cases: "0", authority: "Không ghi nhận" },
    ];
    initial["GRI 417-2"] = [
      { category: "Thiếu tem cảnh báo dị ứng thực phẩm", cases: "0", action: "Không ghi nhận" },
    ];

    // 7. Ban TCNL
    initial["Airline D-1"] = [
      { name: "Ngừng việc tự phát tại bộ phận mặt đất", start: "2026-03-12", workers: "0", daysLost: "0", status: "Không xảy ra" },
    ];
    initial["Airline F-2"] = [
      { group: "Khối Khai thác bay (Phi công, Tiếp viên)", overall: "4.25", work: "4.10", training: "4.20", manager: "4.30", income: "4.15" },
      { group: "Khối Kỹ thuật (Kỹ sư bảo dưỡng)", overall: "4.05", work: "3.95", training: "4.00", manager: "4.10", income: "3.90" },
    ];
    initial["GRI 202-1"] = [
      { role: "Phi công Việt Nam khởi điểm", wage: "45000000", minRegion: "4960000", ratio: "9.07" },
      { role: "Tiếp viên cơ hữu khởi điểm", wage: "15000000", minRegion: "4960000", ratio: "3.02" },
      { role: "Lao động mặt đất phổ thông", wage: "7500000", minRegion: "4960000", ratio: "1.51" },
    ];
    initial["GRI 202-2"] = [
      { scope: "Ban quản lý cấp cao tại trụ sở chính", local: "100.0%", foreign: "0.0%" },
      { scope: "Quản lý tại các chi nhánh nước ngoài", local: "45.0%", foreign: "55.0%" },
    ];
    initial["GRI 403-9"] = [
      { cause: "Không có thiết bị an toàn đạt chuẩn", cases: "0", deadCases: "0", victims: "0", deaths: "0", heavyInjures: "0" },
      { cause: "Thiếu phương tiện bảo hộ lao động cá nhân", cases: "0", deadCases: "0", victims: "0", deaths: "0", heavyInjures: "0" },
    ];
    initial["GRI 401-1"] = [
      { metric: "Tổng số lao động ký HĐLĐ cơ hữu", value: "6200", unit: "Người" },
      { metric: "Tỷ lệ tuyển dụng mới trong kỳ", value: "2.5", unit: "%" },
      { metric: "Tỷ lệ thôi việc/nghỉ việc trong kỳ", value: "1.8", unit: "%" },
    ];
    initial["GRI 401-2"] = [
      { metric: "Bảo hiểm sức khỏe cao cấp cho phi hành đoàn", value: "100", unit: "% nhân sự áp dụng" },
      { metric: "Hỗ trợ nhà ở/phòng nghỉ chặng bay đêm", value: "100", unit: "% nhân sự áp dụng" },
    ];

    // 8. Ban KHPT & Mapped Indicators (Initializing bilingual inputs)
    Object.keys(GOV_INDICATOR_MAPPINGS).forEach((code) => {
      const mapping = GOV_INDICATOR_MAPPINGS[code];
      initial[code + '_VI'] = mapping.defaultVnaTextVi;
      initial[code + '_EN'] = mapping.defaultVnaTextEn;
      initial[code] = mapping.defaultVnaTextVi; // compatibility fallback
      initial[code + '_STATUS'] = mapping.status;
    });

    // 9. Ban Truyền thông
    initial["Airline F-1"] = [
      { name: "Chiến dịch môi trường 'Hành trình Xanh VNA'", dept: "Tổ Khai thác", date: "2026-03-15", hours: "48", participants: "150", cost: "50000000" },
      { name: "Quyên góp áo ấm & học bổng trẻ em vùng cao", dept: "Tổ Dịch vụ", date: "2026-03-20", hours: "24", participants: "80", cost: "120000000" },
    ];
    initial["GRI 417-3"] = [
      { name: "Sai sót thông tin quảng cáo vé Tết", date: "2026-03-05", fined: "Không", warned: "Không", ruleViolated: "Không", details: "Không phát sinh vi phạm" },
    ];

    setFormData(initial);
  }, []);

  const handleCellChange = (indicator: string, rowIdx: number, field: string, value: string) => {
    const hasTabs = indicator === 'GRI 302-1' || indicator === 'GRI 204-1';
    const dataKey = hasTabs ? `${indicator}_${activeSubTab}` : indicator;
    setFormData(prev => {
      const updated = { ...prev };
      if (updated[dataKey]) {
        const rows = [...updated[dataKey]];
        rows[rowIdx] = { ...rows[rowIdx], [field]: value };

        // Auto-calculate logic if needed
        // For Technical Ops Uplift Form
        if (indicator === '4') {
          const total = parseFloat(rows[rowIdx].total) || 0;
          const actual = parseFloat(rows[rowIdx].actual) || 0;
          rows[rowIdx].jeta1 = (total - actual).toFixed(2);
        }

        updated[dataKey] = rows;
      }
      return updated;
    });
  };

  const [searchText, setSearchText] = useState<string>('');

  const filteredIndicators = React.useMemo(() => {
    return indicatorDetails.filter(ind => {
      const matchQuery = searchText.toLowerCase().trim();
      if (!matchQuery) return true;
      return ind.code.toLowerCase().includes(matchQuery) || ind.name.toLowerCase().includes(matchQuery);
    });
  }, [indicatorDetails, searchText]);

  return (
    <div className="flex gap-6 min-h-[75vh] text-left animate-in fade-in duration-300">

      {/* Sidebar: CHỈ TIÊU ĐƯỢC PHÂN CÔNG */}
      <div className="w-80 bg-white rounded-xl border border-gray-200 p-5 shrink-0 flex flex-col h-[calc(100vh-140px)] sticky top-20 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">CHỈ TIÊU ĐƯỢC PHÂN CÔNG</h3>
        <p className="text-xs text-gray-400 mt-1 mb-3 font-semibold">Chọn chỉ tiêu để nhập liệu</p>

        {/* Search box */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm mã hoặc tên chỉ tiêu..."
            className="w-full pl-9 pr-4 py-2 border border-gray-350 hover:border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-vna-blue/30 text-xs font-semibold bg-gray-50/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {filteredIndicators.length === 0 ? (
            <div className="text-center text-xs text-gray-400 italic py-6">
              Không tìm thấy chỉ tiêu
            </div>
          ) : (
            filteredIndicators.map(ind => {
              const sheetCount = (ind.code === 'GRI 302-1' || ind.code === 'GRI 204-1') ? 2 : 1;
              const isActive = activeSec === ind.code;

              return (
                <button
                  key={ind.code}
                  onClick={() => scrollToSection(ind.code)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:border-vna-blue/50 ${isActive
                      ? 'border-vna-blue ring-1 ring-vna-blue/10 bg-blue-50/10'
                      : 'border-gray-200 bg-white hover:bg-gray-50/50'
                    }`}
                >
                  <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1">{ind.code}</span>
                  <span className="font-bold text-gray-800 text-sm block leading-tight">{ind.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold mt-2 flex items-center gap-1">
                    <FileSpreadsheet size={12} /> {sheetCount} {sheetCount > 1 ? 'Sheets' : 'Sheet'}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[70vh] flex flex-col relative">

        {/* Header toolbar */}
        {indicatorDetails.map(ind => {
          if (ind.code !== activeSec) return null;
          const hasTabs = ind.code === 'GRI 302-1' || ind.code === 'GRI 204-1';
          const dataKey = hasTabs ? `${ind.code}_${activeSubTab}` : ind.code;
          const rows = formData[dataKey] || [];

          return (
            <div key={ind.code} className="flex-1 flex flex-col">

              {/* Header with Title and Save Button */}
              <div className="flex justify-between items-start border-b border-gray-150 pb-5 mb-5 gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={onBack} className="p-2 -ml-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-vna-blue">{ind.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500 font-bold">Kỳ báo cáo:</span>
                      <select className="border border-gray-300 rounded px-2.5 py-1 text-xs font-bold text-gray-700 bg-white focus:ring-1 focus:ring-vna-blue/20 outline-none">
                        <option>{effectivePeriod}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onBack} className="text-xs py-1.5 h-9 font-bold">Hủy bỏ</Button>
                  {rows.length > 0 && (
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs h-9 font-bold flex items-center gap-1.5">
                      <FileSpreadsheet size={16} className="text-emerald-600" /> Nhập Excel (Import)
                    </Button>
                  )}
                </div>
              </div>

              {/* TAB SELECTOR LỚN (Chỉ hiển thị nếu thỏa mãn điều kiện kpiRules: hasKpi = Yes và nguồn = Nhập thủ công/trống) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                
                if (!showPlanTab) return null;
                
                return (
                  <div className="flex border-b border-gray-200 mb-5 gap-2 animate-in fade-in duration-200">
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('DATA')}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'DATA'
                          ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Số liệu thực hiện
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('PLAN')}
                      className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeMainTab === 'PLAN'
                          ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Kế hoạch thực hiện
                    </button>
                  </div>
                );
              })()}

              {/* Sub-tabs / Sheets Selectors if any - only display if indicator has more than 1 form/sheet AND we are in DATA tab */}
              {activeMainTab === 'DATA' && ind.code === 'GRI 302-1' && (
                <div className="flex border-b border-gray-200 mb-5 gap-1 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveSubTab('TAB_1')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_1'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Nhiên liệu Jet A1
                  </button>
                  <button
                    onClick={() => setActiveSubTab('TAB_2')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_2'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Phát thải CO2 (CORSIA)
                  </button>
                </div>
              )}

              {activeMainTab === 'DATA' && ind.code === 'GRI 204-1' && (
                <div className="flex border-b border-gray-200 mb-5 gap-1 animate-in fade-in duration-200">
                  <button
                    onClick={() => setActiveSubTab('TAB_1')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_1'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Danh sách nhà cung cấp
                  </button>
                  <button
                    onClick={() => setActiveSubTab('TAB_2')}
                    className={`px-4 py-2 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activeSubTab === 'TAB_2'
                        ? 'border-vna-blue text-vna-blue bg-blue-50/10 rounded-t-lg shadow-sm'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Tỷ lệ chi tiêu (Cũ)
                  </button>
                </div>
              )}

              {/* FORM KẾ HOẠCH THỰC HIỆN (Render dưới dạng bảng Excel đồng nhất) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                if (showPlanTab && activeMainTab === 'PLAN') {
                  return (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 animate-in fade-in duration-200">
                      <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                        <thead>
                          <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-650 font-bold">
                            <th className="p-3 border border-gray-200 w-12 text-center">Th..</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-left">Chỉ tiêu kế hoạch / mục tiêu</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-center w-64">Giá trị Kế hoạch (Target)</th>
                            <th className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20 text-center w-64">Giá trị Mục tiêu (Goal)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-blue-50/20 transition-colors">
                            <td className="p-3 border border-gray-200 text-center font-bold text-gray-500 bg-gray-50/10 w-16">
                              Dòng 1
                            </td>
                            <td className="p-3 border border-gray-200 font-semibold text-gray-800">
                              Kế hoạch và Mục tiêu (KPI) cần đạt của chỉ tiêu
                            </td>
                            <td className="p-2 border border-gray-200 text-center">
                              <input
                                type="number"
                                placeholder="Nhập KH..."
                                value={formData[`${ind.code}_PLAN_TARGET`] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [`${ind.code}_PLAN_TARGET`]: e.target.value }))}
                                className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800 text-center"
                              />
                            </td>
                            <td className="p-2 border border-gray-200 text-center">
                              <input
                                type="number"
                                placeholder="Nhập mục tiêu..."
                                value={formData[`${ind.code}_PLAN_GOAL`] || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, [`${ind.code}_PLAN_GOAL`]: e.target.value }))}
                                className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800 text-center"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Table rendering or Text Multiple Line rendering (Ẩn nếu đang ở tab PLAN) */}
              {(() => {
                const rule = (kpiRules as Record<string, { hasKpi: string; kpiSource: string }>)[ind.code];
                const showPlanTab = rule && rule.hasKpi.trim().toLowerCase() === 'yes' && (rule.kpiSource.trim() === 'Nhập thủ công' || rule.kpiSource.trim() === '');
                const isHidden = showPlanTab && activeMainTab === 'PLAN';
                return (
                  <div className={`overflow-x-auto rounded-lg border border-gray-200 flex-1 ${isHidden ? 'hidden' : ''}`}>
                {!Array.isArray(rows) || rows.length === 0 ? (
                  (() => {
                    const mapping = GOV_INDICATOR_MAPPINGS[ind.code];
                    if (mapping) {
                      const currentVal = formData[ind.code + '_STATUS'] === undefined 
                        ? mapping.status 
                        : formData[ind.code + '_STATUS'];
                      const showTextArea = currentVal === mapping.status;
                      const textKey = ind.code + '_' + inputLang;
                      // Fallback value for legacy compatibility
                      const currentText = formData[textKey] !== undefined 
                        ? formData[textKey] 
                        : (inputLang === 'VI' ? (formData[ind.code] || mapping.defaultVnaTextVi) : mapping.defaultVnaTextEn);

                      return (
                        <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-300">
                          {/* Language Switch Button */}
                          <div className="flex justify-end gap-2 -mb-2">
                            <button
                              type="button"
                              onClick={() => setInputLang('VI')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                inputLang === 'VI'
                                  ? 'bg-vna-blue text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              Tiếng Việt (VI)
                            </button>
                            <button
                              type="button"
                              onClick={() => setInputLang('EN')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                inputLang === 'EN'
                                  ? 'bg-vna-blue text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              English (EN)
                            </button>
                          </div>

                          {/* Question Selector Card */}
                          <div className="bg-slate-50 border border-gray-200 p-5 rounded-2xl">
                            <span className="text-[10px] font-black text-vna-gold uppercase tracking-wider block mb-1">
                              {inputLang === 'VI' ? 'Câu hỏi kiểm nghiệm hiện trạng (Yes/No)' : 'Current state verification question (Yes/No)'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-800 leading-relaxed mb-4">
                              {inputLang === 'VI' ? mapping.questionVi : mapping.questionEn}
                            </h4>
                            
                            <div className="flex gap-4">
                              {['Yes', 'No'].map((option) => (
                                <label 
                                  key={option} 
                                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                                    currentVal === option 
                                      ? 'bg-vna-blue text-white border-vna-blue shadow-sm' 
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    name={`status-${ind.code}`}
                                    value={option}
                                    checked={currentVal === option}
                                    onChange={() => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        [`${ind.code}_STATUS`]: option,
                                        [ind.code]: option === mapping.status ? (prev[ind.code] || mapping.defaultVnaTextVi) : '',
                                        [ind.code + '_VI']: option === mapping.status ? (prev[ind.code + '_VI'] || mapping.defaultVnaTextVi) : '',
                                        [ind.code + '_EN']: option === mapping.status ? (prev[ind.code + '_EN'] || mapping.defaultVnaTextEn) : ''
                                      }));
                                    }}
                                    className="hidden"
                                  />
                                  <span>
                                    {inputLang === 'VI' 
                                      ? (option === 'Yes' ? 'Có (Yes)' : 'Không (No)') 
                                      : (option === 'Yes' ? 'Yes' : 'No')}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Textarea or Warning */}
                          {showTextArea ? (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                              <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800">
                                <span className="font-extrabold uppercase tracking-wide block mb-1.5 text-[10px]">
                                  {inputLang === 'VI' ? 'Các mục chính cần công bố thuyết minh (Hướng dẫn GRI):' : 'Key points to disclose (GRI Guidelines):'}
                                </span>
                                <div className="font-semibold whitespace-pre-line leading-relaxed">
                                  {inputLang === 'VI' ? mapping.mainPointsVi : mapping.mainPointsEn}
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider">
                                  {inputLang === 'VI' ? 'Nội dung thuyết minh (Rich Text / Thuyết minh Báo cáo VNA)' : 'Disclosure content (Rich Text / VNA Disclosure Report)'}
                                </label>
                                <textarea
                                  rows={12}
                                  value={String(currentText || '')}
                                  onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    [textKey]: e.target.value,
                                    ...(inputLang === 'VI' ? { [ind.code]: e.target.value } : {})
                                  }))}
                                  placeholder={inputLang === 'VI' ? `Nhập thông tin thuyết minh chi tiết cho chỉ tiêu ${ind.code}...` : `Enter detailed disclosure explanation for indicator ${ind.code}...`}
                                  className="w-full text-sm font-semibold p-4 rounded-xl outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800 leading-relaxed"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200/80 p-6 rounded-2xl text-center text-xs font-bold text-gray-500 py-8 animate-in fade-in duration-200">
                              {inputLang === 'VI' ? (
                                <>
                                  ⚠️ Hiện trạng được chọn là &quot;{currentVal === 'Yes' ? 'Có' : 'Không'}&quot; (Trái với cấu hình Hiện trạng VNA &quot;{mapping.status === 'Yes' ? 'Có' : 'Không'}&quot;).
                                  <div className="font-medium text-gray-400 mt-2">
                                    Hệ thống tự động ẩn phần soạn thảo thuyết minh văn bản cho chỉ tiêu {ind.code}.
                                  </div>
                                </>
                              ) : (
                                <>
                                  ⚠️ Selected state is &quot;{currentVal}&quot; (Opposite of VNA expected state &quot;{mapping.status}&quot;).
                                  <div className="font-medium text-gray-400 mt-2">
                                    The system automatically hides the disclosure composing area for indicator {ind.code}.
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Fallback for default text indicator
                    return (
                      <div className="p-5 flex flex-col gap-2 animate-in fade-in duration-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Nội dung báo cáo định tính (Text Multiple Line)</label>
                        <textarea
                          rows={12}
                          value={String(formData[ind.code] || '')}
                          onChange={(e) => setFormData(prev => ({ ...prev, [ind.code]: e.target.value }))}
                          placeholder={`Nhập thông tin thuyết minh chi tiết hoặc số liệu báo cáo định tính cho chỉ tiêu ${ind.code}...`}
                          className="w-full text-sm font-semibold p-4 rounded outline-none border border-gray-200 hover:border-gray-300 focus:ring-1 focus:ring-vna-blue/30 bg-white text-gray-800"
                        />
                      </div>
                    );
                  })()
                ) : (
                  <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-655 font-bold">
                        <th className="p-3 border border-gray-200 w-12 text-center">Th..</th>
                        {Object.keys(rows[0]).map(key => {
                          let colLabel = key;
                          if (key === 'name') {
                            colLabel = (ind.code === 'GRI 204-1') ? 'Tên nhà cung cấp' : 'Tên chỉ tiêu / Đối tượng';
                          }
                          else if (key === 'energy') colLabel = 'Loại năng lượng / Tiêu thụ';
                          else if (key === 'value') colLabel = 'Lượng thực tế';
                          else if (key === 'unit') colLabel = 'Đơn vị';
                          else if (key === 'co2_source') colLabel = 'Nguồn phát thải CO2';
                          else if (key === 'countryType') colLabel = 'Quốc gia';
                          else if (key === 'contractFrom') colLabel = 'Hợp đồng từ';
                          else if (key === 'contractTo') colLabel = 'Hợp đồng đến';
                          else if (key === 'hasSustCommitment') colLabel = 'Cam kết PTBV?';
                          else if (key === 'sustEffectiveDate') colLabel = 'Ngày cam kết hiệu lực';
                          else if (key === 'sustDescription') colLabel = 'Mô tả cam kết phát triển bền vững';
                          else if (key === 'measure') colLabel = 'Chỉ tiêu tiết kiệm / Giảm thiểu';
                          else if (key === 'saved') colLabel = 'Thực tế tiết kiệm (kg)';
                          else if (key === 'target') colLabel = 'Chỉ tiêu mục tiêu';
                          else if (key === 'source') colLabel = 'Nguồn phát thải / Cấp nước';
                          else if (key === 'co2') colLabel = 'Phát thải CO2 (Tấn)';
                          else if (key === 'method') colLabel = 'Phương pháp tính / Đo';
                          else if (key === 'type') colLabel = 'Kiểu loại / Loại sự cố';
                          else if (key === 'intensity') colLabel = 'Cường độ thực tế';
                          else if (key === 'reduced') colLabel = 'Lượng giảm thực tế (tCO2e)';
                          else if (key === 'gas') colLabel = 'Khí thải phát sinh';
                          else if (key === 'weight') colLabel = 'Khối lượng (Tấn)';
                          else if (key === 'reg') colLabel = 'Số đăng ký TB';
                          else if (key === 'cert') colLabel = 'Chứng chỉ tiếng ồn';
                          else if (key === 'chapter') colLabel = 'Hệ số CORSIA';
                          else if (key === 'date') colLabel = 'Ngày cấp/Ngày xảy ra';
                          else if (key === 'noise') colLabel = 'Tiếng ồn';
                          else if (key === 'flightType') colLabel = 'Phạm vi khai thác';
                          else if (key === 'emissions') colLabel = 'Khối lượng phát thải (tCO2)';
                          else if (key === 'safety') colLabel = 'Chỉ số an toàn lao động';
                          else if (key === 'actual') colLabel = 'Lượng thực tế / Số vụ';
                          else if (key === 'ltifr') colLabel = 'Tỷ lệ tần suất LTIFR';
                          else if (key === 'icao') colLabel = 'Mã ICAO Sân bay';
                          else if (key === 'start') colLabel = 'Ngày bắt đầu';
                          else if (key === 'end') colLabel = 'Ngày kết thúc';
                          else if (key === 'plan') colLabel = 'SAF kế hoạch (Tấn)';
                          else if (key === 'mandated') colLabel = 'Tỷ lệ SAF yêu cầu (%)';
                          else if (key === 'total') colLabel = 'Tổng nhiên liệu nạp (Tấn)';
                          else if (key === 'jeta1') colLabel = 'Jet A-1 thực tế (Tấn)';
                          else if (key === 'supplier') colLabel = 'Nhà cung cấp';
                          else if (key === 'batch') colLabel = 'Số lô (Batch)';
                          else if (key === 'amount') colLabel = 'SAF thực nạp (Tấn)';
                          else if (key === 'reduction') colLabel = 'Tỷ lệ giảm phát thải';
                          else if (key === 'system') colLabel = 'Hệ thống ETS';
                          else if (key === 'allowance') colLabel = 'Hạn ngạch cấp miễn phí (tCO2)';
                          else if (key === 'purchase') colLabel = 'Lượng tín chỉ mua (tCO2)';
                          else if (key === 'price') colLabel = 'Đơn giá mua (USD)';
                          else if (key === 'cost') colLabel = 'Tổng chi phí (USD)';
                          else if (key === 'tier') colLabel = 'Phân khúc khách hàng';
                          else if (key === 'satisfaction') colLabel = 'Điểm thực tế (NPS / Điểm số)';
                          else if (key === 'count') colLabel = 'Tổng số lượng phản hồi';
                          else if (key === 'complaints') colLabel = 'Số vụ khiếu nại';
                          else if (key === 'leaks') colLabel = 'Số vụ mất dữ liệu';
                          else if (key === 'solutions') colLabel = 'Biện pháp khắc phục';
                          else if (key === 'zone') colLabel = 'Khu vực / Mục đích tiêu thụ';
                          else if (key === 'npsDom') colLabel = 'NPS nội địa';
                          else if (key === 'npsInt') colLabel = 'NPS quốc tế';
                          else if (key === 'address') colLabel = 'Địa chỉ / Sân bay';
                          else if (key === 'country') colLabel = 'Quốc gia';
                          else if (key === 'domain') colLabel = 'Lĩnh vực hợp đồng';
                          else if (key === 'code') colLabel = 'Mã sự cố';
                          else if (key === 'status') colLabel = 'Trạng thái xử lý';
                          else if (key === 'solution') colLabel = 'Biện pháp giải quyết';
                          else if (key === 'category') colLabel = 'Danh mục / Suất ăn';
                          else if (key === 'standard') colLabel = 'Tiêu chuẩn chất lượng';
                          else if (key === 'audited') colLabel = 'Tỷ lệ đã đánh giá (%)';
                          else if (key === 'cases') colLabel = 'Số vụ vi phạm';
                          else if (key === 'authority') colLabel = 'Cơ quan xử lý';
                          else if (key === 'action') colLabel = 'Hành động khắc phục';
                          else if (key === 'group') colLabel = 'Khối nhân viên / Nhóm';
                          else if (key === 'overall') colLabel = 'Hài lòng tổng thể';
                          else if (key === 'work') colLabel = 'Điều kiện làm việc';
                          else if (key === 'training') colLabel = 'Đào tạo & Thăng tiến';
                          else if (key === 'manager') colLabel = 'Cấp trên trực tiếp';
                          else if (key === 'income') colLabel = 'Thu nhập';
                          else if (key === 'role') colLabel = 'Nhóm chức danh';
                          else if (key === 'wage') colLabel = 'Mức lương khởi điểm (VNĐ)';
                          else if (key === 'minRegion') colLabel = 'Mức tối thiểu vùng (VNĐ)';
                          else if (key === 'ratio') colLabel = 'Tỷ lệ so sánh';
                          else if (key === 'scope') colLabel = 'Phạm vi quản lý';
                          else if (key === 'local') colLabel = 'Tỷ lệ Lãnh đạo bản địa (%)';
                          else if (key === 'foreign') colLabel = 'Tỷ lệ Lãnh đạo nước ngoài (%)';
                          else if (key === 'cause') colLabel = 'Nguyên nhân xảy ra';
                          else if (key === 'deadCases') colLabel = 'Số vụ có tử vong';
                          else if (key === 'victims') colLabel = 'Số người bị nạn';
                          else if (key === 'deaths') colLabel = 'Số người tử vong';
                          else if (key === 'heavyInjures') colLabel = 'Số người chấn thương nặng';
                          else if (key === 'metric') colLabel = 'Chỉ số nhân sự';
                          else if (key === 'indicator') colLabel = 'Mục quản trị ESG';
                          else if (key === 'level') colLabel = 'Mức độ tuân thủ';
                          else if (key === 'notes') colLabel = 'Ghi chú';
                          else if (key === 'dept') colLabel = 'Đơn vị phụ trách';
                          else if (key === 'hours') colLabel = 'Tổng số giờ';
                          else if (key === 'participants') colLabel = 'Số người tham gia';
                          else if (key === 'fined') colLabel = 'Bị xử phạt';
                          else if (key === 'warned') colLabel = 'Bị cảnh cáo';
                          else if (key === 'ruleViolated') colLabel = 'Vi phạm quy tắc';
                          else if (key === 'details') colLabel = 'Chi tiết xử lý';

                          return (
                            <th key={key} className="p-3 border border-gray-200 font-semibold text-gray-700 bg-gray-55/20">
                              {colLabel}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-3 border border-gray-200 text-center font-bold text-gray-500 bg-gray-50/10 w-16">
                            Dòng {rIdx + 1}
                          </td>
                          {Object.entries(row).map(([field, val]) => {
                            const isReadOnly = field === 'jeta1' || field === 'ratio' || field === 'cost';
                            let displayValue = String(val);

                            if (ind.code === 'GRI 302-1' && activeSubTab === 'TAB_1') {
                              if (field === 'value') {
                                if (rIdx === 0) displayValue = '47400';
                                else if (rIdx === 1) displayValue = '44872';
                              }
                            }

                            // Custom inputs for GRI 204-1 TAB_1
                            if (ind.code === 'GRI 204-1' && activeSubTab === 'TAB_1') {
                              if (field === 'countryType') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[150px]">
                                    <select
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-bold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    >
                                      <option value="VN">NCC Việt Nam</option>
                                      <option value="Foreign">NCC nước ngoài</option>
                                    </select>
                                  </td>
                                );
                              }
                              if (field === 'hasSustCommitment') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[110px]">
                                    <select
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-bold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    >
                                      <option value="Có">Có</option>
                                      <option value="Không">Không</option>
                                    </select>
                                  </td>
                                );
                              }
                              if (field === 'contractFrom' || field === 'contractTo' || field === 'sustEffectiveDate') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[145px]">
                                    <input
                                      type="date"
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                    />
                                  </td>
                                );
                              }
                              if (field === 'sustDescription') {
                                return (
                                  <td key={field} className="p-2 border border-gray-200 min-w-[280px]">
                                    <textarea
                                      rows={2}
                                      value={displayValue}
                                      onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                      className="w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border border-gray-200 bg-white text-gray-800 focus:ring-1 focus:ring-vna-blue/30"
                                      placeholder="Nhập chi tiết các điều khoản cam kết..."
                                    />
                                  </td>
                                );
                              }
                            }

                            return (
                              <td key={field} className="p-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={displayValue}
                                  readOnly={isReadOnly}
                                  onChange={(e) => handleCellChange(ind.code, rIdx, field, e.target.value)}
                                  className={`w-full text-xs font-semibold px-2 py-1.5 rounded outline-none border focus:ring-1 focus:ring-vna-blue/30 ${isReadOnly
                                      ? 'bg-gray-100 text-gray-500 border-transparent cursor-not-allowed'
                                      : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                                    }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}
        </div>
          );
        })}
      </div>
    </div>
  );
};
