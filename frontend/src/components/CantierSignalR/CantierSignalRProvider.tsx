import React, { useEffect, useRef, useState } from "react";
import {
    HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
} from "@microsoft/signalr";
import CantierSignalRContext, { ConnectionStatus } from "./CantierSignalRContext";

interface SignalRProviderProps {
    children: React.ReactNode;
}
const config = window.appConfig;

export const CantierSignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
    const connectionRef = useRef<HubConnection | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("Disconnected");


    useEffect(() => {
        const hubUrl = config?.SIGNALR_URL;

        if (!hubUrl) {
            console.error("SIGNALR_URL is not configured");
            setStatus("Connection failed");
            return;
        }

        const conn = new HubConnectionBuilder()
            .withUrl(hubUrl, { withCredentials: true })
            .withAutomaticReconnect([0, 1000, 2000, 5000])
            .configureLogging(LogLevel.Information)
            .build();

        conn.onreconnecting(() => setStatus("Reconnecting"));
        conn.onreconnected(() => setStatus("Reconnected"));
        conn.onclose(() => setStatus("Disconnected"));

        conn
            .start()
            .then(() => {
                setConnection(conn);
                setStatus("Connected");
            })
            .catch((err) => {
                console.error("SignalR connection failed", err);
                setStatus("Connection failed");
            });

        return () => {
            conn.stop().catch(console.error);
        };
    }, []);

    return (
        <CantierSignalRContext.Provider
            value={{
                connection,
                connectionStatus: status,
            }}
        >
            {children}
        </CantierSignalRContext.Provider>
    );
};
