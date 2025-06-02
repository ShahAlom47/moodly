
  const getBgByMood = (mood)=> {

  const emotionBgClasses = {
    happy: "bg-yellow-400",
    sad: "bg-blue-900",
    angry: "bg-red-500",
    fearful: "bg-purple-400",
    disgusted: "bg-lime-400",
    surprised: "bg-yellow-400",
    neutral: "bg-gray-400",
  };

  return emotionBgClasses[mood] || "bg-white";
}


export default getBgByMood;