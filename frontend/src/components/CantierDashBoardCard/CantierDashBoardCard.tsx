import React from 'react';
import { 
  Stack, 
  Text, 
  StackItem, 
  TooltipHost,
  IStackTokens 
} from '@fluentui/react';
import './CantierDashBoardCard.scss';
interface DashboardItem {
  label: string;
  amount: string | number;
  icon?: React.ReactNode;
  colorCode?: 'red' | 'blue' | 'green' | 'orange';
}

interface MesDashboardProps {
  dashboardItems: DashboardItem[];
  hasIcon?: boolean;
  hasOption?: boolean;
}

const CantierDashBoardCard: React.FC<MesDashboardProps> = ({
  hasIcon = true,
  hasOption = true,
  dashboardItems = []
}) => {
  const getColorVariable = (colorCode?: string) => {
    const colorMap = {
      red: "#a61a31",
      blue: "#3062c5",
      green: "#3c8646",
      orange: "#ff8f00"
    };
    return colorMap[colorCode as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <Stack horizontal className="custom-dashboard-box row">
      {dashboardItems?.map((item, index) => (
        <Stack 
          horizontal 
          className="custom-style-box-container" 
          key={index}
        >
          {hasIcon && (
            <StackItem>
              <div 
                className="custom-dashboard-icon"
                style={{ 
                  '--cardColor': getColorVariable(item.colorCode)
                } as React.CSSProperties}
              >
                {item.icon}
              </div>
            </StackItem>
          )}
          <StackItem>
            <Stack verticalAlign="start" verticalFill className="card-text-wrapper">
              <TooltipHost content={item.label}>
                <Text className="custom-dashboard-label-value truncate-text">
                  {item.label}
                </Text>
              </TooltipHost>
              <Text className="dashboard-number-value">
                {item.amount}
              </Text>
            </Stack>
          </StackItem>
        </Stack>
      ))}
    </Stack>
  );
};
export default CantierDashBoardCard;