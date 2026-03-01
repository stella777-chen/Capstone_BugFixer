import { createContext } from "react";

export interface ISnackBar {
  id?: string;
  // open: boolean;
  heading?: string;
  message: string;
  severity?: "success" | "error" | "warning" | "info" | any;
  timeout?: number;
  visible?: boolean;
  timerId?: null | any;
  onClose?: (
    event: Event | React.SyntheticEvent<any, Event>,
    reason: string
  ) => void;
}

export type SnackbarType = {
  list?: ISnackBar[];
  // setList?: (list: ISnackBar[]) => ISnackBar[];
  setList?: any;
  addSnack: (
    message: string,
    heading: string,
    severity: string,
    timeout: number
  ) => void;
};

const MesSnackbarContext = createContext<SnackbarType | undefined>(undefined);

export default MesSnackbarContext;
