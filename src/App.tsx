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
  INITIAL_SECTORS,
  INITIAL_WITHDRAWALS
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
import { ShieldCheck, Layers } from 'lucide-react';

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

  // Persistence state for withdrawals
  const [withdrawals, setWithdrawals] = useState<ToolWithdrawal[]>(() => {
    const saved = localStorage.getItem('painel_ferramentas_withdrawals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler do localStorage', e);
      }
    }
    return INITIAL_WITHDRAWALS;
  });

  // Operators state with persistence
  const [operators, setOperators] = useState<Operator[]>(() => {
    const saved = localStorage.getItem('painel_ferramentas_operators');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler operadores', e);
      }
    }
    return INITIAL_OPERATORS;
  });

  const [tools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [sectors] = useState<string[]>(INITIAL_SECTORS);

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

  // Auto-refresh data for Qualidade dashboard (every 5 minutes)
  useEffect(() => {
    if (viewMode !== 'qualidade') return;

    const refreshInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

    const intervalId = setInterval(() => {
      // Reload data from localStorage to sync with other instances
      const savedWithdrawals = localStorage.getItem('painel_ferramentas_withdrawals');
      const savedOperators = localStorage.getItem('painel_ferramentas_operators');

      if (savedWithdrawals) {
        try {
          setWithdrawals(JSON.parse(savedWithdrawals));
        } catch (e) {
          console.error('Erro ao recarregar dados de retiradas', e);
        }
      }

      if (savedOperators) {
        try {
          setOperators(JSON.parse(savedOperators));
        } catch (e) {
          console.error('Erro ao recarregar operadores', e);
        }
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [viewMode]);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem('painel_ferramentas_withdrawals', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('painel_ferramentas_operators', JSON.stringify(operators));
  }, [operators]);

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
      setWithdrawals(INITIAL_WITHDRAWALS);
      localStorage.removeItem('painel_ferramentas_withdrawals');
    }
  };

  // Filter lists for selects
  const operatorNames = Array.from(new Set(withdrawals.map((w) => w.operatorName)));
  const toolNames = Array.from(new Set(withdrawals.map((w) => w.toolName)));

  const activeCount = withdrawals.filter((w) => w.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">

      {/* Header */}
      <Header
        buttonStyle={buttonStyle}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        isChaoDeFabricaUrl={isChaoDeFabricaUrl}
        onOpenNewWithdrawalModal={() => setIsModalOpen(true)}
        onOpenCollaboratorsModal={() => setIsCollaboratorsModalOpen(true)}
        onResetData={handleResetData}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCount={activeCount}
        totalToday={withdrawals.length}
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
        withdrawals={withdrawals}
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

    </div>
  );
}

