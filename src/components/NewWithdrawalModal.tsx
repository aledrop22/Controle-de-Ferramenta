import React, { useState, useEffect } from 'react';
import { Operator, ToolItem, ToolWithdrawal, ButtonStyleVariant } from '../types';
import { ESTOQUE_CATEGORIES } from '../data/mockData';
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
  Sparkles
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
  withdrawals: ToolWithdrawal[];
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
  withdrawals,
  sectors,
  buttonStyle,
  onSubmit
}) => {
  // Selected Operator State
  const defaultOp = operators[0];
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(defaultOp?.id || '');
  const [selectedSector, setSelectedSector] = useState<string>(defaultOp?.sector || 'Usinagem');
  const [machineInput, setMachineInput] = useState<string>(defaultOp?.machine || 'Geral');
  const [showOverrideSectorMachine, setShowOverrideSectorMachine] = useState<boolean>(false);

  // Tool Category & Batch Selection State
  const categoryNames = Object.keys(ESTOQUE_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>(categoryNames[0] || 'Porca Calibradora');
  const [selectedBatch, setSelectedBatch] = useState<SelectedToolBatchItem[]>([]);

  // Custom tool input for "Ferramentas Diversas"
  const [customToolInput, setCustomToolInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const activeToolKeys = new Set(
    withdrawals
      .filter((withdrawal) => withdrawal.status === 'active')
      .map((withdrawal) => `${withdrawal.toolName}::${withdrawal.spec}`)
  );

  // Auto-fill sector and machine when operator changes
  useEffect(() => {
    const foundOp = operators.find((o) => o.id === selectedOperatorId);
    if (foundOp) {
      setSelectedSector(foundOp.sector);
      setMachineInput(foundOp.machine);
    }
  }, [selectedOperatorId, operators]);

  const handleOperatorChange = (opId: string) => {
    setSelectedOperatorId(opId);
    const foundOp = operators.find((o) => o.id === opId);
    if (foundOp) {
      setSelectedSector(foundOp.sector);
      setMachineInput(foundOp.machine);
    }
  };

  // Toggle tool item in batch
  const handleToggleToolItem = (category: string, spec: string) => {
    const itemKey = `${category}::${spec}`;
    if (activeToolKeys.has(itemKey)) return;
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

    if (selectedBatch.length === 0) {
      setErrorMsg('Por favor, selecione ao menos uma ferramenta ou medida para registrar a retirada.');
      return;
    }

    const unavailableItem = selectedBatch.find((item) => activeToolKeys.has(`${item.category}::${item.spec}`));
    if (unavailableItem) {
      setErrorMsg(`${unavailableItem.category} (${unavailableItem.spec}) já está em uso.`);
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

  const currentOp = operators.find((o) => o.id === selectedOperatorId) || defaultOp;

  if (!isOpen) return null;

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

          {/* 1. SELEÇÃO DO OPERADOR (NOME LIMPO) */}
          <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                1. Selecione o Operador Responsável
              </label>

              <button
                type="button"
                onClick={() => setShowOverrideSectorMachine(!showOverrideSectorMachine)}
                className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                <Sliders className="w-3 h-3" />
                <span>{showOverrideSectorMachine ? 'Ocultar Ajustes' : 'Ajustar Setor/Máquina'}</span>
              </button>
            </div>

            {/* Operator Select with ONLY Clean Operator Names */}
            <select
              value={selectedOperatorId}
              onChange={(e) => handleOperatorChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>

            {/* Auto-linked Sector and Machine Badge Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-indigo-200 font-medium">Vinculado Automático:</span>
              </div>
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Building2 className="w-3 h-3" />
                  {selectedSector}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700/80 text-slate-200 border border-slate-600">
                  <Cpu className="w-3 h-3" />
                  {machineInput}
                </span>
              </div>
            </div>

            {/* Optional Manual Override Inputs */}
            {showOverrideSectorMachine && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Setor (Alterar)
                  </label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {sectors.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Máquina / Posto (Alterar)
                  </label>
                  <input
                    type="text"
                    value={machineInput}
                    onChange={(e) => setMachineInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${isActive
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
                  const isUnavailable = activeToolKeys.has(itemKey);

                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => handleToggleToolItem(activeCategory, spec)}
                      disabled={isUnavailable}
                      className={`px-2.5 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left flex items-center justify-between border ${isSelected
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/80 ring-1 ring-emerald-500/30'
                          : isUnavailable
                            ? 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                        }`}
                    >
                      <span className="truncate">{spec}</span>
                      {isUnavailable ? (
                        <span className="text-[10px] uppercase font-bold">Em uso</span>
                      ) : isSelected ? (
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
                    placeholder="Digite o nome de outra ferramenta... (Ex: Martelo, Alicate, Chave)"
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTool}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
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
                disabled={selectedBatch.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${selectedBatch.length === 0
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
