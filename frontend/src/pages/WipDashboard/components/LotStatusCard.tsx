
import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import CustomPieChart from "../../../components/CustomPieChart";
import "./LotStatusCard.css";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getWIPLotStatus } from "../services/WipDashboardServices";
import { LotStatusSelector } from "../slices/WipDashboardSlices";
import type { IWIPLotStatusResponse } from "../type/type.WIPProductionStatus";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockLotStatusData } from "../mockLotStatusData";

const LotStatusCard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("Today");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(LotStatusSelector);
  console.info("LotStatusCard Rendered with selectedTab:", data);
  useEffect(() => {
    const filter =
      selectedTab === "Today"
        ? "today"
        : selectedTab === "Weeks"
        ? "weeks"
        : "months";
    dispatch(getWIPLotStatus(filter));
  }, [dispatch, selectedTab]);

  const processChartData = (lotData: IWIPLotStatusResponse[]) => {
    if (!lotData?.length) return [];

    const statusMap = new Map<string, number>();
    lotData.forEach((item) => {
      statusMap.set(
        item.status,
        (statusMap.get(item.status) || 0) + item.lotCount
      );
    });

    return [
      {
        legend: "Not Started",
        data: statusMap.get("NotStarted") || 0,
        color: "#d0e3fa",
      },
      {
        legend: "WIP",
        data: statusMap.get("WorkInProcess") || 0,
        color: "#62abf5",
      },
      {
        legend: "Finished",
        data: statusMap.get("Finished") || 0,
        color: "#2886de",
      },
      { legend: "Hold", data: statusMap.get("Hold") || 0, color: "#a0c4ff" },
      {
        legend: "Cancelled",
        data: statusMap.get("Cancelled") || 0,
        color: "#ff9999",
      },
    ];
  };

  const renderContent = () => {
    if (isLoading) {
      return <div ><CantierSpinner className="spin_overlay_chart"/></div>
    }

    // if (error) {
    //   return <div className="errorContainer">{error}</div>;
    // }

    // if (!data?.length) {
    //   return <div className="errorContainer">No data available</div>;
    // }
   const chartSource = data?.length ? data : mockLotStatusData;
    return <CustomPieChart chartTitle=""  chartData={processChartData(chartSource)} />;
  };

  return (
    <CustomCard
      headerText="Lot Status"
      description="Track real-time status of lots"
      tabItems={["Today", "Weeks", "Months"]}
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      className="singleCard"
    >
      {renderContent()}
    </CustomCard>
  );
};

export default LotStatusCard;