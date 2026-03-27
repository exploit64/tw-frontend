import { useState, useEffect, useCallback } from "react";

export const useResizablePanel = (initialWidth = 50) => {
  const [leftWidth, setLeftWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth - 256;
      const newLeftWidth = Math.min(
        Math.max(((e.clientX - 256) / containerWidth) * 100, 20),
        80
      );
      setLeftWidth(newLeftWidth);
    },
    [isDragging]
  );
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);
  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };
  return { leftWidth, handleMouseDown, isDragging };
};
