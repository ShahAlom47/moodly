"use client";
import { useEffect, useState } from "react";
import funnyMessages from "../lib/funnyMessages";

const pickNewMessage = (messages = [], current = "") => {
  const attempts = 5;
  for (let i = 0; i < attempts; i++) {
    const candidate = messages[Math.floor(Math.random() * messages.length)];
    if (candidate !== current) return candidate;
  }
  return current;
};

const MessageDisplay = ({ message, age }) => {
  const [disMessage, setDisMessage] = useState("");

  useEffect(() => {
    if (message === "age" && Array.isArray(funnyMessages.age)) {
      const newMsg = pickNewMessage(funnyMessages.age, disMessage);
      setDisMessage(newMsg);
    } else if (funnyMessages.mood && Array.isArray(funnyMessages.mood[message])) {
      const newMsg = pickNewMessage(funnyMessages.mood[message], disMessage);
      setDisMessage(newMsg);
    } else {
      setDisMessage(""); // clear if no valid message type
    }
  }, [message, age]);

  return (
    <div className="text-lg text-center mt-4 transition-opacity duration-500">
      <p>{disMessage}</p>
    </div>
  );
};

export default MessageDisplay;
