import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createHostRuntime } from "../host/runtime.js";
import { configureStubLocalModel } from "../host/test-local-model.js";
import { App } from "../App.js";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});

describe("DashboardView", () => {
  it("lands on Overview with empty charts guidance", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    expect(screen.getByRole("heading", { level: 2, name: "Overview" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-dashboard-view")).toBeInTheDocument();
    expect(await screen.findByTestId("jj-dashboard-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("jj-dashboard-funnel-chart")).not.toBeInTheDocument();
  });

  it("renders funnel, mix, and rates charts from local dashboard data", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    await user.click(screen.getByTestId("jj-application-new-draft"));
    await user.type(screen.getByTestId("jj-application-company"), "Acme");
    await user.type(screen.getByTestId("jj-application-role"), "Staff Engineer");
    await user.click(screen.getByTestId("jj-application-save"));
    expect(await screen.findByText(/Application draft saved/i)).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-editor-dialog-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("jj-application-draft-dialog")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Overview" }));
    expect(await screen.findByTestId("jj-dashboard-funnel-chart")).toBeInTheDocument();
    expect(screen.getByTestId("jj-dashboard-mix-chart")).toBeInTheDocument();
    expect(screen.getByTestId("jj-dashboard-rates-chart")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/1 applications/i)).toBeInTheDocument();
    });
  });
});
