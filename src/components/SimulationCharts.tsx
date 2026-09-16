import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationMetricsPoint } from '../types/simulation';
import { TrendingUp, Layers, Flame, Scale } from 'lucide-react';

interface Props {
  data: SimulationMetricsPoint[];
  alarmThreshold: number;
}

export const SimulationCharts: React.FC<Props> = ({ data, alarmThreshold }) => {
  const [activeTab, setActiveTab] = useState<'artefactos' | 'marx' | 'infrapoder' | 'desigualdad'>('infrapoder');

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-[340px]">
      {/* Selector de pestañas temáticas */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 mb-3 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            id="tab-infrapoder"
            onClick={() => setActiveTab('infrapoder')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'infrapoder'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Infrapoder vs Huelga & Compliance</span>
          </button>

          <button
            id="tab-artefactos"
            onClick={() => setActiveTab('artefactos')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'artefactos'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Artefactos (Simon / Cioffi)</span>
          </button>

          <button
            id="tab-marx"
            onClick={() => setActiveTab('marx')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'marx'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tasa Ganancia & Salario Real</span>
          </button>

          <button
            id="tab-desigualdad"
            onClick={() => setActiveTab('desigualdad')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'desigualdad'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Gini & Cartel Patronal</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          {data.length} pasos simulados
        </span>
      </div>

      {/* Gráfico Recharts con alta precisión */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'infrapoder' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Line
                type="monotone"
                dataKey="compliancePercentage"
                name="% Asimilación (Compliance)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="simpleInfrapowerPercentage"
                name="% Infrapoder Simple (Scott)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="strikePercentage"
                name="% Huelga Abierta (Luxemburg)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="alfa"
                name="Presión Alfa (x100)"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          ) : activeTab === 'artefactos' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Line
                type="monotone"
                dataKey="exterior"
                name="Entorno Exterior (Statu Quo)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="interiorProletariat"
                name="Interior Proletario (Habitus)"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="discrepancy"
                name="Discrepancia (Alienación)"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          ) : activeTab === 'marx' ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <ReferenceLine y={0.08} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crisis Π', fill: '#ef4444', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="rateOfProfit"
                name="Tasa de Ganancia (Π)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="realWagePromedio"
                name="Salario Real Promedio"
                stroke="#10b981"
                strokeWidth={1.8}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="organicComposition"
                name="Composición Orgánica (c/v)"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          ) : (
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Line
                type="monotone"
                dataKey="gini"
                name="Coeficiente de Gini (Desigualdad)"
                stroke="#e11d48"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="capitalistCohesion"
                name="Cohesión Cartel Patronal"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
