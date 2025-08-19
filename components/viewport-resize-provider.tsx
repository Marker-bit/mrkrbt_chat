"use client";

import { useEffect } from "react";

export default function ViewportResizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleResize = () => {
      // Use visualViewport for accurate height when keyboard is open
      const vh = window.visualViewport?.height || window.innerHeight;
      //   setViewportHeight(vh);
      // Alternatively, directly set on body or root
      document.body.style.height = `${vh}px`;
    };

    // Initial call
    handleResize();

    // Listen to resize (keyboard open/close triggers this)
    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize); // Fallback for broader compatibility

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    // <div
    //   style={{
    //     height: viewportHeight,
    //     overflow: "hidden", // prevent scrolling
    //     // background: "#f5f5f5",
    //   }}
    // >
    children
    // </div>
  );
}
