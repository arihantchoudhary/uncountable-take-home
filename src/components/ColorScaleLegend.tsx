
import React from 'react';
import { Card } from '@/components/ui/card';
import { Palette } from 'lucide-react';

interface ColorScaleLegendProps {
  property: string;
  min: number;
  max: number;
  colorStart?: string;
  colorEnd?: string;
}

const ColorScaleLegend: React.FC<ColorScaleLegendProps> = ({
  property,
  min,
  max,
  colorStart = '#ffffff',
  colorEnd = '#1e40af'
}) => {
  // Generate tick values for the legend (5 ticks)
  const ticks = Array.from({ length: 5 }, (_, i) => {
    const value = min + (max - min) * (i / 4);
    return {
      value,
      position: `${i * 25}%`,
      label: value.toFixed(1)
    };
  });

  return (
    <Card className="p-3 bg-white/90 backdrop-blur-sm border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="h-4 w-4 text-primary/70" />
        <h3 className="text-sm font-medium">Color by: {property}</h3>
      </div>
      
      <div className="relative h-4 w-full mb-1 rounded overflow-hidden">
        <div 
          className="h-full w-full" 
          style={{
            background: `linear-gradient(to right, ${colorStart}, ${colorEnd})`
          }}
        />
      </div>
      
      <div className="relative w-full h-6">
        {ticks.map((tick, index) => (
          <div 
            key={index} 
            className="absolute transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: tick.position }}
          >
            <div className="h-2 w-0.5 bg-gray-400 mb-0.5" />
            <span className="text-xs text-gray-600">{tick.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ColorScaleLegend;
