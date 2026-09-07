import React, { useState, useMemo, useEffect } from 'react';
import { Button, Card, Input, Select, StatusChip } from '../components/UI';
import { 
  TrendingUp, Leaf, Plane, DollarSign, RefreshCw, Download, Plus, 
  Trash2, Edit3, Save, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Layers, Sliders, BarChart3, HelpCircle, ArrowRight, X, Copy, Check,
  FileSpreadsheet, Award, Info, FileText, ArrowUpRight, Settings2, SlidersHorizontal,
  RotateCcw, TrendingDown, Eye, ShieldAlert, Split, CheckSquare, Square,
  Zap, Lock, ChevronRight, BarChart2, GitCommit, Compass
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

// --- DATA TYPES ---

export interface SafLedgerBatch {
  id: string;
  batchNo: string;
  airportCode: string;
  airportName: string;
  region: 'EU' | 'UK' | 'NON_EU';
  supplier: string;
  supplierVat: string;
  availableTonnes: number;
  lifecycleEmission: number; // gCO2eq/MJ
  co2SavedPerTonne: number; // tCO2 giảm / tấn SAF (VD: 2.62)
  eligibleSchemes: ('EU_ETS' | 'UK_ETS' | 'CORSIA')[];
  selected: boolean;
}

export interface ScenarioItem {
  id: string;
  name: string;
  createdAt: string;
  status: 'Draft' | 'Approved';
  approver?: string;
  approvalDate?: string;
  totalSafTonnes: number;
  allocEu: number;
  allocUk: number;
  allocCorsia: number;
  priceEu: number;
  priceUk: number;
  priceCorsia: number;
  totalCost: number;
  netSavings: number;
  co2Offset: number;
  isAutoOptimized: boolean;
  notes?: string;
}

// INITIAL LEDGER BATCHES
const INITIAL_SAF_LEDGER: SafLedgerBatch[] = [
  {
    id: 'b-1',
    batchNo: 'SAF-2026-EU-CDG01',
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    region: 'EU',
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    availableTonnes: 2000,
    lifecycleEmission: 16.2,
    co2SavedPerTonne: 2.62,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    selected: true
  },
  {
    id: 'b-2',
    batchNo: 'SAF-2026-EU-FRA02',
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    region: 'EU',
    supplier: 'Neste Oil Netherlands B.V.',
    supplierVat: 'NL814125881B01',
    availableTonnes: 1200,
    lifecycleEmission: 15.8,
    co2SavedPerTonne: 2.64,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    selected: true
  },
  {
    id: 'b-3',
    batchNo: 'SAF-2026-UK-LHR01',
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    region: 'UK',
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    availableTonnes: 1000,
    lifecycleEmission: 17.5,
    co2SavedPerTonne: 2.58,
    eligibleSchemes: ['UK_ETS', 'CORSIA'],
    selected: true
  },
  {
    id: 'b-4',
    batchNo: 'SAF-2026-ASIA-SIN01',
    airportCode: 'SIN',
    airportName: 'Singapore Changi (Singapore)',
    region: 'NON_EU',
    supplier: 'Neste Singapore Pte Ltd',
    supplierVat: 'SG200718921R',
    availableTonnes: 800,
    lifecycleEmission: 18.0,
    co2SavedPerTonne: 2.55,
    eligibleSchemes: ['CORSIA'],
    selected: true
  }
];

export const NetZeroSolutionPage: React.FC = () => {
  // --- 1. PERIOD & VIEW STATE ---
  const [reportPeriod, setReportPeriod] = useState<string>('Tháng 05/2026');
  const [activeVisualTab, setActiveVisualTab] = useState<'sankey' | 'chart' | 'table'>('sankey');

  // --- 2. INPUT PARAMETERS ---
  // SAF Selection mode: 'ledger' (từ kho) hoặc 'manual' (nhập tay)
  const [safInputMode, setSafInputMode] = useState<'ledger' | 'manual'>('ledger');
  const [safLedger, setSafLedger] = useState<SafLedgerBatch[]>(INITIAL_SAF_LEDGER);
  const [manualSafTonnes, setManualSafTonnes] = useState<number>(5000);

  // Geo-fence Policies Selection
  const [geoPolicies, setGeoPolicies] = useState<{
    euEts: boolean;
    ukEts: boolean;
    corsia: boolean;
  }>({
    euEts: true,
    ukEts: true,
    corsia: true
  });

  // Carbon Price Forecast (EUR/tCO2 quy đổi tương đương)
  const [priceEuEts, setPriceEuEts] = useState<number>(78.5); // Range: 60 - 120 EUR
  const [priceUkEts, setPriceUkEts] = useState<number>(56.0); // Range: 40 - 90 GBP/EUR
  const [priceCorsia, setPriceCorsia] = useState<number>(22.5); // Range: 10 - 40 USD/EUR

  // Baseline Jet A-1 & SAF Premium
  const [safCostPerTonne, setSafCostPerTonne] = useState<number>(2450); // EUR/tấn SAF
  const [jetA1CostPerTonne, setJetA1CostPerTonne] = useState<number>(820); // EUR/tấn Jet A1 (Premium = 1630 EUR)

  // Gross Obligations (tCO2 nợ gốc trước khi trừ SAF)
  const grossObligation = {
    euEts: 28500, // tCO2 nợ gốc EU
    ukEts: 9200,  // tCO2 nợ gốc UK
    corsia: 48000 // tCO2 nợ gốc CORSIA
  };

  // Free Allowances (Hạn ngạch miễn phí)
  const freeAllowances = {
    euEts: 4500,
    ukEts: 1800,
    corsia: 0
  };

  // Auto-optimize vs Manual Custom Allocation
  const [isAutoOptimize, setIsAutoOptimize] = useState<boolean>(true);
  const [customAllocation, setCustomAllocation] = useState<{
    euEts: number;
    ukEts: number;
    corsia: number;
  }>({
    euEts: 3200,
    ukEts: 1000,
    corsia: 800
  });

  // --- 3. SCENARIOS LIST STATE ---
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(() => {
    const saved = localStorage.getItem('vna_netzero_solution_scenarios');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'sc-01',
        name: 'Kịch bản 1: Tối ưu hóa Thuật toán Chuẩn (Default)',
        createdAt: '15/05/2026 09:30',
        status: 'Approved',
        approver: 'Nguyễn Văn A (Phó TGĐ)',
        approvalDate: '16/05/2026 14:20',
        totalSafTonnes: 5000,
        allocEu: 3200,
        allocUk: 1000,
        allocCorsia: 800,
        priceEu: 78.5,
        priceUk: 56.0,
        priceCorsia: 22.5,
        totalCost: 16845000,
        netSavings: 742600,
        co2Offset: 13010,
        isAutoOptimized: true,
        notes: 'Phân bổ ưu tiên dồn SAF vào chặng Châu Âu để tránh mua hạn ngạch EUA đắt đỏ.'
      },
      {
        id: 'sc-02',
        name: 'Kịch bản 2: Giá Carbon Châu Âu Tăng Đột Biến (EUA 95€)',
        createdAt: '18/05/2026 11:15',
        status: 'Draft',
        totalSafTonnes: 5000,
        allocEu: 3200,
        allocUk: 1000,
        allocCorsia: 800,
        priceEu: 95.0,
        priceUk: 65.0,
        priceCorsia: 26.0,
        totalCost: 17215000,
        netSavings: 935400,
        co2Offset: 13010,
        isAutoOptimized: true,
        notes: 'Giả lập kịch bản stress-test khi thị trường EU ETS siết chặt trần phát thải.'
      },
      {
        id: 'sc-03',
        name: 'Kịch bản 3: Phân bổ Đều theo Tỷ lệ Sản lượng (Manual)',
        createdAt: '20/05/2026 16:40',
        status: 'Draft',
        totalSafTonnes: 5000,
        allocEu: 2000,
        allocUk: 1000,
        allocCorsia: 2000,
        priceEu: 78.5,
        priceUk: 56.0,
        priceCorsia: 22.5,
        totalCost: 17182000,
        netSavings: 405600,
        co2Offset: 12970,
        isAutoOptimized: false,
        notes: 'Thử nghiệm chia đều SAF cho các chặng bay quốc tế đường dài.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('vna_netzero_solution_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  // --- MODALS STATE ---
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [newScenarioName, setNewScenarioName] = useState<string>('');
  
  // Double Confirmation Approval Modal
  const [isApproveStep1Open, setIsApproveStep1Open] = useState<boolean>(false);
  const [isApproveStep2Open, setIsApproveStep2Open] = useState<boolean>(false);
  const [approverName, setApproverName] = useState<string>('Nguyễn Văn A');
  const [approverTitle, setApproverTitle] = useState<string>('Phó Tổng Giám đốc phụ trách Kỹ thuật & Khai thác');
  const [approvalNote, setApprovalNote] = useState<string>('Phê duyệt chốt phương án phân bổ SAF kỳ Tháng 05/2026');

  // --- 4. CALCULATION ENGINE ---

  // Total Available SAF
  const totalAvailableSaf = useMemo(() => {
    if (safInputMode === 'manual') {
      return manualSafTonnes;
    }
    return safLedger
      .filter(b => b.selected)
      .reduce((sum, b) => sum + b.availableTonnes, 0);
  }, [safInputMode, manualSafTonnes, safLedger]);

  // Weighted Average CO2 Saved per Tonne SAF (tCO2 / tonne SAF)
  const avgCo2SavedPerTonne = useMemo(() => {
    if (safInputMode === 'manual') return 2.60;
    const selected = safLedger.filter(b => b.selected);
    if (selected.length === 0) return 2.60;
    const totalTonnes = selected.reduce((s, b) => s + b.availableTonnes, 0);
    const totalSaving = selected.reduce((s, b) => s + (b.availableTonnes * b.co2SavedPerTonne), 0);
    return totalTonnes > 0 ? totalSaving / totalTonnes : 2.60;
  }, [safInputMode, safLedger]);

  // Effective SAF Allocation (Tonnes)
  const effectiveAllocation = useMemo(() => {
    if (!isAutoOptimize) {
      // Manual mode: Normalize or clamp to totalAvailableSaf
      const rawEu = geoPolicies.euEts ? customAllocation.euEts : 0;
      const rawUk = geoPolicies.ukEts ? customAllocation.ukEts : 0;
      const rawCorsia = geoPolicies.corsia ? customAllocation.corsia : 0;
      return {
        euEts: rawEu,
        ukEts: rawUk,
        corsia: rawCorsia,
        total: rawEu + rawUk + rawCorsia
      };
    }

    // AUTO-OPTIMIZATION ALGORITHM:
    // Sắp xếp các cơ chế theo mức giá đền bù cao nhất: EU ETS (priceEuEts) > UK ETS (priceUkEts) > CORSIA (priceCorsia)
    let remainingSaf = totalAvailableSaf;
    let allocEu = 0;
    let allocUk = 0;
    let allocCorsia = 0;

    // 1. Prioritize EU ETS (Max capacity based on net obligation: obligation - freeAllowances)
    if (geoPolicies.euEts) {
      const netEuObligation = Math.max(0, grossObligation.euEts - freeAllowances.euEts);
      const maxSafForEu = Math.min(remainingSaf, Math.ceil(netEuObligation / avgCo2SavedPerTonne));
      allocEu = maxSafForEu;
      remainingSaf -= allocEu;
    }

    // 2. Prioritize UK ETS
    if (geoPolicies.ukEts && remainingSaf > 0) {
      const netUkObligation = Math.max(0, grossObligation.ukEts - freeAllowances.ukEts);
      const maxSafForUk = Math.min(remainingSaf, Math.ceil(netUkObligation / avgCo2SavedPerTonne));
      allocUk = maxSafForUk;
      remainingSaf -= allocUk;
    }

    // 3. Remainder to CORSIA
    if (geoPolicies.corsia && remainingSaf > 0) {
      allocCorsia = remainingSaf;
      remainingSaf = 0;
    }

    return {
      euEts: allocEu,
      ukEts: allocUk,
      corsia: allocCorsia,
      total: allocEu + allocUk + allocCorsia
    };
  }, [isAutoOptimize, customAllocation, totalAvailableSaf, geoPolicies, grossObligation, freeAllowances, avgCo2SavedPerTonne]);

  // CO2 Emissions & Compliance Reductions
  const emissionMetrics = useMemo(() => {
    const co2SavedEu = Math.round(effectiveAllocation.euEts * avgCo2SavedPerTonne);
    const co2SavedUk = Math.round(effectiveAllocation.ukEts * avgCo2SavedPerTonne);
    const co2SavedCorsia = Math.round(effectiveAllocation.corsia * avgCo2SavedPerTonne);
    const totalCo2Saved = co2SavedEu + co2SavedUk + co2SavedCorsia;

    // Remaining obligations to offset via carbon credits
    const remainEu = Math.max(0, grossObligation.euEts - freeAllowances.euEts - co2SavedEu);
    const remainUk = Math.max(0, grossObligation.ukEts - freeAllowances.ukEts - co2SavedUk);
    const remainCorsia = Math.max(0, grossObligation.corsia - freeAllowances.corsia - co2SavedCorsia);
    const totalRemainToOffset = remainEu + remainUk + remainCorsia;

    const totalGrossEmission = grossObligation.euEts + grossObligation.ukEts + grossObligation.corsia;
    const totalFree = freeAllowances.euEts + freeAllowances.ukEts + freeAllowances.corsia;

    return {
      co2SavedEu,
      co2SavedUk,
      co2SavedCorsia,
      totalCo2Saved,
      remainEu,
      remainUk,
      remainCorsia,
      totalRemainToOffset,
      totalGrossEmission,
      totalFree
    };
  }, [effectiveAllocation, avgCo2SavedPerTonne, grossObligation, freeAllowances]);

  // Financial Metrics: Costs, Baseline & Net Savings
  const financialMetrics = useMemo(() => {
    // 1. Scenario Cost:
    // Chi phí mua SAF: SAF Tonnes * SAF Price
    const safCost = effectiveAllocation.total * safCostPerTonne;
    // Chi phí mua tín chỉ carbon cho phần nợ còn lại:
    const creditCostEu = emissionMetrics.remainEu * priceEuEts;
    const creditCostUk = emissionMetrics.remainUk * priceUkEts;
    const creditCostCorsia = emissionMetrics.remainCorsia * priceCorsia;
    const totalCreditCost = creditCostEu + creditCostUk + creditCostCorsia;
    const totalScenarioCost = safCost + totalCreditCost;

    // 2. Baseline Cost (Không dùng thuật toán tối ưu: Bay Jet A-1 100%, chịu phạt thiếu hụt SAF ReFuelEU và mua 100% tín chỉ giá cao):
    const baselineFuelCost = effectiveAllocation.total * jetA1CostPerTonne;
    const baselineCreditEu = Math.max(0, grossObligation.euEts - freeAllowances.euEts) * priceEuEts;
    const baselineCreditUk = Math.max(0, grossObligation.ukEts - freeAllowances.ukEts) * priceUkEts;
    const baselineCreditCorsia = Math.max(0, grossObligation.corsia - freeAllowances.corsia) * priceCorsia;
    // Tránh phạt quy chuẩn bắt buộc ReFuelEU (~1,200€/tấn SAF thiếu hụt tại sân bay EU)
    const refuelEuPenaltyAvoided = effectiveAllocation.euEts * 1200;
    const baselineTotalCredit = baselineCreditEu + baselineCreditUk + baselineCreditCorsia + refuelEuPenaltyAvoided;
    const totalBaselineCost = baselineFuelCost + baselineTotalCredit;

    // 3. Net Savings (Tiết kiệm ròng so với Baseline):
    const netSavings = totalBaselineCost - totalScenarioCost;
    const savingsPercentage = totalBaselineCost > 0 ? (netSavings / totalBaselineCost) * 100 : 0;

    return {
      safCost,
      creditCostEu,
      creditCostUk,
      creditCostCorsia,
      totalCreditCost,
      totalScenarioCost,
      totalBaselineCost,
      netSavings,
      savingsPercentage
    };
  }, [effectiveAllocation, safCostPerTonne, jetA1CostPerTonne, emissionMetrics, priceEuEts, priceUkEts, priceCorsia, grossObligation, freeAllowances]);

  // Handle Save Scenario
  const handleSaveScenario = () => {
    const newSc: ScenarioItem = {
      id: `sc-${Date.now()}`,
      name: newScenarioName.trim() || `Kịch bản mô phỏng ${reportPeriod} (${new Date().toLocaleDateString('vi-VN')})`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'Draft',
      totalSafTonnes: effectiveAllocation.total,
      allocEu: effectiveAllocation.euEts,
      allocUk: effectiveAllocation.ukEts,
      allocCorsia: effectiveAllocation.corsia,
      priceEu: priceEuEts,
      priceUk: priceUkEts,
      priceCorsia: priceCorsia,
      totalCost: financialMetrics.totalScenarioCost,
      netSavings: financialMetrics.netSavings,
      co2Offset: emissionMetrics.totalCo2Saved,
      isAutoOptimized: isAutoOptimize,
      notes: `Lô SAF: ${effectiveAllocation.total.toLocaleString()} tấn. Phân bổ: EU (${effectiveAllocation.euEts.toLocaleString()}), UK (${effectiveAllocation.ukEts.toLocaleString()}), CORSIA (${effectiveAllocation.corsia.toLocaleString()}).`
    };

    setScenarios([newSc, ...scenarios]);
    setIsSaveModalOpen(false);
    setNewScenarioName('');
    alert('Đã lưu kịch bản mô phỏng thành công vào danh sách quản lý!');
  };

  // Handle Load Scenario
  const handleLoadScenario = (sc: ScenarioItem) => {
    setManualSafTonnes(sc.totalSafTonnes);
    setSafInputMode('manual');
    setIsAutoOptimize(sc.isAutoOptimized);
    setCustomAllocation({
      euEts: sc.allocEu,
      ukEts: sc.allocUk,
      corsia: sc.allocCorsia
    });
    setPriceEuEts(sc.priceEu);
    setPriceUkEts(sc.priceUk);
    setPriceCorsia(sc.priceCorsia);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Approve Scenario (Double confirmation completed)
  const handleConfirmApproval = () => {
    const approvedSc: ScenarioItem = {
      id: `sc-app-${Date.now()}`,
      name: `Kịch bản Đã Phê Duyệt - Kỳ ${reportPeriod}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'Approved',
      approver: `${approverName} (${approverTitle})`,
      approvalDate: new Date().toLocaleString('vi-VN'),
      totalSafTonnes: effectiveAllocation.total,
      allocEu: effectiveAllocation.euEts,
      allocUk: effectiveAllocation.ukEts,
      allocCorsia: effectiveAllocation.corsia,
      priceEu: priceEuEts,
      priceUk: priceUkEts,
      priceCorsia: priceCorsia,
      totalCost: financialMetrics.totalScenarioCost,
      netSavings: financialMetrics.netSavings,
      co2Offset: emissionMetrics.totalCo2Saved,
      isAutoOptimized: isAutoOptimize,
      notes: approvalNote
    };

    setScenarios([approvedSc, ...scenarios]);
    setIsApproveStep2Open(false);
    alert(`Đã hoàn tất PHÊ DUYỆT kịch bản! Hệ thống đã ghi nhận cập nhật vào Database Ledger thực tế.`);
  };

  // Reset to default
  const handleResetDefaults = () => {
    setSafLedger(INITIAL_SAF_LEDGER);
    setSafInputMode('ledger');
    setManualSafTonnes(5000);
    setGeoPolicies({ euEts: true, ukEts: true, corsia: true });
    setPriceEuEts(78.5);
    setPriceUkEts(56.0);
    setPriceCorsia(22.5);
    setIsAutoOptimize(true);
    setCustomAllocation({ euEts: 3200, ukEts: 1000, corsia: 800 });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER BANNER & ACTION TOOLBAR */}
      {/* ============================================================ */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles size={12} className="animate-pulse text-emerald-600" />
                Giải pháp Tối ưu Phân bổ SAF & Đền bù Carbon
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-vna-blue border border-blue-100">
                Chống Kê khai Trùng lặp
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-vna-navy tracking-tight">
              Mô phỏng Kịch bản Net Zero
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-3xl">
              Mô phỏng phân bổ thông minh nguồn nhiên liệu SAF khả dụng vào các cơ chế Geo-fence (EU ETS, UK ETS, CORSIA) 
              dựa trên dự báo biến động giá carbon để tối đa hóa mức tiết kiệm tài chính cho Vietnam Airlines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
              <span className="text-gray-500 font-bold">Kỳ:</span>
              <select 
                value={reportPeriod} 
                onChange={(e) => setReportPeriod(e.target.value)}
                className="bg-transparent font-bold text-gray-800 outline-hidden cursor-pointer"
              >
                <option value="Tháng 05/2026">Tháng 05/2026</option>
                <option value="Tháng 06/2026">Tháng 06/2026</option>
                <option value="Quý 2/2026">Quý 2/2026</option>
                <option value="Cả năm 2026">Cả năm 2026</option>
              </select>
            </div>

            {/* Verification report popup button */}
            <Button
              onClick={() => setIsVerifierModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-gray-300"
            >
              <FileText size={15} className="text-vna-blue" />
              Báo cáo Xác minh
            </Button>

            {/* Compare Scenarios button */}
            <Button
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-indigo-200"
            >
              <Split size={15} />
              So sánh Kịch bản ({scenarios.length})
            </Button>

            {/* Save Scenario button */}
            <Button
              onClick={() => setIsSaveModalOpen(true)}
              className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save size={15} />
              Lưu Kịch bản
            </Button>

            {/* Approve Scenario button (distinct amber/orange warning with 2-step confirmation) */}
            <Button
              onClick={() => setIsApproveStep1Open(true)}
              className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm border border-amber-700 ring-2 ring-amber-400/30 animate-pulse"
            >
              <ShieldCheck size={15} />
              Phê duyệt Kịch bản
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. THREE KEY FINANCIAL & ESG KPI CARDS (Ban Giám đốc) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI CARD 1: TỔNG CHI PHÍ TUÂN THỦ */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs relative overflow-hidden group hover:border-vna-blue transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                1. Tổng Chi phí Tuân thủ
              </p>
              <h3 className="text-2xl font-black text-vna-navy mt-1">
                {(financialMetrics.totalScenarioCost / 1000000).toFixed(2)}M €
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                ≈ ${(financialMetrics.totalScenarioCost * 1.08 / 1000000).toFixed(2)}M USD
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-vna-blue flex items-center justify-center">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <span>• Mua SAF ({effectiveAllocation.total.toLocaleString()} tấn):</span>
              <span className="font-bold text-gray-800">{(financialMetrics.safCost / 1000000).toFixed(2)}M €</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>• Mua tín chỉ CO₂ còn lại:</span>
              <span className="font-bold text-gray-800">{(financialMetrics.totalCreditCost / 1000000).toFixed(2)}M €</span>
            </div>
          </div>
        </div>

        {/* KPI CARD 2: NET SAVINGS (NỔI BẬT XANH LỤC TÍCH CỰC) */}
        <div className="bg-emerald-600 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group border border-emerald-500">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-extrabold text-emerald-100 uppercase tracking-wider">
                  2. Net Savings (Tiết kiệm ròng)
                </p>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-emerald-800 shadow-xs">
                  {financialMetrics.savingsPercentage >= 0 ? '+' : ''}{financialMetrics.savingsPercentage.toFixed(1)}%
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
                {financialMetrics.netSavings >= 0 ? '+' : ''}{(financialMetrics.netSavings / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k €
              </h3>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                ≈ {financialMetrics.netSavings >= 0 ? '+' : ''}${(financialMetrics.netSavings * 1.08 / 1000).toFixed(0)}k USD so với Baseline (Jet A-1 100%)
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 space-y-1 text-xs text-emerald-50">
            <div className="flex justify-between items-center">
              <span>Chi phí Baseline không tối ưu:</span>
              <span className="font-semibold line-through opacity-85">{(financialMetrics.totalBaselineCost / 1000000).toFixed(2)}M €</span>
            </div>
            <div className="flex justify-between items-center font-bold text-white">
              <span>Chi phí Kịch bản tối ưu SAF:</span>
              <span>{(financialMetrics.totalScenarioCost / 1000000).toFixed(2)}M €</span>
            </div>
          </div>
        </div>

        {/* KPI CARD 3: TẤN CO2 ĐƯỢC ĐỀN BÙ / GIẢM THIỂU */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                3. CO₂ Offset & Giảm thiểu
              </p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {emissionMetrics.totalCo2Saved.toLocaleString()} <span className="text-sm font-bold text-gray-500">tCO₂</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Chỉ số tuân thủ báo cáo ESG quốc tế
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf size={22} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>• Tổng phát thải nợ gốc:</span>
              <span className="font-bold text-gray-800">{emissionMetrics.totalGrossEmission.toLocaleString()} tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span>• Hạn ngạch miễn phí (Free):</span>
              <span className="font-bold text-blue-600">-{emissionMetrics.totalFree.toLocaleString()} tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span>• CO₂ giảm do nạp SAF:</span>
              <span className="font-bold text-emerald-600">-{emissionMetrics.totalCo2Saved.toLocaleString()} tCO₂</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-1 font-bold text-amber-700">
              <span>• CO₂ còn lại phải mua tín chỉ:</span>
              <span>{emissionMetrics.totalRemainToOffset.toLocaleString()} tCO₂</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. MAIN WORKSPACE: LEFT CONTROL PANEL & RIGHT VISUALIZATION */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* ZONE 1: INPUT PARAMETER ZONE (BẢNG ĐIỀU KHIỂN BÊN TRÁI - 5 COLS) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-vna-blue text-white flex items-center justify-center">
                <Sliders size={16} />
              </div>
              <h2 className="text-sm font-black text-vna-navy uppercase tracking-wide">
                1. Tham số Đầu vào (Input Zone)
              </h2>
            </div>
            <button 
              onClick={handleResetDefaults}
              className="text-gray-400 hover:text-vna-blue p-1 rounded-md transition-colors"
              title="Khôi phục mặc định"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* SECTION 1.1: AVAILABLE SAF VOLUME (LÔ SAF KHẢ DỤNG) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Leaf size={14} className="text-emerald-600" />
                Lô SAF khả dụng (Available SAF Volume)
              </label>
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  onClick={() => setSafInputMode('ledger')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    safInputMode === 'ledger' ? 'bg-white text-vna-blue shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Từ Kho Ledger
                </button>
                <button
                  onClick={() => setSafInputMode('manual')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    safInputMode === 'manual' ? 'bg-white text-vna-blue shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Nhập tay
                </button>
              </div>
            </div>

            {safInputMode === 'ledger' ? (
              <div className="space-y-2">
                <div className="text-[11px] text-gray-500 flex justify-between items-center">
                  <span>Chọn các lô SAF trong kho muốn đưa vào mô phỏng:</span>
                  <span className="font-bold text-vna-blue">
                    Tổng: {totalAvailableSaf.toLocaleString()} tấn
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {safLedger.map(batch => (
                    <div 
                      key={batch.id}
                      onClick={() => {
                        setSafLedger(safLedger.map(b => b.id === batch.id ? { ...b, selected: !b.selected } : b));
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        batch.selected 
                          ? 'bg-blue-50/50 border-vna-blue text-gray-900 shadow-2xs' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {batch.selected ? (
                            <CheckSquare size={16} className="text-vna-blue" />
                          ) : (
                            <Square size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {batch.batchNo}
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-gray-200 font-mono">
                              {batch.airportCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {batch.supplier} • {batch.airportName}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            Hệ số giảm: {batch.co2SavedPerTonne} tCO₂/tấn SAF (Phát thải: {batch.lifecycleEmission} g/MJ)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-900 text-sm">
                          {batch.availableTonnes.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-500 block">tấn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 font-medium">Nhập số tấn SAF muốn mô phỏng:</span>
                  <span className="font-black text-vna-blue text-sm">{manualSafTonnes.toLocaleString()} tấn</span>
                </div>
                <input 
                  type="range"
                  min={500}
                  max={20000}
                  step={250}
                  value={manualSafTonnes}
                  onChange={(e) => setManualSafTonnes(Number(e.target.value))}
                  className="w-full accent-vna-blue cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={manualSafTonnes}
                    onChange={(e) => setManualSafTonnes(Math.max(0, Number(e.target.value)))}
                    className="h-8 text-xs font-bold"
                  />
                  <span className="text-xs text-gray-500 font-bold">tấn</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 1.2: GEO-FENCE POLICIES & SMART ALLOCATION */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Compass size={14} className="text-vna-blue" />
                Chính sách Geo-fence áp dụng
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-gray-500">Tối ưu tự động:</span>
                <input 
                  type="checkbox"
                  checked={isAutoOptimize}
                  onChange={(e) => setIsAutoOptimize(e.target.checked)}
                  className="rounded-sm text-vna-blue focus:ring-vna-blue h-4 w-4 accent-vna-blue cursor-pointer"
                />
              </div>
            </div>

            {/* Checkbox Policies */}
            <div className="grid grid-cols-3 gap-2">
              <label className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                geoPolicies.euEts ? 'bg-blue-50/70 border-vna-blue text-vna-navy' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px]">EU ETS</span>
                  <input 
                    type="checkbox"
                    checked={geoPolicies.euEts}
                    onChange={(e) => setGeoPolicies({ ...geoPolicies, euEts: e.target.checked })}
                    className="rounded-sm accent-vna-blue"
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">Châu Âu (ReFuelEU)</span>
                <span className="text-[10px] font-bold text-vna-blue mt-1">Giá: {priceEuEts}€/t</span>
              </label>

              <label className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                geoPolicies.ukEts ? 'bg-indigo-50/70 border-indigo-400 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px]">UK ETS</span>
                  <input 
                    type="checkbox"
                    checked={geoPolicies.ukEts}
                    onChange={(e) => setGeoPolicies({ ...geoPolicies, ukEts: e.target.checked })}
                    className="rounded-sm accent-indigo-600"
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">Vương Quốc Anh</span>
                <span className="text-[10px] font-bold text-indigo-600 mt-1">Giá: {priceUkEts}€/t</span>
              </label>

              <label className={`p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all ${
                geoPolicies.corsia ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-[11px]">CORSIA</span>
                  <input 
                    type="checkbox"
                    checked={geoPolicies.corsia}
                    onChange={(e) => setGeoPolicies({ ...geoPolicies, corsia: e.target.checked })}
                    className="rounded-sm accent-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-gray-500 mt-1">Quốc tế chung</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-1">Giá: {priceCorsia}€/t</span>
              </label>
            </div>

            {/* Smart Default Note or Manual Allocation Sliders */}
            {isAutoOptimize ? (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Sparkles size={14} />
                  Thuật toán tự động phân bổ tối ưu chi phí:
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Ưu tiên rót tối đa <strong>{effectiveAllocation.euEts.toLocaleString()} tấn SAF</strong> vào giỏ EU ETS 
                  (vì giá EUA cao nhất {priceEuEts}€/t), kế tiếp <strong>{effectiveAllocation.ukEts.toLocaleString()} tấn</strong> vào UK ETS ({priceUkEts}€/t), 
                  và <strong>{effectiveAllocation.corsia.toLocaleString()} tấn</strong> vào CORSIA.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
                <div className="flex justify-between items-center text-gray-700 font-bold">
                  <span>Tự điều chỉnh số tấn SAF phân bổ từng giỏ:</span>
                  <span className="text-vna-blue font-black">
                    {(customAllocation.euEts + customAllocation.ukEts + customAllocation.corsia).toLocaleString()} / {totalAvailableSaf.toLocaleString()} tấn
                  </span>
                </div>

                {geoPolicies.euEts && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-vna-blue">EU ETS (Châu Âu):</span>
                      <span className="font-mono font-bold">{customAllocation.euEts.toLocaleString()} tấn</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={totalAvailableSaf}
                      step={100}
                      value={customAllocation.euEts}
                      onChange={(e) => setCustomAllocation({ ...customAllocation, euEts: Number(e.target.value) })}
                      className="w-full accent-vna-blue cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {geoPolicies.ukEts && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-indigo-700">UK ETS (Vương Quốc Anh):</span>
                      <span className="font-mono font-bold">{customAllocation.ukEts.toLocaleString()} tấn</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={totalAvailableSaf}
                      step={100}
                      value={customAllocation.ukEts}
                      onChange={(e) => setCustomAllocation({ ...customAllocation, ukEts: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {geoPolicies.corsia && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-emerald-700">CORSIA (Quốc tế):</span>
                      <span className="font-mono font-bold">{customAllocation.corsia.toLocaleString()} tấn</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={totalAvailableSaf}
                      step={100}
                      value={customAllocation.corsia}
                      onChange={(e) => setCustomAllocation({ ...customAllocation, corsia: Number(e.target.value) })}
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 1.3: CARBON PRICE FORECAST (DỰ BÁO GIÁ CARBON) */}
          <div className="space-y-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-amber-600" />
                Dự báo Giá Carbon (Carbon Price Forecast)
              </label>
              <span className="text-[10px] text-gray-400">Đơn vị: €/tCO₂</span>
            </div>

            {/* Slider EUA (EU ETS) */}
            <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Giá tín chỉ EUA (EU ETS):</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={priceEuEts}
                    onChange={(e) => setPriceEuEts(Number(e.target.value))}
                    className="w-16 h-6 px-1.5 text-right font-black text-vna-blue bg-white border border-gray-300 rounded text-xs"
                  />
                  <span className="font-bold text-xs text-gray-500">€</span>
                </div>
              </div>
              <input 
                type="range"
                min={50}
                max={130}
                step={0.5}
                value={priceEuEts}
                onChange={(e) => setPriceEuEts(Number(e.target.value))}
                className="w-full accent-vna-blue cursor-pointer h-1.5 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Min: 50€</span>
                <span className="text-amber-600 font-semibold">Dải tham chiếu 2024-2026: 65€ - 95€</span>
                <span>Max: 130€</span>
              </div>
            </div>

            {/* Slider UK ETS */}
            <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Giá hạn ngạch UKA (UK ETS):</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={priceUkEts}
                    onChange={(e) => setPriceUkEts(Number(e.target.value))}
                    className="w-16 h-6 px-1.5 text-right font-black text-indigo-700 bg-white border border-gray-300 rounded text-xs"
                  />
                  <span className="font-bold text-xs text-gray-500">€</span>
                </div>
              </div>
              <input 
                type="range"
                min={30}
                max={100}
                step={0.5}
                value={priceUkEts}
                onChange={(e) => setPriceUkEts(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Min: 30€</span>
                <span className="text-indigo-600 font-semibold">Dải tham chiếu: 45€ - 75€</span>
                <span>Max: 100€</span>
              </div>
            </div>

            {/* Slider CORSIA */}
            <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Giá tín chỉ CORSIA:</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="number"
                    value={priceCorsia}
                    onChange={(e) => setPriceCorsia(Number(e.target.value))}
                    className="w-16 h-6 px-1.5 text-right font-black text-emerald-700 bg-white border border-gray-300 rounded text-xs"
                  />
                  <span className="font-bold text-xs text-gray-500">€</span>
                </div>
              </div>
              <input 
                type="range"
                min={5}
                max={50}
                step={0.5}
                value={priceCorsia}
                onChange={(e) => setPriceCorsia(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>Min: 5€</span>
                <span className="text-emerald-700 font-semibold">Dải tham chiếu: 15€ - 30€</span>
                <span>Max: 50€</span>
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* ZONE 2: ALLOCATION VISUAL ZONE (TRỰC QUAN HÓA PHÂN BỔ - 7 COLS) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <GitCommit size={16} />
              </div>
              <div>
                <h2 className="text-sm font-black text-vna-navy uppercase tracking-wide">
                  2. Trực quan hóa Phân bổ Lô SAF (Allocation Flow)
                </h2>
                <p className="text-[11px] text-gray-500">
                  Dòng chảy phân bổ {effectiveAllocation.total.toLocaleString()} tấn SAF vào các giỏ chuyến bay & kết quả cấn trừ CO₂
                </p>
              </div>
            </div>

            {/* Visual Mode Tabs */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setActiveVisualTab('sankey')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeVisualTab === 'sankey' ? 'bg-white text-vna-blue shadow-xs' : 'text-gray-500'
                }`}
              >
                <GitCommit size={13} /> Sankey Flow
              </button>
              <button
                onClick={() => setActiveVisualTab('chart')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeVisualTab === 'chart' ? 'bg-white text-vna-blue shadow-xs' : 'text-gray-500'
                }`}
              >
                <BarChart2 size={13} /> Cột chồng
              </button>
              <button
                onClick={() => setActiveVisualTab('table')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                  activeVisualTab === 'table' ? 'bg-white text-vna-blue shadow-xs' : 'text-gray-500'
                }`}
              >
                <FileSpreadsheet size={13} /> Bảng chi tiết
              </button>
            </div>
          </div>

          {/* 2.1 INTERACTIVE SANKEY FLOW DIAGRAM */}
          {activeVisualTab === 'sankey' && (
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Sơ đồ Dòng chảy Năng lượng & Cấn trừ CO₂ (Sankey Flow Model)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Hiệu suất giảm: ~{avgCo2SavedPerTonne.toFixed(2)} tCO₂ / tấn SAF
                </span>
              </div>

              {/* Responsive SVG Canvas for Sankey */}
              <div className="w-full relative h-[360px]">
                <svg className="w-full h-full" viewBox="0 0 700 340" preserveAspectRatio="none">
                  <defs>
                    {/* Gradients for Flow Streams */}
                    <linearGradient id="flowEu" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#006885" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowUk" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowCorsia" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.8" />
                    </linearGradient>

                    {/* Output stream gradients */}
                    <linearGradient id="flowEuOut" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#006885" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowUkOut" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="flowCorsiaOut" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* STREAM PATHS: Source (X: 140) -> Middleware Geo-fences (X: 350) */}
                  {/* EU Stream */}
                  {effectiveAllocation.euEts > 0 && (
                    <path 
                      d="M 140 130 C 230 130, 260 65, 350 65 L 350 95 C 260 95, 230 155, 140 155 Z" 
                      fill="url(#flowEu)" 
                      className="hover:opacity-100 transition-all cursor-pointer"
                    />
                  )}

                  {/* UK Stream */}
                  {effectiveAllocation.ukEts > 0 && (
                    <path 
                      d="M 140 155 C 230 155, 260 160, 350 160 L 350 180 C 260 180, 230 175, 140 175 Z" 
                      fill="url(#flowUk)" 
                      className="hover:opacity-100 transition-all cursor-pointer"
                    />
                  )}

                  {/* CORSIA Stream */}
                  {effectiveAllocation.corsia > 0 && (
                    <path 
                      d="M 140 175 C 230 175, 260 255, 350 255 L 350 275 C 260 275, 230 195, 140 195 Z" 
                      fill="url(#flowCorsia)" 
                      className="hover:opacity-100 transition-all cursor-pointer"
                    />
                  )}

                  {/* STREAM PATHS: Middleware Geo-fences (X: 470) -> Output CO2 Offset Baskets (X: 570) */}
                  {/* EU Out */}
                  {effectiveAllocation.euEts > 0 && (
                    <path 
                      d="M 470 65 C 510 65, 530 65, 570 65 L 570 95 C 530 95, 510 95, 470 95 Z" 
                      fill="url(#flowEuOut)" 
                    />
                  )}
                  {/* UK Out */}
                  {effectiveAllocation.ukEts > 0 && (
                    <path 
                      d="M 470 160 C 510 160, 530 160, 570 160 L 570 180 C 530 180, 530 180, 470 180 Z" 
                      fill="url(#flowUkOut)" 
                    />
                  )}
                  {/* CORSIA Out */}
                  {effectiveAllocation.corsia > 0 && (
                    <path 
                      d="M 470 255 C 510 255, 530 255, 570 255 L 570 275 C 530 275, 530 275, 470 275 Z" 
                      fill="url(#flowCorsiaOut)" 
                    />
                  )}
                </svg>

                {/* NODE 1: SOURCE SAF (LEFT) */}
                <div className="absolute left-2 top-24 w-32 bg-emerald-950/80 backdrop-blur-md p-3 rounded-xl border border-emerald-500/50 shadow-lg text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-300 font-bold uppercase">
                    <Leaf size={13} />
                    Tổng Lô SAF
                  </div>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {effectiveAllocation.total.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-200/70">tấn khả dụng</div>
                </div>

                {/* MIDDLE NODES: GEO-FENCE BASKETS (CENTER) */}
                {/* 1. EU ETS Node */}
                <div className="absolute left-[330px] top-7 w-36 bg-sky-950/80 backdrop-blur-md p-2.5 rounded-xl border border-sky-500/50 shadow-lg text-center">
                  <div className="text-[10px] font-bold text-sky-300 uppercase flex items-center justify-center gap-1">
                    <Plane size={12} /> Chuyến bay EU
                  </div>
                  <div className="text-base font-black text-sky-400">
                    {effectiveAllocation.euEts.toLocaleString()} <span className="text-[10px] text-gray-400">tấn SAF</span>
                  </div>
                  <div className="text-[10px] text-sky-200/70">Ưu tiên 1 ({priceEuEts}€/t)</div>
                </div>

                {/* 2. UK ETS Node */}
                <div className="absolute left-[330px] top-32 w-36 bg-indigo-950/80 backdrop-blur-md p-2.5 rounded-xl border border-indigo-500/50 shadow-lg text-center">
                  <div className="text-[10px] font-bold text-indigo-300 uppercase flex items-center justify-center gap-1">
                    <Plane size={12} /> Chuyến bay UK
                  </div>
                  <div className="text-base font-black text-indigo-400">
                    {effectiveAllocation.ukEts.toLocaleString()} <span className="text-[10px] text-gray-400">tấn SAF</span>
                  </div>
                  <div className="text-[10px] text-indigo-200/70">Ưu tiên 2 ({priceUkEts}€/t)</div>
                </div>

                {/* 3. CORSIA Node */}
                <div className="absolute left-[330px] top-56 w-36 bg-teal-950/80 backdrop-blur-md p-2.5 rounded-xl border border-teal-500/50 shadow-lg text-center">
                  <div className="text-[10px] font-bold text-teal-300 uppercase flex items-center justify-center gap-1">
                    <Plane size={12} /> Chặng CORSIA
                  </div>
                  <div className="text-base font-black text-teal-400">
                    {effectiveAllocation.corsia.toLocaleString()} <span className="text-[10px] text-gray-400">tấn SAF</span>
                  </div>
                  <div className="text-[10px] text-teal-200/70">Ưu tiên 3 ({priceCorsia}€/t)</div>
                </div>

                {/* RIGHT NODES: CO2 REDUCTION RESULTS */}
                {/* EU CO2 */}
                <div className="absolute right-2 top-7 w-32 bg-slate-800/80 backdrop-blur-md p-2.5 rounded-xl border border-sky-400/30 text-center">
                  <div className="text-[10px] text-gray-400 font-bold">Giảm trừ EU ETS</div>
                  <div className="text-sm font-black text-sky-400">
                    -{emissionMetrics.co2SavedEu.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400">tCO₂ phát thải</div>
                </div>

                {/* UK CO2 */}
                <div className="absolute right-2 top-32 w-32 bg-slate-800/80 backdrop-blur-md p-2.5 rounded-xl border border-indigo-400/30 text-center">
                  <div className="text-[10px] text-gray-400 font-bold">Giảm trừ UK ETS</div>
                  <div className="text-sm font-black text-indigo-400">
                    -{emissionMetrics.co2SavedUk.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400">tCO₂ phát thải</div>
                </div>

                {/* CORSIA CO2 */}
                <div className="absolute right-2 top-56 w-32 bg-slate-800/80 backdrop-blur-md p-2.5 rounded-xl border border-teal-400/30 text-center">
                  <div className="text-[10px] text-gray-400 font-bold">Giảm trừ CORSIA</div>
                  <div className="text-sm font-black text-teal-400">
                    -{emissionMetrics.co2SavedCorsia.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-400">tCO₂ phát thải</div>
                </div>

              </div>

              <div className="mt-2 text-center text-[11px] text-slate-400 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
                💡 <strong>Nguyên lý tối ưu:</strong> Tự động rót dòng chảy lớn nhất vào giỏ có giá tín chỉ phạt đắt đỏ nhất nhằm giảm thiểu tối đa tổng chi phí mua tín chỉ carbon cho toàn hãng.
              </div>
            </div>
          )}

          {/* 2.2 STACKED BAR CHART */}
          {activeVisualTab === 'chart' && (
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="text-xs font-black text-gray-700 uppercase">
                Phân bổ Sản lượng SAF & Chi phí Tiết kiệm theo Cơ chế
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      {
                        name: 'EU ETS',
                        safTonnes: effectiveAllocation.euEts,
                        co2Saved: emissionMetrics.co2SavedEu,
                        creditSaved: Math.round(emissionMetrics.co2SavedEu * priceEuEts / 1000)
                      },
                      {
                        name: 'UK ETS',
                        safTonnes: effectiveAllocation.ukEts,
                        co2Saved: emissionMetrics.co2SavedUk,
                        creditSaved: Math.round(emissionMetrics.co2SavedUk * priceUkEts / 1000)
                      },
                      {
                        name: 'CORSIA',
                        safTonnes: effectiveAllocation.corsia,
                        co2Saved: emissionMetrics.co2SavedCorsia,
                        creditSaved: Math.round(emissionMetrics.co2SavedCorsia * priceCorsia / 1000)
                      }
                    ]} 
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} orientation="left" />
                    <YAxis yAxisId="right" tick={{ fontSize: 11 }} orientation="right" unit="k€" />
                    <Tooltip 
                      formatter={(val: any, name: string) => [
                        name === 'safTonnes' ? `${val.toLocaleString()} tấn` : name === 'co2Saved' ? `${val.toLocaleString()} tCO₂` : `${val.toLocaleString()}k €`,
                        name === 'safTonnes' ? 'SAF Nạp' : name === 'co2Saved' ? 'CO₂ Giảm trừ' : 'Tiết kiệm Tín chỉ'
                      ]}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="safTonnes" name="Sản lượng SAF (tấn)" fill="#006885" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="left" dataKey="co2Saved" name="CO₂ Giảm thiểu (tCO₂)" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="creditSaved" name="Giá trị Tín chỉ Tiết kiệm (k€)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 2.3 DETAILED ALLOCATION TABLE */}
          {activeVisualTab === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Cơ chế Geo-fence</th>
                    <th className="py-2.5 px-3 text-right">SAF Phân bổ</th>
                    <th className="py-2.5 px-3 text-right">CO₂ Giảm trừ</th>
                    <th className="py-2.5 px-3 text-right">Đơn giá Carbon</th>
                    <th className="py-2.5 px-3 text-right">Nợ CO₂ còn lại</th>
                    <th className="py-2.5 px-3 text-right">Chi phí Mua Tín chỉ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-blue-50/30">
                    <td className="py-3 px-3 font-bold text-vna-blue">
                      EU ETS (Châu Âu - ReFuelEU)
                    </td>
                    <td className="py-3 px-3 text-right font-black">{effectiveAllocation.euEts.toLocaleString()} tấn</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">-{emissionMetrics.co2SavedEu.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-mono">{priceEuEts} €/t</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-700">{emissionMetrics.remainEu.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">{(financialMetrics.creditCostEu / 1000).toFixed(0)}k €</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/30">
                    <td className="py-3 px-3 font-bold text-indigo-700">
                      UK ETS (Vương Quốc Anh)
                    </td>
                    <td className="py-3 px-3 text-right font-black">{effectiveAllocation.ukEts.toLocaleString()} tấn</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">-{emissionMetrics.co2SavedUk.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-mono">{priceUkEts} €/t</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-700">{emissionMetrics.remainUk.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">{(financialMetrics.creditCostUk / 1000).toFixed(0)}k €</td>
                  </tr>
                  <tr className="hover:bg-teal-50/30">
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      CORSIA (Quốc tế chung)
                    </td>
                    <td className="py-3 px-3 text-right font-black">{effectiveAllocation.corsia.toLocaleString()} tấn</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold">-{emissionMetrics.co2SavedCorsia.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-mono">{priceCorsia} €/t</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-700">{emissionMetrics.remainCorsia.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">{(financialMetrics.creditCostCorsia / 1000).toFixed(0)}k €</td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50 font-bold border-t border-gray-200 text-gray-900">
                  <tr>
                    <td className="py-3 px-3 font-black">TỔNG CỘNG</td>
                    <td className="py-3 px-3 text-right font-black text-vna-blue">{effectiveAllocation.total.toLocaleString()} tấn</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700">-{emissionMetrics.totalCo2Saved.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right text-gray-500">—</td>
                    <td className="py-3 px-3 text-right text-amber-700">{emissionMetrics.totalRemainToOffset.toLocaleString()} tCO₂</td>
                    <td className="py-3 px-3 text-right font-black text-vna-navy">{(financialMetrics.totalCreditCost / 1000).toFixed(0)}k €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. SCENARIO MANAGEMENT TABLE (DANH SÁCH & SO SÁNH KỊCH BẢN) */}
      {/* ============================================================ */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-vna-navy uppercase tracking-wide">
                3. Quản lý & So sánh Đa Kịch bản (Scenario Repository)
              </h2>
              <p className="text-[11px] text-gray-500">
                Tập hợp các kịch bản mô phỏng để Hội đồng quản trị & Ban Giám đốc tiện theo dõi, đánh giá và lựa chọn
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
          >
            <Split size={14} />
            Mở Bảng So sánh Đối chiếu
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Tên Kịch bản</th>
                <th className="py-3 px-3">Trạng thái</th>
                <th className="py-3 px-3 text-right">Lô SAF (tấn)</th>
                <th className="py-3 px-3 text-right">Phân bổ (EU / UK / CORSIA)</th>
                <th className="py-3 px-3 text-right">Tổng Chi phí</th>
                <th className="py-3 px-3 text-right">Net Savings</th>
                <th className="py-3 px-3 text-right">CO₂ Giảm (tCO₂)</th>
                <th className="py-3 px-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">{sc.name}</div>
                    <div className="text-[10px] text-gray-400">Tạo: {sc.createdAt} {sc.approver && `• Phê duyệt bởi: ${sc.approver}`}</div>
                  </td>
                  <td className="py-3 px-3">
                    {sc.status === 'Approved' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={11} /> Đã Phê duyệt
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 w-fit">
                        <Edit3 size={11} /> Bản Nháp
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-gray-800">
                    {sc.totalSafTonnes.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-600">
                    <span className="text-vna-blue font-bold">{sc.allocEu.toLocaleString()}</span> / <span className="text-indigo-600 font-bold">{sc.allocUk.toLocaleString()}</span> / <span className="text-emerald-600 font-bold">{sc.allocCorsia.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {(sc.totalCost / 1000000).toFixed(2)}M €
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-600">
                    +{(sc.netSavings / 1000).toFixed(0)}k €
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    {sc.co2Offset.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleLoadScenario(sc)}
                        className="p-1.5 rounded-lg bg-blue-50 text-vna-blue hover:bg-blue-100 transition-colors"
                        title="Tải kịch bản vào bộ mô phỏng"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                      {sc.status !== 'Approved' && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa kịch bản "${sc.name}"?`)) {
                              setScenarios(scenarios.filter(s => s.id !== sc.id));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Xóa kịch bản"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. MODAL: BÁO CÁO XÁC MINH VERIFIER (DECLARATION POPUP) */}
      {/* ============================================================ */}
      {isVerifierModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-vna-blue text-white flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-vna-navy">
                    Báo cáo Giải trình Kê khai SAF & Chống Trùng lặp (Verifier Declaration)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Văn bản pháp lý phục vụ đơn vị kiểm toán xác minh độc lập (Independent Verifier) chứng minh tuân thủ quy định EU ETS / CORSIA.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsVerifierModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Declaration Document Preview */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-800 leading-relaxed font-sans">
              
              {/* Document Header */}
              <div className="text-center space-y-1 border-b border-gray-200 pb-4">
                <h4 className="text-sm font-black uppercase text-vna-navy tracking-wide">
                  TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP (VIETNAM AIRLINES JSC)
                </h4>
                <p className="text-[11px] text-gray-600">Ban An toàn chất lượng & Đội Quản lý Phát thải ESG</p>
                <h3 className="text-base font-bold text-gray-900 pt-2">
                  TỜ KHAI PHÂN BỔ NHIÊN LIỆU HÀNG KHÔNG BỀN VỮNG (SAF DECLARATION OF COMPLIANCE)
                </h3>
                <p className="text-xs text-gray-500 font-semibold">Kỳ báo cáo: {reportPeriod}</p>
              </div>

              {/* Section 1: Non-double counting commitment */}
              <div className="space-y-2">
                <p className="font-bold text-gray-900">
                  1. Cam kết Chống Kê khai Trùng lặp (Non-Double Counting Declaration):
                </p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-200 leading-relaxed">
                  Vietnam Airlines cam kết toàn bộ <strong>{effectiveAllocation.total.toLocaleString()} tấn SAF</strong> nạp trong kỳ chỉ được khai báo duy nhất cho một trong các cơ chế (EU ETS, UK ETS hoặc CORSIA) theo đúng bảng phân bổ đính kèm dưới đây. Không có bất kỳ khối lượng nào bị tính trùng lặp vào hai hệ thống giảm phát thải khác nhau.
                </p>
              </div>

              {/* Section 2: Summary of Claims */}
              <div className="space-y-2">
                <p className="font-bold text-gray-900">
                  2. Tổng hợp Khối lượng Kê khai Cấn trừ theo từng Cơ chế:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                    <span className="text-gray-500 font-bold block text-[11px]">EU ETS Claim:</span>
                    <span className="text-sm font-black text-vna-blue">
                      {effectiveAllocation.euEts.toLocaleString()} tấn ({emissionMetrics.co2SavedEu.toLocaleString()} tCO₂)
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <span className="text-gray-500 font-bold block text-[11px]">UK ETS Claim:</span>
                    <span className="text-sm font-black text-indigo-700">
                      {effectiveAllocation.ukEts.toLocaleString()} tấn ({emissionMetrics.co2SavedUk.toLocaleString()} tCO₂)
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <span className="text-gray-500 font-bold block text-[11px]">CORSIA Claim:</span>
                    <span className="text-sm font-black text-emerald-700">
                      {effectiveAllocation.corsia.toLocaleString()} tấn ({emissionMetrics.co2SavedCorsia.toLocaleString()} tCO₂)
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Detailed batch list */}
              <div className="space-y-2">
                <p className="font-bold text-gray-900">
                  3. Danh mục Chi tiết Các Lô Nhiên liệu SAF (Proof of Sustainability - PoS):
                </p>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3">Mã Lô PoS</th>
                        <th className="py-2 px-3">Sân bay nạp</th>
                        <th className="py-2 px-3">Nhà cung cấp</th>
                        <th className="py-2 px-3">Mã VAT</th>
                        <th className="py-2 px-3 text-right">Khối lượng (tấn)</th>
                        <th className="py-2 px-3 text-right">Hệ số tCO₂/tấn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {safLedger.map((b) => (
                        <tr key={b.id}>
                          <td className="py-2 px-3 font-mono font-bold text-vna-navy">{b.batchNo}</td>
                          <td className="py-2 px-3">{b.airportCode} - {b.airportName}</td>
                          <td className="py-2 px-3">{b.supplier}</td>
                          <td className="py-2 px-3 font-mono text-gray-500">{b.supplierVat}</td>
                          <td className="py-2 px-3 text-right font-black">{b.availableTonnes.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-emerald-700 font-bold">{b.co2SavedPerTonne}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Signature section */}
              <div className="pt-6 border-t border-gray-200 flex justify-between text-xs text-gray-600">
                <div>
                  <p><strong>Người lập biểu:</strong></p>
                  <p className="mt-1 font-semibold text-gray-900">Ban Kế hoạch Phát triển - Tổ Quản lý ESG</p>
                  <div className="mt-6 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] inline-block font-mono">
                    ✓ Chữ ký điện tử đã xác thực
                  </div>
                </div>
                <div className="text-right">
                  <p><strong>Đại diện Thẩm quyền phê duyệt:</strong></p>
                  <p className="mt-1 font-semibold text-gray-900">{approverTitle}</p>
                  <div className="mt-6 px-3 py-1 bg-blue-50 text-vna-blue border border-blue-200 rounded-lg text-[10px] inline-block font-mono">
                    ✓ Xác thực chứng thư số Vietnam Airlines
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                Mã xác thực: VNA-VERIFIER-{Date.now().toString(36).toUpperCase()}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsVerifierModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    alert('Đang kết xuất và tải xuống hồ sơ Verifier Declaration chuẩn PDF/A kèm chữ ký số...');
                  }}
                  className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={14} /> Tải File PDF Báo Cáo
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. MODAL: SO SÁNH ĐA KỊCH BẢN (SCENARIO COMPARISON MATRIX) */}
      {/* ============================================================ */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Split size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-vna-navy">
                    Ma trận So sánh Đối chiếu Đa Kịch bản Net Zero
                  </h3>
                  <p className="text-xs text-gray-500">
                    So sánh các chỉ số tài chính, lượng tiết kiệm ròng và hiệu quả cấn trừ CO₂ giữa các kịch bản
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Comparison Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Tiêu chí So sánh</th>
                      {scenarios.map((sc, idx) => (
                        <th key={sc.id} className="py-3 px-4 text-center border-l border-gray-200">
                          <div className="font-black text-vna-navy text-xs">{sc.name}</div>
                          <span className={`inline-block mt-1 px-2 py-0.2 rounded-full text-[10px] font-bold ${
                            sc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sc.status === 'Approved' ? 'Đã duyệt' : 'Bản nháp'}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">Tổng Lượng SAF (tấn)</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-black border-l border-gray-100">
                          {sc.totalSafTonnes.toLocaleString()} tấn
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">Phân bổ EU ETS</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-bold text-vna-blue border-l border-gray-100">
                          {sc.allocEu.toLocaleString()} tấn ({((sc.allocEu / sc.totalSafTonnes)*100).toFixed(0)}%)
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">Phân bổ UK ETS</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-bold text-indigo-700 border-l border-gray-100">
                          {sc.allocUk.toLocaleString()} tấn ({((sc.allocUk / sc.totalSafTonnes)*100).toFixed(0)}%)
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">Phân bổ CORSIA</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-bold text-emerald-700 border-l border-gray-100">
                          {sc.allocCorsia.toLocaleString()} tấn ({((sc.allocCorsia / sc.totalSafTonnes)*100).toFixed(0)}%)
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-amber-50/30">
                      <td className="py-3 px-4 font-bold text-gray-900">Tổng Chi phí Tuân thủ</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-black text-gray-900 text-sm border-l border-gray-100">
                          {(sc.totalCost / 1000000).toFixed(2)}M €
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-emerald-50/40">
                      <td className="py-3 px-4 font-extrabold text-emerald-900">Net Savings (Tiết kiệm ròng)</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-black text-emerald-700 text-base border-l border-emerald-100">
                          +{(sc.netSavings / 1000).toFixed(0)}k €
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">CO₂ Giảm thiểu (tCO₂)</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center font-bold text-emerald-700 border-l border-gray-100">
                          {sc.co2Offset.toLocaleString()} tCO₂
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-gray-700 bg-gray-50/50">Chọn làm phương án áp dụng</td>
                      {scenarios.map(sc => (
                        <td key={sc.id} className="py-3 px-4 text-center border-l border-gray-100">
                          <Button
                            onClick={() => {
                              handleLoadScenario(sc);
                              setIsCompareModalOpen(false);
                            }}
                            className="bg-vna-blue hover:bg-[#00556e] text-white text-[11px] font-bold px-3 py-1 rounded-lg"
                          >
                            Tải Kịch bản này
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button
                onClick={() => setIsCompareModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Đóng
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. MODAL: SAVE SCENARIO */}
      {/* ============================================================ */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200 space-y-4">
            <button 
              onClick={() => setIsSaveModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-vna-blue text-white flex items-center justify-center">
                <Save size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-vna-navy">Lưu Kịch bản Mô phỏng Mới</h3>
                <p className="text-xs text-gray-500">Lưu vào danh mục kịch bản để theo dõi và so sánh</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên Kịch bản:</label>
                <Input
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder={`Kịch bản Tối ưu Net Zero - ${reportPeriod}`}
                  className="text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Tổng SAF phân bổ:</span>
                  <span className="font-bold text-gray-900">{effectiveAllocation.total.toLocaleString()} tấn</span>
                </div>
                <div className="flex justify-between">
                  <span>Tổng Chi phí ước tính:</span>
                  <span className="font-bold text-gray-900">{(financialMetrics.totalScenarioCost / 1000000).toFixed(2)}M €</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Tiết kiệm ròng (Net Savings):</span>
                  <span>+{(financialMetrics.netSavings / 1000).toFixed(0)}k €</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setIsSaveModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveScenario}
                className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} /> Lưu Kịch bản
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. MODAL: DOUBLE CONFIRMATION APPROVAL - STEP 1 */}
      {/* ============================================================ */}
      {isApproveStep1Open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border-2 border-amber-500 shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200 space-y-4">
            
            <div className="flex items-center gap-3 border-b border-amber-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-900">
                  Xác nhận Phê duyệt Kịch bản (Lớp 1/2)
                </h3>
                <p className="text-xs text-amber-700 font-medium">
                  Cảnh báo tác động cơ sở dữ liệu thực tế
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert size={16} /> Lưu ý quan trọng trước khi Phê duyệt:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Khi phê duyệt, kịch bản này sẽ chính thức trở thành <strong>Phương án Phân bổ Chính thức</strong> của kỳ <strong>{reportPeriod}</strong>. Hệ thống sẽ tự động <strong>TRỪ {effectiveAllocation.total.toLocaleString()} TẤN SAF TRONG KHO LEDGER</strong> thực tế và khóa quyền chỉnh sửa.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Tổng lượng SAF phân bổ chính thức:</span>
                  <span className="text-vna-blue">{effectiveAllocation.total.toLocaleString()} tấn</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>• Rót vào EU ETS:</span>
                  <span className="font-bold">{effectiveAllocation.euEts.toLocaleString()} tấn</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>• Rót vào UK ETS:</span>
                  <span className="font-bold">{effectiveAllocation.ukEts.toLocaleString()} tấn</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>• Rót vào CORSIA:</span>
                  <span className="font-bold">{effectiveAllocation.corsia.toLocaleString()} tấn</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setIsApproveStep1Open(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={() => {
                  setIsApproveStep1Open(false);
                  setIsApproveStep2Open(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                Tiếp tục đến Lớp Xác nhận 2 <ChevronRight size={14} />
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. MODAL: DOUBLE CONFIRMATION APPROVAL - STEP 2 */}
      {/* ============================================================ */}
      {isApproveStep2Open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200 space-y-4">
            
            <div className="flex items-center gap-3 border-emerald-100 border-b pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-900">
                  Xác nhận Thẩm quyền Phê duyệt (Lớp 2/2)
                </h3>
                <p className="text-xs text-emerald-700 font-medium">
                  Ký số điện tử và ghi nhận thay đổi vào Hệ thống
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Họ và Tên Người Phê duyệt:</label>
                <Input
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Chức danh / Thẩm quyền:</label>
                <Input
                  value={approverTitle}
                  onChange={(e) => setApproverTitle(e.target.value)}
                  className="text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ghi chú phê duyệt:</label>
                <Input
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>Hành động này sẽ được ghi vào <strong>System Audit Log</strong> và gửi thông báo tới các Ban liên quan.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={() => setIsApproveStep2Open(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleConfirmApproval}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2 rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <CheckCircle2 size={16} /> Hoàn tất Phê duyệt Kịch bản
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
