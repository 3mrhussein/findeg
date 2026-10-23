'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { ZeroGMode } from './PhysicsModeBar';

export interface ZeroGravity3DCanvasProps {
  mode: ZeroGMode;
  scatterBoost?: number;
  className?: string;
}

export const ZeroGravity3DCanvas: React.FC<ZeroGravity3DCanvasProps> = ({
  mode,
  scatterBoost = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const boostRef = useRef(scatterBoost);

  useEffect(() => {
    if (scatterBoost > 0) {
      boostRef.current = 1.6;
    }
  }, [scatterBoost]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!renderer) {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
    );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 11);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.3);
    dirLight.position.set(4, 8, 6);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xe07a38, 1.5, 22);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // Track all meshes & geometries/materials for clean disposal
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    const items: Array<{
      mesh: THREE.Group;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedRx: number;
      speedRy: number;
      phase: number;
      angle: number;
      radius: number;
    }> = [];

    const pencilColors = [0xe07a38, 0xc9f24b, 0x1e222a, 0xf2efe7, 0x93c5fd];

    for (let i = 0; i < 36; i++) {
      const objGroup = new THREE.Group();
      const kind = i % 3;

      if (kind === 0) {
        // Drafting pencil
        const bodyGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.55, 6);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: pencilColors[i % pencilColors.length],
          roughness: 0.4,
        });
        geometriesToDispose.push(bodyGeo);
        materialsToDispose.push(bodyMat);
        objGroup.add(new THREE.Mesh(bodyGeo, bodyMat));

        const tipGeo = new THREE.ConeGeometry(0.08, 0.26, 6);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.7 });
        geometriesToDispose.push(tipGeo);
        materialsToDispose.push(tipMat);
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.y = -0.9;
        tip.rotation.z = Math.PI;
        objGroup.add(tip);

        const eraserGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.18, 16);
        const eraserMat = new THREE.MeshStandardMaterial({ color: 0xe88d8d, roughness: 0.6 });
        geometriesToDispose.push(eraserGeo);
        materialsToDispose.push(eraserMat);
        const eraser = new THREE.Mesh(eraserGeo, eraserMat);
        eraser.position.y = 0.86;
        objGroup.add(eraser);
      } else if (kind === 1) {
        // Studio Eraser
        const erGeo = new THREE.BoxGeometry(0.45, 0.72, 0.2);
        const erMat = new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.5 });
        geometriesToDispose.push(erGeo);
        materialsToDispose.push(erMat);
        objGroup.add(new THREE.Mesh(erGeo, erMat));

        const sleeveGeo = new THREE.BoxGeometry(0.47, 0.36, 0.22);
        const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x181816, roughness: 0.4 });
        geometriesToDispose.push(sleeveGeo);
        materialsToDispose.push(sleeveMat);
        objGroup.add(new THREE.Mesh(sleeveGeo, sleeveMat));
      } else {
        // Highlighter
        const hiGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.3, 20);
        const hiMat = new THREE.MeshStandardMaterial({
          color: pencilColors[(i + 2) % pencilColors.length],
          roughness: 0.3,
        });
        geometriesToDispose.push(hiGeo);
        materialsToDispose.push(hiMat);
        objGroup.add(new THREE.Mesh(hiGeo, hiMat));
      }

      const baseX = (Math.random() - 0.5) * 14;
      const baseY = (Math.random() - 0.5) * 7.5;
      const baseZ = (Math.random() - 0.5) * 7 - 1;
      objGroup.position.set(baseX, baseY, baseZ);
      objGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      );

      scene.add(objGroup);
      items.push({
        mesh: objGroup,
        baseX,
        baseY,
        baseZ,
        speedRx: (Math.random() - 0.5) * 0.018,
        speedRy: (Math.random() - 0.5) * 0.018,
        phase: Math.random() * Math.PI * 2,
        angle: Math.atan2(baseY, baseX),
        radius: Math.hypot(baseX, baseY),
      });
    }

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      boostRef.current *= 0.94;
      const boost = boostRef.current;

      items.forEach((item, idx) => {
        item.mesh.rotation.x += item.speedRx + boost * 0.04;
        item.mesh.rotation.y += item.speedRy + boost * 0.04;

        if (mode === 'vortex') {
          item.angle += 0.008 + (idx % 5) * 0.0015;
          item.mesh.position.x = Math.cos(item.angle) * item.radius * (1 + boost * 0.3);
          item.mesh.position.y = Math.sin(item.angle) * (item.radius * 0.55) * (1 + boost * 0.3);
        } else {
          item.mesh.position.x =
            item.baseX * (1 + boost * 0.35) + Math.sin(t * 0.7 + item.phase) * 0.25;
          item.mesh.position.y =
            item.baseY * (1 + boost * 0.35) + Math.cos(t * 0.8 + item.phase) * 0.28;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [mode]);

  return (
    <div
      ref={containerRef}
      data-testid="zero-g-3d-container"
      className={`relative w-full h-[380px] sm:h-[480px] overflow-hidden flex items-center justify-center ${className}`}
    >
      <canvas ref={canvasRef} data-testid="zero-g-canvas" className="w-full h-full block" />
      {!hasWebGL && (
        <div
          data-testid="zero-g-ssr-fallback"
          className="absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-xs uppercase text-white/60 bg-[#0E1014]"
        >
          [ZERO-GRAVITY 3D STATIONERY FIELD • 36 WEIGHTLESS DRAFTING TOOLS]
        </div>
      )}
    </div>
  );
};
