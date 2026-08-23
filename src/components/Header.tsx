import React from 'react';
import { ButtonStyleVariant, AppViewMode } from '../types';
import { getPrimaryButtonStyle } from '../utils/buttonStyles';
import { Plus, RefreshCw, Search, Users, Shield, Monitor, Lock } from 'lucide-react';

interface Props {
  buttonStyle: ButtonStyleVariant;
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  onRequestQualityAccess: () => void;
  isChaoDeFabricaUrl: boolean;
  onOpenNewWithdrawalModal: () => void;
  onOpenCollaboratorsModal: () => void;
  onResetData: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalOperatorsCount: number;
}

export const Header: React.FC<Props> = ({
  buttonStyle,
  viewMode,
  onViewModeChange,
  onRequestQualityAccess,
  isChaoDeFabricaUrl,
  onOpenNewWithdrawalModal,
  onOpenCollaboratorsModal,
  onResetData,
  searchQuery,
  onSearchChange,
  totalOperatorsCount
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex flex-row items-center justify-between gap-2">

          {/* App Title */}
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="w-32 h-10 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src="/assets/logo-mectrol-completo.png"
                  alt="Mectrol"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="whitespace-nowrap text-base sm:text-lg font-bold tracking-tight text-white">
                Painel de Ferramentas
              </h1>
            </div>

            {/* View Mode Switcher Tabs */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  if (viewMode === 'chao-de-fabrica' || isChaoDeFabricaUrl) {
                    onRequestQualityAccess();
                  } else {
                    onViewModeChange('qualidade');
                  }
                }}
                title={isChaoDeFabricaUrl ? "Acesso Restrito - Requer Senha de Supervisor" : "Ir para Gestão Qualidade"}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'qualidade'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } whitespace-nowrap`}
              >
                {viewMode === 'chao-de-fabrica' || isChaoDeFabricaUrl ? (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-indigo-300" />
                )}
                <span>Gestão Qualidade</span>
              </button>

              <button
                onClick={() => onViewModeChange('chao-de-fabrica')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'chao-de-fabrica'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } whitespace-nowrap`}
              >
                <Monitor className="w-3.5 h-3.5 text-amber-300" />
                <span>Chão de Fábrica (Tablet)</span>
              </button>
            </div>

            {/* Quick Action mobile Nova Retirada */}
            {viewMode === 'qualidade' && (
              <button
                onClick={onOpenNewWithdrawalModal}
                className={`lg:hidden px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 ${getPrimaryButtonStyle(buttonStyle)}`}
              >
                <Plus className="w-4 h-4" />
                <span>Nova Retirada</span>
              </button>
            )}
          </div>

          {/* Search & Actions Bar */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Search Input */}
            <div className="relative w-44 xl:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar operador, ferramenta..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Colaboradores Directory Button */}
            <button
              onClick={onOpenCollaboratorsModal}
              title="Ver Lista Completa de Colaboradores"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Colaboradores ({totalOperatorsCount})</span>
            </button>

            {/* Action Buttons */}
            {viewMode === 'qualidade' && (
              <button
                onClick={onResetData}
                title="Restaurar Dados Iniciais"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all duration-150"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Main Action Button - Nova Retirada */}
            {viewMode === 'qualidade' && (
              <button
                onClick={onOpenNewWithdrawalModal}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs tracking-wide uppercase transition-all shadow-md whitespace-nowrap ${getPrimaryButtonStyle(buttonStyle)}`}
              >
                <Plus className="w-4 h-4" />
                <span>Nova Retirada</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-black/20 rounded font-mono text-white/80 border border-white/20">
                  N
                </kbd>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};


