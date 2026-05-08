import { IScrapRateResponse, IWipAgingBucketResponse, IWipDefectRateResponse, IWIPLotStatusResponse, IWipReworkRateResponse, IWipYieldSummaryResponse } from "./type/type.WIPProductionStatus";

export const mockLotStatusData: IWIPLotStatusResponse[] = [
      {
    date: new Date(),
    weekStartDate: new Date(),
    monthStartDate: new Date(),
    status: "NotStarted",
    lotCount: 10,
  },
  {
    date: new Date(),
    weekStartDate: new Date(),
    monthStartDate: new Date(),
    status: "WorkInProcess",
    lotCount: 22,
  },
  {
    date: new Date(),
    weekStartDate: new Date(),
    monthStartDate: new Date(),
    status: "Finished",
    lotCount: 15,
  },
  {
    date: new Date(),
    weekStartDate: new Date(),
    monthStartDate: new Date(),
    status: "Hold",
    lotCount: 4,
  },
  {
    date: new Date(),
    weekStartDate: new Date(),
    monthStartDate: new Date(),
    status: "Cancelled",
    lotCount: 2,
  },
];

//Scrap Rate
export const mockScrapRate7Days: IScrapRateResponse[] = [
  {
    scrap: 4.2,     // percentage
    wipCount: 120,  // total WIP count
  },
];

export const mockScrapRate30Days: IScrapRateResponse[] = [
  {
    scrap: 6.8,
    wipCount: 340,
  },
];

export const mockScrapRate90Days: IScrapRateResponse[] = [
  {
    scrap: 9.5,
    wipCount: 920,
  },
];
//Defects
export const mockDefectRateToday: IWipDefectRateResponse[] = [
  {
    defectCode: "Scratch",
    defectCount: 5,
    totalDefectPercentage: 1.8,
  },
  {
    defectCode: "Crack",
    defectCount: 3,
    totalDefectPercentage: 1.2,
  },
  {
    defectCode: "Discolor",
    defectCount: 2,
    totalDefectPercentage: 0.9,
  },
];

export const mockDefectRate7Days: IWipDefectRateResponse[] = [
  {
    defectCode: "Scratch",
    defectCount: 18,
    totalDefectPercentage: 3.4,
  },
  {
    defectCode: "Crack",
    defectCount: 12,
    totalDefectPercentage: 2.1,
  },
  {
    defectCode: "Discolor",
    defectCount: 9,
    totalDefectPercentage: 1.6,
  },
  {
    defectCode: "Burr",
    defectCount: 6,
    totalDefectPercentage: 1.1,
  },
];

export const mockDefectRate30Days: IWipDefectRateResponse[] = [
  {
    defectCode: "Scratch",
    defectCount: 42,
    totalDefectPercentage: 5.8,
  },
  {
    defectCode: "Crack",
    defectCount: 31,
    totalDefectPercentage: 4.2,
  },
  {
    defectCode: "Discolor",
    defectCount: 25,
    totalDefectPercentage: 3.6,
  },
  {
    defectCode: "Burr",
    defectCount: 18,
    totalDefectPercentage: 2.4,
  },
  {
    defectCode: "Warp",
    defectCount: 10,
    totalDefectPercentage: 1.7,
  },
];
//WIP Aging
export const mockWipAgingData: IWipAgingBucketResponse[] = [
  { agingBucket: "1-3", lotCount: 70 },
  { agingBucket: "4-7", lotCount: 65 },
  { agingBucket: "8-11", lotCount: 20 },
  { agingBucket: "12-15", lotCount: 30 },
  { agingBucket: "16-19", lotCount: 80 },
  { agingBucket: "20-23", lotCount: 40 },
  { agingBucket: "24-27", lotCount: 65 },
];
//Rework Rate
export const mockReworkRateToday: IWipReworkRateResponse[] = [
  {
    rework: 2.4, // %
    wip: 120,    // total WIP items
  },
];

export const mockReworkRate7Days: IWipReworkRateResponse[] = [
  {
    rework: 4.9,
    wip: 380,
  },
];

export const mockReworkRate30Days: IWipReworkRateResponse[] = [
  {
    rework: 7.2,
    wip: 910,
  },
];
//Yield Summary
export const mockYieldSummaryToday: IWipYieldSummaryResponse[] = [
  { lotActionType: "Completed", productionLineCode: "Line A", totalYield: 72 },
  { lotActionType: "Completed", productionLineCode: "Line B", totalYield: 55 },
  { lotActionType: "Completed", productionLineCode: "Line C", totalYield: 43 },
  { lotActionType: "Completed", productionLineCode: "Line D", totalYield: 88 },
  { lotActionType: "Completed", productionLineCode: "Line E", totalYield: 60 },
];

export const mockYieldSummaryWeeks: IWipYieldSummaryResponse[] = [
  { lotActionType: "Completed", productionLineCode: "Line A", totalYield: 75 },
  { lotActionType: "Completed", productionLineCode: "Line B", totalYield: 62 },
  { lotActionType: "Completed", productionLineCode: "Line C", totalYield: 58 },
  { lotActionType: "Completed", productionLineCode: "Line D", totalYield: 90 },
  { lotActionType: "Completed", productionLineCode: "Line E", totalYield: 68 },
];

export const mockYieldSummaryMonths: IWipYieldSummaryResponse[] = [
  { lotActionType: "Completed", productionLineCode: "Line A", totalYield: 78 },
  { lotActionType: "Completed", productionLineCode: "Line B", totalYield: 70 },
  { lotActionType: "Completed", productionLineCode: "Line C", totalYield: 65 },
  { lotActionType: "Completed", productionLineCode: "Line D", totalYield: 92 },
  { lotActionType: "Completed", productionLineCode: "Line E", totalYield: 74 },
];
    