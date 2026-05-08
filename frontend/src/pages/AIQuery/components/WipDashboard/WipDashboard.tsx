import React, { useEffect } from "react";
import { makeStyles } from "@fluentui/react-components";
import DashboardCards from "./cards/DataTableCard";
import DonutChartCard from "./cards/DonutChartCard";
import LineChartCard from "./cards/LineChartCard";
import PieChartCard from "./cards/PieChartCard";
import BarChartCard from "./cards/BarChartCard";
import ComboChartCard from "./cards/ComboChartCard";
import { useWIPAppDispatch } from "src/hooks";
import { getAllWIPProductionStatus } from "./services/WipDashboardServices";
import {
  mockScrapRate7Days,
  mockReworkRateToday,
  mockYieldSummaryToday,
  mockLotStatusData,
  mockWipAgingData,
  mockDefectRateToday,
} from "./mockLotStatusData";
import type { IWIPLotStatusResponse } from "./type/type.WIPProductionStatus";

const processLotStatus = (lotData: IWIPLotStatusResponse[]) => {
  const statusMap = new Map<string, number>();
  lotData.forEach((item) => {
    statusMap.set(item.status, (statusMap.get(item.status) || 0) + item.lotCount);
  });
  return [
    { legend: "Not Started", data: statusMap.get("NotStarted") || 0,     color: "#d0e3fa" },
    { legend: "WIP",         data: statusMap.get("WorkInProcess") || 0,  color: "#62abf5" },
    { legend: "Finished",    data: statusMap.get("Finished") || 0,       color: "#2886de" },
    { legend: "Hold",        data: statusMap.get("Hold") || 0,           color: "#a0c4ff" },
    { legend: "Cancelled",   data: statusMap.get("Cancelled") || 0,      color: "#ff9999" },
  ];
};

const defaultScrap   = mockScrapRate7Days[0]   ?? { scrap: 0, wipCount: 0 };
const defaultRework  = mockReworkRateToday[0]  ?? { rework: 0, wip: 0 };
const defaultYield   = mockYieldSummaryToday.map(item => ({ name: item.productionLineCode, yield: Number(item.totalYield) }));
const defaultLotStatus = processLotStatus(mockLotStatusData);
const defaultAging   = mockWipAgingData.map(item => ({ name: item.agingBucket, value: item.lotCount }));
const defaultDefects = mockDefectRateToday.map(item => ({ name: item.defectCode, barValue: item.defectCount, lineValue: item.totalDefectPercentage }));

const useStyles = makeStyles({
  dashboardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingLeft: "2.5vh",
    paddingRight: "2.5vh",
    columnGap: "2.5vh",
//      marginTop: "2vh"
  },
});

const Dashboard = () => {
  const dispatch = useWIPAppDispatch();

  const classes = useStyles();
  useEffect(() => {
    console.log("Fetching WIP Production Status..."); // Add logging
    const fetchData = async () => {
      try {
        await dispatch(getAllWIPProductionStatus());
      } catch (error) {
        console.error("Error fetching WIP data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div>
        <DashboardCards />
        <div className="row main-dashboard-cointainer">
          <div className="col-4">
            <PieChartCard chartData={defaultLotStatus} />
          </div>
          <div className="col-4">
            <BarChartCard chartData={defaultAging} />
          </div>
          <div className="col-4">
            <DonutChartCard
              headerText="Scrap Rate"
              description="Track the percentage of scrapped WIP items"
              rate={defaultScrap.scrap}
              count={defaultScrap.wipCount}
              filledColor="#D32F2F"
              legendNames={["Scrap Rate", "WIP Count"]}
              className="firstCard"
            />
          </div>
          <div className="col-4">
            <LineChartCard chartData={defaultYield} />
          </div>
          <div className="col-4">
            <DonutChartCard
              headerText="Rework Rate"
              description="Monitor the percentage of reworked items"
              rate={defaultRework.rework}
              count={defaultRework.wip}
              filledColor="#0088FE"
              legendNames={["Rework", "Total WIP Items"]}
              className="additionalCard1 div5"
            />
          </div>
          <div className="col-4">
            <ComboChartCard chartData={defaultDefects} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
