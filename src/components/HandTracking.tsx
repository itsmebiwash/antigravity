'use client';

import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useGestureStore } from '@/store/useGestureStore';

export default function HandTracking() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
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
        if (!landmarker || !videoRef.current || !canvasRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');

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

        const predictWebcam = () => {
            if (videoRef.current && landmarker && canvasRef.current && canvasCtx) {
                let startTimeMs = performance.now();
                if (lastVideoTime !== videoRef.current.currentTime) {
                    lastVideoTime = videoRef.current.currentTime;

                    const results = landmarker.detectForVideo(videoRef.current, startTimeMs);

                    // Draw PIP Camera preview
                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    // Scale and mirror
                    canvasCtx.translate(canvasRef.current.width, 0);
                    canvasCtx.scale(-1, 1);
                    canvasCtx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                    if (results.landmarks && results.landmarks.length > 0) {
                        const hand = results.landmarks[0];

                        // Draw skeleton on PIP
                        canvasCtx.strokeStyle = '#0ff0fc';
                        canvasCtx.lineWidth = 2;
                        // A crude draw of hand points for visual feedback
                        for (let i = 0; i < hand.length; i++) {
                            canvasCtx.beginPath();
                            canvasCtx.arc(hand[i].x * canvasRef.current.width, hand[i].y * canvasRef.current.height, 3, 0, 2 * Math.PI);
                            canvasCtx.fillStyle = '#8a2be2';
                            canvasCtx.fill();
                        }

                        // Core Landmarks
                        const wrist = hand[0];
                        const thumbTip = hand[4];
                        const indexTip = hand[8];
                        const middleTip = hand[12];
                        const ringTip = hand[16];
                        const pinkyTip = hand[20];

                        // Map Screen coords
                        const nx = -(indexTip.x - 0.5) * 2;
                        const ny = -(indexTip.y - 0.5) * 2;
                        const nz = indexTip.z * 10;

                        setPointer(nx, ny, nz);

                        // Compute distances for heuristics
                        const distThumbIndex = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
                        const distThumbMiddle = Math.hypot(middleTip.x - thumbTip.x, middleTip.y - thumbTip.y);

                        // Distance from tips to wrist (for Fist detection)
                        const d1 = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
                        const d2 = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
                        const d3 = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
                        const d4 = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);
                        const avgDist = (d1 + d2 + d3 + d4) / 4;

                        if (avgDist < 0.2) {
                            setGestureMode('FIST');
                        } else if (distThumbIndex < 0.05 && distThumbMiddle < 0.05) {
                            setGestureMode('TRI_FINGER_PINCH');
                        } else if (distThumbIndex < 0.05) {
                            setGestureMode('ONE_TAP');
                        } else {
                            // Open hand - check if index and middle are close (swipe posture)
                            const distIndexMiddle = Math.hypot(indexTip.x - middleTip.x, indexTip.y - middleTip.y);
                            if (distIndexMiddle < 0.05 && avgDist > 0.3) {
                                setGestureMode('TWO_FINGER_SWIPE');
                            } else {
                                setGestureMode('NONE');
                            }
                        }
                    } else {
                        setGestureMode('NONE');
                    }
                    canvasCtx.restore();
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
        <div className="absolute bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden border border-[var(--neon-blue)] shadow-[0_0_15px_rgba(15,240,252,0.5)] z-50 stark-panel pointer-events-none">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="hidden"
            />
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-2 text-[8px] text-[var(--neon-blue)] hud-font opacity-70">
                CAM_UPLINK_ACTIVE
            </div>
        </div>
    );
}
