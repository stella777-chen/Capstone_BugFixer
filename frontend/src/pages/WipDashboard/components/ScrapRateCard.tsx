import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import RatingChart from "../../../components/Ratechart";
import "./ScrapRateCard.css";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getScrapRate } from "../services/WipDashboardServices";
import { ScrapRateSelector } from "../slices/WipDashboardSlices";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockScrapRate30Days, mockScrapRate7Days, mockScrapRate90Days } from "../mockLotStatusData";

const ScrapRateCard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("7 days");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(ScrapRateSelector);
  useEffect(() => {
    const filter = selectedTab === "7 days" ? "7days" : 
                  selectedTab === "30 days" ? "30days" : "90days";
    dispatch(getScrapRate(filter));
  }, [dispatch, selectedTab]);

  const renderContent = () => {
    if (isLoading) {
      return <div ><CantierSpinner className="spin_overlay_chart"/></div>
    }

    // if (error) {
    //   return <div className="errorContainer">Error: {error}</div>;
    // }

     const mockData =
    selectedTab === "7 days"
      ? mockScrapRate7Days
      : selectedTab === "30 days"
      ? mockScrapRate30Days   
      : mockScrapRate90Days;

  const sourceData = data?.length ? data : mockData;

  const scrapRate = sourceData[0]?.scrap || 0;
  const wipCount = sourceData[0]?.wipCount || 0;

    return (
      <RatingChart
        ratingValue={[scrapRate]}
        filledColor="#D32F2F"
        legendNames={["Scrap Rate", "WIP Count"]}
        chartTitle=""
        tooltipContent={(value, name) => 
          name === "Scrap Rate" ? `${scrapRate}%` : `Count: ${wipCount}`
        }
        displayValue={`${scrapRate}%`}
      />
    );
  };

  return (
    <CustomCard
      headerText="Scrap Rate"
      description="Track the percentage of scrapped WIP items"
      tabItems={["7 days", "30 days", "90 days"]}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      className="firstCard"
    >
      {renderContent()}
    </CustomCard>
  );
};

export default ScrapRateCard;