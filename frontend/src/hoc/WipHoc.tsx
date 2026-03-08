import React from "react";
import { Provider } from "react-redux";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { wipStore } from "src/store/store";
import { MesSnackbarProvider } from "src/components/MesSnackbarStacks";
import { CantierSignalRProvider } from "src/components/CantierSignalR/CantierSignalRProvider";

// Higher Order Component for wrapping components with store providers
const WipHoc = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    return (
      <MesSnackbarProvider>
        <FluentProvider
          theme={{
            ...webLightTheme,
            colorCompoundBrandStroke: "var(--color-accent)",
            colorCompoundBrandStrokeHover: "var(--color-accent)",
          }}
        >
          <Provider store={wipStore}>
            <CantierSignalRProvider>
              <Component {...props} />
            </CantierSignalRProvider>
          </Provider>
        </FluentProvider>
      </MesSnackbarProvider>
    );
  };

  // Set display name for better debugging
  const displayName = Component.displayName || Component.name || "Component";
  WrappedComponent.displayName = `withStoreProviders(${displayName})`;

  return WrappedComponent;
};

export default WipHoc;
