
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

  // Animation loop for rotation
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

  // Handle search
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

  // Scroll selected item into view in experiment list
  useEffect(() => {
    if (selectedPointId && experimentListRef.current) {
      const selectedElement = experimentListRef.current.querySelector(`[data-id="${selectedPointId}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedPointId]);

  // Linear scale - maps from one range to another
  const scaleLinear = (value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number) => {
    // Handle edge cases
    if (domainMax === domainMin) return rangeMin;
    // Linear mapping
    return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
  };
  
  // Custom color interpolation (blue -> green -> red)
  const getColorForValue = (value: number, min: number, max: number) => {
    // Normalize value to 0-1 range
    const normalized = scaleLinear(value, min, max, 0, 1);
    
    let r, g, b;
    if (normalized < 0.33) {
      // Blue to Cyan to Green (0-0.33)
      r = 0;
      g = Math.round(255 * (normalized * 3));
      b = 255;
    } else if (normalized < 0.66) {
      // Green to Yellow to Red (0.33-0.66)
      r = Math.round(255 * ((normalized - 0.33) * 3));
      g = 255;
      b = Math.round(255 * (1 - (normalized - 0.33) * 3));
    } else {
      // Red (0.66-1)
      r = 255;
      g = Math.round(255 * (1 - (normalized - 0.66) * 3));
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Create 3D projection from data points
  const projectedData = useMemo(() => {
    if (dataPoints.length === 0) return [];

    // Find min/max values for normalization
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

    // Convert angle to radians
    const angleRad = (viewAngle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Create projected data points with rotation
    return dataPoints.map(point => {
      // Project 3D to 2D with rotation around Y axis
      const x2d = point.x * cos - point.z * sin;
      const z2d = point.z * cos + point.x * sin;
      
      // Calculate color
      const color = getColorForValue(point.value || 0, colorMin, colorMax);
      
      // Use the z-coordinate to influence the point size for depth effect
      const depthSize = 40 + (z2d + 1) * 30;
      
      // Emphasize selected or hovered points
      const isSelected = point.id === selectedPointId;
      const isHovered = point.id === hoveredPointId;
      const size = isSelected ? 100 : isHovered ? 80 : depthSize;
      
      const opacity = isSelected ? 1 : isHovered ? 0.9 : 0.7;
      
      return {
        ...point,
        x: x2d,
        y: point.y,
        z: z2d,
        color,
        size,
        opacity
      };
    }).sort((a, b) => b.z - a.z); // Sort by z-depth to render back-to-front
  }, [dataPoints, viewAngle, selectedPointId, hoveredPointId]);

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div 
          className="bg-white/95 p-3 border border-gray-200 rounded-md shadow-lg backdrop-blur cursor-pointer"
          onClick={() => onPointSelect(data.id)}
        >
          <p className="font-bold text-sm mb-1">{data.id}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-gray-500">{xProperty}:</span>
            <span className="font-medium text-right">{data.x?.toFixed(1)}</span>
            
            <span className="text-gray-500">{yProperty}:</span>
            <span className="font-medium text-right">{data.y?.toFixed(1)}</span>
            
            <span className="text-gray-500">{zProperty}:</span>
            <span className="font-medium text-right">{data.z?.toFixed(1)}</span>
            
            {colorProperty && (
              <>
                <span className="text-gray-500">{colorProperty}:</span>
                <span className="font-medium text-right">{data.value?.toFixed(1)}</span>
              </>
            )}
          </div>
          <div className="mt-1 pt-1 border-t border-gray-200 text-xs flex items-center justify-center text-blue-500">
            <ExternalLink size={10} className="mr-1" />
            Click to view details
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Handle click on chart
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      onPointSelect(data.activePayload[0].payload.id);
    }
  };

  // Handle point hover
  const handlePointHover = (pointId: string | null) => {
    setHoveredPointId(pointId);
    if (pointId) {
      // Make clicking the hover-active point work by selecting it
      const handlePointClick = () => {
        onPointSelect(pointId);
      };
      
      // Listen for click events on the document while hovering
      document.addEventListener('click', handlePointClick, { once: true });
      
      return () => {
        document.removeEventListener('click', handlePointClick);
      };
    }
  };

  // Find color extent for the legend
  const colorMin = useMemo(() => Math.min(...dataPoints.map(p => p.value || 0)), [dataPoints]);
  const colorMax = useMemo(() => Math.max(...dataPoints.map(p => p.value || 0)), [dataPoints]);
  
  // Get the selected experiment data
  const selectedExperiment = useMemo(() => {
    if (!selectedPointId || !dataset[selectedPointId]) return null;
    return dataset[selectedPointId];
  }, [selectedPointId]);

  // Sort experiments for the experiment list
  const sortedExperiments = useMemo(() => {
    return Object.keys(dataset).sort();
  }, []);

  return (
    <div className="w-full h-full flex">
      {/* Main visualization area */}
      <div className="flex-grow relative">
        <div className="scene-container w-full h-full rounded-lg overflow-hidden">
          {/* Search panel */}
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
          
          {/* Experiment list toggle button */}
          <div className="absolute top-4 right-4 z-10">
            <button 
              className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-all"
              onClick={() => setShowExperimentList(!showExperimentList)}
              title={showExperimentList ? "Hide experiment list" : "Show experiment list"}
            >
              <ChevronRight size={18} className={`text-gray-700 transform transition-transform ${showExperimentList ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* Main visualization */}
          <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                onClick={handleChartClick}
              >
                {/* Grid with custom styling */}
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                
                {/* Axes with better styling */}
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name={xProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: xProperty, position: 'bottom', style: { fill: '#666', fontSize: 12 } }}
                  tick={{ fontSize: 10, fill: '#666' }}
                  axisLine={{ stroke: '#999' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={yProperty} 
                  domain={[-1.2, 1.2]}
                  label={{ value: yProperty, angle: -90, position: 'left', style: { fill: '#666', fontSize: 12 } }}
                  tick={{ fontSize: 10, fill: '#666' }}
                  axisLine={{ stroke: '#999' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="size" 
                  range={[20, 120]} 
                  name={zProperty} 
                />
                
                {/* Enhanced tooltip */}
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: 'rgba(0,0,0,0.3)' }}
                />
                
                {/* Customized legend */}
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-gray-700">{value}</span>}
                />

                {/* Render data points with enhanced styling */}
                {projectedData.map((point) => (
                  <Scatter
                    key={`scatter-${point.id}`}
                    name={point.id === selectedPointId ? `Selected: ${point.id}` : undefined}
                    data={[point]}
                    fill={point.color}
                    strokeWidth={point.id === selectedPointId ? 2 : 0.5}
                    stroke={point.id === selectedPointId ? '#fff' : 'rgba(0,0,0,0.3)'}
                    fillOpacity={point.opacity}
                    onMouseEnter={() => handlePointHover(point.id)}
                    onMouseLeave={() => handlePointHover(null)}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced color legend overlay */}
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

      {/* Experiment list and details panel */}
      {showExperimentList && (
        <div className="w-64 bg-white border-l flex flex-col">
          {/* Experiment list panel */}
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Experiments</h3>
            <p className="text-xs text-gray-500">
              {dataPoints.length} experiments loaded
            </p>
          </div>

          {/* Experiment list */}
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

          {/* Selected experiment details */}
          {selectedExperiment && (
            <div className="border-t p-3 bg-gray-50 max-h-1/2 overflow-y-auto">
              <h3 className="font-medium text-sm mb-2">
                {selectedPointId}
              </h3>
              
              {/* Outputs section */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-500 mb-1 uppercase">Outputs</h4>
                <div className="bg-white rounded border p-2 text-xs">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(selectedExperiment.outputs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Inputs section */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-1 uppercase">Key Inputs</h4>
                <div className="bg-white rounded border p-2 text-xs">
                  <div className="grid grid-cols-1 gap-1">
                    {Object.entries(selectedExperiment.inputs)
                      .filter(([_, value]) => typeof value === 'number' && value > 0)
                      .sort(([_, a], [__, b]) => (b as number) - (a as number))
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 truncate mr-2">{key}:</span>
                          <span className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</span>
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
