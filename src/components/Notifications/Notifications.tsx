import { useState, useEffect } from "react";
import { useNotifications } from "../../context/NotificationsContext";
import { deleteAllNotifications } from "../../utils/notifications";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { ref, remove } from "firebase/database";
import { database } from "../../config/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell } from "@fortawesome/free-solid-svg-icons";
import NotificationItem from "./NotificationItem";
import NotificationHeader from "./NotificationHeader";
import EmptyNotifications from "./EmptyNotifications";
import PermissionPrompt from "./PermissionPrompt";

const NotificationsCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const { notifications, unreadCount, hasPermission, requestPermission } =
    useNotifications();

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint in Tailwind
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleViewAllNotifications = () => {
    setShowAllNotifications(true);
    if (!isMobile) {
      setIsOpen(false);
    }
  };

  const handleDeleteAllNotifications = async () => {
    await deleteAllNotifications();
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    try {
      await remove(
        ref(database, `BANGUS/${uid}/notifications/${notificationId}`)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success("Permission granted", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } else {
      toast.error("Permission denied", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  // Notification content component - reused in both desktop and mobile views
  const NotificationContent = () => (
    <>
      {!hasPermission && (
        <PermissionPrompt 
          onRequestPermission={handleRequestPermission} 
        />
      )}

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={handleDeleteNotification}
            />
          ))}
        </ul>
      )}
    </>
  );

  // Mobile full-screen modal for notifications
  const MobileNotificationsModal = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <NotificationHeader 
        isMobile={true}
        hasNotifications={notifications.length > 0}
        onClose={toggleNotifications}
        onClearAll={handleDeleteAllNotifications}
      />
      
      <div className="flex-1 overflow-y-auto">
        <NotificationContent />
      </div>
    </div>
  );

  // Desktop dropdown for notifications
  const DesktopNotificationsDropdown = () => (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
      <NotificationHeader 
        isMobile={false}
        hasNotifications={notifications.length > 0}
        onClose={toggleNotifications}
        onClearAll={handleDeleteAllNotifications}
      />

      <div className="max-h-96 overflow-y-auto">
        <NotificationContent />
      </div>
      
      {notifications.length > 5 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
          <button 
            onClick={handleViewAllNotifications}
            className="text-sm text-bangus-cyan hover:text-bangus-cyan-dark font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );

  // Full screen modal for all notifications
  const AllNotificationsModal = () => (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="py-4 px-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => setShowAllNotifications(false)}
            className="mr-3 text-gray-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">All Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAllNotifications}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onDelete={handleDeleteNotification}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="p-2 text-gray-600 hover:text-bangus-cyan focus:outline-none relative"
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} className="text-md" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        isMobile ? <MobileNotificationsModal /> : <DesktopNotificationsDropdown />
      )}

      {showAllNotifications && <AllNotificationsModal />}
    </div>
  );
};

export default NotificationsCenter;
