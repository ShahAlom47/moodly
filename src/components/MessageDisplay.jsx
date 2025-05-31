"use client";
import { useEffect, useRef, useState } from "react";
import funnyMessages from "../lib/funnyMessages";

const MessageDisplay = ({ type, moodType }) => {
  const [currentMsg, setCurrentMsg] = useState("");
  const indexRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!type || (type === "mood" && !moodType)) return;

    let messages = [];

    if (type === "age") {
      messages = funnyMessages.age;
    } else if (type === "mood" && funnyMessages.mood[moodType]) {
      messages = funnyMessages.mood[moodType];
    }

    if (!messages.length) return;

    indexRef.current = 0;
    setCurrentMsg(messages[0]);

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= messages.length) {
        clearInterval(intervalRef.current);
        return;
      }
      setCurrentMsg(messages[indexRef.current]);
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [type, moodType]);

  return (
    <div className="text-lg text-center mt-4">
      <p>{currentMsg}</p>
    </div>
  );
};

export default MessageDisplay;
