import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  BookOpen,
  Download,
  Activity,
  Layers,
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../simulation/presets';

interface Props {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  currentStep: number;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenConfig: () => void;
  onOpenTheoreticalModal: () => void;
  onExportData: (format: 'csv' | 'json') => void;
}

export const Header: React.FC<Props> = ({
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  currentStep,
  speed,
  onChangeSpeed,
  selectedPresetId,
  onSelectPreset,
  onOpenConfig,
  onOpenTheoreticalModal,
  onExportData,
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Título y badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shadow">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-100 text-sm tracking-wide">
                  CSS Sim: Dinámicas de Clase & The Machine
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  ABM v5.0 [-i]
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ciencias Sociales Computacionales · Marxismo Heterodoxo · Scott · Weber · Simon
              </p>
            </div>
          </div>

          {/* Contador de Pasos en móvil */}
          <div className="md:hidden font-mono text-xs bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
            Paso: <strong className="text-amber-400">{currentStep}</strong>
          </div>
        </div>

        {/* Selector de Escenarios Prediseñados */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Escenario:</span>
          </div>
          <select
            id="preset-scenario-select"
            value={selectedPresetId}
            onChange={e => onSelectPreset(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 max-w-[260px] truncate"
          >
            {PRESET_SCENARIOS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controles de Simulación y Botones Auxiliares */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Contador de Pasos en Desktop */}
          <div className="hidden md:flex items-center font-mono text-xs bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 mr-1">
            <span className="text-slate-500 mr-1.5">Paso:</span>
            <strong className="text-amber-400">{currentStep}</strong>
          </div>

          {/* Botón Play / Pause */}
          <button
            id="btn-play-pause"
            onClick={onTogglePlay}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'Pausar' : 'Ejecutar'}</span>
          </button>

          {/* Botón Step (+1 paso) */}
          <button
            id="btn-step"
            onClick={onStep}
            disabled={isRunning}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
            title="Avanzar un paso discreto (t+1)"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paso</span>
          </button>

          {/* Botón Reset */}
          <button
            id="btn-reset"
            onClick={onReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
            title="Reiniciar simulación al estado inicial"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Selector de Velocidad */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[1, 2, 5].map(s => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 rounded transition ${
                  speed === s ? 'bg-slate-700 text-slate-100 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Botón Ajustes de Variables */}
          <button
            id="btn-open-config"
            onClick={onOpenConfig}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
            title="Ajustar parámetros sociológicos y económicos"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Botón Marco Teórico */}
          <button
            id="btn-open-theory"
            onClick={onOpenTheoreticalModal}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
            title="Consultar corpus teórico (Marx, Scott, Weber, Simon)"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>

          {/* Botón Exportar CSV */}
          <button
            id="btn-export-csv"
            onClick={() => onExportData('csv')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 transition"
            title="Exportar bitácora temporal a CSV para análisis en Python/Pandas"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
