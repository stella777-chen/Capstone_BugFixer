import React from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";

interface RatingChartProps {
  chartTitle: string;
  ratingValue: number[];
  filledColor: string;
  backgroundColor?: string;
  legendNames: [string, string];
  tooltipContent?: (value: number, name: string) => string;
  displayValue: string;
}

const RatingChart: React.FC<RatingChartProps> = ({
  chartTitle,
  ratingValue,
  filledColor,
  backgroundColor = "#D3D3D3",
  legendNames,
  tooltipContent,
  displayValue
}) => {
  const scrapValue = ratingValue[0] || 0;
  const wipValue = ratingValue[1] || 0;

  const data = [
    { name: legendNames[0], value: scrapValue },
    { name: legendNames[1], value: wipValue }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && tooltipContent) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '5px 10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          position: 'relative',
          top: '-10vh' // Move tooltip up above the chart
        }}>
          {tooltipContent(payload[0].value, payload[0].name)}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ textAlign: "center", position: "relative", flex: 1}}>
      <h3 style={{ fontSize: "14px", marginBottom: "5px" }}>{chartTitle}</h3>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
          >
            <Cell fill={filledColor} />
            <Cell fill={backgroundColor} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" align="center" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
      <h2 style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "2vh"
      }}>
        {displayValue}
      </h2>
    </div>
  );
};

export default RatingChart;