import React, { useState } from 'react';
import { ToolWithdrawal, FilterOptions } from '../types';
import { History, Filter, Calendar, User, Wrench, Building2, CheckCircle2 } from 'lucide-react';

interface Props {
  withdrawals: ToolWithdrawal[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  operators: string[];
  tools: string[];
  sectors: string[];
}

export const HistoryTable: React.FC<Props> = ({
  withdrawals,
  filters,
  onFilterChange,
  operators,
  tools,
  sectors
}) => {
  const returnedHistory = withdrawals.filter((w) => w.status === 'returned');
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // Filter application
  const filteredList = returnedHistory.filter((item) => {
    // Period filter
    if (filters.period === '7days') {
      const diffDays = (Date.now() - new Date(item.dateRetirada).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return false;
    } else if (filters.period === '30days') {
      const diffDays = (Date.now() - new Date(item.dateRetirada).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) return false;
    }

    // Operator filter
    if (filters.operator && filters.operator !== 'Todos') {
      if (item.operatorName !== filters.operator) return false;
    }

    // Tool filter
    if (filters.tool && filters.tool !== 'Todas') {
      if (item.toolName !== filters.tool) return false;
    }

    // Sector filter
    if (filters.sector && filters.sector !== 'Todos') {
      if (item.sector !== filters.sector) return false;
    }

    // Text Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = item.toolName.toLowerCase().includes(q);
      const matchSpec = item.spec.toLowerCase().includes(q);
      const matchOp = item.operatorName.toLowerCase().includes(q);
      const matchSector = item.sector.toLowerCase().includes(q);
      const matchMachine = item.machine.toLowerCase().includes(q);
      if (!matchName && !matchSpec && !matchOp && !matchSector && !matchMachine) return false;
    }

    return true;
  });

  const formatDateFormatted = (dateStr?: string) => {
    if (!dateStr) return '-';
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

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      
      {/* Table Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Histórico de Devoluções
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {filteredList.length} registro(s)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Registro completo de entradas, saídas e devoluções finalizadas
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 mb-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filtros do Relatório</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Período */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Período
            </label>
            <select
              value={filters.period}
              onChange={(e) => onFilterChange({ ...filters, period: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="month">Últimos 30 dias</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>

          {/* Filtrar por Operador */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              Operador
            </label>
            <select
              value={filters.operator}
              onChange={(e) => onFilterChange({ ...filters, operator: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Todos">Todos os Operadores</option>
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Ferramenta */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Ferramenta
            </label>
            <select
              value={filters.tool}
              onChange={(e) => onFilterChange({ ...filters, tool: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Todas">Todas as Ferramentas</option>
              {tools.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Setor */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Setor / Hangar
            </label>
            <select
              value={filters.sector}
              onChange={(e) => onFilterChange({ ...filters, sector: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Todos">Todos os Setores</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container (Max 5 rows by default) */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-3.5 py-3">Instrumento</th>
              <th className="px-3.5 py-3">Especificação</th>
              <th className="px-3.5 py-3">Operador</th>
              <th className="px-3.5 py-3">Setor</th>
              <th className="px-3.5 py-3">Máquina</th>
              <th className="px-3.5 py-3">Data/Hora Retirada</th>
              <th className="px-3.5 py-3">Data/Hora Devolução</th>
              <th className="px-3.5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-slate-500">
                  <p className="font-medium text-slate-400">Nenhum histórico encontrado para os filtros selecionados.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tente limpar os filtros para visualizar mais registros.</p>
                </td>
              </tr>
            ) : (
              (showAllRows || filters.search ? filteredList : filteredList.slice(0, 5)).map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-3.5 py-3 font-semibold text-white">
                    {item.toolName}
                  </td>
                  <td className="px-3.5 py-3 text-slate-400 font-mono text-[11px]">
                    {item.spec}
                  </td>
                  <td className="px-3.5 py-3 font-medium text-indigo-300">
                    {item.operatorName}
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                      {item.sector}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 font-mono text-slate-300">
                    {item.machine}
                  </td>
                  <td className="px-3.5 py-3 text-slate-400 text-[11px]">
                    {formatDateFormatted(item.dateRetirada)}
                  </td>
                  <td className="px-3.5 py-3 text-slate-400 text-[11px]">
                    {formatDateFormatted(item.dateDevolucao)}
                  </td>
                  <td className="px-3.5 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Devolvida
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show More / Show Less Toggle Button when filteredList > 5 */}
      {filteredList.length > 5 && !filters.search && (
        <div className="mt-3 text-center pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all shadow-sm hover:text-white"
          >
            {showAllRows
              ? 'Mostrar apenas 5 linhas (Ocultar)'
              : `Ver todo o histórico de devoluções (${filteredList.length} registros)`}
          </button>
        </div>
      )}

    </section>
  );
};
