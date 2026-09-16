import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Agent, SocialClass, TheMachineState, SystemRegime, ActionTactic } from '../types/simulation';
import {
  Atom,
  Radio,
  Sparkles,
  RefreshCw,
  Maximize2,
  Info,
  Users,
  Flame,
  Zap,
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

interface MolecularNode {
  id: string;
  agent: Agent;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  electrons: number;
}

interface MolecularBond {
  sourceId: string;
  targetId: string;
  type: 'resonance' | 'dissonance' | 'strike' | 'capital_rp' | 'hegemony';
  strength: number;
  length: number;
}

export const MolecularNodeViewer: React.FC<Props> = ({
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
  const [physicsActive, setPhysicsActive] = useState<boolean>(true);
  const [bondFilter, setBondFilter] = useState<'all' | 'affinity' | 'class'>('all');

  // Controles de zoom y paneo
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Nodos moleculares con posiciones independientes de relajación topológica
  const nodesRef = useRef<Map<string, MolecularNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const draggedNodeRef = useRef<MolecularNode | null>(null);

  // Redimensionamiento responsivo
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(260, Math.floor(rect.width)),
          height: Math.max(240, Math.floor(rect.height)),
        });
      }
    };
    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(containerRef.current);
    return () => obs.disconnect();
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

  const screenToWorld = (screenX: number, screenY: number) => {
    const { width, height } = dimensions;
    const centeredX = screenX - width / 2 - pan.x;
    const centeredY = screenY - height / 2 - pan.y;
    const worldX = centeredX / zoom + width / 2;
    const worldY = centeredY / zoom + height / 2;
    return { worldX, worldY };
  };

  // Manejador de scroll con rueda no intrusivo (solo zoom si se oprime Ctrl/Cmd)
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

  // Sincronizar nodos con agentes
  useEffect(() => {
    const currentNodes = nodesRef.current;
    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;

    agents.forEach((agent, idx) => {
      let node = currentNodes.get(agent.id);
      let radius = 9;
      let color = '#0284c7';
      let electrons = 3;

      if (agent.socialClass === SocialClass.CAPITALIST) {
        radius = 16;
        color = '#f59e0b'; // Oro burgués
        electrons = 6;
      } else if (agent.socialClass === SocialClass.TECHNOCRACY) {
        radius = 12;
        color = '#8b5cf6'; // Púrpura tecnocrático
        electrons = 4;
      } else if (agent.socialClass === SocialClass.RESERVE_ARMY) {
        radius = 7;
        color = '#64748b'; // Pizarra
        electrons = 1;
      } else {
        // Proletario
        radius = agent.isStriking ? 12 : 9.5;
        color = agent.isStriking
          ? '#ef4444'
          : agent.activePhi > 0.2
          ? '#10b981'
          : '#38bdf8';
        electrons = Math.max(1, Math.round(agent.classConsciousness * 5));
      }

      if (!node) {
        // Inicializar en distribución orbital concéntrica
        const angle = (idx / agents.length) * Math.PI * 2;
        const dist = 80 + (idx % 3) * 60;
        node = {
          id: agent.id,
          agent,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius,
          color,
          electrons,
        };
        currentNodes.set(agent.id, node);
      } else {
        node.agent = agent;
        node.radius = radius;
        node.color = color;
        node.electrons = electrons;
      }
    });

    // Limpiar agentes eliminados
    const currentIds = new Set(agents.map(a => a.id));
    for (const key of currentNodes.keys()) {
      if (!currentIds.has(key)) {
        currentNodes.delete(key);
      }
    }
  }, [agents, dimensions]);

  // Bucle de Física y Renderizado Molecular
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const renderLoop = () => {
      if (!running) return;

      const { width, height } = dimensions;
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Fondo del espacio molecular
      ctx.fillStyle = '#060911';
      ctx.fillRect(0, 0, width, height);

      // Rejilla cuántico-molecular sutil
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 0.5;
      const step = 36;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const nodes: MolecularNode[] = Array.from(nodesRef.current.values());
      const cx = width / 2;
      const cy = height / 2;

      // 1. CÁLCULO DE ENLACES MOLECULARES (BONDS)
      const bonds: MolecularBond[] = [];
      const thresholdDist = (spatialRadius / 100) * Math.min(width, height) * 1.35;

      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

          const a1 = n1.agent;
          const a2 = n2.agent;

          // Enlace de Huelga Conjunta
          if (a1.isStriking && a2.isStriking && dist < thresholdDist * 1.5) {
            bonds.push({
              sourceId: n1.id,
              targetId: n2.id,
              type: 'strike',
              strength: 0.8,
              length: 65,
            });
          }
          // Enlace de Afinidad Electiva entre Proletarios / Subalternos
          else if (
            (a1.socialClass === SocialClass.PROLETARIAT || a1.socialClass === SocialClass.RESERVE_ARMY) &&
            (a2.socialClass === SocialClass.PROLETARIAT || a2.socialClass === SocialClass.RESERVE_ARMY) &&
            dist < thresholdDist
          ) {
            const avgPhi = (a1.activePhi + a2.activePhi) / 2;
            if (avgPhi > 0.05) {
              bonds.push({
                sourceId: n1.id,
                targetId: n2.id,
                type: 'resonance',
                strength: Math.min(1, avgPhi * 1.2),
                length: 80 - avgPhi * 30,
              });
            } else if (avgPhi < -0.15) {
              bonds.push({
                sourceId: n1.id,
                targetId: n2.id,
                type: 'dissonance',
                strength: Math.abs(avgPhi),
                length: 120,
              });
            }
          }
          // Enlace Capitalista - Subalterno (Aura RP / Asimilación)
          else if (
            (a1.socialClass === SocialClass.CAPITALIST && a2.socialClass === SocialClass.PROLETARIAT) ||
            (a2.socialClass === SocialClass.CAPITALIST && a1.socialClass === SocialClass.PROLETARIAT)
          ) {
            const prolet = a1.socialClass === SocialClass.PROLETARIAT ? a1 : a2;
            if (prolet.capitalistAuraExposure > 0.15 && dist < thresholdDist * 1.4) {
              bonds.push({
                sourceId: n1.id,
                targetId: n2.id,
                type: 'capital_rp',
                strength: prolet.capitalistAuraExposure,
                length: 95,
              });
            }
          }
          // Enlace entre Capitalistas (Cartel Patronal)
          else if (
            a1.socialClass === SocialClass.CAPITALIST &&
            a2.socialClass === SocialClass.CAPITALIST
          ) {
            const isAlarm =
              machine.regime === SystemRegime.ALARMA_PUNITIVA ||
              machine.regime === SystemRegime.CRISIS_ORGANICA;
            if (isAlarm || machine.capitalistClusterCohesion > 0.3) {
              bonds.push({
                sourceId: n1.id,
                targetId: n2.id,
                type: 'hegemony',
                strength: Math.max(0.4, machine.capitalistClusterCohesion),
                length: 70,
              });
            }
          }
        }
      }

      // 2. FÍSICA MOLECULAR (FUERZAS DE RESORTE + REPULSIÓN ELECTROSTÁTICA)
      if (physicsActive) {
        // a) Repulsión electrostática de Coulomb entre todos los pares
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = n1.radius + n2.radius + 15;

            // Fuerza repulsiva
            const repFactor = dist < minDist ? 2200 : 900;
            const force = repFactor / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (draggedNodeRef.current !== n1) {
              n1.vx -= fx;
              n1.vy -= fy;
            }
            if (draggedNodeRef.current !== n2) {
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }

        // b) Tensión de enlace molecular (Ley de Hooke)
        for (const bond of bonds) {
          const n1 = nodesRef.current.get(bond.sourceId);
          const n2 = nodesRef.current.get(bond.targetId);
          if (!n1 || !n2) continue;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 1;
          const delta = dist - bond.length;
          const springK = 0.04 * bond.strength;

          const fx = (dx / dist) * delta * springK;
          const fy = (dy / dist) * delta * springK;

          if (draggedNodeRef.current !== n1) {
            n1.vx += fx;
            n1.vy += fy;
          }
          if (draggedNodeRef.current !== n2) {
            n2.vx -= fx;
            n2.vy -= fy;
          }
        }

        // c) Gravedad central y amortiguamiento
        nodes.forEach(n => {
          if (draggedNodeRef.current === n) return;

          // Gravedad suave hacia el centro del contenedor
          const toCenterX = cx - n.x;
          const toCenterY = cy - n.y;
          n.vx += toCenterX * 0.0018;
          n.vy += toCenterY * 0.0018;

          // Fricción / amortiguación
          n.vx *= 0.88;
          n.vy *= 0.88;

          // Integración de velocidad
          n.x += n.vx;
          n.y += n.vy;

          // Bounding box suave
          const pad = n.radius + 15;
          if (n.x < pad) { n.x = pad; n.vx *= -0.5; }
          if (n.x > width - pad) { n.x = width - pad; n.vx *= -0.5; }
          if (n.y < pad) { n.y = pad; n.vy *= -0.5; }
          if (n.y > height - pad) { n.y = height - pad; n.vy *= -0.5; }
        });
      }

      // 3. DIBUJAR ENLACES MOLECULARES (BONDS)
      const now = Date.now();
      for (const bond of bonds) {
        const n1 = nodesRef.current.get(bond.sourceId);
        const n2 = nodesRef.current.get(bond.targetId);
        if (!n1 || !n2) continue;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);

        if (bond.type === 'strike') {
          // Enlace de huelga / barricada: doble trazo rojo incandescente
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.8;
          ctx.stroke();

          // Resplandor de enlace
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 6;
          ctx.stroke();
        } else if (bond.type === 'resonance') {
          // Enlace de afinidad electiva: verde esmeralda con pulso iónico
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 + bond.strength * 0.5})`;
          ctx.lineWidth = 1.4 + bond.strength * 1.6;
          ctx.stroke();

          // Partícula de energía cuántica fluyendo por el enlace
          const t = ((now / 1200) + (n1.x * 0.01)) % 1;
          const px = n1.x + (n2.x - n1.x) * t;
          const py = n1.y + (n2.y - n1.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#34d399';
          ctx.fill();
        } else if (bond.type === 'capital_rp') {
          // Enlace de RP / cooptación burguesa: filamento dorado fino
          ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(0.65, bond.strength * 0.7)})`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (bond.type === 'hegemony') {
          // Cartel patronal: enlace dorado sólido
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2.4;
          ctx.stroke();
        } else {
          // Disonancia: línea discontinua tenue
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // 4. DIBUJAR NODOS MOLECULARES (ÁTOMOS SOCIALES)
      nodes.forEach(n => {
        const isSelected = n.id === selectedAgentId;
        const isHovered = n.id === hoveredAgent?.id;

        // Órbitas electrónicas moleculares
        const orbitRadius = n.radius + 7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Electrones orbitando (representan habitus, infrapoder y conciencia)
        const angleBase = (now / 2000) * (n.agent.socialClass === SocialClass.CAPITALIST ? 0.6 : 1.2);
        for (let e = 0; e < n.electrons; e++) {
          const electronAngle = angleBase + (e * (Math.PI * 2 / n.electrons));
          const ex = n.x + Math.cos(electronAngle) * orbitRadius;
          const ey = n.y + Math.sin(electronAngle) * orbitRadius;

          ctx.beginPath();
          ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = n.agent.isStriking ? '#f87171' : n.color;
          ctx.fill();
        }

        // Halo de selección
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 11, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Núcleo del Átomo / Nodo
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(n.x - 2, n.y - 2, 1, n.x, n.y, n.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, n.color);
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#38bdf8' : n.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Notación molecular en el núcleo (ej: P, K, T, R)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol =
          n.agent.socialClass === SocialClass.CAPITALIST ? 'K' :
          n.agent.socialClass === SocialClass.TECHNOCRACY ? 'T' :
          n.agent.socialClass === SocialClass.RESERVE_ARMY ? 'R' : 'P';
        ctx.fillText(symbol, n.x, n.y);

        // Etiquetas textuales si seleccionado, hover o pocos agentes
        if (isSelected || isHovered || nodes.length <= 6) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 11px system-ui, sans-serif';
          ctx.textBaseline = 'bottom';
          ctx.fillText(n.agent.name, n.x, n.y - orbitRadius - 3);

          ctx.font = '500 9px monospace';
          ctx.textBaseline = 'top';
          if (n.agent.isStriking) {
            ctx.fillStyle = '#ef4444';
            ctx.fillText('ENLACE HUELGA', n.x, n.y + orbitRadius + 3);
          } else {
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`φ:${n.agent.activePhi > 0 ? '+' : ''}${n.agent.activePhi.toFixed(2)} | IP:${(n.agent.infrapowerEffective * 100).toFixed(0)}%`, n.x, n.y + orbitRadius + 3);
          }
        }
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, spatialRadius, physicsActive, machine, selectedAgentId, hoveredAgent, zoom, pan]);

  // Manejadores de interacción, paneo y arrastre molecular
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { worldX, worldY } = screenToWorld(screenX, screenY);

    if (e.button === 1 || e.button === 2 || e.shiftKey || e.altKey) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    let clickedNode: MolecularNode | null = null;
    let minDist = 25 / zoom;

    for (const node of nodesRef.current.values()) {
      const d = Math.hypot(node.x - worldX, node.y - worldY);
      if (d < minDist) {
        minDist = d;
        clickedNode = node;
      }
    }

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      onSelectAgent(clickedNode.id);
    } else {
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

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = worldX;
      draggedNodeRef.current.y = worldY;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else {
      let found: Agent | null = null;
      for (const node of nodesRef.current.values()) {
        if (Math.hypot(node.x - worldX, node.y - worldY) < (node.radius + 10) / zoom) {
          found = node.agent;
          break;
        }
      }
      setHoveredAgent(found);
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    setIsDragging(false);
  };

  // Re-organizar nodos en distribución circular
  const handleReorganize = () => {
    const { width, height } = dimensions;
    const cx = width / 2;
    const cy = height / 2;
    const nodes: MolecularNode[] = Array.from(nodesRef.current.values());

    nodes.forEach((node, idx) => {
      const angle = (idx / nodes.length) * Math.PI * 2;
      const dist = 110 + (idx % 3) * 50;
      node.x = cx + Math.cos(angle) * dist;
      node.y = cy + Math.sin(angle) * dist;
      node.vx = (Math.random() - 0.5) * 0.5;
      node.vy = (Math.random() - 0.5) * 0.5;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Barra de cabecera del visor molecular */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 backdrop-blur gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-100 flex items-center gap-1.5 text-xs sm:text-sm">
            <Atom className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
            Visor Molecular de Nodos
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30 font-mono">
            N={agents.length}
          </span>
        </div>

        {/* Controles de Navegación, Zoom y Física */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {/* Navegación y Paneo Direccional */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="btn-mol-pan-left"
              onClick={() => handlePan(50, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar a la izquierda"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-mol-pan-up"
              onClick={() => handlePan(0, 50)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar hacia arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-mol-pan-down"
              onClick={() => handlePan(0, -50)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar hacia abajo"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-mol-pan-right"
              onClick={() => handlePan(-50, 0)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Desplazar a la derecha"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="btn-mol-zoom-in"
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
              id="btn-mol-zoom-out"
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
              title="Alejar zoom (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {(zoom !== 1 || pan.x !== 0 || pan.y !== 0) && (
              <button
                id="btn-mol-reset-view"
                onClick={handleResetView}
                className="p-1 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded transition ml-0.5"
                title="Restablecer vista centrada"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-toggle-physics"
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`px-2 py-1 rounded text-[10px] font-medium border transition flex items-center gap-1 ${
              physicsActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Activar / Pausar física de resortes y fuerzas moleculares"
          >
            <RefreshCw className={`w-3 h-3 ${physicsActive ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="hidden sm:inline">{physicsActive ? 'Física' : 'Pausada'}</span>
          </button>

          <button
            id="btn-reorganize-nodes"
            onClick={handleReorganize}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-medium transition flex items-center gap-1"
            title="Restablecer posiciones radiales de los nodos"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Relajar</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Canvas Molecular */}
      <div
        ref={containerRef}
        className={`relative flex-1 w-full h-full min-h-[260px] select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <canvas
          id="molecular-node-canvas"
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Leyenda molecular en esquina inferior izquierda */}
        <div className="absolute bottom-3 left-3 pointer-events-none p-2 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur text-[10px] space-y-1 z-10">
          <span className="font-semibold text-slate-300 block mb-1">Topología de Enlaces:</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
            <span>Resonancia Electiva (φ &gt; 0)</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 h-1 bg-red-500 inline-block" />
            <span>Piquete de Huelga Conjunta</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-3 h-0.5 border-b border-dashed border-amber-400 inline-block" />
            <span>Aura de RP del Capital</span>
          </div>
        </div>

        {/* Mini ayuda de navegación en esquina inferior derecha */}
        <div className="absolute bottom-3 right-3 pointer-events-none bg-slate-900/85 border border-slate-800 px-2.5 py-1 rounded text-[10px] text-slate-400 backdrop-blur flex items-center gap-1.5 z-10 hidden sm:flex">
          <Move className="w-3 h-3 text-sky-400" />
          <span>Arrastra lienzo para desplazar • Flechas o zoom para explorar</span>
        </div>

        {/* Tooltip de nodo al hacer hover */}
        {hoveredAgent && (
          <div
            className="absolute pointer-events-none px-3 py-2 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl text-xs z-30 min-w-[190px]"
            style={{
              left: `${Math.min(dimensions.width - 210, Math.max(10, (nodesRef.current.get(hoveredAgent.id)?.x || 50) + 15))}px`,
              top: `${Math.min(dimensions.height - 120, Math.max(10, (nodesRef.current.get(hoveredAgent.id)?.y || 50) - 25))}px`,
            }}
          >
            <p className="font-bold text-slate-100 flex items-center justify-between gap-2">
              <span>{hoveredAgent.name}</span>
              <span className="text-[9px] px-1 py-0.2 rounded font-mono uppercase bg-slate-800 text-sky-300">
                {hoveredAgent.socialClass}
              </span>
            </p>
            <p className="text-slate-300 font-mono text-[11px] mt-1">
              Afinidad φ: <strong className={hoveredAgent.activePhi > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {hoveredAgent.activePhi > 0 ? `+${hoveredAgent.activePhi.toFixed(2)}` : hoveredAgent.activePhi.toFixed(2)}
              </strong>
            </p>
            <p className="text-slate-400 font-mono text-[11px]">
              Infrapoder: {(hoveredAgent.infrapowerEffective * 100).toFixed(0)}% | Salario: {hoveredAgent.realWage.toFixed(2)}
            </p>
            <p className="text-sky-400 text-[10px] mt-0.5 font-medium truncate">
              {hoveredAgent.tactic}
            </p>
          </div>
        )}
      </div>

      {/* Pie del visor */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          Arrastra cualquier nodo molecular para interactuar con la tensión de afinidades y fuerzas del sistema.
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Enlace Hooke: Activo
        </span>
      </div>
    </div>
  );
};
