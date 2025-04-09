import type React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faGithub 
} from "@fortawesome/free-brands-svg-icons";

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-bangus-cyan text-white mt-auto animate-on-scroll opacity-0 transition-all duration-1000 translate-y-[30px]">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Column 1 - About */}
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 translate-x-[-30px]">
            <h3 className="header tracking-wider text-base font-semibold mb-4">BANGUS</h3>
            <p className="text-sm leading-relaxed opacity-90">
              BANGUS is a system developed by Byte as their final project that
              allows farmers to monitor their farms in real-time and improve
              productivity.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span className="text-sm">jlesterpansoy@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span className="text-sm">+(63)9982020869</span>
              </div>
              <div className="flex items-center gap-3 hover:translate-x-2 transition-transform duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm">Cebu City, Philippines</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 translate-y-[30px]">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#hero" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" /> Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> About Us
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Features
                </a>
              </li>
              <li>
                <Link to="/auth/login" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Login
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Documentation
                </a>
              </li>
              <li>
                <a href="#footer" className="hover:text-bangus-teal flex items-center gap-2 transition-all duration-300 hover:translate-x-2">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Our Services */}
          <div className="animate-on-scroll opacity-0 transition-all duration-1000 translate-x-[30px]">
            <h4 className="font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Real-Time Monitoring
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Automated Feeding
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Water Quality Analysis
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Mobile Accessibility
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Data Analytics
                </span>
              </li>
              <li>
                <span className="flex items-center gap-2 transition-all duration-300 hover:translate-x-2 cursor-default">
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /> Technical Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-white border-opacity-20">
          <p className="text-sm opacity-90 mb-4 md:mb-0">
            © {new Date().getFullYear()} BANGUS. Designed & Developed by Team Byte
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:scale-125 duration-300">
              <FontAwesomeIcon icon={faFacebookF} className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:scale-125 duration-300">
              <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:scale-125 duration-300">
              <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5" />
            </a>
            <a href="#" className="text-white hover:scale-125 duration-300">
              <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
