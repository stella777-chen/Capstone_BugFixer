import React from "react";
import {
  Card,
  Text,
  Tag,
  Avatar,
  Caption1,
  Caption1Strong,
} from "@fluentui/react-components";
import {
  ClockRegular,
  CalendarLtrRegular,
} from "@fluentui/react-icons";

import "./CantierCardView.scss";
import { Stack } from "@fluentui/react";

interface Technician {
  name: string;
  role: string;
  initials: string;
}

interface Equipment {
  id: string;
}

export interface WorkOrder {
  id: string;
  priority: "High" | "Medium" | "Low";
  status: "In Progress" | "Not Started";
  frequency: "Weekly" | "Monthly";
  description: string;
  technician: Technician;
  equipment: Equipment;
  time: string;
  date: string;
}

const getPriorityColor = (priority: WorkOrder["priority"]) => {
  switch (priority) {
    case "High":
      return "danger";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
  }
};

const WorkOrderCard: React.FC<{ data: WorkOrder }> = ({ data }) => {
  return (
    <Stack className="col-4">
      <Card appearance="outline" className="work-order-card">
        <div className="card-header">
          <Text weight="semibold" size={400}>
            {data.id}
          </Text>
          <span color={getPriorityColor(data.priority)}>{data.priority}</span>
        </div>

        <Text size={300} className="description">
          {data.description}
        </Text>

        <div className="tags">
          <span className="cardPrimaryBtn">{data.status}</span>
          <span className="cardPrimaryBtn">{data.frequency}</span>
        </div>
        <Stack className="card-details-part">
          <div className="">
            <label>Technician</label>
            <div className="avatar-panal-wrapper">
              <Avatar name={data.technician.name} />
              <div className="avatar-panal-info">
                <Caption1Strong>{data.technician.name}</Caption1Strong>
                <Caption1>{data.technician.role}</Caption1>
              </div>
            </div>
          </div>

          {/* <div className="time-equipment">
            <label>Time</label>
            <div className="time">  
              <span className="time_part">{data.time}</span>
              <span>{data.date}</span>
            </div>
          </div> */}
          <div className="">
             <label>Time</label>
            <div className="avatar-panal-wrapper">
              {/* <Avatar name={data.technician.name} /> */}
              <div className="avatar-panal-info">
                <span className="time_part">{data.time}</span>
              <span>{data.date}</span>
              </div>
            </div>
          </div>
          <div className="">
            <label>Equipment</label>
            <div className="avatar-panal-wrapper">
              <Avatar name={data.technician.name} />
              <div className="avatar-panal-info">
                <Caption1Strong>{data.equipment.id}</Caption1Strong>
                <Caption1>{data.technician.role}</Caption1>
              </div>
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
};

export default WorkOrderCard;
