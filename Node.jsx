import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Sphere, Octahedron, Cylinder, Torus } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

/**
 * Theme-based 3D node shapes:
 *  mario   → Box (classic Mario ? block)
 *  zelda   → Octahedron (Rupee / gem)
 *  space   → Sphere + Torus ring (planet)
 *  pokemon → Cylinder (Pokéball capsule half)
 */

function MarioShape({ color, hovered }) {
  return (
    <>
      {/* Main block */}
      <Box args={[1.5, 1.5, 1.5]}>
        <meshStandardMaterial
          color={color}
          roughness={1}
          metalness={0}
          emissive={hovered ? '#f8d820' : 'black'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </Box>
      {/* Wireframe outline */}
      <Box args={[1.55, 1.55, 1.55]}>
        <meshBasicMaterial color="black" wireframe wireframeLinewidth={3} />
      </Box>
    </>
  );
}

function ZeldaShape({ color, hovered }) {
  // Octahedron = Rupee-like gem shape
  return (
    <>
      <Octahedron args={[1.0, 0]}>
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          emissive={hovered ? '#e8b84b' : color}
          emissiveIntensity={hovered ? 0.6 : 0.15}
        />
      </Octahedron>
      <Octahedron args={[1.05, 0]}>
        <meshBasicMaterial color="#e8b84b" wireframe />
      </Octahedron>
    </>
  );
}

function SpaceShape({ color, hovered }) {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.8;
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });
  return (
    <>
      {/* Planet sphere */}
      <Sphere args={[0.8, 12, 12]}>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.5}
          emissive={hovered ? '#00ffff' : color}
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </Sphere>
      {/* Rotating ring */}
      <group ref={ringRef}>
        <Torus args={[1.1, 0.08, 6, 24]}>
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.6} />
        </Torus>
      </group>
    </>
  );
}

function PokemonShape({ color, hovered }) {
  // Two-tone Pokéball: red top cylinder + white bottom cylinder
  return (
    <>
      {/* Red top half */}
      <Cylinder args={[0.85, 0.85, 0.75, 16, 1, false, 0, Math.PI]} position={[0, 0.375, 0]}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.3}
          emissive={hovered ? '#ffde00' : 'black'}
          emissiveIntensity={hovered ? 0.5 : 0}
          side={THREE.DoubleSide}
        />
      </Cylinder>
      {/* White bottom half */}
      <Cylinder args={[0.85, 0.85, 0.75, 16, 1, false, Math.PI, Math.PI]} position={[0, -0.375, 0]}>
        <meshStandardMaterial color="#eeeeee" roughness={0.4} metalness={0.1} side={THREE.DoubleSide} />
      </Cylinder>
      {/* Center band */}
      <Cylinder args={[0.87, 0.87, 0.15, 16]}>
        <meshStandardMaterial color="#111111" roughness={1} />
      </Cylinder>
      {/* Center button */}
      <Sphere args={[0.18, 12, 12]}>
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />
      </Sphere>
    </>
  );
}

const SHAPE_MAP = {
  mario:   MarioShape,
  zelda:   ZeldaShape,
  space:   SpaceShape,
  pokemon: PokemonShape,
};

export default function Node({ position, value, color = '#c84c0c' }) {
  const { theme } = useStore();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const ShapeComponent = SHAPE_MAP[theme] || MarioShape;

  // Floating bob animation — different amplitude/speed per theme
  const bobs = { mario: [3, 0.10], zelda: [1.5, 0.15], space: [0.8, 0.25], pokemon: [2, 0.08] };
  const [speed, amp] = bobs[theme] || bobs.mario;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * speed + position[0]) * amp;
    }
  });

  // Text offset so it renders in front of any shape
  const textZ = theme === 'space' ? 1.1 : theme === 'zelda' ? 1.3 : 0.9;

  return (
    <group
      position={position}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <ShapeComponent color={color} hovered={hovered} />

      <Text
        position={[0, 0, textZ]}
        fontSize={0.55}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {value}
      </Text>
    </group>
  );
}
