import React, { useState, useEffect } from 'react';
import {
  Operator,
  ToolItem,
  ToolWithdrawal,
  FilterOptions,
  ButtonStyleVariant,
  AppViewMode
} from './types';
import {
  INITIAL_OPERATORS,
  INITIAL_TOOLS,
  INITIAL_SECTORS
} from './data/mockData';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { ActiveToolsList } from './components/ActiveToolsList';
import { HistoryTable } from './components/HistoryTable';
import { HeatmapChart } from './components/HeatmapChart';
import { NewWithdrawalModal } from './components/NewWithdrawalModal';
import { CollaboratorsModal } from './components/CollaboratorsModal';
import { ChaoDeFabricaView } from './components/ChaoDeFabricaView';
import { TransferModal } from './components/TransferModal';
import { PinLockModal } from './components/PinLockModal';
import { ShieldCheck, Layers } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';
import { loadDatabase, saveOperators, saveTools, saveWithdrawals } from './services/database';

export default function App() {
  // Check if opened via Tablet URL (?acesso=chao)
  const [isChaoDeFabricaUrl] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const acesso = params.get('acesso');
      return acesso === 'chao' || acesso === 'chaodefabrica' || window.location.hash.includes('chao');
    }
    return false;
  });

  // App View Mode: 'qualidade' (Full Admin) or 'chao-de-fabrica' (Tablet / Shop Floor)
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const acesso = params.get('acesso');
      if (acesso === 'chao' || acesso === 'chaodefabrica' || window.location.hash.includes('chao')) {
        return 'chao-de-fabrica';
      }
    }
    return 'qualidade';
  });

  // Security PIN modal state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Keep URL query parameter in sync when switching view modes
  const handleViewModeChange = (mode: AppViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (mode === 'chao-de-fabrica') {
        url.searchParams.set('acesso', 'chao');
      } else {
        url.searchParams.set('acesso', 'qualidade');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  // Persistence state for withdrawals (v4)
  const [withdrawals, setWithdrawals] = useState<ToolWithdrawal[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('painel_ferramentas_withdrawals_v4');
    if (saved) {
      try {
        const storedWithdrawals = JSON.parse(saved) as ToolWithdrawal[];
        return storedWithdrawals.filter((item) => !item.id.startsWith('w-active-') && !item.id.startsWith('w-hist-'));
      } catch (e) {
        console.error('Erro ao ler do localStorage', e);
      }
    }
    return [];
  });

  // Operators state with persistence (v4)
  const [operators, setOperators] = useState<Operator[]>(() => {
    const saved = localStorage.getItem('painel_ferramentas_operators_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler operadores', e);
      }
    }
    return INITIAL_OPERATORS;
  });

  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [sectors] = useState<string[]>(INITIAL_SECTORS);

  const [isDatabaseReady, setIsDatabaseReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    loadDatabase()
      .then((data) => {
        if (data) {
          if (data.operators.length > 0) setOperators(data.operators);
          setWithdrawals(data.withdrawals);
          if (data.tools.length > 0) setTools(data.tools);
        }
      })
      .catch((error) => console.error('Erro ao carregar dados do Supabase', error))
      .finally(() => setIsDatabaseReady(true));
  }, []);


  // Standard Button Visual Style Theme
  const buttonStyle: ButtonStyleVariant = 'modern-slate';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [historyFilters, setHistoryFilters] = useState<FilterOptions>({
    period: 'month',
    operator: 'Todos',
    tool: 'Todas',
    sector: 'Todos',
    search: ''
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCollaboratorsModalOpen, setIsCollaboratorsModalOpen] = useState<boolean>(false);

  // Transfer Modal State
  const [transferItem, setTransferItem] = useState<ToolWithdrawal | null>(null);

  // Sync searchQuery into history filters
  useEffect(() => {
    setHistoryFilters((prev) => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  // Keep local fallback and Supabase synchronized.
  useEffect(() => {
    localStorage.setItem('painel_ferramentas_withdrawals_v4', JSON.stringify(withdrawals));
    if (isDatabaseReady && isSupabaseConfigured) {
      saveWithdrawals(withdrawals).catch((error) => console.error('Erro ao salvar movimentações', error));
    }
  }, [withdrawals, isDatabaseReady]);

  useEffect(() => {
    localStorage.setItem('painel_ferramentas_operators_v4', JSON.stringify(operators));
    if (isDatabaseReady && isSupabaseConfigured) {
      saveOperators(operators).catch((error) => console.error('Erro ao salvar operadores', error));
    }
  }, [operators, isDatabaseReady]);

  useEffect(() => {
    if (isDatabaseReady && isSupabaseConfigured) {
      saveTools(tools).catch((error) => console.error('Erro ao salvar ferramentas', error));
    }
  }, [tools, isDatabaseReady]);

  const handleAddOperator = (newOp: Operator) => {
    setOperators((prev) => [newOp, ...prev]);
  };

  // Keyboard shortcut listener ('N' for new withdrawal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (viewMode === 'qualidade') {
          e.preventDefault();
          setIsModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // Return single tool
  const handleReturnTool = (id: string) => {
    const nowISO = new Date().toISOString();
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            status: 'returned',
            dateDevolucao: nowISO
          }
          : item
      )
    );
  };

  // Return all tools for an operator
  const handleReturnAllForOperator = (operatorId: string) => {
    const nowISO = new Date().toISOString();
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.operatorId === operatorId && item.status === 'active'
          ? {
            ...item,
            status: 'returned',
            dateDevolucao: nowISO
          }
          : item
      )
    );
  };

  // Create new withdrawal (supports batch tool withdrawals)
  const handleCreateWithdrawal = (
    items: Array<{
      toolId: string;
      operatorId: string;
      operatorName: string;
      sector: string;
      machine: string;
      toolName: string;
      spec: string;
      notes?: string;
    }>
  ) => {
    const nowISO = new Date().toISOString();
    const newRecords: ToolWithdrawal[] = items.map((data, index) => ({
      id: `w-custom-${Date.now()}-${index}`,
      toolId: data.toolId,
      toolName: data.toolName,
      spec: data.spec,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      sector: data.sector,
      machine: data.machine,
      dateRetirada: nowISO,
      status: 'active',
      notes: data.notes
    }));

    setWithdrawals((prev) => [...newRecords, ...prev]);
  };

  // Confirm Tool Transfer on Factory Floor
  const handleConfirmTransfer = (
    withdrawalId: string,
    newOperatorId: string,
    newOperatorName: string,
    newSector: string,
    newMachine: string,
    transferNotes?: string
  ) => {
    const nowISO = new Date().toISOString();
    setWithdrawals((prev) =>
      prev.map((item) => {
        if (item.id === withdrawalId) {
          const prevOwner = `${item.operatorName} (${item.machine})`;
          const updatedNote = transferNotes
            ? `${item.notes || ''} | Transferência: ${transferNotes}`.trim()
            : item.notes;

          return {
            ...item,
            operatorId: newOperatorId,
            operatorName: newOperatorName,
            sector: newSector,
            machine: newMachine,
            transferredFrom: prevOwner,
            transferredAt: nowISO,
            notes: updatedNote
          };
        }
        return item;
      })
    );
  };

  // Extend Overtime for Tool
  const handleExtendOvertime = (withdrawalId: string) => {
    setWithdrawals((prev) =>
      prev.map((item) =>
        item.id === withdrawalId
          ? {
            ...item,
            isOvertime: true,
            overtimeUntil: '19:00'
          }
          : item
      )
    );
  };

  // Reset to initial mock data
  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados originais do painel?')) {
      setWithdrawals([]);
      localStorage.removeItem('painel_ferramentas_withdrawals_v4');
    }
  };

  // Filter lists for selects
  const operatorNames = Array.from(new Set(withdrawals.map((w) => w.operatorName)));
  const toolNames = Array.from(new Set(withdrawals.map((w) => w.toolName)));

  const activeCount = withdrawals.filter((w) => w.status === 'active').length;
  const today = new Date().toDateString();
  const totalToday = withdrawals.filter((w) => new Date(w.dateRetirada).toDateString() === today).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">

      {/* Header */}
      <Header
        buttonStyle={buttonStyle}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onRequestQualityAccess={() => setIsPinModalOpen(true)}
        isChaoDeFabricaUrl={isChaoDeFabricaUrl}
        onOpenNewWithdrawalModal={() => setIsModalOpen(true)}
        onOpenCollaboratorsModal={() => setIsCollaboratorsModalOpen(true)}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCount={activeCount}
        totalToday={totalToday}
        totalOperatorsCount={operators.length}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {viewMode === 'qualidade' ? (
          <>
            {/* High-Level KPI Summary Cards */}
            <KpiCards withdrawals={withdrawals} />

            {/* Real-time Active Tools Section */}
            <ActiveToolsList
              withdrawals={withdrawals}
              buttonStyle={buttonStyle}
              onReturnTool={handleReturnTool}
              onReturnAllForOperator={handleReturnAllForOperator}
              onOpenNewWithdrawalModal={() => setIsModalOpen(true)}
            />

            {/* History Table with Filters */}
            <HistoryTable
              withdrawals={withdrawals}
              filters={historyFilters}
              onFilterChange={setHistoryFilters}
              operators={operatorNames}
              tools={toolNames}
              sectors={sectors}
            />

            {/* Heatmap Matrix: Operators vs Sectors */}
            <HeatmapChart
              withdrawals={withdrawals}
              operators={operatorNames}
              sectors={sectors}
            />
          </>
        ) : (
          /* Chão de Fábrica (Tablet / Shop Floor View) */
          <ChaoDeFabricaView
            withdrawals={withdrawals}
            operators={operators}
            sectors={sectors}
            buttonStyle={buttonStyle}
            onOpenTransferModal={(item) => setTransferItem(item)}
            onExtendOvertime={handleExtendOvertime}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 text-center text-xs text-slate-500 border-t border-slate-900 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Painel de Controle de Ferramentas - Sistema de Qualidade &amp; Calibragem © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ISO 9001
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Rastreabilidade Garantida
            </span>
          </div>
        </div>
      </footer>

      {/* New Withdrawal Modal */}
      <NewWithdrawalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operators={operators}
        tools={tools}
        sectors={sectors}
        buttonStyle={buttonStyle}
        onSubmit={handleCreateWithdrawal}
      />

      {/* Collaborators & Contacts Directory Modal */}
      <CollaboratorsModal
        isOpen={isCollaboratorsModalOpen}
        onClose={() => setIsCollaboratorsModalOpen(false)}
        operators={operators}
        onAddOperator={handleAddOperator}
      />

      {/* Transfer Tool Modal */}
      <TransferModal
        isOpen={!!transferItem}
        onClose={() => setTransferItem(null)}
        item={transferItem}
        operators={operators}
        sectors={sectors}
        onConfirmTransfer={handleConfirmTransfer}
      />

      {/* Supervisor PIN Security Lock Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          handleViewModeChange('qualidade');
        }}
      />

    </div>
  );
}

