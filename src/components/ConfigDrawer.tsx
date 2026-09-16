import React from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';
import { SimulationConfig } from '../types/simulation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  onResetToDefaults: () => void;
}

export const ConfigDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetToDefaults,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof SimulationConfig, value: number) => {
    onChangeConfig({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            <h2 className="font-bold text-sm text-slate-100">
              Variables del Modelo Predictivo (CSS)
            </h2>
          </div>
          <button
            id="btn-close-config"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario de Parámetros */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300 flex-1">
          {/* Grupo 1: The Machine & Coerción */}
          <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-xs flex items-center justify-between">
              <span>The Machine & Coerción (Simon/Gramsci)</span>
              <span className="text-[10px] font-mono text-amber-400 font-normal">
                α={config.alphaInitial.toFixed(2)}
              </span>
            </h3>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Presión Alfa Inicial (α)</span>
                <span className="font-mono text-slate-200">{config.alphaInitial.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.01"
                value={config.alphaInitial}
                onChange={e => handleChange('alphaInitial', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Umbral de Alarma de The Machine</span>
                <span className="font-mono text-slate-200">{(config.alarmThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.85"
                step="0.05"
                value={config.alarmThreshold}
                onChange={e => handleChange('alarmThreshold', parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Grupo 2: Infrapoder & Resistencia */}
          <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-xs flex items-center justify-between">
              <span>Infrapoder Subalterno (James C. Scott)</span>
              <span className="text-[10px] font-mono text-emerald-400 font-normal">
                [{config.infrapowerMin.toFixed(2)}, {config.infrapowerMax.toFixed(2)}]
              </span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block">Mínimo IP</span>
                <input
                  type="number"
                  min="0.0"
                  max="0.5"
                  step="0.05"
                  value={config.infrapowerMin}
                  onChange={e => handleChange('infrapowerMin', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block">Máximo IP</span>
                <input
                  type="number"
                  min="0.4"
                  max="1.0"
                  step="0.05"
                  value={config.infrapowerMax}
                  onChange={e => handleChange('infrapowerMax', parseFloat(e.target.value) || 0.77)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Grupo 3: Afinidad Electiva & Red */}
          <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-xs flex items-center justify-between">
              <span>Afinidad Electiva (Weber / Löwy)</span>
              <span className={`text-[10px] font-mono font-bold ${
                config.phiBase > 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                φ = {config.phiBase > 0 ? `+${config.phiBase.toFixed(2)}` : config.phiBase.toFixed(2)}
              </span>
            </h3>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Afinidad Electiva Base (φ ∈ [-1, +1])</span>
                <span className="font-mono text-slate-200">{config.phiBase.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.9"
                max="0.9"
                step="0.05"
                value={config.phiBase}
                onChange={e => handleChange('phiBase', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Disonancia (Frag.)</span>
                <span>Indiferencia</span>
                <span>Resonancia (Pot.)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Radio de Interacción Espacial</span>
                <span className="font-mono text-slate-200">{config.spatialRadius} px</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={config.spatialRadius}
                onChange={e => handleChange('spatialRadius', parseInt(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Grupo 4: Economía Política Marxista */}
          <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <h3 className="font-bold text-slate-200 text-xs">
              Economía Política (Karl Marx)
            </h3>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Velocidad de Mecanización (Aumento de c)</span>
                <span className="font-mono text-slate-200">{config.mechanizationSpeed.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={config.mechanizationSpeed}
                onChange={e => handleChange('mechanizationSpeed', parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Salario Base de Reproducción (v)</span>
                <span className="font-mono text-slate-200">{config.baseWage.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={config.baseWage}
                onChange={e => handleChange('baseWage', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Pie */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <button
            id="btn-reset-defaults"
            onClick={onResetToDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Valores
          </button>
          <button
            id="btn-apply-config"
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <Check className="w-3.5 h-3.5" />
            Aplicar Parámetros
          </button>
        </div>
      </div>
    </div>
  );
};
