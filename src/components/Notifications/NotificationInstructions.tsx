import {
  faBell,
  faEllipsisVertical,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotificationInstructionsProps } from "../../types/notifications";


const NotificationInstructions = ({ onClose }: NotificationInstructionsProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Enable Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-bangus-cyan rounded-full p-2 mr-3">
              <FontAwesomeIcon icon={faBell} className="text-white" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Follow these steps to enable notifications on your mobile device:
            </p>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600 mb-4">
            <li>Open BANGUS in your browser</li>
            <li>
              Tap the menu <FontAwesomeIcon icon={faEllipsisVertical} />
            </li>
            <li>Select 'Add to Home Screen' or 'Install App'</li>
            <li>Open the app from your home screen</li>
            <li>Allow notifications when prompted</li>
          </ol>
          <p className="text-xs text-gray-500 italic">
            Note: Notification support varies by browser and device
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-bangus-cyan text-base font-medium text-white hover:bg-bangus-teal focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationInstructions;
