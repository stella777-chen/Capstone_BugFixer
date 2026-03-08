import React from "react";
import { Text } from "@fluentui/react-components";
import MesDashboard from "src/components/DashboardComponents/MesDashboard";

interface DashboardItem {
  icon: React.ReactNode;
  label: string;
  amount: number;
  dashboardIconClassName?: string;
}

interface HeaderProps {
  icon: React.ReactNode;
  caption: string;
  title: string;
  dashboardItems?: DashboardItem[];
}

const Header: React.FC<HeaderProps> = ({ icon, caption, title, dashboardItems }) => {
  return (
    <div style={{ backgroundColor: "white", height: "140px", display: "flex", alignItems: "center" }}>
      {/* LEFT SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px", width: "32vw" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "1.25vw" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#d9e3f0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon}
          </div>
          <div>
            <Text style={{ fontSize: "20px", color: "#000000" }}>{caption}</Text>
            <div style={{ fontWeight: 600, fontSize: "32px", marginTop: "8px" }}>{title}</div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ width: "100%" }}>
        <MesDashboard dashboardItems={dashboardItems} />
      </div>
    </div>
  );
};

export default Header;
