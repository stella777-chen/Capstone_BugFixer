import "./assets/styles/root.scss";
import "./App.css";
import "./assets/styles/main.scss";
import "./assets/styles/inputForm.css";
import "./assets/styles/grid.scss";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { MesSnackbarProvider } from "./components/MesSnackbarStacks";
import AIQuery from "./pages/AIQuery/AIQuery";
import SingletPreview from "./pages/AIQuery/Preview"; // PREVIEW — swap back to AIQuery when done

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
        <SingletPreview /> {/* PREVIEW — swap back to <AIQuery /> when done */}
      </FluentProvider>
    </MesSnackbarProvider>
  );
};

export default App;
