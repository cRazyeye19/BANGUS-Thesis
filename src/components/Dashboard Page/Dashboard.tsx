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

const Dashboard = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [thresholds, setThresholds] = useState({
    ph: { min: 6.5, max: 8.5 },
    temperature: { min: 25, max: 32 },
    turbidity: { min: 5, max: 25 },
    ec: { min: 500, max: 1500 },
    tds: { min: 250, max: 750 },
  });

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    const databasePath = `BANGUS/${uid}/real-time`;
    const bangusRef = ref(database, databasePath);

    const unsubscribe = onValue(bangusRef, (snapshot) => {
      const latestReading = snapshot.val();
      console.log("Latest Reading:", latestReading);
      setSensorData(latestReading);
    });

    const settingsRef = ref(database, `BANGUS/${uid}/settings`);
    onValue(settingsRef, (snapshot) => {
      const settings = snapshot.val();
      if (settings) {
        setThresholds({
          ph: { 
            min: Number(settings.ph?.Minimum) || 6.5, 
            max: Number(settings.ph?.Maximum) || 8.5 
          },
          temperature: { 
            min: Number(settings.temperature?.Minimum) || 25, 
            max: Number(settings.temperature?.Maximum) || 32 
          },
          turbidity: { 
            min: Number(settings.turbidity?.Minimum) || 5, 
            max: Number(settings.turbidity?.Maximum) || 25 
          },
          ec: { 
            min: Number(settings.ec?.Minimum) || 500, 
            max: Number(settings.ec?.Maximum) || 1500 
          },
          tds: { 
            min: Number(settings.tds?.Minimum) || 250, 
            max: Number(settings.tds?.Maximum) || 750 
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
