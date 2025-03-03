
import React, { useState, useEffect, Suspense, useRef } from 'react';
import ScatterPlot3D from './ScatterPlot3D';
import ControlPanel from './ControlPanel';
import ExperimentCard from './ExperimentCard';
import { 
  createDataPoints, 
  calculatePropertyStats, 
  getExperimentById, 
  dataset,
  filterExperiments 
} from '@/utils/datasetUtils';
import { 
  DataPoint, 
  Property, 
  PropertyStats 
} from '@/types/dataset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DatasetExplorer: React.FC = () => {
  // State for selected properties
  const [xProperty, setXProperty] = useState<Property>("Polymer 1");
  const [yProperty, setYProperty] = useState<Property>("Polymer 2");
  const [zProperty, setZProperty] = useState<Property>("Viscosity");
  const [colorProperty, setColorProperty] = useState<Property>("Tensile Strength");
  
  // State for data points and property statistics
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [propertyStats, setPropertyStats] = useState<PropertyStats>({});
  
  // State for visualization
  const [isLoading, setIsLoading] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  
  // State for filters
  const [filteredExperiments, setFilteredExperiments] = useState<string[]>(Object.keys(dataset));
  const [activeFilters, setActiveFilters] = useState<{
    property: Property;
    min: number;
    max: number;
  }[]>([]);
  
  const { toast } = useToast();
  const hasLoadedRef = useRef(false);
  
  // Load property statistics once
  useEffect(() => {
    if (hasLoadedRef.current) return;
    
    try {
      const stats = calculatePropertyStats();
      setPropertyStats(stats);
      setIsLoading(false);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to load property statistics:', error);
      setHasError(true);
      setIsLoading(false);
      toast({
        title: "Error loading data",
        description: "There was a problem loading the dataset. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Update data points when properties or filters change
  useEffect(() => {
    if (Object.keys(propertyStats).length === 0) return;
    
    try {
      // Create data points for all experiments
      const allPoints = createDataPoints(
        xProperty,
        yProperty,
        zProperty,
        colorProperty,
        propertyStats
      );
      
      // Filter the data points
      const filteredPoints = allPoints.filter(point => 
        filteredExperiments.includes(point.id)
      );
      
      setDataPoints(filteredPoints);
    } catch (error) {
      console.error('Failed to update data points:', error);
      toast({
        title: "Error updating visualization",
        description: "There was a problem updating the visualization. Some data may not display correctly.",
        variant: "destructive"
      });
    }
  }, [xProperty, yProperty, zProperty, colorProperty, propertyStats, filteredExperiments, toast]);
  
  // Handle property changes
  const handlePropertiesChange = (
    x: Property,
    y: Property,
    z: Property,
    color: Property
  ) => {
    setXProperty(x);
    setYProperty(y);
    setZProperty(z);
    setColorProperty(color);
  };
  
  // Handle auto-rotate toggle
  const handleAutoRotateToggle = () => {
    setAutoRotate(prev => !prev);
  };
  
  // Handle point selection
  const handlePointSelect = (pointId: string) => {
    setSelectedPointId(pointId === selectedPointId ? null : pointId);
  };
  
  // Handle filter changes
  const handleFilterChange = (
    property: Property,
    min: number,
    max: number
  ) => {
    // Update active filters
    const newFilters = activeFilters.filter(f => f.property !== property);
    newFilters.push({ property, min, max });
    setActiveFilters(newFilters);
    
    // Apply filters to experiments
    const filtered = filterExperiments(newFilters);
    setFilteredExperiments(filtered);
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setActiveFilters([]);
    setFilteredExperiments(Object.keys(dataset));
  };
  
  // Handle reset view
  const handleResetView = () => {
    setAutoRotate(true);
  };
  
  // Calculate filter summaries for display
  const filterSummaries = activeFilters.map(filter => ({
    property: filter.property,
    range: `${filter.min.toFixed(1)} - ${filter.max.toFixed(1)}`
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <header className="p-4 bg-background shadow-sm mb-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Polymer Experiment Explorer
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {filterSummaries.map((summary, index) => (
                <Badge key={index} variant="outline" className="px-2 py-1">
                  {summary.property}: {summary.range}
                </Badge>
              ))}
              
              {filterSummaries.length > 0 && (
                <Badge variant="secondary">
                  {filteredExperiments.length} of {Object.keys(dataset).length} experiments
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
        <div className="md:col-span-1">
          <ControlPanel
            onPropertiesChange={handlePropertiesChange}
            onAutoRotateToggle={handleAutoRotateToggle}
            isAutoRotating={autoRotate}
            propertyStats={propertyStats}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onResetView={handleResetView}
          />
        </div>
        
        <div className="md:col-span-2 lg:col-span-2 h-[450px] md:h-[600px]">
          {isLoading ? (
            <Card className="w-full h-full flex items-center justify-center">
              <div className="loading-spinner" />
            </Card>
          ) : hasError ? (
            <Card className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-4">
              <Activity className="h-12 w-12 text-muted-foreground animate-pulse" />
              <div>
                <h3 className="text-lg font-medium">Visualization Error</h3>
                <p className="text-muted-foreground">
                  There was a problem loading the 3D visualization.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Reload Page
              </button>
            </Card>
          ) : (
            <Card className="w-full h-full overflow-hidden border-none shadow-lg">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-full h-full" />
                </div>
              }>
                <ErrorBoundary>
                  <ScatterPlot3D
                    dataPoints={dataPoints}
                    xProperty={xProperty}
                    yProperty={yProperty}
                    zProperty={zProperty}
                    colorProperty={colorProperty}
                    autoRotate={autoRotate}
                    onPointSelect={handlePointSelect}
                    selectedPointId={selectedPointId}
                  />
                </ErrorBoundary>
              </Suspense>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-3 lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">
            {selectedPointId ? 'Selected Experiment' : 'Select an experiment'}
          </h2>
          
          {selectedPointId ? (
            <ExperimentCard
              experimentId={selectedPointId}
              experiment={getExperimentById(selectedPointId)}
            />
          ) : (
            <Card className="p-4 border border-dashed text-muted-foreground text-center">
              Click on a data point to view details
            </Card>
          )}
          
          {/* Small tips card */}
          <Card className="p-4 bg-muted/40 border-none">
            <h3 className="font-medium mb-2">Tips</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Click and drag to rotate the view</li>
              <li>• Scroll to zoom in/out</li>
              <li>• Click on data points to inspect experiments</li>
              <li>• Use the controls to explore relationships</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Simple error boundary component to catch Three.js rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("3D Visualization error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center gap-4">
          <h3 className="text-lg font-medium">Visualization Error</h3>
          <p className="text-muted-foreground">
            There was a problem rendering the 3D visualization.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DatasetExplorer;
