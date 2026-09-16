import React, { useRef, useEffect, useState } from 'react';
import { Agent, SocialClass, TheMachineState, SystemRegime } from '../types/simulation';
import { Eye, ShieldAlert, Zap, Radio, Info } from 'lucide-react';

interface Props {
  agents: Agent[];
  machine: TheMachineState;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  spatialRadius: number;
}

export const SocialFieldCanvas: React.FC<Props> = ({
  agents,
  machine,
  selectedAgentId,
  onSelectAgent,
  spatialRadius,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);

  // Resize observer para tamaño responsivo del canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(300, Math.floor(rect.width)),
          height: Math.max(350, Math.floor(rect.height)),
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Renderizado del Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    // Fondo del espacio social (rejilla sutil de coordenadas)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Líneas de cuadrícula sutiles
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.6;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dibujar enlaces de afinidad electiva φ entre proletarios cercanos
    const proletarians = agents.filter(
      a => a.socialClass === SocialClass.PROLETARIAT || a.socialClass === SocialClass.RESERVE_ARMY
    );

    const radiusPx = (spatialRadius / 100) * Math.min(width, height);

    for (let i = 0; i < proletarians.length; i++) {
      const a1 = proletarians[i];
      const x1 = (a1.x / 100) * width;
      const y1 = (a1.y / 100) * height;

      for (let j = i + 1; j < proletarians.length; j++) {
        const a2 = proletarians[j];
        const x2 = (a2.x / 100) * width;
        const y2 = (a2.y / 100) * height;

        const dist = Math.hypot(x2 - x1, y2 - y1);
        if (dist <= radiusPx) {
          const avgPhi = (a1.activePhi + a2.activePhi) / 2;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);

          if (avgPhi > 0.15) {
            // Resonancia (Weber/Löwy): Verde/Cian brillante
            ctx.strokeStyle = `rgba(16, 185, 129, ${Math.min(0.8, avgPhi * 0.9)})`;
            ctx.lineWidth = 1.2 + avgPhi * 1.5;
            ctx.setLineDash([]);
          } else if (avgPhi < -0.15) {
            // Disonancia: Rojo punteado
            ctx.strokeStyle = `rgba(239, 68, 68, ${Math.min(0.7, Math.abs(avgPhi) * 0.8)})`;
            ctx.lineWidth = 1.0;
            ctx.setLineDash([4, 4]);
          } else {
            // Indiferencia
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = 0.5;
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    // Renderizar Agentes
    agents.forEach(agent => {
      const px = (agent.x / 100) * width;
      const py = (agent.y / 100) * height;
      const isSelected = agent.id === selectedAgentId;
      const isHovered = agent.id === hoveredAgent?.id;

      // Halo de Infrapoder efectivo (Scott)
      if (agent.infrapowerEffective > 0.2) {
        ctx.beginPath();
        const haloRadius = 8 + agent.infrapowerEffective * 14;
        const gradient = ctx.createRadialGradient(px, py, 4, px, py, haloRadius);

        if (agent.isStriking) {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        } else if (agent.activePhi > 0.2) {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
        } else {
          gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
          gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        }
        ctx.fillStyle = gradient;
        ctx.arc(px, py, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Anillo de Selección
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Cuerpo del Agente según Clase Social
      ctx.beginPath();
      let nodeRadius = 6;

      if (agent.socialClass === SocialClass.CAPITALIST) {
        nodeRadius = 10;
        ctx.fillStyle = '#f59e0b'; // Ámbar burgués
        ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (agent.socialClass === SocialClass.TECHNOCRACY) {
        nodeRadius = 7;
        ctx.fillStyle = '#8b5cf6'; // Púrpura tecnocrático
        ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4b5fd';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (agent.socialClass === SocialClass.RESERVE_ARMY) {
        nodeRadius = 4.5;
        ctx.fillStyle = '#64748b'; // Pizarra precarizado
        ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // PROLETARIAT
        nodeRadius = 6.5;
        if (agent.isStriking) {
          ctx.fillStyle = '#ef4444'; // Huelga resonante
        } else if (agent.activePhi > 0.3) {
          ctx.fillStyle = '#10b981'; // En resonancia
        } else if (agent.activePhi < -0.2) {
          ctx.fillStyle = '#94a3b8'; // Disonante/alienado
        } else {
          ctx.fillStyle = '#0ea5e9'; // Proletario estándar
        }
        ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Etiqueta del nombre (solo si seleccionado, hovered o en dúo)
      if (isSelected || isHovered || agents.length <= 4) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, px, py - 12);

        // Indicador de IP
        ctx.font = '500 9px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`IP: ${(agent.infrapowerEffective * 100).toFixed(0)}%`, px, py + 18);
      }
    });

    // Decoración de The Machine: Radar/Ojo hegemónico en el cielo del espacio
    const machineY = 24;
    const machineX = width / 2;
    ctx.beginPath();
    ctx.arc(machineX, machineY, 14, 0, Math.PI * 2);
    if (machine.regime === SystemRegime.CRISIS_ORGANICA) {
      ctx.fillStyle = '#7e22ce';
      ctx.strokeStyle = '#ef4444';
    } else if (machine.regime === SystemRegime.ALARMA_PUNITIVA) {
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#f87171';
    } else {
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#34d399';
    }
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Pulso expansivo del radar
    ctx.beginPath();
    ctx.arc(machineX, machineY, 24 + (Date.now() % 1000) / 40, 0, Math.PI * 2);
    ctx.strokeStyle =
      machine.regime === SystemRegime.ALARMA_PUNITIVA
        ? 'rgba(239, 68, 68, 0.3)'
        : 'rgba(52, 211, 153, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [agents, machine, selectedAgentId, hoveredAgent, dimensions, spatialRadius]);

  // Manejo de clicks en el canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { width, height } = dimensions;

    // Buscar agente más cercano al click
    let closestAgent: Agent | null = null;
    let minDistance = 25; // Radio de tolerancia de click

    for (const agent of agents) {
      const px = (agent.x / 100) * width;
      const py = (agent.y / 100) * height;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDistance) {
        minDistance = dist;
        closestAgent = agent;
      }
    }

    if (closestAgent) {
      onSelectAgent(closestAgent.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { width, height } = dimensions;
    let found: Agent | null = null;
    for (const agent of agents) {
      const px = (agent.x / 100) * width;
      const py = (agent.y / 100) * height;
      if (Math.hypot(mouseX - px, mouseY - py) < 18) {
        found = agent;
        break;
      }
    }
    setHoveredAgent(found);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Barra de cabecera del Canvas con leyenda */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Campo Social & Red de Afinidad
          </span>
          <span className="hidden sm:inline text-slate-400">
            N = {agents.length} agentes interactuando
          </span>
        </div>

        {/* Leyenda de colores de clases y afinidad */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-400">Burguesía</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span className="text-slate-400">Proletariado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-400">Resonancia (φ&gt;0)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-slate-400">Huelga</span>
          </div>
        </div>
      </div>

      {/* Contenedor del Canvas */}
      <div ref={containerRef} className="relative flex-1 w-full h-full min-h-[380px] cursor-crosshair">
        <canvas
          id="social-field-canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgent(null)}
          className="w-full h-full block"
        />

        {/* Badge flotante de The Machine en la parte superior del Canvas */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur shadow-lg text-xs">
          <Eye className={`w-3.5 h-3.5 ${
            machine.regime === SystemRegime.ALARMA_PUNITIVA
              ? 'text-red-400 animate-bounce'
              : machine.regime === SystemRegime.CRISIS_ORGANICA
              ? 'text-purple-400 animate-pulse'
              : 'text-emerald-400'
          }`} />
          <span className="font-semibold text-slate-200">The Machine</span>
          <span className="text-slate-400">|</span>
          <span className="font-mono text-slate-300">α = {machine.alfa.toFixed(2)}</span>
          <span className="text-slate-400">|</span>
          <span className={`font-medium ${
            machine.regime === SystemRegime.ALARMA_PUNITIVA ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {machine.regime === SystemRegime.ALARMA_PUNITIVA ? 'ALARMA PUNITIVA' : 'CONSENSO'}
          </span>
        </div>

        {/* Tooltip de agente al hacer hover */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none px-3 py-2 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl text-xs z-30"
            style={{
              left: `${Math.min(dimensions.width - 150, Math.max(10, (hoveredAgent.x / 100) * dimensions.width + 15))}px`,
              top: `${Math.min(dimensions.height - 90, Math.max(10, (hoveredAgent.y / 100) * dimensions.height - 20))}px`,
            }}
          >
            <p className="font-bold text-slate-100 flex items-center justify-between gap-2">
              <span>{hoveredAgent.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{hoveredAgent.socialClass}</span>
            </p>
            <p className="text-slate-300 font-mono text-[11px] mt-1">
              Interior: {hoveredAgent.interior.toFixed(1)} | Discrepancia: {hoveredAgent.alienation.toFixed(1)}
            </p>
            <p className="text-slate-400 font-mono text-[11px]">
              Infrapoder Efectivo: {(hoveredAgent.infrapowerEffective * 100).toFixed(0)}%
            </p>
            <p className="text-emerald-400 text-[10px] mt-0.5 font-medium">
              {hoveredAgent.affinityDescription}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Haz clic sobre cualquier agente para inspeccionar su telemetría sociológica individual.
        </span>
        <span className="font-mono text-slate-500">
          Radio de afinidad: {spatialRadius}%
        </span>
      </div>
    </div>
  );
};
