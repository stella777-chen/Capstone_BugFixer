import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import CombinedChart from "../../../components/Combinechart";
import "./DefectsCard.css";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getWipDefectRate } from "../services/WipDashboardServices";
import { DefectRateSelector } from "../slices/WipDashboardSlices";
import type { DefectRateFilterType } from "../type/type.WIPProductionStatus";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockDefectRate30Days, mockDefectRate7Days, mockDefectRateToday } from "../mockLotStatusData";

const DefectsCard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Today");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(DefectRateSelector);

  useEffect(() => {
    const filter = selectedTab === "Today" ? "today" : 
                  selectedTab === "7 Days" ? "7days" : "30days";
    dispatch(getWipDefectRate(filter));
  }, [dispatch, selectedTab]);

const resolvedData =
  data?.length
    ? data
    : selectedTab === "Today"
    ? mockDefectRateToday
    : selectedTab === "7 Days"
    ? mockDefectRate7Days
    : mockDefectRate30Days;

const chartData = React.useMemo(() => {
  if (!resolvedData?.length) return [];

  return resolvedData.map(item => ({
    name: item.defectCode,
    barValue: item.defectCount,
    lineValue: item.totalDefectPercentage,
  }));
}, [resolvedData]);

  return (
    <CustomCard
      headerText="Defects"
      description="Identify key defect sources"
      tabItems={["Today", "7 Days", "30 Days"]}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      className="additionalCard2"
    >
      {isLoading ? (
        <div ><CantierSpinner className="spin_overlay_chart"/></div>
      ) :  (
        <CombinedChart 
          data={chartData} 
          width="100%" 
          height="400px"
        />
      )}
    </CustomCard>
  );
};

export default DefectsCard;