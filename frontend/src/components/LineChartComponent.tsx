import React, { useRef, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface LineChartComponentProps {
  data: { name: string; yield: number }[];
  lineColor?: string;
}

const aspectRatio = 2.5;
const minHeight = 200;

function formatLineAxisLabel(value: string): string {
  const dateMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1].slice(5);
  }
  return value;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ data, lineColor = "#005FA8" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const containerHeight = entry.contentRect.height;
      const nextHeight = Math.max(minHeight, width / aspectRatio, containerHeight);
      setHeight((prev) => (Math.abs(prev - nextHeight) < 1 ? prev : nextHeight));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            dy={10}
            tickFormatter={(value) => formatLineAxisLabel(String(value))}
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(tick) => `${tick}%`}
            axisLine={false}
            tickLine={false}
            dx={-10}
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <Tooltip formatter={(value) => `${value}%`} labelFormatter={(label) => formatLineAxisLabel(String(label))} />
          <Legend formatter={() => "Yield Rate"} />
          <Line
            type="monotone"
            dataKey="yield"
            stroke={lineColor}
            strokeWidth={3}
            dot={{ r: 4, fill: lineColor, stroke: "#ffffff", strokeWidth: 1.5 }}
            activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;
