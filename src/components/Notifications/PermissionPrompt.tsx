import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

interface PermissionPromptProps {
  onRequestPermission: () => Promise<void>;
}

const PermissionPrompt = ({ onRequestPermission }: PermissionPromptProps) => {
  return (
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
            onClick={onRequestPermission}
            className="mt-2 text-xs bg-bangus-cyan text-white px-3 py-1.5 rounded-md hover:bg-bangus-cyan-dark"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionPrompt;