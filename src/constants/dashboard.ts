export const BAR_GRAPH_DATA = [
  { name: "Page A", uv: 4000 },
  { name: "Page B", uv: 3000 },
  { name: "Page C", uv: 2000 },
  { name: "Page D", uv: 2780 },
];

export const PIE_CHART_DATA_1 = [
  { name: "Green", value: 63 },
  { name: "Light Green", value: 37 },
];

export const PIE_CHART_DATA_2 = [
  { name: "Navy", value: 47.4 },
  { name: "Blue", value: 33.1 },
  { name: "Light Blue", value: 12.5 },
  { name: "Very Light Blue", value: 7 },
];

export const PIE_CHART_COLORS_1 = ["#22c55e", "#86efac"];
export const PIE_CHART_COLORS_2 = ["#1e3a8a", "#3b82f6", "#93c5fd", "#dbeafe"];

export const DEFAULT_THRESHOLDS = {
  ph: { min: 6.5, max: 8.5 },
  temperature: { min: 25, max: 32 },
  turbidity: { min: 5, max: 25 },
  ec: { min: 500, max: 1500 },
  tds: { min: 250, max: 750 },
};

export const SENSOR_CONFIG = {
  temperature: { color: "#8884d8", name: "Temp (°C)", unit: "°C" },
  pH: { color: "#82ca9d", name: "pH", unit: "" },
  EC: { color: "#ffc658", name: "EC", unit: "µS/cm" },
  TDS: { color: "#ff7300", name: "TDS", unit: "ppm" },
  turbidity: { color: "#ff0000", name: "Turbidity", unit: "NTU" }
};

export const DEFAULT_SELECTED_SENSORS = [
  "temperature", "pH", "EC", "TDS", "turbidity"
];

import { faMagnifyingGlass, faFishFins, faGears } from "@fortawesome/free-solid-svg-icons";

export const NAV_ITEMS = [
  {
    to: "/dashboard",
    icon: faMagnifyingGlass,
    text: "Water Quality Monitoring",
  },
  {
    to: "/fish-feeding",
    icon: faFishFins,
    text: "Fish Feeding Automation",
  },
  {
    to: "/settings",
    icon: faGears,
    text: "Settings",
  },
];