import React, { useState } from "react";
import { OptimizedImageProps } from "../../types/images";

const ImageLoading: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && !error && (
        <div
          className={`absolute inset-0 bg-gray-200 rounded overflow-hidden ${className}`}
        >
          <div className="animate-pulse w-full h-full">
            <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:400%_100%] animate-shimmer"></div>
          </div>
        </div>
      )}
      {error && (
        <div
          className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${className}`}
        >
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${
          isLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default ImageLoading;
