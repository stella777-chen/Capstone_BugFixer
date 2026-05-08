/**
 * @deprecated Replaced by ComboChartCard (../cards/ComboChartCard.tsx).
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CombinedChart from "../../../../../components/Combinechart";
import "./DefectsCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockDefectRateToday } from "../mockLotStatusData";

const defaultChartData = mockDefectRateToday.map(item => ({
  name: item.defectCode,
  barValue: item.defectCount,
  lineValue: item.totalDefectPercentage,
}));

interface DefectsCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; barValue: number; lineValue: number }[];
}

const DefectsCard: React.FC<DefectsCardProps> = ({
  headerText = "Defects",
  description = "Identify key defect sources",
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
      className="additionalCard2"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <CombinedChart data={chartData} />
      )}
    </CustomCard>
  );
};

export default DefectsCard;