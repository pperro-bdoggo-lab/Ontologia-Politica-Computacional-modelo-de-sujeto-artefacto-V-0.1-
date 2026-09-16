import {
  Agent,
  SocialClass,
  ActionTactic,
  TheMachineState,
  SystemRegime,
  SimulationConfig,
  SimulationMetricsPoint,
  HistoricalEvent,
} from '../types/simulation';

// Generador de distribución normal gaussiana (Box-Muller)
function randomGaussian(mean: number = 0, stdev: number = 1): number {
  const u1 = Math.max(1e-7, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdev;
}

const PROLETARIAT_NAMES = [
  'Sani', 'Djago', 'Rosa', 'Fanon', 'Silvia', 'Gramsci', 'Mariátegui',
  'Subalterno-A', 'Subalterno-B', 'Obrero-Textil', 'Minero-Cobre',
  'Precario-Graphen', 'Operario-Ensamblaje', 'Artesano-Comunal', 'Estibador-Portuario'
];

const CAPITALIST_NAMES = [
  'Hegemon-Tech Corp', 'Consorcio Industrial M-C-M', 'Financiera Rentista',
  'Holding Automotriz', 'Fondo Plusvalía Global', 'Monopolio Extractivo'
];

const TECHNOCRACY_NAMES = [
  'Aparato Hegemónico', 'Burocracia Disciplinaria', 'Inspectores Tayloristas',
  'Agencia de Productividad', 'Algoritmo de Vigilancia'
];

const RESERVE_NAMES = [
  'Desempleado Estructural', 'Vendedor Informal', 'Precario de Plataforma',
  'Migrante Excluido', 'Jornalero Estacional'
];

export function createInitialPopulation(config: SimulationConfig): Agent[] {
  const agents: Agent[] = [];
  let idCounter = 1;

  // 1. Proletariado / Subalternos (Cluster Comunitario / Fabril inicial)
  for (let i = 0; i < config.populationProletariat; i++) {
    const name = i < PROLETARIAT_NAMES.length ? PROLETARIAT_NAMES[i] : `Subalterno-${i + 1}`;
    // Agrupados en el área obrera (35-65, 45-75)
    const x = 35 + (Math.random() - 0.5) * 28;
    const y = 55 + (Math.random() - 0.5) * 28;
    const interior = 12 + Math.random() * 16;
    const rawIp = config.infrapowerMin + Math.random() * (config.infrapowerMax - config.infrapowerMin);

    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.PROLETARIAT,
      interior,
      alienation: 100 - interior,
      compliance: 0.65, // Base de compliance/habitus inicial
      infrapowerRaw: rawIp,
      infrapowerEffective: rawIp,
      isStriking: false,
      activePhi: config.phiBase,
      affinityDescription: 'Alineación inicial en el taller',
      classConsciousness: 0.15 + Math.random() * 0.15,
      capitalistAuraExposure: 0,
      capital: 6 + Math.random() * 8,
      laborPower: 8 + Math.random() * 4,
      wage: config.baseWage,
      realWage: config.baseWage,
      tactic: ActionTactic.ASIMILACION,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      neighborsCount: 0,
    });
  }

  // 2. Capitalistas / Burguesía (Dispersos competitivamente en cuadrante superior/derecho)
  for (let i = 0; i < config.populationCapitalist; i++) {
    const name = i < CAPITALIST_NAMES.length ? CAPITALIST_NAMES[i] : `Capitalista-${i + 1}`;
    const x = 65 + (i * 25) % 30 + (Math.random() - 0.5) * 10;
    const y = 20 + ((i * 18) % 25) + (Math.random() - 0.5) * 10;
    const interior = 82 + Math.random() * 15; // Plenamente asimilados al orden

    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.CAPITALIST,
      interior,
      alienation: Math.max(0, 100 - interior),
      compliance: 0.98,
      infrapowerRaw: 0.02,
      infrapowerEffective: 0.02,
      isStriking: false,
      activePhi: 0.1,
      affinityDescription: 'Interés de clase patronal',
      classConsciousness: 0.88,
      capitalistAuraExposure: 1.0,
      capital: 160 + Math.random() * 120,
      laborPower: 2,
      wage: 0,
      realWage: 0,
      tactic: ActionTactic.DISCIPLINA_PATRONAL,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      neighborsCount: 0,
    });
  }

  // 3. Tecnocracia / Estado / The Machine Enforcers
  for (let i = 0; i < config.populationTechnocracy; i++) {
    const name = i < TECHNOCRACY_NAMES.length ? TECHNOCRACY_NAMES[i] : `Burocracia-${i + 1}`;
    const x = 50 + (Math.random() - 0.5) * 20;
    const y = 18 + Math.random() * 15;
    const interior = 65 + Math.random() * 15;

    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.TECHNOCRACY,
      interior,
      alienation: Math.max(0, 100 - interior),
      compliance: 0.90,
      infrapowerRaw: 0.04,
      infrapowerEffective: 0.04,
      isStriking: false,
      activePhi: 0.0,
      affinityDescription: 'Administración y vigilancia estatal',
      classConsciousness: 0.35,
      capitalistAuraExposure: 0.8,
      capital: 45 + Math.random() * 20,
      laborPower: 4,
      wage: config.baseWage * 1.8,
      realWage: config.baseWage * 1.8,
      tactic: ActionTactic.GESTION_ESTATAL,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      neighborsCount: 0,
    });
  }

  // 4. Ejército Industrial de Reserva (Marx)
  for (let i = 0; i < config.populationReserveArmy; i++) {
    const name = i < RESERVE_NAMES.length ? RESERVE_NAMES[i] : `Precarizado-${i + 1}`;
    const x = 20 + Math.random() * 25;
    const y = 70 + Math.random() * 20;
    const interior = 8 + Math.random() * 12;
    const rawIp = config.infrapowerMin + Math.random() * 0.25;

    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.RESERVE_ARMY,
      interior,
      alienation: 100 - interior,
      compliance: 0.50,
      infrapowerRaw: rawIp,
      infrapowerEffective: rawIp,
      isStriking: false,
      activePhi: config.phiBase - 0.1,
      affinityDescription: 'Subsunción fragmentada en los márgenes',
      classConsciousness: 0.1,
      capitalistAuraExposure: 0,
      capital: 1.5 + Math.random() * 2.5,
      laborPower: 6,
      wage: config.baseWage * 0.35,
      realWage: config.baseWage * 0.35,
      tactic: ActionTactic.ASIMILACION,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      neighborsCount: 0,
    });
  }

  return agents;
}

export function createInitialMachineState(config: SimulationConfig): TheMachineState {
  const initialConstantCapital = config.populationCapitalist * 120;
  const initialVariableCapital = config.populationProletariat * config.baseWage;
  const initialSurplus = initialVariableCapital * 1.5;
  const organicComp = initialConstantCapital / Math.max(1, initialVariableCapital);
  const profitRate = initialSurplus / (initialConstantCapital + initialVariableCapital);

  return {
    exterior: 100.0,
    alfa: config.alphaInitial,
    regime: SystemRegime.CONSENSO_HEGEMONICO,
    movementExterior: 0,
    alarmCount: 0,
    constantCapital: initialConstantCapital,
    variableCapital: initialVariableCapital,
    surplusValue: initialSurplus,
    organicComposition: organicComp,
    rateOfProfit: profitRate,
    rateOfSurplusValue: initialSurplus / initialVariableCapital,
    averageInfrapower: 0.28,
    averageAlienation: 82,
    averagePhi: config.phiBase,
    giniCoefficient: 0.42,
    simpleInfrapowerParticipation: 0.20,
    strikeParticipation: 0.0,
    complianceParticipation: 0.80,
    averageRealWage: config.baseWage,
    capitalistClusterCohesion: 0.0,
    capitalistAuraRadius: config.capitalistAuraBase,
  };
}

function calculateGini(agents: Agent[]): number {
  if (agents.length <= 1) return 0;
  const values = agents.map(a => Math.max(0, a.capital)).sort((a, b) => a - b);
  const n = values.length;
  let numerator = 0;
  let totalSum = 0;

  for (let i = 0; i < n; i++) {
    numerator += (2 * (i + 1) - n - 1) * values[i];
    totalSum += values[i];
  }

  if (totalSum === 0) return 0;
  return Math.min(1, Math.max(0, numerator / (n * totalSum)));
}

/**
 * Función central de evolución de un paso de simulación (Discrete Time Step)
 * Incorpora:
 * 1. No-disgregación espacial: cohesión comunitaria subalterna (evita dispersión infinita)
 * 2. Dinámica del capital: competencia (dispersión) vs estado de alarma (cartelización en cluster)
 * 3. Aura de RP / normalización del capital que construye subjetividad e identidad en los sujetos cercanos
 * 4. Homeostasis sistémica: el compliance/asimilación predomina en la mayoría de casos
 * 5. Segmentación estricta entre Infrapoder simple (cotidiano, individual) y Huelga abierta (colectiva, quorum)
 * 6. Efectividad estabilizadora del Salario Real y de la Acción Represiva de The Machine
 */
export function simulateStep(
  agents: Agent[],
  machine: TheMachineState,
  config: SimulationConfig,
  currentStep: number
): {
  nextAgents: Agent[];
  nextMachine: TheMachineState;
  metricsPoint: SimulationMetricsPoint;
  newEvent: HistoricalEvent | null;
} {
  const isAlarmOrCrisis =
    machine.regime === SystemRegime.ALARMA_PUNITIVA ||
    machine.regime === SystemRegime.CRISIS_ORGANICA;

  // 1. Dinámica espacial avanzada con cohesión social y clustering de clase
  // 1.1 Calcular centroides de clases
  const subalterns = agents.filter(
    a => a.socialClass === SocialClass.PROLETARIAT || a.socialClass === SocialClass.RESERVE_ARMY
  );
  const capitalists = agents.filter(a => a.socialClass === SocialClass.CAPITALIST);
  const technocrats = agents.filter(a => a.socialClass === SocialClass.TECHNOCRACY);

  const subCentroid = subalterns.reduce(
    (acc, a) => ({ x: acc.x + a.x / subalterns.length, y: acc.y + a.y / subalterns.length }),
    { x: 50, y: 60 }
  );

  const capCentroid = capitalists.length > 0
    ? capitalists.reduce(
        (acc, a) => ({ x: acc.x + a.x / capitalists.length, y: acc.y + a.y / capitalists.length }),
        { x: 75, y: 30 }
      )
    : { x: 75, y: 30 };

  // Medir grado de cohesión/dispersión de los capitalistas
  let capAverageDistToCentroid = 0;
  if (capitalists.length > 1) {
    capAverageDistToCentroid =
      capitalists.reduce((sum, c) => sum + Math.hypot(c.x - capCentroid.x, c.y - capCentroid.y), 0) /
      capitalists.length;
  }
  // Cohesión patronal normalizada [0 = dispersos, 1 = cluster compacto]
  const capitalistCohesion = Math.max(0, Math.min(1, 1 - capAverageDistToCentroid / 25));

  // Radio efectivo del aura de RP y normalización del capital
  // Crece cuando el capital actúa como un cluster en estado de alarma
  const effectiveAuraRadius =
    config.capitalistAuraBase * (1 + (isAlarmOrCrisis ? 0.35 + capitalistCohesion * 0.35 : 0));

  // 1.2 Actualizar posiciones espaciales con fuerzas de campo social
  const updatedAgents: Agent[] = agents.map(agent => {
    let ax = 0;
    let ay = 0;

    // Fuerzas para Proletariado y Reserva: Cohesión comunitaria para evitar disgregación paulatina
    if (agent.socialClass === SocialClass.PROLETARIAT || agent.socialClass === SocialClass.RESERVE_ARMY) {
      // Fuerza hacia el centroide de su clase (cohesión social / taller / barrio)
      const distToCenter = Math.hypot(subCentroid.x - agent.x, subCentroid.y - agent.y);
      if (distToCenter > 15) {
        const pull = config.socialCohesionForce * 0.04 * (distToCenter / 30);
        ax += ((subCentroid.x - agent.x) / distToCenter) * pull;
        ay += ((subCentroid.y - agent.y) / distToCenter) * pull;
      }

      // Si está en huelga, siente atracción hacia otros huelguistas (piquete/asamblea)
      if (agent.isStriking) {
        const otherStrikers = subalterns.filter(s => s.id !== agent.id && s.isStriking);
        if (otherStrikers.length > 0) {
          const nearest = otherStrikers[0];
          const d = Math.hypot(nearest.x - agent.x, nearest.y - agent.y);
          if (d > 6) {
            ax += ((nearest.x - agent.x) / d) * 0.05;
            ay += ((nearest.y - agent.y) / d) * 0.05;
          }
        }
      }
    }

    // Fuerzas para Capitalistas: Competencia constante vs Cartelización en Alarma
    if (agent.socialClass === SocialClass.CAPITALIST) {
      if (isAlarmOrCrisis) {
        // EN ALARMA: Los actores del capital se unen formando un cluster patronal defensivo
        const distToCapCenter = Math.hypot(capCentroid.x - agent.x, capCentroid.y - agent.y);
        if (distToCapCenter > 4) {
          const clusterPull = 0.08;
          ax += ((capCentroid.x - agent.x) / distToCapCenter) * clusterPull;
          ay += ((capCentroid.y - agent.y) / distToCapCenter) * clusterPull;
        }
      } else {
        // EN CONSENSO (Competencia constante): Se repelen mutuamente para capturar nichos distintos
        for (const other of capitalists) {
          if (other.id !== agent.id) {
            const d = Math.hypot(other.x - agent.x, other.y - agent.y);
            if (d < 22 && d > 0.1) {
              const repel = 0.04 * (1 - d / 22);
              ax -= ((other.x - agent.x) / d) * repel;
              ay -= ((other.y - agent.y) / d) * repel;
            }
          }
        }
      }
    }

    // Fuerzas para Tecnocracia: Disciplinar zonas de huelga bajo alarma o mantenerse en el centro hegemónico
    if (agent.socialClass === SocialClass.TECHNOCRACY) {
      if (isAlarmOrCrisis) {
        // Moverse hacia donde haya huelga para reprimir o fiscalizar
        const activeStrikers = subalterns.filter(s => s.isStriking);
        if (activeStrikers.length > 0) {
          const target = activeStrikers[0];
          const d = Math.hypot(target.x - agent.x, target.y - agent.y);
          if (d > 10) {
            ax += ((target.x - agent.x) / d) * 0.06;
            ay += ((target.y - agent.y) / d) * 0.06;
          }
        }
      } else {
        // Centro burocrático
        const d = Math.hypot(50 - agent.x, 25 - agent.y);
        if (d > 8) {
          ax += ((50 - agent.x) / d) * 0.02;
          ay += ((25 - agent.y) / d) * 0.02;
        }
      }
    }

    // Separación general de corto alcance (evita superposición total de nodos)
    for (const other of agents) {
      if (other.id !== agent.id) {
        const d = Math.hypot(other.x - agent.x, other.y - agent.y);
        if (d < 4.0 && d > 0.05) {
          const softRepel = 0.03 * (1 - d / 4.0);
          ax -= ((other.x - agent.x) / d) * softRepel;
          ay -= ((other.y - agent.y) / d) * softRepel;
        }
      }
    }

    let nvx = (agent.vx + ax) * 0.92; // Fricción social
    let nvy = (agent.vy + ay) * 0.92;

    // Ruido browniano leve
    nvx += (Math.random() - 0.5) * 0.03;
    nvy += (Math.random() - 0.5) * 0.03;

    // Límites de velocidad
    nvx = Math.max(-0.6, Math.min(0.6, nvx));
    nvy = Math.max(-0.6, Math.min(0.6, nvy));

    let nx = agent.x + nvx;
    let ny = agent.y + nvy;

    // Límites de frontera con rebote elástico suave
    if (nx <= 6) { nx = 6; nvx = -nvx * 0.5; }
    if (nx >= 94) { nx = 94; nvx = -nvx * 0.5; }
    if (ny <= 6) { ny = 6; nvy = -nvy * 0.5; }
    if (ny >= 94) { ny = 94; nvy = -nvy * 0.5; }

    return {
      ...agent,
      x: nx,
      y: ny,
      vx: nvx,
      vy: nvy,
    };
  });

  // 2. Cálculo de Exposición a RP / Aura de Normalización del Capital
  // Representa la capacidad de Relaciones Públicas del capital para construir subjetividad e identidad
  for (const agent of updatedAgents) {
    if (agent.socialClass === SocialClass.PROLETARIAT || agent.socialClass === SocialClass.RESERVE_ARMY) {
      let maxAuraExposure = 0;
      for (const cap of capitalists) {
        const dist = Math.hypot(cap.x - agent.x, cap.y - agent.y);
        if (dist <= effectiveAuraRadius) {
          // Intensidad del aura según cercanía al capitalista
          const exposure = Math.max(0, 1 - dist / effectiveAuraRadius);
          if (exposure > maxAuraExposure) {
            maxAuraExposure = exposure;
          }
        }
      }
      agent.capitalistAuraExposure = maxAuraExposure;
    } else {
      agent.capitalistAuraExposure = agent.socialClass === SocialClass.CAPITALIST ? 1.0 : 0.7;
    }
  }

  // 3. Salario Real y Estabilidad Sistémica
  // El salario real mide el poder de compra frente a las exigencias exteriores del medio
  const currentExterior = machine.exterior;
  for (const agent of updatedAgents) {
    if (agent.socialClass === SocialClass.PROLETARIAT || agent.socialClass === SocialClass.RESERVE_ARMY) {
      // Normalización de salario real respecto al exterior base 100
      agent.realWage = agent.wage * (100 / Math.max(50, currentExterior));
    }
  }

  // 4. Dinámica de Agentes Subalternos: Infrapoder Simple vs Huelga y Homeostasis
  const proletariatAgents = updatedAgents.filter(
    a => a.socialClass === SocialClass.PROLETARIAT || a.socialClass === SocialClass.RESERVE_ARMY
  );

  let collectiveInfrapowerSum = 0;
  let phiSum = 0;
  let simpleInfrapowerCount = 0;
  let strikeCount = 0;
  let complianceCount = 0;
  let totalRealWage = 0;

  for (const agent of proletariatAgents) {
    totalRealWage += agent.realWage;

    // 4.1 Generar infrapoder estocástico base (Scott)
    const ipRaw = config.infrapowerMin + Math.random() * (config.infrapowerMax - config.infrapowerMin);
    agent.infrapowerRaw = ipRaw;

    // 4.2 Vecinos en radio espacial
    const neighbors = proletariatAgents.filter(
      other => other.id !== agent.id &&
        Math.hypot(other.x - agent.x, other.y - agent.y) <= config.spatialRadius
    );
    agent.neighborsCount = neighbors.length;

    // 4.3 Afinidad electiva φ (Weber / Löwy)
    const phi = Math.max(-1.0, Math.min(1.0, config.phiBase + randomGaussian(0, config.phiVolatility)));
    agent.activePhi = phi;
    phiSum += phi;

    // 4.4 Modulación de infrapoder efectivo
    let ipEffective = ipRaw;
    let description = '';

    if (phi > 0.05) {
      const networkBonus = Math.min(0.35, neighbors.length * 0.05);
      const factorPotenciacion = (1 + phi * 0.7) * (1 + networkBonus);
      ipEffective = ipRaw * factorPotenciacion;
      description = `RESONANCIA (φ=${phi.toFixed(2)}): potenciación mutua x${factorPotenciacion.toFixed(2)}`;
    } else if (phi < -0.05) {
      const factorAtenuacion = Math.max(0.15, 1 + phi * 0.6);
      ipEffective = ipRaw * factorAtenuacion;
      description = `DISONANCIA (φ=${phi.toFixed(2)}): fragmentación x${factorAtenuacion.toFixed(2)}`;
    } else {
      description = 'INDIFERENCIA (φ≈0): sin efecto mutuo';
    }

    // 4.5 Efecto de Aura de Normalización del Capital (RP / Hegemonía cultural)
    // "la presencia de actores del capital cercana a clusters de actores debería de generar una
    // identificación del sujeto/artefacto masa con el capital (RP del capital para construir subjetividad)"
    if (agent.capitalistAuraExposure > 0.1) {
      const auraImpact = agent.capitalistAuraExposure;
      // Reduce infrapoder por asimilación psicológica y aspiracionalidad
      ipEffective *= Math.max(0.2, 1 - auraImpact * 0.65);
      // Incrementa adhesión al statu quo (compliance)
      agent.compliance = Math.min(1.0, agent.compliance + auraImpact * 0.08);
      // Falsa conciencia / atenuación de conciencia de clase combativa
      agent.classConsciousness = Math.max(0.05, agent.classConsciousness - auraImpact * 0.05);
      description += ` + RP/Aura Capital (${(auraImpact * 100).toFixed(0)}% identificación)`;
    }

    // 4.6 Efecto estabilizador del Salario Real
    // "El aumento de salario real estabiliza el sistema"
    const wageGap = agent.realWage - config.baseWage;
    if (wageGap > 0) {
      // Salario real abundante pacifica el conflicto: aumenta compliance y reduce radicalización
      const pacification = Math.min(0.4, (wageGap / config.baseWage) * config.wageStabilityFactor);
      ipEffective *= Math.max(0.25, 1 - pacification);
      agent.compliance = Math.min(1.0, agent.compliance + pacification * 0.1);
    } else if (wageGap < -0.5) {
      // Precarización: estimula descontento
      const grievance = Math.min(0.3, Math.abs(wageGap / config.baseWage) * 0.2);
      ipEffective += grievance;
      agent.compliance = Math.max(0.05, agent.compliance - 0.05);
    }

    // 4.7 Efecto de la Acción Represiva de The Machine (Alarma punitiva y alfa alto)
    // "así mismo como la acción represiva de the machine"
    if (machine.regime === SystemRegime.ALARMA_PUNITIVA) {
      // Coerción y presencia policial/burocrática eleva drásticamente el costo de huelga abierta
      // y obliga al repliegue defensivo
      const repressiveForce = (machine.alfa / 0.65) * config.repressiveEfficiency;
      if (agent.isStriking) {
        // Probabilidad de quiebre o disolución policial del piquete
        if (Math.random() < repressiveForce * 0.45 + 0.1) {
          agent.isStriking = false; // Desarticulación forzosa de la huelga
          agent.compliance = Math.min(0.9, agent.compliance + 0.15); // Sumisión forzada
        }
      }
    }

    agent.infrapowerEffective = Math.min(1.3, Math.max(0.02, ipEffective));
    agent.affinityDescription = description;
    collectiveInfrapowerSum += agent.infrapowerEffective;

    // 4.8 Conciencia de clase: evolución lenta y contextual
    if (phi > 0.25 && neighbors.length >= 3 && agent.capitalistAuraExposure < 0.25) {
      agent.classConsciousness = Math.min(1.0, agent.classConsciousness + 0.015);
    } else if (agent.capitalistAuraExposure > 0.4 || phi < -0.2) {
      agent.classConsciousness = Math.max(0.05, agent.classConsciousness - 0.02);
    }

    // 4.9 SEGMENTACIÓN ESTRICTA: Infrapoder Simple vs Acción de Huelga Abierta
    // - Huelga abierta: Requiere acción colectiva consciente, red de apoyo/quorum local (>= 2 vecinos),
    //   alta conciencia de clase (>= 0.48), alta resonancia (phi > 0.15), baja cooptación por RP del capital,
    //   y alto agravio o infrapoder efectivo >= 0.72.
    // - Infrapoder simple: Resistencia cotidiana individual (armas de los débiles de Scott),
    //   NO suspende el trabajo, NO rompe el salario, pero desgasta la tasa de extracción.
    // - Asimilación / Compliance: Adhesión cotidiana hegemónica (la mayoría en homeostasis).
    const strikeNeighbors = neighbors.filter(n => n.classConsciousness > 0.4 || n.isStriking).length;
    const canStrike =
      strikeNeighbors >= 2 &&
      agent.classConsciousness >= 0.45 &&
      agent.activePhi >= 0.12 &&
      agent.capitalistAuraExposure < 0.35 &&
      (agent.infrapowerEffective >= 0.72 || agent.realWage < config.baseWage * 0.85);

    if (agent.isStriking) {
      // Si ya está en huelga, evalúa si sostenerla o ceder por desgaste o concesiones
      if (agent.capital < 1.0 || agent.realWage > config.baseWage * 1.15 || agent.capitalistAuraExposure > 0.5) {
        agent.isStriking = false;
        agent.tactic = ActionTactic.ASIMILACION;
        complianceCount++;
      } else {
        agent.isStriking = true;
        agent.tactic = ActionTactic.HUELGA_RESONANTE;
        strikeCount++;
      }
    } else if (canStrike) {
      agent.isStriking = true;
      agent.tactic = ActionTactic.HUELGA_RESONANTE;
      strikeCount++;
    } else if (agent.infrapowerEffective > 0.40) {
      // Infrapoder simple (cotidiano, disimulado, no huelga)
      agent.isStriking = false;
      agent.tactic = ActionTactic.INFRAPODER_MICROSCOPICO;
      simpleInfrapowerCount++;
    } else {
      // Asimilación y compliance (homeostasis predominante)
      agent.isStriking = false;
      agent.tactic = ActionTactic.ASIMILACION;
      complianceCount++;
    }

    // 4.10 Dinámica del Artefacto (Herbert Simon / Cioffi-Revilla)
    // Discrepancia = Exterior - Interior
    const discrepancia = currentExterior - agent.interior;
    agent.alienation = Math.max(0, discrepancia);

    // Asimilación hegemónica del interior:
    // La presión alfa empuja el interior hacia el exterior.
    // El infrapoder frena la asimilación; el aura de RP del capital la acelera.
    const resistenciaAsimilacion = Math.max(0.1, 1 - agent.infrapowerEffective * 0.75);
    const auraImpulso = 1 + agent.capitalistAuraExposure * 0.6;
    const efectoAsimilacion = machine.alfa * discrepancia * resistenciaAsimilacion * auraImpulso * 0.12;

    agent.interior = Math.max(0, agent.interior + efectoAsimilacion);
  }

  // Actualizar agentes no proletarios (capitalistas y tecnocracia)
  for (const agent of updatedAgents) {
    if (agent.socialClass === SocialClass.CAPITALIST) {
      const discrepancia = currentExterior - agent.interior;
      agent.alienation = Math.max(0, discrepancia);
      agent.interior = Math.min(currentExterior, agent.interior + machine.alfa * discrepancia * 0.4);
      agent.tactic = isAlarmOrCrisis
        ? ActionTactic.CARTEL_PATRONAL_ALARMA
        : ActionTactic.DISCIPLINA_PATRONAL;
    } else if (agent.socialClass === SocialClass.TECHNOCRACY) {
      const discrepancia = currentExterior - agent.interior;
      agent.alienation = Math.max(0, discrepancia);
      agent.interior = Math.min(currentExterior, agent.interior + machine.alfa * discrepancia * 0.3);
      agent.tactic = ActionTactic.GESTION_ESTATAL;
    }
  }

  // 5. Coevolución de The Machine y Homeostasis
  const proletarianTotal = Math.max(1, proletariatAgents.length);
  const ipPromedio = collectiveInfrapowerSum / proletarianTotal;
  const phiPromedio = phiSum / proletarianTotal;
  const strikeRate = strikeCount / proletarianTotal;
  const simpleIpRate = simpleInfrapowerCount / proletarianTotal;
  const complianceRate = complianceCount / proletarianTotal;
  const avgRealWage = totalRealWage / proletarianTotal;

  let nuevoAlfa = machine.alfa;
  let movimientoExterior = 0;
  let nuevoRegimen = machine.regime;
  let newAlarmCount = machine.alarmCount;

  // Condiciones de Alarma del Sistema:
  // Se activa si las huelgas superan el 20% o el infrapoder general supera el umbral configurado
  const sistemaEnTension = ipPromedio > config.alarmThreshold || strikeRate > 0.20;

  if (sistemaEnTension) {
    // ALARMA: The Machine intensifica la presión punitiva (alfa sube)
    nuevoAlfa = machine.alfa + config.machineReactionFactor;
    movimientoExterior = 2.0 + Math.random() * 3.0; // Punición exterior
    nuevoRegimen = SystemRegime.ALARMA_PUNITIVA;
    newAlarmCount++;
  } else {
    // CONSENSO / HOMEOSTASIS: El sistema relaja la coerción y acerca el exterior para pacificar
    nuevoAlfa = machine.alfa - config.machineReactionFactor * 0.8;
    movimientoExterior = -(1.0 + Math.random() * 2.0); // Concesión hegemónica
    nuevoRegimen = SystemRegime.CONSENSO_HEGEMONICO;
  }

  // Acotar alfa entre 0.05 y 0.65
  nuevoAlfa = Math.max(0.05, Math.min(0.65, nuevoAlfa));
  const nuevoExterior = Math.max(60, Math.min(150, machine.exterior + movimientoExterior));

  // 6. Economía Política Marxista: Acumulación, Salarios y TRPF
  let variableCapital = 0;
  let extractedSurplus = 0;

  for (const agent of proletariatAgents) {
    if (agent.isStriking) {
      // Huelguista: Cero producción de plusvalía y consume fondo de subsistencia
      agent.capital = Math.max(0.5, agent.capital - 0.25);
    } else {
      variableCapital += agent.wage;
      const potentialOutput = agent.laborPower * 2.4;
      // Infrapoder simple genera un micro-desgaste en la tasa de extracción sin parar la producción
      const microResistanceLoss = agent.infrapowerEffective * 0.25;
      const surplusPerWorker = Math.max(0, (potentialOutput - agent.wage) * (1 - microResistanceLoss));
      extractedSurplus += surplusPerWorker;

      // Ahorro neto obrero tras subsistencia
      agent.capital += agent.wage * 0.18;
    }
  }

  // Capital constante c crece por mecanización/competencia
  const mechanizationIncrease = config.mechanizationSpeed * (1 + (machine.rateOfProfit > 0.14 ? 0.05 : 0.01));
  const constantCapital = machine.constantCapital + mechanizationIncrease;
  const organicComp = constantCapital / Math.max(1, variableCapital);
  const rateOfProfit = extractedSurplus / Math.max(1, constantCapital + variableCapital);
  const rateOfSurplusValue = extractedSurplus / Math.max(1, variableCapital);

  // Transferencia de plusvalía a capitalistas
  if (capitalists.length > 0) {
    const surplusShare = extractedSurplus / capitalists.length;
    for (const cap of capitalists) {
      cap.capital += surplusShare;
    }
  }

  // Detección de Crisis Orgánica (Marx TRPF + Gramsci):
  // Caída severa de tasa de ganancia + insurrección activa
  if (rateOfProfit < 0.075 && (strikeRate > 0.25 || ipPromedio > 0.52)) {
    nuevoRegimen = SystemRegime.CRISIS_ORGANICA;
  }

  // Coeficiente de Gini
  const gini = calculateGini(updatedAgents);

  // Promedios de interior y alienación
  const meanInteriorProletariat =
    proletariatAgents.reduce((sum, a) => sum + a.interior, 0) / proletarianTotal;
  const meanInteriorCapitalist =
    capitalists.length > 0
      ? capitalists.reduce((sum, a) => sum + a.interior, 0) / capitalists.length
      : 85;
  const meanAlienation =
    proletariatAgents.reduce((sum, a) => sum + a.alienation, 0) / proletarianTotal;

  const nextMachine: TheMachineState = {
    exterior: nuevoExterior,
    alfa: nuevoAlfa,
    regime: nuevoRegimen,
    movementExterior: movimientoExterior,
    alarmCount: newAlarmCount,
    constantCapital,
    variableCapital,
    surplusValue: extractedSurplus,
    organicComposition: organicComp,
    rateOfProfit,
    rateOfSurplusValue,
    averageInfrapower: ipPromedio,
    averageAlienation: meanAlienation,
    averagePhi: phiPromedio,
    giniCoefficient: gini,
    simpleInfrapowerParticipation: simpleIpRate,
    strikeParticipation: strikeRate,
    complianceParticipation: complianceRate,
    averageRealWage: avgRealWage,
    capitalistClusterCohesion: capitalistCohesion,
    capitalistAuraRadius: effectiveAuraRadius,
  };

  const metricsPoint: SimulationMetricsPoint = {
    step: currentStep,
    interiorProletariat: parseFloat(meanInteriorProletariat.toFixed(2)),
    interiorCapitalist: parseFloat(meanInteriorCapitalist.toFixed(2)),
    exterior: parseFloat(nuevoExterior.toFixed(2)),
    discrepancy: parseFloat((nuevoExterior - meanInteriorProletariat).toFixed(2)),
    alfa: parseFloat(nuevoAlfa.toFixed(3)),
    infrapowerPromedio: parseFloat(ipPromedio.toFixed(3)),
    phiPromedio: parseFloat(phiPromedio.toFixed(3)),
    rateOfProfit: parseFloat(rateOfProfit.toFixed(3)),
    rateOfSurplusValue: parseFloat(rateOfSurplusValue.toFixed(3)),
    organicComposition: parseFloat(organicComp.toFixed(2)),
    gini: parseFloat(gini.toFixed(3)),
    simpleInfrapowerPercentage: parseFloat((simpleIpRate * 100).toFixed(1)),
    strikePercentage: parseFloat((strikeRate * 100).toFixed(1)),
    compliancePercentage: parseFloat((complianceRate * 100).toFixed(1)),
    realWagePromedio: parseFloat(avgRealWage.toFixed(2)),
    capitalistCohesion: parseFloat(capitalistCohesion.toFixed(2)),
    regime: nuevoRegimen,
  };

  // 7. Generador de Eventos Históricos Sociológicos
  let newEvent: HistoricalEvent | null = null;
  const generateEventId = (prefix: string) =>
    `event-${prefix}-${currentStep}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (machine.regime !== nuevoRegimen) {
    if (nuevoRegimen === SystemRegime.CRISIS_ORGANICA) {
      newEvent = {
        id: generateEventId('crisis'),
        step: currentStep,
        type: 'CRISIS',
        title: 'Bifurcación: Crisis Orgánica y Bloqueo de Acumulación',
        description: `La tasa de ganancia general cayó a ${(rateOfProfit * 100).toFixed(1)}% bajo c/v=${organicComp.toFixed(2)}, coincidiendo con un paro obrero del ${(strikeRate * 100).toFixed(0)}%.`,
        theoreticalNote: 'Ley de la Tendencia Decreciente de la Tasa de Ganancia (Marx, El Capital t. III) articulada con la crisis de autoridad y ruptura de hegemonía gramsciana.',
        author: 'Karl Marx & Antonio Gramsci',
      };
    } else if (nuevoRegimen === SystemRegime.ALARMA_PUNITIVA) {
      newEvent = {
        id: generateEventId('alarma'),
        step: currentStep,
        type: 'ALARMA',
        title: 'Régimen de Alarma: Cartel Patronal y Disciplina de The Machine',
        description: `Infrapoder agregado (${(ipPromedio * 100).toFixed(0)}%) o huelgas superaron el umbral. El capital superó su rivalidad competitiva agrupándose en cluster patronal, mientras The Machine elevó alfa a ${nuevoAlfa.toFixed(2)}.`,
        theoreticalNote: 'Coerción burocrática (Foucault) y unión de la burguesía en bloque de clase cuando su tasa de extracción se ve amenazada.',
        author: 'Herbert Simon & James C. Scott',
      };
    } else if (nuevoRegimen === SystemRegime.CONSENSO_HEGEMONICO) {
      newEvent = {
        id: generateEventId('relajacion'),
        step: currentStep,
        type: 'RELAJACION',
        title: 'Homeostasis Restaurada: Consenso y Asimilación Mayoritaria',
        description: `El sistema logró pacificar el disenso: compliance alcanzó el ${(complianceRate * 100).toFixed(0)}%. Alfa disminuyó a ${nuevoAlfa.toFixed(2)} y los capitalistas regresaron a su competencia de mercado habitual.`,
        theoreticalNote: 'Homeostasis hegemónica: la asimilación del interior del artefacto al statu quo predomina sin necesidad de coerción continua abierta (Bourdieu / Gramsci).',
        author: 'Antonio Gramsci & Pierre Bourdieu',
      };
    }
  } else if (strikeRate > 0.30 && currentStep % 5 === 0) {
    newEvent = {
      id: generateEventId('strike'),
      step: currentStep,
      type: 'HUELGA',
      title: `Huelga Abierta Masiva: ${(strikeRate * 100).toFixed(0)}% de Participación`,
      description: `Los subalternos superaron el infrapoder microscópico y formaron asambleas de huelga abierta con alta resonancia (φ=${phiPromedio.toFixed(2)}).`,
      theoreticalNote: 'Transición de la resistencia cotidiana individual (Scott) a la Huelga de Masas organizada (Rosa Luxemburg).',
      author: 'Rosa Luxemburg & Michael Löwy',
    };
  } else if (capitalistCohesion > 0.75 && isAlarmOrCrisis && currentStep % 7 === 0) {
    newEvent = {
      id: generateEventId('cluster'),
      step: currentStep,
      type: 'CLUSTER_PATRONAL',
      title: 'Cartelización del Capital: Aura de Normalización Expandida',
      description: `Los actores del capital formaron un cluster defensivo cohesionado (cohesión ${(capitalistCohesion * 100).toFixed(0)}%), expandiendo su radio de influencia ideológica y RP a ${effectiveAuraRadius.toFixed(0)}px.`,
      theoreticalNote: 'Construcción de subjetividad empresarial y consenso pasivo: el capital unificado proyecta un aura cultural que coopta a los subalternos circundantes.',
      author: 'Antonio Gramsci & Herbert Marcuse',
    };
  } else if (phiPromedio > 0.45 && currentStep % 8 === 0) {
    newEvent = {
      id: generateEventId('res'),
      step: currentStep,
      type: 'RESONANCIA',
      title: 'Resonancia Colectiva Subalterna',
      description: `Afinidad electiva promedio (φ=${phiPromedio.toFixed(2)}) fortalece la densidad comunitaria y neutraliza temporalmente la alienación.`,
      theoreticalNote: 'Afinidad electiva: convergencia ética y política de los estratos dominados (Weber / Löwy).',
      author: 'Max Weber & Michael Löwy',
    };
  }

  return {
    nextAgents: updatedAgents,
    nextMachine,
    metricsPoint,
    newEvent,
  };
}
