/**
 * @deprecated Replaced by PieChartCard (../cards/PieChartCard.tsx).
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CustomPieChart from "../../../../../components/CustomPieChart";
import "./LotStatusCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockLotStatusData } from "../mockLotStatusData";
import type { IWIPLotStatusResponse } from "../type/type.WIPProductionStatus";

const processChartData = (lotData: IWIPLotStatusResponse[]) => {
  const statusMap = new Map<string, number>();
  lotData.forEach((item) => {
    statusMap.set(item.status, (statusMap.get(item.status) || 0) + item.lotCount);
  });
  return [
    { legend: "Not Started", data: statusMap.get("NotStarted") || 0, color: "#d0e3fa" },
    { legend: "WIP",         data: statusMap.get("WorkInProcess") || 0, color: "#62abf5" },
    { legend: "Finished",    data: statusMap.get("Finished") || 0, color: "#2886de" },
    { legend: "Hold",        data: statusMap.get("Hold") || 0, color: "#a0c4ff" },
    { legend: "Cancelled",   data: statusMap.get("Cancelled") || 0, color: "#ff9999" },
  ];
};

const defaultChartData = processChartData(mockLotStatusData);

interface LotStatusCardProps {
  headerText?: string;
  description?: string;
  chartData?: { legend: string; data: number; color: string }[];
}

const LotStatusCard: React.FC<LotStatusCardProps> = ({
  headerText = "Lot Status",
  description = "Track real-time status of lots",
  chartData = defaultChartData,
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
        <CustomPieChart chartData={chartData} />
      )}
    </CustomCard>
  );
};

export default LotStatusCard;