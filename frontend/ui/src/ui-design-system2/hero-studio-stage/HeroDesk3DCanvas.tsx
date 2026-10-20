'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export interface HeroDesk3DCanvasProps {
  activeItem: 'journal' | 'pencup';
  onSelectItem?: (item: 'journal' | 'pencup') => void;
  className?: string;
}

export const HeroDesk3DCanvas: React.FC<HeroDesk3DCanvasProps> = ({
  activeItem,
  onSelectItem,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

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

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
    );

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 8.8);

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.25);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xe07a38, 1.6, 18);
    rimLight.position.set(-4, -2, -3);
    scene.add(rimLight);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Journal 3D Object
    const journalGroup = new THREE.Group();
    journalGroup.name = 'journal';
    const journalGeo = new THREE.BoxGeometry(2.3, 3.1, 0.38);
    const journalMat = new THREE.MeshStandardMaterial({ color: 0xf2efe7, roughness: 0.6 });
    const journalMesh = new THREE.Mesh(journalGeo, journalMat);
    journalGroup.add(journalMesh);
    journalGroup.position.set(1.4, 0.05, 0.3);
    journalGroup.rotation.set(-0.25, -0.4, 0.1);
    stageGroup.add(journalGroup);

    // Pen Cup 3D Object
    const penCupGroup = new THREE.Group();
    penCupGroup.name = 'pencup';
    const cupGeo = new THREE.CylinderGeometry(0.7, 0.65, 1.6, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xefece4, roughness: 0.5 });
    const cupMesh = new THREE.Mesh(cupGeo, cupMat);
    penCupGroup.add(cupMesh);

    // Ruler inside pen cup
    const rulerGeo = new THREE.BoxGeometry(0.18, 2.6, 0.04);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0xd5d8dc, roughness: 0.4 });
    const rulerMesh = new THREE.Mesh(rulerGeo, rulerMat);
    rulerMesh.position.set(0.1, 0.5, 0);
    rulerMesh.rotation.set(0.1, 0.2, -0.2);
    penCupGroup.add(rulerMesh);

    penCupGroup.position.set(-1.8, -0.32, -0.2);
    penCupGroup.rotation.set(0.1, 0.3, 0);
    stageGroup.add(penCupGroup);

    // Animation & Mouse Interaction
    let animId: number;
    let clock = new THREE.Clock();
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.4;
      targetRotX = -y * 0.3;
    };

    container.addEventListener('mousemove', handlePointerMove);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle levitation
      journalGroup.position.y = 0.05 + Math.sin(t * 1.5) * 0.09;
      penCupGroup.position.y = -0.32 + Math.sin(t * 1.5 + 1.2) * 0.08;

      // Active scale
      const jScale = activeItem === 'journal' ? 1.04 : 0.97;
      const pScale = activeItem === 'pencup' ? 1.05 : 0.97;
      journalGroup.scale.lerp(new THREE.Vector3(jScale, jScale, jScale), 0.08);
      penCupGroup.scale.lerp(new THREE.Vector3(pScale, pScale, pScale), 0.08);

      stageGroup.rotation.y += (targetRotY - stageGroup.rotation.y) * 0.06;
      stageGroup.rotation.x += (targetRotX - stageGroup.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      journalGeo.dispose();
      journalMat.dispose();
      cupGeo.dispose();
      cupMat.dispose();
      rulerGeo.dispose();
      rulerMat.dispose();
      renderer.dispose();
    };
  }, [activeItem, onSelectItem]);

  return (
    <div
      ref={containerRef}
      data-testid="hero-desk-3d-container"
      className={`relative w-full h-[380px] sm:h-[480px] overflow-hidden flex items-center justify-center ${className}`}
    >
      <canvas
        ref={canvasRef}
        data-testid="hero-desk-canvas"
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
      {!hasWebGL && (
        <div
          data-testid="hero-desk-ssr-fallback"
          className="absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-xs uppercase text-[#F6F4EE]/70 bg-[#0E1014]"
        >
          [3D WEBGL HERO STAGE FALLBACK • B5 DOT-GRID JOURNAL & PEN CUP]
        </div>
      )}
    </div>
  );
};
