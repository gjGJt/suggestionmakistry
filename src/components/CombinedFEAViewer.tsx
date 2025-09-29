// components/CombinedFEAViewer.tsx
"use client";

import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

interface Props {
  cadUrl:  string;     // translucent STL shell
  meshUrl: string;     // wire-frame analysis mesh (GLB)
  heatUrl: string;     // coloured GLB with COLOR_0
}

/* ─────────────────────────  top-level wrapper  ─────────────────────── */
export default function CombinedFEAViewer({ cadUrl, meshUrl, heatUrl }: Props) {
  return (
    <Canvas className="h-[50vh] sm:h-[70vh] w-full rounded-lg shadow-lg">
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 12, 10]} intensity={1.0} />
      <Suspense fallback={null}>
        <Scene cadUrl={cadUrl} meshUrl={meshUrl} heatUrl={heatUrl} />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

/* ─────────────────────────────  inner scene  ───────────────────────── */
function Scene({ cadUrl, meshUrl, heatUrl }: Props) {
  /* ----------  STL shell  ---------- */
  const stlGeom = useLoader(STLLoader, cadUrl);
  const shell = useMemo(() => (
    <mesh geometry={stlGeom} renderOrder={0}>
      <meshStandardMaterial
        color="grey"
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  ), [stlGeom]);

  /* ----------  coloured GLB (FEA result)  ---------- */
  const heatScene = useGLTF(heatUrl, true).scene;
  heatScene.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      // keep existing material if it already uses vertex colours
      const mat = (m.material as THREE.Material);
      const keep =
        (mat as any).vertexColors === true ||
        (Array.isArray(mat) && mat.some(mm => (mm as any).vertexColors));

      if (!keep) {
        m.material = new THREE.MeshStandardMaterial({
          vertexColors: true,
          flatShading:  true,
          side:         THREE.DoubleSide,
        });
      }
      // normals sometimes missing in pygltflib export
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      m.renderOrder = 1;                // sits above shell
    }
  });

  /* ----------  wireframe GLB  ---------- */
  const wireScene = useGLTF(meshUrl, true).scene;
  wireScene.traverse(obj => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.material = new THREE.MeshStandardMaterial({
        color:             0xffffff,
        wireframe:         true,
        transparent:       true,
        opacity:           0.6,
        depthWrite:        false,
        polygonOffset:     true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits:  1,
      });
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      m.renderOrder = 2;                // top-most
    }
  });

  return (
    <group>
      {shell}
      <primitive object={heatScene} />
      <primitive object={wireScene} />
    </group>
  );
}

/* cache the GLBs so they aren’t re-fetched */
useGLTF.preload = (url: string) => {};
