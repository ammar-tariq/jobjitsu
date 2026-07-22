import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@jobjitsu/ui/tokens.css";
import "@jobjitsu/ui/JjAgentPrivacyPill.css";
import "./shell/shell.css";
import { App } from "./App.js";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("JobJitsu shell requires #root");
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
