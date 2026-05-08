/**
 * @deprecated Replaced by DonutChartCard (../cards/DonutChartCard.tsx).
 * ScrapRate and ReworkRate have been merged into a single generic DonutChartCard.
 * Mock data is now owned by WipDashboard.tsx and passed via props.
 * This file is kept for reference only — do not import it.
 */
import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import RatingChart from "../../../../../components/Ratechart";
import "./ScrapRateCard.css";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockScrapRate7Days } from "../mockLotStatusData";

const defaultData = mockScrapRate7Days[0] ?? { scrap: 0, wipCount: 0 };

interface ScrapRateCardProps {
  headerText?: string;
  description?: string;
  scrap?: number;
  wipCount?: number;
}

const ScrapRateCard: React.FC<ScrapRateCardProps> = ({
  headerText = "Scrap Rate",
  description = "Track the percentage of scrapped WIP items",
  scrap = defaultData.scrap,
  wipCount = defaultData.wipCount,
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
      className="firstCard"
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <RatingChart
          ratingValue={[scrap, wipCount]}
          filledColor="#D32F2F"
          legendNames={["Scrap Rate", "WIP Count"]}
          tooltipContent={(value, name) =>
            name === "Scrap Rate" ? `${scrap}%` : `Count: ${wipCount}`
          }
          displayValue={`${scrap}%`}
        />
      )}
    </CustomCard>
  );
};

export default ScrapRateCard;

