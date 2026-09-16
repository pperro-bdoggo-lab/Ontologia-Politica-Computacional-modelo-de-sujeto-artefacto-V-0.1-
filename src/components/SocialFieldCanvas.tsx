import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Agent, SocialClass, TheMachineState, SystemRegime, ActionTactic } from '../types/simulation';
import {
  Eye,
  Radio,
  Sparkles,
  Users,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

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
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [hoveredAgent, setHoveredAgent] = useState<Agent | null>(null);
  const [showAuraRP, setShowAuraRP] = useState<boolean>(true);

  // Controles de navegación, zoom y desplazamiento (Pan & Scroll)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Resize observer para tamaño responsivo del canvas sin desbordamientos rígidos
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const w = Math.max(260, Math.floor(rect.width));
        const h = Math.max(240, Math.floor(rect.height));
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, parseFloat((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.6, parseFloat((prev - 0.15).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePan = (dx: number, dy: number) => {
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  // Manejador de scroll con rueda: zoom con Ctrl/Cmd o scroll horizontal con Shift.
  // No intercepta el scroll vertical normal de la página para que el usuario pueda desplazarse con libertad.
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom(prev => Math.min(2.5, Math.max(0.6, parseFloat((prev + delta).toFixed(2)))));
    } else if (e.shiftKey) {
      e.preventDefault();
      setPan(prev => ({ ...prev, x: prev.x - e.deltaY * 0.8 }));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Bucle de animación continuo y renderizado del Sistema Nodal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      // Fondo del espacio social
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, width, height);

      // Aplicar transformación de Zoom y Desplazamiento (Pan)
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Líneas de cuadrícula sutiles
      ctx.strokeStyle = '#131d2e';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const isAlarmOrCrisis =
        machine.regime === SystemRegime.ALARMA_PUNITIVA ||
        machine.regime === SystemRegime.CRISIS_ORGANICA;

      const capitalists = agents.filter(a => a.socialClass === SocialClass.CAPITALIST);
      const subalterns = agents.filter(
        a => a.socialClass === SocialClass.PROLETARIAT || a.socialClass === SocialClass.RESERVE_ARMY
      );

      const now = Date.now();

      // 1. DIBUJAR AURA DE NORMALIZACIÓN Y RP DEL CAPITAL (Ámbar / Oro)
      if (showAuraRP && capitalists.length > 0) {
        const auraRadiusPx = (machine.capitalistAuraRadius / 100) * Math.min(width, height);

        // Si están en alarma y cohesionados como cartel patronal, dibujar halo envolvente del cluster
        if (isAlarmOrCrisis && machine.capitalistClusterCohesion > 0.4) {
          const capAvgX = capitalists.reduce((s, c) => s + (c.x / 100) * width, 0) / capitalists.length;
          const capAvgY = capitalists.reduce((s, c) => s + (c.y / 100) * height, 0) / capitalists.length;
          const pulse = Math.sin(now / 400) * 4;
          const clusterRadius = Math.max(30, auraRadiusPx * 1.35 + pulse);

          const clusterGrad = ctx.createRadialGradient(capAvgX, capAvgY, 20, capAvgX, capAvgY, clusterRadius);
          clusterGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
          clusterGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.09)');
          clusterGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

          ctx.beginPath();
          ctx.arc(capAvgX, capAvgY, clusterRadius, 0, Math.PI * 2);
          ctx.fillStyle = clusterGrad;
          ctx.fill();

          // Borde punteado del cartel patronal
          ctx.beginPath();
          ctx.arc(capAvgX, capAvgY, clusterRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1.3;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Auras individuales de cada capitalista
        for (const cap of capitalists) {
          const cx = (cap.x / 100) * width;
          const cy = (cap.y / 100) * height;

          const auraGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, auraRadiusPx);
          auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
          auraGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.07)');
          auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

          ctx.beginPath();
          ctx.arc(cx, cy, auraRadiusPx, 0, Math.PI * 2);
          ctx.fillStyle = auraGrad;
          ctx.fill();

          // Línea tenue de frontera del aura de RP
          ctx.beginPath();
          ctx.arc(cx, cy, auraRadiusPx, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Hilos de influencia ideológica y RP desde capitalistas hacia subalternos cooptados
        for (const sub of subalterns) {
          if (sub.capitalistAuraExposure > 0.15) {
            const sx = (sub.x / 100) * width;
            const sy = (sub.y / 100) * height;

            let nearestCap: Agent | null = null;
            let minDist = Infinity;
            for (const cap of capitalists) {
              const cx = (cap.x / 100) * width;
              const cy = (cap.y / 100) * height;
              const d = Math.hypot(cx - sx, cy - sy);
              if (d < minDist) {
                minDist = d;
                nearestCap = cap;
              }
            }

            if (nearestCap && minDist <= auraRadiusPx) {
              const cx = (nearestCap.x / 100) * width;
              const cy = (nearestCap.y / 100) * height;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(sx, sy);
              ctx.strokeStyle = `rgba(251, 191, 36, ${Math.min(0.4, sub.capitalistAuraExposure * 0.45)})`;
              ctx.lineWidth = 0.8;
              ctx.setLineDash([3, 5]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }

      // 2. ENLACES NODALES DE AFINIDAD ELECTIVA (Weber / Löwy) ENTRE SUBALTERNOS
      const radiusPx = (spatialRadius / 100) * Math.min(width, height);

      for (let i = 0; i < subalterns.length; i++) {
        const a1 = subalterns[i];
        const x1 = (a1.x / 100) * width;
        const y1 = (a1.y / 100) * height;

        for (let j = i + 1; j < subalterns.length; j++) {
          const a2 = subalterns[j];
          const x2 = (a2.x / 100) * width;
          const y2 = (a2.y / 100) * height;

          const dist = Math.hypot(x2 - x1, y2 - y1);
          if (dist <= radiusPx) {
            const avgPhi = (a1.activePhi + a2.activePhi) / 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            if (a1.isStriking && a2.isStriking) {
              // Piquete de huelga conjunta: Línea roja sólida pulsante
              const strikePulse = 1.8 + Math.sin(now / 120) * 0.7;
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
              ctx.lineWidth = strikePulse;
              ctx.setLineDash([]);
              ctx.stroke();

              // Partícula de chispa fluyendo por el piquete
              const t = (now % 800) / 800;
              const px = x1 + (x2 - x1) * t;
              const py = y1 + (y2 - y1) * t;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#fca5a5';
              ctx.fill();
            } else if (avgPhi > 0.15) {
              // Resonancia: Verde/Esmeralda viva
              ctx.strokeStyle = `rgba(16, 185, 129, ${Math.min(0.85, 0.3 + avgPhi * 0.65)})`;
              ctx.lineWidth = 1.2 + avgPhi * 1.4;
              ctx.setLineDash([]);
              ctx.stroke();

              // Pulso de afinidad iónica
              const t = ((now + i * 200) % 1200) / 1200;
              const px = x1 + (x2 - x1) * t;
              const py = y1 + (y2 - y1) * t;
              ctx.beginPath();
              ctx.arc(px, py, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = '#6ee7b7';
              ctx.fill();
            } else if (avgPhi < -0.15) {
              // Disonancia: Punteado rojo tenue
              ctx.strokeStyle = `rgba(239, 68, 68, ${Math.min(0.5, Math.abs(avgPhi) * 0.6)})`;
              ctx.lineWidth = 0.8;
              ctx.setLineDash([3, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            } else {
              // Indiferencia
              ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
              ctx.lineWidth = 0.5;
              ctx.setLineDash([]);
              ctx.stroke();
            }
          }
        }
      }

      // 3. RENDERIZAR AGENTES (NODOS DEL SISTEMA)
      agents.forEach(agent => {
        const px = (agent.x / 100) * width;
        const py = (agent.y / 100) * height;
        const isSelected = agent.id === selectedAgentId;
        const isHovered = agent.id === hoveredAgent?.id;

        // Halo según táctica y resistencia
        if (agent.isStriking) {
          // HUELGA RESONANTE: Halo de fuego rojo pulsante
          ctx.beginPath();
          const strikeHalo = 13 + Math.sin(now / 150) * 3.5;
          const grad = ctx.createRadialGradient(px, py, 4, px, py, strikeHalo);
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          grad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          ctx.fillStyle = grad;
          ctx.arc(px, py, strikeHalo, 0, Math.PI * 2);
          ctx.fill();
        } else if (agent.tactic === ActionTactic.INFRAPODER_MICROSCOPICO) {
          // INFRAPODER SIMPLE: Halo esmeralda/cian suave
          ctx.beginPath();
          const ipHalo = 7 + agent.infrapowerEffective * 11;
          const grad = ctx.createRadialGradient(px, py, 3, px, py, ipHalo);
          grad.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
          grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          ctx.fillStyle = grad;
          ctx.arc(px, py, ipHalo, 0, Math.PI * 2);
          ctx.fill();
        } else if (agent.capitalistAuraExposure > 0.3 && (agent.socialClass === SocialClass.PROLETARIAT || agent.socialClass === SocialClass.RESERVE_ARMY)) {
          // IDENTIFICACIÓN CON EL CAPITAL: Halo dorado fino de RP
          ctx.beginPath();
          const rpHalo = 8 + agent.capitalistAuraExposure * 7;
          const grad = ctx.createRadialGradient(px, py, 3, px, py, rpHalo);
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          ctx.fillStyle = grad;
          ctx.arc(px, py, rpHalo, 0, Math.PI * 2);
          ctx.fill();
        }

        // Anillo de Selección
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(px, py, 15, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Cuerpo del Agente según Clase Social
        ctx.beginPath();
        let nodeRadius = 6.5;

        if (agent.socialClass === SocialClass.CAPITALIST) {
          nodeRadius = isAlarmOrCrisis ? 12 : 10;
          ctx.fillStyle = '#f59e0b'; // Ámbar burgués
          ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = isAlarmOrCrisis ? '#fef08a' : '#fbbf24';
          ctx.lineWidth = isAlarmOrCrisis ? 2.5 : 1.8;
          ctx.stroke();
        } else if (agent.socialClass === SocialClass.TECHNOCRACY) {
          nodeRadius = 7.5;
          ctx.fillStyle = '#8b5cf6'; // Púrpura burocrático
          ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c4b5fd';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (agent.socialClass === SocialClass.RESERVE_ARMY) {
          nodeRadius = 5;
          ctx.fillStyle = agent.isStriking ? '#ef4444' : '#64748b';
          ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // PROLETARIAT
          nodeRadius = 7;
          if (agent.isStriking) {
            ctx.fillStyle = '#ef4444'; // Huelga
          } else if (agent.capitalistAuraExposure > 0.4) {
            ctx.fillStyle = '#38bdf8'; // Cooptado / asimilado por el capital
          } else if (agent.tactic === ActionTactic.INFRAPODER_MICROSCOPICO) {
            ctx.fillStyle = '#10b981'; // Infrapoder simple
          } else {
            ctx.fillStyle = '#0284c7'; // Asimilación hegemónica
          }
          ctx.arc(px, py, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Nombres y estado (si seleccionado, hover o pocos agentes)
        if (isSelected || isHovered || agents.length <= 6) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 11px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(agent.name, px, py - 13);

          ctx.font = '600 9px monospace';
          if (agent.isStriking) {
            ctx.fillStyle = '#ef4444';
            ctx.fillText('EN HUELGA', px, py + 19);
          } else if (agent.socialClass === SocialClass.CAPITALIST) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(`K: ${agent.capital.toFixed(0)}`, px, py + 19);
          } else if (agent.tactic === ActionTactic.INFRAPODER_MICROSCOPICO) {
            ctx.fillStyle = '#10b981';
            ctx.fillText(`IP: ${(agent.infrapowerEffective * 100).toFixed(0)}%`, px, py + 19);
          } else {
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`W: ${agent.realWage.toFixed(1)}`, px, py + 19);
          }
        }
      });

      // 4. OJO PANÓPTICO DE THE MACHINE
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

      // Pulso expansivo del radar panóptico
      ctx.beginPath();
      const radarPulse = 20 + ((now % 1600) / 1600) * 30;
      ctx.arc(machineX, machineY, radarPulse, 0, Math.PI * 2);
      ctx.strokeStyle =
        machine.regime === SystemRegime.ALARMA_PUNITIVA
          ? `rgba(239, 68, 68, ${1 - radarPulse / 50})`
          : `rgba(52, 211, 153, ${0.8 - radarPulse / 60})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isSubscribed = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [agents, machine, selectedAgentId, hoveredAgent, dimensions, spatialRadius, showAuraRP, zoom, pan]);

  // Conversión de coordenadas de pantalla a espacio del canvas considerando zoom y pan
  const screenToWorld = (screenX: number, screenY: number) => {
    const { width, height } = dimensions;
    const originX = width / 2;
    const originY = height / 2;

    const unpannedX = screenX - pan.x;
    const unpannedY = screenY - pan.y;

    const worldX = (unpannedX - originX) / zoom + originX;
    const worldY = (unpannedY - originY) / zoom + originY;

    return { worldX, worldY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Click derecho o botón central o tecla espacio: iniciar paneo
    if (e.button === 1 || e.button === 2 || e.shiftKey || e.altKey) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    // O arrastre normal si no hace click directo en un agente
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { worldX, worldY } = screenToWorld(screenX, screenY);
    const { width, height } = dimensions;

    let hit = false;
    for (const agent of agents) {
      const px = (agent.x / 100) * width;
      const py = (agent.y / 100) * height;
      if (Math.hypot(worldX - px, worldY - py) < 22 / zoom) {
        hit = true;
        onSelectAgent(agent.id);
        break;
      }
    }

    if (!hit) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { worldX, worldY } = screenToWorld(screenX, screenY);
    const { width, height } = dimensions;

    let found: Agent | null = null;
    for (const agent of agents) {
      const px = (agent.x / 100) * width;
      const py = (agent.y / 100) * height;
      if (Math.hypot(worldX - px, worldY - py) < 18 / zoom) {
        found = agent;
        break;
      }
    }
    setHoveredAgent(found);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 shadow-2xl">
      {/* Barra de cabecera del Canvas con leyenda interactiva y controles de zoom/scroll */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 backdrop-blur gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Sistema Nodal de Campo Social
          </span>
          <span className="text-slate-400 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            N={agents.length} nodos
          </span>
          {machine.capitalistClusterCohesion > 0.5 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hidden sm:flex items-center gap-1">
              <Users className="w-3 h-3" />
              Cartel Patronal ({(machine.capitalistClusterCohesion * 100).toFixed(0)}%)
            </span>
          )}
        </div>

        {/* Controles de Zoom, Desplazamiento y Aura RP */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {/* Navegación y Paneo Direccional (Scroll del espacio social) */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="btn-pan-left"
              onClick={() => handlePan(50, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar a la izquierda"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-pan-up"
              onClick={() => handlePan(0, 50)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar hacia arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-pan-down"
              onClick={() => handlePan(0, -50)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar hacia abajo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-pan-right"
              onClick={() => handlePan(-50, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar a la derecha"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="btn-zoom-in"
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Acercar zoom (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-slate-400">
              {Math.round(zoom * 100)}%
            </span>
            <button
              id="btn-zoom-out"
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Alejar zoom (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
              <button
                id="btn-reset-view"
                onClick={handleResetView}
                className="p-1 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded transition ml-0.5"
                title="Restablecer vista centrada"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="toggle-aura-rp"
            onClick={() => setShowAuraRP(!showAuraRP)}
            className={`px-2 py-1 rounded text-[10px] font-medium border transition flex items-center gap-1 ${
              showAuraRP
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Conmuta la visualización del radio de influencia y Relaciones Públicas del capital"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Aura RP</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Canvas Nodal */}
      <div
        ref={containerRef}
        className={`relative flex-1 w-full h-full min-h-[260px] overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <canvas
          id="social-field-canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoveredAgent(null);
          }}
          className="w-full h-full block touch-none"
        />

        {/* Badge superior de régimen sistémico */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur shadow-lg text-[11px] z-10">
          <Eye className={`w-3.5 h-3.5 ${
            machine.regime === SystemRegime.ALARMA_PUNITIVA
              ? 'text-red-400 animate-bounce'
              : machine.regime === SystemRegime.CRISIS_ORGANICA
              ? 'text-purple-400 animate-pulse'
              : 'text-emerald-400'
          }`} />
          <span className="font-semibold text-slate-200 hidden xs:inline">The Machine</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300">α = {machine.alfa.toFixed(2)}</span>
          <span className="text-slate-500">|</span>
          <span className={`font-semibold ${
            machine.regime === SystemRegime.ALARMA_PUNITIVA
              ? 'text-red-400'
              : machine.regime === SystemRegime.CRISIS_ORGANICA
              ? 'text-purple-400'
              : 'text-emerald-400'
          }`}>
            {machine.regime === SystemRegime.ALARMA_PUNITIVA
              ? 'ALARMA PUNITIVA'
              : machine.regime === SystemRegime.CRISIS_ORGANICA
              ? 'CRISIS ORGÁNICA'
              : 'CONSENSO HEGEMÓNICO'}
          </span>
        </div>

        {/* Mini ayuda de navegación en esquina inferior */}
        <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-900/80 border border-slate-800 px-2 py-1 rounded text-[10px] text-slate-400 backdrop-blur flex items-center gap-1">
          <Move className="w-3 h-3 text-slate-500" />
          <span>Arrastra para desplazar • Rueda para zoom</span>
        </div>

        {/* Tooltip flotante al hacer hover */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none px-3 py-2 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl text-xs z-30 min-w-[180px]"
            style={{
              left: `${Math.min(dimensions.width - 200, Math.max(10, (hoveredAgent.x / 100) * dimensions.width * zoom + pan.x + 15))}px`,
              top: `${Math.min(dimensions.height - 110, Math.max(10, (hoveredAgent.y / 100) * dimensions.height * zoom + pan.y - 20))}px`,
            }}
          >
            <p className="font-bold text-slate-100 flex items-center justify-between gap-2">
              <span>{hoveredAgent.name}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                hoveredAgent.isStriking ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-slate-400'
              }`}>
                {hoveredAgent.isStriking ? 'EN HUELGA' : hoveredAgent.tactic}
              </span>
            </p>
            <p className="text-slate-300 font-mono text-[11px] mt-1">
              Interior: {hoveredAgent.interior.toFixed(1)} | Salario Real: {hoveredAgent.realWage.toFixed(1)}
            </p>
            <p className="text-slate-400 font-mono text-[11px]">
              Infrapoder: {(hoveredAgent.infrapowerEffective * 100).toFixed(0)}% | Compliance: {(hoveredAgent.compliance * 100).toFixed(0)}%
            </p>
            {hoveredAgent.capitalistAuraExposure > 0.1 && (
              <p className="text-amber-400 text-[10px] mt-0.5">
                Exposición RP Capital: {(hoveredAgent.capitalistAuraExposure * 100).toFixed(0)}%
              </p>
            )}
            <p className="text-emerald-400 text-[10px] mt-0.5 font-medium truncate">
              {hoveredAgent.affinityDescription}
            </p>
          </div>
        )}
      </div>

      {/* Leyenda y estado en el pie del visor */}
      <div className="px-3 py-1.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Capital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Asimilación
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Infrapoder
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Huelga
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
          <span>Aura: {machine.capitalistAuraRadius.toFixed(0)}px</span>
          <span>•</span>
          <span>Clic para seleccionar nodo</span>
        </div>
      </div>
    </div>
  );
};

