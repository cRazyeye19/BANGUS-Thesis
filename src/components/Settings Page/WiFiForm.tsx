import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const WiFiForm = () => {
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ssid: wifiSSID,
      password: wifiPassword,
    };
    try {
      const response = await fetch("http://192.168.4.1/update-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setMessage(
          "Configuration updated successfully. The device will restart."
        );
        toast.success(message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        })

        setTimeout(() => {
          setMessage("Please reconnect to the new Wi-Fi network.");
        }, 5000);
      } else {
        const result = await response.json();
        setMessage(`Error: ${result.message}`);
        toast.error(message, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        })
      }
    } catch (error) {
      console.log("Error:", error);
      setMessage("An error occurred. Please try again.");
      toast.error("Connection failed. Ensure ESP32 is in AP mode.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 h-fit">
      <h2 className="text-xl font-semibold mb-4">
        WiFi Credentials Settings
      </h2>
      <form onSubmit={handleUpload}>
        <div className="grid gap-2">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Wi-Fi Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={wifiSSID}
              onChange={(e) => setWifiSSID(e.target.value)}
              placeholder="Enter WiFi name"
              className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Wi-Fi Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={wifiPassword}
                placeholder="Enter WiFi password"
                onChange={(e) => setWifiPassword(e.target.value)}
                className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-bangus-teal text-white hover:bg-bangus-cyan transition-colors"
          >
            <FontAwesomeIcon icon={faFloppyDisk} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default WiFiForm;
