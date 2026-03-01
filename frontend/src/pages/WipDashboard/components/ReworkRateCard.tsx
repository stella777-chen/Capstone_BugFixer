import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import RatingChart from "../../../components/Ratecharttwo";
import "./ReworkRateCard.css";  // Import external CSS file
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getWipReworkRate } from "../services/WipDashboardServices";
import { ReworkRateSelector } from "../slices/WipDashboardSlices";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockReworkRate30Days, mockReworkRate7Days, mockReworkRateToday } from "../mockLotStatusData";

const ReworkRateCard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Today");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(ReworkRateSelector);

  useEffect(() => {
    const filter = selectedTab === "Today" ? "today" : 
                  selectedTab === "7 days" ? "7days" : "30days";
    dispatch(getWipReworkRate(filter));
  }, [dispatch, selectedTab]);

  const resolvedData =
  data?.length
    ? data
    : selectedTab === "Today"
    ? mockReworkRateToday
    : selectedTab === "7 days"
    ? mockReworkRate7Days
    : mockReworkRate30Days;

const reworkData = resolvedData[0] || { rework: 0, wip: 0 };
  
  // Calculate the percentages for display
  const reworkPercentage = reworkData.rework;
  const wipPercentage = reworkData.wip > 0 ? 100 : 0; // Only show 100% if we have WIP data

  const getTooltipContent = (value: number, name: string) => {
    if (name === "Total WIP Items" && !reworkData.wip) {
      return "No WIP items";
    }
    return `${name}: ${value}%`;
  };

  return (
    <CustomCard
      headerText="Rework Rate"
      description="Monitor the percentage of reworked items"
      tabItems={["Today", "7 days", "30 days"]}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      className="additionalCard1 div5"
    >
      {isLoading ? (
        <div ><CantierSpinner className="spin_overlay_chart"/></div>
      ) : (
        <RatingChart
          ratingValue={reworkPercentage}
          filledColor="#0088FE"
          legendNames={["Rework", "Total WIP Items"]}
          chartTitle=""
          tooltipContent={getTooltipContent}
          displayValue={`${reworkPercentage}%`}
          totalValue={wipPercentage} // Add this prop if RatingChart accepts it
        />
      )}
    </CustomCard>
  );
};

export default ReworkRateCard;
