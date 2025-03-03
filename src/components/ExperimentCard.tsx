
import React from 'react';
import { Experiment } from '@/types/dataset';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ExperimentCardProps {
  experiment: Experiment;
  experimentId: string;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment, experimentId }) => {
  // Filter non-zero inputs
  const relevantInputs = Object.entries(experiment.inputs)
    .filter(([_, value]) => value > 0)
    .sort(([_, valueA], [__, valueB]) => valueB - valueA);

  return (
    <Card className="glass-card w-full overflow-hidden animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight">
          {experimentId}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div>
          <h4 className="control-label mb-1">Outputs</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(experiment.outputs).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium">
                  {key === "Cure Time" ? value.toFixed(2) : value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="control-label mb-1">Key Inputs</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            {relevantInputs.slice(0, 6).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-muted-foreground truncate pr-2">{key}:</span>
                <span className="font-medium">{value.toFixed(1)}</span>
              </div>
            ))}
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
