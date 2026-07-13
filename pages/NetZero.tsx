import React, { useState, useMemo } from 'react';
import { Button, Card, Input, Select, StatusChip } from '../components/UI';
import { 
  Plus, Play, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, 
  DollarSign, Plane, RefreshCw, Search, X, Download, Edit2, 
  Trash2, Info, Upload, Check, FileText, Sparkles, ShieldAlert, Leaf
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

// --- DATA STRUCTURES ---

interface ReFuelEURow {
  airportIcao: string; // 1. ICAO Code of Union Airport
  supplier: string; // 2. Fuel Supplier
  supplierVat: string; // 3. VAT Number of Aviation Fuel Supplier
  batchNumber: string; // 4. Batch Number
  amountPurchased: number; // 5. Amount Purchased (tonnes)
  category: string; // 6. Category
  process: string; // 7. Process
  feedstock: string; // 8. Feedstock
  origin: string; // 9. Origin
  lifecycleEmissions: number; // 10. Lifecycle emissions (gCO2eq/MJ)
  // 11-16. Lượng kê khai bù trừ dưới các MBMs
  claimedEu: number; // 11. Eligible Fuel claimed under EU
  claimedCh: number; // 12. Eligible Fuel claimed under CH
  claimedUk: number; // 13. Eligible Fuel claimed under UK
  claimedCorsia: number; // 14. Eligible Fuel claimed under CORSIA
  claimedOtherMbm1: number; // 15. Eligible Fuel claimed under other MBMs 1
  claimedOtherMbm2: number; // 16. Eligible Fuel claimed under other MBMs 2
}

interface SimulationScenario {
  id: string;
  name: string;
  reportPeriod: string; // Kỳ báo cáo (ví dụ: Tháng 03/2026)
  scenarioType: string; // Loại kịch bản (mặc định: "Tối ưu mua tín chỉ CO2 đền bù")
  status: 'Draft' | 'Approved'; // Trạng thái: Nháp, Phê duyệt
  updatedAt: string;
  totalCo2Saving: number; // Tổng lượng CO2 giảm trừ (tCO2)
  totalCostSaved: number; // Chi phí tiết kiệm được (USD)
  priceEua: number; // Giá EUA (EU ETS)
  priceUka: number; // Giá UKA (UK ETS)
  priceCorsia: number; // Giá CORSIA
  obligationEu: number; // Nghĩa vụ nợ CO2 EU ETS
  obligationUk: number; // Nghĩa vụ nợ CO2 UK ETS
  obligationCorsia: number; // Nghĩa vụ nợ CO2 CORSIA
  safRows: ReFuelEURow[];
  isOptimized?: boolean;
  baseYear?: number;
  xSaf?: number;
  xPlane?: number;
  xRoute?: number;
  xWeight?: number;
  xSolar?: number;
  xOffset?: number;
}

// --- MOCK TEMPLATES FOR EXCEL ---
const MOCK_EXCEL_TEMPLATE: ReFuelEURow[] = [
  {
    airportIcao: 'LFPG',
    supplier: 'TotalEnergies',
    supplierVat: 'FR88123456789',
    batchNumber: 'LOT-SAF-001',
    amountPurchased: 300,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'UCO (Dầu ăn thải)',
    origin: 'EU',
    lifecycleEmissions: 18.5,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'EGLL',
    supplier: 'Shell Aviation',
    supplierVat: 'GB44987654321',
    batchNumber: 'LOT-SAF-002',
    amountPurchased: 250,
    category: 'Sustainable Aviation Fuel',
    process: 'FT-SPK',
    feedstock: 'Agricultural Waste',
    origin: 'UK',
    lifecycleEmissions: 22.0,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'LSGG',
    supplier: 'BP Aviation',
    supplierVat: 'CH22119933551',
    batchNumber: 'LOT-SAF-003',
    amountPurchased: 120,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'Animal Fat',
    origin: 'Switzerland',
    lifecycleEmissions: 19.5,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'VVTS',
    supplier: 'Neste Aviation',
    supplierVat: 'SG2026NET091',
    batchNumber: 'LOT-SAF-004',
    amountPurchased: 400,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'Used Cooking Oil',
    origin: 'Singapore',
    lifecycleEmissions: 21.0,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  },
  {
    airportIcao: 'WSSS',
    supplier: 'Sinopec Fuel',
    supplierVat: 'SG99228833441',
    batchNumber: 'LOT-SAF-005',
    amountPurchased: 200,
    category: 'Sustainable Aviation Fuel',
    process: 'HEFA-SPK',
    feedstock: 'Palm Residues',
    origin: 'Asia',
    lifecycleEmissions: 24.5,
    claimedEu: 0,
    claimedCh: 0,
    claimedUk: 0,
    claimedCorsia: 0,
    claimedOtherMbm1: 0,
    claimedOtherMbm2: 0
  }
];

const INITIAL_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SIM-2026-03',
    name: 'Tối ưu hóa phân bổ cấn trừ SAF - Kỳ 03/2026',
    reportPeriod: 'Tháng 03/2026',
    scenarioType: 'Tối ưu mua tín chỉ CO2 đền bù',
    status: 'Approved',
    updatedAt: '2026-05-23',
    totalCo2Saving: 2042.8,
    totalCostSaved: 106950,
    priceEua: 85,
    priceUka: 70,
    priceCorsia: 15,
    obligationEu: 18150,
    obligationUk: 10050,
    obligationCorsia: 43200,
    isOptimized: true,
    safRows: [
      {
        airportIcao: 'LFPG',
        supplier: 'TotalEnergies',
        supplierVat: 'FR88123456789',
        batchNumber: 'LOT-SAF-001',
        amountPurchased: 300,
        category: 'Sustainable Aviation Fuel',
        process: 'HEFA-SPK',
        feedstock: 'UCO (Dầu ăn thải)',
        origin: 'EU',
        lifecycleEmissions: 18.5,
        claimedEu: 750.9,
        claimedCh: 0,
        claimedUk: 0,
        claimedCorsia: 0,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      },
      {
        airportIcao: 'EGLL',
        supplier: 'Shell Aviation',
        supplierVat: 'GB44987654321',
        batchNumber: 'LOT-SAF-002',
        amountPurchased: 250,
        category: 'Sustainable Aviation Fuel',
        process: 'FT-SPK',
        feedstock: 'Agricultural Waste',
        origin: 'UK',
        lifecycleEmissions: 22.0,
        claimedEu: 0,
        claimedCh: 0,
        claimedUk: 594.7,
        claimedCorsia: 0,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      },
      {
        airportIcao: 'LSGG',
        supplier: 'BP Aviation',
        supplierVat: 'CH22119933551',
        batchNumber: 'LOT-SAF-003',
        amountPurchased: 120,
        category: 'Sustainable Aviation Fuel',
        process: 'HEFA-SPK',
        feedstock: 'Animal Fat',
        origin: 'Switzerland',
        lifecycleEmissions: 19.5,
        claimedEu: 0,
        claimedCh: 295.6,
        claimedUk: 0,
        claimedCorsia: 0,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      },
      {
        airportIcao: 'VVTS',
        supplier: 'Neste Aviation',
        supplierVat: 'SG2026NET091',
        batchNumber: 'LOT-SAF-004',
        amountPurchased: 400,
        category: 'Sustainable Aviation Fuel',
        process: 'HEFA-SPK',
        feedstock: 'Used Cooking Oil',
        origin: 'Singapore',
        lifecycleEmissions: 21.0,
        claimedEu: 0,
        claimedCh: 0,
        claimedUk: 0,
        claimedCorsia: 965.1,
        claimedOtherMbm1: 0,
        claimedOtherMbm2: 0
      }
    ]
  },
  {
    id: 'SIM-2026-04',
    name: 'Kịch bản giả lập tối ưu phát thải - Kỳ 04/2026',
    reportPeriod: 'Tháng 04/2026',
    scenarioType: 'Tối ưu mua tín chỉ CO2 đền bù',
    status: 'Draft',
    updatedAt: '2026-05-24',
    totalCo2Saving: 0,
    totalCostSaved: 0,
    priceEua: 85,
    priceUka: 70,
    priceCorsia: 15,
    obligationEu: 20000,
    obligationUk: 10000,
    obligationCorsia: 50000,
    isOptimized: false,
    safRows: []
  }
];

const emptyRow: ReFuelEURow = {
  airportIcao: '',
  supplier: '',
  supplierVat: '',
  batchNumber: '',
  amountPurchased: 0,
  category: 'Sustainable Aviation Fuel',
  process: 'HEFA-SPK',
  feedstock: '',
  origin: '',
  lifecycleEmissions: 0,
  claimedEu: 0,
  claimedCh: 0,
  claimedUk: 0,
  claimedCorsia: 0,
  claimedOtherMbm1: 0,
  claimedOtherMbm2: 0
};

// --- NET ZERO 2050 SIMULATION CONSTANTS & DATASETS ---
const BASE_DATASETS: Record<string, {
  totalCo2: number;
  safLoaded: number;
  safCost: number;
  avgEmission: number;
  planes: { b787: number; a350: number; a321: number; a321neo: number; };
}> = {
  '2023': {
    totalCo2: 2400000,
    safLoaded: 3000,
    safCost: 9000000,
    avgEmission: 24000,
    planes: { b787: 15, a350: 14, a321: 52, a321neo: 20 }
  },
  '2024': {
    totalCo2: 2600000,
    safLoaded: 4500,
    safCost: 13500000,
    avgEmission: 25500,
    planes: { b787: 16, a350: 14, a321: 50, a321neo: 22 }
  },
  '2025': {
    totalCo2: 2800000,
    safLoaded: 6000,
    safCost: 18000000,
    avgEmission: 26400,
    planes: { b787: 18, a350: 15, a321: 48, a321neo: 25 }
  }
};

const COST_COEFFICIENTS = {
  saf: 3000,     // USD per ton CO2 reduced via SAF
  plane: 12000,  // USD per ton CO2 reduced via new plane replacement
  route: 1500,   // USD per ton CO2 reduced via route optimization
  weight: 1000,  // USD per ton CO2 reduced via weight optimization
  solar: 2500,   // USD per ton CO2 reduced via solar
  offset: 35     // USD per ton CO2 reduced via offset credits
};

export const NetZeroPage: React.FC<{ mode: 'simulation' | 'comparison' | 'reports' }> = ({ mode }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(INITIAL_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  
  // Filters State
  const [searchText, setSearchText] = useState('');
  
  // Grid State
  const [safRows, setSafRows] = useState<ReFuelEURow[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isTableEditing, setIsTableEditing] = useState(false);
  const [backupSafRows, setBackupSafRows] = useState<ReFuelEURow[]>([]);

  // --- NET ZERO 2050 STATE VARIABLES ---
  const [isSelectTypeModalOpen, setIsSelectTypeModalOpen] = useState(false);
  const [baseYear, setBaseYear] = useState<number>(2025);
  
  // Independent / Uniform simulation mode
  const [simulationMode, setSimulationMode] = useState<'INDEPENDENT' | 'UNIFORM'>('INDEPENDENT');
  const [globalFactor, setGlobalFactor] = useState<number>(0); // -20% to +20%
  const [unlinkedLevers, setUnlinkedLevers] = useState<string[]>([]); // list of slider keys unlinked from global factor

  // Baselines for levers
  const baselineLevers = {
    saf: 3,        // 3%
    fleet: 20,     // 20%
    route: 0,      // 0%
    loadFactor: 80 // 80%
  };

  const calculateEmissionsForYear = (
    year: number,
    targetFleet: number,
    targetSaf: number,
    targetRoute: number,
    targetLoadFactor: number
  ) => {
    if (year === 2019) return 1340;
    const fraction = (year - 2019) / (2050 - 2019);

    // Interpolated lever values for this year
    const fleetNewTech = 20 + (targetFleet - 20) * fraction;
    const safBlend = 3 + (targetSaf - 3) * fraction;
    const opsOpt = 0 + (targetRoute - 0) * fraction;
    const loadFactor = 80 + (targetLoadFactor - 80) * fraction;

    // Growth Factor
    const growthFactor = Math.pow(1 + 0.035, year - 2019);

    // Fleet Efficiency Factor
    const fleetEff = (1 - fleetNewTech / 100) * 1.00 + (fleetNewTech / 100) * 0.86;
    const fleetEff2019 = 0.972;
    const fleetFactor = fleetEff / fleetEff2019;

    // Load Factor Factor (higher load factor reduces fuel)
    const loadFactorFactor = 80 / loadFactor;

    // Operations Optimization Factor
    const opsFactor = 1 - opsOpt / 100;

    // Total Fuel & CO2
    const fuel2019 = 1340 / 3.16; // baseline fuel
    const totalFuel = fuel2019 * growthFactor * fleetFactor * loadFactorFactor * opsFactor;
    const jetFuel = totalFuel * (1 - safBlend / 100);
    const safFuel = totalFuel * (safBlend / 100);

    // CO2 = jetFuel * 3.16 + safFuel * 3.16 * (1 - 75%)
    const co2Gross = (jetFuel * 3.16) + (safFuel * 3.16 * 0.25);
    return co2Gross;
  };

  // 6 Simulation Levers state
  const [valSaf, setValSaf] = useState<number>(3);
  const [valFlights, setValFlights] = useState<number>(0);
  const [valLoadFactor, setValLoadFactor] = useState<number>(0);
  const [valFleet, setValFleet] = useState<number>(0);
  const [valRoute, setValRoute] = useState<number>(0);
  const [valOffset, setValOffset] = useState<number>(0);

  // Scenario management & comparisons
  const [compareScenarioIds, setCompareScenarioIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Core Parameters
  const [reportPeriod, setReportPeriod] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Approved'>('Draft');
  const [priceEua, setPriceEua] = useState(85);
  const [priceUka, setPriceUka] = useState(70);
  const [priceCorsia, setPriceCorsia] = useState(15);
  const [price2030, setPrice2030] = useState<number>(45);
  const [price2040, setPrice2040] = useState<number>(100);
  const [price2050, setPrice2050] = useState<number>(150);

  // --- POPUP MODAL STATE & INLINE EDITING CONFIG ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRowForm, setEditRowForm] = useState<ReFuelEURow>(emptyRow);
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<'EU' | 'UK' | 'CH' | 'CORSIA' | null>(null);

  // Helper Geofence check (Obligation default is geography, but claims are fully selectable)
  const getRowGeofence = (row: ReFuelEURow) => {
    // Nghĩa vụ trả nợ mặc định lấy theo địa lý sân bay, nhưng Schema cấn trừ có thể tự do lựa chọn theo quyết định kinh tế của VNA
    return { eu: true, uk: true, ch: true, corsia: true };
  };

  // Toggle checkbox on table directly
  const handleToggleRowSchema = (idx: number, schema: 'EU' | 'UK' | 'CH' | 'CORSIA') => {
    const updated = [...safRows];
    const row = updated[idx];
    const reductionFactor = 1 - (row.lifecycleEmissions / 89);
    const calculatedSaving = Number((row.amountPurchased * 3.16 * reductionFactor).toFixed(2));

    const isCurrentSchemaChecked = 
      (schema === 'EU' && row.claimedEu > 0) ||
      (schema === 'UK' && row.claimedUk > 0) ||
      (schema === 'CH' && row.claimedCh > 0) ||
      (schema === 'CORSIA' && row.claimedCorsia > 0);

    updated[idx] = {
      ...row,
      claimedEu: !isCurrentSchemaChecked && schema === 'EU' ? calculatedSaving : 0,
      claimedUk: !isCurrentSchemaChecked && schema === 'UK' ? calculatedSaving : 0,
      claimedCh: !isCurrentSchemaChecked && schema === 'CH' ? calculatedSaving : 0,
      claimedCorsia: !isCurrentSchemaChecked && schema === 'CORSIA' ? calculatedSaving : 0,
    };
    setSafRows(updated);
    setIsOptimized(true);
  };

  // --- OBLIGATIONS STATES (CALCULATED FROM OPERATIONS GEOGRAPHY - READ ONLY) ---
  const [obligationEu, setObligationEu] = useState(20000);
  const [obligationUk, setObligationUk] = useState(10000);
  const [obligationCorsia, setObligationCorsia] = useState(50000);

  // --- ACTIONS ---

  const handleAddNew = () => {
    setIsSelectTypeModalOpen(true);
  };

  const handleCreateComplianceScenario = () => {
    const today = new Date();
    const periodStr = `Tháng ${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    setReportPeriod(periodStr);
    setStatus('Draft');
    setPriceEua(85);
    setPriceUka(70);
    setPriceCorsia(15);
    setObligationEu(20000);
    setObligationUk(10000);
    setObligationCorsia(50000);
    
    const initialRows = JSON.parse(JSON.stringify(MOCK_EXCEL_TEMPLATE));
    setSafRows(initialRows);
    setIsOptimized(false);
    setIsTableEditing(false);
    setBackupSafRows([]);
    
    setActiveScenario({
      id: `SIM-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random()*1000)}`,
      name: `Kịch bản tối ưu hóa chi phí đền bù - Kỳ ${today.getMonth() + 1}/${today.getFullYear()}`,
      reportPeriod: periodStr,
      scenarioType: 'Tối ưu mua tín chỉ CO2 đền bù',
      status: 'Draft',
      updatedAt: today.toISOString().split('T')[0],
      totalCo2Saving: 0,
      totalCostSaved: 0,
      priceEua: 85,
      priceUka: 70,
      priceCorsia: 15,
      obligationEu: 20000,
      obligationUk: 10000,
      obligationCorsia: 50000,
      safRows: initialRows
    });
    
    setIsSelectTypeModalOpen(false);
    setViewMode('DETAIL');
  };

  const handleCreateNetZeroScenario = () => {
    const today = new Date();
    const periodStr = `Tháng ${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    setReportPeriod(periodStr);
    setStatus('Draft');
    setBaseYear(2025);
    setValSaf(3);
    setValFleet(20);
    setValRoute(0);
    setValLoadFactor(80);
    setSimulationMode('INDEPENDENT');
    setGlobalFactor(0);
    setUnlinkedLevers([]);

    setActiveScenario({
      id: `NZ-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random()*1000)}`,
      name: `Kịch bản mô phỏng Net Zero 2050 - Kỳ ${today.getMonth() + 1}/${today.getFullYear()}`,
      reportPeriod: periodStr,
      scenarioType: 'Mô phỏng Net Zero 2050',
      status: 'Draft',
      updatedAt: today.toISOString().split('T')[0],
      totalCo2Saving: 0,
      totalCostSaved: 0,
      priceEua: 0,
      priceUka: 0,
      priceCorsia: 0,
      obligationEu: 0,
      obligationUk: 0,
      obligationCorsia: 0,
      safRows: [],
      baseYear: 2025,
      xSaf: 3,
      xWeight: 20, // Maps to valFleet
      xSolar: 0,   // Maps to valRoute
      xRoute: 80,  // Maps to valLoadFactor
    });
    
    setIsSelectTypeModalOpen(false);
    setViewMode('DETAIL');
  };

  const handleEdit = (sc: SimulationScenario) => {
    setActiveScenario({ ...sc });
    setReportPeriod(sc.reportPeriod);
    setStatus(sc.status);
    
    if (sc.scenarioType === 'Mô phỏng Net Zero 2050') {
      setBaseYear(sc.baseYear || 2025);
      setValSaf(sc.xSaf !== undefined ? sc.xSaf : 3);
      setValFleet(sc.xWeight !== undefined ? sc.xWeight : 20);
      setValRoute(sc.xSolar !== undefined ? sc.xSolar : 0);
      setValLoadFactor(sc.xRoute !== undefined ? sc.xRoute : 80);
      setSimulationMode('INDEPENDENT');
      setGlobalFactor(0);
      setUnlinkedLevers([]);
    } else {
      setPriceEua(sc.priceEua);
      setPriceUka(sc.priceUka);
      setPriceCorsia(sc.priceCorsia);
      setObligationEu(sc.obligationEu);
      setObligationUk(sc.obligationUk);
      setObligationCorsia(sc.obligationCorsia);
      setSafRows([...sc.safRows]);
      setIsOptimized(sc.isOptimized || false);
      setIsTableEditing(false);
      setBackupSafRows([]);
    }
    
    setViewMode('DETAIL');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa kịch bản mô phỏng này?")) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const simulateExcelUpload = () => {
    setSafRows(JSON.parse(JSON.stringify(MOCK_EXCEL_TEMPLATE)));
    setIsOptimized(false);
    alert("Giả lập nạp thành công dữ liệu thô ReFuelEU SAF!");
  };

  const handleOpenEditRowModal = (idx: number, row: ReFuelEURow) => {
    setEditingRowIdx(idx);
    setEditRowForm({ ...row });
    
    // Determine initially checked schema checkbox
    if (row.claimedEu > 0) setSelectedSchema('EU');
    else if (row.claimedUk > 0) setSelectedSchema('UK');
    else if (row.claimedCh > 0) setSelectedSchema('CH');
    else if (row.claimedCorsia > 0) setSelectedSchema('CORSIA');
    else setSelectedSchema(null);

    setIsModalOpen(true);
  };

  const handleSaveRow = () => {
    if (!editRowForm.airportIcao || !editRowForm.supplier || !editRowForm.batchNumber) {
      alert("Vui lòng nhập đầy đủ Sân bay, Nhà cung cấp và Số lô hàng!");
      return;
    }
    if (editRowForm.amountPurchased < 0 || editRowForm.lifecycleEmissions < 0) {
      alert("Khối lượng hoặc lượng phát thải không được âm!");
      return;
    }

    // Automatically calculate CO2 savings
    const reductionFactor = 1 - (editRowForm.lifecycleEmissions / 89);
    const calculatedSaving = Number((editRowForm.amountPurchased * 3.16 * reductionFactor).toFixed(2));

    // Clear all claims first and set the checked schema
    const updatedForm: ReFuelEURow = {
      ...editRowForm,
      claimedEu: selectedSchema === 'EU' ? calculatedSaving : 0,
      claimedUk: selectedSchema === 'UK' ? calculatedSaving : 0,
      claimedCh: selectedSchema === 'CH' ? calculatedSaving : 0,
      claimedCorsia: selectedSchema === 'CORSIA' ? calculatedSaving : 0,
    };

    if (editingRowIdx !== null) {
      const updated = [...safRows];
      updated[editingRowIdx] = updatedForm;
      setSafRows(updated);
    }
    setIsModalOpen(false);
    setIsOptimized(true); // Treat as optimized since user manually claim-assigned
  };

  const handleDeleteRow = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa dòng giao dịch này?")) {
      const updated = safRows.filter((_, i) => i !== idx);
      setSafRows(updated);
      setIsOptimized(false);
    }
  };

  // --- CORE OPTIMIZATION ENGINE ---
  const runOptimization = () => {
    if (safRows.length === 0) {
      alert("Vui lòng nạp dữ liệu SAF (Tải file Excel) trước khi chạy tối ưu chi phí!");
      return;
    }

    let updatedRows: ReFuelEURow[] = safRows.map(row => ({
      ...row,
      claimedEu: 0,
      claimedCh: 0,
      claimedUk: 0,
      claimedCorsia: 0,
      claimedOtherMbm1: 0,
      claimedOtherMbm2: 0
    }));

    // Step 1: Calculate CO2 Saving and verify geofencing schemes
    const processedRows = updatedRows.map(row => {
      const reductionFactor = 1 - (row.lifecycleEmissions / 89);
      const rowCo2Saving = row.amountPurchased * 3.16 * reductionFactor;
      
      let scheme: 'EU' | 'UK' | 'CH' | 'CORSIA' = 'CORSIA';
      const icao2 = row.airportIcao.substring(0, 2);
      
      if (['LF', 'ED', 'EB', 'EH', 'EI', 'EK', 'EL', 'EP', 'ES', 'EV', 'EY'].includes(icao2) || row.origin === 'EU') {
        scheme = 'EU';
      } else if (['EG'].includes(icao2) || row.origin === 'UK') {
        scheme = 'UK';
      } else if (['LS'].includes(icao2) || row.origin === 'CH') {
        scheme = 'CH';
      }

      return { row, rowCo2Saving, scheme };
    });

    // Step 2: Prioritized claiming based on price EUA > UKA > CORSIA
    let remObligationEu = obligationEu;
    let remObligationUk = obligationUk;
    let remObligationCorsia = obligationCorsia;

    // EU Claim Priority
    processedRows.forEach(item => {
      if (item.scheme === 'EU') {
        const allocatedEU = Math.min(item.rowCo2Saving, remObligationEu);
        item.row.claimedEu = Number(allocatedEU.toFixed(2));
        remObligationEu -= allocatedEU;

        const remaining = item.rowCo2Saving - allocatedEU;
        if (remaining > 0) {
          const allocatedCorsia = Math.min(remaining, remObligationCorsia);
          item.row.claimedCorsia = Number(allocatedCorsia.toFixed(2));
          remObligationCorsia -= allocatedCorsia;
        }
      }
    });

    // UK Claim Priority
    processedRows.forEach(item => {
      if (item.scheme === 'UK') {
        const allocatedUK = Math.min(item.rowCo2Saving, remObligationUk);
        item.row.claimedUk = Number(allocatedUK.toFixed(2));
        remObligationUk -= allocatedUK;

        const remaining = item.rowCo2Saving - allocatedUK;
        if (remaining > 0) {
          const allocatedCorsia = Math.min(remaining, remObligationCorsia);
          item.row.claimedCorsia = Number(allocatedCorsia.toFixed(2));
          remObligationCorsia -= allocatedCorsia;
        }
      }
    });

    // CH Claim Priority
    processedRows.forEach(item => {
      if (item.scheme === 'CH') {
        const allocatedCH = Math.min(item.rowCo2Saving, 5000);
        item.row.claimedCh = Number(allocatedCH.toFixed(2));

        const remaining = item.rowCo2Saving - allocatedCH;
        if (remaining > 0) {
          const allocatedCorsia = Math.min(remaining, remObligationCorsia);
          item.row.claimedCorsia = Number(allocatedCorsia.toFixed(2));
          remObligationCorsia -= allocatedCorsia;
        }
      }
    });

    // CORSIA Claims
    processedRows.forEach(item => {
      if (item.scheme === 'CORSIA') {
        const allocatedCorsia = Math.min(item.rowCo2Saving, remObligationCorsia);
        item.row.claimedCorsia = Number(allocatedCorsia.toFixed(2));
        remObligationCorsia -= allocatedCorsia;
      }
    });

    const finalRows = processedRows.map(p => p.row);
    setSafRows(finalRows);
    setIsOptimized(true);
    alert("Hệ thống đã tự động tối ưu cấn trừ và điền lượng CO2 claim vào các schema tương ứng!");
  };

  // --- ANALYSIS COMPUTATIONS ---
  const simulationResults = useMemo(() => {
    let totalSaving = 0;
    let totalClaimedEu = 0;
    let totalClaimedUk = 0;
    let totalClaimedCh = 0;
    let totalClaimedCorsia = 0;

    safRows.forEach(row => {
      const rowSaving = row.amountPurchased * 3.16 * (1 - row.lifecycleEmissions / 89);
      totalSaving += rowSaving;
      totalClaimedEu += row.claimedEu;
      totalClaimedUk += row.claimedUk;
      totalClaimedCh += row.claimedCh;
      totalClaimedCorsia += row.claimedCorsia;
    });

    // Costs
    const baseEuCost = obligationEu * priceEua;
    const baseUkCost = obligationUk * priceUka;
    const baseCorsiaCost = Math.max(0, obligationCorsia - totalSaving) * priceCorsia;
    const totalBaselineCost = baseEuCost + baseUkCost + baseCorsiaCost;

    const optEuCost = Math.max(0, obligationEu - totalClaimedEu) * priceEua;
    const optUkCost = Math.max(0, obligationUk - totalClaimedUk) * priceUka;
    const optCorsiaCost = Math.max(0, obligationCorsia - totalClaimedCorsia) * priceCorsia;
    const totalOptimizedCost = optEuCost + optUkCost + optCorsiaCost;

    const totalSavedCost = Math.max(0, totalBaselineCost - totalOptimizedCost);

    return {
      totalSaving: Number(totalSaving.toFixed(1)),
      totalClaimedEu: Number(totalClaimedEu.toFixed(1)),
      totalClaimedUk: Number(totalClaimedUk.toFixed(1)),
      totalClaimedCh: Number(totalClaimedCh.toFixed(1)),
      totalClaimedCorsia: Number(totalClaimedCorsia.toFixed(1)),
      totalBaselineCost,
      totalOptimizedCost,
      totalSavedCost,
      baseEuCost,
      baseUkCost,
      baseCorsiaCost,
      optEuCost,
      optUkCost,
      optCorsiaCost
    };
  }, [safRows, priceEua, priceUka, priceCorsia, obligationEu, obligationUk, obligationCorsia]);

  const handleSaveScenario = () => {
    if (!activeScenario) return;
    
    let saved: SimulationScenario;
    const today = new Date();
    
    if (activeScenario.scenarioType === 'Mô phỏng Net Zero 2050') {
      const co2Simulated = calculateEmissionsForYear(2050, valFleet, valSaf, valRoute, valLoadFactor);
      const co2BAU = calculateEmissionsForYear(2050, 20, 3, 0, 80);
      const co2Saving = co2BAU - co2Simulated;

      saved = {
        ...activeScenario,
        name: `Kịch bản mô phỏng Net Zero 2050 - Kỳ ${reportPeriod}`,
        reportPeriod,
        status,
        updatedAt: today.toISOString().split('T')[0],
        totalCo2Saving: Math.round(co2Saving),
        totalCostSaved: Math.round(co2Simulated), // Save Net emissions for representation
        baseYear,
        xSaf: valSaf,
        xWeight: valFleet,                      // Maps to valFleet
        xSolar: valRoute,                       // Maps to valRoute
        xRoute: valLoadFactor,                  // Maps to valLoadFactor
      };
    } else {
      saved = {
        ...activeScenario,
        name: `Kịch bản tối ưu hóa chi phí đền bù - Kỳ ${reportPeriod}`,
        reportPeriod,
        status,
        priceEua,
        priceUka,
        priceCorsia,
        obligationEu,
        obligationUk,
        obligationCorsia,
        safRows,
        isOptimized,
        totalCo2Saving: simulationResults.totalSaving,
        totalCostSaved: isOptimized ? simulationResults.totalSavedCost : 0,
        updatedAt: today.toISOString().split('T')[0]
      };
    }

    let updated = [...scenarios];
    const exists = scenarios.some(s => s.id === saved.id);
    if (exists) {
      updated = updated.map(s => s.id === saved.id ? saved : s);
    } else {
      updated.push(saved);
    }

    setScenarios(updated);
    setViewMode('LIST');
    setActiveScenario(null);
  };

  const handleExportCSV = () => {
    if (safRows.length === 0) {
      alert("Không có dữ liệu để xuất báo cáo!");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "STT,ICAO Airport,Fuel Supplier,VAT Supplier,Batch Number,Amount (t),Category,Process,Feedstock,Origin,Lifecycle (gCO2),Claimed EU,Claimed CH,Claimed UK,Claimed CORSIA,Claimed MBM1,Claimed MBM2\n";
    
    safRows.forEach((row, idx) => {
      csvContent += `${idx + 1},${row.airportIcao},${row.supplier},${row.supplierVat},${row.batchNumber},${row.amountPurchased},${row.category},${row.process},${row.feedstock},${row.origin},${row.lifecycleEmissions},${row.claimedEu},${row.claimedCh},${row.claimedUk},${row.claimedCorsia},0,0\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SAF_Purchase_Reporting_${reportPeriod.replace('/', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const renderNetZero2050Detail = () => {
    const baselineCo2 = 1340;
    const co2BAU = calculateEmissionsForYear(2050, 20, 3, 0, 80);
    const co2Simulated = calculateEmissionsForYear(2050, valFleet, valSaf, valRoute, valLoadFactor);
    const targetNetZero = 0;
    const gapValue = Math.max(0, co2Simulated - targetNetZero);

    const years = [2019, 2025, 2030, 2035, 2040, 2045, 2050];
    const targetEmissions = {
      2019: 1340,
      2025: 1340,
      2030: 1000,
      2035: 750,
      2040: 500,
      2045: 250,
      2050: 0
    };

    const chartData = years.map(y => {
      const co2BAUValue = calculateEmissionsForYear(y, 20, 3, 0, 80);
      const co2SimValue = calculateEmissionsForYear(y, valFleet, valSaf, valRoute, valLoadFactor);
      const co2TgtValue = targetEmissions[y as keyof typeof targetEmissions];
      return {
        name: y === 2019 ? '2019 (Cơ sở)' : String(y),
        'Kịch bản không can thiệp': Math.round(co2BAUValue),
        'Kịch bản mô phỏng': Math.round(co2SimValue),
        'Mục tiêu Net Zero': co2TgtValue
      };
    });

    const renderCustomLabel = (props: any) => {
      const { x, y, stroke, value, index } = props;
      if (index === 0 || index === 2 || index === 4 || index === 6) {
        return (
          <text x={x} y={y - 8} fill={stroke} fontSize={9} fontWeight="bold" textAnchor="middle">
            {Math.round(value).toLocaleString()}K
          </text>
        );
      }
      return null;
    };

    // Bảng chi phí bù đắp
    const tableData = [
      {
        year: 2030,
        tgt: 1000,
        price: price2030,
        setPrice: setPrice2030,
        action: 'Mở Hợp đồng Hedging mua trước',
        info: 'Mở hợp đồng hedging mua trước tín chỉ nhằm cố định chi phí phát sinh'
      },
      {
        year: 2040,
        tgt: 500,
        price: price2040,
        setPrice: setPrice2040,
        action: 'Nghiên cứu dự án Lâm nghiệp VN',
        info: 'Đầu tư trực tiếp vào dự án hấp thụ carbon rừng ngập mặn nội địa'
      },
      {
        year: 2050,
        tgt: 0,
        price: price2050,
        setPrice: setPrice2050,
        action: 'DACCS (Hút khí trực tiếp)',
        info: 'Áp dụng công nghệ Direct Air Carbon Capture and Storage tiên tiến'
      }
    ].map(row => {
      const co2Sim = calculateEmissionsForYear(row.year, valFleet, valSaf, valRoute, valLoadFactor);
      const gap = Math.max(0, co2Sim - row.tgt);
      const gapTonne = gap * 1000;
      const totalCost = gapTonne * row.price;
      return {
        ...row,
        gapTonne: Math.round(gapTonne),
        totalCost: Math.round(totalCost)
      };
    });

    const getScenarioOffsetCost2050 = (sc: SimulationScenario) => {
      const fleet = sc.xWeight !== undefined ? sc.xWeight : 20;
      const saf = sc.xSaf !== undefined ? sc.xSaf : 3;
      const route = sc.xSolar !== undefined ? sc.xSolar : 0;
      const lf = sc.xRoute !== undefined ? sc.xRoute : 80;
      const co2Sim = calculateEmissionsForYear(2050, fleet, saf, route, lf);
      const gap = Math.max(0, co2Sim - 0);
      return gap * 1000 * price2050;
    };

    const handleResetBaseline = () => {
      setValFleet(20);
      setValSaf(3);
      setValRoute(0);
      setValLoadFactor(80);
    };

    // Waterfall calculations bridging from baseline to simulated
    const co2BAU50 = calculateEmissionsForYear(2050, 20, 3, 0, 80);
    const growthImpact = co2BAU50 - 1340;
    
    const co2WithFleet = calculateEmissionsForYear(2050, valFleet, 3, 0, 80);
    const fleetImpact = co2WithFleet - co2BAU50;

    const co2WithLF = calculateEmissionsForYear(2050, valFleet, 3, 0, valLoadFactor);
    const lfImpact = co2WithLF - co2WithFleet;

    const co2WithRoute = calculateEmissionsForYear(2050, valFleet, 3, valRoute, valLoadFactor);
    const routeImpact = co2WithRoute - co2WithLF;

    const co2WithSaf = calculateEmissionsForYear(2050, valFleet, valSaf, valRoute, valLoadFactor);
    const safImpact = co2WithSaf - co2WithRoute;

    const waterfallData = [
      { name: 'Mốc cơ sở 2019', value: 1340, isTotal: true },
      { name: 'Tăng trưởng lưu lượng', value: Math.round(growthImpact) },
      { name: 'Đội bay thế hệ mới', value: Math.round(fleetImpact) },
      { name: 'Hệ số tải trọng', value: Math.round(lfImpact) },
      { name: 'Tối ưu vận hành', value: Math.round(routeImpact) },
      { name: 'Pha trộn SAF', value: Math.round(safImpact) },
      { name: 'Kịch bản mô phỏng', value: Math.round(co2WithSaf), isTotal: true }
    ];

    let cumulative = 0;
    const waterfallChartData = waterfallData.map((item) => {
      let range: [number, number];
      let fill: string;
      if (item.isTotal) {
        range = [0, item.value];
        cumulative = item.value;
        fill = '#00335F';
      } else {
        const start = cumulative;
        cumulative += item.value;
        const end = cumulative;
        range = [Math.min(start, end), Math.max(start, end)];
        fill = item.value < 0 ? '#10B981' : '#EF4444';
      }
      return {
        name: item.name,
        range,
        displayValue: item.value,
        fill
      };
    });

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-150 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => { setViewMode('LIST'); setActiveScenario(null); }} className="p-2 cursor-pointer border border-gray-200 hover:bg-gray-50 bg-white">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-extrabold text-vna-blue">Mô phỏng kịch bản phát thải CO₂ (Net Zero 2050)</h2>
              <p className="text-xs text-gray-500 font-semibold mt-1">Cấu hình các đòn bẩy IATA và theo dõi tác động lộ trình giảm phát thải đến năm 2050</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleResetBaseline} className="text-xs font-bold border-gray-300 bg-white">Reset về baseline</Button>
            <Button variant="primary" onClick={handleSaveScenario} className="text-xs bg-vna-blue font-bold">Lưu kịch bản này</Button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-left">
          
          <div className="bg-white border-t-3 border-vna-blue p-4 rounded-xl shadow-xs border border-gray-150">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Mốc tham chiếu (2019)</div>
            <div className="text-2xl font-black text-gray-800 mt-2 font-mono">1.340K <span className="text-xs font-semibold text-gray-400">tCO2</span></div>
            <div className="text-[10px] text-gray-450 mt-2 font-semibold">Công thức: Số liệu phát thải CO2 gộp năm cơ sở 2019</div>
          </div>

          <div className="bg-white border-t-3 border-amber-500 p-4 rounded-xl shadow-xs border border-gray-150">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Dự báo không can thiệp 2050</div>
            <div className="text-2xl font-black text-amber-600 mt-2 font-mono">{Math.round(co2BAU).toLocaleString()}K <span className="text-xs font-semibold text-gray-400">tCO2</span></div>
            <div className="text-[10px] text-gray-455 mt-2 font-semibold">Công thức: = Nhiên liệu 2019 × hệ số tăng trưởng 31 năm × hệ số phát thải, giữ nguyên mọi đòn bẩy ở mức 2019</div>
          </div>

          <div className="bg-white border-t-3 border-emerald-600 p-4 rounded-xl shadow-xs border border-gray-150">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Mục tiêu Net Zero 2050</div>
            <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">0 <span className="text-xs font-semibold text-gray-400">tCO2 Net</span></div>
            <div className="text-[10px] text-gray-455 mt-2 font-semibold">Công thức: Theo cam kết lộ trình Net Zero ngành hàng không</div>
          </div>

          <div className="bg-white border-t-3 border-red-500 p-4 rounded-xl shadow-xs border border-gray-150">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Khoảng cách còn lại (Gap)</div>
            <div className="text-2xl font-black text-red-500 mt-2 font-mono">{Math.round(gapValue).toLocaleString()}K <span className="text-xs font-semibold text-gray-400">tCO2</span></div>
            <div className="text-[10px] text-gray-455 mt-2 font-semibold">Công thức: = CO2 kịch bản mô phỏng − Mục tiêu Net Zero cùng mốc năm; là phần bắt buộc phải bù bằng tín chỉ carbon</div>
          </div>

        </div>

        {/* Split Grid for Sliders and Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
          
          {/* Left panel: sliders (width 4/12 or 5/12) */}
          <div className="lg:col-span-5 bg-gray-50/50 border border-gray-200 rounded-xl p-5 shadow-3xs flex flex-col justify-start text-left">
            <div className="mb-4 border-b pb-2">
              <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider">IATA Levers Controllers</h3>
              <p className="text-[11px] text-gray-400 mt-1 font-semibold">Điều chỉnh % kỳ vọng của các đòn bẩy IATA để lên kịch bản cắt giảm Carbon.</p>
            </div>

            <div className="space-y-5">
              
              {/* Slider 1: Tỷ trọng đội bay thế hệ mới */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">⚙️ Tỷ trọng đội bay thế hệ mới</span>
                  <span className="bg-blue-50 text-vna-blue px-2 py-0.5 rounded text-[11px] font-black">{valFleet}% chuyến bay</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">% chuyến bay dùng tàu thế hệ mới (A350/B787) thay vị A321 cũ</p>
                <div className="flex items-center gap-3 pt-1">
                  <input 
                    type="range"
                    min="0" max="100"
                    value={valFleet}
                    onChange={(e) => setValFleet(parseInt(e.target.value))}
                    className="flex-1 accent-vna-blue h-1 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">Giảm CO₂ ↓</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Baseline: 20%</span>
                  <span>Khoảng: 0% → 100%</span>
                </div>
              </div>

              {/* Slider 2: Tỷ lệ pha trộn SAF */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">🍃 Tỷ lệ pha trộn SAF</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-black">{valSaf}% nhiên liệu</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">Tỷ lệ SAF pha trộn trong tổng lượng nhiên liệu nạp</p>
                <div className="flex items-center gap-3 pt-1">
                  <input 
                    type="range"
                    min="0" max="100"
                    value={valSaf}
                    onChange={(e) => setValSaf(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">Giảm CO₂ ↓</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Baseline: 3%</span>
                  <span>Khoảng: 0% → 100%</span>
                </div>
              </div>

              {/* Slider 3: Tối ưu hoá vận hành & đường bay */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">🗺️ Tối ưu hoá vận hành & đường bay</span>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-black">{valRoute}% giảm nhiên liệu</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">% giảm nhiên liệu nhờ tối ưu đường bay, tải trọng dự phòng</p>
                <div className="flex items-center gap-3 pt-1">
                  <input 
                    type="range"
                    min="0" max="30"
                    value={valRoute}
                    onChange={(e) => setValRoute(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">Giảm CO₂ ↓</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Baseline: 0%</span>
                  <span>Khoảng: 0% → 30%</span>
                </div>
              </div>

              {/* Slider 4: Hệ số tải trọng bình quân */}
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700">📈 Hệ số tải trọng bình quân</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[11px] font-black">{valLoadFactor}% tải trọng</span>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold">% ghế/tải trọng lấp đầy bình quân của đội bay</p>
                <div className="flex items-center gap-3 pt-1">
                  <input 
                    type="range"
                    min="60" max="100"
                    value={valLoadFactor}
                    onChange={(e) => setValLoadFactor(parseInt(e.target.value))}
                    className="flex-1 accent-purple-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">Giảm CO₂ ↓</span>
                </div>
                <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                  <span>Baseline: 80%</span>
                  <span>Khoảng: 60% → 100%</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right panel: Line Chart projection */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-5 shadow-3xs flex flex-col text-left justify-between">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-vna-navy uppercase tracking-wider">Lộ trình Phát thải Giả lập</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Đường biểu diễn kịch bản so sánh với cam kết Net Zero (Nghìn tấn CO₂ phát thải ròng)</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-gray-650">
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-red-500 rounded-xs"></div> Không can thiệp</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-purple-700 rounded-xs"></div> Kịch bản mô phỏng</span>
                <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-gray-400 rounded-xs"></div> Mục tiêu Net Zero</span>
              </div>
            </div>

            <div className="h-[360px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'semibold', fill: '#64748b' }} />
                  <YAxis 
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    label={{ value: 'Nghìn tấn CO₂ phát thải ròng', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#475569' } }}
                  />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Kịch bản không can thiệp" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={{ r: 4, strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    label={renderCustomLabel}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Kịch bản mô phỏng" 
                    stroke="#7C3AED" 
                    strokeWidth={3} 
                    dot={{ r: 5, strokeWidth: 1 }}
                    activeDot={{ r: 7 }}
                    label={renderCustomLabel}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Mục tiêu Net Zero" 
                    stroke="#94A3B8" 
                    strokeWidth={2} 
                    strokeDasharray="3 3"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Waterfall Bridge Chart */}
        <Card className="p-5 border border-gray-200 mt-2 text-left shadow-xs">
          <div className="border-b pb-3 mb-4">
            <h3 className="text-sm font-extrabold text-vna-navy uppercase tracking-wide flex items-center gap-2">
              📊 II. PHÂN RÃ ĐÓNG GÓP CHỈ SỐ (WATERFALL 2050)
            </h3>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Thể hiện đóng góp của từng đòn bẩy tác động lên phát thải ròng so với kịch bản BAU.
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'semibold', fill: '#475569' }} />
                <YAxis 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  label={{ value: 'Nghìn tấn CO₂ phát thải', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fontWeight: 'bold', fill: '#475569' } }}
                />
                <Tooltip 
                  formatter={(value, name, props) => {
                    const rawVal = props.payload.displayValue;
                    return [`${rawVal > 0 ? `+${Math.round(rawVal).toLocaleString()}` : Math.round(rawVal).toLocaleString()} tCO₂`, 'Đóng góp'];
                  }} 
                />
                <Bar dataKey="range" radius={[3, 3, 0, 0]}>
                  {waterfallChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-5 justify-center text-[10px] font-bold text-gray-600 pt-3 border-t mt-4">
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#00335F] rounded-xs"></div>
              Cột mốc đầu/cuối (Mốc cơ sở 2019 / Mô phỏng)
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#EF4444] rounded-xs"></div>
              Gây tăng phát thải do lưu lượng phát triển
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#10B981] rounded-xs"></div>
              Đòn bẩy hoạt động giúp giảm phát thải
            </span>
          </div>
        </Card>

        {/* Cost forecasting table */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-3xs text-left mt-6">
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-vna-navy uppercase tracking-wider">Dự phòng Chi phí Bù trừ tài chính (Carbon Offsetting)</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Khoản "Phát thải ròng còn lại" buộc phải mua tín chỉ carbon đền bù tương ứng theo năm</p>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Quy đổi: 1k tCO2 = 1.000 tấn CO2</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-[11px]">
                  <th className="py-3 px-4 w-32">Cột mốc Năm</th>
                  <th className="py-3 px-4 text-right">Khí xả còn lại chưa xử lý triệt để</th>
                  <th className="py-3 px-4 text-right w-48">Ước tính giá Tín chỉ / Tấn ($)</th>
                  <th className="py-3 px-4 text-right w-56">Tổng Dự phòng Chi phí (USD)</th>
                  <th className="py-3 px-4 w-64">Hành động (Hedging / Công nghệ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {tableData.map(row => (
                  <tr key={row.year} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-vna-navy">Năm {row.year}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-800">
                      {row.gapTonne.toLocaleString()} tCO₂
                      <div className="relative group/tooltip inline-block ml-1">
                        <span className="text-gray-400 hover:text-gray-600 cursor-help">ⓘ</span>
                        <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:block bg-slate-800 text-white text-[9px] p-2 rounded-lg w-56 shadow-lg leading-relaxed z-30 font-medium normal-case text-left">
                          Phát thải kịch bản mô phỏng trừ đi mục tiêu Net Zero cùng năm.
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-gray-400 font-bold text-[10px]">$</span>
                        <input 
                          type="number"
                          value={row.price}
                          onChange={(e) => row.setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-20 text-right text-xs font-bold border border-gray-300 rounded px-1.5 py-1 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-vna-blue"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-red-600 text-sm">${row.totalCost.toLocaleString()}</span>
                      <span className="block text-[9px] text-gray-400 font-bold mt-0.5">
                        = {row.gapTonne.toLocaleString()} t × ${row.price}/t
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-extrabold text-vna-blue hover:underline cursor-pointer">{row.action}</span>
                        <span className="text-[9px] text-gray-450 font-semibold">{row.info}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-gray-455 font-semibold mt-4 text-center border-t pt-3 italic">
            💡 Số liệu trong bảng liên kết trực tiếp với slider ở panel bên trên — kéo slider để thấy bảng cập nhật lại.
          </div>
        </div>

        {/* Math Formulas Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-3xs text-left mt-6">
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <h3 className="text-xs font-black text-vna-navy uppercase tracking-wider flex items-center gap-2">
              🎛️ HỆ THỐNG CÔNG THỨC TOÁN HỌC & CÁC THAM SỐ GIẢ ĐỊNH
            </h3>
            <span className="text-[10px] font-bold text-gray-450 italic">Lưu ý: Mẫu công thức tính toán thử nghiệm</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            
            {/* Card 1 */}
            <div className="bg-gray-50/40 border border-gray-150 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-vna-blue">ℹ️ 1. Hiệu suất đội bay (Fleet Fuel Burn Index - η)</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-[10px] text-vna-blue font-bold">
                η(năm) = (Tỷ_trọng_A321 × 1.00) + (Tỷ_trọng_Thế_hệ_mới × 0.86)
              </div>
              <ul className="text-[10px] text-gray-500 font-semibold space-y-1 list-disc pl-4 leading-relaxed">
                <li>Tàu bay đời cũ (A321-CEO) coi như mốc chuẩn tiêu thụ nhiên liệu là <span className="font-bold text-gray-700">1.00</span>.</li>
                <li>Đội tàu thế hệ mới (A350 & B787) tiết kiệm nhiên liệu vượt trội, mốc hiệu suất quy đổi bình quân là <span className="font-bold text-gray-700">0.86</span>.</li>
                <li>Hiệu suất Baseline năm 2019: <span className="font-mono font-bold text-gray-700">η_2019 = 0.972</span> (ứng với tỷ trọng tàu mới 20%).</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50/40 border border-gray-150 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-vna-blue">ℹ️ 2. Tổng lượng nhiên liệu tiêu thụ (Fuel Burned)</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-[10px] text-vna-blue font-bold leading-relaxed">
                Fuel(năm) = Fuel_2019 × (1.035)^(năm-2019) × (η_năm / η_2019) × (80 / LF_năm) × (1 - Ops_năm)
              </div>
              <ul className="text-[10px] text-gray-500 font-semibold space-y-1 list-disc pl-4 leading-relaxed">
                <li>Tăng trưởng giao thông giả định tăng liên tục <span className="font-bold text-gray-700">3.5%</span> một năm.</li>
                <li>Hệ số tải trọng (LF): lấp đầy cao hơn giúp giảm số lượng hành trình rỗng gián tiếp, tỷ số <span className="font-mono font-bold text-gray-700">80 / LF(năm)</span> đóng vai trò đòn bẩy tỷ lệ nghịch.</li>
                <li>Nhiên liệu 2019 (Fuel_2019): Mặc định vị <span className="font-bold text-gray-700">424K tấn</span>.</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-50/40 border border-gray-150 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-vna-blue">ℹ️ 3. Phát thải CO₂ Gộp (Gross CO₂ Emissions)</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-[10px] text-vna-blue font-bold">
                Gross_CO2(năm) = Jet_A1_Fuel × 3.16 + SAF_Fuel × 3.16 × (1 - 0.75)
              </div>
              <ul className="text-[10px] text-gray-500 font-semibold space-y-1 list-disc pl-4 leading-relaxed">
                <li>Tỷ số phát thải (EF): Quy chuẩn toàn cầu IATA, 1 tấn Jet A-1 tạo ra <span className="font-bold text-gray-700">3.16 tấn CO₂</span>.</li>
                <li>Nhiên liệu bền vững (SAF): Giúp cắt giảm được <span className="font-bold text-gray-700">75%</span> phát thải cacbon trong chuỗi vòng đời hoàn chỉnh so với xăng dầu hóa thạch.</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-50/40 border border-gray-150 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-vna-blue">ℹ️ 4. Chi phí bù đắp & Giải pháp tài chính</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-[10px] text-vna-blue font-bold">
                Dự phòng chi phí = Max(0, CO2_Mô_phỏng - Mục_tiêu_chuẩn) × 1000 × Giá_tín_chỉ
              </div>
              <ul className="text-[10px] text-gray-500 font-semibold space-y-1 list-disc pl-4 leading-relaxed">
                <li>Hệ thống tự động chuyển đổi từ đơn vị K nghìn tấn trên biểu đồ sang đơn vị tấn CO₂ thực tế (<span className="font-bold text-gray-700">nhân với 1000</span>) trước khi nhân đơn giá tín chỉ carbon.</li>
                <li>Giúp đưa ra cảnh báo ngân sách hành động cụ thể cho từng kịch bản đòn bẩy.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Saved Scenarios Table */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-3xs text-left mt-6">
          <div className="border-b pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-vna-navy uppercase tracking-wider">💼 QUẢN LÝ & SO SÁNH CÁC KỊCH BẢN MÔ PHỎNG ĐÃ LƯU</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">TRẠNG THÁI LƯU TRỮ CỰC BỘ (LOCAL STATE)</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-[11px] uppercase">
                  <th className="py-3 px-4">Tên kịch bản mô phỏng</th>
                  <th className="py-3 px-4 text-center">Đội bay thế hệ mới</th>
                  <th className="py-3 px-4 text-center">SAF</th>
                  <th className="py-3 px-4 text-center">Tối ưu vận hành</th>
                  <th className="py-3 px-4 text-center">Tải trọng LF</th>
                  <th className="py-3 px-4 text-right">Phát thải CO₂ 2050</th>
                  <th className="py-3 px-4 text-right">Chi phí bù 2050</th>
                  <th className="py-3 px-4 text-center w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {scenarios.filter(s => s.scenarioType === 'Mô phỏng Net Zero 2050').map(sc => {
                  const fleetVal = sc.xWeight !== undefined ? sc.xWeight : 20;
                  const safVal = sc.xSaf !== undefined ? sc.xSaf : 3;
                  const routeVal = sc.xSolar !== undefined ? sc.xSolar : 0;
                  const lfVal = sc.xRoute !== undefined ? sc.xRoute : 80;
                  const offsetCost = getScenarioOffsetCost2050(sc);
                  
                  return (
                    <tr key={sc.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-800">{sc.name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">{fleetVal}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{safVal}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">{routeVal}%</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-700">{lfVal}%</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {Math.round(sc.totalCostSaved || 0).toLocaleString()}K tCO₂
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-amber-600">
                        ${Math.round(offsetCost).toLocaleString()} USD
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => {
                              setValFleet(fleetVal);
                              setValSaf(safVal);
                              setValRoute(routeVal);
                              setValLoadFactor(lfVal);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-vna-blue hover:bg-blue-100 rounded font-bold border border-blue-200 transition-colors cursor-pointer text-[10px]"
                            title="Nạp cấu hình kịch bản này lên bảng điều khiển"
                          >
                            <Upload size={12} className="mr-1" /> Tải lên
                          </button>
                          <button 
                            onClick={(e) => handleDelete(sc.id, e)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Xóa kịch bản"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {scenarios.filter(s => s.scenarioType === 'Mô phỏng Net Zero 2050').length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-400 italic">
                      Chưa có kịch bản mô phỏng nào được lưu cục bộ.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  };

  // --- RENDER DETAIL SCREEN ---
  if (viewMode === 'DETAIL' && activeScenario) {
    if (activeScenario.scenarioType === 'Mô phỏng Net Zero 2050') {
      return renderNetZero2050Detail();
    }

    return (
      <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in slide-in-from-right-4 duration-300">
        
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewMode('LIST')} className="p-2 cursor-pointer">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-vna-blue">Mô phỏng kịch bản đền bù carbon</h2>
              <p className="text-xs text-black/45">Mô phỏng và tối ưu hóa cấn trừ SAF trên các hệ thống nghĩa vụ (EU ETS, UK ETS, CORSIA)</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={() => setViewMode('LIST')} className="flex-1 sm:flex-none">Hủy bỏ</Button>
            {isOptimized && (
              <Button variant="secondary" onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-1">
                <Download size={16} /> Export Báo cáo
              </Button>
            )}
            <Button variant="primary" onClick={handleSaveScenario} className="flex-1 sm:flex-none">Lưu kịch bản</Button>
          </div>
        </div>

        {/* Bento Grid Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          
          {/* CỘT TRÁI: Cấu hình & Tham số đền bù */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Cấu hình kịch bản */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider">I. Cấu hình kịch bản</h3>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">Kỳ {reportPeriod}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700">Kỳ báo cáo áp dụng *</label>
                  <Input 
                    type="text"
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    placeholder="VD: Tháng 03/2026"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-700">Trạng thái *</label>
                  <Select 
                    value={status}
                    onChange={(val) => setStatus(val as 'Draft' | 'Approved')}
                    options={[
                      { label: 'Nháp (Draft)', value: 'Draft' },
                      { label: 'Phê duyệt', value: 'Approved' }
                    ]}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-700">Loại kịch bản</label>
                  <Input value="Tối ưu đền bù" disabled={true} className="bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Card 2: II. Tham số đền bù carbon (Đã xếp Nghĩa vụ nợ lên trên & Khóa chỉ đọc) */}
            <div className="bg-gray-50/50 p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider">II. Tham số đền bù carbon</h3>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full">Calculated</span>
              </div>
              <div className="space-y-4">
                
                {/* UPGRADE: Nợ CO2 được xếp LÊN TRÊN và KHÓA CHỈ ĐỌC */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/45 uppercase tracking-wider block ml-0.5 mb-1.5">Nghĩa vụ nợ CO2 (từ nạp thực tế - Chỉ đọc)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-black/45 uppercase">Nợ EU (t)</label>
                      <Input type="number" value={obligationEu} disabled={true} className="bg-gray-100 text-black/45 font-bold border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-black/45 uppercase">Nợ UK (t)</label>
                      <Input type="number" value={obligationUk} disabled={true} className="bg-gray-100 text-black/45 font-bold border-gray-200" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-black/45 uppercase">Nợ CORSIA (t)</label>
                      <Input type="number" value={obligationCorsia} disabled={true} className="bg-gray-100 text-black/45 font-bold border-gray-200" />
                    </div>
                  </div>
                </div>

                {/* Giá tín chỉ CO2 (Cho phép chỉnh sửa lấy theo danh mục) */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-black/45 uppercase tracking-wider block ml-0.5 mb-1.5">Giá tín chỉ CO2 thị trường (Cho phép sửa)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-600 uppercase">EUA (EU) $</label>
                      <Input type="number" value={priceEua} onChange={(e) => { setPriceEua(parseFloat(e.target.value) || 0); setIsOptimized(false); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-600 uppercase">UKA (UK) $</label>
                      <Input type="number" value={priceUka} onChange={(e) => { setPriceUka(parseFloat(e.target.value) || 0); setIsOptimized(false); }} />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-600 uppercase">CORSIA $</label>
                      <Input type="number" value={priceCorsia} onChange={(e) => { setPriceCorsia(parseFloat(e.target.value) || 0); setIsOptimized(false); }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* CỘT PHẢI (Lg: 8/12): THỐNG KÊ CHI PHÍ & BIỂU ĐỒ TƯƠNG QUAN CLAIMS */}
          <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-xs font-bold text-vna-blue uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={16} /> Bảng thống kê cấn trừ & phân tích chi phí đền bù
              </h3>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                {isOptimized ? 'Đã chạy tối ưu' : 'Đợi cấn trừ'}
              </span>
            </div>

            {isOptimized ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 items-stretch">
                
                {/* Financial stats */}
                <div className="md:col-span-5 flex flex-col justify-between gap-4">
                  
                  {/* Tổng chi phí CO2 cần mua đền bù */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-lg p-4 flex flex-col justify-between shadow-2xs space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Tổng chi phí CO2 cần mua đền bù</span>
                      <div className="text-3xl font-black text-emerald-700 mt-1 font-mono">
                        ${simulationResults.totalOptimizedCost.toLocaleString()}
                        <span className="text-xs font-bold ml-1">USD</span>
                      </div>
                    </div>
                    
                    {/* So sánh trước và sau tối ưu */}
                    <div className="pt-2.5 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-600">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold flex items-center gap-1">
                          Trước tối ưu
                          <div className="relative group/tooltip inline-block">
                            <Info size={10} className="text-gray-400 hover:text-black/45 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-slate-800 text-white text-[9px] p-2 rounded-lg w-48 shadow-lg leading-relaxed z-30 font-medium normal-case text-left">
                              <span className="font-bold border-b border-slate-700 pb-1 mb-1 block text-amber-400">Logic Trước tối ưu:</span>
                              • Nợ EU/UK phải mua 100% bằng tín chỉ EUA/UKA.<br/>
                              • SAF được cấn trừ toàn bộ vào CORSIA (schema rẻ nhất).
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </span>
                        <span className="text-black/45 font-mono font-bold">${simulationResults.totalBaselineCost.toLocaleString()} USD</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-600 block uppercase font-bold flex items-center gap-1">
                          Sau tối ưu
                          <div className="relative group/tooltip inline-block">
                            <Info size={10} className="text-emerald-400 hover:text-emerald-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tooltip:block bg-slate-800 text-white text-[9px] p-2 rounded-lg w-48 shadow-lg leading-relaxed z-30 font-medium normal-case text-left">
                              <span className="font-bold border-b border-slate-700 pb-1 mb-1 block text-emerald-400">Logic Sau tối ưu:</span>
                              • Ưu tiên phân bổ SAF cấn trừ trước cho các nghĩa vụ nợ giá cao (EU ETS, UK ETS) để tiết kiệm chi phí.<br/>
                              • SAF còn dư mới đem đền bù CORSIA.
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </span>
                        <span className="text-emerald-700 font-mono font-bold">${simulationResults.totalOptimizedCost.toLocaleString()} USD</span>
                      </div>
                    </div>

                    <div className="bg-emerald-100/60 p-2 rounded-lg text-[10px] text-emerald-800 font-bold flex items-center justify-between border border-emerald-200/30">
                      <span>Tiết kiệm tài chính:</span>
                      <span className="font-mono text-xs font-black text-emerald-700">${simulationResults.totalSavedCost.toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Lượng chi phí mua đền bù theo từng Schema */}
                  <div className="space-y-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-600">Đền bù EU ETS (EUA):</span>
                      <span className="font-mono font-bold text-black/85">${simulationResults.optEuCost.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-600">Đền bù UK ETS (UKA):</span>
                      <span className="font-mono font-bold text-black/85">${simulationResults.optUkCost.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-600">Đền bù CORSIA:</span>
                      <span className="font-mono font-bold text-black/85">${simulationResults.optCorsiaCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Biểu đồ claims */}
                <div className="md:col-span-7 flex flex-col">
                  <div className="text-[11px] font-bold text-black/45 mb-2">Tương quan Claim lượng cấn trừ theo các Schema (tCO2)</div>
                  <div className="flex-1 min-h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { name: 'EU ETS', Claimed: simulationResults.totalClaimedEu, fill: '#1E3A8A' },
                          { name: 'CH MBM', Claimed: simulationResults.totalClaimedCh, fill: '#10B981' },
                          { name: 'UK ETS', Claimed: simulationResults.totalClaimedUk, fill: '#3B82F6' },
                          { name: 'CORSIA', Claimed: simulationResults.totalClaimedCorsia, fill: '#F59E0B' }
                        ]}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} formatter={(val) => [`${val} tCO2`, 'Lượng cấn trừ']} />
                        <Bar dataKey="Claimed" radius={[4, 4, 0, 0]}>
                          {
                            [
                              { fill: '#1E3A8A' },
                              { fill: '#10B981' },
                              { fill: '#3B82F6' },
                              { fill: '#F59E0B' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))
                          }
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50 border border-dashed border-gray-300 rounded-lg text-xs gap-2">
                <AlertTriangle size={32} className="text-gray-400 animate-pulse" />
                <span className="font-bold text-black/45">Chưa có kết quả tối ưu chi phí đền bù</span>
                <p className="text-gray-400 max-w-sm">Hãy bấm nút **"Chạy tối ưu chi phí"** ở bảng **SAF PURCHASE REPORTING** phía dưới để cấn trừ tự động, hoặc click nút chỉnh sửa dòng để tự chọn Schema cấn trừ mong muốn.</p>
              </div>
            )}
          </div>

        </div>

        {/* SECTION DƯỚI: SAF PURCHASE REPORTING & GRID TABLE */}
        <div className="mt-8 bg-white p-5 rounded-lg border border-gray-200 space-y-4 shadow-2xs animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-3 gap-3">
            <div>
              <h3 className="text-sm font-bold text-vna-blue uppercase tracking-wider">SAF PURCHASE REPORTING</h3>
              <p className="text-xs text-black/45 mt-0.5">Nhập chứng từ ReFuelEU Aviation và chọn cấn trừ Schema thủ công hoặc chạy thuật toán tối ưu</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {safRows.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8.5"
                >
                  <Download size={14} /> Export báo cáo
                </Button>
              )}
              
              {!isTableEditing ? (
                <>
                  <Button 
                    variant="primary"
                    onClick={runOptimization}
                    disabled={safRows.length === 0}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8.5 bg-indigo-600 hover:bg-indigo-700 border-indigo-600 font-bold hover:shadow-md transition-shadow duration-300 animate-pulse"
                  >
                    <Sparkles size={14} /> Chạy tối ưu chi phí
                  </Button>
                  
                  {safRows.length > 0 && (
                    <Button 
                      variant="primary"
                      onClick={() => {
                        setBackupSafRows(JSON.parse(JSON.stringify(safRows)));
                        setIsTableEditing(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8.5 bg-amber-500 hover:bg-amber-600 border-amber-500 font-bold hover:shadow-md transition-shadow duration-300 text-white"
                    >
                      <Edit2 size={14} /> Chỉnh sửa bảng
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setIsTableEditing(false);
                      setIsOptimized(true);
                      alert("Đã lưu thay đổi cấn trừ trên bảng!");
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8.5 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 font-bold hover:shadow-md transition-shadow duration-300 text-white"
                  >
                    <Check size={14} /> Lưu bảng
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSafRows(backupSafRows);
                      setIsTableEditing(false);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs h-8.5 border-red-500 text-red-500 hover:bg-red-50 font-bold"
                  >
                    <X size={14} /> Hủy chỉnh sửa
                  </Button>
                </>
              )}

              {safRows.length > 0 && (
                <button 
                  onClick={() => {
                    if (window.confirm("Bạn có chắc chắn muốn reset toàn bộ các cột cấn trừ về 0?")) {
                      const resetRows = safRows.map(row => ({
                        ...row,
                        claimedEu: 0,
                        claimedCh: 0,
                        claimedUk: 0,
                        claimedCorsia: 0,
                        claimedOtherMbm1: 0,
                        claimedOtherMbm2: 0
                      }));
                      setSafRows(resetRows);
                      setIsOptimized(false);
                    }
                  }}
                  className="px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 cursor-pointer h-8.5"
                >
                  Reset cấn trừ
                </button>
              )}
            </div>
          </div>

          {/* Grid View Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white max-h-[500px] overflow-y-auto relative shadow-inner">
            {safRows.length > 0 ? (
              <table className="min-w-[1600px] text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold sticky top-0 bg-white z-20">
                    <th className="py-2.5 px-3 border-r w-12 text-center sticky left-0 bg-gray-50 z-30">STT</th>
                    <th className="py-2.5 px-3 border-r w-24">1. ICAO Airport</th>
                    <th className="py-2.5 px-3 border-r w-28">2. Fuel Supplier</th>
                    <th className="py-2.5 px-3 border-r w-32">3. VAT Supplier</th>
                    <th className="py-2.5 px-3 border-r w-28">4. Batch Number</th>
                    <th className="py-2.5 px-3 border-r w-24 text-right">5. Amount (t)</th>
                    <th className="py-2.5 px-3 border-r w-28">6. Category</th>
                    <th className="py-2.5 px-3 border-r w-28">7. Process</th>
                    <th className="py-2.5 px-3 border-r w-28">8. Feedstock</th>
                    <th className="py-2.5 px-3 border-r w-28">9. Origin</th>
                    <th className="py-2.5 px-3 border-r w-24 text-right">10. Lifecycle (gCO2)</th>
                    <th className="py-2.5 px-3 border-r w-24 text-center bg-blue-50/50 text-blue-900 font-bold">11. Claimed EU</th>
                    <th className="py-2.5 px-3 border-r w-24 text-center bg-blue-50/50 text-blue-900 font-bold">12. Claimed CH</th>
                    <th className="py-2.5 px-3 border-r w-24 text-center bg-blue-50/50 text-blue-900 font-bold">13. Claimed UK</th>
                    <th className="py-2.5 px-3 border-r w-24 text-center bg-blue-50/50 text-blue-900 font-bold">14. Claimed CORSIA</th>
                    <th className="py-2.5 px-3 border-r w-24 text-right bg-blue-50/50">15. Claimed MBM1</th>
                    <th className="py-2.5 px-3 border-r w-24 text-right bg-blue-50/50">16. Claimed MBM2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {safRows.map((row, idx) => (
                    <tr key={idx} className="group hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 border-r text-center font-bold sticky left-0 bg-white group-hover:bg-blue-50/40 z-10">{idx + 1}</td>
                      <td className="py-2 px-3 border-r font-mono font-bold">{row.airportIcao}</td>
                      <td className="py-2 px-3 border-r font-semibold text-gray-700">{row.supplier}</td>
                      <td className="py-2 px-3 border-r text-black/45">{row.supplierVat}</td>
                      <td className="py-2 px-3 border-r font-mono font-bold">{row.batchNumber}</td>
                      <td className="py-2 px-3 border-r text-right font-bold text-gray-900">{row.amountPurchased.toLocaleString()}</td>
                      <td className="py-2 px-3 border-r text-gray-600">{row.category}</td>
                      <td className="py-2 px-3 border-r text-black/45">{row.process}</td>
                      <td className="py-2 px-3 border-r text-black/45 truncate max-w-[80px]">{row.feedstock}</td>
                      <td className="py-2 px-3 border-r text-black/45">{row.origin}</td>
                      <td className="py-2 px-3 border-r text-right text-gray-700">{row.lifecycleEmissions}</td>
                      
                      <td className={isTableEditing ? "py-2 px-3 border-r text-center bg-blue-50/20" : "py-2 px-3 border-r text-right font-mono font-bold text-blue-700 bg-blue-50/20"}>
                        {isTableEditing ? (
                          <div className="flex justify-center items-center">
                            <input 
                              type="checkbox"
                              checked={row.claimedEu > 0}
                              disabled={!getRowGeofence(row).eu}
                              onChange={() => handleToggleRowSchema(idx, 'EU')}
                              className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </div>
                        ) : (
                          row.claimedEu > 0 ? `${row.claimedEu.toLocaleString()} t` : '-'
                        )}
                      </td>
                      
                      <td className={isTableEditing ? "py-2 px-3 border-r text-center bg-blue-50/20" : "py-2 px-3 border-r text-right font-mono font-bold text-blue-700 bg-blue-50/20"}>
                        {isTableEditing ? (
                          <div className="flex justify-center items-center">
                            <input 
                              type="checkbox"
                              checked={row.claimedCh > 0}
                              disabled={!getRowGeofence(row).ch}
                              onChange={() => handleToggleRowSchema(idx, 'CH')}
                              className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </div>
                        ) : (
                          row.claimedCh > 0 ? `${row.claimedCh.toLocaleString()} t` : '-'
                        )}
                      </td>
                      
                      <td className={isTableEditing ? "py-2 px-3 border-r text-center bg-blue-50/20" : "py-2 px-3 border-r text-right font-mono font-bold text-blue-700 bg-blue-50/20"}>
                        {isTableEditing ? (
                          <div className="flex justify-center items-center">
                            <input 
                              type="checkbox"
                              checked={row.claimedUk > 0}
                              disabled={!getRowGeofence(row).uk}
                              onChange={() => handleToggleRowSchema(idx, 'UK')}
                              className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </div>
                        ) : (
                          row.claimedUk > 0 ? `${row.claimedUk.toLocaleString()} t` : '-'
                        )}
                      </td>
                      
                      <td className={isTableEditing ? "py-2 px-3 border-r text-center bg-blue-50/20" : "py-2 px-3 border-r text-right font-mono font-bold text-blue-700 bg-blue-50/20"}>
                        {isTableEditing ? (
                          <div className="flex justify-center items-center">
                            <input 
                              type="checkbox"
                              checked={row.claimedCorsia > 0}
                              disabled={!getRowGeofence(row).corsia}
                              onChange={() => handleToggleRowSchema(idx, 'CORSIA')}
                              className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                          </div>
                        ) : (
                          row.claimedCorsia > 0 ? `${row.claimedCorsia.toLocaleString()} t` : '-'
                        )}
                      </td>
                      
                      <td className="py-2 px-3 border-r text-right text-gray-400 font-mono">-</td>
                      <td className="py-2 px-3 border-r text-right text-gray-400 font-mono">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-gray-400 bg-white rounded-lg flex flex-col items-center justify-center gap-2">
                <FileText size={36} className="text-gray-300 animate-pulse" />
                <span>Báo cáo cấn trừ SAF đang trống. Hãy bấm 'Tải file Excel (Mock)' để bắt đầu.</span>
              </div>
            )}
          </div>

        </div>

        {/* POPUP MODAL CHỈNH SỬA DÒNG - CHECKBOX ĐỘC BẢN SCHEMA THEO GEO-FENCING */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#0d1525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg border border-gray-150 shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="border-b border-gray-100 pb-3 mb-5">
                <h3 className="text-sm font-black text-vna-blue">
                  Cấu hình cấn trừ lô hàng SAF
                </h3>
                <p className="text-xs text-black/45">Mã lô hàng: <span className="font-bold text-gray-700">{editRowForm.batchNumber}</span> | Sân bay: <span className="font-bold text-gray-700">{editRowForm.airportIcao}</span></p>
              </div>

              <div className="space-y-4">
                
                {/* Thông tin lô hàng - Read Only */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-black/45 block">Nhà cung cấp:</span>
                    <span className="font-semibold text-black/85">{editRowForm.supplier}</span>
                  </div>
                  <div>
                    <span className="text-black/45 block">Khối lượng (tấn):</span>
                    <span className="font-semibold text-black/85 font-mono">{editRowForm.amountPurchased.toLocaleString()} t</span>
                  </div>
                  <div>
                    <span className="text-black/45 block">Nguyên liệu / Xuất xứ:</span>
                    <span className="font-semibold text-black/85">{editRowForm.origin}</span>
                  </div>
                  <div>
                    <span className="text-black/45 block">Lifecycle Emissions:</span>
                    <span className="font-semibold text-black/85 font-mono">{editRowForm.lifecycleEmissions} gCO2</span>
                  </div>
                </div>

                {/* UPGRADE: CÁC CỘT TỪ 11 ĐẾN 16 ĐỔI THÀNH CÁC CHECKBOX CHỈ ĐỊNH ĐỘC BẢN */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-vna-blue uppercase tracking-wider">Chọn Schema cấn trừ CO2 đền bù</span>
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-sm border border-indigo-200">Geo-fenced Only</span>
                  </div>
                  
                  <div className="p-3.5 bg-blue-50/40 rounded-lg border border-blue-200/60 space-y-3">
                    
                    {/* Checkbox EU ETS */}
                    <label className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                      !modalGeofence.eu ? 'bg-gray-100 opacity-40 border-gray-200 cursor-not-allowed' :
                      selectedSchema === 'EU' ? 'bg-white border-vna-blue shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="checkbox"
                        checked={selectedSchema === 'EU'}
                        disabled={!modalGeofence.eu}
                        onChange={() => setSelectedSchema(selectedSchema === 'EU' ? null : 'EU')}
                        className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-black/85">EU ETS (Claimed EU)</span>
                        <span className="block text-[10px] text-black/45">
                          {modalGeofence.eu ? 'Hợp lệ: Sân bay thuộc phạm vi quản lý EU.' : 'Không khả dụng cho sân bay này.'}
                        </span>
                      </div>
                    </label>

                    {/* Checkbox UK ETS */}
                    <label className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                      !modalGeofence.uk ? 'bg-gray-100 opacity-40 border-gray-200 cursor-not-allowed' :
                      selectedSchema === 'UK' ? 'bg-white border-vna-blue shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="checkbox"
                        checked={selectedSchema === 'UK'}
                        disabled={!modalGeofence.uk}
                        onChange={() => setSelectedSchema(selectedSchema === 'UK' ? null : 'UK')}
                        className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-black/85">UK ETS (Claimed UK)</span>
                        <span className="block text-[10px] text-black/45">
                          {modalGeofence.uk ? 'Hợp lệ: Sân bay thuộc phạm vi quản lý Vương quốc Anh.' : 'Không khả dụng cho sân bay này.'}
                        </span>
                      </div>
                    </label>

                    {/* Checkbox CH MBM */}
                    <label className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                      !modalGeofence.ch ? 'bg-gray-100 opacity-40 border-gray-200 cursor-not-allowed' :
                      selectedSchema === 'CH' ? 'bg-white border-vna-blue shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="checkbox"
                        checked={selectedSchema === 'CH'}
                        disabled={!modalGeofence.ch}
                        onChange={() => setSelectedSchema(selectedSchema === 'CH' ? null : 'CH')}
                        className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-black/85">CH MBM (Claimed Thụy Sĩ)</span>
                        <span className="block text-[10px] text-black/45">
                          {modalGeofence.ch ? 'Hợp lệ: Sân bay thuộc phạm vi Thụy Sĩ.' : 'Không khả dụng cho sân bay này.'}
                        </span>
                      </div>
                    </label>

                    {/* Checkbox CORSIA */}
                    <label className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                      selectedSchema === 'CORSIA' ? 'bg-white border-vna-blue shadow-2xs' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                      <input 
                        type="checkbox"
                        checked={selectedSchema === 'CORSIA'}
                        onChange={() => setSelectedSchema(selectedSchema === 'CORSIA' ? null : 'CORSIA')}
                        className="rounded text-vna-blue focus:ring-vna-blue border-gray-300 w-4 h-4 cursor-pointer"
                      />
                      <div className="text-xs">
                        <span className="font-bold text-black/85">CORSIA MBM</span>
                        <span className="block text-[10px] text-black/45">Hợp lệ cấn trừ toàn cầu (Baseline & Bù đắp dư).</span>
                      </div>
                    </label>

                  </div>
                  <div className="text-[10px] text-black/45 leading-relaxed italic px-1 flex items-start gap-1">
                    <Info size={12} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>Hệ thống chỉ cho phép chọn duy nhất 1 Schema cấn trừ cho mỗi lô hàng. Khối lượng CO2 claim tự động tính sau khi bạn lưu.</span>
                  </div>
                </div>

              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-xs h-9">Hủy</Button>
                <Button variant="primary" onClick={handleSaveRow} className="text-xs h-9 bg-vna-blue">Lưu cấu hình</Button>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  }

  // --- LIST VIEW SCREEN ---
  const filteredScenarios = scenarios.filter(sc => 
    sc.name.toLowerCase().includes(searchText.toLowerCase()) ||
    sc.reportPeriod.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-300">
      
      {/* List Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-vna-blue">Kịch bản mô phỏng Net Zero</h2>
          <p className="text-sm text-black/45 mt-1">Mô phỏng kịch bản tối ưu hóa chi phí mua tín chỉ đền bù carbon dựa vào phân bổ SAF Geo-fencing</p>
        </div>
        <Button onClick={handleAddNew} className="shadow-md cursor-pointer flex items-center gap-1.5 bg-vna-blue">
          <Plus size={18} /> Thiết lập kịch bản mới
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm kịch bản, kỳ báo cáo..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-vna-blue"
          />
        </div>
        {searchText && (
          <button onClick={() => setSearchText('')} className="text-xs text-red-500 font-bold hover:text-red-700">Xóa lọc</button>
        )}
      </div>

      {/* Scenarios Grid List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 flex-1 min-h-[400px] bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center rounded-tl-lg">STT</th>
              <th className="py-3 px-4 font-semibold text-gray-700">Tên kịch bản</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-32">Kỳ báo cáo</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-48">Loại kịch bản</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-28">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right w-36">CO2 giảm trừ</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right w-36">CO2 giảm thiểu</th>
              <th className="py-3 px-4 font-semibold text-gray-700 text-right w-44">Chi phí / Phát thải ròng</th>
              <th className="py-3 px-4 font-semibold text-gray-700 w-32 text-center rounded-tr-lg">Chức năng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredScenarios.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                onClick={() => handleEdit(item)}
              >
                <td className="py-3.5 px-4 text-center text-black/45">{index + 1}</td>
                <td className="py-3.5 px-4 text-vna-blue font-bold group-hover:underline">{item.name}</td>
                <td className="py-3.5 px-4 font-semibold text-gray-700">{item.reportPeriod}</td>
                <td className="py-3.5 px-4 text-gray-600 text-xs font-semibold">{item.scenarioType}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    item.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-gray-50 text-black/45 border-gray-200'
                  }`}>
                    {item.status === 'Approved' ? 'Đã phê duyệt' : 'Nháp'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                  {item.totalCo2Saving > 0 ? `-${item.totalCo2Saving.toLocaleString()} tCO2` : <span className="text-gray-400 font-normal italic text-xs">Chưa chạy</span>}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-600">
                  {item.scenarioType === 'Mô phỏng Net Zero 2050' ? (
                    `${item.totalCostSaved.toLocaleString()} tCO2 Ròng`
                  ) : (
                    item.totalCostSaved > 0 ? `Tiết kiệm $${item.totalCostSaved.toLocaleString()}` : <span className="text-gray-400 font-normal italic text-xs">Chưa tối ưu</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1.5 rounded text-vna-blue hover:bg-blue-100 cursor-pointer"
                      title="Chỉnh sửa kịch bản"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                      title="Xóa kịch bản"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredScenarios.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                  Không tìm thấy kịch bản mô phỏng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* POPUP MODAL CHỌN LOẠI KỊCH BẢN MỚI */}
      {isSelectTypeModalOpen && (
        <div className="fixed inset-0 bg-[#0d1525]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-gray-150 shadow-2xl w-full max-w-2xl p-6 relative animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsSelectTypeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="border-b border-gray-100 pb-3 mb-6">
              <h3 className="text-base font-black text-vna-navy uppercase tracking-wide">
                Thiết lập kịch bản mô phỏng mới
              </h3>
              <p className="text-xs text-black/45 mt-1">Vui lòng chọn loại kịch bản mô phỏng bạn muốn cấu hình cho hệ thống</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: Compliance */}
              <div 
                onClick={handleCreateComplianceScenario}
                className="border border-gray-200 hover:border-vna-blue hover:bg-blue-50/20 p-5 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col justify-between h-52 shadow-3xs"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-vna-blue/10 text-vna-blue rounded-lg flex items-center justify-center transition-colors group-hover:bg-vna-blue group-hover:text-white">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vna-navy group-hover:text-vna-blue">Mô phỏng kịch bản đền bù carbon</h4>
                    <p className="text-xs text-black/45 mt-1 leading-relaxed">
                      Tối ưu hóa chi phí mua chứng chỉ carbon bằng việc lựa chọn cấn trừ thông minh các lô nhiên liệu SAF theo địa lý bay (EU ETS, UK ETS, CORSIA).
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-vna-blue font-bold flex items-center gap-1 mt-2">
                  <span>Bắt đầu thiết lập</span> <Plus size={12} />
                </div>
              </div>

              {/* Option 2: Net Zero 2050 */}
              <div 
                onClick={handleCreateNetZeroScenario}
                className="border border-gray-200 hover:border-vna-blue hover:bg-blue-50/20 p-5 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col justify-between h-52 shadow-3xs"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Leaf size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vna-navy group-hover:text-emerald-700">Mô phỏng kịch bản Net Zero 2050</h4>
                    <p className="text-xs text-black/45 mt-1 leading-relaxed">
                      Xây dựng lộ trình giảm phát thải khí nhà kính dài hạn đến năm 2050 thông qua 6 giải pháp chuyển đổi xanh (SAF, Đội tàu bay mới, Tối ưu đường bay...).
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <span>Bắt đầu thiết lập</span> <Plus size={12} />
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button variant="ghost" onClick={() => setIsSelectTypeModalOpen(false)} className="text-xs h-9">Hủy bỏ</Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
