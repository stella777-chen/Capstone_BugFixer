import React, { useEffect, useState } from "react";
import CustomCard from "../../../../../components/CantierCustomCard/CustomCard";
import RatingChart from "../../../../../components/Ratechart";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import "./cards.css";

interface DonutChartCardProps {
  headerText?: string;
  description?: string;
  rate?: number;
  count?: number;
  totalValue?: number;
  filledColor?: string;
  backgroundColor?: string;
  legendNames?: [string, string];
  className?: string;
  maxLoadingTime?: number;
}

const DonutChartCard: React.FC<DonutChartCardProps> = ({
  headerText = "Rate",
  description = "",
  rate = 0,
  count = 0,
  totalValue = 100,
  filledColor = "#D32F2F",
  backgroundColor = "#D3D3D3",
  legendNames = ["Rate", "Count"],
  className = "",
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
      className={className}
    >
      {isLoading ? (
        <div><CantierSpinner className="spin_overlay_chart" /></div>
      ) : (
        <RatingChart
          ratingValue={[rate, count]}
          filledColor={filledColor}
          backgroundColor={backgroundColor}
          totalValue={totalValue}
          legendNames={legendNames}
          tooltipContent={(value, name) =>
            name === legendNames[0] ? `${rate}%` : `Count: ${count}`
          }
          displayValue={`${rate}%`}
        />
      )}
    </CustomCard>
  );
};

export default DonutChartCard;
