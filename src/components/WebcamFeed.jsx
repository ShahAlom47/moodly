"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import MessageDisplay from "./MessageDisplay";
import  {getEmoji}  from "@/lib/getEmoji";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mood");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [age, setAge] = useState("");
  const [showNoFaceMessage, setShowNoFaceMessage] = useState(false);

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
          video: { width: 720, height: 560, facingMode: "user" },
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setLoading(false);
              startLandmarkDetection();
            };
          }
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError("Could not access the camera. Please allow permissions.");
        });
    };

    loadModels();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startLandmarkDetection = async () => {
    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || video.paused || video.ended) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        if (detection) {
          const displaySize = { width: video.width, height: video.height };
          const resized = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawFaceLandmarks(canvas, resized);
          setShowNoFaceMessage(false);
        } else {
          setShowNoFaceMessage(true);
        }
      } catch (err) {
        console.error("Landmark detection error:", err);
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    animationRef.current = requestAnimationFrame(detect);
  };

  const handleCheck = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detection) {
        setResult("No face detected");
        setMessage("");
        return;
      }

      const displaySize = { width: video.width, height: video.height };
      const resized = faceapi.resizeResults(detection, displaySize);

      if (mode === "mood") {
        const expressions = resized.expressions;
        const [mood, confidence] = Object.entries(expressions).reduce(
          (max, [key, value]) => (value > max[1] ? [key, value] : max),
          ["neutral", 0]
        );

        if (confidence > 0.7) {
          setResult(`${getEmoji(mood)} ${mood} (${(confidence * 100).toFixed(1)}%)`);
          setMessage(mood);
        } else {
          setResult("Low confidence detection");
          setMessage("");
        }
      } else if (mode === "age") {
        const { age, gender } = resized;
        setResult(`👤 ${gender}, Age: ${Math.round(age)}`);
        setAge(Math.round(age));
        setMessage("age");
      }
    } catch (err) {
      console.error("Detection error:", err);
      setResult("Detection failed");
      setMessage("");
    }
  };



  const bgColor = mode === "mood" ? "bg-blue-100" : "bg-yellow-100";

  return (
    <div className={`flex flex-col items-center p-6 min-h-screen ${bgColor}`}>
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
        {showNoFaceMessage && (
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
          onClick={() => setMode("mood")}
        >
          Mood
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold ${
            mode === "age" ? "bg-yellow-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("age")}
        >
          Age
        </button>
      </div>

      <div className="mt-6 text-center max-w-md">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-full mb-4 hover:bg-green-700 transition-colors"
          onClick={handleCheck}
        >
          {result ? "Check Again" : "Check"}
        </button>

        {result && (
          <>
            <p className="text-xl font-bold text-gray-700">{result}</p>
            <MessageDisplay message={message} age={age} />
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;
