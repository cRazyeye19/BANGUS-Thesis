import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";
import Logo from "../../assets/images/feed.png";
import Avatar from "../../assets/images/profile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { NavItemProps } from "../../types/dashboard";
import NotificationsCenter from "../Notifications/Notifications";
import { NAV_ITEMS } from "../../constants/dashboard";

const NavItem = ({ to, icon, text, currentPath }: NavItemProps) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "text-bangus-teal bg-teal-50 font-medium"
          : "text-gray-600 hover:bg-gray-50 hover:text-bangus-teal"
      }`}
    >
      <FontAwesomeIcon
        icon={icon}
        className={`w-4 h-4 ${isActive ? "text-bangus-teal" : "text-gray-500"}`}
      />
      <span className="whitespace-nowrap hidden sm:inline">{text}</span>
    </Link>
  );
};

const Header = () => {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setUserDetails(user));
    return () => unsubscribe();
  }, []);

  const handleSignout = async () => {
    try {
      await auth.signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center h-16 bg-white border-b">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-8 w-8"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-36"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src={Logo || "/placeholder.svg"}
                alt="Bangus Logo"
                className="w-8 h-8 object-contain"
              />
              <a
                href="/"
                className="header mx-1 mt-1 text-md font-bold text-bangus-cyan hover:text-bangus-teal transition-colors"
              >
                BANGUS
              </a>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={userDetails.photoURL || Avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {userDetails.displayName || userDetails.email}
                </span>
              </div>
              <NotificationsCenter />
              <div className="h-6 w-px bg-gray-200 mx-2" />
              <button
                onClick={handleSignout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="h-4 w-4"
                />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-2 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                text={item.text}
                currentPath={location.pathname}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
