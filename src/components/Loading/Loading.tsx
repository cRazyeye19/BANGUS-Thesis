import React, { useEffect } from "react";
import loadingLogo from "../../assets/loading.svg";

const Loading = () => {
  const [dots, setDots] = React.useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 300);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex items-center justify-center animate-pulse">
        <img
          src={loadingLogo}
          alt="Loading"
          className="w-16 h-16 sm:w-24 sm:h-24 md:size-32 mb-4 sm:mb-6 md:mb-8"
        />
        <h1 className="header tracking-wider text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 font-semibold text-bangus-cyan">BANGUS</h1>
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
        <span className="loading-text tracking-wider">
          {"Loading".split("").map((letter, index) => (
            <span key={index}>{letter}</span>
          ))}
        </span>
        <span className="loading-dots">
          {dots.split("").map((dot, index) => (
            <span key={index}>{dot}</span>
          ))}
        </span>
      </h1>
    </div>
  );
};

export default Loading;
