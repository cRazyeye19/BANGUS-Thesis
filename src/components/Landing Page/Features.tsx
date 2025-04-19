import type React from "react";
import MonitorImage from "../../assets/images/market.png";
import PortableImage from "../../assets/images/boat.png";
import FeedingImage from "../../assets/images/feed.png";

const features = [
  {
    text: "Get instant insights into your farm's performance with real-time updates on water quality, feeding schedules, and more.",
    title: "Real-Time Monitoring",
    avatar: MonitorImage,
  },
  {
    text: "Take Bangus anywhere - our portable design makes it easy to monitor and control your farm from anywhere.",
    title: "Portable Design",
    avatar: PortableImage,
  },
  {
    text: "Automate your feeding schedules with Bangus - set it up once and let the system handle the rest.",
    title: "Automated Feeding",
    avatar: FeedingImage,
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-bangus-cyan uppercase text-sm font-medium tracking-wider">Feature</span>
          <h2 className="text-3xl md:text-4xl font-semibold mt-2">
            <span className="text-gray-800">Our Awesome </span>
            <span className="text-bangus-cyan">Feature</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Our BANGUS system provides innovative solutions for modern fish farming with real-time monitoring and control.
          </p>
          <div className="w-24 h-1 bg-bangus-cyan mx-auto mt-6"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-md text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-bangus-cyan flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <img
                    src={feature.avatar || "/placeholder.svg"}
                    alt={feature.title}
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.text}</p>
              <div className="w-16 h-1 bg-bangus-cyan mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
