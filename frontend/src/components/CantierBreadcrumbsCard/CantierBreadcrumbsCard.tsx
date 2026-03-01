import React from "react";
import { Text, Card, CardHeader, Caption1, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  card: {
    width: "360px",
    maxWidth: "100%",
    height: "fit-content",
    margin: "1%",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: tokens.shadow4,
    transition: "all 0.3s ease-in-out",
    // Media Queries for responsiveness
    "@media (max-width: 1024px)": {
      width: "30vw", // Tablets
    },
    "@media (max-width: 768px)": {
      width: "60vw", // Mobile Landscape
    },
    "@media (max-width: 480px)": {
      width: "90vw", // Small Phones
    },
  },
  headerImage: {
    maxWidth: "4.4vh",
    maxHeight: "4.4vh",
    borderRadius: "4px",
  },
  headerText: {
    fontWeight: "bold",
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  content: {
    padding: "0 16px 16px",
    margin: 0,
  }
});

export interface CantierCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  content: string;
}

const CantierBreadcrumbsCard: React.FC<CantierCardProps> = (props) => {
  const { icon, title, subtitle, content } = props;
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        image={
          icon ? (
            <div className={styles.headerImage}>
              {icon}
            </div>
          ) : null
        }
        header={
          <Text weight="semibold" className={styles.headerText}>
            {title}
          </Text>
        }
        description={
          <Caption1 className={styles.caption}>
            {subtitle}
          </Caption1>
        }
      />
      <p className={styles.content}>{content}</p>
    </Card>
  );
};

export default CantierBreadcrumbsCard;