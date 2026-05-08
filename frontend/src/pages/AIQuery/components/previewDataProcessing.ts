import type { CardType } from "./CardLayout";
import {
  mockDefectRateToday,
  mockLotStatusData,
  mockReworkRateToday,
  mockScrapRate7Days,
  mockWipAgingData,
  mockYieldSummaryToday,
} from "./WipDashboard/mockLotStatusData";
import type { IWIPLotStatusResponse } from "./WipDashboard/type/type.WIPProductionStatus";

type CardMeta = {
  headerText: string;
  description: string;
};

const FALLBACK_CARD_META: Record<CardType, CardMeta> = {
  ScrapRateDonut: {
    headerText: "Scrap Rate",
    description: "Track the percentage of scrapped WIP items",
  },
  ReworkRateDonut: {
    headerText: "Rework Rate",
    description: "Monitor the percentage of reworked items",
  },
  LineChart: {
    headerText: "Yield Summary",
    description: "Yield % trends over time",
  },
  PieChart: {
    headerText: "Lot Status",
    description: "Track real-time status of lots",
  },
  BarChart: {
    headerText: "WIP Aging",
    description: "Track WIP aging to monitor progress",
  },
  ComboChart: {
    headerText: "Defects",
    description: "Identify key defect sources",
  },
  DataTable: {
    headerText: "Production Status",
    description: "Current lot status overview",
  },
};

const processLotStatus = (lotData: IWIPLotStatusResponse[]) => {
  const statusMap = new Map<string, number>();
  lotData.forEach((item) => {
    statusMap.set(item.status, (statusMap.get(item.status) || 0) + item.lotCount);
  });

  return [
    { legend: "Not Started", data: statusMap.get("NotStarted") || 0, color: "#d0e3fa" },
    { legend: "WIP", data: statusMap.get("WorkInProcess") || 0, color: "#62abf5" },
    { legend: "Finished", data: statusMap.get("Finished") || 0, color: "#2886de" },
    { legend: "Hold", data: statusMap.get("Hold") || 0, color: "#a0c4ff" },
    { legend: "Cancelled", data: statusMap.get("Cancelled") || 0, color: "#ff9999" },
  ];
};

export const getPreviewCardProps = (cardType: CardType): Record<string, unknown> => {
  const defaultScrap = mockScrapRate7Days[0] ?? { scrap: 0, wipCount: 0 };
  const defaultRework = mockReworkRateToday[0] ?? { rework: 0, wip: 0 };
  const fallbackMeta = FALLBACK_CARD_META[cardType];

  switch (cardType) {
    case "ScrapRateDonut":
      return {
        ...fallbackMeta,
        rate: defaultScrap.scrap,
        count: defaultScrap.wipCount,
        totalValue: 100,
        filledColor: "#D32F2F",
        backgroundColor: "#D3D3D3",
        legendNames: ["Scrap Rate", "WIP Count"],
        className: "firstCard",
      };

    case "ReworkRateDonut":
      return {
        ...fallbackMeta,
        rate: defaultRework.rework,
        count: defaultRework.wip,
        totalValue: 100,
        filledColor: "#0088FE",
        backgroundColor: "#D3D3D3",
        legendNames: ["Rework", "Total WIP Items"],
        className: "additionalCard1 div5",
      };

    case "LineChart":
      return {
        ...fallbackMeta,
        lineColor: "#005FA8",
        chartData: mockYieldSummaryToday.map((item) => ({
          name: item.productionLineCode,
          yield: Number(item.totalYield),
        })),
      };

    case "PieChart":
      return {
        ...fallbackMeta,
        pieFallbackColor: "#62abf5",
        chartData: processLotStatus(mockLotStatusData),
      };

    case "BarChart":
      return {
        ...fallbackMeta,
        barColor: "#62abf5",
        chartData: mockWipAgingData.map((item) => ({
          name: item.agingBucket,
          value: item.lotCount,
        })),
      };

    case "ComboChart":
      return {
        ...fallbackMeta,
        barColor: "#62abf5",
        lineColor: "#0078D4",
        lineTotalValue: 100,
        chartData: mockDefectRateToday.map((item) => ({
          name: item.defectCode,
          barValue: item.defectCount,
          lineValue: item.totalDefectPercentage,
        })),
      };

    case "DataTable":
      return {
        ...fallbackMeta,
        values: {
          pending: 12,
          inProgress: 27,
          cancelled: 3,
          closed: 41,
        },
      };

    default:
      return fallbackMeta;
  }
};
