import React from "react";
import {
  Card,
  CardHeader,
  Button,
  Caption1,
  Text,
  TabList,
  Tab,
} from "@fluentui/react-components";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";

interface CustomCardProps {
  headerText: string;
  description: string;
  children: React.ReactNode;
  tabItems: string[];
  selectedTab: string;
  style?: React.CSSProperties;
  onTabChange: (tabValue: string) => void;
  className?: string;
  customHeaderClassName?: string;
  
}

const CustomCard: React.FC<CustomCardProps> = ({
  headerText,
  description,
  children,
  tabItems,
  selectedTab,
  onTabChange,
  className,
  customHeaderClassName,
}) => {
  return (
    <Card className={`custom-card ${className}`}>
      <CardHeader
        header={
          <Text
            className={customHeaderClassName}
            style={{
              fontFamily: "'Segoe UI', sans-serif",
              fontWeight: "bold",
              fontSize: "1.6vh",
              color: "#242424",
            }}
          >
            {headerText}
          </Text>
        }
        description={
          <Text
            style={{
              fontFamily: "'Segoe UI', sans-serif",
              color: "#616161",
              fontSize: "1.4vh",
            }}
          >
            {description}
          </Text>
        }
        action={
          <Button
            appearance="transparent"
            icon={<MoreHorizontal20Regular />}
            aria-label="More options"
          />
        }
      />
    <TabList
  selectedValue={selectedTab}
  onTabSelect={(_, data) => onTabChange(data.value as string)}
  className="custom-tablist"
>
  {tabItems.map((tab) => (
    <Tab
      key={tab}
      value={tab}
      className="custom-tab"
    >
      {tab}
    </Tab>
  ))}
</TabList>
      {children}
    </Card>
  );
};

export default CustomCard;