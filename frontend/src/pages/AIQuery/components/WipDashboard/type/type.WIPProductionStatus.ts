export interface IWIPProductionStatusResponse {

  joPendingCount: number;
  joInProcessCount: number;
  joholdCount: number;
  jocancelledCount: number;
}
export interface IWIPProductionStatus{
 PendingCount: number;
 InProcessCount: number;
  holdCount: number;
  cancelledCount: number;

  // title: string;
  // subtitle: string;
 
}
// export interface IWIPLotStatusResponse {
//   date: Date;
//   weekStartDate: Date;
//   monthStartDate: Date;
//   status: string;
//   lotCount: number;
// }
export interface IWIPLotStatusResponse {
  date: Date;
  weekStartDate: Date;
  monthStartDate: Date;
  status: string;
  lotCount: number;
}


export interface IWIPLotStatusData {
  legend: string;
  data: number;
  color: string;
}


export type FilterType = 'today' | 'weeks' | 'months';


// export interface IScrapRateResponse {
//   scrap: number;
//   wip: number;
// }
export interface IScrapRateResponse {
  scrap: number;
  wipCount: number;  // Changed from wip to wipCount to match API response
}




export interface IScrapRateData {
  legend: string;
  value: number;
  total: number;
  color: string;
}

export type ScrapRateFilterType = '7days' | '30days' | '90days';


export interface IWipAgingBucketResponse {
  agingBucket: string;  // matches backend AgingBucket property
  lotCount: number;     // matches backend LotCount property
}
export interface IWipAgingBucketData {
  name: string;
  value: number;
  color: string;
}
export interface IWipReworkRateResponse {
  rework: number;
  wip: number;
}
export type WipAgingFilterType = 'InProgress';

export type ReworkRateFilterType = 'today' | '7days' | '30days';


// export interface IWipYieldSummaryResponse {
//   lotActionType: string;
//   productionLineCode: string;
//   totalYield: number;
// }

export interface IWipYieldSummaryResponse {
  lotActionType: string;
  productionLineCode: string;
  totalYield: number;
}
export interface GetYieldSummaryQuery {
  filterType: 'today' | 'week' | 'month';
  productionLine?: string;
}



export interface IWipDefectRateResponse {
  defectCode: string;
  defectCount: number;
  totalDefectPercentage: number;
}

export type DefectRateFilterType = 'today' | '7days' | '30days';

export interface IDefectChartData {
  name: string;
  barValue: number;  // defectCount
  lineValue: number; // totalDefectPercentage
}