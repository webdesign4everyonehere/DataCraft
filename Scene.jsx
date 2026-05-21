import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import { useStore } from '../../store/useStore';
import { Suspense, useRef, useEffect, useState } from 'react';
import Node from './Node';
import Edge from './Edge';
import * as THREE from 'three';

const THEME_BG = {
  mario:   '#5c94fc',
  zelda:   '#1a1208',
  space:   '#000010',
  pokemon: '#1a6b3a',
};

const THEME_AMBIENT = {
  mario:   [1.0, '#ffffff'],
  zelda:   [0.4, '#ff9922'],
  space:   [0.2, '#8800ff'],
  pokemon: [0.7, '#aaffaa'],
};

// FPS movement component (WASD inside PointerLockControls)
function FPSMovement() {
  const { camera } = useThree();
  const keys = useRef({});
  const speed = 0.08;

  useEffect(() => {
    const down = (e) => { keys.current[e.code] = true; };
    const up   = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame(() => {
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.current['KeyW'] || keys.current['ArrowUp'])    camera.position.addScaledVector(dir, speed);
    if (keys.current['KeyS'] || keys.current['ArrowDown'])  camera.position.addScaledVector(dir, -speed);
    if (keys.current['KeyA'] || keys.current['ArrowLeft'])  camera.position.addScaledVector(right, -speed);
    if (keys.current['KeyD'] || keys.current['ArrowRight']) camera.position.addScaledVector(right, speed);
    if (keys.current['Space'])    camera.position.y += speed;
    if (keys.current['ShiftLeft'] || keys.current['ShiftRight']) camera.position.y -= speed;
  });

  return null;
}

// FPS Lock screen
function FPSOverlay({ onEnter }) {
  return (
    <div className="fps-locked-overlay" onClick={onEnter}>
      <div className="pixel-panel p-8 text-center" style={{ maxWidth: 360 }}>
        <div className="panel-header-themed p-3 border-b-4 border-white mb-4 text-sm">
          🎮 FIRST PERSON MODE
        </div>
        <p className="text-xs text-gray-300 leading-6 mb-4">
          CLICK TO LOCK MOUSE<br/>
          WASD = MOVE<br/>
          SPACE = UP  |  SHIFT = DOWN<br/>
          ESC = UNLOCK &amp; RETURN TO UI
        </p>
        <div className="btn-pixel px-4 py-2 text-xs inline-block panel-header-themed">
          CLICK TO START ▶
        </div>
      </div>
    </div>
  );
}

// Crosshair when locked
function FPSCrosshair({ visible }) {
  if (!visible) return null;
  return <div className="fps-crosshair" />;
}

export default function Scene() {
  const { nodes, edges, theme, cameraMode } = useStore();
  const [isLocked, setIsLocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const plcRef = useRef();

  const bg = THEME_BG[theme] || THEME_BG.mario;
  const [ambientInt, ambientColor] = THEME_AMBIENT[theme] || THEME_AMBIENT.mario;

  const handleEnterFPS = () => {
    if (plcRef.current) {
      plcRef.current.lock();
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ background: bg, transition: 'background 0.4s ease' }}
    >
      {/* FPS UI overlays */}
      {cameraMode === 'fps' && showOverlay && !isLocked && (
        <FPSOverlay onEnter={handleEnterFPS} />
      )}
      <FPSCrosshair visible={cameraMode === 'fps' && isLocked} />

      <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
        <color attach="background" args={[bg]} />
        <ambientLight intensity={ambientInt} color={ambientColor} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />

        <Suspense fallback={null}>
          {nodes.map((node) => (
            <Node key={node.id} position={[node.x, node.y, node.z]} value={node.value} color={node.color} />
          ))}
          {edges.map((edge) => (
            <Edge key={edge.id} start={edge.source} end={edge.target} color={edge.color} />
          ))}
        </Suspense>

        {cameraMode === 'orbit' && <OrbitControls makeDefault />}
        {cameraMode === 'fps' && (
          <>
            <PointerLockControls
              ref={plcRef}
              onLock={() => { setIsLocked(true); setShowOverlay(false); }}
              onUnlock={() => { setIsLocked(false); setShowOverlay(true); }}
            />
            <FPSMovement />
          </>
        )}
      </Canvas>
    </div>
  );
}
