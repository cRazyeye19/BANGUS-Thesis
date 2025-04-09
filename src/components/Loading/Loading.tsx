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
          className="size-32 mb-8"
        />
        <h1 className="header tracking-wider text-6xl mt-2 font-semibold text-bangus-cyan">BANGUS</h1>
      </div>
      <h1 className="text-3xl font-bold">
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
