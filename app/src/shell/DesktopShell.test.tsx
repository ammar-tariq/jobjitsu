import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createHostRuntime } from "../host/runtime.js";
import { App } from "../App.js";

afterEach(() => {
  cleanup();
});

describe("DesktopShell", () => {
  it("renders JobJitsu chrome and listens to host events on Dojo", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    expect(screen.getByRole("heading", { level: 1, name: "JobJitsu" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Welcome" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-event-activity")).toBeInTheDocument();
    expect(await screen.findByText("Startup cascade complete.")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
  });

  it("switches main title when navigating", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Resume" }));

    expect(screen.getByRole("heading", { level: 2, name: "Resume" })).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume" })).toHaveAttribute("aria-current", "page");
  });
});
