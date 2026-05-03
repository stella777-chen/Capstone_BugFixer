import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  GET_DEFECT_RATE,
  GET_LOT_STATUS,
  GET_PRODUCTION_STATUS,
  GET_SCRAP_RATE_COUNT,
  GET_WIP_AGING_BUCKET,
  GET_WIP_REWORK_COUNT,
  GET_WIP_YIELD_SUMMARY,
} from "../api/WipDashboardApi";
import { getAxios } from "src/services/axios";
import {
  FilterType,
  IWIPLotStatusResponse,
  IWIPProductionStatus,
  IWIPProductionStatusResponse,
  ScrapRateFilterType,
  IScrapRateResponse,
  IWipAgingBucketResponse,
  ReworkRateFilterType,
  DefectRateFilterType,
  WipAgingFilterType,
} from "../type/type.WIPProductionStatus";
import { AxiosError } from "axios";

// export const getAllWIPProductionStatus = createAsyncThunk(
//    "WIPDashboard/GetWIPProductionStatus",
//    async()=>{
//     try{
//     const response = await getAxios(`https://localhost:201${GET_PRODUCTION_STATUS}`);
//    return response;
//     } catch (e){
//     if (e instanceof AxiosError){
//        return  e.message;
//     }
//     else {
//         return e;
//     }
//    }
// })

// export const getAllWIPProductionStatus = createAsyncThunk(
//     "WIPDashboard/GetWIPProductionStatus",
//     async (_, { rejectWithValue }) => {
//       try {
//         const response = await getAxios<string>(
//           `${WIP_BASE_URL}${GET_PRODUCTION_STATUS}`
//         );
// //   return response.map(( ProductionStatus:IWIPProductionStatus)=>
// //     {
// //     return {value:ProductionStatus.value}
// //     })
//         return JSON.parse(response).response as IWIPProductionStatus[];
//       } catch (e) {
//         if (e instanceof AxiosError) {
//           return rejectWithValue(e.message);
//         } else {
//           return rejectWithValue(e);
//         }
//       }
//     }
//   );
const WIP_BASE_URL = "https://localhost:201/";
const config = window.appConfig;
export const getAllWIPProductionStatus = createAsyncThunk(
  "WIPDashboard/GetWIPProductionStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_PRODUCTION_STATUS}`
      );

      const parsedResponse = JSON.parse(response)
        .response as IWIPProductionStatusResponse;

      // Map the response to our interface
      const mappedData: IWIPProductionStatus = {
        PendingCount: parsedResponse.joPendingCount,
        InProcessCount: parsedResponse.joInProcessCount,
        holdCount: parsedResponse.joholdCount,
        cancelledCount: parsedResponse.jocancelledCount,
      };

      return [mappedData];
    } catch (e) {
      if (e instanceof AxiosError) {
        return rejectWithValue(e.message);
      } else {
        return rejectWithValue(e);
      }
    }
  }
);

// export const getWIPLotStatus = createAsyncThunk(
//   "lotStatus/getWIPLotStatus",
//   async (filterType: FilterType, { rejectWithValue }) => {
//     try {
//       const response = await getAxios<string>(
//         `${WIP_BASE_URL}${GET_LOT_STATUS}?FilterType=${filterType}`
//       );

//       let parsedResponse;
//       try {
//         parsedResponse =
//           typeof response === "string" ? JSON.parse(response) : response;

//         if (parsedResponse.response) {
//           parsedResponse = parsedResponse.response;
//         }
//       } catch (parseError) {
//         console.error("Parse error:", parseError);
//         throw new Error("Failed to parse API response");
//       }

//       const statusCounts = {
//         NotStarted: 0,
//         WIP: 0,
//         Finished: 0,
//         Other: 0,
//       };

//       const items = Array.isArray(parsedResponse)
//         ? parsedResponse
//         : [parsedResponse];

//       items.forEach((item) => {
//         if (item && item.status && typeof item.lotCount === "number") {
//           switch (item.status) {
//             case "NotStarted":
//               statusCounts.NotStarted += item.lotCount;
//               break;
//             case "WorkInProcess": // Updated to match API response
//               statusCounts.WIP += item.lotCount;
//               break;
//             case "Finished":
//               statusCounts.Finished += item.lotCount;
//               break;
//             default:
//               statusCounts.Other += item.lotCount;
//           }
//         }
//       });

//       console.log("Processed status counts:", statusCounts); // Debug log
//       return statusCounts;
//     } catch (error) {
//       console.error("API Error:", error);
//       return rejectWithValue(
//         error instanceof Error ? error.message : "Failed to fetch lot status"
//       );
//     }
//   }
// );



export const getWIPLotStatus = createAsyncThunk(
  "lotStatus/getWIPLotStatus",
  async (filterType: FilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_LOT_STATUS}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === "string" 
          ? JSON.parse(response) 
          : response;

        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Failed to parse API response");
      }

      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      return items;
    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch lot status"
      );
    }
  }
);

// export const getScrapRate = createAsyncThunk(
//   "scrapRate/getScrapRate",
//   async (filterType: ScrapRateFilterType, { rejectWithValue }) => {
//     try {
//       const response = await getAxios<string>(
//         `${WIP_BASE_URL}${GET_SCRAP_RATE_COUNT}?FilterType=${filterType}`
//       );

//       let parsedResponse;
//       try {
//         parsedResponse =
//           typeof response === "string" ? JSON.parse(response) : response;

//         if (parsedResponse.response) {
//           parsedResponse = parsedResponse.response;
//         }
//       } catch (parseError) {
//         console.error("Parse error:", parseError);
//         throw new Error("Failed to parse API response");
//       }

//       const rateData = {
//         scrap: 0,
//         wip: 0,
//       };

//       const items = Array.isArray(parsedResponse)
//         ? parsedResponse
//         : [parsedResponse];

//       items.forEach((item) => {
//         if (
//           item &&
//           typeof item.scrap === "number" &&
//           typeof item.wip === "number"
//         ) {
//           rateData.scrap = item.scrap;
//           rateData.wip = item.wip;
//         }
//       });

//       console.log("Processed rate data:", rateData);
//       return [rateData];
//     } catch (error) {
//       console.error("API Error:", error);
//       return rejectWithValue(
//         error instanceof Error ? error.message : "Failed to fetch scrap rate"
//       );
//     }
//   }
// );




export const getScrapRate = createAsyncThunk(
  "scrapRate/getScrapRate",
  async (filterType: ScrapRateFilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_SCRAP_RATE_COUNT}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Failed to parse API response");
      }

      // Return the array directly since the API already returns the correct format
      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      return items;

    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch scrap rate"
      );
    }
  }
);
export const getWipAgingBucket = createAsyncThunk(
  "wipAging/getWipAgingBucket",
  async (filterType: WipAgingFilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_WIP_AGING_BUCKET}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Failed to parse API response");
      }

      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      
      // Define the correct bucket order
      const bucketOrder = [
        "1-3", "4-7", "8-11", "12-15", 
        "16-19", "20-23", "24-27", "28+"
      ];

      // Transform and sort the items
      const transformedItems = items.map(item => ({
        agingBucket: item.agingBucket,
        lotCount: item.lotCount
      }));

      // Sort according to the defined order
      return transformedItems.sort((a, b) => {
        return bucketOrder.indexOf(a.agingBucket) - bucketOrder.indexOf(b.agingBucket);
      });

    } catch (error) {
      console.error("API Error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch aging bucket data"
      );
    }
  }
);
export const getWipReworkRate = createAsyncThunk(
  "reworkRate/getWipReworkRate",
  async (filterType: ReworkRateFilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_WIP_REWORK_COUNT}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;
        
        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse API response');
      }

      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      return items;

    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch rework rate'
      );
    }
  }
);


export const getWipYieldSummary = createAsyncThunk(
  "yieldSummary/getWipYieldSummary",
  async (filterType: FilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_WIP_YIELD_SUMMARY}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;
        
        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse API response');
      }

      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      return items;

    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch yield summary'
      );
    }
  }
);


export const getWipDefectRate = createAsyncThunk(
  "defectRate/getWipDefectRate",
  async (filterType: DefectRateFilterType, { rejectWithValue }) => {
    try {
      const response = await getAxios<string>(
        `${WIP_BASE_URL}${GET_DEFECT_RATE}?FilterType=${filterType}`
      );

      let parsedResponse;
      try {
        parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;
        
        if (parsedResponse.response) {
          parsedResponse = parsedResponse.response;
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Failed to parse API response');
      }

      const items = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
      return items;

    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch defect rate'
      );
    }
  }
);
// export const getAllLotStatus = createAsyncThunk(
//     "WIPDashboard/GetWIPProductionStatus",
//     async (_, { rejectWithValue }) => {
//       try {
//         const response = await getAxios<string>(
//           `${WIP_BASE_URL}${GET_LOT_STATUS}`
//         );

//         const parsedResponse = JSON.parse(response).response as IWIPProductionStatusResponse;

//         // Map the response to our interface
//         const mappedData: IWIPProductionStatus = {
//           PendingCount: parsedResponse.joPendingCount,
//           InProcessCount: parsedResponse.joInProcessCount,
//           holdCount: parsedResponse.joholdCount,
//           cancelledCount: parsedResponse.jocancelledCount
//         };

//         return [mappedData];
//       } catch (e) {
//         if (e instanceof AxiosError) {
//           return rejectWithValue(e.message);
//         } else {
//           return rejectWithValue(e);
//         }
//       }
//     }
// );
