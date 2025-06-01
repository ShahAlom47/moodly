"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import MessageDisplay from "./MessageDisplay";
import { getEmoji } from "@/lib/getEmoji";

const WebcamFeed = () => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mood");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [age, setAge] = useState(0);
  const [showNoFaceMessage, setShowNoFaceMessage] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const[showScanLine, setShowScanLine] = useState(false);

  // Initialize face detection
  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      setShowScanLine(true);
      try {
        // Load all required models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          faceapi.nets.ageGenderNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
        startVideo();
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Error loading face detection models");
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
              if (modelsLoaded) {
                detectFaces();
              }
            };
          }
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setError("Could not access camera");
        });
    };

    loadModelsAndStartVideo();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Face detection and landmark drawing
  const detectFaces = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const processFrame = async () => {
      try {
        // Set canvas dimensions to match video
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect faces with landmarks
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
          // Prepare display dimensions
          const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight,
          };

          // Resize detections and draw landmarks
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, {
            lineWidth: 2,
            color: "cyan",
          });

          setShowNoFaceMessage(false);
        } else {
          setShowNoFaceMessage(true);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      animationRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  // Analyze face (mood/age)
  const analyzeFace = async () => {
setShowScanLine(true);
setInterval(() => {
  
}, 2500);
    setResult("");
    if (!videoRef.current) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 })
        )
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detection) {
        setResult("No face detected");
        setMessage("");
        return;
      }

      // Get display dimensions
      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };
      const resized = faceapi.resizeResults(detection, displaySize);

      if (mode === "mood") {
        const expressions = resized.expressions;
        const [mood, confidence] = Object.entries(expressions).reduce(
          (max, [key, value]) => (value > max[1] ? [key, value] : max),
          ["neutral", 0]
        );

        if (confidence > 0.5) {
          setResult(
            `${getEmoji(mood)} ${mood} (${(confidence * 100).toFixed(1)}%)`
          );
          setMessage(mood);
        } else {
          setResult("Can't determine mood");
          setMessage("");
        }
      } else {
        const { age, gender } = resized;
        setResult(`👤 ${gender}, Age: ${Math.round(age)}`);
        setAge(Math.round(age));
        setMessage("age");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setResult("Detection failed");
      setMessage("");
    }finally {
      setShowScanLine(false);
    }
  };

  // UI styling
  const bgColor = mode === "mood" ? "bg-blue-100" : "bg-yellow-100";

  return (
    <div className={`flex flex-col items-center p-6 min-h-screen ${bgColor}`}>
        
      {/* Error messages */}
      {error && (
        <p className="text-red-600 mb-4 bg-white p-3 rounded-lg shadow-md">
          {error}
        </p>
      )}
      {loading && !error && (
        <p className="text-blue-500 font-semibold mb-4">
          Loading camera and models...
        </p>
      )}

      {/* Video and canvas */}
      <div className="relative bb h-fit">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`rounded-lg shadow-md bb ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          style={{ width: "720px", height: "560px" }}
        />
        {/* scaning animation */}
       {showScanLine &&  <div className="absolute left-[10%] right-[10%] w-[75%] mx-auto h-[20px] bg-gradient-to-r from-green-500 via-green-900 to-green-400 animate-scan-line blur-lg z-50"></div>
}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 rounded-lg pointer-events-none z-40"
          style={{ width: "720px", height: "560px" }}
        />

        {showNoFaceMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md">
              Please face the camera
            </p>
          </div>
        )}
      </div>

      {/* Mode selection */}
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

      {/* Results */}
      <div className="mt-6 text-center max-w-md">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-full mb-4 hover:bg-green-700"
          onClick={analyzeFace}
        >
          {result ? "Check Again" : "Check"}
        </button>

        {result && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-xl font-bold text-gray-700 mb-2">{result}</p>
            <MessageDisplay message={message} age={age} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;
