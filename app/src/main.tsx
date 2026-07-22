import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@jobjitsu/ui/tokens.css";
import "@jobjitsu/ui/JjAgentPrivacyPill.css";
import "./shell/shell.css";
import { App } from "./App.js";
import { createAppHostRuntime } from "./host/durable-runtime.js";
import { createHostRuntime } from "./host/runtime.js";

document.documentElement.setAttribute("data-theme", "dark");

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("JobJitsu shell requires #root");
}

void (async () => {
  let runtime;
  try {
    runtime = await createAppHostRuntime({ version: "0.0.0" });
  } catch (cause) {
    console.error("JobJitsu host failed to start; using session memory.", cause);
    runtime = createHostRuntime({ version: "0.0.0" });
  }

  createRoot(rootEl).render(
    <StrictMode>
      <App runtime={runtime} />
    </StrictMode>,
  );

  try {
    await runtime.start();
  } catch (cause) {
    console.error("JobJitsu startup cascade failed.", cause);
  }
})();
