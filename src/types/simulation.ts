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
  ASIMILACION = 'ASIMILACION',
  INFRAPODER_MICROSCOPICO = 'INFRAPODER_MICROSCOPICO',
  HUELGA_RESONANTE = 'HUELGA_RESONANTE',
  DISCIPLINA_PATRONAL = 'DISCIPLINA_PATRONAL',
  GESTION_ESTATAL = 'GESTION_ESTATAL',
}

export interface Agent {
  id: string;
  name: string;
  socialClass: SocialClass;
  // Dinámica del artefacto (Simon / Cioffi-Revilla)
  interior: number;            // Estado interno de asimilación/habitus
  alienation: number;          // Discrepancia = exterior - interior
  // Resistencia e Infrapoder (James C. Scott)
  infrapowerRaw: number;       // Resistencia estocástica base [min, max]
  infrapowerEffective: number; // Modulado por afinidad electiva phi
  // Afinidad electiva (Weber / Löwy)
  activePhi: number;           // Afinidad promedio con vecinos [-1, 1]
  affinityDescription: string;
  // Conciencia de clase (Klasse an sich -> Klasse für sich)
  classConsciousness: number;  // 0 a 1
  // Economía política
  capital: number;             // Capital constante / reservas materiales
  laborPower: number;          // Capacidad productiva
  wage: number;                // Salario recibido
  isStriking: boolean;
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
  strikeParticipation: number;
}

export interface SimulationConfig {
  populationProletariat: number;
  populationCapitalist: number;
  populationTechnocracy: number;
  populationReserveArmy: number;
  // Parámetros de The Machine
  alphaInitial: number;
  alarmThreshold: number;      // Umbral de infrapoder que activa alarma (ej. 0.60)
  machineReactionFactor: number;// Incremento/decremento de alfa (ej. 0.05)
  // Parámetros de Infrapoder (Scott)
  infrapowerMin: number;
  infrapowerMax: number;
  // Parámetros de Afinidad Electiva (Weber)
  phiBase: number;             // -1 a +1
  phiVolatility: number;
  spatialRadius: number;       // Radio de interacción social en el plano
  // Parámetros Económicos (Marx)
  mechanizationSpeed: number;  // Tasa de aumento de c respecto a v
  baseWage: number;            // Salario mínimo de reproducción
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
  strikePercentage: number;
  regime: SystemRegime;
}

export interface HistoricalEvent {
  id: string;
  step: number;
  title: string;
  type: 'ALARMA' | 'RELAJACION' | 'CRISIS' | 'HUELGA' | 'RESONANCIA';
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
