import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@jobjitsu/ui/tokens.css";
import "@jobjitsu/ui/JjAgentPrivacyPill.css";
import "./shell/shell.css";
import { App } from "./App.js";
import { createHostRuntime } from "./host/runtime.js";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("JobJitsu shell requires #root");
}

const runtime = createHostRuntime({ version: "0.0.0" });

createRoot(rootEl).render(
  <StrictMode>
    <App runtime={runtime} />
  </StrictMode>,
);

void runtime.start();
