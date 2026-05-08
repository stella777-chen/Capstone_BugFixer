import { configureStore } from "@reduxjs/toolkit";
import ProductionStatusSlice from "../slices/WipDashboardSlices";
import LotStatusSlice from "../slices/WipDashboardSlices";

export const wipStore = configureStore({
  reducer: {
    ProductionStatus: ProductionStatusSlice,
    lotStatus: LotStatusSlice,
  },
  devTools: true,
});

// Types are in ./types.ts to avoid circular dependency with WipDashboardSlices
