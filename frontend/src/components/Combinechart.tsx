import React from "react";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface CombinedChartProps {
  data: Array<{
    name: string;
    barValue: number;
    lineValue: number;
  }>;
  width?: string;
  height?: string;
}

const CombinedChart: React.FC<CombinedChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
          height={60}
          tick={{ fontSize: 12 }}
          padding={{ left: 10, right: 10 }}
        />
        {/* Left Y-axis for count values (0-200) */}
        <YAxis
          yAxisId="left"
          orientation="left"
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          domain={[0, 200]}
          ticks={[0, 100, 200]}
        />
        {/* Right Y-axis for percentage values (0-100%) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === "barValue") return [`${value}`, "Defect Count"];
            if (name === "lineValue") return [`${value}%`, "Total Defect %"];
            return [value, name];
          }}
        />
        <Legend
          formatter={(value) =>
            value === "barValue" ? "Defect Count" :
            value === "lineValue" ? "Total Defect %" : value
          }
        />
        <Bar
          yAxisId="left"
          dataKey="barValue"
          fill="#62abf5"
          radius={[5, 5, 0, 0]}
          name="barValue"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="lineValue"
          stroke="#0078D4"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0078D4' }}
          activeDot={{ r: 6 }}
          name="lineValue"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CombinedChart;