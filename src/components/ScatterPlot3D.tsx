
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { DataPoint, Property } from '@/types/dataset';

// Color scale for points
const getColor = (value: number, min: number, max: number) => {
  // Using a white to blue gradient for better aesthetic
  const normalizedValue = (value - min) / (max - min);
  
  // RGB values for the gradient from white to blue
  const r = Math.round(255 * (1 - normalizedValue));
  const g = Math.round(255 * (1 - normalizedValue));
  const b = 255;
  
  return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
};

interface AxisProps {
  property: Property;
  position: [number, number, number];
  rotation?: [number, number, number];
}

const Axis: React.FC<AxisProps> = ({ property, position, rotation = [0, 0, 0] }) => {
  return (
    <Billboard follow={false} position={position} rotation={rotation}>
      <Text
        color="black"
        fontSize={0.1}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="white"
      >
        {property}
      </Text>
    </Billboard>
  );
};

interface DataPointsProps {
  dataPoints: DataPoint[];
  colorProperty: Property;
  minColor: number;
  maxColor: number;
  selectedPointId: string | null;
  onPointSelect: (id: string) => void;
  formatExperimentId: (id: string) => string;
}

const DataPoints: React.FC<DataPointsProps> = ({
  dataPoints,
  colorProperty,
  minColor,
  maxColor,
  selectedPointId,
  onPointSelect,
  formatExperimentId
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const { camera } = useThree();
  
  return (
    <group>
      {dataPoints.map((point) => {
        const color = getColor(point.value, minColor, maxColor);
        const isSelected = point.id === selectedPointId;
        const isHovered = point.id === hoveredPoint;
        
        // Determine point size - smaller than before
        const pointSize = isSelected ? 0.08 : 0.05;
        
        // Format the experiment ID for display
        const displayId = formatExperimentId(point.id);
        
        return (
          <group key={point.id} position={[point.x, point.y, point.z]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onPointSelect(point.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredPoint(point.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredPoint(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[pointSize, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={isSelected || isHovered ? color : 'black'}
                emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.3 : 0}
                roughness={0.4}
                metalness={0.8}
              />
            </mesh>
            
            {/* Show experiment ID on hover or selection */}
            {(isHovered || isSelected) && (
              <Html
                position={[0, pointSize + 0.05, 0]}
                center
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  opacity: 0.9,
                  transform: `scale(${1 / (camera.position.z * 0.2)})`,
                }}
              >
                {displayId}
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

const Scene: React.FC<{
  dataPoints: DataPoint[];
  xProperty: Property;
  yProperty: Property;
  zProperty: Property;
  colorProperty: Property;
  autoRotate: boolean;
  onPointSelect: (id: string) => void;
  selectedPointId: string | null;
  formatExperimentId: (id: string) => string;
}> = ({
  dataPoints,
  xProperty,
  yProperty,
  zProperty,
  colorProperty,
  autoRotate,
  onPointSelect,
  selectedPointId,
  formatExperimentId
}) => {
  const controlsRef = useRef<any>(null);
  
  // Find min/max for color scale
  const colorValues = dataPoints.map(point => point.value);
  const minColor = Math.min(...colorValues);
  const maxColor = Math.max(...colorValues);
  
  // Auto-rotate
  useFrame(() => {
    if (controlsRef.current && autoRotate) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <gridHelper args={[2, 10]} position={[0, -1.05, 0]} />
      
      {/* Axes labels */}
      <Axis property={xProperty} position={[1.1, -1, 0]} />
      <Axis property={yProperty} position={[0, 1.1, 0]} />
      <Axis property={zProperty} position={[0, -1, 1.1]} rotation={[0, Math.PI / 2, 0]} />
      
      {/* Data points */}
      <DataPoints
        dataPoints={dataPoints}
        colorProperty={colorProperty}
        minColor={minColor}
        maxColor={maxColor}
        selectedPointId={selectedPointId}
        onPointSelect={onPointSelect}
        formatExperimentId={formatExperimentId}
      />
      
      {/* Orbit controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        minDistance={1.5}
        maxDistance={5}
      />
    </>
  );
};

interface ScatterPlot3DProps {
  dataPoints: DataPoint[];
  xProperty: Property;
  yProperty: Property;
  zProperty: Property;
  colorProperty: Property;
  autoRotate: boolean;
  onPointSelect: (id: string) => void;
  selectedPointId: string | null;
  formatExperimentId?: (id: string) => string;
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
  formatExperimentId = (id) => id.replace('20170', '')
}) => {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #f8faff, #edf2ff)' }}>
      <Canvas camera={{ position: [1.5, 1.5, 1.5], fov: 50 }}>
        <Scene
          dataPoints={dataPoints}
          xProperty={xProperty}
          yProperty={yProperty}
          zProperty={zProperty}
          colorProperty={colorProperty}
          autoRotate={autoRotate}
          onPointSelect={onPointSelect}
          selectedPointId={selectedPointId}
          formatExperimentId={formatExperimentId}
        />
      </Canvas>
    </div>
  );
};

export default ScatterPlot3D;
