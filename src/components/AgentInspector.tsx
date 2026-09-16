import React from 'react';
import { Agent, SocialClass, ActionTactic } from '../types/simulation';
import { User, Cpu, Flame, Activity, Zap, Shield, ArrowUpRight } from 'lucide-react';

interface Props {
  agent: Agent | null;
  exterior: number;
  alpha: number;
  onTriggerResistance?: (agentId: string) => void;
  onToggleStrike?: (agentId: string) => void;
}

export const AgentInspector: React.FC<Props> = ({
  agent,
  exterior,
  alpha,
  onTriggerResistance,
  onToggleStrike,
}) => {
  if (!agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-500">
        <User className="w-10 h-10 mb-3 text-slate-600 stroke-[1.5]" />
        <p className="font-semibold text-slate-400">Ningún agente seleccionado</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Haz clic en cualquier artefacto-sujeto del campo social para analizar sus dinámicas de clase e infrapoder.
        </p>
      </div>
    );
  }

  const isProletariat =
    agent.socialClass === SocialClass.PROLETARIAT ||
    agent.socialClass === SocialClass.RESERVE_ARMY;

  return (
    <div className="h-full flex flex-col bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Cabecera del Inspector */}
      <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow ${
            agent.socialClass === SocialClass.CAPITALIST
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : agent.socialClass === SocialClass.TECHNOCRACY
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : agent.isStriking
              ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
          }`}>
            {agent.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              {agent.name}
              {agent.isStriking && (
                <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                  EN HUELGA
                </span>
              )}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {agent.socialClass === SocialClass.PROLETARIAT && 'Subalterno / Proletariado'}
              {agent.socialClass === SocialClass.CAPITALIST && 'Capitalista / Poseedor de Medios'}
              {agent.socialClass === SocialClass.TECHNOCRACY && 'Aparato Burocrático Hegemónico'}
              {agent.socialClass === SocialClass.RESERVE_ARMY && 'Ejército Industrial de Reserva'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* 1. Módulo Simon / Cioffi-Revilla: Artefacto y Discrepancia */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
              Adaptación del Artefacto (Simon)
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Discrepancia: {agent.alienation.toFixed(1)}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Entorno Interior (Habitus / Asimilación)</span>
              <span className="font-mono text-slate-200">{agent.interior.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, (agent.interior / exterior) * 100))}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1 text-slate-400 border-t border-slate-800/80">
            <span>Presión Exterior (Statu Quo): <strong className="text-slate-200 font-mono">{exterior.toFixed(1)}</strong></span>
            <span>Tasa α: <strong className="text-amber-400 font-mono">{alpha.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* 2. Módulo James C. Scott: Resistencia de Infrapoder */}
        {isProletariat && (
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Flame className="w-3.5 h-3.5" />
                Infrapoder Subalterno (J.C. Scott)
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {(agent.infrapowerEffective * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Infrapoder Crudo:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {(agent.infrapowerRaw * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block">Resistencia individual</span>
              </div>
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Efectivo Colectivo:</span>
                <span className="font-mono font-semibold text-emerald-300">
                  {(agent.infrapowerEffective * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block">Modulado por afinidad</span>
              </div>
            </div>

            {/* Afinidad electiva */}
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Afinidad Electiva Local (φ):</span>
                <span className={`font-mono font-bold ${
                  agent.activePhi > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {agent.activePhi > 0 ? `+${agent.activePhi.toFixed(2)}` : agent.activePhi.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 italic">
                "{agent.affinityDescription}"
              </p>
              <span className="text-[10px] text-slate-500 block">
                Vecinos en red de contacto: {agent.neighborsCount}
              </span>
            </div>
          </div>
        )}

        {/* 3. Conciencia de Clase y Economía Política Marxista */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Activity className="w-3.5 h-3.5" />
              Economía Política & Conciencia
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {agent.tactic}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Conciencia de Clase (Klasse für sich)</span>
              <span className="font-mono text-slate-200">{(agent.classConsciousness * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${agent.classConsciousness * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
              <span className="text-slate-500 text-[10px] block">Capital / Ahorro</span>
              <span className="font-mono font-bold text-slate-200">{agent.capital.toFixed(1)}</span>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
              <span className="text-slate-500 text-[10px] block">Fuerza Trabajo</span>
              <span className="font-mono font-bold text-slate-200">{agent.laborPower.toFixed(1)}</span>
            </div>
            <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-center">
              <span className="text-slate-500 text-[10px] block">Salario (v)</span>
              <span className="font-mono font-bold text-slate-200">{agent.wage.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Acciones interactivas experimentales sobre el agente */}
        {isProletariat && (
          <div className="pt-2 flex gap-2">
            {onTriggerResistance && (
              <button
                id="btn-trigger-infrapower"
                onClick={() => onTriggerResistance(agent.id)}
                className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                Ejercer Infrapoder Máx
              </button>
            )}
            {onToggleStrike && (
              <button
                id="btn-toggle-strike"
                onClick={() => onToggleStrike(agent.id)}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                  agent.isStriking
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                {agent.isStriking ? 'Reanudar Trabajo' : 'Convocar Huelga'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
