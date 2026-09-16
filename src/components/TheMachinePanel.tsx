import React from 'react';
import { TheMachineState, SystemRegime } from '../types/simulation';
import {
  Eye,
  TrendingDown,
  Percent,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Cpu,
  Flame,
  ShieldAlert,
  Users,
  Sparkles,
} from 'lucide-react';

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
    <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 shadow-lg flex flex-col justify-between gap-4">
      {/* Cabecera del Régimen */}
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
                THE MACHINE & APARATO HEGEMÓNICO
              </h3>
              <p className="text-[11px] text-slate-400">
                Homeostasis sistémica, salario real, cartel patronal y coerción (alfa)
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isCrisis
              ? 'bg-purple-950/80 text-purple-300 border-purple-500/40 animate-pulse'
              : isAlarm
              ? 'bg-red-950/80 text-red-300 border-red-500/40 animate-bounce'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            {isCrisis ? (
              <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            ) : isAlarm ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>
              {isCrisis ? 'CRISIS ORGÁNICA' : isAlarm ? 'ALARMA PUNITIVA' : 'CONSENSO HEGEMÓNICO'}
            </span>
          </div>
        </div>

        {/* 1. Rejilla de métricas sociológicas y macroeconómicas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Presión Alfa */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] block">Presión Coercitiva (α)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-amber-300">
                {machine.alfa.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500">tasa asimilación</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (machine.alfa / 0.65) * 100)}%` }}
              />
            </div>
          </div>

          {/* Salario Real Promedio */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Salario Real Promedio</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-emerald-300">
                {machine.averageRealWage.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">poder adquisitivo</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {machine.averageRealWage >= 5.0 ? 'Estabiliza el sistema' : 'Tensión distributiva'}
            </span>
          </div>

          {/* Tasa de Ganancia (Π) */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Tasa de Ganancia (Π)</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`font-mono text-base font-bold ${
                machine.rateOfProfit < 0.08 ? 'text-rose-400 font-extrabold' : 'text-slate-200'
              }`}>
                {(machine.rateOfProfit * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">s/(c+v)</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 truncate">
              {machine.rateOfProfit < 0.08 ? 'Alerta caída de rentabilidad' : 'Acumulación fluida'}
            </span>
          </div>

          {/* Cartel Patronal & Aura de RP */}
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>Capital: Cluster & RP</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-amber-300">
                {(machine.capitalistClusterCohesion * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">cohesión</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Aura RP: {machine.capitalistAuraRadius.toFixed(0)}px
            </span>
          </div>
        </div>

        {/* 2. SEGMENTACIÓN SOCIOLÓGICA: Compliance vs Infrapoder Simple vs Huelga Abierta */}
        <div className="mt-3 p-3 bg-slate-950/60 rounded-lg border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              Segmentación de Acción Colectiva (Homeostasis vs Disenso)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Scott / Luxemburg / Bourdieu
            </span>
          </div>

          {/* Barra segmentada tripartita */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${machine.complianceParticipation * 100}%` }}
              title={`Asimilación / Compliance: ${(machine.complianceParticipation * 100).toFixed(1)}%`}
            />
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${machine.simpleInfrapowerParticipation * 100}%` }}
              title={`Infrapoder Simple: ${(machine.simpleInfrapowerParticipation * 100).toFixed(1)}%`}
            />
            <div
              className="bg-red-500 h-full transition-all duration-300 animate-pulse"
              style={{ width: `${machine.strikeParticipation * 100}%` }}
              title={`Huelga Abierta: ${(machine.strikeParticipation * 100).toFixed(1)}%`}
            />
          </div>

          {/* Leyenda con valores porcentuales */}
          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-slate-400">Asimilación:</span>
              <strong className="font-mono text-sky-300">{(machine.complianceParticipation * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Infrapoder Simple:</span>
              <strong className="font-mono text-emerald-300">{(machine.simpleInfrapowerParticipation * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-400">Huelga Abierta:</span>
              <strong className="font-mono text-red-400">{(machine.strikeParticipation * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* 3. Infrapoder agregado vs Umbral y Gini */}
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300 mb-1 text-[11px]">
              <span>Tensión Agregada (Umbral {(alarmThreshold * 100).toFixed(0)}%)</span>
              <span className="font-mono font-bold text-slate-200">
                {(machine.averageInfrapower * 100).toFixed(1)}%
              </span>
            </div>
            <div className="relative w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAlarm ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, machine.averageInfrapower * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-2 bg-slate-950/40 rounded border border-slate-800/80">
            <div className="flex justify-between items-center text-slate-300 mb-1 text-[11px]">
              <span>Desigualdad (Gini) & Comp. c/v</span>
              <span className="font-mono font-bold text-slate-200">
                Gini: {machine.giniCoefficient.toFixed(3)} | c/v: {machine.organicComposition.toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${machine.giniCoefficient * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Palancas de Intervención Sociológica */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">
          Intervenciones:
        </span>
        <button
          id="btn-concession"
          onClick={onApplyConcession}
          className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1.5"
          title="Aumentar salario real para apaciguar el conflicto y acelerar la homeostasis (Gramsci)"
        >
          <DollarSign className="w-3.5 h-3.5" />
          Aumento Salarial Real (+Concesión)
        </button>
        <button
          id="btn-intensify"
          onClick={onIntensifyDiscipline}
          className="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900/90 text-amber-300 border border-amber-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1.5"
          title="Intensificar la acción represiva de The Machine: elevar alfa para sofocar la huelga"
        >
          <Percent className="w-3.5 h-3.5" />
          Despliegue Represivo (Alfa +0.10)
        </button>
        <button
          id="btn-mechanize"
          onClick={onBoostMechanization}
          className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/40 rounded-lg font-medium transition active:scale-95 flex items-center gap-1.5"
          title="Aumentar capital constante c para elevar la composición orgánica c/v"
        >
          <Cpu className="w-3.5 h-3.5" />
          Mecanización Tecnológica (c)
        </button>
      </div>
    </div>
  );
};
