"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moodDetected, setMoodDetected] = useState(false);
  const [currentMood, setCurrentMood] = useState("");

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL), // ✅ Landmarks
        ]);
        startVideo();
      } catch (err) {
        console.error("Model loading failed:", err);
        setError("Failed to load face detection models.");
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
          console.error("Camera error:", err);
          setError("Could not access the camera. Please allow permissions.");
        });
    };

    loadModels();
  }, []);

  // Handle Expression Detection
  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && !moodDetected) {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512 })
          )
          .withFaceLandmarks()
          .withFaceExpressions();
        if (detections?.length > 0) {
          const expression = detections[0].expressions;
          const maxValue = Math.max(...Object.values(expression));
          const mood = Object.keys(expression).find(
            (key) => expression[key] === maxValue
          );
          console.log("Detected mood:", mood);
          setMoodDetected(true); // Stop showing animation
          setCurrentMood(mood); // Set the detected mood
        }
      }
    }, 1200);

    return () => clearInterval(interval); // Clear interval on unmount
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-[60vh]">
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
      {loading && !error && (
        <p className="text-blue-500 font-medium animate-pulse">
          Loading camera & model...
        </p>
      )}

      {/* Video with Animation Overlay */}
      <div className="relative">
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="720"
          height="560"
          onPlay={handleVideoOnPlay}
          className={`rounded-lg shadow-md transition-opacity duration-500 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />

        <div>
          <h1 className=" absolute inset-0 text-4xl text-center text-white">
           current mode: {currentMood}
          </h1>
        </div>
        {/* Overlay Animation */}
        {!loading && !moodDetected && (
          <div className="absolute z-20 inset-0 pointer-events-none rounded-lg border-4 border-blue-500 animate-pulse opacity-40"></div>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;
