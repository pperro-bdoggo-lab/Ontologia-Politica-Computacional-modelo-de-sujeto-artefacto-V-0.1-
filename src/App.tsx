import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Agent,
  TheMachineState,
  SimulationConfig,
  SimulationMetricsPoint,
  HistoricalEvent,
  SystemRegime,
  SocialClass,
  ActionTactic,
} from './types/simulation';
import {
  DEFAULT_CONFIG,
  PRESET_SCENARIOS,
} from './simulation/presets';
import {
  createInitialPopulation,
  createInitialMachineState,
  simulateStep,
} from './simulation/engine';
import { Header } from './components/Header';
import { SocialFieldCanvas } from './components/SocialFieldCanvas';
import { MolecularNodeViewer } from './components/MolecularNodeViewer';
import { AgentInspector } from './components/AgentInspector';
import { TheMachinePanel } from './components/TheMachinePanel';
import { SimulationCharts } from './components/SimulationCharts';
import { SociologicalLog } from './components/SociologicalLog';
import { ConfigDrawer } from './components/ConfigDrawer';
import { TheoreticalModal } from './components/TheoreticalModal';
import {
  Terminal,
  BookOpen,
  Eye,
  Sliders,
  Flame,
  Activity,
  User,
  Scroll,
  TrendingUp,
  Sparkles,
  Atom,
  Columns,
} from 'lucide-react';

type SideTab = 'all' | 'machine' | 'inspector' | 'charts' | 'log';
type SystemViewerMode = 'molecular' | 'spatial' | 'split';

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('marx-trpf-crisis');
  const [config, setConfig] = useState<SimulationConfig>(() => {
    const preset = PRESET_SCENARIOS.find(p => p.id === 'marx-trpf-crisis') || PRESET_SCENARIOS[0];
    return { ...preset.config };
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<SystemViewerMode>('spatial');

  const [agents, setAgents] = useState<Agent[]>([]);
  const [machine, setMachine] = useState<TheMachineState>(() => createInitialMachineState(DEFAULT_CONFIG));
  const [history, setHistory] = useState<SimulationMetricsPoint[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);

  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);
  const [activeSideTab, setActiveSideTab] = useState<SideTab>('all');

  // Referencias para sincronización determinista sin efectos colaterales anidados en React
  const agentsRef = useRef<Agent[]>([]);
  const machineRef = useRef<TheMachineState>(machine);
  const currentStepRef = useRef<number>(0);
  const configRef = useRef<SimulationConfig>(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Inicializar o reiniciar escenario
  const initScenario = useCallback((presetId: string, customCfg?: SimulationConfig) => {
    const preset = PRESET_SCENARIOS.find(p => p.id === presetId) || PRESET_SCENARIOS[0];
    const activeConfig = customCfg || { ...preset.config };

    let initialAgents: Agent[];
    let initialMachine: TheMachineState;

    if (preset.customInitialAgents) {
      initialAgents = preset.customInitialAgents(activeConfig);
    } else {
      initialAgents = createInitialPopulation(activeConfig);
    }

    if (preset.customInitialMachine) {
      initialMachine = { ...preset.customInitialMachine };
    } else {
      initialMachine = createInitialMachineState(activeConfig);
    }

    // Sincronizar referencias inmediatas
    agentsRef.current = initialAgents;
    machineRef.current = initialMachine;
    currentStepRef.current = 0;
    configRef.current = activeConfig;

    // Punto métrico inicial (t=0)
    const initialMetric: SimulationMetricsPoint = {
      step: 0,
      interiorProletariat: parseFloat(
        (initialAgents.filter(a => a.socialClass === SocialClass.PROLETARIAT)
          .reduce((s, a) => s + a.interior, 0) / Math.max(1, activeConfig.populationProletariat)).toFixed(2)
      ),
      interiorCapitalist: 85,
      exterior: initialMachine.exterior,
      discrepancy: initialMachine.exterior - 15,
      alfa: initialMachine.alfa,
      infrapowerPromedio: initialMachine.averageInfrapower,
      phiPromedio: initialMachine.averagePhi,
      rateOfProfit: initialMachine.rateOfProfit,
      rateOfSurplusValue: initialMachine.rateOfSurplusValue,
      organicComposition: initialMachine.organicComposition,
      gini: initialMachine.giniCoefficient,
      strikePercentage: 0,
      simpleInfrapowerPercentage: initialMachine.simpleInfrapowerParticipation,
      compliancePercentage: initialMachine.complianceParticipation,
      realWagePromedio: initialMachine.averageRealWage,
      capitalistCohesion: initialMachine.capitalistClusterCohesion,
      regime: initialMachine.regime,
    };

    const initialEvent: HistoricalEvent = {
      id: `init-${preset.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      step: 0,
      type: 'RESONANCIA',
      title: `Escenario Inicializado: ${preset.title}`,
      description: preset.description,
      theoreticalNote: preset.theoreticalReference,
      author: 'CSS Simulator & Heterodox Marxism',
    };

    setAgents(initialAgents);
    setMachine(initialMachine);
    setHistory([initialMetric]);
    setEvents([initialEvent]);
    setCurrentStep(0);
    setIsRunning(false);
    setSelectedAgentId(initialAgents.length > 0 ? initialAgents[0].id : null);
  }, []);

  // Cargar escenario al montar
  useEffect(() => {
    initScenario(selectedPresetId);
  }, [selectedPresetId, initScenario]);

  // Ejecutar un paso discreto (t -> t+1) de manera atómica y determinista
  const executeStep = useCallback(() => {
    const nextStepNum = currentStepRef.current + 1;
    currentStepRef.current = nextStepNum;

    const result = simulateStep(
      agentsRef.current,
      machineRef.current,
      configRef.current,
      nextStepNum
    );

    // Actualizar referencias inmediatamente
    agentsRef.current = result.nextAgents;
    machineRef.current = result.nextMachine;

    // Actualizar estados de React de forma limpia sin callbacks anidados
    setCurrentStep(nextStepNum);
    setAgents(result.nextAgents);
    setMachine(result.nextMachine);
    setHistory(prevHist => [...prevHist, result.metricsPoint].slice(-150));

    if (result.newEvent) {
      const ev = result.newEvent;
      setEvents(prevEv => {
        if (prevEv.some(existing => existing.id === ev.id)) {
          return prevEv;
        }
        return [...prevEv, ev];
      });
    }
  }, []);

  // Bucle de simulación automática en tiempo real
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      const ms = Math.max(120, Math.floor(650 / speed));
      intervalRef.current = setInterval(() => {
        executeStep();
      }, ms);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, speed, executeStep]);

  // Manejador de selección de agente
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || null;

  // Intervención manual: provocar infrapoder máximo en un agente
  const handleTriggerResistance = (agentId: string) => {
    setAgents(prev => {
      const next = prev.map(a =>
        a.id === agentId
          ? {
              ...a,
              infrapowerRaw: 0.95,
              infrapowerEffective: 0.95,
              alienation: Math.min(100, a.alienation + 25),
              tactic: ActionTactic.INFRAPODER_MICROSCOPICO,
              compliance: Math.max(0, a.compliance - 0.3),
            }
          : a
      );
      agentsRef.current = next;
      return next;
    });
  };

  // Intervención manual: toggle de huelga
  const handleToggleStrike = (agentId: string) => {
    setAgents(prev => {
      const next = prev.map(a =>
        a.id === agentId
          ? {
              ...a,
              isStriking: !a.isStriking,
              tactic: !a.isStriking ? ActionTactic.HUELGA_RESONANTE : ActionTactic.INFRAPODER_MICROSCOPICO,
              compliance: !a.isStriking ? 0.05 : a.compliance,
            }
          : a
      );
      agentsRef.current = next;
      return next;
    });
  };

  // Políticas sistémicas de The Machine: Concesión salarial real
  const handleApplyConcession = () => {
    setMachine(prev => {
      const next = {
        ...prev,
        exterior: Math.max(50, prev.exterior - 8),
        alfa: Math.max(0.05, prev.alfa - 0.05),
        movementExterior: -8,
        averageRealWage: prev.averageRealWage * 1.2,
        regime: SystemRegime.CONSENSO_HEGEMONICO,
      };
      machineRef.current = next;
      return next;
    });
    setAgents(prev => {
      const next = prev.map(a => {
        const newWage = a.wage * 1.2;
        const newRealWage = newWage / (1 + (machineRef.current.alfa * 0.4));
        return {
          ...a,
          wage: newWage,
          realWage: newRealWage,
          alienation: Math.max(0, a.alienation - 12),
          interior: Math.min(100, a.interior + 6),
          compliance: Math.min(1, a.compliance + 0.25),
          isStriking: false,
          tactic: ActionTactic.ASIMILACION,
        };
      });
      agentsRef.current = next;
      return next;
    });
    setEvents(prev => [
      ...prev,
      {
        id: `concession-${currentStepRef.current}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        step: currentStepRef.current,
        type: 'RELAJACION',
        title: 'Política Hegemónica: Aumento de Salario Real y Concesión Material',
        description: 'The Machine ejecutó una concesión material gramsciana: aumentó el salario real un 20% y redujo la coerción, pacificando las huelgas y restaurando la homeostasis consensual.',
        theoreticalNote: 'Gramsci: la hegemonía burguesa incorpora demandas de los subalternos mediante transformismo para estabilizar el sistema sin ceder el control de los medios de producción.',
        author: 'Antonio Gramsci & Herbert Simon',
      },
    ]);
  };

  // Despliegue represivo de The Machine
  const handleIntensifyDiscipline = () => {
    setMachine(prev => {
      const next = {
        ...prev,
        alfa: Math.min(0.65, prev.alfa + 0.12),
        regime: SystemRegime.ALARMA_PUNITIVA,
        capitalistAuraRadius: Math.min(45, prev.capitalistAuraRadius * 1.25),
        capitalistClusterCohesion: Math.min(1, prev.capitalistClusterCohesion + 0.3),
      };
      machineRef.current = next;
      return next;
    });
    setAgents(prev => {
      const next = prev.map(a => {
        if (a.isStriking && a.classConsciousness < 0.6) {
          return {
            ...a,
            isStriking: false,
            tactic: ActionTactic.INFRAPODER_MICROSCOPICO,
            infrapowerEffective: a.infrapowerEffective * 0.7,
            compliance: Math.min(1, a.compliance + 0.15),
          };
        }
        return a;
      });
      agentsRef.current = next;
      return next;
    });
    setEvents(prev => [
      ...prev,
      {
        id: `discipline-${currentStepRef.current}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        step: currentStepRef.current,
        type: 'ALARMA',
        title: 'Despliegue Represivo: Activación de Alarma Punitiva y Cartel Patronal',
        description: 'The Machine intensificó la vigilancia disciplinaria (alfa +0.12). El capital se agrupa en cluster y amplía su aura de normalización y RP para someter las protestas abiertas.',
        theoreticalNote: 'Althusser & Foucault: Aparatos Represivos e Ideológicos del Estado. Cuando la disciplina punitiva arrecia, las huelgas débiles se repliegan hacia la resistencia microscópica cotidiana.',
        author: 'The Machine & James C. Scott',
      },
    ]);
  };

  // Mecanización tecnológica (c/v)
  const handleBoostMechanization = () => {
    setMachine(prev => {
      const newC = prev.constantCapital + 80;
      const newOcc = newC / Math.max(1, prev.variableCapital);
      const newPi = prev.surplusValue / (newC + prev.variableCapital);
      const next = {
        ...prev,
        constantCapital: newC,
        organicComposition: newOcc,
        rateOfProfit: newPi,
      };
      machineRef.current = next;
      return next;
    });
    setEvents(prev => [
      ...prev,
      {
        id: `mech-${currentStepRef.current}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        step: currentStepRef.current,
        type: 'CRISIS',
        title: 'Inyección Tecnológica: Salto en Composición Orgánica (c/v)',
        description: 'La burguesía incorporó maquinaria automatizada acelerando c. Esto eleva la productividad pero precipita la caída tendencial de la tasa general de ganancia.',
        theoreticalNote: 'Karl Marx (El Capital, t. III): Paradoja del capitalismo donde la tecnificación que persigue cada capitalista reduce la tasa global de valorización.',
        author: 'Karl Marx',
      },
    ]);
  };

  // Exportar serie temporal a CSV o JSON
  const handleExportData = (format: 'csv' | 'json') => {
    if (history.length === 0) return;
    let content = '';
    const filename = `css-simulation-step-${currentStep}.${format}`;
    let mimeType = '';

    if (format === 'csv') {
      const headers = [
        'step',
        'interiorProletariat',
        'exterior',
        'discrepancy',
        'alfa',
        'compliancePercentage',
        'simpleInfrapowerPercentage',
        'strikePercentage',
        'realWagePromedio',
        'rateOfProfit',
        'organicComposition',
        'gini',
        'capitalistCohesion',
        'regime',
      ];
      const rows = history.map(h => [
        h.step,
        h.interiorProletariat,
        h.exterior,
        h.discrepancy,
        h.alfa,
        (h.compliancePercentage ?? 0).toFixed(4),
        (h.simpleInfrapowerPercentage ?? 0).toFixed(4),
        (h.strikePercentage ?? 0).toFixed(4),
        (h.realWagePromedio ?? 0).toFixed(2),
        h.rateOfProfit.toFixed(4),
        h.organicComposition.toFixed(2),
        h.gini.toFixed(4),
        (h.capitalistCohesion ?? 0).toFixed(4),
        h.regime,
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(
        {
          presetId: selectedPresetId,
          config,
          machine,
          history,
          events,
        },
        null,
        2
      );
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activePreset = PRESET_SCENARIOS.find(p => p.id === selectedPresetId) || PRESET_SCENARIOS[0];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* 1. Barra de cabecera fija con controles de simulación */}
      <Header
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(prev => !prev)}
        onStep={executeStep}
        onReset={() => initScenario(selectedPresetId, config)}
        currentStep={currentStep}
        speed={speed}
        onChangeSpeed={setSpeed}
        selectedPresetId={selectedPresetId}
        onSelectPreset={id => setSelectedPresetId(id)}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenTheoreticalModal={() => setIsTheoryOpen(true)}
        onExportData={handleExportData}
      />

      {/* 2. Franja de contexto del escenario activo */}
      <div className="bg-slate-900/60 border-b border-slate-800/90 px-4 py-1.5 shrink-0">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-bold text-slate-200 truncate">{activePreset.title}:</span>
            <span className="text-slate-400 text-[11px] truncate hidden md:inline">{activePreset.subtitle}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
            {selectedPresetId !== 'p-perro-duo' && (
              <button
                id="btn-switch-to-pperro"
                onClick={() => setSelectedPresetId('p-perro-duo')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
              >
                <Terminal className="w-3 h-3" />
                <span>Dúo P.Perro</span>
              </button>
            )}
            <button
              id="btn-read-theory"
              onClick={() => setIsTheoryOpen(true)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <BookOpen className="w-3 h-3" />
              <span>Fundamentos Teóricos</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. WORKSPACE PRINCIPAL: Visor del sistema siempre visible + Side Scroll de datos y control */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* ============================================================ */}
        {/* PANEL IZQUIERDO: VISOR DEL SISTEMA (SIEMPRE VISIBLE CON CONTROL DE SCROLL) */}
        {/* ============================================================ */}
        <section
          aria-label="Visor del Sistema Social"
          className="flex-1 min-h-[460px] lg:h-full lg:min-h-0 min-w-0 p-2 sm:p-3 flex flex-col overflow-y-auto lg:overflow-hidden bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800"
        >
          {/* Barra de alternancia de vista del visor del sistema */}
          <div className="mb-2 flex items-center justify-between px-2 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 hidden sm:inline text-xs">
                Modo de Visualización:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  id="btn-mode-spatial"
                  onClick={() => setViewerMode('spatial')}
                  className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                    viewerMode === 'spatial'
                      ? 'bg-sky-600 text-white shadow ring-1 ring-sky-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualización espacial del sistema nodal original de campo social en plano 2D"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Sistema Nodal (Original v1)</span>
                </button>
                <button
                  id="btn-mode-molecular"
                  onClick={() => setViewerMode('molecular')}
                  className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                    viewerMode === 'molecular'
                      ? 'bg-sky-600 text-white shadow ring-1 ring-sky-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Visualización molecular topológica de red de nodos, afinidades y enlaces"
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span>Visor Molecular</span>
                </button>
                <button
                  id="btn-mode-split"
                  onClick={() => setViewerMode('split')}
                  className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                    viewerMode === 'split'
                      ? 'bg-sky-600 text-white shadow ring-1 ring-sky-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Vista dividida: Sistema Nodal y Visor Molecular en simultáneo"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Vista Dual</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono hidden xl:block">
              {viewerMode === 'spatial' && 'Distribución Espacial 2D y Auras de Poder (Versión 1)'}
              {viewerMode === 'molecular' && 'Red Topológica y Tensión de Enlaces'}
              {viewerMode === 'split' && 'Observación Simultánea Macro/Micro'}
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[300px] lg:min-h-0 relative">
            {viewerMode === 'spatial' && (
              <SocialFieldCanvas
                agents={agents}
                machine={machine}
                selectedAgentId={selectedAgentId}
                onSelectAgent={id => setSelectedAgentId(id)}
                spatialRadius={config.spatialRadius}
              />
            )}
            {viewerMode === 'molecular' && (
              <MolecularNodeViewer
                agents={agents}
                machine={machine}
                selectedAgentId={selectedAgentId}
                onSelectAgent={id => setSelectedAgentId(id)}
                spatialRadius={config.spatialRadius}
              />
            )}
            {viewerMode === 'split' && (
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 min-h-[550px] lg:min-h-0">
                <div className="h-full min-h-[260px] lg:min-h-0">
                  <SocialFieldCanvas
                    agents={agents}
                    machine={machine}
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={id => setSelectedAgentId(id)}
                    spatialRadius={config.spatialRadius}
                  />
                </div>
                <div className="h-full min-h-[260px] lg:min-h-0">
                  <MolecularNodeViewer
                    agents={agents}
                    machine={machine}
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={id => setSelectedAgentId(id)}
                    spatialRadius={config.spatialRadius}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Barra de telemetría rápida inferior fija bajo el canvas */}
          <div
            id="viewer-telemetry-bar"
            className="mt-2 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0 z-10"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Activity className="w-3 h-3 text-sky-400" />
                Paso: <strong className="font-mono text-slate-100">{currentStep}</strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Salario Real: <strong className="font-mono text-emerald-400">{machine.averageRealWage.toFixed(2)}</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 hidden sm:inline">
                Huelga: <strong className="font-mono text-red-400">{(machine.strikeParticipation * 100).toFixed(0)}%</strong>
              </span>
              <span className="text-slate-600 hidden md:inline">|</span>
              <span className="text-slate-400 hidden md:inline">
                Infrapoder: <strong className="font-mono text-emerald-400">{(machine.simpleInfrapowerParticipation * 100).toFixed(0)}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                machine.regime === SystemRegime.ALARMA_PUNITIVA
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : machine.regime === SystemRegime.CRISIS_ORGANICA
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {machine.regime}
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* PANEL DERECHO: SIDE SCROLL DE DATOS Y CONTROL */}
        {/* "el panel de datos y control deberia de establecerse como un side scroll que permita observar los diferentes medidores y controles." */}
        {/* ============================================================ */}
        <aside
          aria-label="Panel de Datos y Control"
          className="w-full lg:w-[460px] xl:w-[500px] 2xl:w-[540px] h-[54vh] lg:h-full flex flex-col bg-slate-900/60 border-t lg:border-t-0 lg:border-l border-slate-800 shrink-0 overflow-hidden shadow-2xl"
        >
          {/* Cabecera del Side Scroll con selector rápido de vistas/filtros */}
          <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-xs text-slate-200 tracking-wide uppercase">
                Panel de Control & Medidores
              </span>
            </div>

            {/* Píldoras de filtro/enfoque */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                id="tab-view-all"
                onClick={() => setActiveSideTab('all')}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeSideTab === 'all'
                    ? 'bg-slate-800 text-sky-300 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              <button
                id="tab-view-machine"
                onClick={() => setActiveSideTab('machine')}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeSideTab === 'machine'
                    ? 'bg-slate-800 text-amber-300 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                The Machine
              </button>
              <button
                id="tab-view-inspector"
                onClick={() => setActiveSideTab('inspector')}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeSideTab === 'inspector'
                    ? 'bg-slate-800 text-emerald-300 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agente
              </button>
              <button
                id="tab-view-charts"
                onClick={() => setActiveSideTab('charts')}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeSideTab === 'charts'
                    ? 'bg-slate-800 text-indigo-300 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gráficos
              </button>
              <button
                id="tab-view-log"
                onClick={() => setActiveSideTab('log')}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  activeSideTab === 'log'
                    ? 'bg-slate-800 text-rose-300 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bitácora
              </button>
            </div>
          </div>

          {/* ÁREA DE SCROLL VERTICAL CONTINUO (SIDE SCROLL) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3.5 divide-y divide-slate-800/60 custom-scrollbar">
            {/* 1. Módulo The Machine & Políticas Sistémicas */}
            {(activeSideTab === 'all' || activeSideTab === 'machine') && (
              <div id="section-machine" className="pt-1 first:pt-0">
                <TheMachinePanel
                  machine={machine}
                  alarmThreshold={config.alarmThreshold}
                  onApplyConcession={handleApplyConcession}
                  onIntensifyDiscipline={handleIntensifyDiscipline}
                  onBoostMechanization={handleBoostMechanization}
                />
              </div>
            )}

            {/* 2. Inspector Sociológico del Agente Seleccionado */}
            {(activeSideTab === 'all' || activeSideTab === 'inspector') && (
              <div id="section-inspector" className="pt-3.5">
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    Telemetría del Sujeto-Artefacto Seleccionado
                  </span>
                  {selectedAgent && (
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {selectedAgent.id}
                    </span>
                  )}
                </div>
                <AgentInspector
                  agent={selectedAgent}
                  exterior={machine.exterior}
                  alpha={machine.alfa}
                  onTriggerResistance={handleTriggerResistance}
                  onToggleStrike={handleToggleStrike}
                />
              </div>
            )}

            {/* 3. Gráficos de Series Temporales (Recharts) */}
            {(activeSideTab === 'all' || activeSideTab === 'charts') && (
              <div id="section-charts" className="pt-3.5">
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    Evolución Longitudinal & Homeostasis
                  </span>
                </div>
                <SimulationCharts data={history} alarmThreshold={config.alarmThreshold} />
              </div>
            )}

            {/* 4. Bitácora Sociológica & Eventos Críticos */}
            {(activeSideTab === 'all' || activeSideTab === 'log') && (
              <div id="section-log" className="pt-3.5 pb-2">
                <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Scroll className="w-3.5 h-3.5 text-amber-400" />
                    Bitácora de Rupturas & Transiciones
                  </span>
                </div>
                <SociologicalLog events={events} history={history} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 4. Modales de Configuración y Teoría */}
      <ConfigDrawer
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onChangeConfig={newCfg => setConfig(newCfg)}
        onResetToDefaults={() => {
          setConfig({ ...activePreset.config });
          initScenario(selectedPresetId, { ...activePreset.config });
        }}
      />

      <TheoreticalModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
}
