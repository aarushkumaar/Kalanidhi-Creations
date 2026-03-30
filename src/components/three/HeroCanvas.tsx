'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, PresentationControls, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Diamond() {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Create an octahedron which simulates a simple diamond/gem
  const geometry = useMemo(() => new THREE.OctahedronGeometry(1.5, 0), []);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.15;
      mesh.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Float floatIntensity={2} rotationIntensity={0.5} speed={2}>
      <mesh ref={mesh} geometry={geometry} scale={1.2}>
        <MeshTransmissionMaterial 
          backside
          samples={4}
          thickness={2}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={1}
          attenuationColor="#ffffff"
          color="#fce8ba"
        />
      </mesh>
    </Float>
  );
}

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none md:pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <PresentationControls 
          global 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 4, Math.PI / 4]} 
          azimuth={[-Math.PI / 4, Math.PI / 4]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
          <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />
          
          <Diamond />
          
          {/* Environment maps for reflections */}
          <Environment preset="city" />
        </PresentationControls>
        {/* Shadow plane beneath */}
        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#d4af37" />
      </Canvas>
    </div>
  );
}
