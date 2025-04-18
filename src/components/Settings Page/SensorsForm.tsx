import { useState, useEffect } from "react";
import { ref, update, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

const SensorsForm = () => {
  // Temperature thresholds
  const [tempNormal, setTempNormal] = useState("");
  const [tempDanger, setTempDanger] = useState("");

  // pH thresholds
  const [phNormal, setPhNormal] = useState("");
  const [phDanger, setPhDanger] = useState("");

  // Turbidity thresholds
  const [turbidityNormal, setTurbidityNormal] = useState("");
  const [turbidityDanger, setTurbidityDanger] = useState("");

  // EC thresholds
  const [ecNormal, setEcNormal] = useState("");
  const [ecDanger, setEcDanger] = useState("");

  // TDS thresholds
  const [tdsNormal, setTdsNormal] = useState("");
  const [tdsDanger, setTdsDanger] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing settings on component mount
  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    
    const settingsRef = ref(database, `BANGUS/${uid}/settings`);
    onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.temperature) {
          setTempNormal(data.temperature.Minimum);
          setTempDanger(data.temperature.Maximum);
        }
        if (data.ph) {
          setPhNormal(data.ph.Minimum);
          setPhDanger(data.ph.Maximum);
        }
        if (data.turbidity) {
          setTurbidityNormal(data.turbidity.Minimum);
          setTurbidityDanger(data.turbidity.Maximum);
        }
        if (data.ec) {
          setEcNormal(data.ec.Minimum);
          setEcDanger(data.ec.Maximum);
        }
        if (data.tds) {
          setTdsNormal(data.tds.Minimum);
          setTdsDanger(data.tds.Maximum);
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const sensorDataUpdates = {
      ph: {
        Minimum: phNormal,
        Maximum: phDanger,
      },
      turbidity: {
        Minimum: turbidityNormal,
        Maximum: turbidityDanger,
      },
      ec: {
        Minimum: ecNormal,
        Maximum: ecDanger,
      },
      tds: {
        Minimum: tdsNormal,
        Maximum: tdsDanger,
      },
    };

    update(
      ref(database, `BANGUS/${getAuth().currentUser?.uid}/settings`),
      sensorDataUpdates
    )
      .then(() => {
        console.log("Sensor data updated successfully");
        toast.success("Sensor data updated successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error updating sensor data:", error);
        toast.error("Error updating sensor data: " + error, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        });
        setIsLoading(false);
      });
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-lg font-medium mb-4 text-gray-900">
        Sensor Parameters
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="tempThreshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Temperature Thresholds (°C)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="tempNormal"
              name="tempNormal"
              value={tempNormal}
              onChange={(e) => setTempNormal(e.target.value)}
              step="0.1"
              placeholder="Minimum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <input
              type="number"
              id="tempDanger"
              name="tempDanger"
              value={tempDanger}
              onChange={(e) => setTempDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="phThreshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            pH Thresholds
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="phNormal"
              name="phNormal"
              value={phNormal}
              onChange={(e) => setPhNormal(e.target.value)}
              step="0.1"
              placeholder="Minimum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <input
              type="number"
              id="phDanger"
              name="phDanger"
              value={phDanger}
              onChange={(e) => setPhDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="turbidityThreshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Turbidity Thresholds (NTU)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="turbidityNormal"
              name="turbidityNormal"
              value={turbidityNormal}
              onChange={(e) => setTurbidityNormal(e.target.value)}
              step="0.1"
              placeholder="Minimum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <input
              type="number"
              id="turbidityDanger"
              name="turbidityDanger"
              value={turbidityDanger}
              onChange={(e) => setTurbidityDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="ecThreshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            EC Level Thresholds (μS/cm)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="ecNormal"
              name="ecNormal"
              value={ecNormal}
              onChange={(e) => setEcNormal(e.target.value)}
              step="1"
              placeholder="Minimum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <input
              type="number"
              id="ecDanger"
              name="ecDanger"
              value={ecDanger}
              onChange={(e) => setEcDanger(e.target.value)}
              step="1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="tdsThreshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Total Dissolved Solids Thresholds (ppm)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              id="tdsNormal"
              name="tdsNormal"
              value={tdsNormal}
              onChange={(e) => setTdsNormal(e.target.value)}
              step="1"
              placeholder="Minimum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
            <input
              type="number"
              id="tdsDanger"
              name="tdsDanger"
              value={tdsDanger}
              onChange={(e) => setTdsDanger(e.target.value)}
              step="1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-200 focus:outline-none focus:border-bangus-cyan focus:ring-1 focus:ring-bangus-cyan transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 rounded bg-bangus-cyan text-white hover:bg-bangus-teal transition-colors flex items-center justify-center gap-2 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <FontAwesomeIcon icon={faFloppyDisk} /> 
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SensorsForm;
