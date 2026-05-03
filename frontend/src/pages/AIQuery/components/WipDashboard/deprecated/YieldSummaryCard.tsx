/**
 * @deprecated Replaced by LineChartCard (../cards/LineChartCard.tsx).
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import LineChartComponent from "../../../../../components/LineChartComponent";
import "./YieldSummaryCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockYieldSummaryToday } from "../mockLotStatusData";

const defaultChartData = mockYieldSummaryToday.map(item => ({
  name: item.productionLineCode,
  yield: Number(item.totalYield),
}));

interface YieldSummaryCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; yield: number }[];
  maxLoadingTime?: number; // in milliseconds (artificial wait time)
}

const YieldSummaryCard: React.FC<YieldSummaryCardProps> = ({
  headerText = "Yield Summary",
  description = "Yield % trends over time",
  chartData = defaultChartData,
  maxLoadingTime = 1350,
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
        <LineChartComponent data={chartData} />
      )}
    </CustomCard>
  );
};

export default YieldSummaryCard;