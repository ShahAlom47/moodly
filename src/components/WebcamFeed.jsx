"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import detectionMessages from "../lib/funnyMessages"; // Adjust path
import MessageDisplay from "./MessageDisplay";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mood"); // mood | age
  const [result, setResult] = useState("");
  const [showCheck, setShowCheck] = useState(false);
  const [funnyMsg, setFunnyMsg] = useState("");
  const lastMessageRef = useRef("");
  const lastDetectionTimeRef = useRef(0); // for throttling result updates
  const lastResultRef = useRef(null);

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

  // Reset on mode change
  useEffect(() => {
    setResult("");
    setFunnyMsg("");
    setShowCheck(false);
    lastMessageRef.current = "";
    lastResultRef.current = null;
  }, [mode]);

  // Main detection loop
  useEffect(() => {
    if (loading || error) return;

    let intervalId;

    const detectAndDraw = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Detect face with all features
      const detection = await faceapi
        .detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      const ctx = canvas.getContext("2d");
      // Clear previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!detection) {
        setResult("No face detected");
        setShowCheck(false);
        setFunnyMsg("");
        lastResultRef.current = null;
        return;
      }

      // Resize detection box and landmarks to canvas size
      const displaySize = { width: video.width, height: video.height };
      const resizedDetection = faceapi.resizeResults(detection, displaySize);

      // Draw box & landmarks
      faceapi.draw.drawDetections(canvas, resizedDetection);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetection);

      // Throttle result update to max once per second
      const now = Date.now();
      if (now - lastDetectionTimeRef.current > 1000) {
        lastDetectionTimeRef.current = now;

        if (mode === "mood") {
          const expressions = resizedDetection.expressions;
          const moods = Object.entries(expressions);
          const [mood, confidence] = moods.reduce(
            (max, [key, value]) => (value > max[1] ? [key, value] : max),
            ["neutral", 0]
          );

          if (confidence > 0.7) {
            const newResult = `${getEmoji(mood)} ${mood} (${(confidence * 100).toFixed(1)}%)`;
            if (newResult !== lastResultRef.current) {
              setResult(newResult);
              setFunnyMsg(detectionMessages.mood[mood] || "");
              setShowCheck(true);
              lastResultRef.current = newResult;
              lastMessageRef.current = detectionMessages.mood[mood] || "";
            }
          } else {
            setResult("Low confidence detection");
            setFunnyMsg("");
            setShowCheck(false);
            lastResultRef.current = null;
          }
        } else if (mode === "age") {
          const { age, gender } = resizedDetection;
          const ageRounded = Math.round(age);
          const newResult = `👤 ${gender}, Age: ${ageRounded}`;
          if (newResult !== lastResultRef.current) {
            setResult(newResult);
            const messages = detectionMessages.age;
            const uniqueMsg = getUniqueFunnyMessage(messages);
            setFunnyMsg(uniqueMsg);
            lastMessageRef.current = uniqueMsg;
            setShowCheck(true);
            lastResultRef.current = newResult;
          }
        }
      }
    };

    intervalId = setInterval(detectAndDraw, 200); // run every 200ms

    return () => {
      clearInterval(intervalId);
    };
  }, [loading, error, mode]);

  // Get unique funny message function (unchanged)
  const getUniqueFunnyMessage = (messages) => {
    let newMsg = "";
    const attempts = 5;
    for (let i = 0; i < attempts; i++) {
      const candidate = messages[Math.floor(Math.random() * messages.length)];
      if (candidate !== lastMessageRef.current) {
        newMsg = candidate;
        break;
      }
    }
    lastMessageRef.current = newMsg || messages[0];
    return lastMessageRef.current;
  };

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

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
  };

  const bgColor = mode === "mood" ? "bg-blue-100" : "bg-yellow-100";

  return (
    <div
      className={`flex flex-col items-center p-6 min-h-screen transition-colors duration-500 ${bgColor}`}
    >
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && !error && (
        <p className="text-blue-500 font-semibold mb-4">
          Loading camera and models...
        </p>
      )}

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="720"
          height="560"
          className={`rounded-lg shadow-md ${loading ? "opacity-0" : "opacity-100"}`}
        />
        <canvas
          ref={canvasRef}
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
          className={`px-6 py-2 rounded-full font-semibold hover:scale-110 transition-transform z-10 ${
            mode === "mood" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleModeChange("mood")}
        >
          Mood
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold hover:scale-110 transition-transform z-10 ${
            mode === "age" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleModeChange("age")}
        >
          Age
        </button>
      </div>

      {result && (
        <div className="mt-6 text-center max-w-md">
          <p className="text-xl font-bold text-gray-700">{result}</p>
          {funnyMsg && (
            <MessageDisplay
              type={mode}
              moodType={mode === "mood" ? result.split(" ")[1] : undefined}
            />
          )}

          {showCheck && (
            <button
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
              onClick={() => {
                // manual detection trigger on button click
                // for simplicity just reset lastDetectionTime to force immediate update
                lastDetectionTimeRef.current = 0;
              }}
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
