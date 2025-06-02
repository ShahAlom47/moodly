'use client';
import { useEffect, useState, useRef } from 'react';

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  fearful: "😨",
  disgusted: "🤢",
  surprised: "😲",
  neutral: "😐",
};

export default function EmojiRain({ mood = 'happy', running = false }) {
  const [emojis, setEmojis] = useState([]);
  const intervalRef = useRef(null);

  console.log(running, mood);

  const selectedEmoji = moodEmojis[mood] || '❓';

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const newEmoji = {
          id: Math.random().toString(36).substr(2, 9),
          left: Math.random() * 100,
        };
        setEmojis((prev) => [...prev.slice(-30), newEmoji]);
      }, 300);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [running]);

  return (
    <div className="emoji-rain-container absolute top-0 left-0 w-full h-screen pointer-events-none z-50">
      {emojis.map((emoji) => (
        <span
          key={emoji.id}
          className={`emoji ${running?'':"hidden"}`}
          style={{ left: `${emoji.left}%` }}
        >
          {selectedEmoji}
        </span>
      ))}
    </div>
  );
}
