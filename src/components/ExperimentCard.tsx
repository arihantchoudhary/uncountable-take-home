
import React from 'react';
import { Experiment, OutputProperty } from '@/types/dataset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Clock, Droplet, Maximize2, TrendingUp, ArrowDown } from 'lucide-react';

interface ExperimentCardProps {
  experiment: Experiment;
  experimentId: string;
}

// Map output keys to symbols and icons
const getOutputSymbol = (key: string): { symbol: string; icon: React.ReactNode } => {
  switch(key) {
    case 'Viscosity':
      return { symbol: 'η', icon: <Droplet className="h-3.5 w-3.5 text-blue-500" /> };
    case 'Cure Time':
      return { symbol: 'τ', icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> };
    case 'Elongation':
      return { symbol: 'ε', icon: <Maximize2 className="h-3.5 w-3.5 text-green-500" /> };
    case 'Tensile Strength':
      return { symbol: 'σ', icon: <TrendingUp className="h-3.5 w-3.5 text-red-500" /> };
    case 'Compression Set':
      return { symbol: 'δ', icon: <ArrowDown className="h-3.5 w-3.5 text-purple-500" /> };
    default:
      return { symbol: '?', icon: null };
  }
};

// Map input keys to symbols and icons
const getInputSymbol = (key: string): { symbol: string; icon: React.ReactNode } => {
  if (key.startsWith('Polymer')) {
    const num = key.split(' ')[1];
    return { symbol: `P${num}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-blue-400 flex items-center justify-center text-[8px] text-white font-bold">{num}</div> };
  }
  
  if (key.startsWith('Carbon Black')) {
    const grade = key.includes('High') ? 'H' : 'L';
    return { symbol: `C${grade}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-gray-800 flex items-center justify-center text-[8px] text-white font-bold">{grade}</div> };
  }
  
  if (key.startsWith('Silica')) {
    const num = key.split(' ')[2];
    return { symbol: `Si${num}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-gray-800 font-bold">{num}</div> };
  }
  
  if (key.startsWith('Plasticizer')) {
    const num = key.split(' ')[1];
    return { symbol: `Pl${num}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-green-400 flex items-center justify-center text-[8px] text-white font-bold">{num}</div> };
  }
  
  if (key === 'Antioxidant') {
    return { symbol: 'AO', icon: <div className="h-3.5 w-3.5 rounded-full bg-red-400 flex items-center justify-center text-[8px] text-white font-bold">AO</div> };
  }
  
  if (key === 'Coloring Pigment') {
    return { symbol: 'CP', icon: <div className="h-3.5 w-3.5 rounded-full bg-purple-400 flex items-center justify-center text-[8px] text-white font-bold">CP</div> };
  }
  
  if (key.startsWith('Co-Agent')) {
    const num = key.split(' ')[1];
    return { symbol: `CA${num}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] text-white font-bold">{num}</div> };
  }
  
  if (key.startsWith('Curing Agent')) {
    const num = key.split(' ')[2];
    return { symbol: `Cu${num}`, icon: <div className="h-3.5 w-3.5 rounded-full bg-orange-400 flex items-center justify-center text-[8px] text-white font-bold">{num}</div> };
  }
  
  if (key === 'Oven Temperature') {
    return { symbol: 'T', icon: <div className="h-3.5 w-3.5 rounded-full bg-red-600 flex items-center justify-center text-[8px] text-white font-bold">T</div> };
  }
  
  return { symbol: '?', icon: <div className="h-3.5 w-3.5 rounded-full bg-gray-400 flex items-center justify-center text-[8px] text-white font-bold">?</div> };
};

const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, experimentId }) => {
  // Filter non-zero inputs
  const relevantInputs = Object.entries(experiment.inputs)
    .filter(([_, value]) => value > 0)
    .sort(([_, valueA], [__, valueB]) => valueB - valueA);
  
  // Format number to avoid long decimals
  const formatNumber = (value: number) => {
    // Limit to at most 6 decimal places and remove trailing zeros
    return value.toFixed(6).replace(/\.?0+$/, '').replace(/\.$/, '');
  };

  return (
    <Card className="glass-card w-full overflow-hidden animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight flex flex-col">
          <span>Experiment #{experimentId.match(/_EXP_(\d+)$/)?.[1].padStart(2, '0') || ''}</span>
          <span className="text-xs text-blue-600 font-normal mt-0.5">
            {experimentId.match(/^(\d{4})(\d{2})(\d{2})_/)?.[0].replace(/^(\d{4})(\d{2})(\d{2})_/, '$2/$3/17')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div>
          <h4 className="control-label mb-1">Outputs</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {Object.entries(experiment.outputs).map(([key, value]) => {
              const { symbol, icon } = getOutputSymbol(key);
              return (
                <div key={key} className="flex justify-between items-center">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {icon}
                          <span className="font-medium text-sm">{symbol}:</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {key}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="font-medium text-right overflow-hidden text-ellipsis" style={{ maxWidth: '60%' }}>
                    {typeof value === 'number' ? formatNumber(value) : String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="control-label mb-1">Key Inputs</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {relevantInputs.slice(0, 6).map(([key, value]) => {
              const { symbol, icon } = getInputSymbol(key);
              return (
                <div key={key} className="flex justify-between items-center">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {icon}
                          <span className="font-medium text-sm">{symbol}:</span>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        {key}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="font-medium text-right overflow-hidden text-ellipsis" style={{ maxWidth: '60%' }}>
                    {typeof value === 'number' ? formatNumber(value) : String(value)}
                  </span>
                </div>
              );
            })}
            {relevantInputs.length > 6 && (
              <span className="text-xs text-muted-foreground text-center mt-1">
                +{relevantInputs.length - 6} more inputs
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperimentCard;
