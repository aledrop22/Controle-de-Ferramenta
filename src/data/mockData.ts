import { Operator, ToolItem, ToolWithdrawal } from '../types';

export const INITIAL_OPERATORS: Operator[] = [
  // Usinagem
  {
    id: 'op-1',
    firstName: 'Alex',
    lastName: 'Cardoso',
    name: 'Alex Cardoso',
    sector: 'Usinagem',
    machine: 'GL 01',
    badge: 'USIN-001',
    email: 'alex.cardoso@empresa.com.br',
    phone: '(11) 98765-4321',
    notes: 'Operador de Usinagem - GL 01',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-2',
    firstName: 'Leandro',
    lastName: '',
    name: 'Leandro',
    sector: 'Usinagem',
    machine: 'GL 02',
    badge: 'USIN-002',
    email: 'leandro.silva@empresa.com.br',
    phone: '(11) 98765-4322',
    notes: 'Operador de Usinagem - GL 02',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-5c',
    firstName: 'Jadson',
    lastName: 'Oliveira',
    name: 'Jadson Oliveira',
    sector: 'Usinagem',
    machine: 'CNC 30',
    badge: 'USIN-040',
    email: 'jadson.oliveira@empresa.com.br',
    phone: '(11) 98765-4327',
    notes: 'Operador de Usinagem - CNC 30',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-3',
    firstName: 'Pedro',
    lastName: 'Henrique',
    name: 'Pedro Henrique',
    sector: 'Usinagem',
    machine: 'CNC 35',
    badge: 'USIN-018',
    email: 'pedro.henrique@empresa.com.br',
    phone: '(11) 98765-4323',
    notes: 'Operador de Usinagem - CNC 35',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-4',
    firstName: 'Rodrigo',
    lastName: '',
    name: 'Rodrigo',
    sector: 'Usinagem',
    machine: 'FRESA 01',
    badge: 'USIN-029',
    email: 'rodrigo@empresa.com.br',
    phone: '(11) 98765-4324',
    notes: 'Operador de Usinagem - FRESA 01',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-7',
    firstName: 'Vinicius',
    lastName: 'Lopes',
    name: 'Vinicius Lopes',
    sector: 'Usinagem',
    machine: 'FRESA 02',
    badge: 'USIN-045',
    email: 'vinicius.lopes@empresa.com.br',
    phone: '(11) 98765-4329',
    notes: 'Operador de Usinagem - FRESA 02',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-5',
    firstName: 'Márcio',
    lastName: '',
    name: 'Márcio',
    sector: 'Usinagem',
    machine: 'TORNO 01',
    badge: 'USIN-035',
    email: 'marcio@empresa.com.br',
    phone: '(11) 98765-4325',
    notes: 'Operador de Usinagem - TORNO 01',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-5b',
    firstName: 'Gabriel',
    lastName: '',
    name: 'Gabriel',
    sector: 'Usinagem',
    machine: 'TORNO 02',
    badge: 'USIN-038',
    email: 'gabriel@empresa.com.br',
    phone: '(11) 98765-4326',
    notes: 'Operador de Usinagem - TORNO 02',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-6',
    firstName: 'Lucas',
    lastName: 'Alves',
    name: 'Lucas Alves',
    sector: 'Usinagem',
    machine: 'TORNO 03',
    badge: 'USIN-042',
    email: 'lucas.alves@empresa.com.br',
    phone: '(11) 98765-4328',
    notes: 'Operador de Usinagem - TORNO 03',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  },

  // Produção
  {
    id: 'op-11',
    firstName: 'Luis',
    lastName: '',
    name: 'Sr. Luis',
    sector: 'Produção',
    machine: 'Produção',
    badge: 'PROD-001',
    email: 'luis.silva@empresa.com.br',
    phone: '(11) 98765-4330',
    notes: 'Produção',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-11b',
    firstName: 'Luis',
    lastName: 'Laerte',
    name: 'Luis Laerte',
    sector: 'Produção',
    machine: 'Produção',
    badge: 'PROD-005',
    email: 'luis.laerte@empresa.com.br',
    phone: '(11) 98765-4331',
    notes: 'Produção',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-11c',
    firstName: 'Pablo',
    lastName: '',
    name: 'Pablo',
    sector: 'Produção',
    machine: 'Produção',
    badge: 'PROD-008',
    email: 'pablo@empresa.com.br',
    phone: '(11) 98765-4332',
    notes: 'Produção',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-12',
    firstName: 'Felipe',
    lastName: 'Galves',
    name: 'Felipe Galves',
    sector: 'Produção',
    machine: 'Produção',
    badge: 'PROD-012',
    email: 'felipe.galves@empresa.com.br',
    phone: '(11) 98765-4333',
    notes: 'Produção',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },

  // Manutenção
  {
    id: 'op-13b',
    firstName: 'Marcos',
    lastName: '',
    name: 'Marcos',
    sector: 'Manutenção',
    machine: 'Manutenção',
    badge: 'MANT-003',
    email: 'marcos.manutencao@empresa.com.br',
    phone: '(11) 98765-4335',
    notes: 'Manutenção',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-13c',
    firstName: 'Renato',
    lastName: '',
    name: 'Renato',
    sector: 'Manutenção',
    machine: 'Manutenção',
    badge: 'MANT-005',
    email: 'renato@empresa.com.br',
    phone: '(11) 98765-4336',
    notes: 'Manutenção',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-13',
    firstName: 'Nilson',
    lastName: '',
    name: 'Nilson',
    sector: 'Manutenção',
    machine: 'Manutenção',
    badge: 'MANT-001',
    email: 'nilson@empresa.com.br',
    phone: '(11) 98765-4334',
    notes: 'Manutenção',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },

  // Estoque
  {
    id: 'op-15b',
    firstName: 'Lucas',
    lastName: '',
    name: 'Lucas',
    sector: 'Estoque',
    machine: 'Estoque',
    badge: 'EST-002',
    email: 'lucas.estoque@empresa.com.br',
    phone: '(11) 98765-4338',
    notes: 'Estoque',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-15c',
    firstName: 'Rafael',
    lastName: '',
    name: 'Rafael',
    sector: 'Estoque',
    machine: 'Estoque',
    badge: 'EST-003',
    email: 'rafael@empresa.com.br',
    phone: '(11) 98765-4339',
    notes: 'Estoque',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-15',
    firstName: 'Victor',
    lastName: 'Soares',
    name: 'Victor Soares',
    sector: 'Estoque',
    machine: 'Estoque',
    badge: 'EST-004',
    email: 'victor.soares@empresa.com.br',
    phone: '(11) 98765-4340',
    notes: 'Estoque',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-15a',
    firstName: 'Elias',
    lastName: '',
    name: 'Elias',
    sector: 'Estoque',
    machine: 'Estoque',
    badge: 'EST-001',
    email: 'elias@empresa.com.br',
    phone: '(11) 98765-4337',
    notes: 'Estoque',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },

  // Expedição
  {
    id: 'op-16a',
    firstName: 'Deise',
    lastName: '',
    name: 'Deise',
    sector: 'Expedição',
    machine: 'Expedição',
    badge: 'EXP-001',
    email: 'deise@empresa.com.br',
    phone: '(11) 98765-4341',
    notes: 'Expedição',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-16f',
    firstName: 'Karina',
    lastName: 'de Souza',
    name: 'Karina de Souza',
    sector: 'Expedição',
    machine: 'Expedição',
    badge: 'EXP-006',
    email: 'karina.souza@empresa.com.br',
    phone: '(11) 98765-4346',
    notes: 'Expedição',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-16d',
    firstName: 'Adriano',
    lastName: '',
    name: 'Adriano',
    sector: 'Expedição',
    machine: 'Expedição',
    badge: 'EXP-004',
    email: 'adriano@empresa.com.br',
    phone: '(11) 98765-4344',
    notes: 'Expedição',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-16e',
    firstName: 'Ismael',
    lastName: '',
    name: 'Ismael',
    sector: 'Expedição',
    machine: 'Expedição',
    badge: 'EXP-005',
    email: 'ismael@empresa.com.br',
    phone: '(11) 98765-4345',
    notes: 'Expedição',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-16b',
    firstName: 'Frank',
    lastName: '',
    name: 'Frank',
    sector: 'Expedição',
    machine: 'Expedição',
    badge: 'EXP-002',
    email: 'frank@empresa.com.br',
    phone: '(11) 98765-4342',
    notes: 'Expedição',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },

  // PCP
  {
    id: 'op-14d',
    firstName: 'Igor',
    lastName: '',
    name: 'Igor',
    sector: 'PCP',
    machine: 'PCP',
    badge: 'PCP-004',
    email: 'igor@empresa.com.br',
    phone: '(11) 98765-4350',
    notes: 'PCP',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-14a',
    firstName: 'Jose',
    lastName: '',
    name: 'Jose',
    sector: 'PCP',
    machine: 'PCP',
    badge: 'PCP-001',
    email: 'jose@empresa.com.br',
    phone: '(11) 98765-4347',
    notes: 'PCP',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-14b',
    firstName: 'Marcos',
    lastName: '',
    name: 'Marcos',
    sector: 'PCP',
    machine: 'PCP',
    badge: 'PCP-002',
    email: 'marcos.pcp@empresa.com.br',
    phone: '(11) 98765-4348',
    notes: 'PCP',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-14e',
    firstName: 'Janaína',
    lastName: '',
    name: 'Janaína',
    sector: 'PCP',
    machine: 'PCP',
    badge: 'PCP-005',
    email: 'janaina@empresa.com.br',
    phone: '(11) 98765-4354',
    notes: 'PCP',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-14c',
    firstName: 'Pedro',
    lastName: 'Andreassi',
    name: 'Pedro Andreassi',
    sector: 'PCP',
    machine: 'PCP',
    badge: 'PCP-003',
    email: 'pedro.andreassi@empresa.com.br',
    phone: '(11) 98765-4349',
    notes: 'PCP',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },

  // Qualidade
  {
    id: 'op-9',
    firstName: 'Pedro',
    lastName: 'Lima',
    name: 'Pedro Lima',
    sector: 'Qualidade',
    machine: 'Qualidade',
    badge: 'QUAL-002',
    email: 'pedro.lima@empresa.com.br',
    phone: '(11) 98765-4351',
    notes: 'Qualidade',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-10',
    firstName: 'Lilian',
    lastName: '',
    name: 'Lilian',
    sector: 'Qualidade',
    machine: 'Qualidade',
    badge: 'QUAL-003',
    email: 'lilian@empresa.com.br',
    phone: '(11) 98765-4353',
    notes: 'Qualidade',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'op-8',
    firstName: 'Alexandre',
    lastName: '',
    name: 'Alexandre',
    sector: 'Qualidade',
    machine: 'Qualidade',
    badge: 'QUAL-001',
    email: 'alexandre@empresa.com.br',
    phone: '(11) 98765-4352',
    notes: 'Qualidade',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
  }
];

// Complete inventory categorised as requested by the user
export const ESTOQUE_CATEGORIES: Record<string, string[]> = {
  'Porca Calibradora': [
    '5/8" x 18UNF', '3/4" x 10 UNC', 'M8 x 1,25', 'M10 x 1,0', 'M10 x 1,5',
    'M12 x 1,0', 'M12 x 1,25', 'M12 x 1,5', 'M12 x 1,75', 'M14 x 1,5', 'M14 x 2',
    'M15 x 1,0', 'M16 x 1,5', 'M17 x 1,0', 'M18 x 1,5', 'M18 x 2,5', 'M20 x 1,0',
    'M20 x 1,5', 'M24 x 1,5', 'M24 x 3,0', 'M25 x 1,0', 'M25 x 1,5', 'M26 x 1,5',
    'M28 x 1,5', 'M28 x 2', 'M30 x 1,5', 'M32 x 1,5', 'M35 x 1,5', 'M38 x 1,5',
    'M40 x 1,5', 'M42 x 2,0', 'M45 x 1,5', 'M50 x 1,5', 'M55 x 1,5', 'M55 x 2,0',
    'M60 x 1,5', 'M60 x 2,0', 'M65 x 2', 'M66 x 2,0', 'M85 x 2,0'
  ],
  'Micrômetro': [
    'Micrômetro Externo', '0 - 25mm', '25 - 50mm', '50 - 75mm', '75 - 100mm', '100 - 125mm',
    '125 - 150mm', '150 - 175mm', '175 - 200mm', '200 - 225mm',
    '225 - 250mm', '250 - 275mm', '275 - 300mm', '0 - 1"', '1 - 2"'
  ],
  'Súbito': ['6 - 10mm', '10 - 18mm', '18 - 35mm', '35 - 50mm', '50 - 160mm'],
  'Relógio Comparador': ['Relógio 1 (0.01mm)', 'Relógio 2 Centesimal', 'Relógio 3 Digital'],
  'Paquímetro': ['Paquímetro Digital 01', 'Paquímetro 300 mm'],
  'Ferramentas Diversas': [
    'Martelo Antirretorno 500g', 'Alicate de Pressão', 'Alicate Universal',
    'Chave de Fenda Kit', 'Chave Allen Jogo', 'Torquímetro Digital 10-100Nm'
  ]
};

// Flattened INITIAL_TOOLS for quick lookups or initial state
export const INITIAL_TOOLS: ToolItem[] = Object.entries(ESTOQUE_CATEGORIES).flatMap(
  ([category, items], catIdx) =>
    items.map((spec, itemIdx) => ({
      id: `tool-${catIdx + 1}-${itemIdx + 1}`,
      name: category,
      spec,
      category,
      code: `${category.slice(0, 3).toUpperCase()}-${itemIdx + 1}`
    }))
);

export const INITIAL_SECTORS = [
  'Usinagem',
  'Produção',
  'Manutenção',
  'Estoque',
  'Expedição',
  'PCP',
  'Qualidade'
];

export const USINAGEM_MACHINES = [
  'CNC 30',
  'CNC 35',
  'GL 01',
  'GL 02',
  'FRESA 01',
  'FRESA 02',
  'TORNO 01',
  'TORNO 02',
  'TORNO 03'
];

export const INITIAL_WITHDRAWALS: ToolWithdrawal[] = [
  // Active Withdrawals
  {
    id: 'w-active-1',
    toolId: 'tool-1-34',
    toolName: 'Porca Calibradora',
    spec: 'M55 x 1,5',
    operatorId: 'op-8',
    operatorName: 'Alexandre',
    sector: 'Qualidade',
    machine: 'Qualidade',
    dateRetirada: '2026-08-05T03:42:00',
    status: 'active'
  },
  {
    id: 'w-active-2',
    toolId: 'tool-1-33',
    toolName: 'Porca Calibradora',
    spec: 'M50 x 1,5',
    operatorId: 'op-8',
    operatorName: 'Alexandre',
    sector: 'Qualidade',
    machine: 'Qualidade',
    dateRetirada: '2026-08-05T03:42:00',
    status: 'active'
  },
  {
    id: 'w-active-3',
    toolId: 'tool-5-1',
    toolName: 'Paquímetro Digital',
    spec: 'Modelo Digital 0-150mm',
    operatorId: 'op-6',
    operatorName: 'Lucas Alves',
    sector: 'Usinagem',
    machine: 'TORNO 03',
    dateRetirada: '2026-08-05T04:15:00',
    status: 'active'
  },
  {
    id: 'w-active-4',
    toolId: 'tool-1-8',
    toolName: 'Porca Calibradora',
    spec: 'M12 x 1,5',
    operatorId: 'op-1',
    operatorName: 'Alex Cardoso',
    sector: 'Usinagem',
    machine: 'GL 01',
    dateRetirada: '2026-08-05T05:28:00',
    status: 'active'
  },
  {
    id: 'w-active-5',
    toolId: 'tool-1-1',
    toolName: 'Porca Calibradora',
    spec: '5/8" x 18UNF',
    operatorId: 'op-1',
    operatorName: 'Alex Cardoso',
    sector: 'Usinagem',
    machine: 'GL 01',
    dateRetirada: '2026-08-05T05:28:00',
    status: 'active'
  },

  // Completed / Returned Withdrawals (History)
  {
    id: 'w-hist-1',
    toolId: 'tool-5-1',
    toolName: 'Paquímetro Digital',
    spec: 'Modelo Digital 0-150mm',
    operatorId: 'op-3',
    operatorName: 'Pedro Henrique',
    sector: 'Usinagem',
    machine: 'CNC 02',
    dateRetirada: '2026-08-04T14:32:00',
    dateDevolucao: '2026-08-04T16:10:00',
    status: 'returned'
  },
  {
    id: 'w-hist-2',
    toolId: 'tool-6-1',
    toolName: 'Ferramentas Diversas',
    spec: 'Martelo Antirretorno 500g',
    operatorId: 'op-6',
    operatorName: 'Lucas Alves',
    sector: 'Usinagem',
    machine: 'TORNO 03',
    dateRetirada: '2026-08-04T13:48:00',
    dateDevolucao: '2026-08-04T15:20:00',
    status: 'returned'
  },
  {
    id: 'w-hist-3',
    toolId: 'tool-1-19',
    toolName: 'Porca Calibradora',
    spec: 'M24 x 1,5',
    operatorId: 'op-4',
    operatorName: 'Rodrigo',
    sector: 'Usinagem',
    machine: 'FRESA 01',
    dateRetirada: '2026-08-04T13:14:00',
    dateDevolucao: '2026-08-04T13:40:00',
    status: 'returned'
  },
  {
    id: 'w-hist-4',
    toolId: 'tool-2-4',
    toolName: 'Micrômetro',
    spec: '50 - 75mm',
    operatorId: 'op-3',
    operatorName: 'Pedro Henrique',
    sector: 'Usinagem',
    machine: 'CNC 02',
    dateRetirada: '2026-08-04T13:33:00',
    dateDevolucao: '2026-08-04T14:05:00',
    status: 'returned'
  },
  {
    id: 'w-hist-5',
    toolId: 'tool-2-5',
    toolName: 'Micrômetro',
    spec: '75 - 100mm',
    operatorId: 'op-6',
    operatorName: 'Lucas Alves',
    sector: 'Usinagem',
    machine: 'TORNO 01',
    dateRetirada: '2026-08-04T13:31:00',
    dateDevolucao: '2026-08-04T14:12:00',
    status: 'returned'
  },
  {
    id: 'w-hist-6',
    toolId: 'tool-1-19',
    toolName: 'Porca Calibradora',
    spec: 'M24 x 1,5',
    operatorId: 'op-2',
    operatorName: 'Leandro',
    sector: 'Usinagem',
    machine: 'GL 01',
    dateRetirada: '2026-08-04T13:12:00',
    dateDevolucao: '2026-08-04T13:17:00',
    status: 'returned'
  },
  {
    id: 'w-hist-7',
    toolId: 'tool-1-26',
    toolName: 'Porca Calibradora',
    spec: 'M30 x 1,5',
    operatorId: 'op-7',
    operatorName: 'Vinicius Lopes',
    sector: 'Usinagem',
    machine: 'FRESA 02',
    dateRetirada: '2026-08-04T13:16:00',
    dateDevolucao: '2026-08-04T14:30:00',
    status: 'returned'
  }
];
