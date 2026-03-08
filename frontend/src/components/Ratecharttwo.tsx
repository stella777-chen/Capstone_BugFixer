import React from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

interface RatingChartProps {
  chartTitle: string;
  ratingValue: number; // Value of the rating (out of 100)
  filledColor: string; // Color for filled rating (e.g., red for Scrap, blue for Rework)
  backgroundColor?: string; // Color for the remaining part
  legendNames: [string, string]; // Custom legend names (e.g., ["Scrap", "Total WIP Items"])
  tooltipContent: (value: number, name: string) => string;
  displayValue: string;
  totalValue?: number;
}

const RatingChart: React.FC<RatingChartProps> = ({
  chartTitle,
  ratingValue,
  filledColor,
  backgroundColor = "#D3D3D3",
  legendNames,
  tooltipContent,
}) => {
  const data = [
    { name: legendNames[0], value: ratingValue }, // The filled portion
    { name: legendNames[1], value: 100 - ratingValue }, // The unfilled portion
  ];

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "5px 10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontSize: "12px",
          }}
        >
          {tooltipContent ? tooltipContent(value, name) : `${name}: ${value}%`}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ textAlign: "center", position: "relative", flex: 1 }}>
      <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%" // Moves the chart down
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
          >
            <Cell fill={filledColor} />
            <Cell fill={backgroundColor} />
          </Pie>
          <Tooltip content={customTooltip} position={{ y: 20 }} />
          <Legend verticalAlign="bottom" align="center" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
      <h2
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "2vh",
        }}
      >
        {ratingValue}%
      </h2>
    </div>
  );
};

export default RatingChart;
