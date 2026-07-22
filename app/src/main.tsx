import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@jobjitsu/ui/tokens.css";
import "@jobjitsu/ui/JjAgentPrivacyPill.css";
import "./shell/shell.css";
import { App } from "./App.js";
import { createAppHostRuntime } from "./host/durable-runtime.js";

document.documentElement.setAttribute("data-theme", "dark");

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("JobJitsu shell requires #root");
}

void (async () => {
  const runtime = await createAppHostRuntime({ version: "0.0.0" });

  createRoot(rootEl).render(
    <StrictMode>
      <App runtime={runtime} />
    </StrictMode>,
  );

  await runtime.start();
})();
