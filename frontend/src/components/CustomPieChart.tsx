import React, { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CustomPieChartProps {
  chartData: { legend: string; data: number; color: string }[];
}

const minHeight = 250;
const aspectRatio = 2; // Square aspect ratio for pie chart

const CustomPieChart: React.FC<CustomPieChartProps> = ({ chartData }) => {
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
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ flex: 1, height: '100%', minHeight }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius="95%"
              dataKey="data"
              nameKey="legend"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" align="center" formatter={(value) => String(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomPieChart;
