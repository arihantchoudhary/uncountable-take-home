
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataPoint, Property } from '@/types/dataset';
import { Layers, Info, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { dataset } from '@/utils/datasetUtils';

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

  const scaleLinear = (value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) => {
    if (domainMax === domainMin) return rangeMin;
    return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
  };

  const getColorForValue = (value: number, min: number, max: number) => {
    const normalized = scaleLinear(value, min, max, 0, 1);
    
    let r, g, b;
    if (normalized < 0.33) {
      r = Math.round(20 + normalized * 3 * 60);
      g = Math.round(80 + normalized * 3 * 175);
      b = Math.round(180 + normalized * 3 * 75);
    } else if (normalized < 0.66) {
      r = Math.round(80 + (normalized - 0.33) * 3 * 175);
      g = Math.round(180);
      b = Math.round(180 - (normalized - 0.33) * 3 * 180);
    } else {
      r = 220;
      g = Math.round(180 - (normalized - 0.66) * 3 * 160);
      b = Math.round(30 - (normalized - 0.66) * 3 * 30);
    }
    
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
      const baseSize = 40;
      const depthSize = baseSize * depthFactor;
      
      const isSelected = point.id === selectedPointId;
      const isHovered = point.id === hoveredPointId;
      const size = isSelected ? 100 : isHovered ? 80 : depthSize;
      
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
        return value.toFixed(6).replace(/\.?0+$/, '').replace(/\.$/, '');
      };
      
      return (
        <div 
          className="bg-white/95 p-4 border border-blue-200 rounded-lg shadow-lg backdrop-blur cursor-pointer animate-fade-in"
          onClick={() => onPointSelect(data.id)}
          style={{
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)'
          }}
        >
          <p className="font-bold text-base mb-2 text-blue-800">{data.id}</p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
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
          <div className="mt-3 pt-2 border-t border-blue-100 text-sm flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors">
            <ExternalLink size={12} className="mr-1" />
            Click to view details
          </div>
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

  return (
    <div className="w-full h-full flex">
      <div className="flex-grow relative">
        <div className="scene-container w-full h-full rounded-lg overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <button 
              className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-all"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Search experiments"
            >
              <Search size={18} className="text-gray-700" />
            </button>
            
            {searchOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur rounded-md shadow-lg border border-gray-200 w-64 p-3">
                <h3 className="text-sm font-medium mb-2">Find Experiment</h3>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID..."
                  className="w-full p-2 border rounded text-sm mb-2"
                />
                
                {searchResults.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto">
                    <h4 className="text-xs text-gray-500 mb-1">Results ({searchResults.length})</h4>
                    <ul className="space-y-1">
                      {searchResults.map(result => (
                        <li 
                          key={result.id}
                          className={`text-xs p-1.5 rounded cursor-pointer hover:bg-blue-50 ${result.id === selectedPointId ? 'bg-blue-100 font-medium' : ''}`}
                          onClick={() => {
                            onPointSelect(result.id);
                            setSearchOpen(false);
                          }}
                        >
                          {result.id}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : searchQuery !== '' ? (
                  <p className="text-sm text-gray-500">No results found</p>
                ) : null}
              </div>
            )}
          </div>
          
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
                  stroke="rgba(59, 130, 246, 0.1)" 
                  vertical={true} 
                  horizontal={true} 
                />
                
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={xProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: xProperty, position: 'bottom', style: { fill: '#3b82f6', fontSize: 12, fontWeight: 500 } }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={formatNumber}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={yProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: yProperty, angle: -90, position: 'left', style: { fill: '#3b82f6', fontSize: 12, fontWeight: 500 } }}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={formatNumber}
                />
                <ZAxis 
                  type="number" 
                  dataKey="size" 
                  range={[20, 120]} 
                  name={zProperty} 
                />
                
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(59, 130, 246, 0.4)' }}
                />
                
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ paddingLeft: 20 }}
                  formatter={(value, entry) => {
                    const { payload } = entry;
                    if (payload && selectedPointId && payload.id === selectedPointId) {
                      return <span className="text-xs font-medium text-blue-700">Selected: {payload.id}</span>;
                    }
                    return <span className="text-xs font-medium text-blue-700">{value}</span>;
                  }}
                  onClick={(data) => {
                    if (data && data.payload) {
                      onPointSelect(data.payload.id);
                    }
                  }}
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

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-lg border border-blue-100 text-xs">
            <div className="flex items-center gap-1.5 mb-3">
              <Layers size={14} className="text-blue-600" />
              <span className="font-medium text-blue-800">{zProperty}</span>
              <span className="text-slate-500 ml-1">(depth)</span>
            </div>
            
            {colorProperty && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Info size={14} className="text-blue-600" />
                  <span className="font-medium text-blue-800">{colorProperty}</span>
                </div>
                <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-green-500 to-amber-500 rounded-full" />
                <div className="flex justify-between mt-2 text-slate-600">
                  <span>{formatNumber(colorMin)}</span>
                  <span>{formatNumber(colorMax)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExperimentList && (
        <div className="w-64 bg-white/90 backdrop-blur-sm border-l border-blue-100 flex flex-col shadow-lg animate-fade-in">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Experiments</h3>
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

          {selectedExperiment && (
            <div className="border-t border-blue-100 p-4 bg-blue-50/80 max-h-1/2 overflow-y-auto">
              <h3 className="font-medium text-sm mb-2 text-blue-800">
                {selectedPointId}
              </h3>
              
              <div className="mb-3">
                <h4 className="text-xs font-medium text-blue-700/80 mb-1.5 uppercase">Outputs</h4>
                <div className="bg-white rounded-lg border border-blue-100 p-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedExperiment.outputs).map(([key, value]) => (
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
                <h4 className="text-xs font-medium text-blue-700/80 mb-1.5 uppercase">Key Inputs</h4>
                <div className="bg-white rounded-lg border border-blue-100 p-3 text-xs">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(selectedExperiment.inputs)
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
