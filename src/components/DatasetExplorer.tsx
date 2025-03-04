import React, { useState, useEffect, Suspense, useRef } from 'react';
import ScatterPlot3D from './ScatterPlot3D';
import ControlPanel from './ControlPanel';
import ExperimentCard from './ExperimentCard';
import WelcomeGuide from './WelcomeGuide';
import PanelInfoPopup from './PanelInfoPopup';
import InfoButton from './ui/info-button';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, BarChart2, Database, Filter, RefreshCw, Beaker } from 'lucide-react';
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
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [showPanelInfoPopup, setShowPanelInfoPopup] = useState(false);
  
  // Check if welcome guide should be shown
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('welcomeGuideShown') === 'true';
    if (!hasSeenGuide) {
      setShowWelcomeGuide(true);
    }
  }, []);
  
  // Check if panel info popup should be shown
  useEffect(() => {
    const hasSeenPanelInfo = localStorage.getItem('panelInfoPopupShown') === 'true';
    if (!hasSeenPanelInfo) {
      setShowPanelInfoPopup(true);
    }
  }, []);

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
      {showWelcomeGuide && <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} />}
      {showPanelInfoPopup && <PanelInfoPopup onClose={() => setShowPanelInfoPopup(false)} />}
      <header className="bg-white text-blue-900 shadow-md mb-6">
        <div className="container mx-auto py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight text-blue-900 flex items-center">
                <Beaker className="h-6 w-6 mr-2 text-primary" />
                Uncountable Dataset Visualization
              </h1>
              
            </div>
            
            <div className="flex items-center gap-3">
              {filterSummaries.map((summary, index) => (
                <Badge key={index} variant="outline" className="px-2 py-1 bg-blue-50 backdrop-blur border-blue-200 text-blue-700">
                  <Filter className="h-3 w-3 mr-1 opacity-70" />
                  {summary.property}: {summary.range}
                </Badge>
              ))}
              
              {filterSummaries.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <Database className="h-3 w-3 mr-1 opacity-70" />
                  {filteredExperiments.length} of {Object.keys(dataset).length}
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPanelInfoPopup(true)}
                className="ml-2 text-xs"
              >
                Show Tutorial
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
        <div className="md:col-span-1">
          <Card className="glass-card p-5 card-highlight">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="text-primary h-5 w-5" />
              <h2 className="font-semibold text-base">Control Panel</h2>
              <div className="ml-auto">
                <InfoButton 
                  title="Control Panel" 
                  content={
                    <div className="space-y-2">
                      <p>The Control Panel allows you to configure the 3D visualization.</p>
                      <p>You can select properties for each axis and color, apply filters, and control the auto-rotation.</p>
                      <p>Use the "Axis & Color" tab to select which properties to display on each axis.</p>
                      <p>Use the "Filters" tab to narrow down the displayed experiments based on property values.</p>
                    </div>
                  }
                  position="right"
                />
              </div>
            </div>
            <ControlPanel
              onPropertiesChange={handlePropertiesChange}
              onAutoRotateToggle={handleAutoRotateToggle}
              isAutoRotating={autoRotate}
              propertyStats={propertyStats}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onResetView={handleResetView}
            />
          </Card>
        </div>
        
        <div className="md:col-span-2 lg:col-span-2 h-[450px] md:h-[600px] relative">
          {isLoading ? (
            <Card className="w-full h-full glass-card flex flex-col items-center justify-center">
              <div className="loading-spinner mb-4" />
              <p className="text-muted-foreground text-sm animate-pulse">Loading dataset...</p>
            </Card>
          ) : hasError ? (
            <Card className="w-full h-full glass-card flex flex-col items-center justify-center p-6 text-center gap-4">
              <Activity className="h-12 w-12 text-destructive animate-pulse" />
              <div>
                <h3 className="text-lg font-medium">Visualization Error</h3>
                <p className="text-muted-foreground">
                  There was a problem loading the 3D visualization.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
            </Card>
          ) : (
            <Card className="w-full h-full overflow-hidden border-none glass-card">
              
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center chart-area">
                  <div className="loading-spinner" />
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
          <Card className="p-4 glass-card card-highlight">
            <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              {selectedPointId ? 'Selected Experiment' : 'Select an experiment'}
              <div className="ml-auto">
                <InfoButton 
                  title="Experiment Details" 
                  content={
                    <div className="space-y-2">
                      <p>This panel shows detailed information about the selected experiment.</p>
                      <p>It displays all output properties and key input parameters for the selected experiment.</p>
                      <p>Click on a data point in the 3D visualization or an experiment in the list to view its details here.</p>
                    </div>
                  }
                  position="left"
                />
              </div>
            </h2>
            
            {selectedPointId ? (
              <div className="experiment-card overflow-hidden">
                <ExperimentCard
                  experimentId={selectedPointId}
                  experiment={getExperimentById(selectedPointId)}
                />
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-xl text-muted-foreground text-center flex flex-col items-center gap-3 bg-white/50">
                <Activity className="h-12 w-12 text-primary/20 float-animation" />
                <p>Click on a data point to view experiment details</p>
              </div>
            )}
          </Card>
          
          {/* Updated tips card to match current UI */}
          <Card className="p-5 glass-card bg-gradient-to-br from-primary/5 to-primary/10 border-none">
           
            <ul className="space-y-2 text-sm">
              {[
                { icon: <MousePointer className="h-3.5 w-3.5 text-primary/70" />, text: "Click and drag to rotate the view" },
                { icon: <PointerIcon className="h-3.5 w-3.5 text-primary/70" />, text: "Click on colored circles to select experiments" },
                { icon: <Sliders className="h-3.5 w-3.5 text-primary/70" />, text: "Use the controls to explore relationships" }
              ].map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  {tip.icon}
                  <span className="text-muted-foreground">{tip.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <div className="container mx-auto px-6">
          Powered by <span className="font-medium text-primary">Uncountable</span>
        </div>
      </footer>
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
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-4 chart-area">
          <h3 className="text-lg font-medium">Visualization Error</h3>
          <p className="text-muted-foreground">
            There was a problem rendering the visualization.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Custom icons
const Info = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const MousePointer = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
    <path d="M13 13l6 6" />
  </svg>
);

const MouseWheelIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <line x1="12" y1="7" x2="12" y2="11" />
  </svg>
);

const PointerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 14a8 8 0 0 1-8 8" />
    <path d="M18 11v-1a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v1" />
    <path d="M10 9.5V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v10" />
    <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const Sliders = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export default DatasetExplorer;
