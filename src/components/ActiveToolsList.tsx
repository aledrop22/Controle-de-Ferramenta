import React, { useEffect, useRef, useState } from 'react';
import { ToolWithdrawal, ButtonStyleVariant } from '../types';
import { getActionButtonStyle } from '../utils/buttonStyles';
import { RotateCcw, Clock, Calendar, CheckCircle2, UserCheck, ChevronDown, ChevronUp, Sparkles, Inbox, AlertTriangle } from 'lucide-react';

interface Props {
  withdrawals: ToolWithdrawal[];
  buttonStyle: ButtonStyleVariant;
  onReturnTool: (id: string) => void;
  onReturnAllForOperator: (operatorId: string) => void;
  onOpenNewWithdrawalModal: () => void;
}

interface OperatorGroup {
  operatorName: string;
  sector: string;
  machine: string;
  items: ToolWithdrawal[];
}

export const ActiveToolsList: React.FC<Props> = ({
  withdrawals,
  buttonStyle,
  onReturnTool,
  onReturnAllForOperator,
  onOpenNewWithdrawalModal
}) => {
  const activeWithdrawals = withdrawals.filter((w) => w.status === 'active');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastOverdueCountRef = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const isOverdue = (item: ToolWithdrawal): boolean => {
    if (item.isOvertime) return false;
    const deadline = new Date(currentTime);
    deadline.setHours(17, 0, 0, 0);
    const withdrawalDate = new Date(item.dateRetirada);
    return withdrawalDate.toDateString() !== currentTime.toDateString() || currentTime >= deadline && withdrawalDate <= deadline;
  };

  const overdueCount = activeWithdrawals.filter(isOverdue).length;

  useEffect(() => {
    const activateAlerts = () => {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      if (audioContextRef.current.state === 'suspended') void audioContextRef.current.resume();
      window.removeEventListener('pointerdown', activateAlerts);
    };
    window.addEventListener('pointerdown', activateAlerts);
    return () => window.removeEventListener('pointerdown', activateAlerts);
  }, []);

  useEffect(() => {
    if (overdueCount <= lastOverdueCountRef.current) {
      lastOverdueCountRef.current = overdueCount;
      return;
    }

    lastOverdueCountRef.current = overdueCount;
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.4);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.45);
  }, [overdueCount]);

  // Group active withdrawals by operator
  const groupedByOperator: Record<string, OperatorGroup> = {};
  activeWithdrawals.forEach((item) => {
    if (!groupedByOperator[item.operatorId]) {
      groupedByOperator[item.operatorId] = {
        operatorName: item.operatorName,
        sector: item.sector,
        machine: item.machine,
        items: []
      };
    }
    groupedByOperator[item.operatorId].items.push(item);
  });

  const [expandedOperators, setExpandedOperators] = useState<Record<string, boolean>>({});

  const toggleOperatorExpand = (opId: string) => {
    setExpandedOperators((prev) => ({
      ...prev,
      [opId]: !prev[opId]
    }));
  };

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min atrás`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m atrás`;
  };

  const formatDateFormatted = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${mins}`;
    } catch {
      return dateStr;
    }
  };

  const shouldShowMachineBadge = (sector: string, machine: string) => {
    if (!machine || !machine.trim()) return false;
    const s = sector.trim().toLowerCase();
    const m = machine.trim().toLowerCase();
    if (s === m) return false;

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

    if (genericTerms.includes(m)) return false;

    return true;
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Ferramentas em Uso
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tempo Real
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Acompanhamento ao vivo das retiradas ativas por operador e posto de trabalho
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
            {activeWithdrawals.length === 1
              ? '1 ferramenta em uso'
              : `${activeWithdrawals.length} ferramentas em uso`}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {Object.keys(groupedByOperator).length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-800/30 rounded-xl border border-dashed border-slate-700/80">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3 border border-slate-700">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            Nenhuma ferramenta retirada no momento
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Todas as ferramentas estão catalogadas e disponíveis na ferramentaria.
          </p>
          <button
            onClick={onOpenNewWithdrawalModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-md shadow-indigo-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Registrar Nova Retirada</span>
          </button>
        </div>
      ) : (
        /* Operator Cards Grid */
        <div className="space-y-4">
          {Object.entries(groupedByOperator).map(([opId, group]) => {
            const isCollapsed = expandedOperators[opId];
            const overdueItems = group.items.filter(isOverdue);
            return (
              <div
                key={opId}
                className={`bg-slate-800/60 border rounded-xl p-3.5 sm:p-4 transition-all shadow-md group ${overdueItems.length > 0
                  ? 'border-rose-500/60 hover:border-rose-400/80'
                  : 'border-slate-700/70 hover:border-slate-600/80'
                  }`}
              >
                {/* Operator Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden shadow-inner">
                        {group.operatorName.charAt(0)}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {group.operatorName}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {group.sector}
                        </span>
                        {shouldShowMachineBadge(group.sector, group.machine) && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 border border-slate-600">
                            ⚙️ {group.machine}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>
                          {group.items.length === 1
                            ? '1 ferramenta retirada'
                            : `${group.items.length} ferramentas retiradas`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Operator Batch Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onReturnAllForOperator(opId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${getActionButtonStyle(
                        buttonStyle,
                        true
                      )}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>
                        {group.items.length > 1
                          ? `Devolver Tudo (${group.items.length})`
                          : 'Devolver'}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleOperatorExpand(opId)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors"
                      title="Expandir/Recolher"
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {overdueItems.length > 0 && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span>
                      <strong className="font-extrabold text-rose-300">Atenção: devolução atrasada.</strong>{' '}
                      {group.operatorName} deve devolver {overdueItems.length === 1 ? 'a ferramenta pendente' : `as ${overdueItems.length} ferramentas pendentes`} ou solicitar Horas Extras.
                    </span>
                  </div>
                )}

                {/* Items List */}
                {!isCollapsed && (
                  <div className="mt-3 space-y-2">
                    {group.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center border border-slate-700 shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs text-slate-100">
                                {item.toolName}
                              </span>
                              <span className="text-xs text-slate-400 font-mono bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                                {item.spec}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                {formatDateFormatted(item.dateRetirada)}
                              </span>
                              <span className="flex items-center gap-1 text-amber-400 font-medium">
                                <Clock className="w-3 h-3" />
                                {formatTimeAgo(item.dateRetirada)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Individual Return Button (only if multiple items) */}
                        {group.items.length > 1 && (
                          <button
                            onClick={() => onReturnTool(item.id)}
                            className={`self-end sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${getActionButtonStyle(
                              buttonStyle,
                              true
                            )}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Devolver Individual</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
