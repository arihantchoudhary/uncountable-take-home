import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint, Property } from '@/types/dataset';
import { 
  Layers, Info, ChevronRight, Search, MousePointer, 
  Clock, Droplet, Maximize2, TrendingUp, ArrowDown 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { dataset } from '@/utils/datasetUtils';
import { 
  TooltipProvider, 
  Tooltip as UITooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

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

interface ScatterPlot3DProps {
  dataPoints: DataPoint[];
  xProperty: Property;
  yProperty: Property;
  zProperty: Property;
  colorProperty: Property;
  autoRotate: boolean;
  onPointSelect: (pointId: string) => void;
  selectedPointId: string | null;
  onResetView?: () => void;
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
  onResetView,
}) => {
  // Default view angles
  const defaultYRotation = 0;
  const defaultXRotation = 0;
  
  // State for rotation angles
  const [yRotation, setYRotation] = useState(defaultYRotation);
  const [xRotation, setXRotation] = useState(defaultXRotation);
  
  const [viewZoom, setViewZoom] = useState(1);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DataPoint[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showExperimentList, setShowExperimentList] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  
  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);
  const experimentListRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Reset view function
  const handleResetView = () => {
    setYRotation(defaultYRotation);
    setXRotation(defaultXRotation);
    setViewZoom(1);
    setHoveredPointId(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    // If the parent component provided an onResetView handler, call it
    if (onResetView) {
      onResetView();
    }
  };

  useEffect(() => {
    if (!autoRotate) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      return;
    }

    const animate = (time: number) => {
      if (prevTimeRef.current !== null) {
        setYRotation((angle) => (angle + 0.5) % 360);
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

  // Mouse event handlers for rotation and zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button only
      setIsDragging(true);
      setLastMousePosition({ x: e.clientX, y: e.clientY });
      
      // Disable auto-rotate when user starts dragging
      if (autoRotate) {
        onAutoRotateToggle();
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;
      
      // Update both rotations
      setYRotation((angle) => (angle + deltaX * 0.5) % 360);
      setXRotation((angle) => Math.max(-45, Math.min(45, angle - deltaY * 0.5)));
      
      setLastMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleMouseLeave = (): void => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor;
    setViewZoom((zoom) => Math.max(0.5, Math.min(2.5, zoom + delta)));
  };

  // Custom event to toggle auto-rotate
  const onAutoRotateToggle = () => {
    if (typeof autoRotate === 'boolean') {
      // Component has internal state setter
      if (onAutoRotateToggle) {
        onAutoRotateToggle();
      }
    }
  };

  const formatExperimentId = (id: string) => {
    // Extract experiment number only
    const match = id.match(/_EXP_(\d+)$/);
    if (match) {
      const expNum = match[1];
      // Just return the experiment number
      return expNum;
    }
    return id.replace('20170', '').replace('_EXP_', '-');
  };

  // Format for display in the experiment list
  const formatExperimentIdForList = (id: string) => {
    // Extract date and experiment number
    const match = id.match(/^(\d{4})(\d{2})(\d{2})_EXP_(\d+)$/);
    if (match) {
      const [_, year, month, day, expNum] = match;
      // Format as MM/DD/YY - Exp #XX
      return `${month}/${day}/17 - Exp #${expNum.padStart(2, '0')}`;
    }
    return id;
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

  // Define the most intense blue color for the gradient
  const intenseBlueTint = "rgb(55, 55, 255)";

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

    // Convert degrees to radians for both rotations
    const yAngleRad = (yRotation * Math.PI) / 180;
    const xAngleRad = (xRotation * Math.PI) / 180;
    
    // Calculate trig values for both rotations
    const cosY = Math.cos(yAngleRad);
    const sinY = Math.sin(yAngleRad);
    const cosX = Math.cos(xAngleRad);
    const sinX = Math.sin(xAngleRad);

    return dataPoints.map(point => {
      // Apply Y-axis rotation (horizontal rotation)
      const xRotatedY = point.x * cosY - point.z * sinY;
      const zRotatedY = point.z * cosY + point.x * sinY;
      
      // Apply X-axis rotation (vertical tilt)
      const yRotatedX = point.y * cosX - zRotatedY * sinX;
      const zRotatedX = zRotatedY * cosX + point.y * sinX;
      
      const color = getColorForValue(point.value || 0, colorMin, colorMax);
      
      // Adjust depth factor based on the final Z position
      const depthFactor = 0.6 + (zRotatedX + 1.2) * 0.4;
      const baseSize = 20 * viewZoom; // Apply zoom to base size
      const depthSize = baseSize * depthFactor;
      
      const isSelected = point.id === selectedPointId;
      const isHovered = point.id === hoveredPointId;
      const size = isSelected ? 60 * viewZoom : isHovered ? 40 * viewZoom : depthSize;
      
      const opacity = isSelected ? 1 : isHovered ? 0.95 : 0.4 + depthFactor * 0.6;
      
      return {
        ...point,
        x: xRotatedY,
        y: yRotatedX,
        z: zRotatedX,
        color,
        size,
        opacity,
        glow: isSelected || isHovered ? true : false
      };
    }).sort((a, b) => a.z - b.z);
  }, [dataPoints, yRotation, xRotation, viewZoom, selectedPointId, hoveredPointId]);

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: DataPoint & {
        color: string;
        size: number;
        opacity: number;
        glow: boolean;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
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
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <div className="flex items-center gap-1">
              {getOutputSymbol(xProperty as string).icon}
              <span className="text-slate-500 text-xs">{getOutputSymbol(xProperty as string).symbol}:</span>
            </div>
            <span className="font-medium text-right text-slate-700">{formatValue(data.x)}</span>
            
            <div className="flex items-center gap-1">
              {getOutputSymbol(yProperty as string).icon}
              <span className="text-slate-500 text-xs">{getOutputSymbol(yProperty as string).symbol}:</span>
            </div>
            <span className="font-medium text-right text-slate-700">{formatValue(data.y)}</span>
            
            <div className="flex items-center gap-1">
              {getOutputSymbol(zProperty as string).icon}
              <span className="text-slate-500 text-xs">{getOutputSymbol(zProperty as string).symbol}:</span>
            </div>
            <span className="font-medium text-right text-slate-700">{formatValue(data.z)}</span>
            
            {colorProperty && (
              <>
                <div className="flex items-center gap-1">
                  {getOutputSymbol(colorProperty as string).icon}
                  <span className="text-slate-500 text-xs">{getOutputSymbol(colorProperty as string).symbol}:</span>
                </div>
                <span className="font-medium text-right text-slate-700">{formatValue(data.value)}</span>
              </>
            )}
          </div>
          
        </div>
      );
    }
    
    return null;
  };

  interface ChartClickData {
    activePayload?: Array<{
      payload: {
        id: string;
      };
    }>;
  }

  const handleChartClick = (data: ChartClickData) => {
    // Only trigger point selection if not dragging
    if (!isDragging && data && data.activePayload && data.activePayload.length > 0) {
      onPointSelect(data.activePayload[0].payload.id);
    }
  };

  const handlePointHover = (pointId: string | null) => {
    setHoveredPointId(pointId);
  };

  const handlePointClick = (pointId: string) => {
    if (!isDragging) {
      onPointSelect(pointId);
    }
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
            
            {/* Add Reset View button to the top panel */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              className="text-xs ml-auto"
            >
              Reset View
            </Button>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="max-h-40 overflow-y-auto bg-white rounded border border-blue-100 mb-2">
              <div className="text-xs font-medium p-2 bg-blue-50/50 border-b border-blue-100">
                Search Results ({searchResults.length})
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 p-3">
                {searchResults.map(result => (
                  <TooltipProvider key={`search-${result.id}`} delayDuration={0}>
                    <UITooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${result.id === selectedPointId ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-300'}`}
                          style={{ 
                            backgroundColor: getColorForValue(result.value || 0, colorMin, colorMax),
                            boxShadow: result.id === selectedPointId ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                          }}
                          onClick={() => onPointSelect(result.id)}
                        >
                          <span className="font-bold text-[10px] text-white text-shadow">{formatExperimentId(result.id)}</span>
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
                  <TooltipProvider key={`legend-${point.id}`} delayDuration={0}>
                    <UITooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border-2 transition-all ${point.id === selectedPointId ? 'border-blue-500 shadow-lg scale-110' : 'border-gray-300'}`}
                          style={{ 
                            backgroundColor: getColorForValue(point.value || 0, colorMin, colorMax),
                            boxShadow: point.id === selectedPointId ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                          }}
                          onClick={() => onPointSelect(point.id)}
                        >
                          <span className="font-bold text-[10px] text-white text-shadow">{formatExperimentId(point.id)}</span>
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
              Selected: Exp #{selectedPointId.match(/_EXP_(\d+)$/)?.[1].padStart(2, '0') || ''} ({selectedPointId.match(/^(\d{4})(\d{2})(\d{2})_/)?.[0].replace(/^(\d{4})(\d{2})(\d{2})_/, '$2/$3/17')})
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
          
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-md shadow-md border border-gray-200 text-xs">
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
                {/* Updated gradient to match the intense blue color */}
                <div className="h-2.5 w-full rounded-sm" style={{ background: `linear-gradient(to right, white, ${intenseBlueTint})` }} />
                <div className="flex justify-between mt-1 text-gray-600">
                  <span>{colorMin.toFixed(1)}</span>
                  <span>{colorMax.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            {/* Rotation info with X and Y rotation values */}
            <div className="mt-2 text-gray-600 text-[10px]">
              <div className="flex items-center gap-1">
                <MousePointer size={10} />
                <span>Drag to rotate (X: {xRotation.toFixed(1)}°, Y: {yRotation.toFixed(1)}°)</span>
              </div>
            </div>
          </div>
          
          <div 
            ref={chartContainerRef}
            className={`w-full h-full bg-gradient-to-b from-[#f8faff] to-[#eef4ff] animate-fade-in ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
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
                    cursor={isDragging ? 'grabbing' : 'pointer'}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
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
                  {formatExperimentIdForList(experimentId)}
                </div>
              ))}
            </div>
          </div>

          {selectedPointId && dataset[selectedPointId] && (
            <div className="border-t border-blue-100 p-4 bg-blue-50/50 max-h-1/2 overflow-y-auto">
              <h3 className="font-medium text-sm mb-2 text-blue-800">
                Experiment #{selectedPointId.match(/_EXP_(\d+)$/)?.[1].padStart(2, '0') || ''}
                <div className="text-xs text-blue-600 font-normal mt-0.5">
                  {selectedPointId.match(/^(\d{4})(\d{2})(\d{2})_/)?.[0].replace(/^(\d{4})(\d{2})(\d{2})_/, '$2/$3/17')}
                </div>
              </h3>
              
              <div className="mb-3">
                <h4 className="text-xs font-medium text-blue-700/80 mb-1.5 uppercase">Outputs</h4>
                <div className="bg-white rounded-lg border border-blue-100 p-3 text-xs">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(dataset[selectedPointId].outputs).map(([key, value]) => {
                      const { symbol, icon } = getOutputSymbol(key);
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <TooltipProvider delayDuration={0}>
                            <UITooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1.5 text-slate-600">
                                  {icon}
                                  <span className="font-medium text-sm">{symbol}:</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                {key}
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                          <span className="font-medium text-right overflow-hidden text-ellipsis" style={{ maxWidth: '60%' }}>
                            {typeof value === 'number' ? formatNumber(value) : String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-blue-700/80 mb-1.5 uppercase">Key Inputs</h4>
                <div className="bg-white rounded-lg border border-blue-100 p-3 text-xs">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(dataset[selectedPointId].inputs)
                      .filter(([_, value]) => typeof value === 'number' && value > 0)
                      .sort(([_, a], [__, b]) => (b as number) - (a as number))
                      .map(([key, value]) => {
                        const { symbol, icon } = getInputSymbol(key);
                        return (
                          <div key={key} className="flex justify-between items-center">
                            <TooltipProvider delayDuration={0}>
                              <UITooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <span className="flex items-center gap-1.5 text-slate-600">
                                    {icon}
                                    <span className="font-medium text-sm">{symbol}:</span>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="text-xs">
                                  {key}
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                            <span className="font-medium text-right overflow-hidden text-ellipsis" style={{ maxWidth: '60%' }}>
                              {typeof value === 'number' ? formatNumber(value) : String(value)}
                            </span>
                          </div>
                        );
                      })
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