import { useEffect, useState } from "react";

const useResponsiveFaceApiSize = () => {
  const [size, setSize] = useState({
    width: 720,
    height: 560,
  });

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      console.log(`Window width: ${width}`); // Debugging log

      if (width >= 1024) {
        setSize({ width: 720, height: 560,});
      } else if (width >= 768) {
        setSize({ width: 640, height: 480,}); // Default webcam resolution
      } else if (width >= 640) {
        setSize({ width: 320, height: 240, }); // Safe
      } else {
        setSize({ width: 320, height: 240, }); // Small screen safe
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

export default useResponsiveFaceApiSize;
