import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';

export default function Edge({ start, end, color = "#ffffff" }) {
  const meshRef = useRef();

  useLayoutEffect(() => {
    if (meshRef.current) {
      const startVec = new THREE.Vector3(...start);
      const endVec = new THREE.Vector3(...end);
      const distance = startVec.distanceTo(endVec);
      const position = startVec.clone().lerp(endVec, 0.5);
      
      meshRef.current.position.copy(position);
      // We scale the cylinder to match the distance
      meshRef.current.scale.set(1, distance, 1);
      
      // Orient the cylinder from start to end
      meshRef.current.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        endVec.clone().sub(startVec).normalize()
      );
    }
  }, [start, end]);

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.6} 
        roughness={0.2}
        emissive={color === "#ffffff" ? "black" : color}
        emissiveIntensity={color === "#ffffff" ? 0 : 0.5}
      />
    </mesh>
  );
}
