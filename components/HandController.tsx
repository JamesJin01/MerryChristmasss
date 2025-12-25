import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { HandGesture, HandData } from '../types';

interface HandControllerProps {
  onHandUpdate: (data: HandData) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const HandController: React.FC<HandControllerProps> = ({ onHandUpdate, videoRef }) => {
  const [loading, setLoading] = useState(true);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLoading(false);
      } catch (error) {
        console.error("Error initializing MediaPipe:", error);
      }
    };

    initMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Detection Loop
  useEffect(() => {
    let lastVideoTime = -1;

    const predict = () => {
      if (handLandmarkerRef.current && videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          const detections = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
          
          if (detections.landmarks && detections.landmarks.length > 0) {
            const landmarks = detections.landmarks[0];
            const gesture = recognizeGesture(landmarks);
            
            // Calculate normalized center of hand (approximate using wrist and middle finger knuckle)
            const wrist = landmarks[0];
            const middleKnuckle = landmarks[9];
            const centerX = (wrist.x + middleKnuckle.x) / 2;
            const centerY = (wrist.y + middleKnuckle.y) / 2;
            
            // Calculate tilt (rotation around z-axis logic)
            // Using Wrist (0) and Middle Finger MCP (9)
            const deltaX = middleKnuckle.x - wrist.x;
            const deltaY = middleKnuckle.y - wrist.y;
            const tilt = Math.atan2(deltaY, deltaX);

            onHandUpdate({
              gesture,
              position: { x: centerX, y: centerY },
              tilt
            });
          } else {
             onHandUpdate({
              gesture: HandGesture.NONE,
              position: { x: 0.5, y: 0.5 },
              tilt: 0
            });
          }
        }
      }
      requestRef.current = requestAnimationFrame(predict);
    };

    if (!loading) {
      // Start webcam
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predict);
          }
        })
        .catch((err) => console.error("Webcam error:", err));
    }
  }, [loading, onHandUpdate, videoRef]);

  const recognizeGesture = (landmarks: any[]): HandGesture => {
    // 0: Wrist
    // 4: Thumb Tip
    // 8: Index Tip
    // 12: Middle Tip
    // 16: Ring Tip
    // 20: Pinky Tip
    
    // Helper to get distance
    const dist = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // 1. PINCH: Thumb and Index very close
    if (dist(thumbTip, indexTip) < 0.05) {
      return HandGesture.PINCH;
    }

    // 2. FIST Check: Fingers curled towards wrist
    const isIndexCurled = dist(indexTip, wrist) < 0.25; // Adjusted heuristic
    const isMiddleCurled = dist(middleTip, wrist) < 0.25;
    const isRingCurled = dist(ringTip, wrist) < 0.25;
    const isPinkyCurled = dist(pinkyTip, wrist) < 0.25;

    if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      return HandGesture.CLOSED_FIST;
    }

    // 3. OPEN PALM Check: Fingers extended
    const isIndexExtended = dist(indexTip, wrist) > 0.3;
    const isMiddleExtended = dist(middleTip, wrist) > 0.3;
    const isRingExtended = dist(ringTip, wrist) > 0.3;
    const isPinkyExtended = dist(pinkyTip, wrist) > 0.3;

    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return HandGesture.OPEN_PALM;
    }

    return HandGesture.NONE;
  };

  return (
    <div className="absolute bottom-4 right-4 z-50 w-32 h-24 border-2 border-amber-500/30 rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm">
        <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform -scale-x-100 opacity-60" 
            autoPlay 
            playsInline 
            muted 
        />
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-amber-500 font-mono">
                Loading Vision...
            </div>
        )}
    </div>
  );
};

export default HandController;
