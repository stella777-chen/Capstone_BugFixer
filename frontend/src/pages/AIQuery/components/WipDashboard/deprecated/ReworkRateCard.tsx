/**
 * @deprecated Replaced by DonutChartCard (../cards/DonutChartCard.tsx).
 * ScrapRate and ReworkRate have been merged into a single generic DonutChartCard.
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import RatingChart from "../../../../../components/Ratechart";
import "./ReworkRateCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockReworkRateToday } from "../mockLotStatusData";

const defaultData = mockReworkRateToday[0] ?? { rework: 0, wip: 0 };

interface ReworkRateCardProps {
  headerText?: string;
  description?: string;
  rework?: number;
  wip?: number;
}

const ReworkRateCard: React.FC<ReworkRateCardProps> = ({
  headerText = "Rework Rate",
  description = "Monitor the percentage of reworked items",
  rework = defaultData.rework,
  wip = defaultData.wip,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = Math.random() * 800;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  const getTooltipContent = (value: number, name: string) => {
    if (name === "Total WIP Items" && !wip) return "No WIP items";
    return name === "Rework" ? `${rework}%` : `Count: ${wip}`;
  };

  return (
    <CustomCard
      headerText={headerText}
      description={description}
      className="additionalCard1 div5"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <RatingChart
          ratingValue={[rework, wip]}
          filledColor="#0088FE"
          legendNames={["Rework", "Total WIP Items"]}
          tooltipContent={getTooltipContent}
          displayValue={`${rework}%`}
        />
      )}
    </CustomCard>
  );
};

export default ReworkRateCard;
