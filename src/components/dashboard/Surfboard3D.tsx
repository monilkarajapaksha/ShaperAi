import { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

interface Surfboard3DProps {
  parameters: {
    length: number;
    width: number;
    thickness: number;
    noseWidth: number;
    tailWidth: number;
  };
  surfboardColor: string;
  onExportReady?: (exportFn: () => void) => void;
}

function SurfboardModel({
  parameters,
  surfboardColor,
  onExportReady,
}: Surfboard3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (onExportReady && groupRef.current) {
      onExportReady(() => {
        if (!groupRef.current) return;
        const exporter = new GLTFExporter();
        exporter.parse(
          groupRef.current,
          (gltf) => {
            const blob = new Blob([gltf as ArrayBuffer], {
              type: "application/octet-stream",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = url;
            link.download = "surfboard.glb";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          },
          (error) => {
            console.error("An error happened during parsing", error);
          },
          { binary: true },
        );
      });
    }
  }, [onExportReady, parameters, surfboardColor]);

  // Generate procedural geometry based on parameters
  const { boardGeometry, stringerGeometry } = useMemo(() => {
    const length = parameters.length; // feet
    // Converting inches to feet relative scale for visualization
    // We scale the visual representation slightly so it fits nicely
    const width = (parameters.width / 12) * 1.2;
    const thickness = parameters.thickness / 12;
    const noseWidth = (parameters.noseWidth / 12) * 1.2;
    const tailWidth = (parameters.tailWidth / 12) * 1.2;

    const shape = new THREE.Shape();

    // Draw the surfboard outline
    shape.moveTo(0, -length / 2);
    // Tail curve
    shape.bezierCurveTo(
      tailWidth / 2,
      -length / 2 + 0.5,
      width / 2,
      -length / 4,
      width / 2,
      0,
    );
    // Nose curve
    shape.bezierCurveTo(
      width / 2,
      length / 4,
      noseWidth / 2,
      length / 2 - 0.5,
      0,
      length / 2,
    );
    // Left Nose curve
    shape.bezierCurveTo(
      -noseWidth / 2,
      length / 2 - 0.5,
      -width / 2,
      length / 4,
      -width / 2,
      0,
    );
    // Left Tail curve
    shape.bezierCurveTo(
      -width / 2,
      -length / 4,
      -tailWidth / 2,
      -length / 2 + 0.5,
      0,
      -length / 2,
    );

    const extrudeSettings = {
      steps: 10, // Increased steps for smoother bending
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: thickness / 2,
      bevelSize: thickness,
      bevelSegments: 16,
      curveSegments: 64, // Increased for ultra-realism
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // Center the geometry

    // Add rocker (bend the board)
    const positionAttribute = geo.attributes.position;
    const vertex = new THREE.Vector3();
    const rockerAmount = length * 0.05; // Adjust rocker based on length

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      const yNormalized = vertex.y / (length / 2);
      // Apply parabolic curve for rocker
      vertex.z += Math.pow(yNormalized, 2) * rockerAmount;
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geo.computeVertexNormals();

    // Create stringer geometry
    const stringerShape = new THREE.Shape();
    const stringerWidth = 0.02;
    stringerShape.moveTo(-stringerWidth / 2, -length / 2);
    stringerShape.lineTo(stringerWidth / 2, -length / 2);
    stringerShape.lineTo(stringerWidth / 2, length / 2);
    stringerShape.lineTo(-stringerWidth / 2, length / 2);
    stringerShape.lineTo(-stringerWidth / 2, -length / 2);

    const stringerExtrudeSettings = {
      ...extrudeSettings,
      depth: thickness + 0.002, // Slightly thicker to prevent z-fighting
      bevelEnabled: false,
    };

    const sGeo = new THREE.ExtrudeGeometry(
      stringerShape,
      stringerExtrudeSettings,
    );
    sGeo.center();

    const sPositionAttribute = sGeo.attributes.position;
    for (let i = 0; i < sPositionAttribute.count; i++) {
      vertex.fromBufferAttribute(sPositionAttribute, i);
      const yNormalized = vertex.y / (length / 2);
      vertex.z += Math.pow(yNormalized, 2) * rockerAmount;
      sPositionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    sGeo.computeVertexNormals();

    return { boardGeometry: geo, stringerGeometry: sGeo };
  }, [parameters]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.1}
      floatIntensity={0.2}
      floatingRange={[-0.1, 0.1]}
    >
      <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={boardGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={surfboardColor}
            metalness={0.1}
            roughness={0.15}
            envMapIntensity={1.5}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transmission={0.1} // Slight translucency for fiberglass look
            thickness={0.5}
          />
        </mesh>
        <mesh geometry={stringerGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#8b5a2b" // Wood color
            metalness={0.0}
            roughness={0.8}
            clearcoat={0.5}
            clearcoatRoughness={0.2}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function Surfboard3D({
  parameters,
  surfboardColor,
  onExportReady,
}: Surfboard3DProps) {
  // Adjust camera distance based on board length
  const cameraZ = Math.max(10, parameters.length * 1.5);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 5, cameraZ], fov: 45 }}>
        <color attach="background" args={["transparent"]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={1024}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        <SurfboardModel
          parameters={parameters}
          surfboardColor={surfboardColor}
          onExportReady={onExportReady}
        />

        {/* Realistic environment reflections */}
        <Environment preset="city" />

        {/* Soft shadow underneath */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={10}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      <div className="absolute bottom-2 left-2 flex gap-2">
        <span className="text-xs bg-black/50 text-white px-2 py-1 rounded backdrop-blur">
          Drag to rotate • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
