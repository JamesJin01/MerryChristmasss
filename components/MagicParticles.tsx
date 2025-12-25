import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Instance, Instances, Float, Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AppMode, ParticleData } from '../types';
import { CONFIG, COLORS } from '../constants';
import ErrorBoundary from './ErrorBoundary';

interface MagicParticlesProps {
  mode: AppMode;
  uploadedImages: string[];
  zoomTargetId: string | null;
  rotationOffset: { x: number, y: number };
}

// --- Materials ---

const goldMaterial = new THREE.MeshStandardMaterial({ 
    color: COLORS.METALLIC_GOLD, 
    roughness: 0.1, 
    metalness: 1.0,
    emissive: COLORS.METALLIC_GOLD,
    emissiveIntensity: 0.6
});

const redMaterial = new THREE.MeshStandardMaterial({ 
    color: COLORS.CHRISTMAS_RED, 
    roughness: 0.2, 
    metalness: 0.4,
    emissive: COLORS.CHRISTMAS_RED,
    emissiveIntensity: 0.8
});

const candyMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.WHITE,
    roughness: 0.3,
    metalness: 0.1,
    emissive: '#FFEEEE',
    emissiveIntensity: 0.3
});

// Green Variations
const lightGreenMaterial = new THREE.MeshStandardMaterial({ 
    color: COLORS.GREEN_LIGHT, 
    roughness: 0.5, 
    metalness: 0.2,
    emissive: COLORS.GREEN_LIGHT,
    emissiveIntensity: 0.2
});

const midGreenMaterial = new THREE.MeshStandardMaterial({ 
    color: COLORS.GREEN_MID, 
    roughness: 0.6, 
    metalness: 0.1,
    emissive: COLORS.GREEN_MID,
    emissiveIntensity: 0.1
});

const darkGreenMaterial = new THREE.MeshStandardMaterial({ 
    color: COLORS.GREEN_DARK, 
    roughness: 0.8, 
    metalness: 0.0,
    emissive: COLORS.GREEN_DARK,
    emissiveIntensity: 0
});

// --- 3D Star Component ---
const TopStar = () => {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const points = 5;
        const outerRadius = 1.2;
        const innerRadius = 0.5;
        
        for(let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const a = (i / (points * 2)) * Math.PI * 2;
            const x = Math.sin(a) * r;
            const y = Math.cos(a) * r;
            if(i === 0) s.moveTo(x, y);
            else s.lineTo(x, y);
        }
        s.closePath();
        return s;
    }, []);

    const extrudeSettings = {
        steps: 1,
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2
    };

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
            <mesh position={[0, CONFIG.TREE_HEIGHT / 2 + 1.5, 0]}>
                <extrudeGeometry args={[shape, extrudeSettings]} />
                <meshStandardMaterial 
                    color={COLORS.METALLIC_GOLD} 
                    emissive={COLORS.METALLIC_GOLD}
                    emissiveIntensity={2} 
                    toneMapped={false}
                />
            </mesh>
            <pointLight position={[0, CONFIG.TREE_HEIGHT / 2 + 1.5, 0]} intensity={3} color={COLORS.WARM_LIGHT} distance={15} decay={2} />
        </Float>
    );
};

const MagicParticles: React.FC<MagicParticlesProps> = ({ mode, uploadedImages, zoomTargetId, rotationOffset }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<(THREE.Group | null)[]>([]);
  
  // Generate Particles Data
  const particles = useMemo(() => {
    const temp: ParticleData[] = [];
    const count = CONFIG.PARTICLE_COUNT + uploadedImages.length * 5; 
    const phi = Math.PI * (3 - Math.sqrt(5)); 

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; 
      const radius = Math.sqrt(1 - y * y);
      
      const isPhoto = i < uploadedImages.length;
      const imageUrl = isPhoto ? uploadedImages[i] : undefined;
      
      // Tree position (Spiral)
      const treeY = ((i / count) * CONFIG.TREE_HEIGHT) - (CONFIG.TREE_HEIGHT / 2);
      const treeRadius = ((CONFIG.TREE_HEIGHT / 2 - treeY) / CONFIG.TREE_HEIGHT) * CONFIG.TREE_RADIUS_BASE;
      const theta = phi * i * 20; 
      const px = treeRadius * Math.cos(theta);
      const pz = treeRadius * Math.sin(theta);
      
      // Scatter position (Cloud)
      const rScale = CONFIG.SCATTER_RADIUS;
      const sx = (Math.random() - 0.5) * rScale;
      const sy = (Math.random() - 0.5) * rScale;
      const sz = (Math.random() - 0.5) * rScale;

      let type: ParticleData['type'] = 'SPHERE';
      let color = COLORS.GREEN_LIGHT; 
      let scale = 0.3;

      if (imageUrl) {
        type = 'PHOTO';
        scale = 1.5;
        color = COLORS.WHITE;
      } else {
        const rand = Math.random();
        
        if (rand > 0.95) {
            type = 'CANDY_CANE';
            color = COLORS.WHITE;
            scale = 0.6; // Slightly smaller
        } else if (rand > 0.85) { 
            type = 'CUBE'; 
            color = COLORS.CHRISTMAS_RED; 
            scale = 0.35; // Smaller gifts
        } else if (rand > 0.70) { 
            type = 'SPHERE'; 
            color = COLORS.METALLIC_GOLD; 
            scale = 0.4; // Smaller ornaments
        } else {
            type = 'SPHERE';
            const greenRand = Math.random();
            if (greenRand < 0.8) color = COLORS.GREEN_LIGHT;
            else if (greenRand < 0.9) color = COLORS.GREEN_MID;
            else color = COLORS.GREEN_DARK;
            
            // REDUCED SCALE: Making spheres smaller to avoid bloat
            scale = 0.15 + Math.random() * 0.15; 
        }
      }

      temp.push({
        id: `p-${i}`,
        type,
        color,
        imageUrl,
        positionTree: [px, treeY, pz],
        positionScatter: [sx, sy, sz],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale
      });
    }
    return temp;
  }, [uploadedImages]);

  // Reset refs when particles regenerate
  useEffect(() => {
      meshRefs.current = meshRefs.current.slice(0, particles.length);
  }, [particles]);

  // --- OPTIMIZED SINGLE ANIMATION LOOP ---
  // Replaces 500+ individual useFrame calls
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const damping = 4 * delta;

    // 1. Group Rotation
    if (mode === AppMode.TREE) {
        groupRef.current.rotation.y += delta * 0.2;
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, damping);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, damping);
    } else {
        const targetRotY = (rotationOffset.x - 0.5) * 2; 
        const targetRotX = (rotationOffset.y - 0.5) * 1; 
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, damping);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, damping);
    }

    // 2. Camera Zoom
    let targetZ = CONFIG.CAMERA_Z_TREE;
    if (mode === AppMode.SCATTER) targetZ = CONFIG.CAMERA_Z_SCATTER;
    if (mode === AppMode.ZOOM) targetZ = 8; 
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * 2);
    state.camera.lookAt(0, 0, 0);

    // 3. Individual Particles Update
    const time = state.clock.getElapsedTime();
    const vec3 = new THREE.Vector3(); // Reuse vector to avoid GC

    particles.forEach((p, i) => {
        const mesh = meshRefs.current[i];
        if (!mesh) return;

        const isZoomTarget = p.id === zoomTargetId;
        const speed = isZoomTarget ? 4 : 3; // Slightly faster interpolation for responsiveness

        // Target Position Calculation
        if (mode === AppMode.TREE) {
            vec3.set(p.positionTree[0], p.positionTree[1], p.positionTree[2]);
        } else if (mode === AppMode.ZOOM && isZoomTarget) {
            vec3.set(0, 0, 8); 
        } else {
            // Scatter with noise
            vec3.set(p.positionScatter[0], p.positionScatter[1], p.positionScatter[2]);
            vec3.y += Math.sin(time + p.positionScatter[0]) * 0.02;
        }

        // Apply Position
        mesh.position.lerp(vec3, delta * speed);

        // Apply Rotation
        if (isZoomTarget) {
             mesh.rotation.set(0, 0, 0); 
             mesh.lookAt(state.camera.position);
        } else {
            mesh.rotation.x += delta * 0.5;
            mesh.rotation.y += delta * 0.3;
        }

        // Apply Scale
        let targetScale = p.scale;
        if (isZoomTarget) targetScale = 4;
        
        // Manual lerp for scale to avoid Vector3 creation overhead if possible, 
        // but THREE.Vector3.lerp is optimized enough for this count.
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);
    });
  });

  return (
    <group ref={groupRef}>
      <Sparkles count={400} scale={35} size={10} speed={0.2} opacity={0.5} color={COLORS.METALLIC_GOLD} />
      <Sparkles count={300} scale={30} size={5} speed={0.5} opacity={0.3} color={COLORS.WHITE} />
      <Sparkles count={100} scale={20} size={15} speed={0.1} opacity={0.7} color={COLORS.WARM_LIGHT} />
      
      {particles.map((p, i) => (
        <group 
            key={p.id} 
            ref={(el) => { meshRefs.current[i] = el; }}
            position={p.positionTree} // Initial position to prevent jump
        >
            <ParticleMesh data={p} />
        </group>
      ))}
      
      <TopStar />
    </group>
  );
};

// Pure component for static mesh structure, logic moved to parent
const ParticleMesh: React.FC<{ data: ParticleData }> = React.memo(({ data }) => {
    let material = lightGreenMaterial;
    if (data.type === 'CUBE') material = redMaterial;
    else if (data.type === 'CANDY_CANE') material = candyMaterial;
    else if (data.color === COLORS.METALLIC_GOLD) material = goldMaterial;
    else if (data.color === COLORS.GREEN_LIGHT) material = lightGreenMaterial;
    else if (data.color === COLORS.GREEN_MID) material = midGreenMaterial;
    else if (data.color === COLORS.GREEN_DARK) material = darkGreenMaterial;

    if (data.type === 'PHOTO' && data.imageUrl) {
        // Fallback mesh if image fails
        const FallbackMesh = (
            <mesh geometry={new THREE.PlaneGeometry(1, 1)} material={candyMaterial} />
        );

        return (
            <ErrorBoundary fallback={FallbackMesh}>
                 <Image url={data.imageUrl} transparent opacity={1} side={THREE.DoubleSide} />
            </ErrorBoundary>
        );
    }
    
    if (data.type === 'CUBE') {
        return <mesh geometry={new THREE.BoxGeometry(1, 1, 1)} material={material} />;
    }
    
    if (data.type === 'CANDY_CANE') {
        return <mesh geometry={new THREE.CylinderGeometry(0.15, 0.15, 1, 8)} material={material} />;
    }

    // Sphere
    return <mesh geometry={new THREE.SphereGeometry(1, 12, 12)} material={material} />; // Reduced segments for performance
});

export default MagicParticles;