import { configureStore } from "@reduxjs/toolkit";
import ProductionStatusSlice from "../pages/WipDashboard/slices/WipDashboardSlices";
import LotStatusSlice from "../pages/WipDashboard/slices/WipDashboardSlices";

export const wipStore = configureStore({
  reducer: {
    ProductionStatus: ProductionStatusSlice,
    lotStatus: LotStatusSlice,
  },
  devTools: true,
});

export type WipRootState = ReturnType<typeof wipStore.getState>;
export type WipAppDispatch = typeof wipStore.dispatch;
