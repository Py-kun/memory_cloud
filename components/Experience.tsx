import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AppConfig, ParticleState, ShapeType } from '../types';
import { getPointOnShape } from '../utils/geometry';

// Type definitions for global MediaPipe objects
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

interface ExperienceProps {
  currentShape: ShapeType;
  primaryColor: string;
  onStateChange: (state: ParticleState) => void;
  config: AppConfig;
}

const Experience: React.FC<ExperienceProps> = ({ currentShape, primaryColor, onStateChange, config }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Internal state refs to avoid closure staleness in animation loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const photosGroupRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const targetScaleRef = useRef<number>(1.0);
  const currentScaleRef = useRef<number>(1.0);
  
  // Data arrays
  const basePositionsRef = useRef<Float32Array>(new Float32Array(config.particleCount * 3));
  const photoBasePosRef = useRef<Float32Array>(new Float32Array(config.photoCount * 3));

  // Initialize Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // PARTICLE SYSTEM
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    // Init with random
    for (let i = 0; i < config.particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 50;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: new THREE.Color(primaryColor),
        size: config.particleSize,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.8
    });
    materialRef.current = material;

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // PHOTO CLOUD SYSTEM
    const photoGroup = new THREE.Group();
    scene.add(photoGroup);
    photosGroupRef.current = photoGroup;
    const photoTextures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();

    // --- PHOTO LOADING LOGIC ---
    // If you have local photos in an "images" folder named 1.jpg to 20.jpg:
    // Change useLocalPhotos to true.
    const useLocalPhotos = false; 

    for (let i = 0; i < config.photoCount; i++) {
        const url = useLocalPhotos 
            ? `./images/${(i % 20) + 1}.jpg` // Local path
            : `https://picsum.photos/400/400?random=${i + 100}`; // Random nice placeholder
            
        const tex = loader.load(url);
        photoTextures.push(tex);

        const pMat = new THREE.SpriteMaterial({ 
            map: tex, 
            transparent: true, 
            opacity: 0.0, // Start invisible
            blending: THREE.AdditiveBlending,
            color: new THREE.Color(primaryColor) // Tint with theme initially
        });
        const sprite = new THREE.Sprite(pMat);
        sprite.scale.set(1.5, 1.5, 1.5);
        photoGroup.add(sprite);
    }


    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animationId: number;
    const animate = () => {
        animationId = requestAnimationFrame(animate);

        // Lerp scale factor
        currentScaleRef.current += (targetScaleRef.current - currentScaleRef.current) * config.handSensitivity;
        
        const scale = currentScaleRef.current;
        const positions = particles.geometry.attributes.position.array as Float32Array;
        const basePos = basePositionsRef.current;
        
        // 1. Update Particles
        for (let i = 0; i < config.particleCount; i++) {
            const ix = i * 3;
            // Target position based on scale
            const tx = basePos[ix] * scale;
            const ty = basePos[ix + 1] * scale;
            const tz = basePos[ix + 2] * scale;
            
            // Morph interpolation
            positions[ix] += (tx - positions[ix]) * config.transitionSpeed;
            positions[ix + 1] += (ty - positions[ix + 1]) * config.transitionSpeed;
            positions[ix + 2] += (tz - positions[ix + 2]) * config.transitionSpeed;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate cloud gently
        particles.rotation.y += 0.001;
        photoGroup.rotation.y += 0.001;

        // 2. Update Photos (The "Hidden Memory" Effect)
        // Photos are hidden in the cloud, but when scale > 1.2 (hand open), they expand and reveal.
        const photos = photoGroup.children as THREE.Sprite[];
        const photoBase = photoBasePosRef.current;
        
        // Threshold for revealing photos
        const revealThreshold = 1.3;
        const isRevealing = scale > revealThreshold;
        
        photos.forEach((sprite, i) => {
            const ix = i * 3;
            const tx = photoBase[ix] * scale * (isRevealing ? 1.5 : 1.0); // Push out further when revealing
            const ty = photoBase[ix + 1] * scale * (isRevealing ? 1.5 : 1.0);
            const tz = photoBase[ix + 2] * scale * (isRevealing ? 1.5 : 1.0);
            
            // Interpolate position
            sprite.position.x += (tx - sprite.position.x) * config.transitionSpeed;
            sprite.position.y += (ty - sprite.position.y) * config.transitionSpeed;
            sprite.position.z += (tz - sprite.position.z) * config.transitionSpeed;

            // Visual Reveal Logic
            if (isRevealing) {
                // Reveal: Full opacity, white color (shows original photo), larger size
                sprite.material.opacity += (1.0 - sprite.material.opacity) * 0.05;
                sprite.material.color.lerp(new THREE.Color(0xffffff), 0.05);
                const targetSize = 4.0;
                sprite.scale.lerp(new THREE.Vector3(targetSize, targetSize, 1), 0.05);
            } else {
                // Hide: Low opacity, tinted with theme color, smaller size
                sprite.material.opacity += (0.1 - sprite.material.opacity) * 0.05;
                sprite.material.color.lerp(new THREE.Color(primaryColor), 0.1);
                const targetSize = 1.5;
                sprite.scale.lerp(new THREE.Vector3(targetSize, targetSize, 1), 0.1);
            }
        });

        // Report state
        onStateChange({
            handState: scale < 0.8 ? 'CLOSED' : (scale > 1.3 ? 'OPEN' : 'MOVING'),
            scaleFactor: scale,
            isDetected: targetScaleRef.current !== 1.0 // Simple heuristic
        });

        renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      photoTextures.forEach(t => t.dispose());
    };
  }, []); // Run once on mount

  // Shape Generation Effect
  useEffect(() => {
    // Generate new base positions when shape changes
    for (let i = 0; i < config.particleCount; i++) {
        const p = getPointOnShape(currentShape, i, config.particleCount);
        basePositionsRef.current[i * 3] = p.x;
        basePositionsRef.current[i * 3 + 1] = p.y;
        basePositionsRef.current[i * 3 + 2] = p.z;
    }

    // Generate positions for photos (subset of shape, or specific distribution)
    for (let i = 0; i < config.photoCount; i++) {
        // Use the shape algorithm but with different index seeds to scatter them well
        const p = getPointOnShape(currentShape, i * (config.particleCount / config.photoCount), config.particleCount);
        photoBasePosRef.current[i * 3] = p.x;
        photoBasePosRef.current[i * 3 + 1] = p.y;
        photoBasePosRef.current[i * 3 + 2] = p.z;
    }
  }, [currentShape, config.particleCount, config.photoCount]);

  // Color Update Effect
  useEffect(() => {
    if (materialRef.current) {
        materialRef.current.color.set(primaryColor);
    }
  }, [primaryColor]);

  // MediaPipe Setup
  useEffect(() => {
    if (!videoRef.current) return;

    const onResults = (results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const wrist = landmarks[0];
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            const indexBase = landmarks[5];

            // Calculate scale based on pinch/open
            const palmSize = Math.sqrt(
                Math.pow(indexBase.x - wrist.x, 2) + Math.pow(indexBase.y - wrist.y, 2)
            );
            const pinchDist = Math.sqrt(
                Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)
            );

            const openRatio = pinchDist / (palmSize || 0.1);
            
            // Map 0.2 (closed) - 1.2 (open) to 0.4 - 2.0 scale
            let normalized = (openRatio - 0.2) / (1.2 - 0.2);
            normalized = Math.max(0, Math.min(1, normalized)); // Clamp 0-1
            
            targetScaleRef.current = 0.4 + normalized * 2.0;
        } else {
            // No hand: drift back to normal
            targetScaleRef.current = 1.0;
        }
    };

    const hands = new window.Hands({locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
            await hands.send({image: videoRef.current});
        },
        width: 320,
        height: 240
    });

    camera.start();

    return () => {
       // Cleanup if necessary, though MediaPipe instances usually persist well
    };
  }, []);

  return (
    <>
        <div ref={mountRef} className="absolute inset-0 z-0" />
        {/* Hidden video element for processing */}
        <video ref={videoRef} className="hidden" playsInline muted />
    </>
  );
};

export default Experience;