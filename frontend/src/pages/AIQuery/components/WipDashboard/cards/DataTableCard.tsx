import React, { useEffect } from "react";
import {
  CheckmarkCircleWarningRegular,
  ClipboardSettingsRegular,
  ClipboardTaskRegular,
  DismissSquareMultipleRegular,
} from "@fluentui/react-icons";
import { ProductionStatusSelector } from "../slices/WipDashboardSlices";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getAllWIPProductionStatus } from "../services/WipDashboardServices";
import CantierSecondaryCard from "src/components/CantierSecondaryCard/CantierSecondaryCard";
import "./cards.css";

interface DataTableValues {
  pending: number;
  inProgress: number;
  cancelled: number;
  closed: number;
}

interface DataTableCardProps {
  values?: Partial<DataTableValues>;
}

const DataTableCard: React.FC<DataTableCardProps> = ({ values }) => {
  const dispatch = useWIPAppDispatch();
  const { data } = useWIPAppSelector(ProductionStatusSelector);
  const productionData = data[0] || {
    PendingCount: 0,
    InProcessCount: 0,
    cancelledCount: 0,
    holdCount: 0,
  };

  useEffect(() => {
    if (!values) {
      dispatch(getAllWIPProductionStatus());
    }
  }, [dispatch, values]);

  const resolvedValues: DataTableValues = {
    pending: values?.pending ?? productionData.PendingCount ?? 0,
    inProgress: values?.inProgress ?? productionData.InProcessCount ?? 0,
    cancelled: values?.cancelled ?? productionData.cancelledCount ?? 0,
    closed: values?.closed ?? productionData.holdCount ?? 0,
  };

  return (
    <div className="data-table-grid-root">
        <CantierSecondaryCard
          icon={
            <CheckmarkCircleWarningRegular
              color="green"
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="Pending"
          subtitle="Awaiting Production Start"
          value={resolvedValues.pending}
          colorCode="green"
        />
        <CantierSecondaryCard
          icon={
            <ClipboardSettingsRegular
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="In progress"
          subtitle="Production Currently running"
          value={resolvedValues.inProgress}
          colorCode="red"
        />
        <CantierSecondaryCard
          icon={
            <ClipboardTaskRegular
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="Cancelled"
          subtitle="Production Job Cancelled"
          value={resolvedValues.cancelled}
          colorCode="blue"
        />
        <CantierSecondaryCard
          icon={
            <DismissSquareMultipleRegular
              style={{ fontSize: "32px", width: "32px", height: "32px" }}
            />
          }
          title="Closed"
          subtitle="Production Completed"
          value={resolvedValues.closed}
          colorCode="yellow"
        />
      </div>
  );
};

export default DataTableCard;
