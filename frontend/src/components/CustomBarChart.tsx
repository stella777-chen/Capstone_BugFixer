import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

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
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          ticks={[0, 50, 100]}
          tickFormatter={(tick) => `${tick}%`}
        />
        <Tooltip />
        <Legend formatter={() => legendName} />
        <Bar dataKey="value" fill={barColor} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
