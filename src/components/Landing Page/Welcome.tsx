import type React from "react";
import WelcomeImage from "../../assets/images/welcome.webp";
import ImageLoading from "../Loading/ImageLoading";

const Welcome: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="relative w-full md:w-1/2 h-auto max-h-[550px] overflow-hidden animate-on-scroll opacity-0 transition-all duration-1000 translate-x-[-50px]">
            <div className="absolute top-0 left-0 z-10 bg-bangus-teal text-white p-3 rounded-tr-lg rounded-bl-lg shadow-md">
              <div className="text-center">
                <div className="text-sm font-medium">Innovative</div>
                <div className="text-base font-bold">Thesis Project</div>
              </div>
            </div>
            <ImageLoading
              src={WelcomeImage}
              alt="Fish farming"
              className="size-full object-cover rounded-lg shadow-lg transition-transform duration-700"
              priority={true}
            />
          </div>

          {/* Right Column - Text Content */}
          <div className="w-full md:w-1/2 space-y-6 animate-on-scroll opacity-0 transition-all duration-1000 translate-x-[50px]">
            <div className="flex items-center gap-2">
              <span className="text-bangus-cyan animate-ping">•</span>
              <h3 className="uppercase text-sm font-medium tracking-wider text-bangus-cyan">
                About Us
              </h3>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
              <span className="text-gray-800">Dedicated Fish Farming</span>
              <br />
              <span className="text-bangus-cyan">And Aqua</span>
              <span className="text-gray-800"> Services</span>
            </h2>

            <p className="text-gray-600 leading-relaxed">
              Our <b>BANGUS</b> System is designed to give farmers real-time
              insights into key parameters like pH levels, dissolved solids,
              temperature, and automated feeding schedule for your milkfish.
              With accurate data and control at your fingertips, you can react
              promptly to maintain a healthy farming environment and improve
              productivity.
            </p>

            <ul className="space-y-3">
              <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-300">
                <span className="text-bangus-cyan mt-1">•</span>
                <span className="text-gray-700">
                  Real-time monitoring of water quality parameters.
                </span>
              </li>
              <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-300 animation-delay-100">
                <span className="text-bangus-cyan mt-1">•</span>
                <span className="text-gray-700">
                  Automated feeding system for optimal fish growth.
                </span>
              </li>
              <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-300 animation-delay-200">
                <span className="text-bangus-cyan mt-1">•</span>
                <span className="text-gray-700">
                  Data analytics to improve farm management decisions.
                </span>
              </li>
              <li className="flex items-start gap-2 hover:translate-x-2 transition-transform duration-300 animation-delay-300">
                <span className="text-bangus-cyan mt-1">•</span>
                <span className="text-gray-700">
                  Mobile access to monitor your farm from anywhere.
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => (window.location.href = "#features")}
              className="bg-bangus-cyan text-white px-6 py-3 rounded hover:bg-bangus-teal transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
            >
              Discover More
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
