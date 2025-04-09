import { useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "../../config/firebase";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
const SensorsForm = () => {
  const [samplingInterval, setSamplingInterval] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sensorDataUpdates = {
      samplingInterval,
      temperature: {
        Minimum: tempNormal,
        Maximum: tempDanger,
      },
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
      })
      .catch((error) => {
        console.log("Error updating sensor data:", error);
        toast.error("Error updating sensor data: " + error, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        });
      });
    // Reset state variables to their initial values
    setSamplingInterval("");
    setTempNormal("");
    setTempDanger("");
    setPhNormal("");
    setPhDanger("");
    setTurbidityNormal("");
    setTurbidityDanger("");
    setEcNormal("");
    setEcDanger("");
    setTdsNormal("");
    setTdsDanger("");
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Sensor Parameters
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="tempThreshold"
            className="block text-sm font-medium text-gray-700"
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
              className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              id="tempDanger"
              name="tempDanger"
              value={tempDanger}
              onChange={(e) => setTempDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="phThreshold"
            className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              id="phDanger"
              name="phDanger"
              value={phDanger}
              onChange={(e) => setPhDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="turbidityThreshold"
            className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              id="turbidityDanger"
              name="turbidityDanger"
              value={turbidityDanger}
              onChange={(e) => setTurbidityDanger(e.target.value)}
              step="0.1"
              placeholder="Maximum"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="ecThreshold"
            className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              id="ecDanger"
              name="ecDanger"
              value={ecDanger}
              onChange={(e) => setEcDanger(e.target.value)}
              step="1"
              placeholder="Maximum"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="tdsThreshold"
            className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              id="tdsDanger"
              name="tdsDanger"
              value={tdsDanger}
              onChange={(e) => setTdsDanger(e.target.value)}
              step="1"
              placeholder="Maximum"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
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

export default SensorsForm;
