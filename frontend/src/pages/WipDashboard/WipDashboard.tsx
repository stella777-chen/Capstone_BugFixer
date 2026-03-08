import React from "react";
import LotStatusCard from "./components/LotStatusCard";
import WIPAgingCard from "./components/WIPAgingCard";
import { makeStyles } from "@fluentui/react-components";
import ScrapRateCard from "./components/ScrapRateCard";
import YieldSummaryCard from "./components/YieldSummaryCard";
import ReworkRateCard from "./components/ReworkRateCard";
import DefectsCard from "./components/DefectsCard";
import DataTableCardComponent from "src/components/DataTableCardComponent/DataTableCardComponent";
import DashboardCards from "./DataTableCard";
import { useWIPAppDispatch } from "src/hooks";
import { useEffect } from "react";
import { getAllWIPProductionStatus } from "./services/WipDashboardServices";

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
            <LotStatusCard />
          </div>
          <div className="col-4">
            <WIPAgingCard />
          </div>
          <div className="col-4">
            <ScrapRateCard />
          </div>
          <div className="col-4">
            <YieldSummaryCard />
          </div>
          <div className="col-4">
            <ReworkRateCard />
          </div>
          <div className="col-4">
            <DefectsCard />
          </div >
        </div>
      </div>
    </>
  );
};

export default Dashboard;
