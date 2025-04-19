import { useState, useEffect } from "react";
import {
  ref,
  query,
  orderByChild,
  onValue,
  limitToLast,
} from "firebase/database";
import { database } from "../../config/firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAuth } from "firebase/auth";

interface SensorReading {
  timestamp: string | number;
  EC: number;
  TDS: number;
  oxygenStatus: number | string;
  pH: number;
  temperature: number;
  turbidity: number;
}

// Custom tooltip component for better data display
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-sm text-gray-700">
          {new Date(label * 1000).toLocaleString()}
        </p>
        <div className="mt-2">
          {payload.map((entry: any, index: number) => (
            <p
              key={`item-${index}`}
              className="text-sm"
              style={{ color: entry.color }}
            >
              <span className="font-medium">{entry.name}: </span>
              {entry.value.toFixed(2)} {entry.unit || ''}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SensorChart = () => {
  const [chartData, setChartData] = useState<SensorReading[]>([]);
  const [timeRange, setTimeRange] = useState<string>("day");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([
    "temperature", "pH", "EC", "TDS", "turbidity"
  ]);

  useEffect(() => {
    setLoading(true);
    const readingsRef = ref(
      database,
      `BANGUS/${getAuth().currentUser?.uid}/readings`
    );
    const latestReadingsQuery = query(
      readingsRef,
      orderByChild("timestamp"),
      limitToLast(24 * 30) // Assuming 30 days of hourly data
    );

    onValue(latestReadingsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData: SensorReading[] = Object.keys(data).map((key) => {
          const reading = data[key];
          return {
            timestamp: reading.timestamp || key,
            EC: Number(reading.EC),
            TDS: Number(reading.TDS),
            oxygenStatus: reading.oxygenStatus,
            pH: Number(reading.pH),
            temperature: Number(reading.temperature),
            turbidity: Number(reading.turbidity),
          };
        });
        formattedData.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        setChartData(formattedData);
      }
      setLoading(false);
    });
  }, []);

  const filterDataByTimeRange = (data: SensorReading[], range: string) => {
    const now = Date.now();
    let filteredData = data;

    if (range === "day") {
      filteredData = data.filter(
        (reading) =>
          now - Number(reading.timestamp) * 1000 <= 24 * 60 * 60 * 1000
      );
    } else if (range === "week") {
      filteredData = data.filter(
        (reading) =>
          now - Number(reading.timestamp) * 1000 <= 7 * 24 * 60 * 60 * 1000
      );
    } else if (range === "month") {
      filteredData = data.filter(
        (reading) =>
          now - Number(reading.timestamp) * 1000 <= 30 * 24 * 60 * 60 * 1000
      );
    }

    return filteredData;
  };

  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTimeRange(event.target.value);
  };

  const toggleSensor = (sensor: string) => {
    setSelectedSensors(prev => 
      prev.includes(sensor) 
        ? prev.filter(s => s !== sensor) 
        : [...prev, sensor]
    );
  };

  const filteredChartData = filterDataByTimeRange(chartData, timeRange);

  // Sensor configuration with colors and units
  const sensorConfig = {
    temperature: { color: "#8884d8", name: "Temp (°C)", unit: "°C" },
    pH: { color: "#82ca9d", name: "pH", unit: "" },
    EC: { color: "#ffc658", name: "EC", unit: "µS/cm" },
    TDS: { color: "#ff7300", name: "TDS", unit: "ppm" },
    turbidity: { color: "#ff0000", name: "Turbidity", unit: "NTU" }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="app-header text-xl font-semibold mb-3 md:mb-0">Sensor Readings</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(sensorConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => toggleSensor(key)}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedSensors.includes(key)
                    ? `bg-${config.color} text-white`
                    : "bg-gray-200 text-gray-600"
                }`}
                style={{ 
                  backgroundColor: selectedSensors.includes(key) ? config.color : "#e5e7eb",
                  color: selectedSensors.includes(key) ? "white" : "#4b5563"
                }}
              >
                {config.name}
              </button>
            ))}
          </div>
          <div className="flex items-center">
            <label htmlFor="timeRange" className="mr-2 text-sm text-gray-600">
              View data for:
            </label>
            <select
              id="timeRange"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none"
              value={timeRange}
              onChange={handleTimeRangeChange}
            >
              <option value="day">This Day</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bangus-cyan"></div>
        </div>
      ) : filteredChartData.length === 0 ? (
        <div className="flex justify-center items-center h-80 text-gray-500">
          No data available for the selected time range
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredChartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => {
                const date = new Date(tick * 1000);
                return timeRange === "day" 
                  ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : date.toLocaleDateString([], {month: 'short', day: 'numeric'});
              }}
              style={{ fontSize: "12px" }}
              stroke="#9ca3af"
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: "10px" }}
            />
            
            
            {selectedSensors.includes("temperature") && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={sensorConfig.temperature.color}
                name={sensorConfig.temperature.name}
                dot={false}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            )}
            {selectedSensors.includes("pH") && (
              <Line
                type="monotone"
                dataKey="pH"
                stroke={sensorConfig.pH.color}
                name={sensorConfig.pH.name}
                dot={false}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            )}
            {selectedSensors.includes("EC") && (
              <Line
                type="monotone"
                dataKey="EC"
                stroke={sensorConfig.EC.color}
                name={sensorConfig.EC.name}
                dot={false}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            )}
            {selectedSensors.includes("TDS") && (
              <Line
                type="monotone"
                dataKey="TDS"
                stroke={sensorConfig.TDS.color}
                name={sensorConfig.TDS.name}
                dot={false}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            )}
            {selectedSensors.includes("turbidity") && (
              <Line
                type="monotone"
                dataKey="turbidity"
                stroke={sensorConfig.turbidity.color}
                name={sensorConfig.turbidity.name}
                dot={false}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SensorChart;
