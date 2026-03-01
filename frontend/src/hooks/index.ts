import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { WipAppDispatch,WipRootState } from "../store/store";
import React from "react";

export const useWIPAppDispatch = useDispatch.withTypes<WipAppDispatch>();
export const useWIPAppSelector = useSelector.withTypes<WipRootState>();

