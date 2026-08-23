import React, { useState, useEffect } from 'react';
import { Operator, ToolWithdrawal } from '../types';
import { USINAGEM_MACHINES } from '../data/mockData';
import { X, ArrowRightLeft, User, Building2, Cpu, CheckCircle2, AlertCircle, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ToolWithdrawal | null;
  operators: Operator[];
  sectors: string[];
  onConfirmTransfer: (
    withdrawalId: string,
    newOperatorId: string,
    newOperatorName: string,
    newSector: string,
    newMachine: string,
    notes?: string
  ) => void;
}

export const TransferModal: React.FC<Props> = ({
  isOpen,
  onClose,
  item,
  operators,
  sectors,
  onConfirmTransfer
}) => {
  if (!isOpen || !item) return null;

  // Filter out the operator who currently holds the tool
  const availableOperators = operators.filter((o) => o.id !== item.operatorId);
  const defaultTargetOp = availableOperators[0] || operators[0];

  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(defaultTargetOp?.id || '');
  const [selectedSector, setSelectedSector] = useState<string>(defaultTargetOp?.sector || 'Usinagem');
  const [machineInput, setMachineInput] = useState<string>(defaultTargetOp?.machine || 'GL 01');
  const [activeSectorTab, setActiveSectorTab] = useState<string>(defaultTargetOp?.sector || 'Usinagem');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Whenever modal opens or item changes, select default target operator
  useEffect(() => {
    if (defaultTargetOp) {
      setSelectedOperatorId(defaultTargetOp.id);
      setSelectedSector(defaultTargetOp.sector);
      setMachineInput(defaultTargetOp.machine || (defaultTargetOp.sector === 'Usinagem' ? 'GL 01' : defaultTargetOp.sector));
      setActiveSectorTab(defaultTargetOp.sector);
    }
  }, [item]);

  // When operator selection changes, AUTOMATICALLY update sector and machine
  const handleSelectOperator = (targetOp: Operator) => {
    setSelectedOperatorId(targetOp.id);
    setSelectedSector(targetOp.sector);
    setMachineInput(targetOp.machine || (targetOp.sector === 'Usinagem' ? 'GL 01' : targetOp.sector));
    setActiveSectorTab(targetOp.sector);
  };

  const handleSectorTabChange = (sec: string) => {
    setActiveSectorTab(sec);
    if (sec !== 'Todos') {
      const firstInSec = availableOperators.find((o) => o.sector.toLowerCase() === sec.toLowerCase());
      if (firstInSec) {
        setSelectedOperatorId(firstInSec.id);
        setSelectedSector(firstInSec.sector);
        setMachineInput(firstInSec.machine || (firstInSec.sector === 'Usinagem' ? 'GL 01' : firstInSec.sector));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedOperatorId) {
      setErrorMsg('Selecione o operador de destino.');
      return;
    }

    const targetOp = operators.find((o) => o.id === selectedOperatorId);
    const newOperatorName = targetOp ? targetOp.name : 'Operador Destino';

    onConfirmTransfer(
      item.id,
      selectedOperatorId,
      newOperatorName,
      selectedSector,
      machineInput || selectedSector,
      transferNotes.trim() || undefined
    );

    onClose();
  };

  const targetOp = operators.find((o) => o.id === selectedOperatorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Transferir Ferramenta no Chão de Fábrica
              </h3>
              <p className="text-xs text-slate-400">
                Passe a posse da ferramenta para outro operador ou máquina no chão de fábrica
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Tool Summary */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ferramenta Selecionada
            </span>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-extrabold text-white">{item.toolName}</div>
                <div className="text-xs font-mono font-semibold text-indigo-300">{item.spec}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Posse Atual:</span>
                <span className="text-xs font-bold text-rose-400">{item.operatorName}</span>
                <div className="text-[10px] text-slate-400">
                  {item.sector} {item.machine && item.machine !== item.sector ? `(${item.machine})` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Target Operator Selector via Touch Cards */}
          <div className="space-y-3 bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                Selecione o Novo Colaborador (Destino):
              </label>
              <span className="text-[11px] text-slate-400">Toque no nome</span>
            </div>

            {/* Setor Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {[
                { id: 'Usinagem', label: 'Usinagem' },
                { id: 'Produção', label: 'Produção' },
                { id: 'Manutenção', label: 'Manutenção' },
                { id: 'Estoque', label: 'Estoque' },
                { id: 'Expedição', label: 'Expedição' },
                { id: 'PCP', label: 'PCP' },
                { id: 'Qualidade', label: 'Qualidade' },
                { id: 'Todos', label: 'Todos' }
              ].map((tab) => {
                const isTabActive = activeSectorTab.toLowerCase() === tab.id.toLowerCase();
                const count = tab.id === 'Todos'
                  ? availableOperators.length
                  : availableOperators.filter((o) => o.sector.toLowerCase() === tab.id.toLowerCase()).length;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => handleSectorTabChange(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 border cursor-pointer shrink-0 ${
                      isTabActive
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40'
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

            {/* Operator Cards (Showing Only Names) */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
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
                  const secOps = availableOperators.filter((o) => o.sector.toLowerCase() === sec.toLowerCase());
                  if (secOps.length === 0) return null;

                  return (
                    <div key={sec} className="space-y-1.5">
                      {activeSectorTab === 'Todos' && (
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 pt-1">
                          <Building2 className="w-3 h-3" />
                          <span>{sec}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {secOps.map((op) => {
                          const isSelected = selectedOperatorId === op.id;

                          return (
                            <button
                              type="button"
                              key={op.id}
                              onClick={() => handleSelectOperator(op)}
                              className={`p-2.5 rounded-xl text-left transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-600/20 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/40'
                                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                  isSelected ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {op.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold truncate">
                                  {op.name}
                                </span>
                              </div>

                              {isSelected && (
                                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Machines for Usinagem */}
            {selectedSector === 'Usinagem' && (
              <div className="space-y-2 pt-2.5 border-t border-slate-800/80 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Máquina de Destino na Usinagem:
                  </label>
                  <span className="text-[10px] text-slate-400">Toque se for trocar de máquina</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
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

            {/* Auto-Recognized Sector and Machine Preview */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="font-bold text-amber-300">Novo Destino:</span>
                <span className="text-white font-bold">{targetOp?.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap font-semibold">
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Setor: {selectedSector}
                </span>
                {selectedSector === 'Usinagem' && machineInput && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800 text-emerald-300 border border-slate-700 font-mono">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    Máquina: {machineInput}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação / Motivo da Transferência (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Transferido para ajuste de usinagem"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Transferência</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
