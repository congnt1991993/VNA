export interface GovIndicatorMapping {
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
}

export const GOV_INDICATOR_MAPPINGS: Record<string, GovIndicatorMapping> = {
  "GRI 2-9": {
    code: "GRI 2-9",
    nameVi: "Cơ cấu và thành phần quản trị",
    nameEn: "Governance structure and composition",
    status: "Yes",
    questionVi: "Doanh nghiệp có công bố sơ đồ cơ cấu quản trị, danh sách các Ủy ban thuộc HĐQT và thông tin thành phần HĐQT theo tiêu chuẩn GRI không?",
    questionEn: "Does the organization disclose its governance structure, composition of the Board and its committees, and board membership profile according to GRI standards?",
    mainPointsVi: "- Sơ đồ cơ cấu quản trị của Tổng công ty.\n- Danh sách các Ủy ban thuộc HĐQT.\n- Bảng thành phần HĐQT và từng Ủy ban theo 8 tiêu chí bắt buộc của GRI (thành viên điều hành/độc lập, nhiệm kỳ, giới tính...).",
    mainPointsEn: "- Governance structure diagram of the Corporation.\n- List of committees of the Board of Directors.\n- Composition of the Board and its committees based on the 8 mandatory GRI criteria (executive/non-executive, independence, tenure, gender, etc.).",
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
    mainPointsVi: "- Quy trình đề cử, lựa chọn thành viên HĐQT và các tiểu ban.\n- Tiêu chí lựa chọn có xét đến ý kiến của các bên liên quan, tính đa dạng, tính độc lập, và năng lực phát triển bền vững.",
    mainPointsEn: "- Nomination and selection process for members of the Board and its subcommittees.\n- Selection criteria considering stakeholder feedback, diversity, independence, and sustainability competencies.",
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
    mainPointsVi: "- Nêu rõ Chủ tịch HĐQT có đồng thời là cán bộ điều hành cấp cao của TCT hay không.\n- Mô tả chức năng điều hành, lý do bố trí và cách ngăn ngừa xung đột lợi ích nếu có kiêm nhiệm.",
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
  "GRI 2-30": {
    code: "GRI 2-30",
    nameVi: "Thỏa ước lao động tập thể",
    nameEn: "Collective bargaining agreements",
    status: "Yes",
    questionVi: "Tỷ lệ người lao động của doanh nghiệp được bảo vệ bởi các thỏa ước lao động tập thể là bao nhiêu?",
    questionEn: "What percentage of employees are covered by collective bargaining agreements?",
    mainPointsVi: "- Tỷ lệ người lao động được bảo hộ bởi thỏa ước lao động tập thể.\n- Quy trình thương lượng tập thể và vai trò của Công đoàn trong việc bảo vệ quyền lợi người lao động.",
    mainPointsEn: "- Percentage of total employees covered by collective bargaining agreements.\n- Collective bargaining processes and Labor Union engagement.",
    defaultVnaTextVi: "100% người lao động ký hợp đồng lao động chính thức tại Vietnam Airlines được bảo vệ bởi Thỏa ước lao động tập thể (TƯLĐTT). TCT định kỳ tổ chức đối thoại tại nơi làm việc và Hội nghị người lao động hàng năm theo đúng quy định pháp luật.",
    defaultVnaTextEn: "100% of employees with formal labor contracts at Vietnam Airlines are covered by Collective Bargaining Agreements. The Corporation periodically conducts workplace dialogues and annual Employee Conferences in full compliance with laws."
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
    defaultVnaTextVi: "Vietnam Airlines thực hiện DMA (Double Materiality Assessment) hàng năm để xác định các chủ đề trọng yếu. Các hoạt động quản lý, theo dõi hiệu quả được tích hợp vào kế hoạch hành động và được giám sát bởi Ban chỉ đạo ESG.",
    defaultVnaTextEn: "Vietnam Airlines conducts double materiality assessments annually to identify key ESG topics. Management actions and tracking indicators are embedded in action plans and monitored by the ESG steering committee."
  },
  "GRI 201-3": {
    code: "GRI 201-3",
    nameVi: "Cam kết chi trả lương hưu và phúc lợi hưu trí",
    nameEn: "Defined benefit plan obligations and other retirement plans",
    status: "Yes",
    questionVi: "Doanh nghiệp có duy trì các quỹ phúc lợi hưu trí và bảo hiểm hưu trí bổ sung cho người lao động không?",
    questionEn: "Does the organization maintain defined benefit retirement plans or supplementary pension programs for employees?",
    mainPointsVi: "- Các chương trình bảo hiểm xã hội bắt buộc và bảo hiểm hưu trí tự nguyện.\n- Mức độ bảo đảm tài chính cho các cam kết phúc lợi dài hạn đối với người lao động.",
    mainPointsEn: "- Mandatory social insurance and supplementary voluntary pension schemes.\n- Financial adequacy and funding of long-term retirement obligations.",
    defaultVnaTextVi: "Vietnam Airlines đóng đầy đủ 100% BHXH, BHYT, BHTN cho toàn bộ người lao động theo quy định pháp luật. Ngoài ra, TCT áp dụng các gói bảo hiểm sức khỏe và chăm sóc toàn diện cho phi công, tiếp viên và kỹ sư kỹ thuật.",
    defaultVnaTextEn: "Vietnam Airlines fully contributes 100% mandatory social, health, and unemployment insurance for all employees under state regulations, alongside comprehensive healthcare and welfare policies for flight crew and technical staff."
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
    defaultVnaTextVi: "Là Hãng hàng không Quốc gia, Vietnam Airlines không thực hiện bất kỳ khoản đóng góp tài chính hoặc hiện vật trực tiếp nào cho các đảng phái, tổ chức hoặc chiến dịch chính trị.",
    defaultVnaTextEn: "As a national flag carrier, Vietnam Airlines does not make financial or in-kind contributions to political parties or campaigns. The company participates in policy engagement indirectly through trade association dues."
  }
};

export const getGovIndicatorMapping = (code: string): GovIndicatorMapping | undefined => {
  if (!code) return undefined;
  if (GOV_INDICATOR_MAPPINGS[code]) return GOV_INDICATOR_MAPPINGS[code];
  const cleaned = code.split(/[\s-:]/)[0] + (code.includes('-') ? '-' + code.split('-')[1] : '');
  return GOV_INDICATOR_MAPPINGS[cleaned];
};
