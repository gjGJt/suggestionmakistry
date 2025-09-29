"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls, STLLoader } from "three-stdlib";

/* ------------------------------------------------------------------
 * ModelViewer (Makistry)
 * ------------------------------------------------------------------
 * STL-only minimal viewer used in the Artifacts panel. It auto-centers
 * geometry, frames the camera to fit the model in the available panel
 * area (accounting for aspect ratio), and re-fits on container resize so
 * the model stays visually centered when the user expands/collapses the
 * chat sidebar.
 *
 * No grid / axes (per user request). OrbitControls enabled.
 */

export interface ModelViewerProps {
  url: string;
  background?: string;
  wireframe?: boolean;
  autoRotate?: boolean;
  onLoad?: (bbox: THREE.Box3, vertexCount: number) => void;
  onError?: (err: unknown) => void;
  className?: string; // forwarded to outer div
}

export default function ModelViewer({
  url,
  background,
  wireframe = false,
  autoRotate = false,
  onLoad,
  onError,
  className,
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------- init three ------------------------- */
  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    // renderer ------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    if (background) renderer.setClearColor(new THREE.Color(background), 1);
    mountEl.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";  

    // scene ---------------------------------------------------------
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // camera --------------------------------------------------------
    const camera = new THREE.PerspectiveCamera(
      45,
      mountEl.clientWidth / Math.max(mountEl.clientHeight, 1),
      0.01,
      1000,
    );
    camera.position.set(0, 0, 1); // will be refit after model load
    cameraRef.current = camera;

    // lights --------------------------------------------------------
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.75);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 0.75);
    dir.position.set(3, 5, 8);
    scene.add(dir);

    // controls ------------------------------------------------------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controls.screenSpacePanning = false;
    controlsRef.current = controls;

    // animation loop ------------------------------------------------
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // resize --------------------------------------------------------
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const { clientWidth: w, clientHeight: h } = mountRef.current;
      const cam = cameraRef.current;
      cam.aspect = w / Math.max(h, 1);
      cam.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (meshRef.current) fitCameraToBoundingSphere(); // keep centered when layout changes
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(mountEl);
    resizeObsRef.current = ro;

    return () => {
      if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
      if (resizeObsRef.current) resizeObsRef.current.disconnect();
      controls.dispose();
      renderer.dispose();
      mountEl.removeChild(renderer.domElement);
      // dispose mesh geometry/material
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach((m) => m.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background, autoRotate]);

  /* --------------------------- load STL -------------------------- */
  useEffect(() => {
    if (!url || !sceneRef.current) return;

    setLoading(true);
    setError(null);

    // remove prior mesh --------------------------------------------
    if (meshRef.current && sceneRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
      meshRef.current = null;
    }

    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        // material --------------------------------------------------
        const material = new THREE.MeshStandardMaterial({
          color: 0xd1d5db, // light gray
          roughness: 0.8,
          metalness: 0.0,
          wireframe,
        });

        // compute bounds -------------------------------------------
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        const bbox = geometry.boundingBox ?? new THREE.Box3();
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // recenter geometry at origin ------------------------------
        const pos = geometry.attributes.position as THREE.BufferAttribute;
        const arr = pos.array as Float32Array;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i] -= center.x;
          arr[i + 1] -= center.y;
          arr[i + 2] -= center.z;
        }
        pos.needsUpdate = true;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        // mesh ------------------------------------------------------
        const mesh = new THREE.Mesh(geometry, material);
        sceneRef.current!.add(mesh);
        meshRef.current = mesh;

        // fit camera ------------------------------------------------
        fitCameraToBoundingSphere();

        setLoading(false);
        onLoad?.(bbox, pos.count);
      },
      undefined, // progress
      (err) => {
        console.error("STL load error", err);
        setError("Failed to load model");
        setLoading(false);
        onError?.(err);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, wireframe]);

  /* ----------------------- fit camera helper --------------------- */
  const fitCameraToBoundingSphere = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const mesh = meshRef.current;
    const scene = sceneRef.current;
    const mountEl = mountRef.current;
    if (!camera || !controls || !renderer || !mesh || !scene || !mountEl) return;

    // ensure bounds current
    mesh.geometry.computeBoundingSphere();
    const bs = mesh.geometry.boundingSphere;
    if (!bs) return;

    const vFov = (camera.fov * Math.PI) / 180; // vertical
    const aspect = camera.aspect;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const radius = bs.radius;
    if (radius <= 0) return;

    // distance required to fit the whole sphere in both dimensions
    const distV = radius / Math.sin(vFov / 2);
    const distH = radius / Math.sin(hFov / 2);
    const dist = Math.max(distV, distH) * 1.1; // padding

    camera.position.set(0, 0, dist);
    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.update();
    controls.saveState();

    renderer.render(scene, camera);
  };

  return (
    <div ref={mountRef} className={className ? className : "relative h-full w-full"}>
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
          Loading model…
        </div>
      )}
      {error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
