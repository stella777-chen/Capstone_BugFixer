import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { WipAppDispatch,WipRootState } from "../pages/AIQuery/components/WipDashboard/store/types";
import React from "react";

export const useWIPAppDispatch = useDispatch.withTypes<WipAppDispatch>();
export const useWIPAppSelector = useSelector.withTypes<WipRootState>();

