
export const getEmoji = (mood) => {
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