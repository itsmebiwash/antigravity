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
                        canvasCtx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
                        canvasCtx.lineWidth = 1;
                        
                        // Draw connecting lines (simplified hand skeleton)
                        const connections = [
                            [0,1,2,3,4], // thumb
                            [0,5,6,7,8], // index
                            [0,9,10,11,12], // middle
                            [0,13,14,15,16], // ring
                            [0,17,18,19,20], // pinky
                            [5,9,13,17] // palm
                        ];

                        connections.forEach(conn => {
                            canvasCtx.beginPath();
                            canvasCtx.moveTo(hand[conn[0]].x * canvasRef.current!.width, hand[conn[0]].y * canvasRef.current!.height);
                            for(let i=1; i<conn.length; i++) {
                                canvasCtx.lineTo(hand[conn[i]].x * canvasRef.current!.width, hand[conn[i]].y * canvasRef.current!.height);
                            }
                            canvasCtx.stroke();
                        });

                        // Draw landmarks as digital nodes
                        for (let i = 0; i < hand.length; i++) {
                            const x = hand[i].x * canvasRef.current.width;
                            const y = hand[i].y * canvasRef.current.height;
                            
                            canvasCtx.fillStyle = i % 4 === 0 ? '#6366f1' : '#818cf8';
                            canvasCtx.fillRect(x - 1.5, y - 1.5, 3, 3);
                            
                            if (i === 8 || i === 4) { // Index and Thumb tips get extra glow
                                canvasCtx.shadowBlur = 10;
                                canvasCtx.shadowColor = '#6366f1';
                                canvasCtx.strokeRect(x - 3, y - 3, 6, 6);
                                canvasCtx.shadowBlur = 0;
                            }
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
        <div className="fixed bottom-6 right-6 w-[240px] h-[135px] rounded-lg overflow-hidden border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.4)] z-[100] backdrop-blur-md bg-black/20 pointer-events-none">
            {/* Scanned Grid Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
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
                className="w-full h-full object-cover grayscale brightness-125 contrast-125 opacity-80"
            />
            
            {/* HUD Elements */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase font-bold">
                    Neural_Link: Active
                </span>
            </div>

            <div className="absolute bottom-2 right-2 text-[8px] text-indigo-400/70 font-mono">
                PIP_UPLINK_01
            </div>

            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-indigo-500/50" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-indigo-500/50" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-indigo-500/50" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-indigo-500/50" />
        </div>
    );
}
