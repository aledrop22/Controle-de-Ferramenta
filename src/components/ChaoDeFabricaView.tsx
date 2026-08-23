import React, { useEffect, useRef, useState } from 'react';
import { ToolWithdrawal, Operator, ButtonStyleVariant } from '../types';
import {
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  Building2,
  Cpu,
  Sparkles,
  Zap,
  RefreshCw,
  User
} from 'lucide-react';
import { defaultAvatarUrl, getOperatorAvatarUrl } from '../utils/operatorAvatar';

interface Props {
  withdrawals: ToolWithdrawal[];
  operators: Operator[];
  sectors: string[];
  buttonStyle: ButtonStyleVariant;
  onOpenTransferModal: (item: ToolWithdrawal) => void;
  onExtendOvertime: (withdrawalId: string) => void;
}

interface OperatorGroup {
  operatorName: string;
  operatorId: string;
  sector: string;
  machine: string;
  avatarUrl?: string;
  items: ToolWithdrawal[];
}

export const ChaoDeFabricaView: React.FC<Props> = ({
  withdrawals,
  operators,
  sectors,
  onOpenTransferModal,
  onExtendOvertime
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('Todos');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAlertStageRef = useRef<string>('');

  const activeWithdrawals = withdrawals.filter((w) => w.status === 'active');
  const pendingReturnCount = activeWithdrawals.filter((item) => !item.isOvertime).length;

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const shiftDeadline = new Date(currentTime);
  shiftDeadline.setHours(17, 0, 0, 0);
  const minutesUntilDeadline = Math.ceil((shiftDeadline.getTime() - currentTime.getTime()) / 60000);
  const isAfterShift = minutesUntilDeadline <= 0;
  const showTimeAlert = pendingReturnCount > 0 && (minutesUntilDeadline <= 20 || isAfterShift);

  const timeAlertMessage = isAfterShift
    ? `Prazo encerrado. Devolva ${pendingReturnCount === 1 ? 'a ferramenta' : 'as ferramentas'} imediatamente ou utilize Horas Extras.`
    : minutesUntilDeadline <= 10
      ? `Atenção: faltam ${minutesUntilDeadline} minuto(s) para as 17h. Devolva ${pendingReturnCount === 1 ? 'a ferramenta' : 'as ferramentas'} ou clique em Horas Extras.`
      : `Aviso: faltam ${minutesUntilDeadline} minutos para as 17h. Organize a devolução ${pendingReturnCount === 1 ? 'da ferramenta' : 'das ferramentas'} ou utilize Horas Extras.`;

  const alertStage = pendingReturnCount === 0
    ? 'clear'
    : isAfterShift
      ? 'after-shift'
      : minutesUntilDeadline <= 10
        ? 'ten-minutes'
        : minutesUntilDeadline <= 20
          ? 'twenty-minutes'
          : 'normal';

  useEffect(() => {
    const activateAlerts = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === 'suspended') {
        void audioContextRef.current.resume();
      }
      if ('Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
      window.removeEventListener('pointerdown', activateAlerts);
    };

    window.addEventListener('pointerdown', activateAlerts);
    return () => window.removeEventListener('pointerdown', activateAlerts);
  }, []);

  useEffect(() => {
    if (!showTimeAlert || alertStage === 'clear' || lastAlertStageRef.current === alertStage) return;

    lastAlertStageRef.current = alertStage;
    const alertTitle = isAfterShift ? 'Prazo de devolução encerrado' : 'Devolução de ferramenta';

    if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(alertTitle, {
        body: timeAlertMessage,
        tag: `tool-return-${alertStage}`,
        requireInteraction: true
      });
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = isAfterShift ? 880 : 660;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.4);
  }, [alertStage, isAfterShift, showTimeAlert, timeAlertMessage]);

  useEffect(() => {
    if (!showTimeAlert) return;

    const originalTitle = document.title;
    let showAlertTitle = true;
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'hidden') {
        document.title = showAlertTitle ? `⚠️ ${isAfterShift ? 'Devolução pendente' : 'Atenção: devolução'}` : originalTitle;
        showAlertTitle = !showAlertTitle;
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
      document.title = originalTitle;
    };
  }, [isAfterShift, showTimeAlert]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Helper to format exact date and time like "12/08/2026 às 16:23"
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  // Helper to calculate elapsed time in hours and minutes
  const getElapsedTimeText = (dateStr: string) => {
    try {
      const start = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - start);
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      if (hours === 0 && mins === 0) return 'há menos de 1 minuto em uso';
      if (hours === 0) return `há ${mins} minuto(s) em uso`;
      return `há ${hours}h ${mins}m em uso`;
    } catch {
      return '';
    }
  };

  // Check if sector and machine are equivalent (e.g. Produção / Produção)
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

  // Filter items by Sector
  const filteredActive = activeWithdrawals.filter((item) => {
    return selectedSector === 'Todos' || item.sector === selectedSector;
  });

  // Group active withdrawals by Operator ID / Name
  const initialGroupAcc: Record<string, OperatorGroup> = {};
  const groupedByOperator = filteredActive.reduce((acc, item) => {
    const key = item.operatorId || item.operatorName;
    if (!acc[key]) {
      const opInfo = operators.find((o) => o.id === item.operatorId || o.name === item.operatorName);
      acc[key] = {
        operatorName: item.operatorName,
        operatorId: item.operatorId,
        sector: item.sector,
        machine: item.machine,
        avatarUrl: getOperatorAvatarUrl(opInfo?.id || item.operatorId, opInfo?.name || item.operatorName),
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, initialGroupAcc);

  const operatorGroupsList = Object.values(groupedByOperator) as OperatorGroup[];

  return (
    <div className="space-y-6 animate-fadeIn pb-8">

      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Dashboard em Tempo Real — Chão de Fábrica
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de ferramentas em posse, horários e transferências
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeWithdrawals.length === 1
              ? '1 Ferramenta no Chão de Fábrica'
              : `${activeWithdrawals.length} Ferramentas no Chão de Fábrica`}
          </span>
        </div>
      </div>

      {/* Turno Expediente Alert Banner (07:00 às 17:00) */}
      <div className={`border rounded-2xl p-4 shadow-xl ${showTimeAlert && isAfterShift
        ? 'bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border-rose-500/50'
        : showTimeAlert
          ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-500/50'
          : 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-500/30'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${showTimeAlert && isAfterShift
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
            <AlertTriangle className={`w-5 h-5 ${showTimeAlert ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border ${showTimeAlert && isAfterShift
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                {showTimeAlert ? (isAfterShift ? 'Prazo de devolução encerrado' : 'Atenção: horário de devolução') : 'Horário de Turno: 07:00 às 17:00'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {showTimeAlert
                ? timeAlertMessage
                : <>Todas as ferramentas devem ser devolvidas antes das 17h. Para permanência em uso após este horário, utilize a prorrogação de <strong>Horas Extras</strong>.</>}
            </p>
          </div>
        </div>
      </div>

      {/* Sector Filter Tabs & Refresh Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">

        {/* Sector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
          <button
            onClick={() => setSelectedSector('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedSector === 'Todos'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
          >
            Todos ({activeWithdrawals.length})
          </button>

          {sectors.map((sector) => {
            const count = activeWithdrawals.filter((w) => w.sector === sector).length;
            const isSelected = selectedSector === sector;

            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
              >
                <span>{sector}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isSelected ? 'bg-white text-indigo-700' : 'bg-slate-700 text-indigo-300'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Refresh Button Inline */}
        <button
          onClick={handleRefresh}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Main Section Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-800 rounded-xl px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-sm font-extrabold text-white tracking-wide">
            Ferramentas em Uso (Tempo Real)
          </h2>
        </div>
        <span className="text-xs text-blue-200 font-mono font-bold">
          {filteredActive.length} item(ns)
        </span>
      </div>

      {/* Active Tools List Grouped by Operator */}
      {operatorGroupsList.length === 0 ? (
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Nenhuma ferramenta em uso para este filtro</h3>
          <p className="text-xs text-slate-500 mt-1">
            Todas as ferramentas encontram-se devolvidas no Laboratório da Qualidade.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {operatorGroupsList.map((group) => {
            const showMachine = !isGenericMachine(group.sector, group.machine);

            return (
              <div
                key={group.operatorId || group.operatorName}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl hover:border-slate-700 transition-all space-y-4"
              >
                {/* Operator Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">

                    {/* Photo / Avatar Box */}
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                      {group.avatarUrl ? (
                        <img
                          src={group.avatarUrl}
                          alt={group.operatorName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = defaultAvatarUrl;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-extrabold flex items-center justify-center text-sm">
                          {group.operatorName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Operator Name & Sector / Machine Badges */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-extrabold text-white">
                          👤 {group.operatorName}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          ({group.sector})
                        </span>
                        {showMachine && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ⚙️ {group.machine}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">
                        {group.items.length === 1
                          ? '1 ferramenta em posse'
                          : `${group.items.length} ferramentas em posse`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-cards for each tool under this operator */}
                <div className="space-y-2.5">
                  {group.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`bg-slate-950/80 border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${item.isOvertime
                        ? 'border-emerald-500/40 bg-gradient-to-r from-slate-950 to-emerald-950/20'
                        : 'border-slate-800/90 hover:border-slate-700'
                        }`}
                    >
                      {/* Left: Index badge + Tool Info */}
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white">
                              {item.toolName}
                            </span>
                            <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {item.spec}
                            </span>
                            {item.isOvertime && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-400" />
                                Horas Extras
                              </span>
                            )}
                          </div>

                          {/* Date, Time & Relative Usage Time */}
                          <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {formatDateTime(item.dateRetirada)}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-amber-300 font-medium">
                              🕒 {getElapsedTimeText(item.dateRetirada)}
                            </span>
                          </div>

                          {/* Transfer Origin Note if transferred */}
                          {item.transferredFrom && (
                            <div className="text-[11px] font-medium text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded px-2 py-0.5 inline-block mt-1">
                              🔄 Transferido de: {item.transferredFrom}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Transfer Button */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">

                        {/* Extend Overtime Toggle */}
                        {!item.isOvertime && (
                          <button
                            onClick={() => onExtendOvertime(item.id)}
                            title="Prorrogar para Horas Extras"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span className="hidden md:inline">Extra</span>
                          </button>
                        )}

                        {/* Transfer Button */}
                        <button
                          onClick={() => onOpenTransferModal(item)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 hover:border-amber-500/60 transition-all text-xs font-bold flex items-center gap-2 shadow-sm hover:text-amber-300"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                          <span>Transferir</span>
                        </button>

                      </div>

                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
