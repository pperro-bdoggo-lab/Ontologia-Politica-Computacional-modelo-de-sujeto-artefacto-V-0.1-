import React, { useState } from 'react';
import { HistoricalEvent, SimulationMetricsPoint } from '../types/simulation';
import { Terminal, BookOpen, AlertCircle, Sparkles, Scroll } from 'lucide-react';

interface Props {
  events: HistoricalEvent[];
  history: SimulationMetricsPoint[];
}

export const SociologicalLog: React.FC<Props> = ({ events, history }) => {
  const [viewMode, setViewMode] = useState<'events' | 'terminal'>('events');

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col h-[340px]">
      {/* Cabecera con selector de modo */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-xs tracking-wide">
            BITÁCORA SOCIOLÓGICA & EVENTOS CRÍTICOS
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            id="btn-log-events"
            onClick={() => setViewMode('events')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 text-[11px] ${
              viewMode === 'events'
                ? 'bg-slate-800 text-slate-200 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3 text-sky-400" />
            <span>Eventos CSS ({events.length})</span>
          </button>
          <button
            id="btn-log-terminal"
            onClick={() => setViewMode('terminal')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 text-[11px] ${
              viewMode === 'terminal'
                ? 'bg-slate-800 text-emerald-300 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>Terminal P.Perro [-i]</span>
          </button>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {viewMode === 'events' ? (
          events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="w-6 h-6 mb-2 text-slate-600" />
              <p className="font-medium text-slate-400">Sin eventos críticos todavía</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Inicia la simulación para registrar bifurcaciones de régimen, crisis de rentabilidad o saltos de infrapoder colectivo.
              </p>
            </div>
          ) : (
            events.slice().reverse().map((event, idx) => (
              <div
                key={`${event.id}-${idx}`}
                className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-1.5 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                      Paso {event.step.toString().padStart(2, '0')}
                    </span>
                    {event.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    {event.author}
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {event.description}
                </p>

                <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60 text-[10px] text-slate-400 italic">
                  <strong className="text-slate-300 not-italic">Fundamento Teórico:</strong> {event.theoreticalNote}
                </div>
              </div>
            ))
          )
        ) : (
          /* Vista estilo Terminal clásico de Python como los scripts de P.Perro */
          <div className="font-mono text-[11px] p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 space-y-1">
            <div className="text-emerald-400 pb-1 border-b border-slate-800">
              --- SIMULACIÓN DE DINÁMICA DE CLASE Y COEVOLUCIÓN THE MACHINE [-i] ---
            </div>
            {history.slice(-25).map((point, idx) => (
              <div key={`hist-${point.step}-${idx}`} className="leading-tight hover:bg-slate-900/50 px-1 rounded">
                <span className="text-slate-500">Paso {point.step.toString().padStart(2, '0')}</span>
                {' -> '}
                <span className="text-sky-300">Int: {point.interiorProletariat.toFixed(2)}</span>
                {' | '}
                <span className="text-amber-300">Ext: {point.exterior.toFixed(1)}</span>
                {' | '}
                <span className="text-rose-400">Disc: {point.discrepancy.toFixed(1)}</span>
                {' | '}
                <span className="text-emerald-400">IP: {(point.infrapowerPromedio * 100).toFixed(1)}%</span>
                {' | '}
                <span className="text-purple-300">α: {point.alfa.toFixed(2)}</span>
                {' | '}
                <span className="text-orange-400">Π: {(point.rateOfProfit * 100).toFixed(1)}%</span>
                {' | '}
                <span className={point.regime === 'ALARMA_PUNITIVA' ? 'text-red-400 font-bold' : point.regime === 'CRISIS_ORGANICA' ? 'text-purple-400 font-bold' : 'text-emerald-300'}>
                  {point.regime === 'ALARMA_PUNITIVA' ? '🔴 ALARMA' : point.regime === 'CRISIS_ORGANICA' ? '⚡ CRISIS' : '🟢 CONSENSO'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
