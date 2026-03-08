import { useContext } from "react";
import MesSnackbarContext from "../MesSnackbarContext";

const useMesSnackbarContext = () => {
  const context = useContext(MesSnackbarContext);
  if (!context) {
    throw new Error(
      "useMesSnackbarContext must be used inside the MesSnackProvider"
    );
  }
  return context;
};

export default useMesSnackbarContext;
