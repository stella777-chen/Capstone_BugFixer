import React from 'react';
import "../../assets/styles/inputForm.css"
import { 
  Stack, 
  Text, 
  StackItem, 
  TooltipHost, 
  IStackStyles, 
  IStackTokens 
} from '@fluentui/react';
import MesTab from "./MesTab";

interface DashboardItem {
  label: string;
  amount: string | number;
  icon?: React.ReactNode;
  dashboardIconClassName?: string;
}

interface MesDashboardProps {
  classNameLabel?: string;
  classNameAmount?: string;
  dashboardIconClassName?: string;
  classNameDashboard?: string;
  classNameStack?: string;
  onTabChange?: (newValue: number) => void;
  activeTab?: number;
  Spacing?: number;
  hasIcon?: boolean;
  hasOption?: boolean;
  dashboardItems?: DashboardItem[];
  dashboardRoutes?: string[];
}

export default function MesDashboard({
  classNameLabel = 'custom-dashboard-label-value',
  classNameAmount = 'dashboard-number-value',
  dashboardIconClassName = 'custom-paper-icon-size',
  classNameDashboard = 'custom-dashboard-box',
  classNameStack = 'custom-style-box-container',
  onTabChange,
  activeTab,
  Spacing = 0,
  hasIcon = true,
  hasOption = true,
  dashboardItems = [],
  dashboardRoutes = ["Sample 1", "Sample 2"]
}: MesDashboardProps) {

  const itemSpacingTokens: IStackTokens = {
    childrenGap: Spacing
  };

  const stackStyles: IStackStyles = {
    root: {
      display: 'flex',
      flexDirection: 'row'
    }
  };

  return (
    <Stack horizontal className={classNameDashboard} styles={stackStyles}>
      {dashboardItems !== undefined && dashboardItems.length !== 0 ?
        dashboardItems.map((item, index) => {
          return (
            <Stack 
              horizontal 
              className={classNameStack} 
              key={index} 
              tokens={itemSpacingTokens}
            >
              {hasIcon ? (
                <StackItem>
                  <div className={item.dashboardIconClassName}>{item.icon}</div>
                </StackItem>
              ) : null}
              <StackItem>
                <Stack verticalAlign="start" verticalFill className='card_txt_wrapper'>
                  <TooltipHost content={item.label}>
                    <Text 
                      className={classNameLabel} 
                      styles={{
                        root: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          // maxWidth: '120px',
                          maxWidth: '6.25vw',
                        }
                      }}
                    >
                      {item.label}
                    </Text>
                  </TooltipHost>
                  <Text className={classNameAmount}>
                    {item.amount}
                  </Text>
                </Stack>
              </StackItem>
            </Stack>
          );
        })
        : null
      }
      {!hasIcon &&
        <div style={{
          // width: 'auto',
          // marginBottom: '-120px',
          // padding: '20px',
           width: 'auto',
              marginBottom: '-11.11vh',
              padding: '1.04vw',
        }}>
          <MesTab
            value={activeTab}
            handleChange={(newValue) => onTabChange && onTabChange(newValue)}
            tabTitle={dashboardRoutes}
          />
        </div>
      }
    </Stack>
  );
}