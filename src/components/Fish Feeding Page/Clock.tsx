import { useEffect, useState } from "react";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = (hours % 12) * 30 + minutes * 0.5;
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;
  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      {/* Clock face */}
      <div className="absolute inset-0 rounded-full bg-white shadow-[inset_0_8px_16px_rgba(0,0,0,0.1)] border-8 border-white ring-1 ring-black/5"></div>

      {/* Hour hand */}
      <div
        className="absolute w-1.5 h-12 bg-teal-700 rounded-full origin-bottom left-1/2 -translate-x-1/2 bottom-1/2 transition-transform duration-300"
        style={{ transform: `rotate(${hourDegrees}deg)` }}
      />

      {/* Minute hand */}
      <div
        className="absolute w-1 h-16 bg-teal-500 rounded-full origin-bottom left-1/2 -translate-x-1/2 bottom-1/2 transition-transform duration-300"
        style={{ transform: `rotate(${minuteDegrees}deg)` }}
      />

      {/* Seconds hand */}
      <div
        className="absolute w-0.5 h-20 bg-teal-300 rounded-full origin-bottom left-1/2 -translate-x-1/2 bottom-1/2 transition-transform duration-300"
        style={{ transform: `rotate(${secondDegrees}deg)` }}
      />

      {/* Center dot with ring */}
      <div className="absolute w-3 h-3 bg-bangus-cyan rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ring-2 ring-white shadow-sm" />
    </div>
  );
};

export default Clock;
