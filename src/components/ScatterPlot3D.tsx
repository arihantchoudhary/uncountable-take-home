
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

// Fixed AxisLine component with proper typing
const AxisLine = ({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) => {
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([...start, ...end]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geom;
  }, [start, end]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color }))} />
  );
};

// DataPoints component
const DataPoints = ({ points, colorProperty, selectedPointId, onSelect }: {
  points: DataPoint[];
  colorProperty: Property;
  selectedPointId: string | null;
  onSelect: (id: string) => void;
}) => {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
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

  useEffect(() => { resetCamera(); }, []);

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
  const [key, setKey] = useState(0);
  const handleResetCamera = () => setKey(prev => prev + 1);

  return (
    <div className="scene-container w-full h-full rounded-lg overflow-hidden">
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
            points={dataPoints}
            colorProperty={colorProperty}
            selectedPointId={selectedPointId}
            onSelect={onPointSelect}
          />
        </Scene>
      </Canvas>
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
