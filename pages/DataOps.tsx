
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Modal, StatusChip, TextArea, Select, PillarBadge, ReportingPeriodTreeSelect, getPeriodLabel, getPeriodType, PeriodType } from '../components/UI';
import { RefreshCw, Edit3, Search, FileDown, UploadCloud, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Filter, Calendar, Folder, File, X, Plus, Save, ArrowLeft, Trash2, AlertTriangle, MoreHorizontal, Download, Bold, Italic, Underline, List, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Table, XCircle, MessageSquare, TrendingUp, TrendingDown, Minus, Layers, Clock, Lock, Users, Crown, HeartHandshake, GraduationCap, BarChart2, PieChart, Heading, Quote, Paperclip } from 'lucide-react';
import { DataRecord, Status, Pillar } from '../types';

// --- TYPES FOR ESG DATA ANALYSIS (Merged) ---
type CollectionStatus = 'InProgress' | 'Pending' | 'RequestChange' | 'Approved';

interface EsgDataAnalysisRecord {
  id: string;
  code: string;
  name: string;
  pillar: Pillar;
  program: string;
  status: CollectionStatus;
  period: string; // MM-YYYY, qX-YYYY, or YYYY
  type: 'Dynamic' | 'Content';
  
  // Analysis Fields
  submitter?: string; 
  submittedDate?: string;
  value?: number;
  unit?: string;
  previousValue?: number;
  kpiTarget?: number;
}

// --- SHARED DETAIL TYPES ---
interface FlightDataRecord {
  id: string;
  date: string;
  flightNo: string;
  aircraft: string;
  route: string;
  jetUplift: number;
  jetDefuel: number;
  jetBurn: number;
  safUplift: number;
  safDefuel: number;
  safBurn: number;
  source: 'System' | 'Manual';
  note: string;
  hasError?: boolean;
}
interface NoiseDataRecord { id: string; regNo: string; type: string; engine: string; icaoChapter: 'Chapter 3' | 'Chapter 4' | 'Chapter 14'; certNo: string; effectiveDate: string; source: 'System' | 'Manual'; note: string; hasError?: boolean; }
interface ReductionDataRecord { id: string; date: string; flightNo: string; aircraft: string; route: string; initiative: string; savedFuel: number; unit: 'Kg' | 'Lít'; source: 'System' | 'Manual'; note: string; hasError?: boolean; }
interface NpsDataRecord { id: string; period: string; sector: 'DOM' | 'INT'; route: string; npsScore: number; responseCount: number; touchpoint: string; source: 'System' | 'Manual'; note: string; hasError?: boolean; }
interface HRDataRecord { id: string; empId: string; name: string; gender: 'Nam' | 'Nữ' | 'Khác'; position: string; department: string; joinDate: string; source: 'System' | 'Manual'; note: string; hasError?: boolean; }
interface BSVMemberRecord { id: string; memberId: string; name: string; tier: 'Thẻ Bạc' | 'Thẻ Vàng' | 'Thẻ Titan' | 'Thẻ Bạch Kim' | 'Thẻ Triệu dặm' | 'Thẻ Elite' | 'Thẻ Elite Plus'; joinDate: string; status: 'Active' | 'Inactive'; source: 'System' | 'Manual'; note: string; hasError?: boolean; }
interface VoluntaryActivityRecord { id: string; eventName: string; description: string; date: string; organizer: string; volunteerCount: number; totalHours: number; totalStaff: number; result: string; source: 'Manual'; note: string; hasError?: boolean; }
interface TrainingCourseRecord { id: string; courseCode: string; courseName: string; classesOrganized: number; participants: number; source: 'System' | 'Manual'; note: string; hasError?: boolean; }

// --- MOCK DATA FOR ANALYSIS ---
const MOCK_ANALYSIS_DATA: EsgDataAnalysisRecord[] = [
  { id: '2025-1', code: 'Airline E-1', name: 'Tiếng ồn', pillar: Pillar.ENVIRONMENT, program: 'CORSIA', status: 'InProgress', period: '2025', type: 'Dynamic', value: 95.5, unit: '%', previousValue: 94.0, kpiTarget: 99.0 },
  { id: '2025-2', code: 'GRI 302-1', name: 'Năng lượng tiêu thụ của tổ chức', pillar: Pillar.ENVIRONMENT, program: 'CORSIA', status: 'InProgress', period: '2025', type: 'Dynamic', value: 1100000, unit: 'MJ', previousValue: 1050000, kpiTarget: 1200000 },
  { id: 'APP-1', code: 'Airline B-1', name: 'Mức độ hài lòng của khách hàng (NPS)', pillar: Pillar.SOCIAL, program: '', status: 'Pending', period: '2025', type: 'Dynamic', submitter: 'Nguyễn Văn A', submittedDate: '15/10/2025', value: 62, unit: 'NPS', previousValue: 60, kpiTarget: 65 },
  { id: 'APP-1-EXT', code: 'Airline B-2', name: 'Tương tác khách hàng (BSV)', pillar: Pillar.SOCIAL, program: '', status: 'Approved', period: '2025', type: 'Dynamic', submitter: 'Hệ thống', submittedDate: '15/10/2025', value: 250000, unit: 'Hội viên', previousValue: 240000, kpiTarget: 260000 },
  { id: 'APP-2', code: 'GRI 2-7', name: 'Quy mô tổ chức', pillar: Pillar.GOVERNANCE, program: '', status: 'Pending', period: '2025', type: 'Dynamic', submitter: 'Trần Thị B', submittedDate: '16/10/2025', value: 21500, unit: 'Người', previousValue: 21000, kpiTarget: 22000 },
  { id: 'APP-3', code: 'GRI 302-4', name: 'Giảm tiêu thụ năng lượng', pillar: Pillar.ENVIRONMENT, program: 'EU ETS', status: 'RequestChange', period: '2025', type: 'Dynamic', submitter: 'Lê Văn C', submittedDate: '14/10/2025', value: 30000, unit: 'MJ', previousValue: 40000, kpiTarget: 100000 },
  { id: 'APP-5', code: 'Airline F-1', name: 'Tham gia hoạt động tình nguyện', pillar: Pillar.SOCIAL, program: '', status: 'Approved', period: '2025', type: 'Dynamic', submitter: 'Hoàng Văn E', submittedDate: '12/10/2025', value: 5000, unit: 'Giờ', previousValue: 4500, kpiTarget: 5000 },
  { id: 'APP-6', code: 'GRI 404-2', name: 'Chương trình nâng cao kỹ năng nhân viên', pillar: Pillar.GOVERNANCE, program: '', status: 'Pending', period: '2025', type: 'Dynamic', submitter: 'Phòng Đào tạo', submittedDate: '18/10/2025', value: 15000, unit: 'Giờ', previousValue: 12000, kpiTarget: 16000 },
  { id: '2025-8', code: 'GRI 2-9', name: 'Cơ cấu và thành phần quản trị', pillar: Pillar.GOVERNANCE, program: '', status: 'Approved', period: '2025', type: 'Content', submitter: 'Phạm Thị D', submittedDate: '10/10/2025' },
];

// --- MOCK DETAILS ENRICHED ---

const MOCK_FLIGHT_DATA: FlightDataRecord[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `F${i}`,
    date: `2${i%9 + 1}/10/2025`,
    flightNo: `VN ${100 + i}`,
    aircraft: i % 3 === 0 ? 'VN-A868 / B787' : i % 3 === 1 ? 'VN-A350 / A350' : 'VN-A600 / A321',
    route: i % 2 === 0 ? 'HAN - SGN' : i % 4 === 0 ? 'HAN - NRT' : 'SGN - HAN',
    jetUplift: 15000 + (i * 100),
    jetDefuel: i % 10 === 0 ? 500 : 0,
    jetBurn: 12000 + (i * 90),
    safUplift: i % 5 === 0 ? 2000 : 0,
    safDefuel: 0,
    safBurn: i % 5 === 0 ? 1800 : 0,
    source: i % 15 === 0 ? 'Manual' : 'System',
    note: i % 15 === 0 ? 'Điều chỉnh sau chuyến bay' : '',
    hasError: i % 20 === 0
}));

const MOCK_NOISE_DATA: NoiseDataRecord[] = [
    { id: 'N1', regNo: 'VN-A868', type: 'B787-9', engine: 'GEnx-1B', icaoChapter: 'Chapter 14', certNo: 'VNA-2024-001', effectiveDate: '2024-01-01', source: 'System', note: '', hasError: false },
    { id: 'N2', regNo: 'VN-A869', type: 'B787-9', engine: 'GEnx-1B', icaoChapter: 'Chapter 14', certNo: 'VNA-2024-002', effectiveDate: '2024-01-05', source: 'System', note: '', hasError: false },
    { id: 'N3', regNo: 'VN-A350', type: 'A350-900', engine: 'Trent XWB', icaoChapter: 'Chapter 14', certNo: 'VNA-2024-010', effectiveDate: '2024-02-01', source: 'System', note: '', hasError: false },
    { id: 'N4', regNo: 'VN-A321', type: 'A321neo', engine: 'PW1100G', icaoChapter: 'Chapter 14', certNo: 'VNA-2024-050', effectiveDate: '2024-03-15', source: 'System', note: '', hasError: false },
    { id: 'N5', regNo: 'VN-A600', type: 'A321ceo', engine: 'V2500', icaoChapter: 'Chapter 4', certNo: 'VNA-2023-099', effectiveDate: '2023-11-20', source: 'System', note: 'Sắp hết hạn', hasError: true },
];

const MOCK_REDUCTION_DATA: ReductionDataRecord[] = [
    { id: 'R1', date: '15/10/2025', flightNo: 'VN 234', aircraft: 'VN-A868', route: 'HAN - SGN', initiative: 'Single Engine Taxi', savedFuel: 150, unit: 'Kg', source: 'System', note: 'SkyBreathe Auto', hasError: false },
    { id: 'R2', date: '15/10/2025', flightNo: 'VN 245', aircraft: 'VN-A350', route: 'SGN - HAN', initiative: 'Continuous Descent', savedFuel: 200, unit: 'Kg', source: 'System', note: 'SkyBreathe Auto', hasError: false },
    { id: 'R3', date: '16/10/2025', flightNo: 'VN 120', aircraft: 'VN-A600', route: 'DAD - HAN', initiative: 'APU Usage Optimization', savedFuel: 50, unit: 'Kg', source: 'Manual', note: 'Phi công báo cáo', hasError: false },
    { id: 'R4', date: '16/10/2025', flightNo: 'VN 211', aircraft: 'VN-A869', route: 'HAN - SGN', initiative: 'Flight Planning', savedFuel: 300, unit: 'Kg', source: 'System', note: 'Lido Flight', hasError: false },
    { id: 'R5', date: '17/10/2025', flightNo: 'VN 310', aircraft: 'VN-A350', route: 'NRT - HAN', initiative: 'Weight Reduction', savedFuel: 120, unit: 'Kg', source: 'System', note: '', hasError: false },
    { id: 'R6', date: '17/10/2025', flightNo: 'VN 311', aircraft: 'VN-A321', route: 'HAN - NRT', initiative: 'Single Engine Taxi', savedFuel: 0, unit: 'Kg', source: 'System', note: 'Data Missing', hasError: true },
];

const MOCK_NPS_DATA: NpsDataRecord[] = [
    { id: 'NPS1', period: '10/2025', sector: 'DOM', route: 'HAN-SGN', npsScore: 55, responseCount: 1250, touchpoint: 'Tổng thể chuyến bay', source: 'System', note: '', hasError: false },
    { id: 'NPS2', period: '10/2025', sector: 'INT', route: 'HAN-NRT', npsScore: 62, responseCount: 450, touchpoint: 'Tổng thể chuyến bay', source: 'System', note: '', hasError: false },
    { id: 'NPS3', period: '10/2025', sector: 'DOM', route: 'SGN-HAN', npsScore: 58, responseCount: 1100, touchpoint: 'Dịch vụ mặt đất', source: 'System', note: '', hasError: false },
    { id: 'NPS4', period: '10/2025', sector: 'INT', route: 'SGN-ICN', npsScore: 70, responseCount: 600, touchpoint: 'Suất ăn', source: 'System', note: '', hasError: false },
    { id: 'NPS5', period: '10/2025', sector: 'DOM', route: 'HAN-DAD', npsScore: 40, responseCount: 300, touchpoint: 'Giải trí', source: 'Manual', note: 'Điều chỉnh số liệu', hasError: false },
    { id: 'NPS6', period: '10/2025', sector: 'INT', route: 'HAN-CDG', npsScore: 0, responseCount: 0, touchpoint: 'Check-in', source: 'System', note: 'Lỗi đồng bộ', hasError: true },
];

const MOCK_HR_DATA: HRDataRecord[] = [
    { id: 'HR1', empId: 'VNA00156', name: 'Nguyễn Văn A', gender: 'Nam', position: 'Chuyên viên', department: 'Ban KH&PT', joinDate: '01/01/2015', source: 'System', note: '', hasError: false },
    { id: 'HR2', empId: 'VNA00157', name: 'Trần Thị B', gender: 'Nữ', position: 'Trưởng phòng', department: 'Ban TCNL', joinDate: '15/03/2016', source: 'System', note: '', hasError: false },
    { id: 'HR3', empId: 'VNA00200', name: 'Lê Văn C', gender: 'Nam', position: 'Phi công', department: 'Đoàn bay 919', joinDate: '20/10/2010', source: 'System', note: '', hasError: false },
    { id: 'HR4', empId: 'VNA00201', name: 'Phạm Thị D', gender: 'Nữ', position: 'Tiếp viên', department: 'Đoàn tiếp viên', joinDate: '05/05/2019', source: 'System', note: '', hasError: false },
    { id: 'HR5', empId: 'VNA00300', name: 'Hoàng Văn E', gender: 'Nam', position: 'Kỹ sư', department: 'Ban Quản lý vật tư', joinDate: '10/10/2018', source: 'Manual', note: 'Nhân viên mới', hasError: false },
    { id: 'HR6', empId: 'VNA00301', name: 'Vũ Thị F', gender: 'Nữ', position: 'Chuyên viên', department: 'Ban TT', joinDate: '01/11/2020', source: 'System', note: 'Sai mã phòng ban', hasError: true },
    { id: 'HR7', empId: 'VNA00400', name: 'Đặng Văn G', gender: 'Nam', position: 'Giám đốc', department: 'Chi nhánh MB', joinDate: '01/01/2005', source: 'System', note: '', hasError: false },
];

const MOCK_BSV_DATA: BSVMemberRecord[] = [
    { id: 'BSV1', memberId: '987654321', name: 'Nguyễn Văn H', tier: 'Thẻ Bạch Kim', joinDate: '10/01/2010', status: 'Active', source: 'System', note: '', hasError: false },
    { id: 'BSV2', memberId: '987654322', name: 'Trần Thị I', tier: 'Thẻ Vàng', joinDate: '15/05/2015', status: 'Active', source: 'System', note: '', hasError: false },
    { id: 'BSV3', memberId: '987654323', name: 'Lê Văn K', tier: 'Thẻ Titan', joinDate: '20/08/2018', status: 'Inactive', source: 'System', note: '', hasError: false },
    { id: 'BSV4', memberId: '987654324', name: 'Phạm Thị L', tier: 'Thẻ Bạc', joinDate: '01/01/2020', status: 'Active', source: 'System', note: '', hasError: false },
    { id: 'BSV5', memberId: '987654325', name: 'Hoàng Văn M', tier: 'Thẻ Triệu dặm', joinDate: '05/05/2000', status: 'Active', source: 'Manual', note: 'VIP Guest', hasError: false },
    { id: 'BSV6', memberId: '000000000', name: 'Unknown', tier: 'Thẻ Bạc', joinDate: '01/01/2025', status: 'Inactive', source: 'System', note: 'Lỗi dữ liệu', hasError: true },
];

const MOCK_VOLUNTARY_DATA: VoluntaryActivityRecord[] = [
    { id: 'VOL1', eventName: 'Hiến máu nhân đạo', description: 'Chương trình hiến máu "Giọt hồng Vietnam Airlines"', date: '15/10/2025', organizer: 'Đoàn Thanh niên', volunteerCount: 150, totalHours: 600, totalStaff: 2500, result: 'Thu được 150 đơn vị máu', source: 'Manual', note: '', hasError: false },
    { id: 'VOL2', eventName: 'Trồng rừng ngập mặn', description: 'Hoạt động trồng cây tại Cần Giờ', date: '20/10/2025', organizer: 'Công đoàn TCT', volunteerCount: 200, totalHours: 1600, totalStaff: 2500, result: 'Trồng 2000 cây', source: 'Manual', note: '', hasError: false },
    { id: 'VOL3', eventName: 'Tặng quà vùng cao', description: 'Chương trình "Áo ấm cho em" tại Hà Giang', date: '25/10/2025', organizer: 'Ban Nữ công', volunteerCount: 50, totalHours: 400, totalStaff: 2500, result: 'Tặng 500 suất quà', source: 'Manual', note: '', hasError: false },
    { id: 'VOL4', eventName: 'Dọn rác bãi biển', description: 'Chiến dịch "Biển xanh" tại Đà Nẵng', date: '01/11/2025', organizer: 'Đoàn Thanh niên', volunteerCount: 100, totalHours: 300, totalStaff: 2500, result: 'Thu gom 1 tấn rác', source: 'Manual', note: 'Thiếu báo cáo ảnh', hasError: true },
];

const MOCK_TRAINING_DATA: TrainingCourseRecord[] = [
    { id: 'T1', courseCode: 'LDR-001', courseName: 'Kỹ năng Lãnh đạo Quản lý cấp trung', classesOrganized: 5, participants: 150, source: 'System', note: '', hasError: false },
    { id: 'T2', courseCode: 'SFT-002', courseName: 'An toàn Hàng không cơ bản', classesOrganized: 10, participants: 500, source: 'System', note: '', hasError: false },
    { id: 'T3', courseCode: 'SVC-003', courseName: 'Nâng tầm Dịch vụ "Lotus Star"', classesOrganized: 8, participants: 320, source: 'System', note: '', hasError: false },
    { id: 'T4', courseCode: 'ESG-001', courseName: 'Nhận thức chung về Net Zero', classesOrganized: 20, participants: 2000, source: 'System', note: '', hasError: false },
    { id: 'T5', courseCode: 'DIG-005', courseName: 'Chuyển đổi số trong vận hành', classesOrganized: 2, participants: 50, source: 'Manual', note: 'Khóa học thuê ngoài', hasError: false },
    { id: 'T6', courseCode: 'ERR-999', courseName: 'Khóa học chưa định danh', classesOrganized: 1, participants: 0, source: 'System', note: 'Lỗi hệ thống E-learning', hasError: true },
];

// --- COMPONENTS ---

const formatPeriodDisplay = (periodId: string) => {
    if (!periodId) return '-';
    if (/^\d{4}$/.test(periodId)) return <span className="font-semibold text-gray-700">{periodId}</span>;
    if (periodId.toLowerCase().startsWith('q')) {
        const [q, y] = periodId.split('-');
        return <span className="font-medium text-gray-700">Quý {q.replace('q', '')} - {y}</span>;
    }
    if (periodId.includes('-')) {
        const [m, y] = periodId.split('-');
        return <span className="text-gray-700">Tháng {parseInt(m)} - {y}</span>;
    }
    return periodId;
};

const CollectionStatusBadge: React.FC<{ status: CollectionStatus }> = ({ status }) => {
  const styles = {
    'InProgress': 'bg-blue-50 text-blue-600 border-blue-200',
    'Pending': 'bg-orange-50 text-orange-600 border-orange-200',
    'RequestChange': 'bg-red-50 text-red-600 border-red-200',
    'Approved': 'bg-green-50 text-green-600 border-green-200',
  };
  const labels = {
    'InProgress': 'Đang thực hiện',
    'Pending': 'Chờ phê duyệt',
    'RequestChange': 'Yêu cầu chỉnh sửa',
    'Approved': 'Đã duyệt',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]} whitespace-nowrap`}>{labels[status]}</span>;
};

// Detail Table Toolbar Component
const DetailToolbar = ({ 
  searchText, 
  setSearchText, 
  filterStatus, 
  setFilterStatus, 
  stats,
  onAdd 
}: {
  searchText: string;
  setSearchText: (s: string) => void;
  filterStatus: string;
  setFilterStatus: (s: any) => void;
  stats: { all: number, system: number, manual: number, error: number };
  onAdd?: () => void;
}) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 animate-in fade-in duration-300">
     <div className="flex gap-3 flex-1 w-full md:w-auto items-center">
        {/* Search */}
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
           <input 
              type="text" 
              placeholder="Tìm kiếm dữ liệu..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-1 focus:ring-vna-blue"
           />
        </div>
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1">
            <button onClick={() => setFilterStatus('ALL')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'ALL' ? 'bg-white text-vna-blue border border-vna-blue hover:shadow-md transition-shadow duration-300' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`}>Tất cả ({stats.all})</button>
            <button onClick={() => setFilterStatus('SYSTEM')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'SYSTEM' ? 'bg-white text-blue-600 border border-blue-600 hover:shadow-md transition-shadow duration-300' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`}>Hệ thống ({stats.system})</button>
            <button onClick={() => setFilterStatus('MANUAL')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'MANUAL' ? 'bg-white text-orange-600 border border-orange-600 hover:shadow-md transition-shadow duration-300' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`}>Thủ công ({stats.manual})</button>
            <button onClick={() => setFilterStatus('ERROR')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === 'ERROR' ? 'bg-white text-red-600 border border-red-600 hover:shadow-md transition-shadow duration-300' : 'text-gray-600 hover:bg-gray-200 border border-transparent'}`}>Lỗi ({stats.error})</button>
        </div>
     </div>

     <div className="flex gap-2 w-full md:w-auto justify-end">
        {onAdd && (
            <Button variant="primary" className="h-9 text-xs bg-vna-blue text-white hover:shadow-md transition-shadow duration-300" onClick={onAdd}>
               <Plus size={14} /> Thêm dữ liệu
            </Button>
        )}
        <Button variant="outline" className="bg-white border-vna-blue text-vna-blue hover:bg-blue-50 h-9 text-xs">
           <FileDown size={14} /> Xuất Excel
        </Button>
     </div>
  </div>
);

// Pagination Component
const DetailPagination = ({ count }: { count: number }) => (
    <div className="bg-white border-t border-gray-200 p-2 flex justify-between items-center text-xs text-gray-600">
        <div className="pl-2">Hiển thị <span className="font-medium text-gray-900">{count > 0 ? `1 - ${Math.min(count, 15)}` : '0'}</span> của <span className="font-medium text-gray-900">{count}</span> bản ghi</div>
        <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"><ChevronLeft size={16}/></button>
            <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16}/></button>
        </div>
    </div>
);

const renderTrend = (value?: number, previousValue?: number) => {
  if (value === undefined || previousValue === undefined) return <span className="text-gray-300">-</span>;
  const diff = value - previousValue;
  const percent = previousValue !== 0 ? (diff / previousValue) * 100 : 0;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  
  return (
    <div className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-black/45'}`}>
      {isPositive && <TrendingUp size={14} />}
      {isNegative && <TrendingDown size={14} />}
      {!isPositive && !isNegative && <Minus size={14} />}
      <span>{Math.abs(percent).toFixed(1)}%</span>
    </div>
  );
};

const renderKPIProgress = (value?: number, target?: number) => {
  if (value === undefined || target === undefined || target === 0) return <span className="text-gray-300">-</span>;
  const percent = (value / target) * 100;
  
  // Generic coloring based on achievement
  let color = 'text-gray-700';
  if (percent >= 100) color = 'text-green-600';
  else if (percent >= 80) color = 'text-orange-600';
  else color = 'text-red-600';

  return (
    <div className={`font-bold ${color}`}>
      {percent.toFixed(1)}%
    </div>
  );
};

// Main Page Component
export const DataOpsPage: React.FC<{ mode: 'analysis' | 'logs' }> = ({ mode }) => {
  // Filters
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2025']);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  
  // View State
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [detailRecord, setDetailRecord] = useState<EsgDataAnalysisRecord | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [activeTab, setActiveTab] = useState<'DATA' | 'ANALYSIS'>('DATA'); // New State for Tabs
  
  // Data State
  const [flightData, setFlightData] = useState(MOCK_FLIGHT_DATA);
  const [noiseData, setNoiseData] = useState(MOCK_NOISE_DATA);
  const [reductionData, setReductionData] = useState(MOCK_REDUCTION_DATA);
  const [npsData, setNpsData] = useState(MOCK_NPS_DATA);
  const [hrData, setHrData] = useState(MOCK_HR_DATA);
  const [bsvData, setBsvData] = useState(MOCK_BSV_DATA);
  const [voluntaryData, setVoluntaryData] = useState(MOCK_VOLUNTARY_DATA);
  const [trainingData, setTrainingData] = useState(MOCK_TRAINING_DATA);
  
  // Detail View Filters
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SYSTEM' | 'MANUAL' | 'ERROR'>('ALL');
  const [detailSearchText, setDetailSearchText] = useState('');

  // Shared Handlers
  const handleViewDetail = (record: EsgDataAnalysisRecord) => {
    setDetailRecord(record);
    setViewMode('DETAIL');
    setIsAdjusting(false);
    setFilterStatus('ALL');
    setDetailSearchText('');
    setActiveTab('DATA'); // Reset to Data tab when opening
  };

  const handleBackToList = () => {
    setViewMode('LIST');
    setDetailRecord(null);
    setIsAdjusting(false);
  };

  const handleAddManual = () => {
      alert("Chức năng thêm dữ liệu thủ công");
  };

  // Logic to render action buttons based on Status
  const renderDetailActions = (record: EsgDataAnalysisRecord) => {
      if (isAdjusting) {
          return (
            <>
                <Button variant="outline" onClick={() => setIsAdjusting(false)} className="text-gray-600">
                    Hủy bỏ
                </Button>
                <Button variant="primary" onClick={() => setIsAdjusting(false)}>
                    <Save size={16} /> Lưu điều chỉnh
                </Button>
            </>
          );
      }

      switch (record.status) {
          case 'InProgress':
              return (
                  <>
                    <Button variant="outline" className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100">
                        <Trash2 size={16} /> Xóa
                    </Button>
                    <Button variant="outline" className="text-gray-600">
                        <Save size={16} /> Lưu nháp
                    </Button>
                    <Button variant="primary">
                        <CheckCircle size={16} /> Gửi duyệt
                    </Button>
                  </>
              );
          case 'Pending':
              return (
                  <>
                    <Button variant="outline" onClick={() => setIsAdjusting(true)} className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
                        <Edit3 size={16} /> Điều chỉnh
                    </Button>
                    <div className="w-px h-8 bg-gray-300 mx-1"></div>
                    <Button variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100">
                        <MessageSquare size={16} /> Yêu cầu chỉnh sửa
                    </Button>
                    <Button variant="primary">
                        <CheckCircle size={16} /> Phê duyệt
                    </Button>
                  </>
              );
          case 'RequestChange':
              return (
                  <>
                    <Button variant="outline" onClick={() => setIsAdjusting(true)} className="text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
                        <Edit3 size={16} /> Điều chỉnh
                    </Button>
                    <Button variant="primary">
                        <CheckCircle size={16} /> Gửi duyệt
                    </Button>
                  </>
              );
          case 'Approved':
              return (
                  <Button variant="ghost" disabled className="text-green-600">
                      <CheckCircle size={16} /> Đã hoàn thành
                  </Button>
              );
          default:
              return null;
      }
  };

  const DetailViewHeader = ({ title, record }: { title: string, record: EsgDataAnalysisRecord }) => (
      <>
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center text-sm text-black/45 font-medium">
                <span onClick={handleBackToList} className="cursor-pointer hover:text-vna-blue">Phân tích dữ liệu ESG</span>
                <span className="mx-2 text-gray-400">&gt;</span>
                <span className="text-vna-blue font-bold">{record.code}</span>
            </div>
        </div>
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-vna-blue flex items-center gap-2">
                    {title}: {record.code}
                    {isAdjusting && <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-200 font-medium">Chế độ điều chỉnh</span>}
                </h1>
                <p className="text-lg text-gray-700 font-medium mt-1">{record.name}</p>
                <div className="mt-4 flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-medium border border-blue-100">
                        Kỳ báo cáo: <span className="font-bold">{record.period}</span>
                    </div>
                    {record.program && (
                        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm font-medium border border-gray-200">
                            Chương trình: <span className="font-bold">{record.program}</span>
                        </div>
                    )}
                    {record.submitter && (
                         <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded text-sm font-medium border border-orange-200">
                            Người gửi: <span className="font-bold">{record.submitter}</span> ({record.submittedDate})
                         </div>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                {renderDetailActions(record)}
                <div className="w-px h-8 bg-gray-300 mx-1"></div>
                <Button variant="ghost" onClick={handleBackToList} className="text-black/45 hover:text-vna-blue hover:bg-gray-100">
                    <ArrowLeft size={16} /> Quay lại
                </Button>
            </div>
        </div>
      </>
  );

  // --- 1. ANALYSIS MODE (MERGED) ---
  if (mode === 'analysis') {
    if (viewMode === 'DETAIL' && detailRecord) {
        
        let pageTitle = detailRecord.type === 'Content' ? 'Báo cáo nội dung' : 'Dữ liệu chỉ tiêu';
        
        // --- 1. CONTENT REPORT (Static) ---
        if (detailRecord.type === 'Content') {
             return (
                <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
                    <DetailViewHeader title={pageTitle} record={detailRecord} />
                    <div className="flex-1 flex flex-col border border-gray-300 rounded-lg hover:shadow-md transition-shadow duration-300 overflow-hidden bg-gray-50">
                        {/* Rich Text Toolbar */}
                        <div className="flex items-center gap-1 p-2 bg-white border-b border-gray-200 flex-wrap sticky top-0 z-10">
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="In đậm"><Bold size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="In nghiêng"><Italic size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Gạch chân"><Underline size={18}/></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Căn trái"><AlignLeft size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Căn giữa"><AlignCenter size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Căn phải"><AlignRight size={18}/></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Danh sách"><List size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Trích dẫn"><Quote size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Tiêu đề"><Heading size={18}/></button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Chèn bảng"><Table size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Chèn ảnh"><ImageIcon size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Gắn liên kết"><LinkIcon size={18}/></button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600" title="Đính kèm file"><Paperclip size={18}/></button>
                        </div>
                        
                        <div className="flex-1 p-8 overflow-y-auto bg-gray-50 flex justify-center">
                            <div className="w-full max-w-[850px] min-h-[800px] bg-white shadow-md p-10 outline-none text-black/85 text-base leading-relaxed" contentEditable={isAdjusting}>
                                {detailRecord.code === 'GRI 2-9' ? (
                                    <>
                                        <h1 className="text-2xl font-bold mb-6 text-center text-vna-blue uppercase">CƠ CẤU QUẢN TRỊ VÀ THÀNH PHẦN HỘI ĐỒNG QUẢN TRỊ (GRI 2-9)</h1>
                                        <p className="mb-4 text-justify">
                                            Vietnam Airlines (VNA) hoạt động theo mô hình Công ty Cổ phần với cơ cấu quản trị tuân thủ Luật Doanh nghiệp và Điều lệ Tổng công ty. Hệ thống quản trị của VNA được thiết kế nhằm đảm bảo tính minh bạch, trách nhiệm giải trình và hiệu quả trong hoạt động, hướng tới phát triển bền vững.
                                        </p>

                                        <h3 className="text-lg font-bold mb-3 mt-6 text-gray-900 border-b pb-1">1. Hội đồng quản trị (HĐQT)</h3>
                                        <p className="mb-2">
                                            HĐQT là cơ quan quản trị cao nhất tại Công ty, chịu trách nhiệm trước Đại hội đồng cổ đông về việc quản lý và định hướng chiến lược phát triển. Tính đến ngày 31/12/2025, thành phần HĐQT bao gồm:
                                        </p>
                                        <ul className="list-disc pl-6 mb-4 space-y-1">
                                            <li><strong>Ông Đặng Ngọc Hòa</strong> - Chủ tịch HĐQT</li>
                                            <li><strong>Ông Lê Hồng Hà</strong> - Thành viên HĐQT, Tổng Giám đốc</li>
                                            <li><strong>Ông Lê Trường Giang</strong> - Thành viên HĐQT</li>
                                            <li><strong>Ông Tạ Mạnh Hùng</strong> - Thành viên HĐQT</li>
                                            <li><strong>Ông Patrick Alexandre</strong> - Thành viên HĐQT (Đại diện ANA Holdings)</li>
                                        </ul>

                                        <h3 className="text-lg font-bold mb-3 mt-6 text-gray-900 border-b pb-1">2. Ban Giám đốc</h3>
                                        <p className="mb-2">
                                            Ban Giám đốc chịu trách nhiệm điều hành hoạt động sản xuất kinh doanh hàng ngày của Tổng công ty. Đứng đầu là Tổng Giám đốc Lê Hồng Hà, cùng các Phó Tổng Giám đốc phụ trách các mảng chuyên môn (Khai thác, Kỹ thuật, Thương mại, Dịch vụ, Tài chính...).
                                        </p>

                                        <h3 className="text-lg font-bold mb-3 mt-6 text-gray-900 border-b pb-1">3. Các Ủy ban trực thuộc HĐQT</h3>
                                        <p className="mb-4">Để hỗ trợ hoạt động giám sát và ra quyết định, HĐQT đã thành lập các Ủy ban chuyên trách với chức năng và nhiệm vụ cụ thể:</p>
                                        
                                        {/* Mock Table */}
                                        <table className="w-full border-collapse border border-gray-300 mb-6 text-sm">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border border-gray-300 p-2 text-left font-bold w-1/3">Tên Ủy ban</th>
                                                    <th className="border border-gray-300 p-2 text-left font-bold">Chức năng chính</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 font-medium">Ủy ban Kiểm toán</td>
                                                    <td className="border border-gray-300 p-2">Giám sát tính trung thực của Báo cáo tài chính, hệ thống kiểm soát nội bộ và quản lý rủi ro.</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 font-medium">Ủy ban Nhân sự & Lương thưởng</td>
                                                    <td className="border border-gray-300 p-2">Tham mưu về công tác nhân sự cấp cao, chính sách tiền lương và chế độ đãi ngộ.</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 p-2 font-medium">Tiểu ban PTBV (ESG)</td>
                                                    <td className="border border-gray-300 p-2">Định hướng chiến lược phát triển bền vững, giám sát thực hiện các mục tiêu Net Zero và trách nhiệm xã hội.</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <h3 className="text-lg font-bold mb-3 mt-6 text-gray-900 border-b pb-1">4. Sơ đồ tổ chức</h3>
                                        <div className="w-full h-48 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center mb-4">
                                            <div className="text-center text-gray-400">
                                                <ImageIcon size={48} className="mx-auto mb-2 opacity-50"/>
                                                <span>[Hình ảnh sơ đồ tổ chức VNA]</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold mb-4">1. Nội dung báo cáo mẫu</h3>
                                        <p>Nội dung chi tiết...</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
             );
        }

        // --- 2. DYNAMIC REPORT (With Tabs) ---
        
        // Render Analysis Tab (Embedded Metabase Mock)
        const renderAnalysisTab = () => {
            return (
                <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50 animate-in fade-in duration-300">
                    <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center">
                                <BarChart2 size={14} />
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">Metabase Dashboard Integration</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            Dữ liệu được đồng bộ từ Kho dữ liệu sạch
                        </div>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center bg-gray-100/50">
                        {/* Simulated Iframe / Embed Area */}
                        <div className="absolute inset-4 bg-white hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded flex flex-col items-center justify-center text-center p-8">
                             <div className="w-16 h-16 bg-blue-50 text-vna-blue rounded-full flex items-center justify-center mb-4">
                                 <PieChart size={32} />
                             </div>
                             <h3 className="text-lg font-bold text-black/85 mb-2">Biểu đồ phân tích - {detailRecord.name}</h3>
                             <p className="text-black/45 max-w-md mb-6">
                                 Đây là khu vực hiển thị Dashboard được nhúng từ hệ thống BI (Metabase). 
                                 Người dùng có thể tương tác trực tiếp với các biểu đồ tại đây.
                             </p>
                             <div className="h-64 w-full max-w-2xl bg-gray-50 rounded border border-dashed border-gray-300 flex items-center justify-center">
                                 <span className="text-gray-400 text-sm font-medium">Dashboard Placeholder ({detailRecord.code})</span>
                             </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Render Data Content (Specific Tables based on Code)
        const renderDataContent = () => {
            // --- 2.1 GRI 2-7 (HR DATA) ---
            if (detailRecord.code === 'GRI 2-7') {
                const filteredHR = hrData.filter(f => {
                    const matchSearch = f.name.toLowerCase().includes(detailSearchText.toLowerCase()) || f.empId.toLowerCase().includes(detailSearchText.toLowerCase());
                    if (!matchSearch) return false;
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = {
                    all: hrData.length,
                    system: hrData.filter(f => f.source === 'System').length,
                    manual: hrData.filter(f => f.source === 'Manual').length,
                    error: hrData.filter(f => f.hasError).length,
                };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar 
                            searchText={detailSearchText} setSearchText={setDetailSearchText} 
                            filterStatus={filterStatus} setFilterStatus={setFilterStatus} 
                            stats={detailStats} onAdd={handleAddManual}
                        />
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Mã NV</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Họ tên</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[80px]">Giới tính</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Chức vụ</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Đơn vị</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Ngày vào công ty</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredHR.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-medium text-vna-blue">{row.empId}</td>
                                                <td className="py-2 px-4 font-semibold text-black/85">{row.name}</td>
                                                <td className="py-2 px-4">{row.gender}</td>
                                                <td className="py-2 px-4">{row.position}</td>
                                                <td className="py-2 px-4">{row.department}</td>
                                                <td className="py-2 px-4">{row.joinDate}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        {row.hasError && <div className="text-red-500" title="Lỗi"><AlertTriangle size={16} /></div>}
                                                        <div className="flex justify-center gap-2"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredHR.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.2 AIRLINE B-2 (BSV MEMBERS) ---
            if (detailRecord.code === 'Airline B-2') {
                const filteredBSV = bsvData.filter(f => {
                    const matchSearch = f.name.toLowerCase().includes(detailSearchText.toLowerCase()) || f.memberId.includes(detailSearchText);
                    if (!matchSearch) return false;
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: bsvData.length, system: bsvData.filter(f => f.source === 'System').length, manual: bsvData.filter(f => f.source === 'Manual').length, error: bsvData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Mã hội viên</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[200px]">Tên hội viên</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Hạng thẻ</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Ngày gia nhập</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Trạng thái</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredBSV.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-bold text-vna-blue">{row.memberId}</td>
                                                <td className="py-2 px-4 font-medium text-black/85">{row.name}</td>
                                                <td className="py-2 px-4">{row.tier}</td>
                                                <td className="py-2 px-4">{row.joinDate}</td>
                                                <td className="py-2 px-4">{row.status}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredBSV.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.3 AIRLINE F-1 (VOLUNTARY ACTIVITIES) ---
            if (detailRecord.code === 'Airline F-1') {
                const filteredVoluntary = voluntaryData.filter(f => {
                    const matchSearch = f.eventName.toLowerCase().includes(detailSearchText.toLowerCase());
                    if (!matchSearch) return false;
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: voluntaryData.length, system: 0, manual: voluntaryData.length, error: voluntaryData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[200px]">Tên sự kiện</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[250px]">Mô tả sự kiện</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Thời gian</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">CQĐV chủ trì</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-right">Số người TN</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-right">Số giờ TG</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-right">Tổng NS CQĐV</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[200px]">Kết quả</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredVoluntary.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-bold text-sky-800">{row.eventName}</td>
                                                <td className="py-2 px-4 text-gray-600 line-clamp-2">{row.description}</td>
                                                <td className="py-2 px-4 whitespace-nowrap">{row.date}</td>
                                                <td className="py-2 px-4">{row.organizer}</td>
                                                <td className="py-2 px-4 text-right">{row.volunteerCount}</td>
                                                <td className="py-2 px-4 text-right">{row.totalHours}</td>
                                                <td className="py-2 px-4 text-right">{row.totalStaff}</td>
                                                <td className="py-2 px-4 text-gray-700 italic">{row.result}</td>
                                                <td className="py-2 px-4 text-center"><span className="px-2 py-1 rounded text-xs border bg-orange-50 text-orange-700 border-orange-200">Manual</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredVoluntary.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.4 GRI 404-2 (TRAINING PROGRAMS) ---
            if (detailRecord.code === 'GRI 404-2') {
                const filteredTraining = trainingData.filter(f => {
                    const matchSearch = f.courseName.toLowerCase().includes(detailSearchText.toLowerCase()) || f.courseCode.toLowerCase().includes(detailSearchText.toLowerCase());
                    if (!matchSearch) return false;
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: trainingData.length, system: trainingData.filter(f => f.source === 'System').length, manual: trainingData.filter(f => f.source === 'Manual').length, error: trainingData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Mã khóa học</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[250px]">Tên khóa học</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px] text-right">Số lớp tổ chức</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px] text-right">Số người tham gia</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredTraining.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-medium text-vna-blue">{row.courseCode}</td>
                                                <td className="py-2 px-4 font-semibold text-black/85">{row.courseName}</td>
                                                <td className="py-2 px-4 text-right">{row.classesOrganized}</td>
                                                <td className="py-2 px-4 text-right font-bold text-gray-900">{row.participants.toLocaleString()}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredTraining.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.5 GRI 302-4 (REDUCTION) ---
            if (detailRecord.code === 'GRI 302-4') {
                const filteredReduction = reductionData.filter(f => {
                    const matchSearch = f.flightNo.toLowerCase().includes(detailSearchText.toLowerCase()) || f.initiative.toLowerCase().includes(detailSearchText.toLowerCase());
                    if (!matchSearch) return false;
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: reductionData.length, system: reductionData.filter(f => f.source === 'System').length, manual: reductionData.filter(f => f.source === 'Manual').length, error: reductionData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Ngày bay</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[90px]">Số hiệu</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Tàu bay</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Chặng</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[200px]">Giải pháp áp dụng</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px] text-right">Nhiên liệu tiết kiệm</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-center">Đơn vị</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredReduction.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-medium">{row.date}</td>
                                                <td className="py-2 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                                                <td className="py-2 px-4">{row.aircraft}</td>
                                                <td className="py-2 px-4">{row.route}</td>
                                                <td className="py-2 px-4 text-green-800 font-medium">{row.initiative}</td>
                                                <td className="py-2 px-4 text-right font-bold text-green-600">{row.savedFuel}</td>
                                                <td className="py-2 px-4 text-center">{row.unit}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredReduction.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.6 AIRLINE E-1 (NOISE) ---
            if (detailRecord.code === 'Airline E-1') {
                const filteredNoise = noiseData.filter(f => {
                    const matchSearch = f.regNo.toLowerCase().includes(detailSearchText.toLowerCase());
                    if (!matchSearch) return false;
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: noiseData.length, system: noiseData.filter(f => f.source === 'System').length, manual: noiseData.filter(f => f.source === 'Manual').length, error: noiseData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Số đăng bạ</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Loại tàu bay</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Động cơ</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">ICAO Chapter</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Số chứng chỉ</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Ngày hiệu lực</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredNoise.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-bold text-vna-blue">{row.regNo}</td>
                                                <td className="py-2 px-4">{row.type}</td>
                                                <td className="py-2 px-4 font-mono text-xs">{row.engine}</td>
                                                <td className="py-2 px-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${row.icaoChapter === 'Chapter 14' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>{row.icaoChapter}</span></td>
                                                <td className="py-2 px-4 font-mono text-xs">{row.certNo}</td>
                                                <td className="py-2 px-4">{row.effectiveDate}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredNoise.length} />
                        </div>
                    </div>
                );
            }

            // --- 2.7 AIRLINE B-1 (NPS) ---
            if (detailRecord.code === 'Airline B-1') {
                const filteredNPS = npsData.filter(f => {
                    // NPS filter logic could be extended, currently just status
                    if (filterStatus === 'SYSTEM') return f.source === 'System';
                    if (filterStatus === 'MANUAL') return f.source === 'Manual';
                    if (filterStatus === 'ERROR') return f.hasError;
                    return true;
                });
                const detailStats = { all: npsData.length, system: npsData.filter(f => f.source === 'System').length, manual: npsData.filter(f => f.source === 'Manual').length, error: npsData.filter(f => f.hasError).length };

                return (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                            <div className="overflow-x-auto flex-1">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                        <tr className="text-xs uppercase font-bold">
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Kỳ báo cáo</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Mạng bay</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Đường bay</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Điểm NPS</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-right">Số mẫu</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Điểm chạm</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                            <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                            <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {filteredNPS.map((row) => (
                                            <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                                <td className="py-2 px-4 font-medium">{row.period}</td>
                                                <td className="py-2 px-4">{row.sector}</td>
                                                <td className="py-2 px-4">{row.route}</td>
                                                <td className="py-2 px-4 font-bold text-center"><span className={`${row.npsScore > 50 ? 'text-green-600' : row.npsScore > 0 ? 'text-orange-600' : 'text-red-600'}`}>{row.npsScore}</span></td>
                                                <td className="py-2 px-4 text-right">{row.responseCount.toLocaleString()}</td>
                                                <td className="py-2 px-4">{row.touchpoint}</td>
                                                <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                                <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                                <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <DetailPagination count={filteredNPS.length} />
                        </div>
                    </div>
                );
            }

            // DEFAULT CASE (FUEL / FLIGHT DATA)
            const filteredFlight = flightData.filter(f => {
                const matchSearch = f.flightNo.toLowerCase().includes(detailSearchText.toLowerCase());
                if (!matchSearch) return false;
                if (filterStatus === 'SYSTEM') return f.source === 'System';
                if (filterStatus === 'MANUAL') return f.source === 'Manual';
                if (filterStatus === 'ERROR') return f.hasError;
                return true;
            });
            const detailStats = { all: flightData.length, system: flightData.filter(f => f.source === 'System').length, manual: flightData.filter(f => f.source === 'Manual').length, error: flightData.filter(f => f.hasError).length };

            return (
                <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                    <DetailToolbar searchText={detailSearchText} setSearchText={setDetailSearchText} filterStatus={filterStatus} setFilterStatus={setFilterStatus} stats={detailStats} onAdd={handleAddManual}/>
                    <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow duration-300">
                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-vna-blue/5 text-vna-blue sticky top-0 z-10 hover:shadow-md transition-shadow duration-300 border-b border-blue-100">
                                    <tr className="text-xs uppercase font-bold">
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Ngày bay</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[90px]">Số hiệu</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[120px]">Tàu bay</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[100px]">Chặng</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-right">Nạp (Uplift)</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-right">Hút (Defuel)</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-right">Tiêu thụ</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-right text-green-700">SAF Nạp</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[80px] text-right text-green-700">SAF Tiêu thụ</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[100px] text-center">Nguồn</th>
                                        <th className="py-3 px-4 border-b border-blue-100 min-w-[150px]">Ghi chú</th>
                                        <th className="py-3 px-4 border-b border-blue-100 w-[80px] text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {filteredFlight.map((row) => (
                                        <tr key={row.id} className={`hover:bg-blue-50 ${row.hasError ? 'bg-red-50' : ''}`}>
                                            <td className="py-2 px-4 font-medium">{row.date}</td>
                                            <td className="py-2 px-4 font-bold text-vna-blue">{row.flightNo}</td>
                                            <td className="py-2 px-4">{row.aircraft}</td>
                                            <td className="py-2 px-4">{row.route}</td>
                                            <td className="py-2 px-4 text-right">{row.jetUplift.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-right">{row.jetDefuel.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-right font-bold text-blue-700">{row.jetBurn.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-right text-green-700">{row.safUplift.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-right font-bold text-green-700">{row.safBurn.toLocaleString()}</td>
                                            <td className="py-2 px-4 text-center"><span className={`px-2 py-1 rounded text-xs border ${row.source === 'System' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{row.source}</span></td>
                                            <td className="py-2 px-4 text-black/45 italic max-w-[200px] truncate" title={row.note}>{row.note}</td>
                                            <td className="py-2 px-4 text-center"><Edit3 size={16} className="text-gray-400 hover:text-blue-600 cursor-pointer"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <DetailPagination count={filteredFlight.length} />
                    </div>
                </div>
            );
        };

        // --- RENDER DYNAMIC DETAIL VIEW ---
        return (
            <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
                <DetailViewHeader title={pageTitle} record={detailRecord} />
                
                {/* TABS Navigation */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button 
                        onClick={() => setActiveTab('DATA')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'DATA' ? 'border-vna-blue text-vna-blue' : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <Table size={16} /> Dữ liệu chi tiết
                    </button>
                    <button 
                        onClick={() => setActiveTab('ANALYSIS')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ANALYSIS' ? 'border-vna-blue text-vna-blue' : 'border-transparent text-black/45 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <BarChart2 size={16} /> Phân tích & Biểu đồ
                    </button>
                </div>

                {/* TAB CONTENT AREA */}
                <div className="flex-1 flex flex-col min-h-0">
                    {activeTab === 'DATA' ? renderDataContent() : renderAnalysisTab()}
                </div>
            </div>
        );
    }

    // LIST VIEW (Unchanged Logic)
    const filteredRecords = MOCK_ANALYSIS_DATA.filter(rec => {
        const matchProgram = !selectedProgram || rec.program === selectedProgram;
        const matchPillar = !selectedPillar || rec.pillar === selectedPillar;
        const matchPeriod = selectedPeriods.length === 0 || selectedPeriods.includes(rec.period);
        return matchProgram && matchPillar && matchPeriod;
    });
    
    const isDataVisible = selectedPeriods.length > 0;

    // Stats
    const listStats = {
        total: MOCK_ANALYSIS_DATA.length,
        pending: MOCK_ANALYSIS_DATA.filter(t => t.status === 'Pending').length,
        approved: MOCK_ANALYSIS_DATA.filter(t => t.status === 'Approved').length,
    };

    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div>
             <h2 className="text-xl font-bold text-vna-blue">Phân tích & Phê duyệt Dữ liệu ESG</h2>
             <p className="text-sm text-black/45 mt-1">Theo dõi tiến độ, phân tích số liệu và phê duyệt báo cáo</p>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                <div>
                    <div className="text-xs text-black/45 uppercase font-semibold tracking-wider mb-1">Tổng chỉ tiêu</div>
                    <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-black/85">{listStats.total}</span></div>
                </div>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:shadow-md transition-shadow duration-300"><Layers size={20}/></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                <div>
                    <div className="text-xs text-black/45 uppercase font-semibold tracking-wider mb-1">Chờ duyệt</div>
                    <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-black/85">{listStats.pending}</span></div>
                </div>
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:shadow-md transition-shadow duration-300"><Clock size={20}/></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 flex items-center justify-between">
                <div>
                    <div className="text-xs text-black/45 uppercase font-semibold tracking-wider mb-1">Đã duyệt</div>
                    <div className="flex items-baseline gap-1"><span className="text-2xl font-bold text-black/85">{listStats.approved}</span></div>
                </div>
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:shadow-md transition-shadow duration-300"><CheckCircle size={20}/></div>
            </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 bg-white p-5 rounded-lg border border-gray-200 items-end hover:shadow-md transition-shadow duration-300">
           <div className="md:col-span-4"><ReportingPeriodTreeSelect selected={selectedPeriods} onChange={setSelectedPeriods} /></div>
           <div className="md:col-span-3">
              <Select label="Trụ cột" placeholder="Tất cả trụ cột" options={[{label: 'Tất cả', value: ''}, {label: 'Môi trường (E)', value: Pillar.ENVIRONMENT}, {label: 'Xã hội (S)', value: Pillar.SOCIAL}, {label: 'Quản trị (G)', value: Pillar.GOVERNANCE}]} value={selectedPillar} onChange={setSelectedPillar} disabled={!isDataVisible}/>
           </div>
           <div className="md:col-span-3">
              <Select label="Chương trình" placeholder="Tất cả chương trình" options={[{label: 'Tất cả', value: ''}, {label: 'CORSIA', value: 'CORSIA'}, {label: 'EU ETS', value: 'EU ETS'}, {label: 'UK ETS', value: 'UK ETS'}]} value={selectedProgram} onChange={setSelectedProgram} disabled={!isDataVisible}/>
           </div>
           <div className="md:col-span-2 flex gap-2">
              <Button className="flex-1 bg-vna-blue" disabled={!isDataVisible}><Search size={16}/> Tìm kiếm</Button>
              <Button variant="outline" className="px-3" onClick={() => {setSelectedPeriods([]); setSelectedProgram(''); setSelectedPillar('');}} disabled={!isDataVisible}><X size={18} /></Button>
           </div>
        </div>

        {/* Table - Unified "Approval" Style */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px] hover:shadow-md transition-shadow duration-300">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-vna-blue text-white sticky top-0 z-10 shadow-md">
                    <tr>
                        <th rowSpan={2} className="px-4 py-3 text-center text-sm font-bold w-12 border-r border-white/20">STT</th>
                        <th rowSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-white/20 min-w-[120px]">Mã chỉ tiêu</th>
                        <th rowSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-white/20 min-w-[250px]">Tên chỉ tiêu</th>
                        <th rowSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-white/20 min-w-[130px]">Trụ cột</th>
                        <th rowSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-white/20 min-w-[100px]">Chương trình</th>
                        <th rowSpan={2} className="px-4 py-3 text-left text-sm font-bold border-r border-white/20 min-w-[120px]">Kỳ báo cáo</th>
                        <th colSpan={3} className="px-4 py-2 text-center text-sm font-bold border-b border-white/20 border-r border-white/20 bg-white/10">Phân tích số liệu</th>
                        <th rowSpan={2} className="px-4 py-3 text-center text-sm font-bold border-r border-white/20 min-w-[140px]">Trạng thái</th>
                        <th rowSpan={2} className="px-4 py-3 text-center text-sm font-bold w-16"></th>
                    </tr>
                    <tr>
                        <th className="px-4 py-2 text-right text-xs font-bold border-r border-white/20 bg-white/5 min-w-[120px]">Thực tế</th>
                        <th className="px-4 py-2 text-right text-xs font-bold border-r border-white/20 bg-white/5 min-w-[100px]">So kỳ trước</th>
                        <th className="px-4 py-2 text-right text-xs font-bold border-r border-white/20 bg-white/5 min-w-[100px]">So KPI</th>
                    </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-100">
                 {!isDataVisible ? (
                    <tr><td colSpan={12} className="py-20 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><Calendar size={48} className="mb-3 opacity-20"/><p>Vui lòng chọn Kỳ báo cáo để bắt đầu</p></div></td></tr>
                 ) : filteredRecords.length > 0 ? (
                   filteredRecords.map((record, index) => (
                     <tr key={record.id} className="hover:bg-blue-50/50 transition-colors group cursor-pointer border-b border-gray-50" onClick={() => handleViewDetail(record)}>
                       <td className="px-4 py-4 text-center text-sm text-black/45 font-medium">{index + 1}</td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-vna-blue">{record.code}</td>
                       <td className="px-4 py-4 text-sm text-black/85 font-medium">
                          <div className="line-clamp-2">{record.name}</div>
                          {record.submitter && (
                              <div className="text-xs text-gray-400 font-normal mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span> Gửi bởi: {record.submitter}</div>
                          )}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap"><PillarBadge pillar={record.pillar} /></td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {record.program ? <span className="text-[11px] bg-gray-100 border border-gray-200 px-2 py-1 rounded font-semibold text-gray-600">{record.program}</span> : <span className="text-gray-300 text-xs italic">-</span>}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPeriodDisplay(record.period)}</td>
                       <td className="px-4 py-4 text-right text-sm bg-gray-50/30 border-l border-gray-100">
                           {record.type === 'Content' || record.value === undefined ? <span className="text-gray-300 text-center block">-</span> : <div className="font-bold text-gray-900">{record.value.toLocaleString()} <span className="text-[10px] font-normal text-black/45 ml-0.5">{record.unit}</span></div>}
                       </td>
                       <td className="px-4 py-4 text-right text-sm bg-gray-50/30">
                           {record.type === 'Content' ? <span className="text-gray-300 text-center block">-</span> : renderTrend(record.value, record.previousValue)}
                       </td>
                       <td className="px-4 py-4 text-right text-sm bg-gray-50/30 border-r border-gray-100">
                           {record.type === 'Content' ? <span className="text-gray-300 text-center block">-</span> : renderKPIProgress(record.value, record.kpiTarget)}
                       </td>
                       <td className="px-4 py-4 whitespace-nowrap text-center"><CollectionStatusBadge status={record.status} /></td>
                       <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                         <button className="p-2 rounded-full text-gray-400 hover:bg-white hover:text-vna-blue hover:hover:shadow-md transition-shadow duration-300 transition-all"><ChevronRight size={18} /></button>
                       </td>
                     </tr>
                   ))
                 ) : (
                    <tr><td colSpan={12} className="py-12 text-center text-gray-400">Không tìm thấy dữ liệu phù hợp.</td></tr>
                 )}
               </tbody>
             </table>
        </div>
      </div>
    );
  }

  // --- 2. LOGS MODE ---
  if (mode === 'logs') {
    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <h2 className="text-xl font-bold text-vna-blue">Nhật ký Tích hợp Dữ liệu</h2>
           <div className="flex gap-2"><Button variant="outline" className="text-vna-blue border-vna-blue hover:bg-blue-50"><RefreshCw size={16} /> Làm mới</Button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200">
           <div className="md:col-span-5"><input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-vna-blue outline-none" /></div>
           <div className="md:col-span-5"><Select options={[{label: 'Tất cả trạng thái', value: 'all'}]} placeholder="Tất cả trạng thái" /></div>
           <div className="md:col-span-2"><Button className="w-full bg-vna-blue"><Search size={16}/> Lọc</Button></div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-vna-blue text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">STT</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Thời gian</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nguồn dữ liệu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Số bản ghi</th>
                <th className="px-4 py-3 text-left text-sm font-semibold rounded-tr-lg">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-blue-50">
                <td className="px-4 py-3 text-sm text-black/45">1</td>
                <td className="px-4 py-3 text-sm">2023-10-25 08:00</td>
                <td className="px-4 py-3 text-sm font-medium">Flight Ops System</td>
                <td className="px-4 py-3 text-sm">1,250</td>
                <td className="px-4 py-3 text-sm"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-200">Success</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};
