"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mood"); // mood | age
  const [result, setResult] = useState("");
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        startVideo();
      } catch (err) {
        console.error("Model loading failed:", err);
        setError("Failed to load face detection models.");
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: 720,
            height: 560,
            facingMode: "user",
          },
        })
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

  const detect = async () => {
    if (!videoRef.current) return;

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
      )
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (!detection) {
      setResult("No face detected");
      setShowCheck(false);
      return;
    }

    if (mode === "mood") {
      const expressions = detection.expressions;
      const moods = Object.entries(expressions);
      const [mood, confidence] = moods.reduce(
        (max, [key, value]) => (value > max[1] ? [key, value] : max),
        ["neutral", 0]
      );
      if (confidence > 0.7) {
        setResult(`${getEmoji(mood)} ${mood} (${(confidence * 100).toFixed(1)}%)`);
        setShowCheck(true);
      } else {
        setResult("Low confidence detection");
        setShowCheck(false);
      }
    } else if (mode === "age") {
      const { age, gender } = detection;
      setResult(`👤 ${gender}, Age: ${Math.round(age)}`);
      setShowCheck(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detect();
    }, 2000);
    return () => clearInterval(interval);
  }, [mode]);

  const getEmoji = (mood) => {
    const map = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      fearful: "😨",
      disgusted: "🤢",
      surprised: "😲",
      neutral: "😐",
    };
    return map[mood] || "👀";
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-50">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && !error && (
        <p className="text-blue-500 font-semibold mb-4">Loading camera and models...</p>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="320"
          height="190"
          className={`rounded-xl border shadow ${loading ? "opacity-0" : "opacity-100"}`}
        />
        {!loading && result === "No face detected" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="bg-red-500 text-white px-4 py-2 rounded">Please face the camera</p>
          </div>
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          className={`px-6 py-2 rounded-full font-semibold ${
            mode === "mood" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setMode("mood");
            setResult("");
            setShowCheck(false);
          }}
        >
          Mood
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold ${
            mode === "age" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setMode("age");
            setResult("");
            setShowCheck(false);
          }}
        >
          Age
        </button>
      </div>

      {result && (
        <div className="mt-6 text-center">
          <p className="text-xl font-bold text-gray-700">{result}</p>
          {showCheck && (
            <button
              className="mt-3 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              onClick={detect}
            >
              Check Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WebcamFeed;
