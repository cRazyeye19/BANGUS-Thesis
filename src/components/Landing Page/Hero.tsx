import type React from "react";
import HeroImage from "../../assets/images/hero2.webp";
import { Link } from "react-router-dom";
import ImageLoading from "../Loading/ImageLoading";

const Hero: React.FC = () => {
  return (
    <section id="hero" className="relative h-[500px] sm:h-[600px] w-full">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <ImageLoading
          src={HeroImage}
          alt="Hero Image"
          className="w-full h-full object-cover object-center sm:object-center md:object-center"
          priority={true}
          width="100%"
          height="100%"
        />
        <div className="absolute inset-0 bg-teal-600/15 backdrop-brightness-75 animate-fadeIn"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
        <div className="max-w-md text-bangus-white text-center px-2 animate-slideInUp">
          <h1 className="header tracking-wider text-4xl font-bold mb-6 text-wrap sm:text-5xl md:text-6xl flex flex-col items-center">
            <span className="animate-slideInLeft whitespace-nowrap">Smart Milkfish</span>
            <span className="text-bangus-cyan mt-1 sm:mt-2 animate-slideInRight whitespace-nowrap">
              Farming System
            </span>
          </h1>
          <p className="my-8 sm:mb-10 text-sm sm:text-base text-gray-100 animate-fadeIn animation-delay-300">
            Revolutionize your bangus farm with precision water monitoring, 
            automated feeding, and real-time analytics for healthier fish and higher yields
          </p>
          <Link
            to="/auth/login"
            className="bg-bangus-cyan text-white px-4 py-2 sm:px-6 sm:py-3 rounded hover:bg-bangus-teal inline-block transition-all duration-300 hover:scale-110"
          >
            See How It Works
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
