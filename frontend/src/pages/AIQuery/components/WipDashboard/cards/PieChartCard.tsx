import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CustomPieChart from "../../../../../components/CustomPieChart";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import "./cards.css";

interface PieChartCardProps {
  headerText?: string;
  description?: string;
  chartData?: { legend: string; data: number; color: string }[];
  pieFallbackColor?: string;
}

const PieChartCard: React.FC<PieChartCardProps> = ({
  headerText = "Lot Status",
  description = "Track real-time status of lots",
  chartData = [],
  pieFallbackColor = "#62abf5",
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = Math.random() * 800;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CustomCard
      headerText={headerText}
      description={description}
      className="singleCard"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <CustomPieChart
          chartData={chartData.map((item) => ({
            ...item,
            color: item.color || pieFallbackColor,
          }))}
        />
      )}
    </CustomCard>
  );
};

export default PieChartCard;
