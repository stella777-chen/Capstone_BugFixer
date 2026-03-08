import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IWIPProductionStatus ,IScrapRateData, IScrapRateResponse, IWipAgingBucketData, IWipAgingBucketResponse, IWipReworkRateResponse, IWipYieldSummaryResponse, IWipDefectRateResponse, IWIPLotStatusResponse} from "../type/type.WIPProductionStatus";
import { WipRootState } from "src/store/store";
import { getAllWIPProductionStatus, getWIPLotStatus,getScrapRate, getWipAgingBucket, getWipReworkRate, getWipYieldSummary, getWipDefectRate  } from "../services/WipDashboardServices";

export interface IProductionStatusSlice {
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    data: IWIPProductionStatus[];
    selectedStatus: IWIPProductionStatus | null;
    // lotStatus: {
    //     isLoading: boolean;
    //     isError: boolean;
    //     error: string | null;
    //     data: {
    //         NotStarted: number;
    //         WIP: number;
    //         Finished: number;
    //         Other: number;
    //     };
    // };
    lotStatus: {
      isLoading: boolean;
      isError: boolean;
      error: string | null;
      data: IWIPLotStatusResponse[];
    };
    scrapRate: {
        isLoading: boolean;
        isError: boolean;
        error: string | null;
        data: IScrapRateResponse[];
      };
      wipAging: {
        isLoading: boolean;
        isError: boolean;  // Add this line
        error: string | null;
        data: IWipAgingBucketResponse[];
      };
      reworkRate: {
        isLoading: boolean;
        isError: boolean;
        error: string | null;
        data: IWipReworkRateResponse[];
      };
      yieldSummary: {
        isLoading: boolean;
        isError: boolean;
        error: string | null;
        data: IWipYieldSummaryResponse[];
      };
      defectRate: {
        isLoading: boolean;
        isError: boolean;
        error: string | null;
        data: IWipDefectRateResponse[];
      };
}

const initialProductionSlice: IProductionStatusSlice = {
    isLoading: false,
    isError: false,
    error: null,
    data: [],
    selectedStatus: null,
    // lotStatus: {
    //     isLoading: false,
    //     isError: false,
    //     error: null,
    //     data: {
    //         NotStarted: 0,
    //         WIP: 0,
    //         Finished: 0,
    //         Other: 0
    //     }
    // },
    lotStatus: {
      isLoading: false,
      isError: false,
      error: null,
      data: []
    },
    scrapRate: {
        isLoading: false,
        isError: false,
        error: null,
        data: []
    },
    wipAging: {
        isLoading: false,
        isError: false,   // Add this line
        error: null,
        data: []
      },
      reworkRate: {
        isLoading: false,
        isError: false,
        error: null,
        data: []
      },
      yieldSummary: {
        isLoading: false,
        isError: false,
        error: null,
        data: []
      },
      defectRate: {
        isLoading: false,
        isError: false,
        error: null,
        data: []
      }
      
}
 
const ProductionStatusSlice = createSlice({
    name: "productionStatus",
    initialState: initialProductionSlice,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Production Status Cases
            .addCase(getAllWIPProductionStatus.pending, (state: IProductionStatusSlice) => {
                state.isLoading = true;
            })
            .addCase(getAllWIPProductionStatus.fulfilled, (state: IProductionStatusSlice, action) => {
                state.isLoading = false;
                state.isError = false;
                state.error = null;
                state.data = action.payload as IWIPProductionStatus[];
            })
            .addCase(getAllWIPProductionStatus.rejected, (state: IProductionStatusSlice, action) => {
                state.isLoading = false;
                state.isError = true;
                state.data = [];
                if (action.payload && typeof action.payload === "string") {
                    state.error = action.payload;
                } else {
                    state.error = action.error.message || "An error occurred while fetching production status.";
                }
            })
            // Lot Status Cases
            .addCase(getWIPLotStatus.pending, (state) => {
                state.lotStatus.isLoading = true;
                state.lotStatus.isError = false;
                state.lotStatus.error = null;
            })
            .addCase(getWIPLotStatus.fulfilled, (state, action) => {
                state.lotStatus.isLoading = false;
                state.lotStatus.isError = false;
                state.lotStatus.error = null;
                state.lotStatus.data = action.payload;
            })
            .addCase(getWIPLotStatus.rejected, (state, action) => {
                state.lotStatus.isLoading = false;
                state.lotStatus.isError = true;
                if (action.payload && typeof action.payload === "string") {
                    state.lotStatus.error = action.payload;
                } else {
                    state.lotStatus.error = action.error.message || "An error occurred while fetching lot status.";
                }
            })
            .addCase(getScrapRate.pending, (state) => {
                state.scrapRate.isLoading = true;
                state.scrapRate.error = null;
              })
              .addCase(getScrapRate.fulfilled, (state, action) => {
                state.scrapRate.isLoading = false;
                state.scrapRate.data = action.payload;
              })
              .addCase(getScrapRate.rejected, (state, action) => {
                state.scrapRate.isLoading = false;
                state.scrapRate.error = action.payload as string;
              })
              .addCase(getWipAgingBucket.pending, (state) => {
                state.wipAging.isLoading = true;
                state.wipAging.isError = false;
                state.wipAging.error = null;
            })
            .addCase(getWipAgingBucket.fulfilled, (state, action) => {
              state.wipAging.isLoading = false;
              state.wipAging.isError = false;
              state.wipAging.error = null;
              // Don't transform the data, just store it as received
              state.wipAging.data = action.payload;
          })
            .addCase(getWipAgingBucket.rejected, (state, action) => {
                state.wipAging.isLoading = false;
                state.wipAging.isError = true;
                state.wipAging.error = (action.payload as string) || action.error.message || null;
            })
            .addCase(getWipReworkRate.pending, (state) => {
                state.reworkRate.isLoading = true;
                state.reworkRate.isError = false;
                state.reworkRate.error = null;
              })
              .addCase(getWipReworkRate.fulfilled, (state, action) => {
                state.reworkRate.isLoading = false;
                state.reworkRate.isError = false;
                state.reworkRate.error = null;
                state.reworkRate.data = action.payload;
              })
              .addCase(getWipReworkRate.rejected, (state, action) => {
                state.reworkRate.isLoading = false;
                state.reworkRate.isError = true;
                state.reworkRate.error = action.payload as string;
              })
              .addCase(getWipYieldSummary.pending, (state) => {
                state.yieldSummary.isLoading = true;
                state.yieldSummary.isError = false;
                state.yieldSummary.error = null;
              })
              .addCase(getWipYieldSummary.fulfilled, (state, action) => {
                state.yieldSummary.isLoading = false;
                state.yieldSummary.isError = false;
                state.yieldSummary.error = null;
                state.yieldSummary.data = action.payload;
              })
              .addCase(getWipYieldSummary.rejected, (state, action) => {
                state.yieldSummary.isLoading = false;
                state.yieldSummary.isError = true;
                state.yieldSummary.error = action.payload as string;
              })
              .addCase(getWipDefectRate.pending, (state) => {
                state.defectRate.isLoading = true;
                state.defectRate.isError = false;
                state.defectRate.error = null;
              })
              .addCase(getWipDefectRate.fulfilled, (state, action) => {
                state.defectRate.isLoading = false;
                state.defectRate.isError = false;
                state.defectRate.error = null;
                state.defectRate.data = action.payload;
              })
              .addCase(getWipDefectRate.rejected, (state, action) => {
                state.defectRate.isLoading = false;
                state.defectRate.isError = true;
                state.defectRate.error = action.payload as string;
              });

              
    },
});

export const ProductionStatusSelector = (root: WipRootState) => root.ProductionStatus;
export const LotStatusSelector = (root: WipRootState) => root.ProductionStatus.lotStatus;
export const ScrapRateSelector = (root: WipRootState) => root.ProductionStatus.scrapRate;
export const WipAgingSelector = (state: WipRootState) => state.ProductionStatus.wipAging;
export const ReworkRateSelector = (root: WipRootState) => root.ProductionStatus.reworkRate;
export const YieldSummarySelector = (root: WipRootState) => root.ProductionStatus.yieldSummary;
export const DefectRateSelector = (root: WipRootState) => root.ProductionStatus.defectRate;
export default ProductionStatusSlice.reducer;