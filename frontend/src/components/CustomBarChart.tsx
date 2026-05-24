import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

interface CustomBarChartProps {
  data: { name: string; value: number }[];
  legendName: string;
  barColor?: string;
}

const aspectRatio = 2.5;
const minHeight = 200;

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, legendName, barColor = "#62abf5" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(minHeight);
  const maxValue = data.length ? Math.max(...data.map((item) => item.value), 0) : 0;
  const safeMax = Math.max(maxValue, 1);
  const midTick = Math.round(safeMax / 2);

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
        <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
          tick={{ fontSize: 12, fill: "#475569" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, safeMax]}
          ticks={[0, midTick, safeMax]}
          tickFormatter={(tick) => String(tick)}
          tick={{ fontSize: 12, fill: "#475569" }}
        />
        <Tooltip formatter={(value) => [value, legendName]} />
        <Legend formatter={() => legendName} />
        <Bar dataKey="value" fill={barColor} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
