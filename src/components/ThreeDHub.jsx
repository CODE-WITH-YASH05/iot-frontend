import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeDHub() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();

    const hubGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const hubMat = new THREE.MeshPhongMaterial({
      color: 0x007aff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    group.add(hub);

    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xbf5af2,
      emissive: 0xbf5af2,
      emissiveIntensity: 2,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const ringGeo = new THREE.TorusGeometry(2.5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x64d2ff,
      transparent: true,
      opacity: 0.5,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2;
    group.add(ring1, ring2);

    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    camera.position.z = 6;

    function animate() {
      requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      hub.rotation.y -= 0.01;
      group.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      renderer.render(scene, camera);
    }

    window.addEventListener("resize", () => {
      const nw = container.clientWidth || 600;
      const nh = container.clientHeight || 600;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });

    animate();

    return () => {
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full drop-shadow-[0_0_50px_rgba(0,122,255,0.2)]"
    />
  );
}
