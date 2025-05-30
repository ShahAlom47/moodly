'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        console.log('Loading models from:', MODEL_URL);
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        startVideo();
      } catch (err) {
        console.error('Model loading failed:', err);
        setError('Failed to load face detection models.');
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Camera error:', err);
          setError('Could not access the camera. Please allow permissions.');
        });
    };

    loadModels();
  }, []);

  // Handle Expression Detection
  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections.length > 0) {
          const expression = detections[0].expressions;
          const maxValue = Math.max(...Object.values(expression));
          const mood = Object.keys(expression).find(
            (key) => expression[key] === maxValue
          );
          console.log('Detected mood:', mood);
        }
      }
    }, 1000);

    return () => clearInterval(interval); // Clear interval on unmount
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh]">
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
      {loading && !error && <p className="text-blue-500 font-medium">Loading camera & model...</p>}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="720"
        height="560"
        onPlay={handleVideoOnPlay}
        className={`rounded-lg shadow-md ${loading ? 'hidden' : 'block'}`}
      />
    </div>
  );
};

export default WebcamFeed;
