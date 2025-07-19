import Card from "./Card";
import Header from "./Header";
import Linechart from "./Linechart";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { getAuth } from "firebase/auth";
import type { SensorData } from "../../types/dashboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { DEFAULT_THRESHOLDS } from "../../constants/dashboard";

const Dashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    const databasePath = `BANGUS/${uid}/real-time`;
    const bangusRef = ref(database, databasePath);

    const unsubscribe = onValue(bangusRef, (snapshot) => {
      const latestReading = snapshot.val();
      setSensorData(latestReading);
    });

    const settingsRef = ref(database, `BANGUS/${uid}/settings`);
    onValue(settingsRef, (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        setThresholds({
          ph: {
            min: Number(settings.ph?.Minimum) || DEFAULT_THRESHOLDS.ph.min,
            max: Number(settings.ph?.Maximum) || DEFAULT_THRESHOLDS.ph.max
          },
          temperature: {
            min: Number(settings.temperature?.Minimum) || DEFAULT_THRESHOLDS.temperature.min,
            max: Number(settings.temperature?.Maximum) || DEFAULT_THRESHOLDS.temperature.max
          },
          turbidity: {
            min: Number(settings.turbidity?.Minimum) || DEFAULT_THRESHOLDS.turbidity.min,
            max: Number(settings.turbidity?.Maximum) || DEFAULT_THRESHOLDS.turbidity.max
          },
          ec: {
            min: Number(settings.ec?.Minimum) || DEFAULT_THRESHOLDS.ec.min,
            max: Number(settings.ec?.Maximum) || DEFAULT_THRESHOLDS.ec.max
          },
          tds: {
            min: Number(settings.tds?.Minimum) || DEFAULT_THRESHOLDS.tds.min,
            max: Number(settings.tds?.Maximum) || DEFAULT_THRESHOLDS.tds.max
          },
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const getStatus = (value: number, min: number, max: number) => {
    if (value < min) return "below";
    if (value > max) return "above";
    return "optimal";
  };

  return (
    <>
      <Header />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-8">
        <h1 className="app-header text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-3 rounded shadow md:col-span-3 lg:col-span-5">
            <div className="flex items-center justify-between ml-2">
              <p className="font-medium text-xs md:text-base lg:text-base text-center">
                <FontAwesomeIcon icon={faWandMagicSparkles} /> Legend
              </p>
              <p className="font-medium text-xs md:text-base lg:text-base text-center">
                <span className="text-green-500">Green</span>: Optimal
              </p>
              <p className="font-medium text-xs md:text-base lg:text-base text-center">
                <span className="text-orange-500">Orange</span>: Below Optimal
              </p>
              <p className="font-medium text-xs md:text-base lg:text-base text-center">
                <span className="text-red-500">Red</span>: Above Optimal
              </p>
            </div>
          </div>
          <Card 
            title="pH Level" 
            value={sensorData?.pH || 0} 
            status={getStatus(
              sensorData?.pH || 0, 
              thresholds.ph.min, 
              thresholds.ph.max
            )}
          />
          <Card
            title="Temperature"
            value={sensorData?.temperature || 0}
            prefix="°C"
            status={getStatus(
              sensorData?.temperature || 0, 
              thresholds.temperature.min, 
              thresholds.temperature.max
            )}
          />
          <Card
            title="Turbidity"
            value={sensorData?.turbidity || 0}
            prefix="NTU"
            status={getStatus(
              sensorData?.turbidity || 0, 
              thresholds.turbidity.min, 
              thresholds.turbidity.max
            )}
          />
          <Card 
            title="EC Level" 
            value={sensorData?.EC || 0} 
            prefix="µS/cm" 
            status={getStatus(
              sensorData?.EC || 0, 
              thresholds.ec.min, 
              thresholds.ec.max
            )}
          />
          <Card 
            title="TDS" 
            value={sensorData?.TDS || 0} 
            prefix="ppm" 
            status={getStatus(
              sensorData?.TDS || 0, 
              thresholds.tds.min, 
              thresholds.tds.max
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <Linechart />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
