"use client";

import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import MessageDisplay from "./MessageDisplay";
import { getEmoji } from "@/lib/getEmoji";
import useResponsiveFaceApiSize from "@/hooks/useResponsiveFaceApiSize";
import EmojiRain from "./EmojiRain";
import getBgByMood from "@/lib/getBgByMood";
import playSoundByMood from "@/lib/playSoundByMood";
import Link from "next/link";
import Heading from "./Heading";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const animationRef = useRef(null);

  const { width, height } = useResponsiveFaceApiSize();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("mood");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [age, setAge] = useState(0);
  const [showNoFaceMessage, setShowNoFaceMessage] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showScanLine, setShowScanLine] = useState(false);
  const [startRain, setStartRain] = useState(false);

  useEffect(() => {
    const loadModelsAndStartVideo = async () => {
      setShowScanLine(true);
      try {
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
          // video: { width, height, facingMode: "user" },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
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
  }, [modelsLoaded, width, height]);

  const detectFaces = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const processFrame = async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (detections.length > 0) {
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

  const analyzeFace = async () => {
    setShowScanLine(true);
    setResult("");
    setMessage("");
    setStartRain(false);

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
        setResult("🚫 No face detected. Please look at the camera.");
        setMessage("");
        return;
      }

      if (mode === "mood") {
        const expressions = detection.expressions;
        const [mood, confidence] = Object.entries(expressions).reduce(
          (max, [key, value]) => (value > max[1] ? [key, value] : max),
          ["neutral", 0]
        );

        if (confidence > 0.5) {
          setResult(
            `${getEmoji(mood)} ${mood} (${(confidence * 100).toFixed(1)}%)`
          );
          setMessage(mood);
          playSoundByMood(mood);
          setStartRain(true);
          setTimeout(() => setStartRain(false), 5000);
        } else {
          setResult("😕 Unable to confidently determine mood.");
          setMessage("");
          setStartRain(false);
        }
      } else if (mode === "age") {
        const { age, gender, detection: faceBox } = detection;

        // Check face detection score
        if (!age || !gender || faceBox.score < 0.7) {
          setResult("🚫 No clear face detected to estimate age/gender.");
          setMessage("");
          return;
        }

        const genderIcon = gender === "male" ? "👨" : "👩";
        setResult(`${genderIcon} ${gender}, Age: ${Math.round(age)}`);
        setAge(Math.round(age));
        setMessage("age");
        setStartRain(false);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setResult("❌ Detection failed. Please try again.");
      setMessage("");
      setStartRain(false);
    } finally {
      setShowScanLine(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResult("");
    setMessage("");
    setStartRain(false);
  };

  const bgColor =
    mode === "mood"
      ? result
        ? getBgByMood(message)
        : "bg-blue-100"
      : "bg-yellow-100";

  return (
    <div className={`flex flex-col items-center min-h-screen ${bgColor}`}>
      <Heading />
      <EmojiRain mood={message} running={startRain} />

      <div className="relative flex justify-center items-center h-fit">
        {loading && !error && (
          <p className="absolute left-2/6 text-blue-500 font-semibold mb-4 text-lg mx-auto">
            Loading camera and models...
          </p>
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`rounded-lg  shadow-md object-cover ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          style={{ width: `${width}px`, height: `${height}px` }}
        />

        {showScanLine && (
          <div className="absolute left-[10%] right-[10%] w-[75%] mx-auto h-[20px] bg-gradient-to-r from-green-500 via-green-900 to-green-400 animate-scan-line blur-lg z-50"></div>
        )}

        {showNoFaceMessage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md">
              Please face the camera
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 mb-4 bg-white p-3 rounded-lg shadow-md my-4">
          {error}
        </p>
      )}

      <div className="flex mt-4 bg-[#005eff] border border-[#005eff] rounded-full shadow-md">
        <button
          className={`px-6 py-1 rounded-l-full font-semibold w-20 transition-all duration-300 ease-in-out ${
            mode === "mood"
              ? "bg-blue-600 text-white shadow-inner hover:bg-blue-700"
              : "bg-gray-200 text-black hover:bg-blue-200"
          }`}
          onClick={() => handleModeChange("mood")}
        >
          Mood
        </button>
        <button
          className={`px-6 py-1 rounded-r-full font-semibold w-20 transition-all duration-300 ease-in-out ${
            mode === "age"
              ? "bg-blue-600 text-white shadow-inner hover:bg-blue-700"
              : "bg-gray-200 text-black hover:bg-blue-200"
          }`}
          onClick={() => handleModeChange("age")}
        >
          Age
        </button>
      </div>

      <div className="mt-6 text-center max-w-md">
        <button
          className="px-6 py-1 bg-green-600 text-white rounded-full mb-4 hover:bg-green-700"
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

      <Link
        href={"/"}
        className="bg-gray-500 my-5 rounded-full text-sm px-5 py-1 border border-white text-white hover:bg-gray-600"
      >
        Back
      </Link>
    </div>
  );
};

export default WebcamFeed;
