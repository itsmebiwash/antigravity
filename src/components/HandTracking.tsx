'use client';

import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useGestureStore } from '@/store/useGestureStore';

export default function HandTracking() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
    const { setGestureMode, setPointer, pushHistory } = useGestureStore();

    useEffect(() => {
        const initVision = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );
            const hl = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            setLandmarker(hl);
        };
        initVision();
    }, []);

    useEffect(() => {
        if (!landmarker || !videoRef.current) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener('loadeddata', predictWebcam);
                }
            } catch (err) {
                console.error("Camera access denied or unavailable", err);
            }
        };

        let lastVideoTime = -1;
        let requestRef: number;

        const predictWebcam = async () => {
            if (videoRef.current && landmarker) {
                let startTimeMs = performance.now();
                if (lastVideoTime !== videoRef.current.currentTime) {
                    lastVideoTime = videoRef.current.currentTime;

                    const results = landmarker.detectForVideo(videoRef.current, startTimeMs);

                    if (results.landmarks && results.landmarks.length > 0) {
                        // Use the first hand detected
                        const hand = results.landmarks[0];

                        // 8: Index Finger Tip, 4: Thumb Tip
                        const indexTip = hand[8];
                        const thumbTip = hand[4];

                        // Map Screen coords to normalized WebGL coords (-1 to 1)
                        // x is mirrored
                        const nx = -(indexTip.x - 0.5) * 2;
                        const ny = -(indexTip.y - 0.5) * 2;
                        const nz = indexTip.z * 10; // rough depth multiplier

                        setPointer(nx, ny, nz);

                        // Calculate Pinches (distance)
                        const dist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);

                        // Basic gesture detection heuristic
                        if (dist < 0.05) {
                            setGestureMode('PINCH');
                        } else if (dist > 0.3) {
                            setGestureMode('PALM');
                        } else {
                            setGestureMode('POINT');
                        }
                    } else {
                        setGestureMode('NONE');
                    }
                }
                requestRef = requestAnimationFrame(predictWebcam);
            }
        };

        startCamera();

        return () => {
            if (requestRef) cancelAnimationFrame(requestRef);
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [landmarker, setGestureMode, setPointer]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className="hidden"
        />
    );
}
