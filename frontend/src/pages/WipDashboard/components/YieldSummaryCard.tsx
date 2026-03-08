import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import LineChartComponent from "../../../components/LineChartComponent";
import "./YieldSummaryCard.css";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getWipYieldSummary } from "../services/WipDashboardServices";
import { YieldSummarySelector } from "../slices/WipDashboardSlices";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockYieldSummaryMonths, mockYieldSummaryToday, mockYieldSummaryWeeks } from "../mockLotStatusData";

const YieldSummaryCard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Today");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(YieldSummarySelector);

  useEffect(() => {
    const filter = selectedTab === "Today" ? "today" : 
                  selectedTab === "Weeks" ? "weeks" : "months";
    dispatch(getWipYieldSummary(filter));
  }, [dispatch, selectedTab]);


  const resolvedData =
  data?.length
    ? data
    : selectedTab === "Today"
    ? mockYieldSummaryToday
    : selectedTab === "Weeks"
    ? mockYieldSummaryWeeks
    : mockYieldSummaryMonths;

const chartData = resolvedData.map(item => ({
  name: item.productionLineCode,
  yield: Number(item.totalYield),
}));
  return (
    <CustomCard
      headerText="Yield Summary"
      description="Yield % trends over time"
      tabItems={["Today", "Weeks", "Months"]}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      className="additionalCard"
    >
      {isLoading ? (
         <div ><CantierSpinner className="spin_overlay_chart"/></div>
      )  : (
        <LineChartComponent data={chartData} />
      )}
    </CustomCard>
  );
};

export default YieldSummaryCard;