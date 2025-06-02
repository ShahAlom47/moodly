function playSoundByMood(mode) {
  const soundMap = {
    happy: "/sounds/happy.wav",
    sad: "/sounds/sad.wav",
    angry: "/sounds/angry.wav",
    fearful: "/sounds/happy.wav",
    disgusted: "/sounds/happy.wav",
    surprised: "/sounds/surprise.wav",
    neutral: "/sounds/neutral.mp3",
  };

  const soundSrc = soundMap[mode] || soundMap['neutral'];

  if (soundSrc) {
    const audio = new Audio(soundSrc);
    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  }
}


export default playSoundByMood;