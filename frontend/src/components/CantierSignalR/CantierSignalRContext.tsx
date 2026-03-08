import { createContext } from "react";
import { HubConnection } from "@microsoft/signalr";

export type ConnectionStatus =
  | "Disconnected"
  | "Connected"
  | "Reconnecting"
  | "Reconnected"
  | "Connection failed";

export interface SignalRContextValue {
  connection: HubConnection | null;
  connectionStatus: ConnectionStatus;
}

const CantierSignalRContext = createContext<SignalRContextValue>({
  connection: null,
  connectionStatus: "Disconnected",
});

export default CantierSignalRContext;
