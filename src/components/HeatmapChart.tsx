import React, { useState } from 'react';
import { ToolWithdrawal } from '../types';
import { Flame, Info, Calendar } from 'lucide-react';

interface Props {
  withdrawals: ToolWithdrawal[];
  operators: string[];
  sectors: string[];
}

export const HeatmapChart: React.FC<Props> = ({ withdrawals, operators, sectors }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Compute matrix intensity for Operators vs Sectors
  const matrix: Record<string, Record<string, number>> = {};

  operators.forEach((op) => {
    matrix[op] = {};
    sectors.forEach((sec) => {
      matrix[op][sec] = 0;
    });
  });

  // Populate counts from withdrawals
  withdrawals.forEach((item) => {
    // Filter by selected period if needed
    if (selectedPeriod === '7days') {
      const diffDays = (Date.now() - new Date(item.dateRetirada).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return;
    }

    if (matrix[item.operatorName] && matrix[item.operatorName][item.sector] !== undefined) {
      matrix[item.operatorName][item.sector] += 1;
    }
  });

  // Calculate max value for relative intensity scaling
  let maxVal = 1;
  operators.forEach((op) => {
    sectors.forEach((sec) => {
      if (matrix[op][sec] > maxVal) maxVal = matrix[op][sec];
    });
  });

  // Color generator based on usage intensity
  const getCellBgColor = (count: number) => {
    if (count === 0) return 'bg-slate-900/60 border-slate-800 text-slate-600';
    const ratio = count / maxVal;
    if (ratio <= 0.25) return 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300 font-semibold shadow-inner';
    if (ratio <= 0.5) return 'bg-emerald-800/80 border-emerald-600 text-emerald-100 font-bold';
    if (ratio <= 0.75) return 'bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-md shadow-emerald-900/40';
    return 'bg-gradient-to-r from-emerald-500 to-teal-400 border-emerald-300 text-slate-950 font-black shadow-lg shadow-emerald-500/30 animate-pulse';
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Mapa de Calor: Operadores vs. Setores
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Frequência de Uso
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Análise de densidade e movimentação de ferramentas por setor operacional
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Período:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="month">Visão Mensal</option>
            <option value="7days">Últimos 7 dias</option>
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-semibold border-b border-slate-800 min-w-[130px]">
                Operador
              </th>
              {sectors.map((sec) => (
                <th
                  key={sec}
                  className="p-2 text-center text-slate-300 font-semibold border-b border-slate-800 min-w-[110px]"
                >
                  {sec}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr key={op} className="hover:bg-slate-900/80 transition-colors">
                <td className="p-2.5 font-medium text-slate-200 border-b border-slate-800/60">
                  {op}
                </td>
                {sectors.map((sec) => {
                  const count = matrix[op]?.[sec] || 0;
                  return (
                    <td key={sec} className="p-1.5 text-center border-b border-slate-800/60">
                      <div
                        className={`py-2 px-3 rounded-lg border text-xs transition-all duration-200 flex items-center justify-center ${getCellBgColor(
                          count
                        )}`}
                        title={`Operador ${op} realizou ${count} retirada(s) no setor ${sec}`}
                      >
                        {count > 0 ? `${count} retiradas` : '-'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Legenda de Intensidade:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-800" />
            <span>Sem registros</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-800" />
            <span>Baixa (1-2)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-700 border border-emerald-500" />
            <span>Média (3-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 border border-emerald-300" />
            <span>Alta (&gt;5)</span>
          </div>
        </div>
      </div>

    </section>
  );
};
