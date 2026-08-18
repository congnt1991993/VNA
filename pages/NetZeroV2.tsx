import React, { useState, useMemo, useEffect } from 'react';
import { Button, Card, Input, Select, StatusChip } from '../components/UI';
import { 
  TrendingUp, Leaf, Plane, DollarSign, RefreshCw, Download, Plus, 
  Trash2, Edit3, Save, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, Layers, Sliders, BarChart3, HelpCircle, ArrowRight, X, Copy, Check,
  FileSpreadsheet, Award, Info, FileText, ArrowUpRight, Settings2, SlidersHorizontal,
  RotateCcw, TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

// --- INTERFACES ---

export interface SafBatch {
  id: string;
  batchNo: string;
  deliveryDate: string;
  airportCode: string;
  airportName: string;
  region: 'EU' | 'UK' | 'NON_EU';
  supplier: string;
  supplierVat: string;
  tonnes: number; // Khối lượng SAF nạp (tấn)
  lifecycleEmission: number; // gCO2eq/MJ
  co2SavedPerTonne: number; // tCO2 giảm trừ trên mỗi tấn SAF
  eligibleSchemes: ('EU_ETS' | 'UK_ETS' | 'CORSIA')[];
  assignedScheme: 'EU_ETS' | 'UK_ETS' | 'CORSIA' | 'UNASSIGNED';
}

export interface MarketParams {
  priceEuEts: number; // EUR / tCO2 (Hạn ngạch EUA)
  priceUkEts: number; // EUR / tCO2 (Hạn ngạch UKA quy đổi)
  priceCorsia: number; // EUR / tCO2 (Tín chỉ CORSIA quy đổi)
  obligationEuEts: number; // Nghĩa vụ nợ gốc phát thải EU ETS (tCO2)
  obligationUkEts: number; // Nghĩa vụ nợ gốc phát thải UK ETS (tCO2)
  obligationCorsia: number; // Nghĩa vụ nợ gốc phát thải CORSIA (tCO2)
}

// Initial Mock Batches
const INITIAL_BATCHES: SafBatch[] = [
  {
    id: 'b-1',
    batchNo: 'SAF-2026-EU-01',
    deliveryDate: '12/01/2026',
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    region: 'EU',
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 1250,
    lifecycleEmission: 16.2,
    co2SavedPerTonne: 2.62,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-2',
    batchNo: 'SAF-2026-EU-02',
    deliveryDate: '28/01/2026',
    airportCode: 'FRA',
    airportName: 'Frankfurt Airport (Đức)',
    region: 'EU',
    supplier: 'Neste Oil Netherlands B.V.',
    supplierVat: 'NL814125881B01',
    tonnes: 980,
    lifecycleEmission: 15.8,
    co2SavedPerTonne: 2.64,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  },
  {
    id: 'b-3',
    batchNo: 'SAF-2026-UK-01',
    deliveryDate: '15/02/2026',
    airportCode: 'LHR',
    airportName: 'London Heathrow (Anh)',
    region: 'UK',
    supplier: 'Shell Aviation UK',
    supplierVat: 'GB235763255',
    tonnes: 850,
    lifecycleEmission: 17.5,
    co2SavedPerTonne: 2.58,
    eligibleSchemes: ['UK_ETS', 'CORSIA'],
    assignedScheme: 'UK_ETS'
  },
  {
    id: 'b-4',
    batchNo: 'SAF-2026-ASIA-01',
    deliveryDate: '02/03/2026',
    airportCode: 'SIN',
    airportName: 'Singapore Changi (Singapore)',
    region: 'NON_EU',
    supplier: 'Neste Singapore Pte Ltd',
    supplierVat: 'SG200718921R',
    tonnes: 1500,
    lifecycleEmission: 18.0,
    co2SavedPerTonne: 2.55,
    eligibleSchemes: ['CORSIA'],
    assignedScheme: 'CORSIA'
  },
  {
    id: 'b-5',
    batchNo: 'SAF-2026-ASIA-02',
    deliveryDate: '18/03/2026',
    airportCode: 'NRT',
    airportName: 'Tokyo Narita (Nhật Bản)',
    region: 'NON_EU',
    supplier: 'Cosmo Oil Marketing Co.',
    supplierVat: 'JP9010001034458',
    tonnes: 1100,
    lifecycleEmission: 16.9,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['CORSIA'],
    assignedScheme: 'CORSIA'
  },
  {
    id: 'b-6',
    batchNo: 'SAF-2026-EU-03',
    deliveryDate: '25/03/2026',
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    region: 'EU',
    supplier: 'Air BP France',
    supplierVat: 'FR32542034988',
    tonnes: 720,
    lifecycleEmission: 17.1,
    co2SavedPerTonne: 2.59,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  }
];

const DEFAULT_MARKET_PARAMS: MarketParams = {
  priceEuEts: 76.5, // 76.5 EUR / tCO2
  priceUkEts: 58.0, // 58.0 EUR / tCO2
  priceCorsia: 22.5, // 22.5 EUR / tCO2 ($24.5 USD)
  obligationEuEts: 28500, // 28,500 tCO2 nợ gốc
  obligationUkEts: 9200,  // 9,200 tCO2 nợ gốc
  obligationCorsia: 48000 // 48,000 tCO2 nợ gốc
};

export const NetZeroV2Page: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>(
    () => (localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi'
  );

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang((localStorage.getItem('vna_esg_lang') as 'vi' | 'en') || 'vi');
    };
    window.addEventListener('vna_language_changed', handleLangChange);
    return () => window.removeEventListener('vna_language_changed', handleLangChange);
  }, []);

  // Main state
  const [reportPeriod, setReportPeriod] = useState<string>('Năm 2026 (Quý 1)');
  const [marketParams, setMarketParams] = useState<MarketParams>(() => {
    const saved = localStorage.getItem('vna_netzero_v2_market');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_MARKET_PARAMS;
  });

  const [batches, setBatches] = useState<SafBatch[]>(() => {
    const saved = localStorage.getItem('vna_netzero_v2_batches');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_BATCHES;
  });

  const [activeTab, setActiveTab] = useState<'allocation' | 'comparison' | 'verifier'>('allocation');
  const [saveToast, setSaveToast] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isAdjustParamsDrawerOpen, setIsAdjustParamsDrawerOpen] = useState(true);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState<Partial<SafBatch>>({
    batchNo: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle (Pháp)',
    region: 'EU',
    supplier: 'TotalEnergies Aviation',
    supplierVat: 'FR84542051580',
    tonnes: 500,
    lifecycleEmission: 16.5,
    co2SavedPerTonne: 2.60,
    eligibleSchemes: ['EU_ETS', 'CORSIA'],
    assignedScheme: 'EU_ETS'
  });

  // Calculate allocation metrics for a specific assignment state
  const calculateMetricsForBatches = (batchList: SafBatch[], params: MarketParams) => {
    let safEuTonnes = 0;
    let safUkTonnes = 0;
    let safCorsiaTonnes = 0;

    let co2EuSaved = 0;
    let co2UkSaved = 0;
    let co2CorsiaSaved = 0;

    batchList.forEach(b => {
      const co2 = Math.round(b.tonnes * b.co2SavedPerTonne);
      if (b.assignedScheme === 'EU_ETS') {
        safEuTonnes += b.tonnes;
        co2EuSaved += co2;
      } else if (b.assignedScheme === 'UK_ETS') {
        safUkTonnes += b.tonnes;
        co2UkSaved += co2;
      } else if (b.assignedScheme === 'CORSIA') {
        safCorsiaTonnes += b.tonnes;
        co2CorsiaSaved += co2;
      }
    });

    const residualEuCo2 = Math.max(0, params.obligationEuEts - co2EuSaved);
    const residualUkCo2 = Math.max(0, params.obligationUkEts - co2UkSaved);
    const residualCorsiaCo2 = Math.max(0, params.obligationCorsia - co2CorsiaSaved);

    const costEu = Math.round(residualEuCo2 * params.priceEuEts);
    const costUk = Math.round(residualUkCo2 * params.priceUkEts);
    const costCorsia = Math.round(residualCorsiaCo2 * params.priceCorsia);
    const totalCost = costEu + costUk + costCorsia;

    // Gross Cost without SAF
    const grossCost = Math.round(
      params.obligationEuEts * params.priceEuEts +
      params.obligationUkEts * params.priceUkEts +
      params.obligationCorsia * params.priceCorsia
    );

    const totalSavedVsGross = grossCost - totalCost;

    return {
      safEuTonnes,
      safUkTonnes,
      safCorsiaTonnes,
      co2EuSaved,
      co2UkSaved,
      co2CorsiaSaved,
      residualEuCo2,
      residualUkCo2,
      residualCorsiaCo2,
      costEu,
      costUk,
      costCorsia,
      totalCost,
      grossCost,
      totalSavedVsGross
    };
  };

  // Current user's allocation metrics
  const currentMetrics = useMemo(() => {
    return calculateMetricsForBatches(batches, marketParams);
  }, [batches, marketParams]);

  // Strategy 1: Prioritize EU ETS (EU batches -> EU ETS, UK -> UK ETS, others -> CORSIA)
  const strategyEuPriority = useMemo(() => {
    const assigned: SafBatch[] = batches.map(b => {
      if (b.eligibleSchemes.includes('EU_ETS')) {
        return { ...b, assignedScheme: 'EU_ETS' };
      } else if (b.eligibleSchemes.includes('UK_ETS')) {
        return { ...b, assignedScheme: 'UK_ETS' };
      }
      return { ...b, assignedScheme: 'CORSIA' };
    });
    return {
      name: 'Phương án 1: Tối đa hóa kê khai EU ETS',
      description: `Dồn toàn bộ lô SAF đủ điều kiện vào thị trường có đơn giá cao nhất (EU ETS: ${marketParams.priceEuEts} €/tCO2)`,
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Strategy 2: Prioritize CORSIA (All eligible -> CORSIA)
  const strategyCorsiaPriority = useMemo(() => {
    const assigned: SafBatch[] = batches.map(b => ({
      ...b,
      assignedScheme: 'CORSIA'
    }));
    return {
      name: 'Phương án 2: Tối đa hóa kê khai CORSIA',
      description: `Dồn toàn bộ các lô SAF vào cơ chế toàn cầu CORSIA (Đơn giá: ${marketParams.priceCorsia} €/tCO2)`,
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Strategy 3: Smart Greedy Optimizer (Prioritize highest price until obligation is zero, then next highest)
  const strategyOptimal = useMemo(() => {
    let remainingEuCap = marketParams.obligationEuEts;
    let remainingUkCap = marketParams.obligationUkEts;
    let remainingCorsiaCap = marketParams.obligationCorsia;

    const assigned: SafBatch[] = batches.map(b => {
      const co2 = Math.round(b.tonnes * b.co2SavedPerTonne);

      if (b.eligibleSchemes.includes('EU_ETS') && remainingEuCap > 0) {
        remainingEuCap -= co2;
        return { ...b, assignedScheme: 'EU_ETS' as const };
      }

      if (b.eligibleSchemes.includes('UK_ETS') && remainingUkCap > 0) {
        remainingUkCap -= co2;
        return { ...b, assignedScheme: 'UK_ETS' as const };
      }

      remainingCorsiaCap -= co2;
      return { ...b, assignedScheme: 'CORSIA' as const };
    });

    return {
      name: 'Phương án Tối ưu (Smart Linear Optimizer)',
      description: 'Thuật toán tự động phân bổ theo biên độ giá cao nhất cho đến khi hết nghĩa vụ nợ, giúp chi phí đền bù nhỏ nhất',
      batches: assigned,
      metrics: calculateMetricsForBatches(assigned, marketParams)
    };
  }, [batches, marketParams]);

  // Handler for changing batch assignment
  const handleAssignBatch = (batchId: string, scheme: SafBatch['assignedScheme']) => {
    const updated = batches.map(b => {
      if (b.id === batchId) {
        return { ...b, assignedScheme: scheme };
      }
      return b;
    });
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
  };

  // Handler for inline editing of batch tonnage
  const handleUpdateBatchTonnage = (batchId: string, newTonnes: number) => {
    const val = Math.max(0, newTonnes);
    const updated = batches.map(b => {
      if (b.id === batchId) {
        return { ...b, tonnes: val };
      }
      return b;
    });
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
  };

  // Handler for market param adjustments
  const handleUpdateMarketParam = (key: keyof MarketParams, val: number) => {
    const updated = { ...marketParams, [key]: val };
    setMarketParams(updated);
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(updated));
  };

  // Preset price scenarios
  const applyPricePreset = (type: 'DEFAULT' | 'HIGH' | 'LOW') => {
    let newP: MarketParams;
    if (type === 'HIGH') {
      newP = {
        ...marketParams,
        priceEuEts: 99.5,
        priceUkEts: 75.0,
        priceCorsia: 32.0
      };
    } else if (type === 'LOW') {
      newP = {
        ...marketParams,
        priceEuEts: 62.0,
        priceUkEts: 45.0,
        priceCorsia: 17.5
      };
    } else {
      newP = DEFAULT_MARKET_PARAMS;
    }
    setMarketParams(newP);
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(newP));
  };

  // Apply a specific strategy
  const handleApplyStrategy = (stratBatches: SafBatch[]) => {
    setBatches(stratBatches);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(stratBatches));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Save current setup
  const handleSaveCurrent = () => {
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(batches));
    localStorage.setItem('vna_netzero_v2_market', JSON.stringify(marketParams));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Add new batch
  const handleAddNewBatch = () => {
    if (!newBatch.batchNo || !newBatch.tonnes) {
      alert('Vui lòng nhập đầy đủ Mã lô và Khối lượng SAF.');
      return;
    }
    const created: SafBatch = {
      id: `b-${Date.now()}`,
      batchNo: newBatch.batchNo.trim(),
      deliveryDate: newBatch.deliveryDate || '2026-03-25',
      airportCode: newBatch.airportCode || 'CDG',
      airportName: newBatch.airportName || 'Paris CDG',
      region: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? 'EU' : (newBatch.airportCode === 'LHR' ? 'UK' : 'NON_EU'),
      supplier: newBatch.supplier || 'TotalEnergies',
      supplierVat: newBatch.supplierVat || 'FR84542051580',
      tonnes: Number(newBatch.tonnes),
      lifecycleEmission: Number(newBatch.lifecycleEmission) || 16.5,
      co2SavedPerTonne: Number(newBatch.co2SavedPerTonne) || 2.60,
      eligibleSchemes: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? ['EU_ETS', 'CORSIA'] : (newBatch.airportCode === 'LHR' ? ['UK_ETS', 'CORSIA'] : ['CORSIA']),
      assignedScheme: (newBatch.airportCode === 'CDG' || newBatch.airportCode === 'FRA') ? 'EU_ETS' : (newBatch.airportCode === 'LHR' ? 'UK_ETS' : 'CORSIA')
    };

    const updated = [...batches, created];
    setBatches(updated);
    localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
    setIsNewBatchModalOpen(false);
    setNewBatch({
      batchNo: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      airportCode: 'CDG',
      airportName: 'Paris Charles de Gaulle (Pháp)',
      region: 'EU',
      supplier: 'TotalEnergies Aviation',
      supplierVat: 'FR84542051580',
      tonnes: 500,
      lifecycleEmission: 16.5,
      co2SavedPerTonne: 2.60
    });
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lô SAF này khỏi danh sách mô phỏng?')) {
      const updated = batches.filter(b => b.id !== id);
      setBatches(updated);
      localStorage.setItem('vna_netzero_v2_batches', JSON.stringify(updated));
    }
  };

  // Comparison Chart Data
  const comparisonChartData = [
    {
      name: 'Chưa dùng SAF (Gross)',
      costEu: Math.round(marketParams.obligationEuEts * marketParams.priceEuEts / 1000),
      costUk: Math.round(marketParams.obligationUkEts * marketParams.priceUkEts / 1000),
      costCorsia: Math.round(marketParams.obligationCorsia * marketParams.priceCorsia / 1000),
      totalCost: Math.round((marketParams.obligationEuEts * marketParams.priceEuEts + marketParams.obligationUkEts * marketParams.priceUkEts + marketParams.obligationCorsia * marketParams.priceCorsia) / 1000)
    },
    {
      name: 'Kịch bản 2 (CORSIA)',
      costEu: Math.round(strategyCorsiaPriority.metrics.costEu / 1000),
      costUk: Math.round(strategyCorsiaPriority.metrics.costUk / 1000),
      costCorsia: Math.round(strategyCorsiaPriority.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyCorsiaPriority.metrics.totalCost / 1000)
    },
    {
      name: 'Kịch bản 1 (EU ETS)',
      costEu: Math.round(strategyEuPriority.metrics.costEu / 1000),
      costUk: Math.round(strategyEuPriority.metrics.costUk / 1000),
      costCorsia: Math.round(strategyEuPriority.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyEuPriority.metrics.totalCost / 1000)
    },
    {
      name: 'Phương án Tối ưu (Smart)',
      costEu: Math.round(strategyOptimal.metrics.costEu / 1000),
      costUk: Math.round(strategyOptimal.metrics.costUk / 1000),
      costCorsia: Math.round(strategyOptimal.metrics.costCorsia / 1000),
      totalCost: Math.round(strategyOptimal.metrics.totalCost / 1000)
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 font-sans">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Check size={18} className="font-bold" />
          <span className="text-sm font-bold">
            {currentLang === 'vi' ? 'Đã lưu cấu hình phân bổ SAF & kết quả mô phỏng!' : 'SAF claim configuration & simulation saved!'}
          </span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-vna-blue/10 text-vna-blue flex items-center justify-center font-black">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-vna-navy">
                  {currentLang === 'vi' 
                    ? 'Mô phỏng Kịch bản Net Zero 2: Tối ưu Phân bổ SAF & Đền bù Carbon' 
                    : 'Net Zero Scenario 2: SAF Claim & Carbon Offset Optimization'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  REAL-TIME SIMULATOR
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {currentLang === 'vi'
                  ? 'Tùy chỉnh linh hoạt đơn giá thị trường, sản lượng nạp SAF và nghĩa vụ phát thải để tự động mô phỏng chi phí tối ưu theo thời gian thực'
                  : 'Flexibly adjust market prices, SAF batch quantities, and emissions obligations to simulate optimal compliance costs in real-time'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Kỳ mô phỏng:</span>
            <select 
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 bg-white focus:ring-1 focus:ring-vna-blue/20 outline-none"
            >
              <option value="Năm 2026 (Quý 1)">Năm 2026 (Quý 1)</option>
              <option value="Năm 2026 (Cả năm)">Năm 2026 (Cả năm)</option>
              <option value="Năm 2025 (Chính thức)">Năm 2025 (Chính thức)</option>
            </select>
          </div>

          <Button 
            onClick={() => setIsAdjustParamsDrawerOpen(!isAdjustParamsDrawerOpen)}
            variant="outline"
            className={`text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 ${
              isAdjustParamsDrawerOpen ? 'bg-blue-50 text-vna-blue border-vna-blue' : 'text-gray-700 border-gray-300'
            }`}
          >
            <SlidersHorizontal size={15} />
            {isAdjustParamsDrawerOpen ? 'Ẩn bộ chỉnh chỉ số' : 'Điều chỉnh chỉ số đầu vào'}
          </Button>

          <Button 
            onClick={() => handleApplyStrategy(strategyOptimal.batches)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={15} /> {currentLang === 'vi' ? 'Tự động Tối ưu (Smart Optimizer)' : 'Smart Optimize'}
          </Button>

          <Button 
            onClick={handleSaveCurrent}
            variant="outline"
            className="border-vna-blue text-vna-blue hover:bg-blue-50 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Save size={15} /> {currentLang === 'vi' ? 'Lưu kịch bản' : 'Save'}
          </Button>
        </div>
      </div>

      {/* REAL-TIME INTERACTIVE INPUT ADJUSTMENT PANEL */}
      {isAdjustParamsDrawerOpen && (
        <div className="bg-white rounded-2xl border-2 border-vna-blue/30 p-5 shadow-sm space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-vna-blue" />
              <div>
                <h3 className="text-sm font-black text-vna-navy">
                  Bảng Điều khiển Chỉ số Đầu vào Thời gian thực (Real-time Input Adjuster)
                </h3>
                <p className="text-[11px] text-gray-400">Thay đổi các tham số dưới đây sẽ tự động cập nhật lại toàn bộ ma trận tính toán và biểu đồ ngay lập tức</p>
              </div>
            </div>

            {/* Quick Price Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gray-400">Kịch bản giá nhanh:</span>
              <button 
                onClick={() => applyPricePreset('HIGH')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 flex items-center gap-1 cursor-pointer"
              >
                <TrendingUp size={12} /> Giá cao (+30%)
              </button>
              <button 
                onClick={() => applyPricePreset('LOW')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-vna-blue hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <TrendingDown size={12} /> Giá thấp (-20%)
              </button>
              <button 
                onClick={() => applyPricePreset('DEFAULT')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} /> Mặc định
              </button>
            </div>
          </div>

          {/* Interactive Sliders & Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
            
            {/* 1. EU ETS Group */}
            <div className="space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-vna-blue flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-vna-blue"></span> EU ETS (Châu Âu)
                </span>
                <span className="text-xs font-black text-vna-blue">{marketParams.priceEuEts} € / tCO₂</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Đơn giá hạn ngạch EUA:</span>
                  <span className="font-bold text-gray-900">{marketParams.priceEuEts} €</span>
                </div>
                <input 
                  type="range" min="40" max="150" step="0.5"
                  value={marketParams.priceEuEts}
                  onChange={(e) => handleUpdateMarketParam('priceEuEts', parseFloat(e.target.value))}
                  className="w-full accent-vna-blue cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Nghĩa vụ phát thải nợ gốc (tCO₂):</span>
                  <span className="font-bold text-gray-900">{marketParams.obligationEuEts.toLocaleString()} tCO₂</span>
                </div>
                <input 
                  type="number"
                  step="500"
                  value={marketParams.obligationEuEts}
                  onChange={(e) => handleUpdateMarketParam('obligationEuEts', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* 2. UK ETS Group */}
            <div className="space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> UK ETS (Vương quốc Anh)
                </span>
                <span className="text-xs font-black text-indigo-700">{marketParams.priceUkEts} € / tCO₂</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Đơn giá hạn ngạch UKA:</span>
                  <span className="font-bold text-gray-900">{marketParams.priceUkEts} €</span>
                </div>
                <input 
                  type="range" min="20" max="120" step="0.5"
                  value={marketParams.priceUkEts}
                  onChange={(e) => handleUpdateMarketParam('priceUkEts', parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Nghĩa vụ phát thải nợ gốc (tCO₂):</span>
                  <span className="font-bold text-gray-900">{marketParams.obligationUkEts.toLocaleString()} tCO₂</span>
                </div>
                <input 
                  type="number"
                  step="500"
                  value={marketParams.obligationUkEts}
                  onChange={(e) => handleUpdateMarketParam('obligationUkEts', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* 3. CORSIA Group */}
            <div className="space-y-3 bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span> CORSIA (Toàn cầu)
                </span>
                <span className="text-xs font-black text-emerald-700">{marketParams.priceCorsia} € / tCO₂</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Đơn giá tín chỉ CORSIA (CEU):</span>
                  <span className="font-bold text-gray-900">{marketParams.priceCorsia} €</span>
                </div>
                <input 
                  type="range" min="10" max="80" step="0.5"
                  value={marketParams.priceCorsia}
                  onChange={(e) => handleUpdateMarketParam('priceCorsia', parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-gray-600 mb-1 font-semibold">
                  <span>Nghĩa vụ phát thải nợ gốc (tCO₂):</span>
                  <span className="font-bold text-gray-900">{marketParams.obligationCorsia.toLocaleString()} tCO₂</span>
                </div>
                <input 
                  type="number"
                  step="1000"
                  value={marketParams.obligationCorsia}
                  onChange={(e) => handleUpdateMarketParam('obligationCorsia', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 bg-white"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RECOMMENDATION BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#00556e] to-[#004b61] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-gray-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              Khuyến nghị của Hệ thống
            </span>
            <span className="text-xs text-white/75 font-semibold">Tự động tính toán theo các chỉ số đầu vào</span>
          </div>
          <h3 className="text-base font-bold text-white">
            {currentLang === 'vi'
              ? `Áp dụng Phương án Tối ưu giúp tiết kiệm ${(strategyOptimal.metrics.totalSavedVsGross - strategyCorsiaPriority.metrics.totalSavedVsGross).toLocaleString()} € so với kê khai thông thường!`
              : `Applying Smart Optimization saves ${(strategyOptimal.metrics.totalSavedVsGross - strategyCorsiaPriority.metrics.totalSavedVsGross).toLocaleString()} € compared to standard allocation!`}
          </h3>
          <p className="text-xs text-white/80 leading-relaxed max-w-3xl">
            Dựa trên đơn giá thị trường đang thiết lập (EU ETS: {marketParams.priceEuEts} € &gt; UK ETS: {marketParams.priceUkEts} € &gt; CORSIA: {marketParams.priceCorsia} €), hệ thống tự động giải thuật phân bổ tối ưu từng lô SAF để giảm thiểu chi phí bù trừ.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] text-white/70 block uppercase font-bold">Tổng chi phí sau tối ưu</span>
            <span className="text-lg font-black text-amber-300">
              {strategyOptimal.metrics.totalCost.toLocaleString()} €
            </span>
          </div>
          <Button 
            onClick={() => handleApplyStrategy(strategyOptimal.batches)}
            className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black text-xs px-4 py-3 rounded-xl shadow-md cursor-pointer"
          >
            Áp dụng phương án này
          </Button>
        </div>
      </div>

      {/* MARKET STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* EU ETS Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-vna-blue flex items-center justify-center font-bold text-xs">
                EU
              </div>
              <div>
                <h4 className="text-sm font-black text-vna-navy">EU ETS (Châu Âu)</h4>
                <span className="text-[10px] text-gray-400">Hạn ngạch phát thải EUA</span>
              </div>
            </div>
            <span className="text-xs font-black text-vna-blue bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
              {marketParams.priceEuEts} € / tCO₂
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold">Nghĩa vụ nợ gốc</span>
              <span className="font-extrabold text-gray-900">{marketParams.obligationEuEts.toLocaleString()} tCO₂</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block font-bold">SAF giảm trừ</span>
              <span className="font-extrabold text-emerald-600">-{currentMetrics.co2EuSaved.toLocaleString()} tCO₂</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Phải mua đền bù còn lại:</span>
            <span className="font-black text-vna-blue">{currentMetrics.residualEuCo2.toLocaleString()} tCO₂ ({currentMetrics.costEu.toLocaleString()} €)</span>
          </div>
        </div>

        {/* UK ETS Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                UK
              </div>
              <div>
                <h4 className="text-sm font-black text-vna-navy">UK ETS (Vương quốc Anh)</h4>
                <span className="text-[10px] text-gray-400">Hạn ngạch phát thải UKA</span>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
              {marketParams.priceUkEts} € / tCO₂
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold">Nghĩa vụ nợ gốc</span>
              <span className="font-extrabold text-gray-900">{marketParams.obligationUkEts.toLocaleString()} tCO₂</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block font-bold">SAF giảm trừ</span>
              <span className="font-extrabold text-emerald-600">-{currentMetrics.co2UkSaved.toLocaleString()} tCO₂</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Phải mua đền bù còn lại:</span>
            <span className="font-black text-indigo-600">{currentMetrics.residualUkCo2.toLocaleString()} tCO₂ ({currentMetrics.costUk.toLocaleString()} €)</span>
          </div>
        </div>

        {/* CORSIA Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                ICAO
              </div>
              <div>
                <h4 className="text-sm font-black text-vna-navy">CORSIA (Toàn cầu)</h4>
                <span className="text-[10px] text-gray-400">Tín chỉ quốc tế CEU Units</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              {marketParams.priceCorsia} € / tCO₂
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block font-bold">Nghĩa vụ nợ gốc</span>
              <span className="font-extrabold text-gray-900">{marketParams.obligationCorsia.toLocaleString()} tCO₂</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 block font-bold">SAF giảm trừ</span>
              <span className="font-extrabold text-emerald-600">-{currentMetrics.co2CorsiaSaved.toLocaleString()} tCO₂</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500 font-semibold">Phải mua đền bù còn lại:</span>
            <span className="font-black text-emerald-700">{currentMetrics.residualCorsiaCo2.toLocaleString()} tCO₂ ({currentMetrics.costCorsia.toLocaleString()} €)</span>
          </div>
        </div>

      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200 gap-6 text-sm font-bold text-gray-500">
        <button
          onClick={() => setActiveTab('allocation')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'allocation' 
              ? 'border-b-2 border-vna-blue text-vna-blue' 
              : 'hover:text-gray-800'
          }`}
        >
          <Layers size={16} />
          {currentLang === 'vi' ? 'Ma trận Phân bổ Lô SAF (SAF Claim Matrix)' : 'SAF Claim Matrix'}
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'comparison' 
              ? 'border-b-2 border-vna-blue text-vna-blue' 
              : 'hover:text-gray-800'
          }`}
        >
          <BarChart3 size={16} />
          {currentLang === 'vi' ? 'So sánh Kịch bản & Chi phí Tiết kiệm' : 'Scenario & Cost Comparison'}
        </button>

        <button
          onClick={() => setActiveTab('verifier')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'verifier' 
              ? 'border-b-2 border-vna-blue text-vna-blue' 
              : 'hover:text-gray-800'
          }`}
        >
          <FileText size={16} />
          {currentLang === 'vi' ? 'Báo cáo Xác minh Verifier (Declaration)' : 'Verifier Declaration Report'}
        </button>
      </div>

      {/* TAB 1: SAF CLAIM MATRIX & BATCHES WITH INLINE EDITING */}
      {activeTab === 'allocation' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-vna-navy uppercase tracking-wide">
                  Danh sách Lô Nhiên liệu SAF & Lựa chọn Cơ chế Kê khai (Claim)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  💡 Bạn có thể <strong>sửa trực tiếp số tấn SAF</strong> trên từng dòng để xem sự thay đổi chi phí ngay lập tức.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsNewBatchModalOpen(true)}
                  className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={14} /> Thêm lô SAF
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                    <th className="py-3.5 px-4">Mã lô & Ngày nạp</th>
                    <th className="py-3.5 px-4">Sân bay xuất phát</th>
                    <th className="py-3.5 px-4">Nhà cung cấp & VAT</th>
                    <th className="py-3.5 px-4 text-center">Khối lượng SAF (Tấn) ✍️</th>
                    <th className="py-3.5 px-4 text-right">CO₂ Giảm trừ</th>
                    <th className="py-3.5 px-4">Cơ chế hợp lệ</th>
                    <th className="py-3.5 px-4 text-center">Cơ chế Phân bổ (Gán Claim)</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batches.map(batch => {
                    const co2Saved = Math.round(batch.tonnes * batch.co2SavedPerTonne);
                    
                    return (
                      <tr key={batch.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">{batch.batchNo}</div>
                          <div className="text-[10px] text-gray-400">{batch.deliveryDate}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                            <span className="font-black text-vna-blue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              {batch.airportCode}
                            </span>
                            <span className="truncate max-w-[150px]">{batch.airportName}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Khu vực: {batch.region}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-800">{batch.supplier}</div>
                          <div className="text-[10px] text-gray-400 font-mono">VAT: {batch.supplierVat}</div>
                        </td>

                        {/* Inline Editable SAF Tonnes */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <input 
                              type="number"
                              step="50"
                              value={batch.tonnes}
                              onChange={(e) => handleUpdateBatchTonnage(batch.id, parseFloat(e.target.value) || 0)}
                              className="w-24 text-right font-black text-gray-900 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-vna-blue bg-white"
                            />
                            <span className="text-[11px] text-gray-500 font-bold">tấn</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-black text-emerald-600">-{co2Saved.toLocaleString()} tCO₂</div>
                          <div className="text-[10px] text-gray-400">({batch.co2SavedPerTonne} t/tấn)</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {batch.eligibleSchemes.map(s => (
                              <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                {s.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Assignment Selector */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 shadow-2xs">
                            {batch.eligibleSchemes.includes('EU_ETS') && (
                              <button
                                onClick={() => handleAssignBatch(batch.id, 'EU_ETS')}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                  batch.assignedScheme === 'EU_ETS' 
                                    ? 'bg-vna-blue text-white shadow-xs' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                EU ETS
                              </button>
                            )}

                            {batch.eligibleSchemes.includes('UK_ETS') && (
                              <button
                                onClick={() => handleAssignBatch(batch.id, 'UK_ETS')}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                  batch.assignedScheme === 'UK_ETS' 
                                    ? 'bg-indigo-600 text-white shadow-xs' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                UK ETS
                              </button>
                            )}

                            {batch.eligibleSchemes.includes('CORSIA') && (
                              <button
                                onClick={() => handleAssignBatch(batch.id, 'CORSIA')}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                  batch.assignedScheme === 'CORSIA' 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                CORSIA
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button 
                            onClick={() => handleDeleteBatch(batch.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Xóa lô này"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matrix Summary Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
              <div className="flex items-center gap-6 font-bold text-gray-700 flex-wrap">
                <span>Tổng SAF: <strong className="text-gray-900">{batches.reduce((a,b)=>a+b.tonnes,0).toLocaleString()} tấn</strong></span>
                <span>Claim cho EU: <strong className="text-vna-blue">{currentMetrics.safEuTonnes.toLocaleString()} tấn</strong></span>
                <span>Claim cho UK: <strong className="text-indigo-600">{currentMetrics.safUkTonnes.toLocaleString()} tấn</strong></span>
                <span>Claim cho CORSIA: <strong className="text-emerald-600">{currentMetrics.safCorsiaTonnes.toLocaleString()} tấn</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-semibold">Tổng chi phí mua đền bù còn lại:</span>
                <span className="text-base font-black text-vna-blue">
                  {currentMetrics.totalCost.toLocaleString()} €
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: SCENARIO & COST COMPARISON */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          
          {/* 3 Strategy Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Strategy 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-vna-blue border border-blue-200 uppercase">
                    Phương án 1
                  </span>
                  <span className="text-xs font-bold text-gray-400">Ưu tiên EU ETS</span>
                </div>
                <h4 className="text-sm font-bold text-vna-navy">{strategyEuPriority.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{strategyEuPriority.description}</p>
                
                <div className="mt-4 space-y-2 text-xs pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí EU ETS:</span>
                    <span className="font-bold text-gray-800">{strategyEuPriority.metrics.costEu.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí CORSIA:</span>
                    <span className="font-bold text-gray-800">{strategyEuPriority.metrics.costCorsia.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí UK ETS:</span>
                    <span className="font-bold text-gray-800">{strategyEuPriority.metrics.costUk.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs font-bold text-gray-700">Tổng chi phí:</span>
                  <span className="text-lg font-black text-vna-navy">{strategyEuPriority.metrics.totalCost.toLocaleString()} €</span>
                </div>
                <Button 
                  onClick={() => handleApplyStrategy(strategyEuPriority.batches)}
                  variant="outline"
                  className="w-full text-xs font-bold text-vna-blue border-vna-blue/40 hover:bg-blue-50 py-1.5"
                >
                  Áp dụng phương án này
                </Button>
              </div>
            </div>

            {/* Strategy 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Phương án 2
                  </span>
                  <span className="text-xs font-bold text-gray-400">Ưu tiên CORSIA</span>
                </div>
                <h4 className="text-sm font-bold text-vna-navy">{strategyCorsiaPriority.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{strategyCorsiaPriority.description}</p>
                
                <div className="mt-4 space-y-2 text-xs pt-3 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí EU ETS:</span>
                    <span className="font-bold text-gray-800">{strategyCorsiaPriority.metrics.costEu.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí CORSIA:</span>
                    <span className="font-bold text-gray-800">{strategyCorsiaPriority.metrics.costCorsia.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí UK ETS:</span>
                    <span className="font-bold text-gray-800">{strategyCorsiaPriority.metrics.costUk.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs font-bold text-gray-700">Tổng chi phí:</span>
                  <span className="text-lg font-black text-rose-600">{strategyCorsiaPriority.metrics.totalCost.toLocaleString()} €</span>
                </div>
                <Button 
                  onClick={() => handleApplyStrategy(strategyCorsiaPriority.batches)}
                  variant="outline"
                  className="w-full text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-50 py-1.5"
                >
                  Áp dụng phương án này
                </Button>
              </div>
            </div>

            {/* Strategy 3 (Optimal) */}
            <div className="bg-white rounded-2xl border-2 border-emerald-600 p-5 shadow-md flex flex-col justify-between relative ring-2 ring-emerald-500/20 bg-emerald-50/10">
              <div className="absolute -top-3 right-4 bg-emerald-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                TIẾT KIỆM NHẤT ⭐
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white uppercase">
                    Phương án Tối ưu
                  </span>
                  <span className="text-xs font-bold text-emerald-700">AI Optimizer</span>
                </div>
                <h4 className="text-sm font-bold text-emerald-950">{strategyOptimal.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{strategyOptimal.description}</p>
                
                <div className="mt-4 space-y-2 text-xs pt-3 border-t border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí EU ETS:</span>
                    <span className="font-bold text-gray-800">{strategyOptimal.metrics.costEu.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí CORSIA:</span>
                    <span className="font-bold text-gray-800">{strategyOptimal.metrics.costCorsia.toLocaleString()} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chi phí UK ETS:</span>
                    <span className="font-bold text-gray-800">{strategyOptimal.metrics.costUk.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs font-bold text-emerald-900">Tổng chi phí:</span>
                  <span className="text-xl font-black text-emerald-700">{strategyOptimal.metrics.totalCost.toLocaleString()} €</span>
                </div>
                <Button 
                  onClick={() => handleApplyStrategy(strategyOptimal.batches)}
                  className="w-full text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white py-2 shadow-xs cursor-pointer"
                >
                  <Check size={14} className="mr-1" /> Áp dụng Phương án Tối ưu
                </Button>
              </div>
            </div>

          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-sm font-black text-vna-navy">
                Biểu đồ So sánh Tổng Chi phí Mua Hạn ngạch Đền bù Carbon (Nghìn EUR)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Đối chiếu chi phí mua hạn ngạch theo từng phương án phân bổ SAF</p>
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `${val}k €`} />
                  <Tooltip 
                    formatter={(val: any, name: string) => [`${val.toLocaleString()}k €`, name]}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="costEu" name="EU ETS" stackId="a" fill="#006885" />
                  <Bar dataKey="costUk" name="UK ETS" stackId="a" fill="#4f46e5" />
                  <Bar dataKey="costCorsia" name="CORSIA" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: VERIFIER DECLARATION REPORT */}
      {activeTab === 'verifier' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-base font-black text-vna-navy">
                Báo cáo Giải trình Kê khai SAF & Chống Trùng lặp (Verifier Declaration)
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Văn bản pháp lý phục vụ đơn vị kiểm toán xác minh độc lập (Independent Verifier) chứng minh tuân thủ quy định EU ETS / CORSIA.
              </p>
            </div>
            <Button 
              onClick={() => alert('Đang xuất hồ sơ giải trình Verifier (PDF/A đính kèm chữ ký số)...')}
              className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Download size={15} /> Xuất Báo cáo Verifier (PDF)
            </Button>
          </div>

          {/* Declaration Preview Box */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 text-xs text-gray-800 font-serif leading-relaxed">
            <div className="text-center space-y-1 border-b border-gray-200 pb-4">
              <h4 className="text-sm font-black uppercase text-vna-navy font-sans tracking-wide">
                TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM (VIETNAM AIRLINES JSC)
              </h4>
              <p className="text-[11px] text-gray-600 font-sans">Ban An toàn chất lượng & Đội Quản lý Phát thải ESG</p>
              <h3 className="text-base font-bold text-gray-900 pt-2 font-sans">
                TỜ KHAI PHÂN BỔ NHIÊN LIỆU HÀNG KHÔNG BỀN VỮNG (SAF DECLARATION OF COMPLIANCE)
              </h3>
              <p className="text-xs text-gray-500 font-sans">Kỳ báo cáo: {reportPeriod}</p>
            </div>

            <div className="space-y-2 font-sans text-xs">
              <p><strong>1. Cam kết Chống Kê khai Trùng lặp (Non-Double Counting Declaration):</strong></p>
              <p className="text-gray-600 pl-4">
                Vietnam Airlines cam kết toàn bộ <strong>{batches.reduce((a,b)=>a+b.tonnes,0).toLocaleString()} tấn SAF</strong> nạp trong kỳ chỉ được khai báo duy nhất cho một trong các cơ chế (EU ETS, UK ETS hoặc CORSIA) theo đúng bảng phân bổ đính kèm, không có bất kỳ khối lượng nào bị trùng lặp.
              </p>
            </div>

            <div className="space-y-2 font-sans text-xs pt-2">
              <p><strong>2. Tổng hợp Khối lượng Kê khai theo từng Cơ chế:</strong></p>
              <div className="grid grid-cols-3 gap-4 pl-4">
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-500 font-bold block">EU ETS Claim:</span>
                  <span className="text-sm font-black text-vna-blue">{currentMetrics.safEuTonnes.toLocaleString()} tấn ({currentMetrics.co2EuSaved.toLocaleString()} tCO₂)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-500 font-bold block">UK ETS Claim:</span>
                  <span className="text-sm font-black text-indigo-600">{currentMetrics.safUkTonnes.toLocaleString()} tấn ({currentMetrics.co2UkSaved.toLocaleString()} tCO₂)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <span className="text-gray-500 font-bold block">CORSIA Claim:</span>
                  <span className="text-sm font-black text-emerald-600">{currentMetrics.safCorsiaTonnes.toLocaleString()} tấn ({currentMetrics.co2CorsiaSaved.toLocaleString()} tCO₂)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-between font-sans text-xs text-gray-600">
              <div>
                <p><strong>Người lập biểu:</strong></p>
                <p className="mt-8 font-bold text-gray-900">Ban Kế hoạch Phát triển - Tổ Quản lý ESG</p>
              </div>
              <div className="text-right">
                <p><strong>Đại diện Thẩm quyền phê duyệt:</strong></p>
                <p className="mt-8 font-bold text-gray-900">Phó Tổng Giám đốc phụ trách Kỹ thuật & Khai thác</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW BATCH MODAL */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsNewBatchModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-black text-vna-navy border-b border-gray-100 pb-3 mb-4">
              Thêm Lô Nhiên liệu SAF Mới vào Kỳ Mô phỏng
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mã Lô (Batch Number):</label>
                  <Input 
                    value={newBatch.batchNo}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value })}
                    placeholder="VD: SAF-2026-EU-04"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ngày nạp (Delivery Date):</label>
                  <Input 
                    type="date"
                    value={newBatch.deliveryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, deliveryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Sân bay nạp:</label>
                  <select 
                    value={newBatch.airportCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      let name = 'Paris CDG (Pháp)';
                      if (code === 'FRA') name = 'Frankfurt (Đức)';
                      if (code === 'LHR') name = 'London Heathrow (Anh)';
                      if (code === 'SIN') name = 'Singapore Changi';
                      if (code === 'NRT') name = 'Tokyo Narita';
                      setNewBatch({ ...newBatch, airportCode: code, airportName: name });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    <option value="CDG">CDG - Paris (EU)</option>
                    <option value="FRA">FRA - Frankfurt (EU)</option>
                    <option value="LHR">LHR - London (UK)</option>
                    <option value="SIN">SIN - Singapore (Asia)</option>
                    <option value="NRT">NRT - Tokyo (Asia)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Khối lượng SAF (tấn):</label>
                  <Input 
                    type="number"
                    value={newBatch.tonnes}
                    onChange={(e) => setNewBatch({ ...newBatch, tonnes: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nhà cung cấp:</label>
                  <Input 
                    value={newBatch.supplier}
                    onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                    placeholder="VD: TotalEnergies"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số VAT Nhà cung cấp:</label>
                  <Input 
                    value={newBatch.supplierVat}
                    onChange={(e) => setNewBatch({ ...newBatch, supplierVat: e.target.value })}
                    placeholder="VD: FR84542051580"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phát thải vòng đời (gCO2eq/MJ):</label>
                  <Input 
                    type="number"
                    value={newBatch.lifecycleEmission}
                    onChange={(e) => setNewBatch({ ...newBatch, lifecycleEmission: parseFloat(e.target.value) || 16.5 })}
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">CO₂ giảm trừ / tấn SAF:</label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={newBatch.co2SavedPerTonne}
                    onChange={(e) => setNewBatch({ ...newBatch, co2SavedPerTonne: parseFloat(e.target.value) || 2.60 })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsNewBatchModalOpen(false)} className="text-xs">Hủy</Button>
              <Button onClick={handleAddNewBatch} className="bg-vna-blue hover:bg-[#00556e] text-white text-xs font-bold px-4">
                Thêm vào ma trận
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
