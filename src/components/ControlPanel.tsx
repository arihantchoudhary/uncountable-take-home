import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { CheckCircle, RefreshCw, RotateCw } from 'lucide-react';
import { 
  Property, 
  PropertyStats, 
  InputProperty, 
  OutputProperty 
} from '@/types/dataset';
import { getAllProperties, getInputProperties, getOutputProperties } from '@/utils/datasetUtils';

interface ControlPanelProps {
  onPropertiesChange: (x: Property, y: Property, z: Property, color: Property) => void;
  onAutoRotateToggle: () => void;
  isAutoRotating: boolean;
  propertyStats: PropertyStats;
  onFilterChange: (property: Property, min: number, max: number) => void;
  onResetFilters: () => void;
  onResetView: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onPropertiesChange,
  onAutoRotateToggle,
  isAutoRotating,
  propertyStats,
  onFilterChange,
  onResetFilters,
  onResetView
}) => {
  const allProperties = getAllProperties();
  const inputProperties = getInputProperties();
  const outputProperties = getOutputProperties();
  
  const [xProperty, setXProperty] = useState<Property>("Polymer 1");
  const [yProperty, setYProperty] = useState<Property>("Polymer 2");
  const [zProperty, setZProperty] = useState<Property>("Viscosity");
  const [colorProperty, setColorProperty] = useState<Property>("Tensile Strength");
  
  const [selectedFilterProperty, setSelectedFilterProperty] = useState<Property>(outputProperties[0]);
  const [filterRange, setFilterRange] = useState<[number, number]>([
    propertyStats[outputProperties[0]]?.min || 0,
    propertyStats[outputProperties[0]]?.max || 100
  ]);
  
  const handleXPropertyChange = (value: string) => {
    const property = value as Property;
    setXProperty(property);
    onPropertiesChange(property, yProperty, zProperty, colorProperty);
  };
  
  const handleYPropertyChange = (value: string) => {
    const property = value as Property;
    setYProperty(property);
    onPropertiesChange(xProperty, property, zProperty, colorProperty);
  };
  
  const handleZPropertyChange = (value: string) => {
    const property = value as Property;
    setZProperty(property);
    onPropertiesChange(xProperty, yProperty, property, colorProperty);
  };
  
  const handleColorPropertyChange = (value: string) => {
    const property = value as Property;
    setColorProperty(property);
    onPropertiesChange(xProperty, yProperty, zProperty, property);
  };
  
  const handleFilterPropertyChange = (value: string) => {
    const property = value as Property;
    setSelectedFilterProperty(property);
    // Reset filter range when property changes
    setFilterRange([
      propertyStats[property]?.min || 0,
      propertyStats[property]?.max || 100
    ]);
  };
  
  const handleFilterRangeChange = (values: number[]) => {
    const [min, max] = values;
    setFilterRange([min, max]);
    onFilterChange(selectedFilterProperty, min, max);
  };
  
  const handleResetFilters = () => {
    // Reset filter range
    setFilterRange([
      propertyStats[selectedFilterProperty]?.min || 0,
      propertyStats[selectedFilterProperty]?.max || 100
    ]);
    onResetFilters();
  };
  
  // Updated Reset View handler
  const handleResetView = () => {
    // Reset filter range
    handleResetFilters();
    
    // Reset rotation
    if (isAutoRotating) {
      onAutoRotateToggle();
    }
    
    // Call parent's reset view
    onResetView();
  };
  
  const handleApplyChanges = () => {
    onPropertiesChange(xProperty, yProperty, zProperty, colorProperty);
  };

  return (
    <Card className="glass-card w-full border-none shadow-lg overflow-hidden h-full flex flex-col">
      <CardHeader className="px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="text-lg">Dataset Explorer Controls</CardTitle>
        <CardDescription>Configure the 3D visualization and filters</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 overflow-y-auto flex-grow">
        <Tabs defaultValue="axis" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="axis">Axis & Color</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="axis" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="control-label">X Axis</label>
                <Select value={xProperty} onValueChange={handleXPropertyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={`x-${property}`} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="control-label">Y Axis</label>
                <Select value={yProperty} onValueChange={handleYPropertyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={`y-${property}`} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="control-label">Z Axis</label>
                <Select value={zProperty} onValueChange={handleZPropertyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={`z-${property}`} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="control-label">Color By</label>
                <Select value={colorProperty} onValueChange={handleColorPropertyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={`color-${property}`} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-2" />
              
              {/* Centered auto-rotate button with white background and blue text */}
              <div className="flex justify-center items-center">
                <Button
                  variant="outline"
                  className={`bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 border border-blue-200 ${isAutoRotating ? 'ring-2 ring-blue-200' : ''}`}
                  onClick={onAutoRotateToggle}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  {isAutoRotating ? "Stop Rotation" : "Auto-Rotate"}
                </Button>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleApplyChanges}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply Changes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="control-label">Filter Property</label>
                <Select value={selectedFilterProperty} onValueChange={handleFilterPropertyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allProperties.map((property) => (
                      <SelectItem key={`filter-${property}`} value={property}>
                        {property}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="control-label">Range</label>
                  <div className="text-xs font-mono">
                    {filterRange[0].toFixed(1)} - {filterRange[1].toFixed(1)}
                  </div>
                </div>
                
                <Slider
                  value={filterRange}
                  min={propertyStats[selectedFilterProperty]?.min || 0}
                  max={propertyStats[selectedFilterProperty]?.max || 100}
                  step={0.1}
                  onValueChange={handleFilterRangeChange}
                  className="my-4"
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleResetFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;