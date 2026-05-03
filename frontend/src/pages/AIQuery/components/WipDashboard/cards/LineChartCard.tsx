import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import LineChartComponent from "../../../../../components/LineChartComponent";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import "./cards.css";

interface LineChartCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; yield: number }[];
  lineColor?: string;
  maxLoadingTime?: number;
}

const LineChartCard: React.FC<LineChartCardProps> = ({
  headerText = "Yield Summary",
  description = "Yield % trends over time",
  chartData = [],
  lineColor = "#005FA8",
  maxLoadingTime = 800,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = Math.random() * maxLoadingTime;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CustomCard
      headerText={headerText}
      description={description}
      className="additionalCard"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <LineChartComponent data={chartData} lineColor={lineColor} />
      )}
    </CustomCard>
  );
};

export default LineChartCard;
