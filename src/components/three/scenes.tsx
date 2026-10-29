import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { languages, targetLanguageIds, type LanguageId } from "@/lib/content";
import { useLearner } from "@/lib/store";
import { playSound } from "@/lib/sound";
import type { StageKind } from "./client-stage";

const INDIA: [number, number][] = [[77.84,35.49],[78.91,34.32],[78.81,33.51],[79.21,32.99],[79.18,32.48],[78.46,32.62],[78.74,31.52],[79.72,30.88],[81.11,30.18],[80.48,29.73],[80.09,28.79],[81.06,28.42],[82.0,27.93],[83.3,27.36],[84.68,27.23],[85.25,26.73],[86.02,26.63],[87.23,26.4],[88.06,26.41],[88.17,26.81],[88.04,27.45],[88.12,27.88],[88.73,28.09],[88.81,27.3],[88.84,27.1],[89.74,26.72],[90.37,26.88],[91.22,26.81],[92.03,26.84],[92.1,27.45],[91.7,27.77],[92.5,27.9],[93.41,28.64],[94.57,29.28],[95.4,29.03],[96.12,29.45],[96.59,28.83],[96.25,28.41],[97.33,28.26],[97.4,27.88],[97.05,27.7],[97.13,27.08],[96.42,27.26],[95.12,26.57],[95.16,26.0],[94.6,25.16],[94.55,24.68],[94.11,23.85],[93.33,24.08],[93.29,23.04],[93.06,22.7],[93.17,22.28],[92.67,22.04],[92.15,23.63],[91.87,23.62],[91.71,22.99],[91.16,23.5],[91.47,24.07],[91.92,24.13],[92.38,24.98],[91.8,25.15],[90.87,25.13],[89.92,25.27],[89.83,25.97],[89.36,26.01],[88.56,26.45],[88.21,25.77],[88.93,25.24],[88.31,24.87],[88.08,24.5],[88.7,24.23],[88.53,23.63],[88.88,22.88],[89.03,22.06],[88.89,21.69],[88.21,21.7],[86.98,21.5],[87.03,20.74],[86.5,20.15],[85.06,19.48],[83.94,18.3],[83.19,17.67],[82.19,17.02],[82.19,16.56],[81.69,16.31],[80.79,15.95],[80.32,15.9],[80.03,15.14],[80.23,13.84],[80.29,13.01],[79.86,12.06],[79.86,10.36],[79.34,10.31],[78.89,9.55],[79.19,9.22],[78.28,8.93],[77.94,8.25],[77.54,7.97],[76.59,8.9],[76.13,10.3],[75.75,11.31],[75.4,11.78],[74.86,12.74],[74.62,13.99],[74.44,14.62],[73.53,15.99],[73.12,17.93],[72.82,19.21],[72.82,20.42],[72.63,21.36],[71.18,20.76],[70.47,20.88],[69.16,22.09],[69.64,22.45],[69.35,22.84],[68.18,23.69],[68.84,24.36],[71.04,24.36],[70.84,25.22],[70.28,25.72],[70.17,26.49],[69.51,26.94],[70.62,27.99],[71.78,27.91],[72.82,28.96],[73.45,29.98],[74.42,30.98],[74.41,31.69],[75.26,32.27],[74.45,32.76],[74.1,33.44],[73.75,34.32],[74.24,34.75],[75.76,34.5],[76.87,34.65]];

const PINS: { id: LanguageId; lon: number; lat: number }[] = [
  { id: "pa", lon: 75.4, lat: 31.1 },
  { id: "ur", lon: 77.2, lat: 28.6 },
  { id: "gu", lon: 71.5, lat: 22.7 },
  { id: "mr", lon: 75.3, lat: 19.2 },
  { id: "bn", lon: 87.8, lat: 23.4 },
  { id: "or", lon: 84.8, lat: 20.5 },
  { id: "te", lon: 79.4, lat: 16.5 },
  { id: "kn", lon: 76.2, lat: 14.2 },
  { id: "ta", lon: 78.6, lat: 11.0 },
  { id: "ml", lon: 76.4, lat: 10.2 },
];

function project(lon: number, lat: number): [number, number] {
  return [(lon - 82.2) * 0.155, (lat - 23.2) * 0.155];
}

function IndiaMesh({ active, onPick }: { active: LanguageId; onPick: (id: LanguageId) => void }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    INDIA.forEach(([lon, lat], index) => {
      const [x, y] = project(lon, lat);
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 2,
    });
    geo.computeVertexNormals();
    return geo;
  }, []);
  const outline = useMemo(() => INDIA.map(([lon, lat]) => {
    const [x, y] = project(lon, lat);
    return [x, y, 0.32] as [number, number, number];
  }), []);
  const still = useLearner().state.access.reducedMotion;
  const spin = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!spin.current || still) return;
    spin.current.rotation.z = Math.sin(performance.now() / 1800) * 0.03;
  });
  return (
    <group ref={spin} rotation={[-0.95, 0.15, 0.08]} position={[0.2, -0.15, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#1c2438" metalness={0.35} roughness={0.42} emissive="#0b1020" emissiveIntensity={0.4} />
      </mesh>
      <Line points={outline} color="#f6e7b2" lineWidth={1.4} />
      {PINS.map((pin) => {
        const [x, y] = project(pin.lon, pin.lat);
        const selected = pin.id === active;
        const color = languages[pin.id].accent;
        return (
          <group key={pin.id} position={[x, y, 0.36]}>
            <mesh
              onClick={(event) => {
                event.stopPropagation();
                onPick(pin.id);
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <sphereGeometry args={[selected ? 0.16 : 0.11, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.85 : 0.35} />
            </mesh>
            <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function GlassCard({ position, color, delay }: { position: [number, number, number]; color: string; delay: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const still = useLearner().state.access.reducedMotion;
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh || still) return;
    const t = clock.elapsedTime;
    mesh.position.y = position[1] + Math.sin(t * 0.9 + delay) * 0.18;
    mesh.rotation.x = 0.18 + Math.sin(t * 0.45 + delay) * 0.08;
    mesh.rotation.y = Math.sin(t * 0.35 + delay) * 0.35;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[1.35, 0.86, 0.07]} />
      <meshStandardMaterial color={color} roughness={0.18} metalness={0.12} transparent opacity={0.78} emissive={color} emissiveIntensity={0.18} />
    </mesh>
  );
}

function Studio({ variant }: { variant: "hero" | "auth" }) {
  const ring = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const still = useLearner().state.access.reducedMotion;
  useFrame(({ clock }) => {
    if (still) return;
    const t = clock.elapsedTime;
    if (ring.current) ring.current.rotation.y = t * 0.25;
    if (ring.current) ring.current.rotation.z = Math.sin(t * 0.3) * 0.12;
    if (core.current) core.current.rotation.y = t * 0.45;
  });
  const cards: [number, number, number][] = variant === "hero"
    ? [[-1.7, 0.7, 0.2], [1.55, 0.35, -0.4], [0.2, -1.15, 0.5], [-0.4, 1.45, -0.6]]
    : [[-1.2, 0.8, 0], [1.2, 0.2, -0.3], [0.1, -1.05, 0.4]];
  const colors = ["#f07845", "#efb94e", "#8468e8", "#319777"];
  return (
    <group>
      {cards.map((position, index) => (
        <GlassCard key={index} position={position} color={colors[index % colors.length]} delay={index} />
      ))}
      <group ref={ring}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[1.55, 0.015, 12, 80]} />
          <meshStandardMaterial color="#f6e7b2" emissive="#efb94e" emissiveIntensity={0.4} />
        </mesh>
        {targetLanguageIds.map((id, index) => {
          const angle = (index / targetLanguageIds.length) * Math.PI * 2;
          return (
            <mesh key={id} position={[Math.cos(angle) * 1.55, Math.sin(angle) * 0.35, Math.sin(angle) * 1.55]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshStandardMaterial color={languages[id].accent} emissive={languages[id].accent} emissiveIntensity={0.55} />
            </mesh>
          );
        })}
      </group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#2a2758" roughness={0.25} metalness={0.4} emissive="#6d63d6" emissiveIntensity={0.35} wireframe />
      </mesh>
    </group>
  );
}

function Orb() {
  const ref = useRef<THREE.Mesh>(null);
  const still = useLearner().state.access.reducedMotion;
  useFrame((_, delta) => {
    if (ref.current && !still) ref.current.rotation.y += delta * 0.45;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.05, 1]} />
      <meshStandardMaterial color="#efb94e" emissive="#f07845" emissiveIntensity={0.35} wireframe />
    </mesh>
  );
}

function Scene({ kind }: { kind: StageKind }) {
  const { state, update } = useLearner();
  const reduced = state.access.reducedMotion;
  const light = state.access.theme === "light";
  if (kind === "map") {
    return (
      <>
        <color attach="background" args={[light ? "#efe8dc" : "#0c101c"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} />
        <pointLight position={[-3, 2, 4]} color="#efb94e" intensity={8} />
        <IndiaMesh
          active={state.target}
          onPick={(id) => {
            update({ target: id });
            playSound("pin");
          }}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, 0]}>
          <circleGeometry args={[5.5, 48]} />
          <meshBasicMaterial color={light ? "#d9d0c2" : "#070910"} />
        </mesh>
        <OrbitControls enablePan={false} autoRotate={!reduced} autoRotateSpeed={0.55} minDistance={5} maxDistance={12} maxPolarAngle={1.35} />
      </>
    );
  }
  if (kind === "orb") {
    return (
      <>
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 3]} color="#efb94e" intensity={6} />
        <Orb />
      </>
    );
  }
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 5]} intensity={1.15} />
      <pointLight position={[-2, 1, 3]} color={languages[state.target].accent} intensity={6} />
      <Studio variant={kind} />
    </>
  );
}

export function StageCanvas({ kind }: { kind: StageKind }) {
  const camera = kind === "map" ? { position: [0, 1.1, 8.2] as [number, number, number], fov: 42 } : kind === "orb" ? { position: [0, 0, 3.2] as [number, number, number], fov: 45 } : { position: [0, 0.2, 4.6] as [number, number, number], fov: 42 };
  return (
    <div className={`stage-3d stage-${kind}`}>
      <Canvas camera={camera} dpr={[1, 1.6]} gl={{ alpha: kind !== "map", antialias: true }}>
        <Scene kind={kind} />
      </Canvas>
    </div>
  );
}
