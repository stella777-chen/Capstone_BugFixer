import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import CombinedChart from "../../../../../components/Combinechart";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import "./cards.css";

interface ComboChartCardProps {
  headerText?: string;
  description?: string;
  chartData?: { name: string; barValue: number; lineValue: number }[];
  barColor?: string;
  lineColor?: string;
  lineTotalValue?: number;
  totalCount?: number;
}

const ComboChartCard: React.FC<ComboChartCardProps> = ({
  headerText = "Defects",
  description = "Identify key defect sources",
  chartData = [],
  barColor = "#62abf5",
  lineColor = "#0078D4",
  lineTotalValue = 100,
  totalCount,
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
        <CombinedChart
          data={chartData}
          barColor={barColor}
          lineColor={lineColor}
          lineTotalValue={lineTotalValue}
          totalCount={totalCount}
        />
      )}
    </CustomCard>
  );
};

export default ComboChartCard;
