import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CustomBarChartProps {
  data: { name: string; value: number }[];
  legendName: string;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, legendName }) => {
  return (
    <ResponsiveContainer width="100%" height={250} >
    <BarChart data={data}>
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        interval={0}  // Ensure all labels are displayed
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        ticks={[0, 50, 100]}
        tickFormatter={(tick) => `${tick}%`}
      />
      <Tooltip />
      <Legend formatter={() => legendName} />
      <Bar dataKey="value" fill="#62abf5" radius={[5, 5, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
};

export default CustomBarChart;
