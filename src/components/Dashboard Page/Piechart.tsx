import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const pieData1 = [
  { name: "Green", value: 63 },
  { name: "Light Green", value: 37 },
];

const pieData2 = [
  { name: "Navy", value: 47.4 },
  { name: "Blue", value: 33.1 },
  { name: "Light Blue", value: 12.5 },
  { name: "Very Light Blue", value: 7 },
];

const COLORS1 = ["#22c55e", "#86efac"];
const COLORS2 = ["#1e3a8a", "#3b82f6", "#93c5fd", "#dbeafe"];

const Piechart = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Chart title</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData1}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData1.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS1[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Chart title</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData2}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData2.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS2[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Piechart;
