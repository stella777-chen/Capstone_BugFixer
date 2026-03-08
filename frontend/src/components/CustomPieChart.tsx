import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface CustomPieChartProps {
  chartTitle: string;
  
  chartData: { legend: string; data: number; color: string }[];
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({ chartTitle, chartData }) => {
  const [showAllLegend, setShowAllLegend] = useState(false);
  const legendLimit = 3; // Max legends to show before "Show more"

  const displayedLegends = showAllLegend ? chartData : chartData.slice(0, legendLimit);
  const hasMore = chartData.length > legendLimit;

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <h4 style={{ marginBottom: "10px" }}>{chartTitle}</h4>
      <PieChart style={{ width: "100%", height: "100%" }} width={400} height={200}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="data"
          nameKey="legend"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>

      {/* Custom Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "5px" }}>
        {displayedLegends.map((item, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", fontSize: "12px" }}>
            <div style={{ width: "10px", height: "10px", backgroundColor: item.color, marginRight: "5px" }}></div>
            {item.legend}
          </div>
        ))}
        {hasMore && !showAllLegend && (
          <span
            style={{ color: "#2886de", cursor: "pointer", fontSize: "12px" }}
            onClick={() => setShowAllLegend(true)}
          >
            {chartData.length - legendLimit} more
          </span>
        )}
      </div>
    </div>
  );
};

export default CustomPieChart;
