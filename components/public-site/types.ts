export enum ESGPillar {
  ENVIRONMENT = 'Môi trường',
  SOCIAL = 'Xã hội',
  GOVERNANCE = 'Quản trị'
}

export interface Report {
  id: string;
  year: number;
  title: string;
  thumbnailUrl: string;
  pdfUrl: string;
  type: 'Annual' | 'Sustainability' | 'Special';
  status: 'draft' | 'pending' | 'published';
}

export interface HighlightMetric {
  label: string;
  value: string;
  unit: string;
  trend?: number; // percentage growth/decline
  description: string;
}

export interface PillarContent {
  id: string;
  type: ESGPillar;
  title: string;
  description: string;
  image: string;
  metrics: HighlightMetric[];
  compliances?: string[]; // Danh sách các tiêu chuẩn tuân thủ (ví dụ: CORSIA, ETS...)
  color?: string;
}