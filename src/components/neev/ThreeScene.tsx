import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  progressRef: React.MutableRefObject<number>;
}

// 6-zone deep-space journey: origin → village → device → diagnosis → cloud → impact
export default function ThreeScene({ progressRef }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05060A");
    scene.fog = new THREE.FogExp2("#05060A", 0.0025);

    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      2000,
    );
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // ---- Starfield (instanced particles) ----
    const STAR_COUNT = 4000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    const cyan = new THREE.Color("#00E5FF");
    const green = new THREE.Color("#00FFA3");
    const amber = new THREE.Color("#FFB547");
    for (let i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 400;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      starPositions[i * 3 + 2] = -Math.random() * 700;
      const pick = Math.random();
      const c = pick < 0.6 ? cyan : pick < 0.85 ? green : amber;
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Central torus knot (the "AI core") ----
    const knotGeo = new THREE.TorusKnotGeometry(2.2, 0.5, 220, 32);
    const knotMat = new THREE.MeshStandardMaterial({
      color: "#00E5FF",
      emissive: "#003844",
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.25,
      wireframe: false,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(0, 0, -120);
    scene.add(knot);

    // ---- Floating orbs in mid-journey ----
    const orbGroup = new THREE.Group();
    for (let i = 0; i < 18; i++) {
      const g = new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.8, 1);
      const m = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? "#00FFA3" : i % 3 === 1 ? "#00E5FF" : "#FFB547",
        emissive: i % 3 === 0 ? "#00FFA3" : i % 3 === 1 ? "#00E5FF" : "#FFB547",
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
      const orb = new THREE.Mesh(g, m);
      orb.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -200 - Math.random() * 200,
      );
      orb.userData.spin = Math.random() * 0.02;
      orbGroup.add(orb);
    }
    scene.add(orbGroup);

    // ---- Earth-like sphere at the end ----
    const earthGeo = new THREE.SphereGeometry(8, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: "#00FFA3",
      emissive: "#00382A",
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.6,
      wireframe: true,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, 0, -560);
    scene.add(earth);

    // ---- Lights ----
    scene.add(new THREE.AmbientLight(0x404060, 0.6));
    const keyLight = new THREE.PointLight("#00E5FF", 2, 200);
    keyLight.position.set(10, 10, -100);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight("#FFB547", 1.5, 300);
    rimLight.position.set(-20, -10, -400);
    scene.add(rimLight);

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef.current; // 0..1

      // Camera dive: z from 5 → -600
      camera.position.z = 5 + p * -605;
      camera.position.x = Math.sin(p * Math.PI * 2) * 6;
      camera.position.y = Math.cos(p * Math.PI * 1.5) * 3;
      camera.lookAt(0, 0, camera.position.z - 50);

      knot.rotation.x = t * 0.3;
      knot.rotation.y = t * 0.4;
      knot.scale.setScalar(1 + Math.sin(t) * 0.05);

      orbGroup.children.forEach((o) => {
        o.rotation.x += o.userData.spin;
        o.rotation.y += o.userData.spin * 1.3;
      });

      earth.rotation.y = t * 0.15;
      stars.rotation.z = t * 0.005;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      orbGroup.children.forEach((o) => {
        const m = o as THREE.Mesh;
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [progressRef]);

  return <div ref={mountRef} className="fixed inset-0 z-0" aria-hidden />;
}
