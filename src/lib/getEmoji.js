
export const getEmoji = (mood) => {
    console.log("getEmoji called with mood:", mood);
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