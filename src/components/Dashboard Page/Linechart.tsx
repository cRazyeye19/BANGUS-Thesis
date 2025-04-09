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

const SensorChart = () => {
  const [chartData, setChartData] = useState<SensorReading[]>([]);
  const [timeRange, setTimeRange] = useState<string>("day");

  useEffect(() => {
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

  const filteredChartData = filterDataByTimeRange(chartData, timeRange);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Sensor Readings</h2>
        <div>
          <label htmlFor="timeRange" className="mr-2 hidden md:inline">
            View data for:
          </label>
          <select
            id="timeRange"
            className="focus:outline-none"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="day">This Day</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredChartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(tick) => new Date(tick * 1000).toLocaleString()}
            style={{ fontSize: "12px" }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#8884d8"
            name="Temp (°C)"
          />
          <Line type="monotone" dataKey="pH" stroke="#82ca9d" name="pH" />
          <Line type="monotone" dataKey="EC" stroke="#ffc658" name="EC" />
          <Line type="monotone" dataKey="TDS" stroke="#ff7300" name="TDS" />
          <Line
            type="monotone"
            dataKey="turbidity"
            stroke="#ff0000"
            name="Turbidity"
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default SensorChart;
