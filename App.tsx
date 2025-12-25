import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Environment, OrbitControls } from '@react-three/drei';
import { AppMode, HandData, HandGesture } from './types';
import { BACKGROUND_IMAGES, COLORS } from './constants';
import MagicParticles from './components/MagicParticles';
import HandController from './components/HandController';
import Overlay from './components/Overlay';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [gesture, setGesture] = useState<HandGesture>(HandGesture.NONE);
  const [uploadedImages, setUploadedImages] = useState<string[]>(BACKGROUND_IMAGES);
  const [zoomTargetId, setZoomTargetId] = useState<string | null>(null);
  const [rotationOffset, setRotationOffset] = useState({ x: 0.5, y: 0.5 });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hand update handler
  const handleHandUpdate = useCallback((data: HandData) => {
    setGesture(data.gesture);
    setRotationOffset(data.position);

    if (data.gesture === HandGesture.CLOSED_FIST && mode !== AppMode.TREE) {
      setMode(AppMode.TREE);
      setZoomTargetId(null);
    } 
    else if (data.gesture === HandGesture.OPEN_PALM && mode !== AppMode.SCATTER) {
      setMode(AppMode.SCATTER);
      setZoomTargetId(null);
    }
    else if (data.gesture === HandGesture.PINCH && mode === AppMode.SCATTER) {
      setMode(AppMode.ZOOM);
      const randomIndex = Math.floor(Math.random() * uploadedImages.length);
      setZoomTargetId(`p-${randomIndex}`); 
    }
  }, [mode, uploadedImages.length]);

  // Handle file uploads
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: string[] = [];
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
             setUploadedImages(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-black via-[#0a1a1a] to-[#050505]">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas 
            camera={{ position: [0, 0, 20], fov: 45 }}
            gl={{ antialias: false, toneMappingExposure: 1.2 }}
        >
          <color attach="background" args={['#020202']} />
          <ambientLight intensity={0.1} />
          {/* Main Key Light */}
          <pointLight position={[10, 10, 10]} intensity={2} color={COLORS.METALLIC_GOLD} distance={50} decay={2} />
          {/* Fill Light */}
          <pointLight position={[-10, -5, -10]} intensity={1} color={COLORS.CHRISTMAS_RED} distance={50} decay={2} />
          
          <Environment preset="sunset" blur={0.5} />
          
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <MagicParticles 
                mode={mode} 
                uploadedImages={uploadedImages} 
                zoomTargetId={zoomTargetId}
                rotationOffset={rotationOffset}
              />
            </Suspense>
          </ErrorBoundary>

          <EffectComposer disableNormalPass>
            {/* Increased intensity and radius for magnificent glow */}
            <Bloom luminanceThreshold={0.4} mipmapBlur intensity={1.5} radius={0.7} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.0} />
          </EffectComposer>
        </Canvas>
      </div>

      <HandController onHandUpdate={handleHandUpdate} videoRef={videoRef} />
      
      <Overlay 
        mode={mode} 
        currentGesture={gesture} 
        onUpload={handleUpload} 
      />
      
    </div>
  );
};

export default App;