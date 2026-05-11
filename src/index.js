import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import GlobalState from "./context/index";
import DynamicChakraProvider from "./context/DynamicChakraProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GlobalState>
      <DynamicChakraProvider>
        <App />
      </DynamicChakraProvider>
    </GlobalState>
  </React.StrictMode>
);

reportWebVitals();
