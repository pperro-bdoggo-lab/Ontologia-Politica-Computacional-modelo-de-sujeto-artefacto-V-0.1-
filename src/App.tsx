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
import { AgentInspector } from './components/AgentInspector';
import { TheMachinePanel } from './components/TheMachinePanel';
import { SimulationCharts } from './components/SimulationCharts';
import { SociologicalLog } from './components/SociologicalLog';
import { ConfigDrawer } from './components/ConfigDrawer';
import { TheoreticalModal } from './components/TheoreticalModal';
import { Sparkles, Terminal, BookOpen, AlertCircle } from 'lucide-react';

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

  const [agents, setAgents] = useState<Agent[]>([]);
  const [machine, setMachine] = useState<TheMachineState>(() => createInitialMachineState(DEFAULT_CONFIG));
  const [history, setHistory] = useState<SimulationMetricsPoint[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);

  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

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
    setHistory(prevHist => [...prevHist, result.metricsPoint].slice(-120));

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
              infrapowerEffective: 1.15,
              classConsciousness: Math.min(1.0, a.classConsciousness + 0.15),
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
            }
          : a
      );
      agentsRef.current = next;
      return next;
    });
  };

  // Políticas sistémicas de The Machine
  const handleApplyConcession = () => {
    setMachine(prev => {
      const next = {
        ...prev,
        exterior: Math.max(50, prev.exterior - 8),
        alfa: Math.max(0.05, prev.alfa - 0.04),
        movementExterior: -8,
        regime: SystemRegime.CONSENSO_HEGEMONICO,
      };
      machineRef.current = next;
      return next;
    });
    setAgents(prev => {
      const next = prev.map(a => ({
        ...a,
        wage: a.wage * 1.15, // Aumento salarial del 15%
        alienation: Math.max(0, a.alienation - 8),
      }));
      agentsRef.current = next;
      return next;
    });
    setEvents(prev => [
      ...prev,
      {
        id: `concession-${currentStepRef.current}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        step: currentStepRef.current,
        type: 'RELAJACION',
        title: 'Política Hegemónica: Concesión Salarial y Reducción del Exterior',
        description: 'The Machine ejecutó una concesión material gramsciana: aumentó salarios un 15% y redujo la exigencia exterior para restaurar el consenso.',
        theoreticalNote: 'Gramsci: el transformismo y la hegemonía incorporan demandas parciales de los subalternos para neutralizar el infrapoder.',
        author: 'Antonio Gramsci',
      },
    ]);
  };

  const handleIntensifyDiscipline = () => {
    setMachine(prev => {
      const next = {
        ...prev,
        alfa: Math.min(0.65, prev.alfa + 0.10),
        regime: SystemRegime.ALARMA_PUNITIVA,
      };
      machineRef.current = next;
      return next;
    });
    setEvents(prev => [
      ...prev,
      {
        id: `discipline-${currentStepRef.current}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        step: currentStepRef.current,
        type: 'ALARMA',
        title: 'Intensificación Coercitiva: Aceleración de Alfa (+0.10)',
        description: 'The Machine aumentó drásticamente la tasa de vigilancia y disciplinamiento laboral sobre los artefactos-sujetos.',
        theoreticalNote: 'Taylorismo e imposición coercitiva del ritmo de trabajo para contrarrestar la resistencia molecular subalterna.',
        author: 'Herbert Simon & James C. Scott',
      },
    ]);
  };

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
    let filename = `css-simulation-step-${currentStep}.${format}`;
    let mimeType = '';

    if (format === 'csv') {
      const headers = [
        'step',
        'interiorProletariat',
        'interiorCapitalist',
        'exterior',
        'discrepancy',
        'alfa',
        'infrapowerPromedio',
        'phiPromedio',
        'rateOfProfit',
        'rateOfSurplusValue',
        'organicComposition',
        'gini',
        'strikePercentage',
        'regime',
      ];
      const rows = history.map(h => [
        h.step,
        h.interiorProletariat,
        h.interiorCapitalist,
        h.exterior,
        h.discrepancy,
        h.alfa,
        h.infrapowerPromedio,
        h.phiPromedio,
        h.rateOfProfit,
        h.rateOfSurplusValue,
        h.organicComposition,
        h.gini,
        h.strikePercentage,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Barra de cabecera con controles de simulación */}
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

      {/* Banner de contexto del escenario activo */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{activePreset.title}:</span>
            <span className="text-slate-400">{activePreset.subtitle}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedPresetId !== 'p-perro-duo' && (
              <button
                id="btn-switch-to-pperro"
                onClick={() => setSelectedPresetId('p-perro-duo')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition"
              >
                <Terminal className="w-3 h-3" />
                <span>Ejecutar Dúo Original P.Perro (Sani & Djago)</span>
              </button>
            )}
            <button
              id="btn-read-theory"
              onClick={() => setIsTheoryOpen(true)}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <BookOpen className="w-3 h-3" />
              <span>Ver Fundamentos Teóricos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal de la Aplicación */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 flex flex-col gap-4">
        {/* Fila 1: Campo Social de Agentes (Canvas) + Inspector de Agente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[440px]">
          {/* Canvas interactivo (2 columnas en desktop) */}
          <div className="lg:col-span-2 h-[420px] lg:h-[460px]">
            <SocialFieldCanvas
              agents={agents}
              machine={machine}
              selectedAgentId={selectedAgentId}
              onSelectAgent={id => setSelectedAgentId(id)}
              spatialRadius={config.spatialRadius}
            />
          </div>

          {/* Inspector Sociológico del Agente Seleccionado (1 columna) */}
          <div className="h-[420px] lg:h-[460px]">
            <AgentInspector
              agent={selectedAgent}
              exterior={machine.exterior}
              alpha={machine.alfa}
              onTriggerResistance={handleTriggerResistance}
              onToggleStrike={handleToggleStrike}
            />
          </div>
        </div>

        {/* Fila 2: Panel de The Machine y Economía Política */}
        <div>
          <TheMachinePanel
            machine={machine}
            alarmThreshold={config.alarmThreshold}
            onApplyConcession={handleApplyConcession}
            onIntensifyDiscipline={handleIntensifyDiscipline}
            onBoostMechanization={handleBoostMechanization}
          />
        </div>

        {/* Fila 3: Gráficos de Series Temporales (Recharts) + Bitácora Sociológica / Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SimulationCharts data={history} alarmThreshold={config.alarmThreshold} />
          <SociologicalLog events={events} history={history} />
        </div>
      </main>

      {/* Pie de página con créditos académicos */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-3 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Laboratorio de Ciencias Sociales Computacionales (CSS) · Modelo Predictivo Basado en Agentes
          </span>
          <span className="font-mono text-slate-400">
            Inspirado en los ejercicios de P.Perro [-i] · Herbert Simon, James C. Scott, Karl Marx & Antonio Gramsci
          </span>
        </div>
      </footer>

      {/* Modales y Cajones de Configuración */}
      <ConfigDrawer
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onChangeConfig={newCfg => {
          setConfig(newCfg);
        }}
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
