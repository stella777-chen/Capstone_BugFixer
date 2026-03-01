import React, { useState, useEffect } from "react";
import CustomCard from "../../../components/CantierCustomCard/CustomCard";
import CustomBarChart from "../../../components/CustomBarChart";
import "./WIPAgingCard.css";
import { useWIPAppDispatch, useWIPAppSelector } from "src/hooks";
import { getWipAgingBucket } from "../services/WipDashboardServices";
import { WipAgingSelector } from "../slices/WipDashboardSlices";
import type { WipAgingFilterType } from "../type/type.WIPProductionStatus";
import CantierSpinner from "src/components/CantierSpinner/CantierSpinner";
import { mockWipAgingData } from "../mockLotStatusData";


const WIPAgingCard: React.FC = () => {
  const [selectedTab] = useState<WipAgingFilterType>("InProgress");
  const dispatch = useWIPAppDispatch();
  const { data, isLoading, error } = useWIPAppSelector(WipAgingSelector);

  useEffect(() => {
    dispatch(getWipAgingBucket(selectedTab));
  }, [dispatch, selectedTab]);
 
const resolvedData = data?.length ? data : mockWipAgingData;

const chartData = resolvedData.map(item => ({
  name: item.agingBucket,
  value: item.lotCount,
}));
 
  return (
    <CustomCard
      headerText="WIP Aging"
      description="Track WIP aging to monitor progress"
      tabItems={["InProgress"]}
      selectedTab={selectedTab}
      onTabChange={() => {}} // No tab change needed since we only have one tab
      className="anotherCard"
    >
      {isLoading ? (
        <div ><CantierSpinner className="spin_overlay_chart"/></div>
      ) : (
        <CustomBarChart data={chartData} legendName="WIP Items" />
      )}
    </CustomCard>
  );
};

export default WIPAgingCard;