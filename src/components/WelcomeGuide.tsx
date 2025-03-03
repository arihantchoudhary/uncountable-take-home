import React, { useState, useEffect } from 'react';
import { X, Info, MousePointer, Layers, Filter, BarChart2, Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeGuideProps {
  onClose: () => void;
}

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onClose }) => {
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
            You can analyze how different input parameters affect output properties, discover patterns, and identify optimal experiment configurations.
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
            The central area displays a 3D scatter plot where each point represents an experiment.
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
        </div>
      )
    },
    {
      title: "Control Panel",
      icon: <BarChart2 className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>
            Use the control panel on the left to configure what properties are displayed on each axis.
          </p>
          <p>
            You can select different input parameters or output properties for the X, Y, and Z axes, as well as the color coding.
          </p>
          <p>
            The "Filters" tab allows you to narrow down the displayed experiments based on property values.
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
            The numbered circles at the top represent all experiments in the dataset.
          </p>
          <p>
            Click on any circle to select that experiment and view its details in the panel on the right.
          </p>
          <p>
            The color of each circle corresponds to the value of the selected color property.
          </p>
        </div>
      )
    }
  ];

  // Save to localStorage that the guide has been shown
  useEffect(() => {
    if (currentStep === steps.length) {
      localStorage.setItem('welcomeGuideShown', 'true');
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
    localStorage.setItem('welcomeGuideShown', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  if (currentStep >= steps.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden">
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

export default WelcomeGuide;
