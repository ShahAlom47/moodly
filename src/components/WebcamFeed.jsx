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
  const [currentMood, setCurrentMood] = useState("");
  const [detectionLog, setDetectionLog] = useState([]);

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
            width: 420,
            height: 210,
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
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5,
        })
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

  const handleVideoOnPlay = () => {
    const canvas = document.getElementById("overlay");
    const displaySize = { width: 720, height: 560 };

    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      try {
        if (!videoRef.current) return;

        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // ✅ Clear canvas properly

        if (!detections) {
          setCurrentMood("No face detected");
          setDetectionLog((prev) => [...prev, "No face found"]);
          return;
        }

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        const expressions = detections.expressions;
        const moods = Object.entries(expressions);
        const [mood, confidence] = moods.reduce(
          (max, [key, value]) => (value > max[1] ? [key, value] : max),
          ["neutral", 0]
        );

        setDetectionLog((prev) => [...prev, `Detected: ${mood} (${confidence.toFixed(2)})`]);

        if (confidence > 0.7) {
          setCurrentMood(mood);
        } else {
          setCurrentMood("Low confidence detection");
        }
      } catch (err) {
        console.error("Detection error:", err);
        setDetectionLog((prev) => [...prev, `Error: ${err.message}`]);
      }
    }, 1500);

    return () => clearInterval(interval);
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
          width="420"
          height="210"
          onPlay={handleVideoOnPlay}
          className={`rounded-lg shadow-md ${loading ? "opacity-0" : "opacity-100"}`}
        />
        <canvas
          id="overlay"
          className="absolute top-0 left-0 rounded-lg"
          width="720"
          height="560"
        />

        {!loading && result === "No face detected" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="bg-red-500 text-white px-4 py-2 rounded">
              Please face the camera
            </p>
          </div>
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          className={`px-6 py-2 rounded-full font-semibold hover:scale-110 z-10 relative ${
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
            mode === "age" ? "bg-blue-600 text-white" : "bg-gray-200  z-10 relative"
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
