import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import NotificationInstructions from "./NotificationInstructions";
import { PermissionPromptProps } from "../../types/notifications";

const PermissionPrompt = ({ onRequestPermission }: PermissionPromptProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    setIsMobile(isMobileDevice);

    setIsSupported("Notification" in window);
  }, []);

  const handleRequestPermission = async () => {
    if (isMobile) {
      setShowModal(true);
    } else {
      await onRequestPermission();
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3 text-gray-400">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Your browser doesn't support notifications
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3 text-gray-400">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {isMobile
                ? "Add BANGUS to your home screen for notifications"
                : "Enable browser notifications to stay updated"}
            </p>
            <button
              onClick={handleRequestPermission}
              className="mt-2 text-xs bg-bangus-cyan text-white px-3 py-1.5 rounded-md hover:bg-bangus-cyan-dark"
            >
              {isMobile ? "Show Instructions" : "Enable Notifications"}
            </button>
          </div>
        </div>
      </div>

      {showModal && <NotificationInstructions onClose={closeModal} />}
    </>
  );
};

export default PermissionPrompt;
