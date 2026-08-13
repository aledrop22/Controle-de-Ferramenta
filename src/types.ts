export type ToolStatus = 'active' | 'returned' | 'overdue';

export type AppViewMode = 'qualidade' | 'chao-de-fabrica';

export interface ToolItem {
  id: string;
  name: string; // Instrumento e.g. Paquímetro Digital
  spec: string; // Especificação e.g. M55 x 1,5, 50-75mm
  category: string; // e.g. Medição, Fixação, Corte
  code: string; // Asset/Tool Code e.g. FER-0892
}

export interface Operator {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  sector: string; // Setor/Hangar e.g. Usinagem, Qualidade, Manutenção
  machine: string; // Máquina e.g. CNC 02, TORNO 03
  badge: string;
  email?: string;
  phone?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface ToolWithdrawal {
  id: string;
  toolId: string;
  toolName: string;
  spec: string;
  operatorId: string;
  operatorName: string;
  sector: string;
  machine: string;
  dateRetirada: string; // ISO format or formatted string
  dateDevolucao?: string; // ISO format or formatted string
  expectedReturn?: string;
  status: ToolStatus;
  notes?: string;
  // Transfer tracking
  transferredFrom?: string; // e.g. "Alex Cardoso (CNC 35)"
  transferredAt?: string;
  // Overtime tracking
  isOvertime?: boolean;
  overtimeUntil?: string; // e.g. "19:00"
}

export interface FilterOptions {
  period: string; // '7days' | '30days' | 'month' | 'all'
  operator: string;
  tool: string;
  sector: string;
  search: string;
}

export type ButtonStyleVariant = 'modern-slate' | 'vibrant-emerald' | 'cyber-dark' | 'industrial-blue';
