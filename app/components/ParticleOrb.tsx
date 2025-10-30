"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

interface ParticleOrbProps {
  audioLevel: number; // 0 to 1
  colors?: string[]; // array of hex color strings for gradient
  isAngry?: boolean; // whether Craig is angry
  isFrustrated?: boolean; // whether Craig is frustrated
  isEmbarrassed?: boolean; // whether Craig is embarrassed
  isExcited?: boolean; // whether Craig is excited
  isJoyful?: boolean; // whether Craig is joyful
  isSad?: boolean; // whether Craig is sad
  isConfused?: boolean; // whether Craig is confused
  isDisgusted?: boolean; // whether Craig is disgusted
  isCalm?: boolean; // whether Craig is calm
  isWaving?: boolean; // whether Craig is waving
  isNodding?: boolean; // whether Craig is nodding
  isShaking?: boolean; // whether Craig is shaking head
  isSmiling?: boolean; // whether Craig is smiling
  isFrowning?: boolean; // whether Craig is frowning
}

export default function ParticleOrb({
  audioLevel,
  colors = ["#000000"],
  isAngry = false,
  isFrustrated = false,
  isEmbarrassed = false,
  isExcited = false,
  isJoyful = false,
  isSad = false,
  isConfused = false,
  isDisgusted = false,
  isCalm = false,
  isWaving = false,
  isNodding = false,
  isShaking = false,
  isSmiling = false,
  isFrowning = false,
}: ParticleOrbProps) {
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
  const voiceResponsiveRef = useRef<Float32Array | null>(null);
  const centerOrbiterRef = useRef<Float32Array | null>(null); // Particles that orbit the center
  const isGrayParticleRef = useRef<Float32Array | null>(null); // 30% of particles that remain gray
  const simplexRef = useRef<SimplexNoise | null>(null);
  const audioLevelRef = useRef<number>(0);
  const smoothedAudioRef = useRef<number>(0);
  const colorsRef = useRef<THREE.Color[]>(
    colors.map((c) => new THREE.Color(c))
  );
  const targetColorsRef = useRef<THREE.Color[]>(
    colors.map((c) => new THREE.Color(c))
  );
  const fromColorsRef = useRef<THREE.Color[]>(
    colors.map((c) => new THREE.Color(c))
  ); // Store colors at start of transition
  const colorTransitionProgress = useRef<number>(1); // 1 = fully transitioned
  const isAngryRef = useRef<boolean>(false);
  const angerStartTimeRef = useRef<number>(0);
  const isFrustratedRef = useRef<boolean>(false);
  const frustrationStartTimeRef = useRef<number>(0);
  const isEmbarrassedRef = useRef<boolean>(false);
  const embarrassmentStartTimeRef = useRef<number>(0);
  const embarrassmentProgressRef = useRef<number>(0);
  const isExcitedRef = useRef<boolean>(false);
  const excitementStartTimeRef = useRef<number>(0);
  const isJoyfulRef = useRef<boolean>(false);
  const joyStartTimeRef = useRef<number>(0);
  const isSadRef = useRef<boolean>(false);
  const sadnessStartTimeRef = useRef<number>(0);
  const isConfusedRef = useRef<boolean>(false);
  const confusionStartTimeRef = useRef<number>(0);
  const isDisgustedRef = useRef<boolean>(false);
  const disgustStartTimeRef = useRef<number>(0);
  const isCalmRef = useRef<boolean>(false);
  const calmStartTimeRef = useRef<number>(0);
  const isWavingRef = useRef<boolean>(false);
  const waveStartTimeRef = useRef<number>(0);
  const isNoddingRef = useRef<boolean>(false);
  const nodStartTimeRef = useRef<number>(0);
  const isShakingRef = useRef<boolean>(false);
  const shakeStartTimeRef = useRef<number>(0);
  const isSmilingRef = useRef<boolean>(false);
  const smileStartTimeRef = useRef<number>(0);
  const isFrowningRef = useRef<boolean>(false);
  const frownStartTimeRef = useRef<number>(0);

  // Update colors when prop changes - trigger smooth transition
  useEffect(() => {
    const newColors = colors.map((c) => new THREE.Color(c));
    // Store current colors as the starting point for transition
    fromColorsRef.current = colorsRef.current.map((c) => c.clone());
    targetColorsRef.current = newColors;
    colorTransitionProgress.current = 0; // Start transition from 0
  }, [colors]);

  // Update anger state
  useEffect(() => {
    if (isAngry && !isAngryRef.current) {
      isAngryRef.current = true;
      angerStartTimeRef.current = performance.now();
      setTimeout(() => {
        isAngryRef.current = false;
      }, 3000);
    }
  }, [isAngry]);

  // Update frustration state
  useEffect(() => {
    if (isFrustrated && !isFrustratedRef.current) {
      isFrustratedRef.current = true;
      frustrationStartTimeRef.current = performance.now();
      setTimeout(() => {
        isFrustratedRef.current = false;
      }, 3000);
    }
  }, [isFrustrated]);

  // Update embarrassed state
  useEffect(() => {
    if (isEmbarrassed && !isEmbarrassedRef.current) {
      // Just became embarrassed
      isEmbarrassedRef.current = true;
      embarrassmentStartTimeRef.current = performance.now();
      embarrassmentProgressRef.current = 0;

      // Auto-reset after 2 seconds (shrinking duration)
      setTimeout(() => {
        isEmbarrassedRef.current = false;
      }, 2000);
    }
  }, [isEmbarrassed]);

  // Update excited state
  useEffect(() => {
    if (isExcited && !isExcitedRef.current) {
      // Just became excited
      isExcitedRef.current = true;
      excitementStartTimeRef.current = performance.now();

      // Auto-reset after 1.5 seconds (quick spin duration)
      setTimeout(() => {
        isExcitedRef.current = false;
      }, 1500);
    }
  }, [isExcited]);

  // Update sad state
  useEffect(() => {
    if (isSad && !isSadRef.current) {
      isSadRef.current = true;
      sadnessStartTimeRef.current = performance.now();
      setTimeout(() => {
        isSadRef.current = false;
      }, 4000);
    }
  }, [isSad]);

  // Update joyful state
  useEffect(() => {
    if (isJoyful && !isJoyfulRef.current) {
      isJoyfulRef.current = true;
      joyStartTimeRef.current = performance.now();
      setTimeout(() => {
        isJoyfulRef.current = false;
      }, 2000);
    }
  }, [isJoyful]);

  // Update confused state
  useEffect(() => {
    if (isConfused && !isConfusedRef.current) {
      isConfusedRef.current = true;
      confusionStartTimeRef.current = performance.now();
      setTimeout(() => {
        isConfusedRef.current = false;
      }, 2500);
    }
  }, [isConfused]);

  // Update disgusted state
  useEffect(() => {
    if (isDisgusted && !isDisgustedRef.current) {
      isDisgustedRef.current = true;
      disgustStartTimeRef.current = performance.now();
      setTimeout(() => {
        isDisgustedRef.current = false;
      }, 2000);
    }
  }, [isDisgusted]);

  // Update calm state
  useEffect(() => {
    if (isCalm && !isCalmRef.current) {
      isCalmRef.current = true;
      calmStartTimeRef.current = performance.now();
      setTimeout(() => {
        isCalmRef.current = false;
      }, 3000);
    }
  }, [isCalm]);

  // Update gesture states
  useEffect(() => {
    if (isWaving && !isWavingRef.current) {
      isWavingRef.current = true;
      waveStartTimeRef.current = performance.now();
      setTimeout(() => {
        isWavingRef.current = false;
      }, 1600);
    }
  }, [isWaving]);

  useEffect(() => {
    if (isNodding && !isNoddingRef.current) {
      isNoddingRef.current = true;
      nodStartTimeRef.current = performance.now();
      setTimeout(() => {
        isNoddingRef.current = false;
      }, 1400);
    }
  }, [isNodding]);

  useEffect(() => {
    if (isShaking && !isShakingRef.current) {
      isShakingRef.current = true;
      shakeStartTimeRef.current = performance.now();
      setTimeout(() => {
        isShakingRef.current = false;
      }, 1400);
    }
  }, [isShaking]);

  useEffect(() => {
    if (isSmiling && !isSmilingRef.current) {
      isSmilingRef.current = true;
      smileStartTimeRef.current = performance.now();
      setTimeout(() => {
        isSmilingRef.current = false;
      }, 2200);
    }
  }, [isSmiling]);

  useEffect(() => {
    if (isFrowning && !isFrowningRef.current) {
      isFrowningRef.current = true;
      frownStartTimeRef.current = performance.now();
      setTimeout(() => {
        isFrowningRef.current = false;
      }, 2200);
    }
  }, [isFrowning]);

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
    camera.position.z = 5;

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
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.85)");
      gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.35)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const particleCount = 8000;
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
    const voiceResponsive = new Float32Array(particleCount);
    const centerOrbiters = new Float32Array(particleCount); // 1.0 if orbits center, 0.0 otherwise
    const isGrayParticle = new Float32Array(particleCount); // 1.0 if particle should remain gray, 0.0 otherwise

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

      // Initialize with base color (will be updated dynamically)
      colors[idx] = 0;
      colors[idx + 1] = 0;
      colors[idx + 2] = 0;

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
      voiceResponsive[i] = Math.random() < 0.3 ? 1.0 : 0.0; // 30% of particles respond to voice
      centerOrbiters[i] = Math.random() < 0.02 ? 1.0 : 0.0; // 2% of particles orbit the center
      isGrayParticle[i] = Math.random() < 0.3 ? 1.0 : 0.0; // 30% of particles remain gray
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
    voiceResponsiveRef.current = voiceResponsive;
    centerOrbiterRef.current = centerOrbiters;
    isGrayParticleRef.current = isGrayParticle;
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
    const baseEuler = new THREE.Euler(0, 0, 0, "XYZ");
    const baseQuaternion = new THREE.Quaternion();
    const nodQuaternion = new THREE.Quaternion();
    const shakeQuaternion = new THREE.Quaternion();
    const gestureQuaternion = new THREE.Quaternion();
    const nodAxis = new THREE.Vector3(1, 0, 0);
    const shakeAxis = new THREE.Vector3(0, 0, 1);

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
        const colorArray = particles.geometry.attributes.color
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
        const centerOrbiterArray = centerOrbiterRef.current!;

        const elapsed = clock.getElapsedTime();

        // Smoothly transition colors
        const transitionSpeed = 0.05; // Adjust this for faster/slower transitions (0.05 = ~20 frames to complete)
        if (colorTransitionProgress.current < 1) {
          colorTransitionProgress.current = Math.min(
            1,
            colorTransitionProgress.current + transitionSpeed
          );

          // Interpolate between from and target colors
          const progress = colorTransitionProgress.current;
          // Use ease-out cubic for smooth deceleration
          const easedProgress = 1 - Math.pow(1 - progress, 3);

          for (
            let i = 0;
            i <
            Math.max(
              fromColorsRef.current.length,
              targetColorsRef.current.length
            );
            i++
          ) {
            const fromColor =
              fromColorsRef.current[i] ||
              fromColorsRef.current[fromColorsRef.current.length - 1];
            const targetColor =
              targetColorsRef.current[i] ||
              targetColorsRef.current[targetColorsRef.current.length - 1];

            if (!colorsRef.current[i]) {
              colorsRef.current[i] = new THREE.Color();
            }

            colorsRef.current[i].r =
              fromColor.r + (targetColor.r - fromColor.r) * easedProgress;
            colorsRef.current[i].g =
              fromColor.g + (targetColor.g - fromColor.g) * easedProgress;
            colorsRef.current[i].b =
              fromColor.b + (targetColor.b - fromColor.b) * easedProgress;
          }
        }

        // Get current colors (now interpolated)
        const currentColors = colorsRef.current;

        // Check if frustrated
        const frustrated = isFrustratedRef.current;
        const frustrationIntensity = frustrated
          ? Math.max(
              0,
              1 - (performance.now() - frustrationStartTimeRef.current) / 3000
            )
          : 0;

        // Check if embarrassed - smooth animation over 2 seconds
        const embarrassed = isEmbarrassedRef.current;
        const embarrassmentDuration = 2000; // 2 seconds
        const embarrassmentElapsed = embarrassed
          ? Math.min(
              embarrassmentDuration,
              performance.now() - embarrassmentStartTimeRef.current
            )
          : 0;
        // Smooth ease-in-out curve for shrinking
        const embarrassmentProgress = embarrassed
          ? Math.sin(
              (embarrassmentElapsed / embarrassmentDuration) * Math.PI * 0.5
            ) // Ease-in using sine
          : 0;

        // Check if excited - quick spin over 1.5 seconds
        const excited = isExcitedRef.current;
        const excitementDuration = 1500; // 1.5 seconds
        const excitementElapsed = excited
          ? Math.min(
              excitementDuration,
              performance.now() - excitementStartTimeRef.current
            )
          : 0;
        const excitementIntensity = excited
          ? 1 - excitementElapsed / excitementDuration // Linear fade out
          : 0;

        // Check if sad - lasts 4 seconds
        const sad = isSadRef.current;
        const sadnessDuration = 4000; // 4 seconds
        const sadnessElapsed = sad
          ? Math.min(
              sadnessDuration,
              performance.now() - sadnessStartTimeRef.current
            )
          : 0;
        const sadnessIntensity = sad
          ? 1 - sadnessElapsed / sadnessDuration // Linear fade out
          : 0;

        // Check if angry - intense and aggressive
        const angry = isAngryRef.current;
        const angerIntensity = angry
          ? Math.max(
              0,
              1 - (performance.now() - angerStartTimeRef.current) / 3000
            )
          : 0;

        // Check if joyful - bouncy and happy
        const joyful = isJoyfulRef.current;
        const joyIntensity = joyful
          ? Math.max(
              0,
              1 - (performance.now() - joyStartTimeRef.current) / 2000
            )
          : 0;

        // Check if confused - scattered movement
        const confused = isConfusedRef.current;
        const confusionIntensity = confused
          ? Math.max(
              0,
              1 - (performance.now() - confusionStartTimeRef.current) / 2500
            )
          : 0;

        // Check if disgusted - recoiling
        const disgusted = isDisgustedRef.current;
        const disgustIntensity = disgusted
          ? Math.max(
              0,
              1 - (performance.now() - disgustStartTimeRef.current) / 2000
            )
          : 0;

        // Check if calm - peaceful slow movement
        const calm = isCalmRef.current;
        const calmIntensity = calm
          ? Math.max(
              0,
              1 - (performance.now() - calmStartTimeRef.current) / 3000
            )
          : 0;

        const waveDuration = 1600;
        const waving = isWavingRef.current;
        const waveIntensity = waving
          ? Math.max(
              0,
              1 - (performance.now() - waveStartTimeRef.current) / waveDuration
            )
          : 0;

        const nodDuration = 1400;
        const nodding = isNoddingRef.current;
        const nodIntensity = nodding
          ? Math.max(
              0,
              1 - (performance.now() - nodStartTimeRef.current) / nodDuration
            )
          : 0;

        const shakeDuration = 1400;
        const shaking = isShakingRef.current;
        const shakeIntensity = shaking
          ? Math.max(
              0,
              1 -
                (performance.now() - shakeStartTimeRef.current) / shakeDuration
            )
          : 0;

        const smileDuration = 2200;
        const smiling = isSmilingRef.current;
        const smileIntensity = smiling
          ? Math.max(
              0,
              1 -
                (performance.now() - smileStartTimeRef.current) / smileDuration
            )
          : 0;

        const frownDuration = 2200;
        const frowning = isFrowningRef.current;
        const frownIntensity = frowning
          ? Math.max(
              0,
              1 -
                (performance.now() - frownStartTimeRef.current) / frownDuration
            )
          : 0;

        // Smooth audio level transitions with easing for more organic movement
        const targetAudio = Math.min(1, audioLevelRef.current * 1.5);
        const easingFactor = 0.08; // Responsive but smooth
        smoothedAudioRef.current +=
          (targetAudio - smoothedAudioRef.current) * easingFactor;
        const rawAudioBoost = smoothedAudioRef.current;

        // Apply threshold - only respond to voice above this level
        const audioThreshold = 0.15;
        const audioBoost =
          rawAudioBoost > audioThreshold
            ? (rawAudioBoost - audioThreshold) / (1.0 - audioThreshold)
            : 0;

        // Global expansion scale - the cloud as a whole expands/contracts with voice
        // This creates a unified breathing effect
        const baseExpansion = 1.0;
        const expansionAmount = 0.12; // 12% expansion at max volume
        const calmBreathingDamp = 1 - calmIntensity * 0.5;
        const sadnessBreathingDamp = 1 - sadnessIntensity * 0.35;
        const globalBreathingScale =
          baseExpansion +
          audioBoost *
            expansionAmount *
            calmBreathingDamp *
            sadnessBreathingDamp;

        // Emotion modifiers for movement
        const angerNoise = angerIntensity * 2.0; // Anger: very intense and aggressive
        const angerSpeed = angerIntensity * 1.5;

        const frustrationNoise = frustrationIntensity * 1.2;
        const frustrationSpeed = frustrationIntensity * 0.8;

        const joyBounce = joyIntensity * 0.3; // Joy: adds bouncy expansion

        const confusionChaos = confusionIntensity * 1.5; // Confusion: random scattered movement

        const disgustRecoil = disgustIntensity * 0.7; // Disgust: shrinks and recoils

        // Velocity multipliers
        const sadnessVelocityMultiplier = 1 - sadnessIntensity * 0.4; // Up to 40% slower
        const calmVelocityMultiplier = 1 - calmIntensity * 0.6; // Up to 60% slower for calm

        // Combined multiplier (take the slowest if multiple emotions)
        const velocityMultiplier = Math.min(
          sadnessVelocityMultiplier,
          calmVelocityMultiplier
        );

        const flowSpeed =
          (0.18 + frustrationSpeed + angerSpeed) * velocityMultiplier;
        const displacementStrength =
          0.45 + frustrationNoise + angerNoise + confusionChaos;
        const pullStrength = 0.1 * velocityMultiplier;
        const swirlStrength =
          (0.004 + frustrationIntensity * 0.01 + angerIntensity * 0.02) *
          velocityMultiplier;
        const maxRadius = radius * 1.4;
        const currentStrength =
          (0.012 +
            frustrationIntensity * 0.02 +
            angerIntensity * 0.03 +
            confusionChaos * 0.02) *
          velocityMultiplier;
        const layerStrength =
          (0.04 + frustrationIntensity * 0.08 + angerIntensity * 0.12) *
          velocityMultiplier;

        const wavePhase = elapsed * 6;

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
            1 + Math.sin(elapsed * 0.45 + breathArray[i]) * 0.08;
          const radialScale = breathWave + noise * displacementStrength;

          // Calculate natural flowing position (without voice)
          const naturalX = bx * radialScale;
          const naturalY = by * radialScale;
          const naturalZ = bz * radialScale;

          const px = positionArray[idx];
          const py = positionArray[idx + 1];
          const pz = positionArray[idx + 2];

          // Move towards natural position
          positionArray[idx] += (naturalX - px) * pullStrength;
          positionArray[idx + 1] += (naturalY - py) * pullStrength;
          positionArray[idx + 2] += (naturalZ - pz) * pullStrength;

          // Add gentle swirling motion made more dramatic by the voice
          positionArray[idx] += -py * swirlStrength;
          positionArray[idx + 1] += px * swirlStrength;
          positionArray[idx + 2] +=
            Math.sin((bx + elapsed) * 0.5) * swirlStrength * 0.25;

          // Curved orbital motion around unique axes for each particle
          const orbitPhase = elapsed * speedArray[i] + phaseArray[i];
          const orbitScale = ampArray[i] * 0.4;
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

          // Center orbital motion for ~5% of particles
          if (centerOrbiterArray[i] > 0.5) {
            // Calculate orbital position around the center (0, 0, 0)
            const orbitRadius =
              0.8 + Math.sin(elapsed * 0.3 + phaseArray[i]) * 0.2; // Varying radius
            const orbitAngle = elapsed * speedArray[i] * 0.5 + phaseArray[i];
            const verticalAngle = Math.sin(elapsed * 0.2 + phaseArray[i]) * 0.5; // Vertical oscillation

            // Create circular orbital path with vertical variation
            const orbitX =
              Math.cos(orbitAngle) * orbitRadius * Math.cos(verticalAngle);
            const orbitY =
              Math.sin(orbitAngle) * orbitRadius * Math.cos(verticalAngle);
            const orbitZ = Math.sin(verticalAngle) * orbitRadius * 0.6;

            // Blend the orbital motion with existing position (smooth transition)
            const orbitBlend = 0.6; // How much orbital motion overrides natural position
            positionArray[idx] =
              positionArray[idx] * (1 - orbitBlend) + orbitX * orbitBlend;
            positionArray[idx + 1] =
              positionArray[idx + 1] * (1 - orbitBlend) + orbitY * orbitBlend;
            positionArray[idx + 2] =
              positionArray[idx + 2] * (1 - orbitBlend) + orbitZ * orbitBlend;
          }

          // Layered noise currents to create dense, mesmerising flows
          const flowNoise1 = simplex.noise4d(
            bx * 0.7 + nx,
            by * 0.7 + ny,
            bz * 0.7 + nz,
            elapsed * 0.28
          );
          const flowNoise2 = simplex.noise4d(
            bx * 1.2 + ny,
            by * 1.2 + nz,
            bz * 1.2 + nx,
            elapsed * 0.4 + 15
          );
          const flowNoise3 = simplex.noise4d(
            bx * 0.9 + nz,
            by * 0.9 + nx,
            bz * 0.9 + ny,
            elapsed * 0.33 + 31
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

          let waveHighlight = 0;
          let smileBand = 0;
          let frownBand = 0;

          if (waveIntensity > 0) {
            const handReach = Math.max(0, bx);
            if (handReach > 0.05) {
              const verticalFalloff = Math.max(0, 1 - Math.abs(by) * 1.8);
              const depthFalloff = Math.max(0, 1 - Math.abs(bz) * 1.2);
              const swing =
                Math.sin(wavePhase + by * 9 + phaseArray[i] * 0.6) *
                Math.pow(waveIntensity, 0.7);
              const lift = swing * handReach * verticalFalloff * depthFalloff;
              positionArray[idx] += lift * 0.5;
              positionArray[idx + 1] += lift * 0.18;
              positionArray[idx + 2] += lift * 0.28;
              waveHighlight = Math.abs(lift);
            }
          }

          if (smileIntensity > 0 || frownIntensity > 0) {
            const verticalFocus = Math.max(0, 1 - Math.abs(by + 0.45) * 5);
            const horizontalFocus = Math.max(0, 1 - Math.abs(bx) * 1.4);
            const depthFocus = Math.max(0, 1 - Math.abs(bz) * 1.2);
            const baseMouthBand =
              verticalFocus * horizontalFocus * depthFocus * 1.2;

            if (baseMouthBand > 0.01) {
              const sideSign = bx >= 0 ? 1 : -1;

              if (smileIntensity > 0) {
                const smileLift =
                  Math.pow(smileIntensity, 0.8) * baseMouthBand * 0.6;
                positionArray[idx + 1] += smileLift;
                positionArray[idx] += sideSign * smileLift * 0.35;
                positionArray[idx + 2] += smileLift * 0.12;
                smileBand = smileLift;
              }

              if (frownIntensity > 0) {
                const frownDrop =
                  Math.pow(frownIntensity, 0.8) * baseMouthBand * 0.6;
                positionArray[idx + 1] -= frownDrop;
                positionArray[idx] -= sideSign * frownDrop * 0.28;
                positionArray[idx + 2] -= frownDrop * 0.1;
                frownBand = frownDrop;
              }
            }
          }

          // Apply global breathing expansion uniformly from center
          // This creates the cohesive expand/contract effect
          let finalScale = globalBreathingScale;

          // Apply joy pulsing effect - happy bouncing
          if (joyful) {
            const joyPulse =
              1 + Math.sin(elapsed * 8 + breathArray[i]) * joyBounce;
            finalScale *= joyPulse;
          }

          // Apply disgust recoil - shrink and pull back
          if (disgusted) {
            const disgustShrink = 1 - disgustRecoil * disgustIntensity;
            finalScale *= disgustShrink;
          }

          // Apply embarrassment shrinking effect
          if (embarrassed) {
            // Shrink down to 15% of original size
            const shrinkTarget = 0.15;
            const shrinkAmount = 1 - (1 - shrinkTarget) * embarrassmentProgress;
            finalScale *= shrinkAmount;
          }

          // Apply excitement - form particles into a spinning ring
          if (excited && excitementIntensity > 0) {
            // Blend from current position to ring formation
            const ringRadius = 1.5;
            const ringThickness = 0.2;

            // Calculate angle around the ring based on particle index
            const angleAroundRing = (i / particleCount) * Math.PI * 2;

            // Add some variation in the ring thickness
            const radialOffset =
              (Math.sin(i * 0.1) * 0.5 + 0.5) * ringThickness;
            const actualRadius = ringRadius + radialOffset;

            // Target position on ring
            const targetX = Math.cos(angleAroundRing) * actualRadius;
            const targetY = Math.sin(i * 0.5) * 0.5 * ringThickness; // Slight vertical variation
            const targetZ = Math.sin(angleAroundRing) * actualRadius;

            // Blend current position with ring position
            const blendFactor = 0.8; // How much to form the ring
            positionArray[idx] =
              positionArray[idx] * (1 - blendFactor) + targetX * blendFactor;
            positionArray[idx + 1] =
              positionArray[idx + 1] * (1 - blendFactor) +
              targetY * blendFactor;
            positionArray[idx + 2] =
              positionArray[idx + 2] * (1 - blendFactor) +
              targetZ * blendFactor;

            // Now apply spinning rotation to the ring
            const spinSpeed = 6.0; // Fast spin
            const spinAngle = elapsed * spinSpeed;

            const ringX = positionArray[idx];
            const ringZ = positionArray[idx + 2];
            positionArray[idx] =
              ringX * Math.cos(spinAngle) - ringZ * Math.sin(spinAngle);
            positionArray[idx + 2] =
              ringX * Math.sin(spinAngle) + ringZ * Math.cos(spinAngle);
          }

          // Apply confusion - random scattered movements
          if (confused && confusionIntensity > 0) {
            const confusionNoise1 = simplex.noise4d(
              bx * 3 + nx,
              by * 3 + ny,
              bz * 3 + nz,
              elapsed * 2
            );
            const confusionNoise2 = simplex.noise4d(
              by * 3 + ny,
              bz * 3 + nz,
              bx * 3 + nx,
              elapsed * 2.3 + 10
            );
            const confusionNoise3 = simplex.noise4d(
              bz * 3 + nz,
              bx * 3 + nx,
              by * 3 + ny,
              elapsed * 1.8 + 20
            );

            positionArray[idx] += confusionNoise1 * confusionIntensity * 0.5;
            positionArray[idx + 1] +=
              confusionNoise2 * confusionIntensity * 0.5;
            positionArray[idx + 2] +=
              confusionNoise3 * confusionIntensity * 0.5;
          }

          positionArray[idx] *= finalScale;
          positionArray[idx + 1] *= finalScale;
          positionArray[idx + 2] *= finalScale;

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

          // Update particle color with subtle variation
          // For multi-color, use gradient based on particle position
          const colorIndex =
            currentColors.length === 1
              ? 0
              : Math.floor((i / particleCount) * currentColors.length) %
                currentColors.length;

          // Check if this particle should remain gray
          const isGray = isGrayParticleRef.current?.[i] ?? 0;
          const grayColor = new THREE.Color("#424243");
          const particleColor = isGray > 0.5 ? grayColor : currentColors[colorIndex];

          const shade = 0.8 + Math.random() * 0.2; // Multiply by 0.8-1.0 for variation
          let r = particleColor.r * shade;
          let g = particleColor.g * shade;
          let b = particleColor.b * shade;

          if (waveHighlight > 0) {
            const waveGlow = Math.min(0.35, waveHighlight * 2.5);
            r += waveGlow * 0.12;
            g += waveGlow * 0.18;
            b += waveGlow * 0.24;
          }

          if (smileBand > 0) {
            const smileGlow = Math.min(0.5, smileBand * 1.5);
            r += (1 - r) * smileGlow * 0.5;
            g += (1 - g) * smileGlow * 0.35;
          }

          if (frownBand > 0) {
            const frownShade = Math.min(0.6, frownBand * 1.7);
            r *= 1 - frownShade * 0.7;
            g *= 1 - frownShade * 0.4;
            b *= 1 - frownShade * 0.25;
          }

          colorArray[idx] = Math.min(1, Math.max(0, r));
          colorArray[idx + 1] = Math.min(1, Math.max(0, g));
          colorArray[idx + 2] = Math.min(1, Math.max(0, b));
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;

        const baseRotX = Math.sin(elapsed * 0.08) * 0.05;
        const baseRotY = elapsed * 0.05;
        const baseRotZ = Math.sin(elapsed * 0.12) * 0.025;

        const nodRotation =
          nodIntensity > 0
            ? Math.sin(elapsed * 4.5) *
              Math.pow(nodIntensity, 0.8) *
              0.38
            : 0;

        const shakeRotation =
          shakeIntensity > 0
            ? Math.sin(elapsed * 5.2) *
              Math.pow(shakeIntensity, 0.85) *
              0.45
            : 0;

        baseEuler.set(baseRotX, baseRotY, baseRotZ);
        baseQuaternion.setFromEuler(baseEuler);
        gestureQuaternion.copy(baseQuaternion);

        if (nodRotation !== 0) {
          nodQuaternion.setFromAxisAngle(nodAxis, nodRotation);
          gestureQuaternion.premultiply(nodQuaternion);
        }

        if (shakeRotation !== 0) {
          shakeQuaternion.setFromAxisAngle(shakeAxis, shakeRotation);
          gestureQuaternion.premultiply(shakeQuaternion);
        }

        particles.quaternion.copy(gestureQuaternion);
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
