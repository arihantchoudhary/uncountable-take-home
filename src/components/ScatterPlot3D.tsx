
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { DataPoint, Property } from '@/types/dataset';

// Extend THREE elements so they're recognized properly
extend({ Line: THREE.Line });

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
  const normalized = min === max ? 0.5 : (value - min) / (max - min);
  if (normalized < 0.25) {
    const r = 0;
    const g = Math.round(255 * (normalized * 4));
    const b = 255;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.5) {
    const r = 0;
    const g = 255;
    const b = Math.round(255 * (1 - (normalized - 0.25) * 4));
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.75) {
    const r = Math.round(255 * ((normalized - 0.5) * 4));
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const r = 255;
    const g = Math.round(255 * (1 - (normalized - 0.75) * 4));
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
};

// Fixed AxisLine component with proper typing and implementation
const AxisLine = ({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) => {
  const points = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector3(...start));
    points.push(new THREE.Vector3(...end));
    return points;
  }, [start, end]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </line>
  );
};

// DataPoints component with fixed implementation for colorProperty
const DataPoints = ({ points, colorProperty, selectedPointId, onSelect }: {
  points: DataPoint[];
  colorProperty: Property;
  selectedPointId: string | null;
  onSelect: (id: string) => void;
}) => {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  
  // Get values for the specified colorProperty instead of a generic "value"
  const allValues = points.map(p => {
    // Safely access the color property value from the point
    return typeof p[colorProperty as keyof DataPoint] === 'number' 
      ? p[colorProperty as keyof DataPoint] as number
      : 0; // Default to 0 if property doesn't exist or isn't a number
  });
  
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  return (
    <group>
      {points.map((point) => {
        const isSelected = selectedPointId === point.id;
        const isHovered = hoveredPointId === point.id;
        
        // Get the actual value for the specified colorProperty
        const value = typeof point[colorProperty as keyof DataPoint] === 'number' 
          ? point[colorProperty as keyof DataPoint] as number
          : 0;
          
        const color = mapValueToColor(value, minValue, maxValue);

        return (
          <mesh
            key={point.id}
            position={[point.x, point.y, point.z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(point.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredPointId(point.id);
            }}
            onPointerOut={() => setHoveredPointId(null)}
          >
            <sphereGeometry args={[isSelected ? 0.05 : isHovered ? 0.04 : 0.025]} />
            <meshStandardMaterial 
              color={color}
              emissive={isSelected || isHovered ? color : "#000000"}
              emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.3 : 0}
              roughness={0.3}
              metalness={0.8}
            />
            {(isSelected || isHovered) && (
              <Html position={[0, 0.07, 0]} center className="pointer-events-none">
                <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs shadow-md border border-gray-200 whitespace-nowrap">
                  <div className="font-semibold text-center mb-1">{point.id}</div>
                  <div className="text-muted-foreground flex justify-between gap-2">
                    <span>{colorProperty}:</span>
                    <span className="font-medium">{value.toFixed(1)}</span>
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

// Simplified Axes component
const Axes = ({ xLabel, yLabel, zLabel }: { xLabel: string; yLabel: string; zLabel: string }) => {
  return (
    <group>
      <AxisLine start={[-1.2, 0, 0]} end={[1.2, 0, 0]} color="hsl(0, 0%, 30%)" />
      <Text position={[1.3, 0, 0]} fontSize={0.1} color="hsl(0, 0%, 50%)" anchorX="left">
        {xLabel}
      </Text>
      <AxisLine start={[0, -1.2, 0]} end={[0, 1.2, 0]} color="hsl(0, 0%, 30%)" />
      <Text position={[0, 1.3, 0]} fontSize={0.1} color="hsl(0, 0%, 50%)" anchorX="center" anchorY="bottom">
        {yLabel}
      </Text>
      <AxisLine start={[0, 0, -1.2]} end={[0, 0, 1.2]} color="hsl(0, 0%, 30%)" />
      <Text position={[0, 0, 1.3]} fontSize={0.1} color="hsl(0, 0%, 50%)" anchorX="center">
        {zLabel}
      </Text>
    </group>
  );
};

// Scene setup with grid and controls
const Scene = ({ children, autoRotate }: { children: React.ReactNode; autoRotate: boolean; }) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const resetCamera = () => {
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  useEffect(() => { 
    resetCamera();
  }, []);

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

// Main component with error boundary
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
  const [key, setKey] = useState(0);
  const handleResetCamera = () => setKey(prev => prev + 1);

  // Normalize data to fit within visualization bounds
  const normalizedDataPoints = useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) {
      return [];
    }
    
    // Extract values for each axis
    const xValues = dataPoints.map(p => p[xProperty as keyof DataPoint] as number);
    const yValues = dataPoints.map(p => p[yProperty as keyof DataPoint] as number);
    const zValues = dataPoints.map(p => p[zProperty as keyof DataPoint] as number);
    
    // Calculate min/max for each axis
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);
    
    // Create normalized points
    return dataPoints.map(point => {
      // Normalize each value to range -1 to 1
      const x = xMin === xMax ? 0 : (2 * ((point[xProperty as keyof DataPoint] as number) - xMin) / (xMax - xMin)) - 1;
      const y = yMin === yMax ? 0 : (2 * ((point[yProperty as keyof DataPoint] as number) - yMin) / (yMax - yMin)) - 1;
      const z = zMin === zMax ? 0 : (2 * ((point[zProperty as keyof DataPoint] as number) - zMin) / (zMax - zMin)) - 1;
      
      return {
        ...point,
        x,
        y,
        z
      };
    });
  }, [dataPoints, xProperty, yProperty, zProperty]);

  return (
    <div className="scene-container w-full h-full rounded-lg overflow-hidden relative">
      {normalizedDataPoints.length > 0 ? (
        <Canvas
          key={key}
          shadows
          dpr={[1, 2]}
          className="rounded-lg"
          gl={{ antialias: true, alpha: true }}
        >
          <PerspectiveCamera makeDefault position={[2, 2, 2]} fov={50} />
          <Scene autoRotate={autoRotate}>
            <Axes xLabel={xProperty} yLabel={yProperty} zLabel={zProperty} />
            <DataPoints
              points={normalizedDataPoints}
              colorProperty={colorProperty}
              selectedPointId={selectedPointId}
              onSelect={onPointSelect}
            />
          </Scene>
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No data points available to display</p>
        </div>
      )}
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
      <button
        onClick={handleResetCamera}
        className="absolute top-4 right-4 p-2 bg-white/70 backdrop-blur-md rounded-md shadow-lg border border-gray-200 text-xs hover:bg-white/90 transition-colors"
      >
        Reset View
      </button>
    </div>
  );
};

export default ScatterPlot3D;
