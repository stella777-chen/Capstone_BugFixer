import React, { useEffect, useRef, useState } from "react";
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
  barColor?: string;
  lineColor?: string;
  lineTotalValue?: number;
  totalCount?: number;
}

const aspectRatio = 2.5;
const minHeight = 200;

const CombinedChart: React.FC<CombinedChartProps> = ({
  data,
  barColor = "#62abf5",
  lineColor = "#0078D4",
  lineTotalValue = 100,
  totalCount,
}) => {
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

  const safeLineTotalValue = lineTotalValue > 0 ? lineTotalValue : 100;
  const dataMaxBar = data.length ? Math.max(...data.map((item) => item.barValue), 0) : 0;
  const safeLeftMax = Math.max(totalCount ?? dataMaxBar, 1);
  const leftMid = Math.round(safeLeftMax / 2);
  const chartData = data.map((item) => ({
    ...item,
    linePercentValue: (item.lineValue / safeLineTotalValue) * 100,
  }));

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight }}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        {/* Left Y-axis follows provided totalCount; otherwise falls back to data max. */}
        <YAxis
          yAxisId="left"
          orientation="left"
          axisLine={false}
          tickLine={false}
          domain={[0, safeLeftMax]}
          ticks={[0, leftMid, safeLeftMax]}
        />
        {/* Right Y-axis for percentage values (0-100%) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          ticks={[0, 50, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === "barValue") return [`${value}`, "Defect Count"];
            if (name === "linePercentValue") return [`${Number(value).toFixed(2)}%`, "Total Defect %"];
            return [value, name];
          }}
        />
        <Legend
          formatter={(value) =>
            value === "barValue" ? "Defect Count" :
            value === "linePercentValue" ? "Total Defect %" : value
          }
        />
        <Bar
          yAxisId="left"
          dataKey="barValue"
          fill={barColor}
          radius={[5, 5, 0, 0]}
          name="barValue"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="linePercentValue"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 4, fill: lineColor }}
          activeDot={{ r: 6 }}
          name="linePercentValue"
        />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedChart;