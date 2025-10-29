"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

interface ParticleOrbProps {
  audioLevel: number; // 0 to 1
}

export default function ParticleOrb({ audioLevel }: ParticleOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const basePositionsRef = useRef<Float32Array | null>(null);
  const noiseOffsetsRef = useRef<Float32Array | null>(null);
  const orbitURef = useRef<Float32Array | null>(null);
  const orbitVRef = useRef<Float32Array | null>(null);
  const orbitSpeedRef = useRef<Float32Array | null>(null);
  const orbitAmpRef = useRef<Float32Array | null>(null);
  const phaseOffsetRef = useRef<Float32Array | null>(null);
  const breathOffsetRef = useRef<Float32Array | null>(null);
  const simplexRef = useRef<SimplexNoise | null>(null);
  const audioLevelRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup with stark white backdrop
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff, 1); // White background
    container.appendChild(renderer.domElement);

    const createParticleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      gradient.addColorStop(0.35, "rgba(0, 0, 0, 0.85)");
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.35)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const particleCount = 10000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const noiseOffsets = new Float32Array(particleCount * 3);
    const orbitU = new Float32Array(particleCount * 3);
    const orbitV = new Float32Array(particleCount * 3);
    const orbitSpeeds = new Float32Array(particleCount);
    const orbitAmplitudes = new Float32Array(particleCount);
    const phaseOffsets = new Float32Array(particleCount);
    const breathOffsets = new Float32Array(particleCount);

    const radius = 1.75;
    const shellBias = 0.75;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const r = radius * Math.pow(Math.random(), shellBias);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const idx = i * 3;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      basePositions[idx] = x;
      basePositions[idx + 1] = y;
      basePositions[idx + 2] = z;

      // Subtle shade variation keeps the cloud readable against white
      const shade = Math.random() * 0.25;
      colors[idx] = shade;
      colors[idx + 1] = shade;
      colors[idx + 2] = shade;

      noiseOffsets[idx] = Math.random() * 100;
      noiseOffsets[idx + 1] = Math.random() * 100;
      noiseOffsets[idx + 2] = Math.random() * 100;

      const baseLen = Math.sqrt(x * x + y * y + z * z) || 1;
      const bnX = x / baseLen;
      const bnY = y / baseLen;
      const bnZ = z / baseLen;

      // Random axis for orbiting curvature
      let ax = Math.random() * 2 - 1;
      let ay = Math.random() * 2 - 1;
      let az = Math.random() * 2 - 1;
      let axisLen = Math.sqrt(ax * ax + ay * ay + az * az);
      if (axisLen < 1e-3) {
        ax = 0;
        ay = 1;
        az = 0;
        axisLen = 1;
      }
      ax /= axisLen;
      ay /= axisLen;
      az /= axisLen;

      // Build local tangent basis around axis for curved motion
      let ux = ay * bnZ - az * bnY;
      let uy = az * bnX - ax * bnZ;
      let uz = ax * bnY - ay * bnX;
      let uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
      if (uLen < 1e-3) {
        // Fallback axis if initial axis aligned with base vector
        const fallbackX = 0;
        const fallbackY = Math.abs(bnX) > 0.5 ? 0 : 1;
        const fallbackZ = Math.abs(bnX) > 0.5 ? 1 : 0;
        ux = fallbackY * bnZ - fallbackZ * bnY;
        uy = fallbackZ * bnX - fallbackX * bnZ;
        uz = fallbackX * bnY - fallbackY * bnX;
        uLen = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
      }
      ux /= uLen;
      uy /= uLen;
      uz /= uLen;

      let vx = bnY * uz - bnZ * uy;
      let vy = bnZ * ux - bnX * uz;
      let vz = bnX * uy - bnY * ux;
      const vLen = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
      vx /= vLen;
      vy /= vLen;
      vz /= vLen;

      orbitU[idx] = ux;
      orbitU[idx + 1] = uy;
      orbitU[idx + 2] = uz;

      orbitV[idx] = vx;
      orbitV[idx + 1] = vy;
      orbitV[idx + 2] = vz;

      orbitSpeeds[i] = 0.6 + Math.random() * 1.2;
      orbitAmplitudes[i] = 0.015 + Math.random() * 0.035;
      phaseOffsets[i] = Math.random() * Math.PI * 2;
      breathOffsets[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    basePositionsRef.current = basePositions;
    noiseOffsetsRef.current = noiseOffsets;
    orbitURef.current = orbitU;
    orbitVRef.current = orbitV;
    orbitSpeedRef.current = orbitSpeeds;
    orbitAmpRef.current = orbitAmplitudes;
    phaseOffsetRef.current = phaseOffsets;
    breathOffsetRef.current = breathOffsets;
    simplexRef.current = new SimplexNoise();

    const material = new THREE.PointsMaterial({
      size: 0.035,
      map: particleTexture ?? undefined,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false; // ensure distant particles are kept
    particlesRef.current = particles;
    scene.add(particles);

    const clock = new THREE.Clock();

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (
        particles &&
        basePositionsRef.current &&
        noiseOffsetsRef.current &&
        simplexRef.current
      ) {
        const positionArray = particles.geometry.attributes.position
          .array as Float32Array;
        const baseArray = basePositionsRef.current;
        const offsetArray = noiseOffsetsRef.current;
        const simplex = simplexRef.current;
        const uArray = orbitURef.current!;
        const vArray = orbitVRef.current!;
        const speedArray = orbitSpeedRef.current!;
        const ampArray = orbitAmpRef.current!;
        const phaseArray = phaseOffsetRef.current!;
        const breathArray = breathOffsetRef.current!;

        const elapsed = clock.getElapsedTime();
        const audioBoost = Math.min(1, audioLevelRef.current * 1.4);
        const flowSpeed = 0.18 + audioBoost * 0.35;
        const displacementStrength = 0.45 + audioBoost * 1.2;
        const pullStrength = 0.1 + audioBoost * 0.08;
        const swirlStrength = 0.004 + audioBoost * 0.012;
        const maxRadius = radius * (1.25 + audioBoost * 0.35);
        const currentStrength = 0.012 + audioBoost * 0.035;
        const layerStrength = 0.04 + audioBoost * 0.12;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;

          const bx = baseArray[idx];
          const by = baseArray[idx + 1];
          const bz = baseArray[idx + 2];

          const nx = offsetArray[idx];
          const ny = offsetArray[idx + 1];
          const nz = offsetArray[idx + 2];

          const noise = simplex.noise4d(
            bx * 0.75 + nx,
            by * 0.75 + ny,
            bz * 0.75 + nz,
            elapsed * flowSpeed
          );

          const breathWave =
            1 +
            Math.sin(elapsed * 0.45 + breathArray[i]) *
              (0.08 + audioBoost * 0.2);
          const radialScale = breathWave + noise * displacementStrength;
          const targetX = bx * radialScale;
          const targetY = by * radialScale;
          const targetZ = bz * radialScale * (1.05 + audioBoost * 0.35);

          const px = positionArray[idx];
          const py = positionArray[idx + 1];
          const pz = positionArray[idx + 2];

          positionArray[idx] += (targetX - px) * pullStrength;
          positionArray[idx + 1] += (targetY - py) * pullStrength;
          positionArray[idx + 2] += (targetZ - pz) * pullStrength;

          // Add gentle swirling motion made more dramatic by the voice
          positionArray[idx] += -py * swirlStrength;
          positionArray[idx + 1] += px * swirlStrength;
          positionArray[idx + 2] +=
            Math.sin((bx + elapsed) * 0.5) * swirlStrength * 0.25;

          // Curved orbital motion around unique axes for each particle
          const orbitPhase = elapsed * speedArray[i] + phaseArray[i];
          const orbitScale = ampArray[i] * (0.4 + audioBoost * 0.85);
          const curveX =
            uArray[idx] * Math.sin(orbitPhase) +
            vArray[idx] * Math.cos(orbitPhase);
          const curveY =
            uArray[idx + 1] * Math.sin(orbitPhase) +
            vArray[idx + 1] * Math.cos(orbitPhase);
          const curveZ =
            uArray[idx + 2] * Math.sin(orbitPhase) +
            vArray[idx + 2] * Math.cos(orbitPhase);

          positionArray[idx] += curveX * orbitScale;
          positionArray[idx + 1] += curveY * orbitScale;
          positionArray[idx + 2] += curveZ * orbitScale;

          // Layered noise currents to create dense, mesmerising flows
          const flowNoise1 = simplex.noise4d(
            bx * 0.7 + nx,
            by * 0.7 + ny,
            bz * 0.7 + nz,
            elapsed * (0.28 + audioBoost * 0.6)
          );
          const flowNoise2 = simplex.noise4d(
            bx * 1.2 + ny,
            by * 1.2 + nz,
            bz * 1.2 + nx,
            elapsed * (0.4 + audioBoost * 0.8) + 15
          );
          const flowNoise3 = simplex.noise4d(
            bx * 0.9 + nz,
            by * 0.9 + nx,
            bz * 0.9 + ny,
            elapsed * (0.33 + audioBoost * 0.55) + 31
          );

          const currentX = flowNoise2 - flowNoise1;
          const currentY = flowNoise1 - flowNoise3;
          const currentZ = flowNoise2 - flowNoise3 * 0.5;

          positionArray[idx] += currentX * currentStrength;
          positionArray[idx + 1] += currentY * currentStrength;
          positionArray[idx + 2] += currentZ * currentStrength;

          // Secondary noise layer emphasizing filaments near the surface
          const filamentNoise = simplex.noise4d(
            bx * 2.2 + nx * 0.5,
            by * 2.2 + ny * 0.5,
            bz * 2.2 + nz * 0.5,
            elapsed * 0.6 + i * 0.0002
          );

          positionArray[idx] += uArray[idx] * filamentNoise * layerStrength;
          positionArray[idx + 1] +=
            uArray[idx + 1] * filamentNoise * layerStrength;
          positionArray[idx + 2] +=
            uArray[idx + 2] * filamentNoise * layerStrength;

          const finalX = positionArray[idx];
          const finalY = positionArray[idx + 1];
          const finalZ = positionArray[idx + 2];
          const distance = Math.sqrt(
            finalX * finalX + finalY * finalY + finalZ * finalZ
          );

          if (distance > maxRadius) {
            const clamp = maxRadius / distance;
            positionArray[idx] *= clamp;
            positionArray[idx + 1] *= clamp;
            positionArray[idx + 2] *= clamp;
          }
        }

        particles.geometry.attributes.position.needsUpdate = true;
      }

      if (particles) {
        const t = clock.getElapsedTime();
        particles.rotation.y += 0.0008 + audioLevelRef.current * 0.003;
        particles.rotation.z +=
          Math.sin(t * 0.12) * (0.0004 + audioLevelRef.current * 0.0015);
        particles.rotation.x =
          Math.sin(t * 0.08) * (0.05 + audioLevelRef.current * 0.08);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff",
        zIndex: 0,
      }}
    />
  );
}
