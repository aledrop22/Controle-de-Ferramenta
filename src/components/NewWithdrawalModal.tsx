import React, { useState, useEffect } from 'react';
import { Operator, ToolItem, ButtonStyleVariant } from '../types';
import { ESTOQUE_CATEGORIES, USINAGEM_MACHINES } from '../data/mockData';
import { getPrimaryButtonStyle } from '../utils/buttonStyles';
import {
  X,
  PlusCircle,
  Wrench,
  User,
  Building2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Check,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export interface SelectedToolBatchItem {
  id: string;
  category: string;
  spec: string;
  code?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  operators: Operator[];
  tools: ToolItem[];
  sectors: string[];
  buttonStyle: ButtonStyleVariant;
  onSubmit: (withdrawals: Array<{
    toolId: string;
    operatorId: string;
    operatorName: string;
    sector: string;
    machine: string;
    toolName: string;
    spec: string;
    notes?: string;
  }>) => void;
}

export const NewWithdrawalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  operators,
  sectors,
  buttonStyle,
  onSubmit
}) => {
  if (!isOpen) return null;

  // Selected Operator State
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [machineInput, setMachineInput] = useState<string>('');
  const [activeSectorTab, setActiveSectorTab] = useState<string>('Usinagem');

  // Tool Category & Batch Selection State
  const categoryNames = Object.keys(ESTOQUE_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>(categoryNames[0] || 'Porca Calibradora');
  const [selectedBatch, setSelectedBatch] = useState<SelectedToolBatchItem[]>([]);

  // Custom tool input for "Ferramentas Diversas"
  const [customToolInput, setCustomToolInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-fill sector and machine when operator changes
  useEffect(() => {
    const foundOp = operators.find((o) => o.id === selectedOperatorId);
    if (foundOp) {
      setSelectedSector(foundOp.sector);
      setMachineInput(foundOp.machine);
    }
  }, [selectedOperatorId, operators]);

  const handleSelectOperator = (op: Operator) => {
    setSelectedOperatorId(op.id);
    setSelectedSector(op.sector);
    setMachineInput(op.machine || (op.sector === 'Usinagem' ? 'GL 01' : op.sector));
    setActiveSectorTab(op.sector);
  };

  const handleSectorTabChange = (sec: string) => {
    setActiveSectorTab(sec);
    // Don't auto-select operator when changing sector tabs
    // User should manually select operator after choosing sector
  };

  // Toggle tool item in batch
  const handleToggleToolItem = (category: string, spec: string) => {
    const itemKey = `${category}::${spec}`;
    const exists = selectedBatch.some((b) => `${b.category}::${b.spec}` === itemKey);

    if (exists) {
      setSelectedBatch((prev) => prev.filter((b) => `${b.category}::${b.spec}` !== itemKey));
    } else {
      setSelectedBatch((prev) => [
        ...prev,
        {
          id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category,
          spec
        }
      ]);
    }
  };

  // Add custom item for Ferramentas Diversas
  const handleAddCustomTool = () => {
    if (!customToolInput.trim()) return;
    const spec = customToolInput.trim();
    const itemKey = `Ferramentas Diversas::${spec}`;

    if (!selectedBatch.some((b) => `${b.category}::${b.spec}` === itemKey)) {
      setSelectedBatch((prev) => [
        ...prev,
        {
          id: `batch-custom-${Date.now()}`,
          category: 'Ferramentas Diversas',
          spec
        }
      ]);
    }

    setCustomToolInput('');
  };

  const handleRemoveBatchItem = (id: string) => {
    setSelectedBatch((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate operator selection
    if (!selectedOperatorId) {
      setErrorMsg('Por favor, selecione o nome do colaborador responsável pela retirada.');
      return;
    }

    // Validate tool selection
    if (selectedBatch.length === 0) {
      setErrorMsg('Por favor, selecione ao menos uma ferramenta ou medida para registrar a retirada.');
      return;
    }

    const foundOperator = operators.find((o) => o.id === selectedOperatorId);
    const operatorName = foundOperator ? foundOperator.name : 'Operador';

    const withdrawalsData = selectedBatch.map((item) => ({
      toolId: item.id,
      operatorId: selectedOperatorId,
      operatorName,
      sector: selectedSector,
      machine: machineInput || 'Geral',
      toolName: item.category,
      spec: item.spec,
      notes: notes.trim() || undefined
    }));

    onSubmit(withdrawalsData);
    onClose();
  };

  const currentOp = operators.find((o) => o.id === selectedOperatorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Registrar Nova Retirada
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Seleção Rápida
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione o operador (setor e máquina vinculados automaticamente) e escolha as ferramentas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. SELEÇÃO DO OPERADOR & MÁQUINA/SETOR VIA CARDS (SEM JANELA SUSPENSA) */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                1. Selecione o Colaborador Responsável
              </label>
              
              <span className="text-[11px] text-slate-400">
                Toque no nome para selecionar
              </span>
            </div>

            {/* Abas / Filtro Rápido de Setores */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'Usinagem', label: 'Usinagem' },
                { id: 'Produção', label: 'Produção' },
                { id: 'Manutenção', label: 'Manutenção' },
                { id: 'Estoque', label: 'Estoque' },
                { id: 'Expedição', label: 'Expedição' },
                { id: 'PCP', label: 'PCP' },
                { id: 'Qualidade', label: 'Qualidade' },
                { id: 'Todos', label: 'Todos os Setores' }
              ].map((tab) => {
                const isTabActive = activeSectorTab.toLowerCase() === tab.id.toLowerCase();
                const count = tab.id === 'Todos' 
                  ? operators.length 
                  : operators.filter((o) => o.sector.toLowerCase() === tab.id.toLowerCase()).length;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => handleSectorTabChange(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                      isTabActive
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/40'
                        : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 border-slate-700/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isTabActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Cards dos Colaboradores (Exibe APENAS o Nome) */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {[
                'Usinagem',
                'Produção',
                'Manutenção',
                'Estoque',
                'Expedição',
                'PCP',
                'Qualidade'
              ]
                .filter((sec) => activeSectorTab === 'Todos' || activeSectorTab.toLowerCase() === sec.toLowerCase())
                .map((sec) => {
                  const secOps = operators.filter((o) => o.sector.toLowerCase() === sec.toLowerCase());
                  if (secOps.length === 0) return null;

                  return (
                    <div key={sec} className="space-y-1.5">
                      {activeSectorTab === 'Todos' && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 pt-1">
                          <Building2 className="w-3 h-3" />
                          <span>{sec}</span>
                          <span className="text-slate-500 font-normal">({secOps.length})</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2">
                        {secOps.map((op) => {
                          const isSelected = selectedOperatorId === op.id;

                          return (
                            <button
                              type="button"
                              key={op.id}
                              onClick={() => handleSelectOperator(op)}
                              className={`p-2.5 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600/20 text-white border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {op.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {op.name}
                                </span>
                              </div>

                              {isSelected && (
                                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* SELEÇÃO DIRETA DE MÁQUINAS DA USINAGEM (Aparece SOMENTE para Usinagem) */}
            {selectedSector === 'Usinagem' && (
              <div className="space-y-2 pt-2.5 border-t border-slate-800/80 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Máquina de Destino na Usinagem (Toque para trocar de máquina se necessário):
                  </label>
                  <span className="text-[10px] text-slate-400">Padrão do operador selecionado</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2">
                  {USINAGEM_MACHINES.map((machineName) => {
                    const isSelected = machineInput.trim().toLowerCase() === machineName.trim().toLowerCase();

                    return (
                      <button
                        type="button"
                        key={machineName}
                        onClick={() => {
                          setMachineInput(machineName);
                          setSelectedSector('Usinagem');
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950 ring-2 ring-emerald-500/30'
                            : 'bg-slate-800/90 hover:bg-slate-700/80 text-slate-300 border-slate-700 active:scale-95'
                        }`}
                      >
                        <span className="truncate">{machineName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badge de Vinculação Ativa */}
            <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border text-xs ${
              currentOp 
                ? 'bg-indigo-950/40 border-indigo-500/20' 
                : 'bg-rose-950/30 border-rose-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentOp ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span className={`font-medium ${currentOp ? 'text-indigo-200' : 'text-rose-300'}`}>
                  Destino da Retirada:
                </span>
                <span className={`font-bold ${currentOp ? 'text-white' : 'text-rose-400'}`}>
                  {currentOp?.name || 'Nenhum colaborador selecionado'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                {currentOp && (
                  <>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Building2 className="w-3 h-3" />
                      Setor: {selectedSector}
                    </span>
                    {selectedSector === 'Usinagem' && machineInput && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                        <Cpu className="w-3 h-3" />
                        Máquina: {machineInput}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. SELEÇÃO DE CATEGORIA E FERRAMENTAS/MEDIDAS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-rose-400" />
                2. Selecione a Categoria &amp; Medidas/Especificações
              </label>

              <span className="text-[11px] text-slate-400">
                Clique nos tamanhos para adicionar à sacola
              </span>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categoryNames.map((cat) => {
                const isActive = activeCategory === cat;
                const countInCat = selectedBatch.filter((b) => b.category === cat).length;

                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                      isActive
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-950/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    {countInCat > 0 && (
                      <span className="ml-1 w-4 h-4 rounded-full bg-white text-rose-600 text-[10px] font-extrabold flex items-center justify-center">
                        {countInCat}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Category Options Grid */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {activeCategory} — Medidas Disponíveis ({ESTOQUE_CATEGORIES[activeCategory]?.length || 0})
                </span>
                <span className="text-[11px] text-slate-500">
                  Pode selecionar múltiplas medidas
                </span>
              </div>

              {/* Grid of Sizes / Equipment Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                {ESTOQUE_CATEGORIES[activeCategory]?.map((spec) => {
                  const itemKey = `${activeCategory}::${spec}`;
                  const isSelected = selectedBatch.some((b) => `${b.category}::${b.spec}` === itemKey);

                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => handleToggleToolItem(activeCategory, spec)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left flex items-center justify-between border ${
                        isSelected
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/80 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <span className="truncate">{spec}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-500 shrink-0 ml-1 opacity-0 hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Tool Input for Ferramentas Diversas */}
              {activeCategory === 'Ferramentas Diversas' && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Digite o nome de outra ferramenta... (Ex: Martelo, Alicate, Chave) *"
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTool}
                    disabled={!customToolInput.trim()}
                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 shrink-0 ${
                      !customToolInput.trim()
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3. SACOLA / ACUMULANDO FERRAMENTAS SELECIONADAS */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Ferramentas Acumuladas na Retirada
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {selectedBatch.length} {selectedBatch.length === 1 ? 'item' : 'itens'}
                </span>
              </span>

              {selectedBatch.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBatch([])}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Limpar Todos
                </button>
              )}
            </div>

            {selectedBatch.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                Nenhuma ferramenta selecionada ainda. Clique nas medidas acima para acumular.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedBatch.map((item) => (
                  <div
                    key={item.id}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs text-slate-200"
                  >
                    <span className="font-semibold text-rose-400">{item.category}:</span>
                    <span className="font-mono text-white">{item.spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBatchItem(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações opcionais */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Utilizar para aferição na OS #1042"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 hidden sm:block">
              Operador: <span className="text-white font-semibold">{currentOp?.name}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!selectedOperatorId || selectedBatch.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  !selectedOperatorId || selectedBatch.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : getPrimaryButtonStyle(buttonStyle)
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Retirada ({selectedBatch.length})</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
