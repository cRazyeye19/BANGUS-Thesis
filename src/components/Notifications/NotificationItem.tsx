import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Notification } from "../../context/NotificationsContext";

interface NotificationItemProps {
  notification: Notification;
  onDelete: (id: string) => Promise<void>;
}

const NotificationItem = ({
  notification,
  onDelete,
}: NotificationItemProps) => {
  const formatTimeStamp = (timestamp: number) => {
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;

    const date = new Date(timestampMs);

    // Format date as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Format time in 12-hour format with AM/PM
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
      case "schedule_conflict":
        return "⏱️";
      default:
        return "📌";
    }
  };

  return (
    <li className="hover:bg-gray-50 transition-colors duration-150">
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
                onClick={() => onDelete(notification.id)}
                className="text-xs text-gray-400 hover:text-red-500 p-1"
                title="Delete"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
          {notification.details && notification.details.sensor && (
            <div className="mt-1 text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-1 inline-block">
              {notification.details.sensor}:{" "}
              {notification.details.value.toFixed(2)}
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
  );
};

export default NotificationItem;
