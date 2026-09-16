import React from 'react';
import { TheMachineState, SystemRegime } from '../types/simulation';
import { Eye, TrendingDown, Percent, DollarSign, AlertTriangle, ShieldCheck, Scale, Cpu } from 'lucide-react';

interface Props {
  machine: TheMachineState;
  alarmThreshold: number;
  onApplyConcession: () => void;
  onIntensifyDiscipline: () => void;
  onBoostMechanization: () => void;
}

export const TheMachinePanel: React.FC<Props> = ({
  machine,
  alarmThreshold,
  onApplyConcession,
  onIntensifyDiscipline,
  onBoostMechanization,
}) => {
  const isAlarm = machine.regime === SystemRegime.ALARMA_PUNITIVA;
  const isCrisis = machine.regime === SystemRegime.CRISIS_ORGANICA;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col justify-between gap-4">
      {/* Estado del Régimen Sistémico */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              isCrisis
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : isAlarm
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide">
                THE MACHINE / APARATO HEGEMÓNICO
              </h3>
              <p className="text-[11px] text-slate-400">
                Coevolución sistémica, presión de asimilación (alfa) y acumulación
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isCrisis
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40 animate-pulse'
              : isAlarm
              ? 'bg-red-950/80 text-red-300 border-red-500/40'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            {isCrisis ? (
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            ) : isAlarm ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>
              {isCrisis ? 'CRISIS ORGÁNICA' : isAlarm ? 'ALARMA PUNITIVA' : 'CONSENSO HEGEMÓNICO'}
            </span>
          </div>
        </div>

        {/* Rejilla de métricas sociológicas y económicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Presión Alfa */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Presión Alfa (α)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-amber-300">
                {machine.alfa.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500">tasa asimilación</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (machine.alfa / 0.65) * 100)}%` }}
              />
            </div>
          </div>

          {/* 2. Entorno Exterior */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Entorno Exterior (Statu Quo)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-sky-300">
                {machine.exterior.toFixed(1)}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {machine.movementExterior >= 0 ? `+${machine.movementExterior.toFixed(1)}` : machine.movementExterior.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {machine.movementExterior > 0 ? 'Castigo: Exterior se aleja' : 'Concesión: Exterior se acerca'}
            </span>
          </div>

          {/* 3. Tasa de Ganancia General (TRPF) */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Tasa de Ganancia (Π)</span>
              <TrendingDown className="w-3 h-3 text-rose-400" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-mono text-base font-bold ${
                machine.rateOfProfit < 0.08 ? 'text-rose-400 font-extrabold' : 'text-slate-200'
              }`}>
                {(machine.rateOfProfit * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Π = s/(c+v)</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {machine.rateOfProfit < 0.08 ? '⚠️ Umbral de crisis de rentabilidad' : 'Reproducción estable'}
            </span>
          </div>

          {/* 4. Composición Orgánica c/v */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Comp. Orgánica (c/v)</span>
              <Cpu className="w-3 h-3 text-indigo-400" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-indigo-300">
                {machine.organicComposition.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">ratio tecno/vivo</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              c: {machine.constantCapital.toFixed(0)} | v: {machine.variableCapital.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Barras de Infrapoder Colectivo vs Umbral de Alarma y Desigualdad */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
          <div>
            <div className="flex justify-between items-center text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isAlarm ? 'bg-red-500' : 'bg-emerald-500'}`} />
                Infrapoder Colectivo Subalterno
              </span>
              <span className="font-mono font-bold text-slate-200">
                {(machine.averageInfrapower * 100).toFixed(1)}% / {(alarmThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAlarm ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, machine.averageInfrapower * 100)}%` }}
              />
              {/* Marcador del umbral de alarma */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
                style={{ left: `${alarmThreshold * 100}%` }}
                title="Umbral de Alarma"
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {machine.averageInfrapower > alarmThreshold
                ? '🔴 Supera el umbral: The Machine incrementa presión alfa (+0.05)'
                : '🟢 Bajo control: The Machine relaja coerción (-0.05)'}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Coeficiente de Gini & Huelgas
              </span>
              <span className="font-mono font-bold text-slate-200">
                Gini: {machine.giniCoefficient.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${machine.giniCoefficient * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Participación en Huelga Activa: <strong className="text-slate-300 font-mono">{(machine.strikeParticipation * 100).toFixed(1)}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Palancas de Intervención Sociológica de The Machine */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">
          Intervenciones Sistémicas:
        </span>
        <button
          id="btn-concession"
          onClick={onApplyConcession}
          className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1"
          title="Conceder aumentos salariales para reducir la discrepancia y apaciguar el infrapoder (Gramsci)"
        >
          <DollarSign className="w-3 h-3" />
          Concesión Salarial Hegemónica
        </button>
        <button
          id="btn-intensify"
          onClick={onIntensifyDiscipline}
          className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1"
          title="Intensificar vigilancia disciplinaria: elevar alfa directamente"
        >
          <Percent className="w-3 h-3" />
          Acelerar Presión Alfa (+0.10)
        </button>
        <button
          id="btn-mechanize"
          onClick={onBoostMechanization}
          className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1"
          title="Inversión masiva en automatización: acelera composición orgánica c/v"
        >
          <Cpu className="w-3 h-3" />
          Inyectar Automatización (c)
        </button>
      </div>
    </div>
  );
};
