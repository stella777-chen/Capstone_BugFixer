import React from "react";
import "./Configurations.scss";
import { Provider } from "react-redux";
import { wipStore } from "src/pages/AIQuery/components/WipDashboard/store/store";

// ── Deprecated imports (replaced by chart-type-named cards below) ────────────
// import ScrapRateCard from "./WipDashboard/cards/ScrapRateCard";
// import YieldSummaryCard from "./WipDashboard/cards/YieldSummaryCard";
// import ReworkRateCard from "./WipDashboard/cards/ReworkRateCard";
// import DefectsCard from "./WipDashboard/cards/DefectsCard";
// import LotStatusCard from "./WipDashboard/cards/LotStatusCard";
// import WIPAgingCard from "./WipDashboard/cards/WIPAgingCard";
// ────────────────────────────────────────────────────────────────────────────

import DonutChartCard from "./WipDashboard/cards/DonutChartCard";
import LineChartCard from "./WipDashboard/cards/LineChartCard";
import PieChartCard from "./WipDashboard/cards/PieChartCard";
import BarChartCard from "./WipDashboard/cards/BarChartCard";
import ComboChartCard from "./WipDashboard/cards/ComboChartCard";
import DataTableCard from "./WipDashboard/cards/DataTableCard";
import { getPreviewCardProps } from "./previewDataProcessing";

// ── Deprecated CardType values ───────────────────────────────────────────────
// | "ScrapRate"    → "ScrapRateDonut"   (DonutChartCard)
// | "ReworkRate"   → "ReworkRateDonut"  (DonutChartCard)
// | "YieldSummary" → "LineChart"        (LineChartCard)
// | "LotStatus"    → "PieChart"         (PieChartCard)
// | "WIPAging"     → "BarChart"         (BarChartCard)
// | "Defects"      → "ComboChart"       (ComboChartCard)
// ────────────────────────────────────────────────────────────────────────────
export type CardType =
  | "ScrapRateDonut"
  | "ReworkRateDonut"
  | "LineChart"
  | "PieChart"
  | "BarChart"
  | "ComboChart"
  | "DataTable";

export type CardLayoutItem = {
  cardType: CardType;
  props?: Record<string, unknown>;
};

type CardLayoutProps = {
  items: CardLayoutItem[];
  layoutDescription?: string;
};

// ── Deprecated CARD_MAP entries ──────────────────────────────────────────────
// ScrapRate:    ScrapRateCard,
// YieldSummary: YieldSummaryCard,
// ReworkRate:   ReworkRateCard,
// Defects:      DefectsCard,
// LotStatus:    LotStatusCard,
// WIPAging:     WIPAgingCard,
// ────────────────────────────────────────────────────────────────────────────
const CARD_MAP: Record<CardType, React.ComponentType<any>> = {
  ScrapRateDonut:  DonutChartCard,
  ReworkRateDonut: DonutChartCard,
  LineChart:       LineChartCard,
  PieChart:        PieChartCard,
  BarChart:        BarChartCard,
  ComboChart:      ComboChartCard,
  DataTable:       DataTableCard,
};

const CardLayout: React.FC<CardLayoutProps> = ({ items, layoutDescription }) => {
  if (!items.length) return null;

  if (items.length === 1) {
    const item = items[0];
    const Card = CARD_MAP[item.cardType];
    const cardProps = {
      ...getPreviewCardProps(item.cardType),
      ...(item.props ?? {}),
    };
    if (!Card) return null;

    return (
      <div className="card-layout-root">
        <div className="card-root">
          <Provider store={wipStore}>
            <Card {...cardProps} />
          </Provider>
        </div>
        {layoutDescription && <p className="card-description">{layoutDescription}</p>}
      </div>
    );
  }

  const columnClass = items.length >= 3 ? "card-module-grid--3" : "card-module-grid--2";
  const layoutClass = items.length > 3 ? "card-module-scroll" : `card-module-grid ${columnClass}`;

  return (
    <div className="card-layout-root">
      <div className={layoutClass}>
        <Provider store={wipStore}>
          {items.map((item, index) => {
            const Card = CARD_MAP[item.cardType];
            const cardProps = {
              ...getPreviewCardProps(item.cardType),
              ...(item.props ?? {}),
            };
            if (!Card) return null;

            return (
              <div className="card-module-item" key={`${item.cardType}-${index}`}>
                <Card {...cardProps} />
              </div>
            );
          })}
        </Provider>
      </div>
      {layoutDescription && <p className="card-description">{layoutDescription}</p>}
    </div>
  );
};

export default CardLayout;
