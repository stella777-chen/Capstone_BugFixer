import React from "react";
import CardLayout, { CardLayoutItem, CardType } from "./components/CardLayout";

// ── Deprecated card type names (replaced by chart-type names below) ──────────
// "ScrapRate"    → "ScrapRateDonut"
// "ReworkRate"   → "ReworkRateDonut"
// "YieldSummary" → "LineChart"
// "LotStatus"    → "PieChart"
// "WIPAging"     → "BarChart"
// "Defects"      → "ComboChart"
// ────────────────────────────────────────────────────────────────────────────

const SINGLET_PREVIEWS: CardType[] = [
  "ScrapRateDonut",
  "ReworkRateDonut",
  "LineChart",
  "PieChart",
  "BarChart",
  "ComboChart",
  "DataTable",
];

const DOUBLET_PREVIEWS: Array<{ title: string; left: CardType; right: CardType }> = [
  { title: "Quality Snapshot",              left: "ScrapRateDonut",  right: "LineChart" },
  { title: "Risk Indicators",               left: "ComboChart",      right: "ReworkRateDonut" },
  { title: "Flow Health",                   left: "PieChart",        right: "BarChart" },
  { title: "Production Status + Throughput",left: "DataTable",       right: "LineChart" },
];

const TRIPLET_PREVIEWS: Array<{ title: string; first: CardType; second: CardType; third: CardType }> = [
  { title: "Quality + Throughput",  first: "ScrapRateDonut",  second: "LineChart",  third: "ReworkRateDonut" },
  { title: "Operations Health",     first: "PieChart",        second: "BarChart",   third: "ComboChart" },
  { title: "Production Overview",   first: "DataTable",       second: "PieChart",   third: "BarChart" },
];

const N_CARD_PREVIEW: CardType[] = [
  "ScrapRateDonut",
  "ReworkRateDonut",
  "LineChart",
  "PieChart",
  "BarChart",
  "ComboChart",
  "DataTable",
];

const TEST_CASES: Array<{
  title: string;
  items: CardLayoutItem[];
  layoutDescription: string;
}> = [
  {
    title: "Edge: Zero Baseline",
    items: [
      {
        cardType: "ScrapRateDonut",
        props: {
          headerText: "Scrap Rate (Zero)",
          description: "Edge case: no scrap and no WIP",
          rate: 0,
          count: 0,
          filledColor: "#9C27B0",
          backgroundColor: "#ECEFF1",
        },
      },
      {
        cardType: "DataTable",
        props: {
          values: {
            pending: 0,
            inProgress: 0,
            cancelled: 0,
            closed: 0,
          },
        },
      },
    ],
    layoutDescription: "Validates behavior when all values are zero.",
  },
  {
    title: "High-Volume Throughput",
    items: [
      {
        cardType: "BarChart",
        props: {
          barColor: "#E65100",
          chartData: [
            { name: "1-3", value: 210 },
            { name: "4-7", value: 240 },
            { name: "8-11", value: 160 },
            { name: "12-15", value: 190 },
            { name: "16-19", value: 230 },
          ],
        },
      },
      {
        cardType: "LineChart",
        props: {
          lineColor: "#2E7D32",
          chartData: [
            { name: "Line A", yield: 95 },
            { name: "Line B", yield: 92 },
            { name: "Line C", yield: 90 },
            { name: "Line D", yield: 97 },
            { name: "Line E", yield: 93 },
          ],
        },
      },
      {
        cardType: "ComboChart",
        props: {
          barColor: "#6A1B9A",
          lineColor: "#00838F",
          chartData: [
            { name: "Scratch", barValue: 24, lineValue: 7.4 },
            { name: "Crack", barValue: 18, lineValue: 6.1 },
            { name: "Discolor", barValue: 12, lineValue: 4.2 },
            { name: "Burr", barValue: 9, lineValue: 2.8 },
          ],
        },
      },
    ],
    layoutDescription: "Stress test with high counts and custom palette.",
  },
  {
    title: "Distribution Shift",
    items: [
      {
        cardType: "PieChart",
        props: {
          chartData: [
            { legend: "Not Started", data: 3, color: "#FFE082" },
            { legend: "WIP", data: 35, color: "#42A5F5" },
            { legend: "Finished", data: 52, color: "#66BB6A" },
            { legend: "Hold", data: 7, color: "#EF5350" },
            { legend: "Cancelled", data: 1, color: "#8D6E63" },
          ],
        },
      },
      {
        cardType: "ReworkRateDonut",
        props: {
          rate: 11.7,
          count: 460,
          filledColor: "#C62828",
          backgroundColor: "#CFD8DC",
        },
      },
    ],
    layoutDescription: "Simulates shifting lot-status and elevated rework trend.",
  },
];

const COMBO_CHART_TEST_CASES: Array<{
  title: string;
  item: CardLayoutItem;
  layoutDescription: string;
}> = [
  {
    title: "Combo: Default 100% Baseline",
    item: {
      cardType: "ComboChart",
      props: {
        chartData: [
          { name: "Scratch", barValue: 10, lineValue: 20 },
          { name: "Crack", barValue: 8, lineValue: 40 },
          { name: "Discolor", barValue: 6, lineValue: 60 },
          { name: "Burr", barValue: 4, lineValue: 80 },
        ],
        lineTotalValue: 100,
      },
    },
    layoutDescription: "lineTotalValue=100 maps lineValue directly to percent.",
  },
  {
    title: "Combo: Custom 100% Baseline (lineTotalValue=250)",
    item: {
      cardType: "ComboChart",
      props: {
        barColor: "#3949AB",
        lineColor: "#F4511E",
        chartData: [
          { name: "Scratch", barValue: 25, lineValue: 25 },
          { name: "Crack", barValue: 18, lineValue: 75 },
          { name: "Discolor", barValue: 12, lineValue: 125 },
          { name: "Burr", barValue: 9, lineValue: 200 },
        ],
        lineTotalValue: 250,
      },
    },
    layoutDescription: "lineValue is normalized by 250, so 250 equals 100%.",
  },
  {
    title: "Combo: Invalid Baseline Fallback (lineTotalValue=0)",
    item: {
      cardType: "ComboChart",
      props: {
        chartData: [
          { name: "Scratch", barValue: 7, lineValue: 15 },
          { name: "Crack", barValue: 5, lineValue: 30 },
          { name: "Discolor", barValue: 3, lineValue: 45 },
          { name: "Burr", barValue: 2, lineValue: 60 },
        ],
        lineTotalValue: 0,
      },
    },
    layoutDescription: "lineTotalValue<=0 safely falls back to 100.",
  },
];

const SingletPreview: React.FC = () => {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2 style={{ margin: 0 }}>Card Layout Preview</h2>
      <p style={{ margin: 0, color: "#666" }}>
        Quick visual validation for Singlet, Doublet, and Triplet modules.
      </p>

      <h3 style={{ margin: "8px 0 0 0", color: "#333" }}>Singlet</h3>
      {SINGLET_PREVIEWS.map((cardType) => (
        <div key={cardType}>
          <h4 style={{ margin: "0 0 8px 0", color: "#444" }}>{cardType}</h4>
          <CardLayout
            items={[{ cardType }]}
            layoutDescription={`Mock response: Here is your ${cardType} insight selected by the LLM.`}
          />
        </div>
      ))}

      <h3 style={{ margin: "16px 0 0 0", color: "#333" }}>Doublet</h3>
      <p style={{ margin: 0, color: "#666" }}>
        Paired cards in a single response block.
      </p>

      {DOUBLET_PREVIEWS.map((pair) => (
        <div key={pair.title} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{ margin: 0, color: "#444" }}>{pair.title}</h4>
          <CardLayout
            items={[{ cardType: pair.left }, { cardType: pair.right }]}
            layoutDescription={`Mock response: ${pair.title} with two relevant metrics chosen by the LLM.`}
          />
        </div>
      ))}

      <h3 style={{ margin: "16px 0 0 0", color: "#333" }}>Triplet</h3>
      <p style={{ margin: 0, color: "#666" }}>
        Three related cards grouped in one module.
      </p>

      {TRIPLET_PREVIEWS.map((group) => (
        <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{ margin: 0, color: "#444" }}>{group.title}</h4>
          <CardLayout
            items={[{ cardType: group.first }, { cardType: group.second }, { cardType: group.third }]}
            layoutDescription={`Mock response: ${group.title} presented as a three-card summary selected by the LLM.`}
          />
        </div>
      ))}

      <h3 style={{ margin: "16px 0 0 0", color: "#333" }}>N-Card (Scrollable)</h3>
      <p style={{ margin: 0, color: "#666" }}>
        Four or more cards automatically switch to horizontal scrolling.
      </p>
      <CardLayout
        items={N_CARD_PREVIEW.map((cardType) => ({ cardType }))}
        layoutDescription="Mock response: multiple related metrics were selected, so this layout uses a horizontal scroll strip."
      />

      <h3 style={{ margin: "16px 0 0 0", color: "#333" }}>Scenario Testcases</h3>
      <p style={{ margin: 0, color: "#666" }}>
        Custom datasets and visual overrides for edge and stress validation.
      </p>

      {TEST_CASES.map((test) => (
        <div key={test.title} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{ margin: 0, color: "#444" }}>{test.title}</h4>
          <CardLayout items={test.items} layoutDescription={test.layoutDescription} />
        </div>
      ))}

      <h3 style={{ margin: "16px 0 0 0", color: "#333" }}>Combo Chart Testcases</h3>
      <p style={{ margin: 0, color: "#666" }}>
        Focused validation for lineTotalValue normalization and custom colors.
      </p>

      {COMBO_CHART_TEST_CASES.map((test) => (
        <div key={test.title} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <h4 style={{ margin: 0, color: "#444" }}>{test.title}</h4>
          <CardLayout items={[test.item]} layoutDescription={test.layoutDescription} />
        </div>
      ))}
    </div>
  );
};

export default SingletPreview;
