import type React from "react";
import Logo from "../../assets/images/feed.png";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="border-b bg-bangus-white sticky top-0 z-50 shadow-md animate-fadeIn">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center animate-slideInLeft">
          <img src={Logo} alt="BANGUS Logo" className="size-10" />
          <a
            href="/"
            className="text-sm mt-1 tracking-wider font-semibold text-bangus-cyan hover:text-bangus-teal header ml-2 transition-all duration-300 hover:scale-105"
          >
            BANGUS
          </a>
        </div>
        <nav className="hidden md:flex items-center space-x-6 mt-1 animate-slideInDown">
          <a href="#hero" className="text-sm hover:text-bangus-teal transition-all duration-300 hover:-translate-y-1">
            Home
          </a>
          <a href="#about" className="text-sm hover:text-bangus-teal transition-all duration-300 hover:-translate-y-1">
            About Us
          </a>
          <a href="#features" className="text-sm hover:text-bangus-teal transition-all duration-300 hover:-translate-y-1">
            Features
          </a>
          <a href="#footer" className="text-sm hover:text-bangus-teal transition-all duration-300 hover:-translate-y-1">
            Contact Us
          </a>
        </nav>
        <button
          onClick={() => navigate("/auth/login")}
          className="bg-bangus-cyan text-bangus-white px-4 py-2 rounded hover:bg-bangus-teal transition-all duration-300 hover:scale-105 animate-slideInRight"
        >
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;
