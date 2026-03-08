import React from "react";
import { useEffect } from "react";
import {
  CheckmarkCircleWarningRegular,
  ClipboardSettingsRegular,
  ClipboardTaskRegular,
  DismissSquareMultipleRegular,
} from "@fluentui/react-icons";
import { ProductionStatusSelector } from "./slices/WipDashboardSlices";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getAllWIPProductionStatus } from "./services/WipDashboardServices";
import CantierSecondaryCard from "src/components/CantierSecondaryCard/CantierSecondaryCard";

const DashboardCards = () => {
  const { data } = useWIPAppSelector(ProductionStatusSelector);
  const productionData = data[0] || {
    PendingCount: 0,
    InProcessCount: 0,
    cancelledCount: 0,
    holdCount: 0,
  };

  return (
    <div className="row spaceBottom" >
      <div className="col-3">
        <CantierSecondaryCard
          
          icon={
            <CheckmarkCircleWarningRegular color="green"
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="Pending"
          subtitle="Awaiting Production Start"
          value={productionData.PendingCount}
          colorCode="green"
        />
      </div>
      <div className="col-3">
        <CantierSecondaryCard
         
          icon={
            <ClipboardSettingsRegular
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="In progress"
          subtitle="Production Currently running"
          value={productionData.InProcessCount}
          colorCode="red"
        />
      </div>
      <div className="col-3">
        <CantierSecondaryCard
          icon={
            <ClipboardTaskRegular
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="Cancelled"
          subtitle="Production Job Cancelled"
          value={productionData.cancelledCount}
          colorCode="blue"
        />
      </div>
      <div className="col-3">
        <CantierSecondaryCard
          icon={<DismissSquareMultipleRegular
            style={{ fontSize: "32px", width: "32px", height: "32px" }} />}
          title="Closed"
          subtitle="Production Completed"
          value={productionData.holdCount} 
          colorCode="yellow"          // backgroundColor="orange"
        />
      </div>
    </div>
  );
};

export default DashboardCards;
