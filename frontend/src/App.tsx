import "./assets/styles/root.scss";
import "./App.css";
import "./assets/styles/main.scss";
import "./assets/styles/inputForm.css";
import "./assets/styles/grid.scss";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { MesSnackbarProvider } from "./components/MesSnackbarStacks";
import { Provider } from "react-redux";
// import Dashboard from "./pages/WipDashboard/WipDashboard";
import AIQuery from "./pages/AIQuery/AIQuery";
import { wipStore } from "./store/store";

const App = () => {

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
          <AIQuery/>
        </Provider>
      </FluentProvider>
    </MesSnackbarProvider>
  );
};

export default App;
