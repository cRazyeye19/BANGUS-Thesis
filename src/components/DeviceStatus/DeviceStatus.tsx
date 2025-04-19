import { getAuth } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../config/firebase";
import { toast } from "react-toastify";
import { createNotification } from "../../utils/notifications";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHourglassStart, faWifi } from "@fortawesome/free-solid-svg-icons";

const DeviceStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [signalStrength, setSignalStrength] = useState<number | null>(null);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const statusRef = ref(database, `BANGUS/${uid}/deviceStatus`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();

      if (data && data.lastSeen) {
        const lastSeenTime = new Date(data.lastSeen * 1000);
        setLastSeen(lastSeenTime);

        const now = new Date();
        const diffMinutes =
          (now.getTime() - lastSeenTime.getTime()) / (1000 * 60);
        const newIsOnline = diffMinutes <= 5;

        if (isOnline && !newIsOnline) {
          toast.error("Device connection lost!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
          });

          createNotification("device_status", "Device connection lost", {
            status: "offline",
            lastSeen: data.lastSeen,
          });
        }

        if (!isOnline && newIsOnline) {
          toast.success("Device connection restored!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
          });
        }

        setIsOnline(newIsOnline);

        if (data.rssi) {
          setSignalStrength(data.rssi);
        }
      }
    });

    return () => unsubscribe();
  }, [isOnline]);

  const formatLastSeen = () => {
    if (!lastSeen) return "N/A";

    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const getSignalDescription = () => {
    if (signalStrength === null) return "N/A";
    if (signalStrength >= 50) return "Excellent";
    if (signalStrength >= -60) return "Good";
    if (signalStrength >= -70) return "Fair";
    return "Poor";
  };
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Device Status</h3>
        <div
          className={`flex items-center ${
            isOnline ? "text-green-500" : "text-red-500"
          }`}
        >
          <FontAwesomeIcon
            icon={isOnline ? faWifi : faHourglassStart}
            className="mr-2"
          />
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <div className="flex justify-between py-1">
          <span>Last Seen:</span>
          <span>{formatLastSeen()}</span>
        </div>

        {signalStrength && (
          <div className="flex justify-between py-1">
            <span>Signal Strength:</span>
            <span>
              {getSignalDescription()} ({signalStrength} dBm)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceStatus;
