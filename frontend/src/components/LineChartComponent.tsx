import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartComponentProps {
  data: { name: string; yield: number }[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          dy={10} 
        />
        <YAxis 
          domain={[0, 100]} 
          ticks={[0, 50, 100]} 
          tickFormatter={(tick) => `${tick}%`} 
          axisLine={false} 
          tickLine={false} 
          dx={-10} 
        />
        <Tooltip formatter={(value) => `${value}%`} />
        <Line 
          type="monotone" 
          dataKey="yield" 
          stroke="#005FA8" 
          strokeWidth={2} 
          dot={{ r: 4, fill: '#005FA8' }} 
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;