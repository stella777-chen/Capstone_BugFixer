import * as React from "react";
import {
  makeStyles,
  Caption1,
  Text,
  tokens,
} from "@fluentui/react-components";
import { Card } from "@fluentui/react-components";

const useStyles = makeStyles({
  horizontalCard: {
    width: "100%",
    maxWidth: "400px",
    height: "80px",
    // marginBottom: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    "&:hover": {
      boxShadow: tokens.shadow8,
    },
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  iconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "20px",
    margin: 0,
  },
  subtitle: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    lineHeight: "16px",
    margin: 0,
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "60px",
  },
  amount: {
    fontSize: "24px",
    fontWeight: "700",
    color: tokens.colorNeutralForeground1,
    textAlign: "center",
  },
});

interface HorizontalCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  amount?: number;
  iconClassName?: string;
  onClick?: () => void;
}

export const HorizontalCard: React.FC<HorizontalCardProps> = ({
  icon,
  title,
  subtitle,
  amount,
  iconClassName = "product-spec-dashboard-icon lotList",
  onClick,
}) => {
  const styles = useStyles();

  return (
    <Card 
      className={styles.horizontalCard}
      onClick={onClick}
    >
      {/* Left Section - Icon + Text */}
      <div className={styles.leftSection}>
        <div className={`${styles.iconContainer} ${iconClassName}`}>
          {icon}
        </div>
        <div className={styles.textContainer}>
          <Text className={styles.title}>{title}</Text>
          {subtitle && (
            <Caption1 className={styles.subtitle}>{subtitle}</Caption1>
          )}
        </div>
      </div>
      
      {/* Right Section - Amount */}
      <div className={styles.rightSection}>
        {amount !== undefined && (
          <Text className={styles.amount}>{amount}</Text>
        )}
      </div>
    </Card>
  );
};