export enum SocialClass {
  PROLETARIAT = 'PROLETARIAT',       // Asalariados / Subalternos (venden fuerza de trabajo)
  CAPITALIST = 'CAPITALIST',         // Burguesía / Propietarios de capital constante
  TECHNOCRACY = 'TECHNOCRACY',       // Aparato burocrático / The Machine enforcers
  RESERVE_ARMY = 'RESERVE_ARMY',     // Ejército industrial de reserva / Precarizados
}

export enum SystemRegime {
  CONSENSO_HEGEMONICO = 'CONSENSO_HEGEMONICO', // Alfa moderado / Hegemonía gramsciana
  ALARMA_PUNITIVA = 'ALARMA_PUNITIVA',         // Infrapoder > Umbral: Alfa se dispara, castigo exterior
  CRISIS_ORGANICA = 'CRISIS_ORGANICA',         // Caída de tasa de ganancia + insurrección de infrapoder
}

export enum ActionTactic {
  ASIMILACION = 'ASIMILACION',                       // Compliance / Habitus hegemónico
  INFRAPODER_MICROSCOPICO = 'INFRAPODER_MICROSCOPICO', // Resistencia cotidiana encubierta (Scott)
  HUELGA_RESONANTE = 'HUELGA_RESONANTE',             // Paro colectivo abierto (Luxemburg / Marx)
  DISCIPLINA_PATRONAL = 'DISCIPLINA_PATRONAL',         // Capitalista en competencia individual de mercado
  CARTEL_PATRONAL_ALARMA = 'CARTEL_PATRONAL_ALARMA',   // Bloque patronal cohesionado en alarma/crisis
  GESTION_ESTATAL = 'GESTION_ESTATAL',               // Coerción burocrática y vigilancia
}

export interface Agent {
  id: string;
  name: string;
  socialClass: SocialClass;
  // Dinámica del artefacto (Simon / Cioffi-Revilla)
  interior: number;            // Estado interno de asimilación/habitus
  alienation: number;          // Discrepancia = exterior - interior
  compliance: number;          // Nivel de adhesión hegemónica [0, 1]
  // Resistencia e Infrapoder (James C. Scott)
  infrapowerRaw: number;       // Resistencia estocástica base [min, max]
  infrapowerEffective: number; // Modulado por afinidad electiva phi
  isStriking: boolean;         // Huelga abierta (distinta de infrapoder simple)
  // Afinidad electiva (Weber / Löwy)
  activePhi: number;           // Afinidad promedio con vecinos [-1, 1]
  affinityDescription: string;
  // Conciencia de clase (Klasse an sich -> Klasse für sich)
  classConsciousness: number;  // 0 a 1
  // Exposición a RP / Aura de Normalización del Capital
  capitalistAuraExposure: number; // 0 a 1 (identificación ideológica y subjetividad pro-capital)
  // Economía política
  capital: number;             // Capital constante / reservas materiales
  laborPower: number;          // Capacidad productiva
  wage: number;                // Salario nominal
  realWage: number;            // Salario real normalizado respecto a exigencias del medio
  tactic: ActionTactic;
  // Coordenadas espaciales (para visualizador de campo social)
  x: number;
  y: number;
  vx: number;
  vy: number;
  neighborsCount: number;
}

export interface TheMachineState {
  exterior: number;            // Presión/exigencia del medio exterior (Statu Quo)
  alfa: number;                // Tasa de asimilación/vigilancia coercitiva
  regime: SystemRegime;
  movementExterior: number;    // Desplazamiento punitivo o concesivo
  alarmCount: number;
  // Variables macro de economía política marxista
  constantCapital: number;     // c (maquinaria, materias primas)
  variableCapital: number;     // v (masa salarial)
  surplusValue: number;        // s (plusvalía extraída)
  organicComposition: number;  // c / v
  rateOfProfit: number;        // Pi = s / (c + v)
  rateOfSurplusValue: number;  // s / v
  averageInfrapower: number;
  averageAlienation: number;
  averagePhi: number;
  giniCoefficient: number;
  // Segmentación de acciones colectivas y homeostasis
  simpleInfrapowerParticipation: number; // % en infrapoder simple encubierto
  strikeParticipation: number;           // % en huelga abierta
  complianceParticipation: number;       // % en compliance / asimilación
  averageRealWage: number;
  // Dinámica del capital y aura de RP
  capitalistClusterCohesion: number;     // Cohesión de clase burguesa en alarma [0, 1]
  capitalistAuraRadius: number;          // Radio de normalización y construcción de subjetividad
}

export interface SimulationConfig {
  populationProletariat: number;
  populationCapitalist: number;
  populationTechnocracy: number;
  populationReserveArmy: number;
  // Parámetros de The Machine
  alphaInitial: number;
  alarmThreshold: number;        // Umbral de alarma del sistema (ej. 0.55)
  machineReactionFactor: number; // Incremento/decremento de alfa (ej. 0.05)
  // Parámetros de Infrapoder (Scott)
  infrapowerMin: number;
  infrapowerMax: number;
  // Parámetros de Afinidad Electiva y Cohesión Espacial
  phiBase: number;               // -1 a +1
  phiVolatility: number;
  spatialRadius: number;         // Radio de interacción social en el plano
  socialCohesionForce: number;   // Fuerza de atracción comunitaria para evitar disgregación
  // Parámetros de Dinámica del Capital
  capitalistAuraBase: number;    // Radio de influencia y RP del capital
  // Parámetros Económicos (Marx)
  mechanizationSpeed: number;    // Tasa de aumento de c respecto a v
  baseWage: number;              // Salario mínimo de reproducción
  wageStabilityFactor: number;   // Poder pacificador del salario real sobre el disenso
  repressiveEfficiency: number;  // Efecto disciplinador de The Machine al aumentar alfa
}

export interface SimulationMetricsPoint {
  step: number;
  interiorProletariat: number;
  interiorCapitalist: number;
  exterior: number;
  discrepancy: number;
  alfa: number;
  infrapowerPromedio: number;
  phiPromedio: number;
  rateOfProfit: number;
  rateOfSurplusValue: number;
  organicComposition: number;
  gini: number;
  simpleInfrapowerPercentage: number;
  strikePercentage: number;
  compliancePercentage: number;
  realWagePromedio: number;
  capitalistCohesion: number;
  regime: SystemRegime;
}

export interface HistoricalEvent {
  id: string;
  step: number;
  title: string;
  type: 'ALARMA' | 'RELAJACION' | 'CRISIS' | 'HUELGA' | 'RESONANCIA' | 'CONCESION_SALARIAL' | 'CLUSTER_PATRONAL' | 'RP_HEGEMONIA';
  description: string;
  theoreticalNote: string;
  author: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  theoreticalReference: string;
  config: SimulationConfig;
  customInitialAgents?: (config: SimulationConfig) => Agent[];
  customInitialMachine?: TheMachineState;
}
