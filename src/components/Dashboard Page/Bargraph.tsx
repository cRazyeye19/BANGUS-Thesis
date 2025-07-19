import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { BAR_GRAPH_DATA } from "../../constants/dashboard";

const data = BAR_GRAPH_DATA;

const BarGraph = () => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Bar dataKey="uv" fill="#8884d8" />
      <Cell fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

export default BarGraph;
