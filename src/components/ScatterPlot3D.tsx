import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint, Property } from '@/types/dataset';
import { Layers, Info, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { dataset } from '@/utils/datasetUtils';
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface ScatterPlot3DProps {
  dataPoints: DataPoint[];
  xProperty: Property;
  yProperty: Property;
  zProperty: Property;
  colorProperty: Property;
  autoRotate: boolean;
  onPointSelect: (pointId: string) => void;
  selectedPointId: string | null;
}

const ScatterPlot3D: React.FC<ScatterPlot3DProps> = ({
  dataPoints,
  xProperty,
  yProperty,
  zProperty,
  colorProperty,
  autoRotate,
  onPointSelect,
  selectedPointId,
}) => {
  const [viewAngle, setViewAngle] = useState(0);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DataPoint[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showExperimentList, setShowExperimentList] = useState(true);
  
  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const experimentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }

    const animate = (time: number) => {
      if (prevTimeRef.current !== null) {
        setViewAngle((angle) => (angle + 0.5) % 360);
      }
      prevTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [autoRotate]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = dataPoints.filter(point => 
      point.id.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, dataPoints]);

  useEffect(() => {
    if (selectedPointId && experimentListRef.current) {
      const selectedElement = experimentListRef.current.querySelector(`[data-id="${selectedPointId}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPointId]);

  const formatExperimentId = (id: string) => {
    return id.replace('20170', '').replace('_EXP_', '-');
  };

  const scaleLinear = (value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) => {
    if (domainMax === domainMin) return rangeMin;
    return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
  };

  const getColorForValue = (value: number, min: number, max: number) => {
    const normalized = scaleLinear(value, min, max, 0, 1);
    
    const r = Math.round(255 - normalized * 200);
    const g = Math.round(255 - normalized * 200);
    const b = 255;
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const projectedData = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const xValues = dataPoints.map(p => p.x);
    const yValues = dataPoints.map(p => p.y);
    const zValues = dataPoints.map(p => p.z);
    const colorValues = dataPoints.map(p => p.value || 0);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    const colorMin = Math.min(...colorValues);
    const colorMax = Math.max(...colorValues);

    const angleRad = (viewAngle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    return dataPoints.map(point => {
      const x2d = point.x * cos - point.z * sin;
      const z2d = point.z * cos + point.x * sin;
      
      const color = getColorForValue(point.value || 0, colorMin, colorMax);
      
      const depthFactor = 0.6 + (z2d + 1.2) * 0.4;
      const baseSize = 20;
      const depthSize = baseSize * depthFactor;
      
      const isSelected = point.id === selectedPointId;
      const isHovered = point.id === hoveredPointId;
      const size = isSelected ? 60 : isHovered ? 40 : depthSize;
      
      const opacity = isSelected ? 1 : isHovered ? 0.95 : 0.4 + depthFactor * 0.6;
      
      return {
        ...point,
        x: x2d,
        y: point.y,
        z: z2d,
        color,
        size,
        opacity,
        glow: isSelected || isHovered ? true : false
      };
    }).sort((a, b) => a.z - b.z);
  }, [dataPoints, viewAngle, selectedPointId, hoveredPointId]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      const formatValue = (value: number) => {
        if (value === undefined || value === null) return '';
        return value.toFixed(4).replace(/\.?0+$/, '').replace(/\.$/, '');
      };
      
      return (
        <div 
          className="bg-white/95 p-2 border border-blue-200 rounded-md shadow-md backdrop-blur cursor-pointer animate-fade-in"
          style={{
            boxShadow: '0 8px 20px -4px rgba(113, 90, 235, 0.25), 0 6px 8px -4px rgba(113, 90, 235, 0.15)',
            maxWidth: '160px',
            fontSize: '11px'
          }}
        >
          <p className="font-bold mb-1 text-blue-800 text-xs">{data.id}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <span className="text-slate-500">{xProperty}:</span>
            <span className="font-medium text-right text-slate-700">{formatValue(data.x)}</span>
            
            <span className="text-slate-500">{yProperty}:</span>
            <span className="font-medium text-right text-slate-700">{formatValue(data.y)}</span>
            
            <span className="text-slate-500">{zProperty}:</span>
            <span className="font-medium text-right text-slate-700">{formatValue(data.z)}</span>
            
            {colorProperty && (
              <>
                <span className="text-slate-500">{colorProperty}:</span>
                <span className="font-medium text-right text-slate-700">{formatValue(data.value)}</span>
              </>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-0.5 h-auto text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onPointSelect(data.id);
            }}
          >
            <ExternalLink size={10} className="mr-1" />
            View Full Experiment
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      onPointSelect(data.activePayload[0].payload.id);
    }
  };

  const handlePointHover = (pointId: string | null) => {
    setHoveredPointId(pointId);
  };

  const handlePointClick = (pointId: string) => {
    onPointSelect(pointId);
  };

  const formatNumber = (value: number) => {
    if (value === undefined || value === null) return '';
    return value.toFixed(6).replace(/\.?0+$/, '').replace(/\.$/, '');
  };

  const colorMin = useMemo(() => Math.min(...dataPoints.map(p => p.value || 0)), [dataPoints]);
  const colorMax = useMemo(() => Math.max(...dataPoints.map(p => p.value || 0)), [dataPoints]);
  
  const selectedExperiment = useMemo(() => {
    if (!selectedPointId || !dataset[selectedPointId]) return null;
    return dataset[selectedPointId];
  }, [selectedPointId]);

  const sortedExperiments = useMemo(() => {
    return Object.keys(dataset).sort();
  }, []);

  const legendData = useMemo(() => {
    return sortedExperiments.map(id => {
      const experiment = dataset[id];
      const dataPoint = dataPoints.find(p => p.id === id);
      if (!dataPoint) {
        return {
          id,
          x: 0,
          y: 0,
          z: 0,
          value: 0,
          experiment
        };
      }
      return dataPoint;
    });
  }, [dataPoints, sortedExperiments]);

  const legendRows = useMemo(() => {
    const rows = [];
    const itemsPerRow = 10;
    
    for (let i = 0; i < legendData.length; i += itemsPerRow) {
      rows.push(legendData.slice(i, i + itemsPerRow));
    }
    
    return rows;
  }, [legendData]);

  return (
    <div className="w-full h-full flex">
      <div className="flex-grow relative flex flex-col">
        <div className="w-full bg-white/90 backdrop-blur-sm p-3 border-b border-blue-100 shadow-sm z-20">
          <h3 className="text-sm font-medium mb-2 text-blue-800">Experiments</h3>
          
          <div className="flex items-center mb-2">
            <button 
              className="bg-blue-50 p-1.5 rounded text-blue-600 hover:bg-blue-100 text-xs mr-2"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={14} />
            </button>
            
            {searchOpen && (
              <div className="flex-grow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiments..."
                  className="w-full p-1.5 border rounded text-xs"
                />
              </div>
            )}
          </div>
          
          {searchResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto bg-white rounded border border-blue-100 mb-2">
              <div className="text-xs font-medium p-2 bg-blue-50/50 border-b border-blue-100">
                Search Results ({searchResults.length})
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 p-3">
                {searchResults.map(result => (
                  <TooltipProvider key={`search-${result.id}`}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] cursor-pointer border-2 transition-all ${result.id === selectedPointId ? 'border-blue-500 shadow-lg scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: getColorForValue(result.value || 0, colorMin, colorMax) }}
                          onClick={() => onPointSelect(result.id)}
                        >
                          {formatExperimentId(result.id)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs font-medium">{result.id}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ) : searchQuery !== '' ? (
            <p className="text-xs text-gray-500 mb-2">No results found</p>
          ) : (
            <div className="max-h-40 overflow-y-auto">
              <div className="flex flex-wrap justify-center gap-2.5 mb-2 px-1">
                {legendData.map((point) => (
                  <TooltipProvider key={`legend-${point.id}`}>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] cursor-pointer border-2 transition-all ${point.id === selectedPointId ? 'border-blue-500 shadow-lg scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: getColorForValue(point.value || 0, colorMin, colorMax) }}
                          onClick={() => onPointSelect(point.id)}
                        >
                          {formatExperimentId(point.id)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs font-medium">{point.id}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
          
          {selectedPointId && (
            <div className="text-xs font-medium mt-1 p-1.5 bg-blue-100/70 rounded text-blue-700 text-center">
              Selected: {selectedPointId}
            </div>
          )}
        </div>
          
        <div className="scene-container flex-grow relative rounded-lg overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <button 
              className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-all"
              onClick={() => setShowExperimentList(!showExperimentList)}
              title={showExperimentList ? "Hide experiment list" : "Show experiment list"}
            >
              <ChevronRight size={18} className={`text-gray-700 transform transition-transform ${showExperimentList ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className="w-full h-full bg-gradient-to-b from-[#f8faff] to-[#eef4ff] animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                onClick={handleChartClick}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(113, 90, 235, 0.1)" 
                  vertical={true} 
                  horizontal={true} 
                />
                
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={xProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: xProperty, position: 'bottom', style: { fill: '#6366f1', fontSize: 12, fontWeight: 500 } }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={formatNumber}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={yProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: yProperty, angle: -90, position: 'left', style: { fill: '#6366f1', fontSize: 12, fontWeight: 500 } }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={formatNumber}
                />
                <ZAxis 
                  type="number" 
                  dataKey="size" 
                  range={[20, 100]} 
                  name={zProperty} 
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(113, 90, 235, 0.4)' }}
                />
                
                {projectedData.map((point) => (
                  <Scatter
                    key={`scatter-${point.id}`}
                    name={point.id === selectedPointId ? `Selected: ${point.id}` : point.id}
                    data={[point]}
                    fill={point.color}
                    strokeWidth={point.id === selectedPointId ? 3 : point.id === hoveredPointId ? 2 : 0.5}
                    stroke={point.id === selectedPointId ? '#ffffff' : point.id === hoveredPointId ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)'}
                    fillOpacity={point.opacity}
                    onMouseEnter={() => handlePointHover(point.id)}
                    onMouseLeave={() => handlePointHover(null)}
                    onClick={() => handlePointClick(point.id)}
                    cursor="pointer"
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-md shadow-md border border-gray-200 text-xs">
            <div className="flex items-center gap-1 mb-2">
              <Layers size={14} className="text-blue-500" />
              <span className="font-medium">{zProperty}</span>
              <span className="text-gray-500 ml-1">(depth)</span>
            </div>
            
            {colorProperty && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Info size={14} className="text-blue-500" />
                  <span className="font-medium">{colorProperty}</span>
                </div>
                <div className="h-2.5 w-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-sm" />
                <div className="flex justify-between mt-1 text-gray-600">
                  <span>{colorMin.toFixed(1)}</span>
                  <span>{colorMax.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExperimentList && (
        <div className="w-64 bg-white/90 backdrop-blur-sm border-l border-blue-100 flex flex-col shadow-lg animate-fade-in">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Experiment List</h3>
            <p className="text-xs text-gray-500">
              {dataPoints.length} experiments loaded
            </p>
          </div>

          <div 
            className="overflow-y-auto flex-grow"
            ref={experimentListRef}
          >
            <div className="divide-y">
              {sortedExperiments.map(experimentId => (
                <div
                  key={experimentId}
                  data-id={experimentId}
                  className={`p-2 text-xs hover:bg-gray-50 cursor-pointer ${experimentId === selectedPointId ? 'bg-blue-50' : ''}`}
                  onClick={() => onPointSelect(experimentId)}
                >
                  {experimentId}
                </div>
              ))}
            </div>
          </div>

          {selectedPointId && dataset[selectedPointId] && (
            <div className="border-t border-purple-100 p-4 bg-purple-50/50 max-h-1/2 overflow-y-auto">
              <h3 className="font-medium text-sm mb-2 text-purple-800">
                {selectedPointId}
              </h3>
              
              <div className="mb-3">
                <h4 className="text-xs font-medium text-purple-700/80 mb-1.5 uppercase">Outputs</h4>
                <div className="bg-white rounded-lg border border-purple-100 p-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dataset[selectedPointId].outputs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-slate-600">{key}:</span>
                        <span className="font-medium text-slate-800">
                          {typeof value === 'number' ? formatNumber(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-purple-700/80 mb-1.5 uppercase">Key Inputs</h4>
                <div className="bg-white rounded-lg border border-purple-100 p-3 text-xs">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(dataset[selectedPointId].inputs)
                      .filter(([_, value]) => typeof value === 'number' && value > 0)
                      .sort(([_, a], [__, b]) => (b as number) - (a as number))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600 truncate mr-2">{key}:</span>
                          <span className="font-medium text-slate-800">
                            {typeof value === 'number' ? formatNumber(value) : value}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScatterPlot3D;
