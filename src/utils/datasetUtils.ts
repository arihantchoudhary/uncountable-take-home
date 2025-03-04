
import { Dataset, DataPoint, PropertyStats, InputProperty, OutputProperty, Property } from "../types/dataset";

// Our dataset as a constant
export const dataset: Dataset = {
  "20170102_EXP_56":{
     "inputs":{
        "Polymer 1":11.2,
        "Polymer 2":10.7,
        "Polymer 3":11.1,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":17.3,
        "Silica Filler 2":23.9,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":19.5,
        "Antioxidant":0.0,
        "Coloring Pigment":0.0,
        "Co-Agent 1":2.4,
        "Co-Agent 2":2.6,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.4,
        "Oven Temperature":375.0
     },
     "outputs":{
        "Viscosity":2554.4,
        "Cure Time":3.22,
        "Elongation":102.2,
        "Tensile Strength":13.8,
        "Compression Set":62.0
     }
  },
  "20170104_EXP_56":{
     "inputs":{
        "Polymer 1":10.9,
        "Polymer 2":12.2,
        "Polymer 3":0.0,
        "Polymer 4":10.1,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":11.4,
        "Silica Filler 2":30.0,
        "Plasticizer 1":16.9,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":0.0,
        "Coloring Pigment":2.2,
        "Co-Agent 1":0.0,
        "Co-Agent 2":2.6,
        "Co-Agent 3":2.4,
        "Curing Agent 1":1.4,
        "Curing Agent 2":0.0,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2316.4,
        "Cure Time":3.18,
        "Elongation":99.9,
        "Tensile Strength":13.7,
        "Compression Set":62.4
     }
  },
  "20170104_EXP_46":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":38.8,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":24.5,
        "Silica Filler 1":11.7,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":16.8,
        "Antioxidant":0.0,
        "Coloring Pigment":3.4,
        "Co-Agent 1":2.7,
        "Co-Agent 2":0.0,
        "Co-Agent 3":0.0,
        "Curing Agent 1":2.0,
        "Curing Agent 2":0.0,
        "Oven Temperature":400.0
     },
     "outputs":{
        "Viscosity":2354.7,
        "Cure Time":3.98,
        "Elongation":96.0,
        "Tensile Strength":11.0,
        "Compression Set":63.9
     }
  },
  "20170105_EXP_92":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":22.8,
        "Polymer 4":0.0,
        "Carbon Black High Grade":13.4,
        "Carbon Black Low Grade":23.2,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":23.1,
        "Plasticizer 3":0.0,
        "Antioxidant":6.2,
        "Coloring Pigment":3.7,
        "Co-Agent 1":0.0,
        "Co-Agent 2":3.3,
        "Co-Agent 3":2.5,
        "Curing Agent 1":1.9,
        "Curing Agent 2":0.0,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2372.7,
        "Cure Time":3.26,
        "Elongation":109.9,
        "Tensile Strength":9.5,
        "Compression Set":42.7
     }
  },
  "20170105_EXP_42":{
     "inputs":{
        "Polymer 1":38.9,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":34.2,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":17.4,
        "Antioxidant":2.8,
        "Coloring Pigment":3.1,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.5,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.2,
        "Oven Temperature":350.0
     },
     "outputs":{
        "Viscosity":2465.5,
        "Cure Time":3.05,
        "Elongation":92.9,
        "Tensile Strength":13.9,
        "Compression Set":59.1
     }
  },
  "20170106_EXP_11":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":21.6,
        "Polymer 3":14.8,
        "Polymer 4":0.0,
        "Carbon Black High Grade":13.1,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":26.3,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":20.5,
        "Antioxidant":0.0,
        "Coloring Pigment":0.0,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.1,
        "Curing Agent 1":1.6,
        "Curing Agent 2":0.0,
        "Oven Temperature":400.0
     },
     "outputs":{
        "Viscosity":2780.5,
        "Cure Time":3.45,
        "Elongation":105.1,
        "Tensile Strength":12.2,
        "Compression Set":62.1
     }
  },
  "20170106_EXP_56":{
     "inputs":{
        "Polymer 1":26.9,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":24.4,
        "Silica Filler 1":0.0,
        "Silica Filler 2":16.5,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":19.7,
        "Antioxidant":4.6,
        "Coloring Pigment":2.0,
        "Co-Agent 1":2.0,
        "Co-Agent 2":2.6,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.2,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":2522.1,
        "Cure Time":3.15,
        "Elongation":97.4,
        "Tensile Strength":14.0,
        "Compression Set":59.3
     }
  },
  "20170108_EXP_38":{
     "inputs":{
        "Polymer 1":15.2,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":21.9,
        "Carbon Black High Grade":20.2,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":16.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":20.0,
        "Antioxidant":0.0,
        "Coloring Pigment":2.7,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.2,
        "Curing Agent 1":1.8,
        "Curing Agent 2":0.0,
        "Oven Temperature":400.0
     },
     "outputs":{
        "Viscosity":2953.7,
        "Cure Time":3.51,
        "Elongation":78.5,
        "Tensile Strength":9.8,
        "Compression Set":61.7
     }
  },
  "20170108_EXP_31":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":35.5,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":30.4,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":18.0,
        "Antioxidant":5.9,
        "Coloring Pigment":3.4,
        "Co-Agent 1":2.7,
        "Co-Agent 2":2.6,
        "Co-Agent 3":0.0,
        "Curing Agent 1":1.5,
        "Curing Agent 2":0.0,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2386.8,
        "Cure Time":3.6,
        "Elongation":70.6,
        "Tensile Strength":8.7,
        "Compression Set":58.4
     }
  },
  "20170109_EXP_28":{
     "inputs":{
        "Polymer 1":23.0,
        "Polymer 2":0.0,
        "Polymer 3":15.3,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":33.6,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":16.8,
        "Antioxidant":4.3,
        "Coloring Pigment":3.5,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.4,
        "Curing Agent 1":1.1,
        "Curing Agent 2":0.0,
        "Oven Temperature":350.0
     },
     "outputs":{
        "Viscosity":2331.5,
        "Cure Time":3.29,
        "Elongation":108.2,
        "Tensile Strength":15.1,
        "Compression Set":58.0
     }
  },
  "20170111_EXP_12":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":29.7,
        "Polymer 4":0.0,
        "Carbon Black High Grade":42.6,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":21.8,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":2.3,
        "Coloring Pigment":0.0,
        "Co-Agent 1":2.3,
        "Co-Agent 2":0.0,
        "Co-Agent 3":0.0,
        "Curing Agent 1":1.4,
        "Curing Agent 2":0.0,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":3561.2,
        "Cure Time":3.75,
        "Elongation":91.3,
        "Tensile Strength":7.9,
        "Compression Set":71.4
     }
  },
  "20170111_EXP_17":{
     "inputs":{
        "Polymer 1":29.8,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":34.6,
        "Plasticizer 1":20.2,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":6.6,
        "Coloring Pigment":2.0,
        "Co-Agent 1":2.4,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.7,
        "Curing Agent 1":1.7,
        "Curing Agent 2":0.0,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":2359.5,
        "Cure Time":3.84,
        "Elongation":102.6,
        "Tensile Strength":15.5,
        "Compression Set":68.4
     }
  },
  "20170112_EXP_33":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":28.5,
        "Polymer 3":0.0,
        "Polymer 4":11.2,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":20.9,
        "Silica Filler 2":14.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":17.9,
        "Antioxidant":0.0,
        "Coloring Pigment":3.2,
        "Co-Agent 1":0.0,
        "Co-Agent 2":2.7,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.7,
        "Oven Temperature":350.0
     },
     "outputs":{
        "Viscosity":2571.2,
        "Cure Time":2.86,
        "Elongation":94.4,
        "Tensile Strength":11.6,
        "Compression Set":57.4
     }
  },
  "20170112_EXP_14":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":30.4,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":33.4,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":19.5,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":6.8,
        "Coloring Pigment":2.9,
        "Co-Agent 1":2.4,
        "Co-Agent 2":2.8,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.8,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":2579.7,
        "Cure Time":3.21,
        "Elongation":92.7,
        "Tensile Strength":10.4,
        "Compression Set":64.2
     }
  },
  "20170112_EXP_46":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":33.8,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":34.8,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":19.6,
        "Plasticizer 3":0.0,
        "Antioxidant":3.4,
        "Coloring Pigment":2.8,
        "Co-Agent 1":2.1,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.2,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.3,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2160.8,
        "Cure Time":3.39,
        "Elongation":85.8,
        "Tensile Strength":9.0,
        "Compression Set":51.1
     }
  },
  "20170112_EXP_60":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":31.9,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":32.2,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":19.8,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":6.7,
        "Coloring Pigment":2.2,
        "Co-Agent 1":2.6,
        "Co-Agent 2":2.8,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.9,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2602.0,
        "Cure Time":3.26,
        "Elongation":70.7,
        "Tensile Strength":8.8,
        "Compression Set":64.9
     }
  },
  "20170113_EXP_76":{
     "inputs":{
        "Polymer 1":11.6,
        "Polymer 2":14.0,
        "Polymer 3":13.6,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":34.1,
        "Silica Filler 2":0.0,
        "Plasticizer 1":18.9,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":0.0,
        "Coloring Pigment":3.7,
        "Co-Agent 1":2.4,
        "Co-Agent 2":0.0,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.7,
        "Oven Temperature":375.0
     },
     "outputs":{
        "Viscosity":2545.3,
        "Cure Time":3.43,
        "Elongation":92.4,
        "Tensile Strength":11.9,
        "Compression Set":70.7
     }
  },
  "20170113_EXP_74":{
     "inputs":{
        "Polymer 1":18.9,
        "Polymer 2":14.1,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":19.2,
        "Silica Filler 1":0.0,
        "Silica Filler 2":22.2,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":17.7,
        "Antioxidant":0.0,
        "Coloring Pigment":1.4,
        "Co-Agent 1":0.0,
        "Co-Agent 2":2.7,
        "Co-Agent 3":2.2,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.5,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":2524.7,
        "Cure Time":2.87,
        "Elongation":103.5,
        "Tensile Strength":14.3,
        "Compression Set":57.5
     }
  },
  "20170113_EXP_93":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":30.4,
        "Polymer 3":0.0,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":34.5,
        "Plasticizer 1":0.0,
        "Plasticizer 2":22.0,
        "Plasticizer 3":0.0,
        "Antioxidant":2.5,
        "Coloring Pigment":3.2,
        "Co-Agent 1":0.0,
        "Co-Agent 2":3.0,
        "Co-Agent 3":2.6,
        "Curing Agent 1":0.0,
        "Curing Agent 2":2.0,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2233.6,
        "Cure Time":2.84,
        "Elongation":123.2,
        "Tensile Strength":13.5,
        "Compression Set":45.1
     }
  },
  "20170114_EXP_30":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":11.6,
        "Polymer 3":0.0,
        "Polymer 4":18.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":28.8,
        "Silica Filler 1":13.6,
        "Silica Filler 2":0.0,
        "Plasticizer 1":21.1,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":0.0,
        "Coloring Pigment":2.9,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.5,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.5,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":2573.2,
        "Cure Time":3.05,
        "Elongation":81.0,
        "Tensile Strength":10.1,
        "Compression Set":69.4
     }
  },
  "20170115_EXP_10":{
     "inputs":{
        "Polymer 1":11.8,
        "Polymer 2":10.8,
        "Polymer 3":11.1,
        "Polymer 4":0.0,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":22.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":20.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":0.0,
        "Plasticizer 3":16.9,
        "Antioxidant":3.0,
        "Coloring Pigment":1.1,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.1,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.2,
        "Oven Temperature":350.0
     },
     "outputs":{
        "Viscosity":2481.3,
        "Cure Time":3.06,
        "Elongation":104.0,
        "Tensile Strength":13.2,
        "Compression Set":58.7
     }
  },
  "20170116_EXP_75":{
     "inputs":{
        "Polymer 1":13.0,
        "Polymer 2":12.9,
        "Polymer 3":0.0,
        "Polymer 4":10.1,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":16.0,
        "Silica Filler 2":21.6,
        "Plasticizer 1":16.8,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":0.0,
        "Coloring Pigment":3.1,
        "Co-Agent 1":0.0,
        "Co-Agent 2":3.0,
        "Co-Agent 3":2.4,
        "Curing Agent 1":1.0,
        "Curing Agent 2":0.0,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2309.0,
        "Cure Time":3.02,
        "Elongation":96.3,
        "Tensile Strength":13.2,
        "Compression Set":61.9
     }
  },
  "20170116_EXP_41":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":0.0,
        "Polymer 4":37.3,
        "Carbon Black High Grade":32.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":0.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":20.7,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":2.9,
        "Coloring Pigment":0.0,
        "Co-Agent 1":2.4,
        "Co-Agent 2":3.2,
        "Co-Agent 3":0.0,
        "Curing Agent 1":1.5,
        "Curing Agent 2":0.0,
        "Oven Temperature":325.0
     },
     "outputs":{
        "Viscosity":3260.8,
        "Cure Time":3.53,
        "Elongation":66.4,
        "Tensile Strength":6.8,
        "Compression Set":66.4
     }
  },
  "20170117_EXP_74":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":0.0,
        "Polymer 3":14.0,
        "Polymer 4":17.6,
        "Carbon Black High Grade":0.0,
        "Carbon Black Low Grade":28.4,
        "Silica Filler 1":11.0,
        "Silica Filler 2":0.0,
        "Plasticizer 1":18.7,
        "Plasticizer 2":0.0,
        "Plasticizer 3":0.0,
        "Antioxidant":5.2,
        "Coloring Pigment":1.4,
        "Co-Agent 1":0.0,
        "Co-Agent 2":0.0,
        "Co-Agent 3":2.2,
        "Curing Agent 1":1.5,
        "Curing Agent 2":0.0,
        "Oven Temperature":350.0
     },
     "outputs":{
        "Viscosity":2361.1,
        "Cure Time":3.42,
        "Elongation":83.1,
        "Tensile Strength":9.7,
        "Compression Set":64.6
     }
  },
  "20170117_EXP_91":{
     "inputs":{
        "Polymer 1":0.0,
        "Polymer 2":23.4,
        "Polymer 3":0.0,
        "Polymer 4":13.4,
        "Carbon Black High Grade":11.0,
        "Carbon Black Low Grade":0.0,
        "Silica Filler 1":26.4,
        "Silica Filler 2":0.0,
        "Plasticizer 1":0.0,
        "Plasticizer 2":18.4,
        "Plasticizer 3":0.0,
        "Antioxidant":3.0,
        "Coloring Pigment":0.0,
        "Co-Agent 1":2.7,
        "Co-Agent 2":0.0,
        "Co-Agent 3":0.0,
        "Curing Agent 1":0.0,
        "Curing Agent 2":1.5,
        "Oven Temperature":425.0
     },
     "outputs":{
        "Viscosity":2474.1,
        "Cure Time":3.48,
        "Elongation":99.4,
        "Tensile Strength":9.3,
        "Compression Set":52.0
     }
  }
};
export const getInputProperties = (): InputProperty[] => {
   const inputs = Object.keys(Object.values(dataset)[0].inputs) as InputProperty[];
   return inputs;
 };
 
 // Get all output properties
 export const getOutputProperties = (): OutputProperty[] => {
   const outputs = Object.keys(Object.values(dataset)[0].outputs) as OutputProperty[];
   return outputs;
 };
 
 // Get all properties (inputs and outputs)
 export const getAllProperties = (): Property[] => {
   return [...getInputProperties(), ...getOutputProperties()];
 };
 
 // Calculate property statistics (min, max)
 export const calculatePropertyStats = (): PropertyStats => {
   const stats: PropertyStats = {};
   
   // Initialize with first experiment
   const firstExperiment = Object.values(dataset)[0];
   
   // Initialize stats for inputs
   Object.entries(firstExperiment.inputs).forEach(([property, value]) => {
     stats[property] = { min: value, max: value };
   });
   
   // Initialize stats for outputs
   Object.entries(firstExperiment.outputs).forEach(([property, value]) => {
     stats[property] = { min: value, max: value };
   });
   
   // Calculate min and max for each property
   Object.values(dataset).forEach(experiment => {
     // Process inputs
     Object.entries(experiment.inputs).forEach(([property, value]) => {
       if (value < stats[property].min) stats[property].min = value;
       if (value > stats[property].max) stats[property].max = value;
     });
     
     // Process outputs
     Object.entries(experiment.outputs).forEach(([property, value]) => {
       if (value < stats[property].min) stats[property].min = value;
       if (value > stats[property].max) stats[property].max = value;
     });
   });
   
   return stats;
 };
 
 // Create 3D data points for visualization WITHOUT normalization
 export const createDataPoints = (
   xProperty: Property,
   yProperty: Property,
   zProperty: Property,
   colorProperty: Property,
   stats: PropertyStats
 ): DataPoint[] => {
   const dataPoints: DataPoint[] = [];
   
   Object.entries(dataset).forEach(([id, experiment]) => {
     // Get property values (could be input or output)
     const getValue = (property: Property): number => {
       if (Object.keys(experiment.inputs).includes(property)) {
         return experiment.inputs[property as InputProperty];
       } else {
         return experiment.outputs[property as OutputProperty];
       }
     };
     
     // Use raw values directly without normalization
     const x = getValue(xProperty);
     const y = getValue(yProperty);
     const z = getValue(zProperty);
     const colorValue = getValue(colorProperty);
     
     dataPoints.push({
       id,
       x,
       y,
       z,
       value: colorValue,
       experiment
     });
   });
   
   return dataPoints;
 };
 
 // Filter experiments based on property ranges
 export const filterExperiments = (
   propertyFilters: { property: Property; min: number; max: number }[]
 ): string[] => {
   return Object.entries(dataset)
     .filter(([id, experiment]) => {
       // Check if experiment passes all filters
       return propertyFilters.every(filter => {
         const { property, min, max } = filter;
         let value;
         
         if (Object.keys(experiment.inputs).includes(property)) {
           value = experiment.inputs[property as InputProperty];
         } else {
           value = experiment.outputs[property as OutputProperty];
         }
         
         return value >= min && value <= max;
       });
     })
     .map(([id]) => id);
 };
 
 // Group experiments by a property within ranges
 export const groupExperimentsByProperty = (
   property: Property,
   ranges: number[]
 ): { [range: string]: string[] } => {
   const result: { [range: string]: string[] } = {};
   
   // Create range buckets
   for (let i = 0; i < ranges.length - 1; i++) {
     const rangeName = `${ranges[i]}-${ranges[i + 1]}`;
     result[rangeName] = [];
   }
   
   // Assign experiments to ranges
   Object.entries(dataset).forEach(([id, experiment]) => {
     let value;
     
     if (Object.keys(experiment.inputs).includes(property)) {
       value = experiment.inputs[property as InputProperty];
     } else {
       value = experiment.outputs[property as OutputProperty];
     }
     
     // Find the range this value belongs to
     for (let i = 0; i < ranges.length - 1; i++) {
       if (value >= ranges[i] && value < ranges[i + 1]) {
         const rangeName = `${ranges[i]}-${ranges[i + 1]}`;
         result[rangeName].push(id);
         break;
       }
     }
   });
   
   return result;
 };
 
 // Calculate correlations between properties
 export const calculateCorrelation = (property1: Property, property2: Property): number => {
   const values1: number[] = [];
   const values2: number[] = [];
   
   Object.values(dataset).forEach(experiment => {
     let value1;
     let value2;
     
     if (Object.keys(experiment.inputs).includes(property1)) {
       value1 = experiment.inputs[property1 as InputProperty];
     } else {
       value1 = experiment.outputs[property1 as OutputProperty];
     }
     
     if (Object.keys(experiment.inputs).includes(property2)) {
       value2 = experiment.inputs[property2 as InputProperty];
     } else {
       value2 = experiment.outputs[property2 as OutputProperty];
     }
     
     values1.push(value1);
     values2.push(value2);
   });
   
   // Calculate correlation coefficient
   const n = values1.length;
   const sum1 = values1.reduce((a, b) => a + b, 0);
   const sum2 = values2.reduce((a, b) => a + b, 0);
   const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
   const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
   const sumProd = values1.reduce((a, b, i) => a + b * values2[i], 0);
   
   const numerator = n * sumProd - sum1 * sum2;
   const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));
   
   if (denominator === 0) return 0;
   return numerator / denominator;
 };
 
 // Get experiment by ID
 export const getExperimentById = (id: string) => {
   return dataset[id];
 };
 
 // Get experiment properties formatted for display
 export const getFormattedExperimentData = (id: string) => {
   const experiment = getExperimentById(id);
   if (!experiment) return null;
   
   const formattedInputs = Object.entries(experiment.inputs)
     .filter(([_, value]) => value > 0) // Only include non-zero values
     .map(([property, value]) => ({
       property,
       value: value.toFixed(1),
     }));
   
   const formattedOutputs = Object.entries(experiment.outputs).map(([property, value]) => ({
     property,
     value: property === "Cure Time" ? value.toFixed(2) : value.toFixed(1),
   }));
   
   return {
     id,
     inputs: formattedInputs,
     outputs: formattedOutputs,
   };
 };