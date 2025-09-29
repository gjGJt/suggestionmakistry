// components/CombinedModelViewer.tsx
"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { STLLoader } from "three-stdlib";
import { Suspense } from "react";
import * as THREE from "three";

interface CombinedModelViewerProps {
  cadUrl: string;   // your solid model
  meshUrl: string;   // your wireframe mesh
}

export default function CombinedModelViewer({
  cadUrl,
  meshUrl,
}: CombinedModelViewerProps) {
  return (
    <Canvas className="h-[50vh] sm:h-[70vh] w-full rounded-lg shadow-lg">
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <Suspense fallback={null}>
        <ModelOverlay stlUrl={cadUrl} glbUrl={meshUrl} />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  );
}

function ModelOverlay({
  stlUrl,
  glbUrl,
}: {
  stlUrl: string;
  glbUrl: string;
}) {
  // load the STL geometry
  const stlGeom = useLoader(STLLoader, stlUrl, (loader) => {
    loader.manager.setURLModifier((url) => url); // ensure no cache busting
  });
  // load the GLB scene
  const { scene: gltfScene } = useGLTF(glbUrl, true);

  // center both at origin
  const stlMesh = (
    <mesh geometry={stlGeom} receiveShadow castShadow>
      <meshStandardMaterial
        color="grey"
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );

  // apply wireframe material to every mesh in the glTF
  gltfScene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        wireframe: true,
        flatShading: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      mesh.renderOrder = 1;
      if (!mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals();
      }
    }
  });

  return (
    <group>
      {stlMesh}
      <primitive object={gltfScene} />
    </group>
  );
}
