// src/components/ThreeJsBackdrop.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, RoomEnvironment, type GLTF } from "three-stdlib";

type Props = {
  /** Optional path to a GLB model placed in /public (e.g. "/models/shield.glb") */
  modelPath?: string | null;
  /** Size & placement tuning */
  fov?: number;
  distance?: number;
  rotationSpeed?: number;
};

export default function ThreeJsBackdrop({
  modelPath = "/models/shield.glb",
  fov = 40,
  distance = 8,
  rotationSpeed = 0.005,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    // Support old/new three color-space APIs without type errors
    if ("outputColorSpace" in renderer) {
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    } else {
      (renderer as any).outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(0, 0, distance);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 6);
    scene.add(key);

    // Environment reflections (safe across versions)
    const pmrem = new THREE.PMREMGenerator(renderer);
    let envRT: ReturnType<THREE.PMREMGenerator["fromScene"]> | null = null;
    try {
      envRT = pmrem.fromScene(new (RoomEnvironment as any)(), 0.04);
      scene.environment = envRT.texture;
    } catch {
      // ignore if RoomEnvironment types don’t match this three version
    }

    // Content group
    const group = new THREE.Group();
    scene.add(group);

    // Fallback geometry (if GLB fails)
    const fallbackGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 200, 32);
    const fallbackMat = new THREE.MeshPhysicalMaterial({
      color: 0x5b6cff,
      metalness: 0.6,
      roughness: 0.2,
      transmission: 0.0,
      clearcoat: 0.6,
      envMapIntensity: 0.9,
    });
    const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
    fallbackMesh.visible = false;
    group.add(fallbackMesh);

    // Load GLB
    const loader = new GLTFLoader();
    let loadedMesh: THREE.Object3D | null = null;

    loader.load(
      modelPath ?? "",
      (gltf: GLTF) => {
        loadedMesh = gltf.scene;

        // Explicit param type avoids “implicit any” complaint
        loadedMesh.traverse((obj: THREE.Object3D) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;

            // material can be a single Material or an array
            const m = obj.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(m)) {
              m.forEach((mat) => ((mat as any).envMapIntensity = 0.9));
            } else if (m) {
              (m as any).envMapIntensity = 0.9;
            }
          }
        });

        loadedMesh.scale.setScalar(1.2);
        group.add(loadedMesh);
      },
      undefined,
      () => {
        // On error, show fallback
        fallbackMesh.visible = true;
      }
    );

    // Resize to container
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    // Animate
    const tick = () => {
      group.rotation.y += rotationSpeed;
      group.rotation.x = Math.sin(performance.now() * 0.0003) * 0.08;
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      scene.clear();
      fallbackGeo.dispose();
      fallbackMat.dispose();
      if (envRT) envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [distance, fov, modelPath, rotationSpeed]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="
        pointer-events-none absolute left-1/2 top-1/2 -z-[1]
        h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-55
      "
    />
  );
}
