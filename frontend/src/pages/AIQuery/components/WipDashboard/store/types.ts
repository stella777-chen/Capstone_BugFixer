import type { wipStore } from "./store";

export type WipRootState = ReturnType<typeof wipStore.getState>;
export type WipAppDispatch = typeof wipStore.dispatch;
