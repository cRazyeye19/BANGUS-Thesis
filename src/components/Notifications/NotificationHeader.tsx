import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface NotificationHeaderProps {
  isMobile: boolean;
  hasNotifications: boolean;
  onClose: () => void;
  onClearAll: () => Promise<void>;
}

const NotificationHeader = ({ 
  isMobile, 
  hasNotifications, 
  onClose, 
  onClearAll 
}: NotificationHeaderProps) => {
  if (isMobile) {
    return (
      <div className="py-4 px-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="mr-3 text-gray-600"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
        </div>
        {hasNotifications && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-3 px-4 bg-white border-b border-gray-200 flex justify-between items-center">
      <h3 className="app-header text-lg font-semibold text-gray-800">Notifications</h3>
      {hasNotifications && (
        <button
          onClick={onClearAll}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default NotificationHeader;