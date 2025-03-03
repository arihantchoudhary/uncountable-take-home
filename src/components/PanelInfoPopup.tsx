import React, { useState, useEffect } from 'react';
import { X, Info, BarChart2, Layers, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PanelInfoPopupProps {
  onClose: () => void;
}

const PanelInfoPopup: React.FC<PanelInfoPopupProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to the Dataset Explorer",
      icon: <Info className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            This interactive visualization tool helps you explore relationships between different properties in the dataset.
          </p>
          <p>
            Each panel in the application serves a specific purpose to help you analyze and understand the data.
          </p>
          <p>
            Let's take a tour of the different panels and their functions.
          </p>
        </div>
      )
    },
    {
      title: "Control Panel",
      icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            The <strong>Control Panel</strong> on the left allows you to configure what properties are displayed in the visualization.
          </p>
          <p>
            You can select different input parameters or output properties for the X, Y, and Z axes, as well as the color coding.
          </p>
          <p>
            The "Filters" tab lets you narrow down the displayed experiments based on property values.
          </p>
          <p>
            Use the Auto-Rotate toggle to control the rotation of the 3D visualization.
          </p>
        </div>
      )
    },
    {
      title: "3D Visualization",
      icon: <Layers className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            The <strong>3D Visualization</strong> in the center displays a scatter plot where each point represents an experiment.
          </p>
          <p>
            <span className="font-medium">Drag</span> to rotate the view and see the data from different angles.
          </p>
          <p>
            <span className="font-medium">Scroll</span> to zoom in and out.
          </p>
          <p>
            <span className="font-medium">Click</span> on any point to view detailed information about that experiment.
          </p>
          <p>
            The color of each point corresponds to the value of the selected color property.
          </p>
        </div>
      )
    },
    {
      title: "Experiment Selection",
      icon: <Database className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            The <strong>Experiment Selection</strong> panel at the top displays all experiments in the dataset as numbered circles.
          </p>
          <p>
            Click on any circle to select that experiment and view its details in the panel on the right.
          </p>
          <p>
            The color of each circle corresponds to the value of the selected color property.
          </p>
          <p>
            You can also search for specific experiments using the search function.
          </p>
        </div>
      )
    },
    {
      title: "Experiment Details",
      icon: <Database className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            The <strong>Experiment Details</strong> panel on the right shows detailed information about the selected experiment.
          </p>
          <p>
            It displays all output properties and key input parameters for the selected experiment.
          </p>
          <p>
            This panel helps you understand the specific configuration and results of each experiment.
          </p>
        </div>
      )
    }
  ];

  // Save to localStorage that the guide has been shown
  useEffect(() => {
    if (currentStep === steps.length) {
      localStorage.setItem('panelInfoPopupShown', 'true');
      onClose();
    }
  }, [currentStep, steps.length, onClose]);

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    localStorage.setItem('panelInfoPopupShown', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  if (currentStep >= steps.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 2147483647 }}>
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {currentStepData.icon}
              <h2 className="text-xl font-semibold text-gray-800">{currentStepData.title}</h2>
            </div>
            <button 
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close guide"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="text-gray-600 mb-6">
            {currentStepData.content}
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrev}
                >
                  Previous
                </Button>
              )}
              
              <Button 
                variant="default" 
                size="sm"
                onClick={handleNext}
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PanelInfoPopup;
