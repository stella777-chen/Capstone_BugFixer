import React from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

interface RatingChartProps {
  ratingValue: number[];
  filledColor: string;
  backgroundColor?: string;
  totalValue?: number;
  legendNames: [string, string];
  tooltipContent?: (value: number, name: string) => string;
  displayValue: string;
}

const RatingChart: React.FC<RatingChartProps> = ({
  ratingValue,
  filledColor,
  backgroundColor = "#D3D3D3",
  totalValue = 100,
  legendNames,
  tooltipContent,
  displayValue
}) => {
  const scrapValue = Math.max(ratingValue[0] || 0, 0);
  const safeTotalValue = Math.max(totalValue, scrapValue, 1);
  const remainderValue = Math.max(safeTotalValue - scrapValue, 0);

  // Recharts pie can fail visually if all slices are zero.
  const safeRemainderValue = scrapValue === 0 && remainderValue === 0 ? 1 : remainderValue;

  const data = [
    { name: legendNames[0], value: scrapValue },
    { name: legendNames[1], value: safeRemainderValue }
  ];

  return (
    <div style={{ textAlign: "center", position: "relative", flex: 1}}>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={90}
            outerRadius={120}
            dataKey="value"
          >
            <Cell fill={filledColor} />
            <Cell fill={backgroundColor} />
          </Pie>
          <Tooltip formatter={(value, name) => tooltipContent ? [tooltipContent(value as number, name as string)] : [value, name]} />
          <Legend verticalAlign="bottom" align="center"/>
        </PieChart>
      </ResponsiveContainer>
      <h2 style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "3.5vh"
      }}>
        {displayValue}
      </h2>
    </div>
  );
};

export default RatingChart;