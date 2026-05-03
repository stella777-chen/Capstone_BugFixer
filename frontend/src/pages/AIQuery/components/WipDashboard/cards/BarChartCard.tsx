import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CustomBarChart from "../../../../../components/CustomBarChart";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import "./cards.css";

interface BarChartCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; value: number }[];
  barColor?: string;
  maxLoadingTime?: number;
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  headerText = "WIP Aging",
  description = "Track WIP aging to monitor progress",
  chartData = [],
  barColor = "#62abf5",
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
      className="anotherCard"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <CustomBarChart data={chartData} legendName="WIP Items" barColor={barColor} />
      )}
    </CustomCard>
  );
};

export default BarChartCard;
