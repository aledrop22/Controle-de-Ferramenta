import React, { useState, useEffect } from 'react';
import { Operator, ToolWithdrawal } from '../types';
import { X, ArrowRightLeft, User, Building2, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

const USINAGEM_MACHINES = [
  'GL 01', 'GL 02', 'CNC 01', 'CNC 02', 'CNC 30', 'CNC 35',
  'FRESA 01', 'FRESA 02', 'TORNO 01', 'TORNO 02', 'TORNO 03'
];

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
  // Filter out the operator who currently holds the tool
  const availableOperators = item
    ? operators.filter((o) => o.id !== item.operatorId)
    : operators;
  const defaultTargetOp = availableOperators[0] || operators[0];

  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(defaultTargetOp?.id || '');
  const [selectedSector, setSelectedSector] = useState<string>(defaultTargetOp?.sector || 'Usinagem');
  const [machineInput, setMachineInput] = useState<string>(defaultTargetOp?.machine || 'Geral');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const usinagemMachines = Array.from(new Set([
    ...USINAGEM_MACHINES,
    ...operators.filter((operator) => operator.sector === 'Usinagem').map((operator) => operator.machine)
  ])).filter(Boolean);

  // Whenever the modal opens or the item changes, select the first valid destination.
  useEffect(() => {
    if (defaultTargetOp) {
      setSelectedOperatorId(defaultTargetOp.id);
      setSelectedSector(defaultTargetOp.sector);
      setMachineInput(defaultTargetOp.machine);
    }
    setTransferNotes('');
    setErrorMsg('');
  }, [item?.id, defaultTargetOp?.id]);

  // When operator selection changes, AUTOMATICALLY update sector and machine
  const handleOperatorChange = (opId: string) => {
    setSelectedOperatorId(opId);
    const targetOp = operators.find((o) => o.id === opId);
    if (targetOp) {
      setSelectedSector(targetOp.sector);
      setMachineInput(targetOp.machine);
    }
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    const firstOperator = availableOperators.find((operator) => operator.sector === sector);
    if (firstOperator) {
      setSelectedOperatorId(firstOperator.id);
      setMachineInput(firstOperator.machine);
    } else {
      setSelectedOperatorId('');
      setMachineInput(sector);
    }
  };

  const isGenericMachine = (sector: string, machine: string) => {
    if (!machine || !machine.trim()) return true;
    const s = sector.trim().toLowerCase();
    const m = machine.trim().toLowerCase();
    if (s === m) return true;

    const genericTerms = [
      'produção',
      'producao',
      'manutenção',
      'manutencao',
      'estoque',
      'expedição',
      'expedicao',
      'pcp',
      'qualidade',
      'geral'
    ];
    return genericTerms.includes(m);
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
  const showMachineTag = targetOp ? !isGenericMachine(selectedSector, machineInput) : false;

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative">

        {/* Header */}
        <div className="bg-slate-800/90 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          {/* Target Sector and Operator Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              1. Selecione o Setor de Destino
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sectors.map((sector) => (
                <button
                  type="button"
                  key={sector}
                  onClick={() => handleSectorChange(sector)}
                  className={`min-h-11 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${selectedSector === sector
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                  {sector}
                </button>
              ))}
            </div>

            <label className="block text-xs font-bold text-white flex items-center gap-1.5 pt-2">
              <User className="w-4 h-4 text-amber-400" />
              2. Selecione o Novo Operador
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {availableOperators.filter((operator) => operator.sector === selectedSector).map((operator) => (
                <button
                  type="button"
                  key={operator.id}
                  onClick={() => handleOperatorChange(operator.id)}
                  className={`min-h-14 px-3 py-2 rounded-lg border text-left transition-colors ${selectedOperatorId === operator.id
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                >
                  <span className="block text-xs font-semibold truncate">{operator.name}</span>
                  <span className="block text-[10px] opacity-75 truncate">{operator.machine}</span>
                </button>
              ))}
            </div>

            {availableOperators.filter((operator) => operator.sector === selectedSector).length === 0 && (
              <p className="text-xs text-rose-300">Nenhum operador disponível neste setor.</p>
            )}

            {/* Auto-Recognized Sector and Machine Preview */}
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-amber-300">Destino Automático:</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  Setor: {selectedSector}
                </span>
                {showMachineTag && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-mono font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    Máquina: {machineInput}
                  </span>
                )}
              </div>
            </div>

            {selectedSector === 'Usinagem' && selectedOperatorId && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  3. Selecione a Máquina de Destino
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {usinagemMachines.map((machine) => (
                    <button
                      type="button"
                      key={machine}
                      onClick={() => setMachineInput(machine)}
                      className={`min-h-10 px-2.5 py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${machineInput === machine
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                    >
                      {machine}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transfer Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação / Motivo da Transferência (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Transferido para ajuste no torneamento"
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
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
