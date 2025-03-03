
export interface ExperimentInputs {
  "Polymer 1": number;
  "Polymer 2": number;
  "Polymer 3": number;
  "Polymer 4": number;
  "Carbon Black High Grade": number;
  "Carbon Black Low Grade": number;
  "Silica Filler 1": number;
  "Silica Filler 2": number;
  "Plasticizer 1": number;
  "Plasticizer 2": number;
  "Plasticizer 3": number;
  "Antioxidant": number;
  "Coloring Pigment": number;
  "Co-Agent 1": number;
  "Co-Agent 2": number;
  "Co-Agent 3": number;
  "Curing Agent 1": number;
  "Curing Agent 2": number;
  "Oven Temperature": number;
}

export interface ExperimentOutputs {
  "Viscosity": number;
  "Cure Time": number;
  "Elongation": number;
  "Tensile Strength": number;
  "Compression Set": number;
}

export interface Experiment {
  inputs: ExperimentInputs;
  outputs: ExperimentOutputs;
}

export interface Dataset {
  [experimentId: string]: Experiment;
}

export type InputProperty = keyof ExperimentInputs;
export type OutputProperty = keyof ExperimentOutputs;
export type Property = InputProperty | OutputProperty;

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  value: number;
  experiment: Experiment;
}

export interface PropertyRange {
  min: number;
  max: number;
}

export interface PropertyStats {
  [property: string]: PropertyRange;
}
