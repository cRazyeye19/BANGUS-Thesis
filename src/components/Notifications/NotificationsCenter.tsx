import { useState } from "react";
import { useNotifications } from "../../context/NotificationsContext";
import { deleteAllNotifications } from "../../utils/notifications";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { ref, remove } from "firebase/database";
import { database } from "../../config/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faTrash } from "@fortawesome/free-solid-svg-icons";

const NotificationsCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, hasPermission, requestPermission } =
    useNotifications();

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleDeleteAllNotifications = async () => {
    await deleteAllNotifications();
    toast.success("All notifications cleared", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
    });
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

  const formatTimeStamp = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    
    const date = new Date(timestampMs);
    
    // Format date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Format time in 12-hour format with AM/PM
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    const timeString = date.toLocaleTimeString([], timeOptions);
    
    return `${day}/${month}/${year} ${timeString}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "feeding_complete":
        return "🍽️";
      case "sensor_alert":
        return "⚠️";
      default:
        return "📌";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="p-2 text-gray-600 hover:text-bangus-cyan focus:outline-none relative"
        aria-label="Notifications"
      >
        <FontAwesomeIcon icon={faBell} className="text-md" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
          <div className="py-3 px-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAllNotifications}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {!hasPermission && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3 text-gray-400">
                    <FontAwesomeIcon icon={faBell} className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      Enable browser notifications to stay updated
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="mt-2 text-xs bg-bangus-cyan text-white px-3 py-1.5 rounded-md hover:bg-bangus-cyan-dark"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex items-start p-4">
                      <div className="flex-shrink-0 mr-3 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 mb-0.5 pr-8">
                            {notification.message}
                          </p>
                          <div className="flex gap-2 ml-2 flex-shrink-0">
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-xs text-gray-400 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                        {notification.details && notification.details.sensor && (
                          <div className="mt-1 text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-1 inline-block">
                            {notification.details.sensor}: {notification.details.value.toFixed(2)} 
                            {notification.details.status === "above" ? " > " : " < "}
                            {notification.details.threshold.toFixed(2)}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeStamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {notifications.length > 5 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <button className="text-sm text-bangus-cyan hover:text-bangus-cyan-dark font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
