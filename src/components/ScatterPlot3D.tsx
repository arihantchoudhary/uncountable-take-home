
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Html,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';
import { DataPoint, Property } from '@/types/dataset';

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

// Helper to map a value to a color
const mapValueToColor = (value: number, min: number, max: number): string => {
  // Normalize value between 0 and 1
  const normalized = min === max ? 0.5 : (value - min) / (max - min);
  
  // Color palette from blue to cyan to green to yellow to red
  if (normalized < 0.25) {
    // Blue to cyan
    const r = 0;
    const g = Math.round(255 * (normalized * 4));
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.5) {
    // Cyan to green
    const r = 0;
    const g = 255;
    const b = Math.round(255 * (1 - (normalized - 0.25) * 4));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.75) {
    // Green to yellow
    const r = Math.round(255 * ((normalized - 0.5) * 4));
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to red
    const r = 255;
    const g = Math.round(255 * (1 - (normalized - 0.75) * 4));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// DataPoints component
const DataPoints: React.FC<{
  points: DataPoint[];
  colorProperty: Property;
  selectedPointId: string | null;
  onSelect: (id: string) => void;
}> = ({ points, colorProperty, selectedPointId, onSelect }) => {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  
  // Get min and max values for color mapping
  const allValues = points.map(p => p.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  return (
    <group>
      {points.map((point) => {
        const isSelected = selectedPointId === point.id;
        const isHovered = hoveredPointId === point.id;
        const color = mapValueToColor(point.value, minValue, maxValue);
        
        return (
          <mesh
            key={point.id}
            position={[point.x, point.y, point.z]}
            onClick={() => onSelect(point.id)}
            onPointerOver={() => setHoveredPointId(point.id)}
            onPointerOut={() => setHoveredPointId(null)}
          >
            <sphereGeometry args={[isSelected ? 0.05 : isHovered ? 0.04 : 0.025]} />
            <meshStandardMaterial 
              color={color} 
              emissive={isSelected || isHovered ? color : undefined}
              emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.3 : 0}
              roughness={0.3}
              metalness={0.8}
            />
            
            {(isSelected || isHovered) && (
              <Html
                position={[0, 0.07, 0]}
                center
                className="pointer-events-none"
              >
                <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs shadow-md border border-gray-200 whitespace-nowrap">
                  <div className="font-semibold text-center mb-1">{point.id}</div>
                  <div className="text-muted-foreground flex justify-between gap-2">
                    <span>{colorProperty}:</span>
                    <span className="font-medium">{point.value.toFixed(1)}</span>
                  </div>
                </div>
              </Html>
            )}
          </mesh>
        );
      })}
    </group>
  );
};

// Axes component
const Axes: React.FC<{
  xLabel: string;
  yLabel: string;
  zLabel: string;
}> = ({ xLabel, yLabel, zLabel }) => {
  return (
    <group>
      {/* X-axis */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes={{
            position: new THREE.BufferAttribute(
              new Float32Array([-1.2, 0, 0, 1.2, 0, 0]),
              3
            ),
          }}
        />
        <lineBasicMaterial attach="material" color="hsl(0, 0%, 30%)" linewidth={2} />
      </line>
      <Text
        position={[1.3, 0, 0]}
        fontSize={0.1}
        color="hsl(0, 0%, 50%)"
        anchorX="left"
      >
        {xLabel}
      </Text>

      {/* Y-axis */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes={{
            position: new THREE.BufferAttribute(
              new Float32Array([0, -1.2, 0, 0, 1.2, 0]),
              3
            ),
          }}
        />
        <lineBasicMaterial attach="material" color="hsl(0, 0%, 30%)" linewidth={2} />
      </line>
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.1}
        color="hsl(0, 0%, 50%)"
        anchorX="center"
        anchorY="bottom"
      >
        {yLabel}
      </Text>

      {/* Z-axis */}
      <line>
        <bufferGeometry
          attach="geometry"
          attributes={{
            position: new THREE.BufferAttribute(
              new Float32Array([0, 0, -1.2, 0, 0, 1.2]),
              3
            ),
          }}
        />
        <lineBasicMaterial attach="material" color="hsl(0, 0%, 30%)" linewidth={2} />
      </line>
      <Text
        position={[0, 0, 1.3]}
        fontSize={0.1}
        color="hsl(0, 0%, 50%)"
        anchorX="center"
      >
        {zLabel}
      </Text>
    </group>
  );
};

// Scene setup with grid and controls
const Scene: React.FC<{
  children: React.ReactNode;
  autoRotate: boolean;
  onResetCamera?: () => void;
}> = ({ children, autoRotate, onResetCamera }) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (onResetCamera) {
      const resetCamera = () => {
        camera.position.set(2, 2, 2);
        camera.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
      };
      
      // Expose the reset function
      (onResetCamera as any).current = resetCamera;
    }
  }, [camera, onResetCamera]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <OrbitControls
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={10}
      />
      <gridHelper args={[2, 10]} position={[0, -1.1, 0]} />
      {children}
    </>
  );
};

// Main component
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
  const resetCameraRef = useRef<any>(null);
  
  const handleResetCamera = () => {
    if (resetCameraRef.current) {
      resetCameraRef.current();
    }
  };

  return (
    <div className="scene-container w-full h-full rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]} className="rounded-lg">
        <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={50} />
        <Scene autoRotate={autoRotate} onResetCamera={resetCameraRef}>
          <Axes xLabel={xProperty} yLabel={yProperty} zLabel={zProperty} />
          <DataPoints 
            points={dataPoints} 
            colorProperty={colorProperty}
            selectedPointId={selectedPointId}
            onSelect={onPointSelect}
          />
        </Scene>
      </Canvas>
      
      {/* Color legend */}
      <div className="absolute bottom-4 right-4 bg-white/70 backdrop-blur-md p-2 rounded-md shadow-lg border border-gray-200">
        <div className="text-xs font-semibold mb-1">{colorProperty}</div>
        <div className="flex items-center gap-1">
          <div className="w-full h-3 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded-sm" />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-0.5">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default ScatterPlot3D;
