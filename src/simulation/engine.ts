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

// Generador de nombres representativos del corpus sociológico y del ejercicio del usuario
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

  // 1. Proletariado / Subalternos
  for (let i = 0; i < config.populationProletariat; i++) {
    const name = i < PROLETARIAT_NAMES.length ? PROLETARIAT_NAMES[i] : `Subalterno-${i + 1}`;
    // Distribución espacial en cuadrante inferior/izquierdo con dispersión
    const x = 30 + Math.random() * 40;
    const y = 35 + Math.random() * 40;
    // Estado interior inicial (Simon/Cioffi-Revilla: alrededor de 10-20 ante un exterior de 100)
    const interior = 10 + Math.random() * 15;
    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.PROLETARIAT,
      interior,
      alienation: 100 - interior,
      infrapowerRaw: config.infrapowerMin + Math.random() * (config.infrapowerMax - config.infrapowerMin),
      infrapowerEffective: 0,
      activePhi: config.phiBase,
      affinityDescription: 'Alineación inicial',
      classConsciousness: 0.15 + Math.random() * 0.2,
      capital: 5 + Math.random() * 10,
      laborPower: 8 + Math.random() * 4,
      wage: config.baseWage,
      isStriking: false,
      tactic: ActionTactic.INFRAPODER_MICROSCOPICO,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      neighborsCount: 0,
    });
  }

  // 2. Capitalistas / Burguesía
  for (let i = 0; i < config.populationCapitalist; i++) {
    const name = i < CAPITALIST_NAMES.length ? CAPITALIST_NAMES[i] : `Capitalista-${i + 1}`;
    const x = 70 + Math.random() * 25;
    const y = 20 + Math.random() * 30;
    const interior = 75 + Math.random() * 20; // Asimilados al statu quo
    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.CAPITALIST,
      interior,
      alienation: Math.max(0, 100 - interior),
      infrapowerRaw: 0.02,
      infrapowerEffective: 0.02,
      activePhi: 0.1,
      affinityDescription: 'Interés de clase burgués',
      classConsciousness: 0.85, // Alta conciencia de clase burguesa
      capital: 150 + Math.random() * 100,
      laborPower: 2,
      wage: 0,
      isStriking: false,
      tactic: ActionTactic.DISCIPLINA_PATRONAL,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      neighborsCount: 0,
    });
  }

  // 3. Tecnocracia / Estado / The Machine Enforcers
  for (let i = 0; i < config.populationTechnocracy; i++) {
    const name = i < TECHNOCRACY_NAMES.length ? TECHNOCRACY_NAMES[i] : `Burocracia-${i + 1}`;
    const x = 50 + (Math.random() - 0.5) * 30;
    const y = 15 + Math.random() * 20;
    const interior = 60 + Math.random() * 15;
    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.TECHNOCRACY,
      interior,
      alienation: Math.max(0, 100 - interior),
      infrapowerRaw: 0.05,
      infrapowerEffective: 0.05,
      activePhi: 0.0,
      affinityDescription: 'Administración hegemónica',
      classConsciousness: 0.4,
      capital: 40 + Math.random() * 20,
      laborPower: 4,
      wage: config.baseWage * 1.8,
      isStriking: false,
      tactic: ActionTactic.GESTION_ESTATAL,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      neighborsCount: 0,
    });
  }

  // 4. Ejército Industrial de Reserva (Marx)
  for (let i = 0; i < config.populationReserveArmy; i++) {
    const name = i < RESERVE_NAMES.length ? RESERVE_NAMES[i] : `Precarizado-${i + 1}`;
    const x = 15 + Math.random() * 30;
    const y = 65 + Math.random() * 25;
    const interior = 5 + Math.random() * 10;
    agents.push({
      id: `agent-${idCounter++}`,
      name,
      socialClass: SocialClass.RESERVE_ARMY,
      interior,
      alienation: 100 - interior,
      infrapowerRaw: config.infrapowerMin + Math.random() * 0.3,
      infrapowerEffective: 0,
      activePhi: config.phiBase - 0.1,
      affinityDescription: 'Subsunción fragmentada',
      classConsciousness: 0.1,
      capital: 1 + Math.random() * 3,
      laborPower: 6,
      wage: config.baseWage * 0.3, // Precarización
      isStriking: false,
      tactic: ActionTactic.INFRAPODER_MICROSCOPICO,
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
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
    averageInfrapower: 0.3,
    averageAlienation: 85,
    averagePhi: config.phiBase,
    giniCoefficient: 0.42,
    strikeParticipation: 0,
  };
}

// Cálculo del coeficiente de Gini para medir desigualdad en el modelo
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
 * Fusión de los 4 módulos originales de P.Perro con dinámica heterodoxa de clases
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
  // 1. Dinámica espacial y movimiento suave de agentes en el campo
  const updatedAgents: Agent[] = agents.map(agent => {
    let nx = agent.x + agent.vx;
    let ny = agent.y + agent.vy;
    let nvx = agent.vx;
    let nvy = agent.vy;

    // Rebote elástico en fronteras de 0 a 100
    if (nx <= 5) { nx = 5; nvx = -nvx; }
    if (nx >= 95) { nx = 95; nvx = -nvx; }
    if (ny <= 5) { ny = 5; nvy = -nvy; }
    if (ny >= 95) { ny = 95; nvy = -nvy; }

    // Perturbación estocástica suave
    nvx += (Math.random() - 0.5) * 0.05;
    nvy += (Math.random() - 0.5) * 0.05;
    // Amortiguación de velocidad
    nvx = Math.max(-0.8, Math.min(0.8, nvx));
    nvy = Math.max(-0.8, Math.min(0.8, nvy));

    return {
      ...agent,
      x: nx,
      y: ny,
      vx: nvx,
      vy: nvy,
    };
  });

  // 2. Red de Afinidad Electiva Local (Weber / Löwy) e Infrapoder Colectivo
  // Se evalúan interacciones entre agentes proletarios y precarizados en su radio
  const proletariatAgents = updatedAgents.filter(
    a => a.socialClass === SocialClass.PROLETARIAT || a.socialClass === SocialClass.RESERVE_ARMY
  );

  let collectiveInfrapowerSum = 0;
  let phiSum = 0;
  let strikeCount = 0;

  for (const agent of proletariatAgents) {
    // 2.1 Generar infrapoder estocástico crudo (Scott / Módulo 2 de P.Perro)
    const ipRaw = config.infrapowerMin + Math.random() * (config.infrapowerMax - config.infrapowerMin);
    agent.infrapowerRaw = ipRaw;

    // 2.2 Buscar vecinos en el radio de interacción espacial
    const neighbors = proletariatAgents.filter(
      other => other.id !== agent.id &&
        Math.hypot(other.x - agent.x, other.y - agent.y) <= config.spatialRadius
    );
    agent.neighborsCount = neighbors.length;

    // 2.3 Calcular Afinidad Electiva φ (Módulo 4 de P.Perro)
    // φ fluctúa alrededor de phiBase con variabilidad gaussiana
    const phi = Math.max(-1.0, Math.min(1.0, config.phiBase + randomGaussian(0, config.phiVolatility)));
    agent.activePhi = phi;
    phiSum += phi;

    // 2.4 Calcular Infrapoder Colectivo Efectivo según Resonancia / Disonancia
    let ipEffective = ipRaw;
    let description = '';

    if (phi > 0) {
      // Resonancia (potenciación mutua): factor = 1 + phi
      // Si tiene vecinos cercanos, hay un bono adicional de organización asamblearia
      const networkBonus = Math.min(0.5, neighbors.length * 0.08);
      const factorPotenciacion = (1 + phi) * (1 + networkBonus);
      ipEffective = ipRaw * factorPotenciacion;
      description = `RESONANCIA (φ=${phi.toFixed(2)}): potenciado x${factorPotenciacion.toFixed(2)}`;
    } else if (phi < 0) {
      // Disonancia (interferencia mutua / fragmentación): factor = 1 + phi
      const factorAtenuacion = Math.max(0.05, 1 + phi);
      ipEffective = ipRaw * factorAtenuacion;
      description = `DISONANCIA (φ=${phi.toFixed(2)}): atenuado x${factorAtenuacion.toFixed(2)}`;
    } else {
      description = `INDIFERENCIA (φ≈0): sin efecto mutuo`;
    }

    // Acotar infrapoder efectivo a rango razonable [0, 1.3]
    agent.infrapowerEffective = Math.min(1.3, Math.max(0.02, ipEffective));
    agent.affinityDescription = description;
    collectiveInfrapowerSum += agent.infrapowerEffective;

    // 2.5 Actualización de conciencia de clase (Klasse für sich)
    if (phi > 0.3 && neighbors.length >= 2) {
      agent.classConsciousness = Math.min(1.0, agent.classConsciousness + 0.03);
    } else if (phi < -0.2) {
      agent.classConsciousness = Math.max(0.05, agent.classConsciousness - 0.02);
    }

    // 2.6 Decisión de huelga / táctica
    // Si infrapoder efectivo > 0.8 y conciencia > 0.5, huelga resonante abierta
    if (agent.infrapowerEffective >= 0.78 && agent.classConsciousness >= 0.45) {
      agent.isStriking = true;
      agent.tactic = ActionTactic.HUELGA_RESONANTE;
      strikeCount++;
    } else if (agent.infrapowerEffective > 0.4) {
      agent.isStriking = false;
      agent.tactic = ActionTactic.INFRAPODER_MICROSCOPICO;
    } else {
      agent.isStriking = false;
      agent.tactic = ActionTactic.ASIMILACION;
    }

    // 2.7 Dinámica de Adaptación del Artefacto (Herbert Simon / Cioffi-Revilla / Módulos 1, 2, 4)
    // Discrepancia = Exterior - Interior
    const discrepancia = machine.exterior - agent.interior;
    agent.alienation = discrepancia;

    // La asimilación efectiva es mitigada por el infrapoder
    // Si infrapoder es alto, frena la domesticación
    const factorMitigacion = Math.max(0.0, 1 - agent.infrapowerEffective);
    const efectoAsimilacion = machine.alfa * discrepancia * factorMitigacion;
    agent.interior = Math.max(0, agent.interior + efectoAsimilacion);
  }

  // Agentes burgueses y tecnocráticos (no proletarios)
  for (const agent of updatedAgents) {
    if (agent.socialClass === SocialClass.CAPITALIST || agent.socialClass === SocialClass.TECHNOCRACY) {
      const discrepancia = machine.exterior - agent.interior;
      agent.alienation = Math.max(0, discrepancia);
      // Asimilación directa sin infrapoder de resistencia obrera
      agent.interior = Math.min(machine.exterior, agent.interior + machine.alfa * discrepancia * 0.7);
    }
  }

  // 3. Reacción Dinámica de The Machine (Módulo 3 y 4 de P.Perro)
  const proletarianCount = Math.max(1, proletariatAgents.length);
  const ipPromedio = collectiveInfrapowerSum / proletarianCount;
  const phiPromedio = phiSum / proletarianCount;
  const strikeRate = strikeCount / proletarianCount;

  let nuevoAlfa = machine.alfa;
  let movimientoExterior = 0;
  let nuevoRegimen = machine.regime;
  let newAlarmCount = machine.alarmCount;

  // Umbral de alarma del sistema
  if (ipPromedio > config.alarmThreshold || strikeRate > 0.35) {
    // ALARMA: El sistema eleva la presión de control y castiga alejando el exterior
    nuevoAlfa = machine.alfa + config.machineReactionFactor;
    movimientoExterior = 3.0 + Math.random() * 5.0; // Castigo: El exterior se aleja
    nuevoRegimen = SystemRegime.ALARMA_PUNITIVA;
    newAlarmCount++;
  } else {
    // RELAJACIÓN / CONSENSO: El sistema reduce la presión punitiva y se acerca
    nuevoAlfa = machine.alfa - config.machineReactionFactor;
    movimientoExterior = -(1.0 + Math.random() * 3.0); // Concesión hegemónica: El exterior se acerca
    nuevoRegimen = SystemRegime.CONSENSO_HEGEMONICO;
  }

  // Acotar alfa a rangos realistas (según script v4: entre 0.03 y 0.65)
  nuevoAlfa = Math.max(0.03, Math.min(0.65, nuevoAlfa));
  const nuevoExterior = Math.max(50, Math.min(160, machine.exterior + movimientoExterior));

  // 4. Economía Política Marxista: Acumulación de Capital y Tasa de Ganancia
  // Capital Variable v: masa de salarios pagada a trabajadores no huelguistas
  let variableCapital = 0;
  let potentialOutput = 0;
  let extractedSurplus = 0;

  for (const agent of proletariatAgents) {
    if (agent.isStriking) {
      // En huelga: salario de subsistencia reducido de caja de resistencia, cero producción
      agent.capital = Math.max(0.5, agent.capital - 0.2);
    } else {
      variableCapital += agent.wage;
      // Producción potencial
      const output = agent.laborPower * 2.2;
      potentialOutput += output;
      // Extracción de plusvalía mitigada por infrapoder cotidiano (resistencia en el taller)
      const surplusPerWorker = Math.max(0, (output - agent.wage) * (1 - agent.infrapowerEffective * 0.7));
      extractedSurplus += surplusPerWorker;

      // Pago de salario al trabajador
      agent.capital += agent.wage * 0.2; // Ahorro neto tras subsistencia
    }
  }

  // Capital Constante c crece por mecanización/competencia entre capitalistas
  const mechanizationIncrease = config.mechanizationSpeed * (1 + (machine.rateOfProfit > 0.15 ? 0.05 : 0.01));
  const constantCapital = machine.constantCapital + mechanizationIncrease;

  // Composición Orgánica del Capital OCC = c / v
  const organicComp = constantCapital / Math.max(1, variableCapital);

  // Tasa de Ganancia General: Pi = s / (c + v)
  const rateOfProfit = extractedSurplus / Math.max(1, constantCapital + variableCapital);
  const rateOfSurplusValue = extractedSurplus / Math.max(1, variableCapital);

  // Transferencia de plusvalía a capitalistas
  const capitalists = updatedAgents.filter(a => a.socialClass === SocialClass.CAPITALIST);
  if (capitalists.length > 0) {
    const surplusShare = extractedSurplus / capitalists.length;
    for (const cap of capitalists) {
      cap.capital += surplusShare;
    }
  }

  // Detectar Crisis Orgánica (Gramsci / Marx TRPF):
  // Si la tasa de ganancia cae drásticamente (< 0.08) y el infrapoder obrero es alto (> 0.55)
  if (rateOfProfit < 0.08 && ipPromedio > 0.50) {
    nuevoRegimen = SystemRegime.CRISIS_ORGANICA;
  }

  // 5. Coeficiente de Gini
  const gini = calculateGini(updatedAgents);

  // Promedios de telemetría
  const meanInteriorProletariat =
    proletariatAgents.reduce((sum, a) => sum + a.interior, 0) / proletarianCount;
  const meanInteriorCapitalist =
    capitalists.length > 0
      ? capitalists.reduce((sum, a) => sum + a.interior, 0) / capitalists.length
      : 80;
  const meanAlienation =
    proletariatAgents.reduce((sum, a) => sum + a.alienation, 0) / proletarianCount;

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
    strikeParticipation: strikeRate,
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
    strikePercentage: parseFloat((strikeRate * 100).toFixed(1)),
    regime: nuevoRegimen,
  };

  // 6. Generador de Eventos Históricos Sociológicos (Bitácora de Ciencias Sociales Computacionales)
  let newEvent: HistoricalEvent | null = null;
  const generateEventId = (prefix: string) =>
    `event-${prefix}-${currentStep}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Detección de cambio de régimen o eventos paradigmáticos
  if (machine.regime !== nuevoRegimen) {
    if (nuevoRegimen === SystemRegime.CRISIS_ORGANICA) {
      newEvent = {
        id: generateEventId('crisis'),
        step: currentStep,
        type: 'CRISIS',
        title: 'Bifurcación: Crisis Orgánica del Modo de Producción',
        description: `La tasa de ganancia general cayó a ${(rateOfProfit * 100).toFixed(1)}% bajo una composición orgánica c/v de ${organicComp.toFixed(2)}, mientras el infrapoder colectivo superó el umbral crítico.`,
        theoreticalNote: 'Articulación de la Ley de la Tendencia Decreciente de la Cuota de Ganancia (Marx, El Capital t. III) con la noción gramsciana de Crisis Orgánica donde la hegemonía se resquebraja y las clases subalternas entran en disrupción.',
        author: 'Karl Marx & Antonio Gramsci',
      };
    } else if (nuevoRegimen === SystemRegime.ALARMA_PUNITIVA) {
      newEvent = {
        id: generateEventId('alarma'),
        step: currentStep,
        type: 'ALARMA',
        title: 'Régimen de Alarma Sistémica: Disciplinamiento de The Machine',
        description: `The Machine detectó un infrapoder agregado de ${(ipPromedio * 100).toFixed(1)}% (> umbral ${(config.alarmThreshold * 100).toFixed(0)}%). La presión alfa subió a ${nuevoAlfa.toFixed(2)} y el exterior se desplazó punitivamente a ${nuevoExterior.toFixed(1)}.`,
        theoreticalNote: 'Módulo 3 y 4 de coevolución: el sistema percibe la resistencia encubierta y exacerba su coerción. Foucault (Vigilar y Castigar) y Scott (Dominación y Artes de la Resistencia).',
        author: 'Herbert Simon & James C. Scott',
      };
    } else if (nuevoRegimen === SystemRegime.CONSENSO_HEGEMONICO) {
      newEvent = {
        id: generateEventId('relajacion'),
        step: currentStep,
        type: 'RELAJACION',
        title: 'Régimen de Consenso Hegemónico: Relajación de Presión',
        description: `El infrapoder colectivo disminuyó a ${(ipPromedio * 100).toFixed(1)}%. The Machine redujo alfa a ${nuevoAlfa.toFixed(2)} y el exterior retrocedió a ${nuevoExterior.toFixed(1)} buscando pasivización.`,
        theoreticalNote: 'Transformismo y hegemonía consensual: el bloque dominante no necesita violencia abierta cuando el habitus subalterno se reacomoda al statu quo (Bourdieu / Gramsci).',
        author: 'Antonio Gramsci & Pierre Bourdieu',
      };
    }
  } else if (strikeRate > 0.4 && currentStep % 5 === 0) {
    newEvent = {
      id: generateEventId('strike'),
      step: currentStep,
      type: 'HUELGA',
      title: `Ola de Huelgas Resonantes: ${(strikeRate * 100).toFixed(0)}% de Participación`,
      description: `La afinidad colectiva positiva (φ=${phiPromedio.toFixed(2)}) catalizó la transición de la resistencia cotidiana encubierta a la huelga abierta de masas.`,
      theoreticalNote: 'Paso de la Clase en Sí (Klasse an sich) a la Clase para Sí (Klasse für sich) potenciado por afinidad electiva y densidad reticular (Marx / Weber / Löwy).',
      author: 'Rosa Luxemburg & Michael Löwy',
    };
  } else if (phiPromedio > 0.45 && currentStep % 8 === 0) {
    newEvent = {
      id: generateEventId('res'),
      step: currentStep,
      type: 'RESONANCIA',
      title: 'Resonancia Colectiva Subalterna',
      description: `Los artefactos-sujetos han entrado en alta afinidad electiva (φ promedio = ${phiPromedio.toFixed(2)}), duplicando el rendimiento de sus tácticas de infrapoder.`,
      theoreticalNote: 'Teoría de la afinidad electiva: la convergencia estructural genera una alianza no impuesta que amplifica exponencialmente la capacidad de resistencia del polo dominado.',
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
