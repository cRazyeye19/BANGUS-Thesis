import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  PIE_CHART_DATA_1,
  PIE_CHART_DATA_2,
  PIE_CHART_COLORS_1,
  PIE_CHART_COLORS_2
} from "../../constants/dashboard";

const Piechart = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Chart title</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PIE_CHART_DATA_1}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {PIE_CHART_DATA_1.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS_1[index]} />
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
                data={PIE_CHART_DATA_2}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
              >
                {PIE_CHART_DATA_2.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS_2[index]} />
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
