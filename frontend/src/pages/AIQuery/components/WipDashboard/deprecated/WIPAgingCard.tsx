/**
 * @deprecated Replaced by BarChartCard (../cards/BarChartCard.tsx).
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CustomBarChart from "../../../../../components/CustomBarChart";
import "./WIPAgingCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockWipAgingData } from "../mockLotStatusData";

const defaultChartData = mockWipAgingData.map(item => ({
  name: item.agingBucket,
  value: item.lotCount,
}));

interface WIPAgingCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; value: number }[];
  maxLoadingTime?: number; // in milliseconds (artificial wait time)
}

const WIPAgingCard: React.FC<WIPAgingCardProps> = ({
  headerText = "WIP Aging",
  description = "Track WIP aging to monitor progress",
  chartData = defaultChartData,
  maxLoadingTime = 1350,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = Math.random() * maxLoadingTime;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [maxLoadingTime]);

  return (
    <CustomCard
      headerText={headerText}
      description={description}
      className="anotherCard"
    >
      {isLoading ? (
        <div ><CantierSpinner className="spin_overlay_chart"/></div>
      ) : (
        <CustomBarChart data={chartData} legendName="WIP Items" />
      )}
    </CustomCard>
  );
};

export default WIPAgingCard;