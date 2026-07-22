import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryAppearanceStore } from "../host/appearance-store.js";
import { createHostRuntime } from "../host/runtime.js";
import { App } from "../App.js";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});

describe("DesktopShell", () => {
  it("renders JobJitsu chrome and primary H1 nav", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    expect(screen.getByRole("heading", { level: 1, name: "JobJitsu" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Applications" })).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "dark");

    for (const label of [
      "Applications",
      "Queue",
      "Follow-ups",
      "Agent",
      "Preferences",
      "Timeline",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("shows one primary view and Agent listens to host events", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Agent" }));

    expect(screen.getByRole("heading", { level: 2, name: "Agent" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-event-activity")).toBeInTheDocument();
    expect(await screen.findByText("Startup cascade complete.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agent" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByTestId("jj-coming-soon")).not.toBeInTheDocument();
  });

  it("switches main title when navigating", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Queue" }));

    expect(screen.getByRole("heading", { level: 2, name: "Queue" })).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Queue" })).toHaveAttribute("aria-current", "page");
  });

  it("toggles appearance from Preferences and keeps it on the shared store", async () => {
    const user = userEvent.setup();
    const appearance = createMemoryAppearanceStore("dark");
    const runtime = createHostRuntime({ appearance });
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-preferences")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(await screen.findByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(await appearance.getTheme()).toBe("light");
  });

  it("saves profile on-device through the identity bridge", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-profile-form")).toBeInTheDocument();
    expect(screen.getByText(/stay on this device/i)).toBeInTheDocument();
    expect(screen.queryByText(/cloud sync/i)).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.type(screen.getByRole("textbox", { name: /^email$/i }), "sam@example.com");
    await user.type(screen.getByRole("textbox", { name: /location/i }), "On this device");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(await screen.findByText("Stored on this device.")).toBeInTheDocument();
    const profile = await runtime.profiles.get();
    expect(profile?.displayName).toBe("Sam Chen");
    expect(profile?.email).toBe("sam@example.com");
    expect(profile?.location).toMatch(/device/i);
  });

  it("imports a resume into the local library through the identity bridge", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const imported: string[] = [];
    runtime.bus.subscribe("Resume.Imported", async (event) => {
      imported.push(event.payload.resumeId);
    });

    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-resume-library")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /version label/i }), "Baseline 2026");
    const file = new File(["# Sam Chen\nStaff engineer\n"], "sam-chen.md", {
      type: "text/markdown",
    });
    await user.upload(screen.getByTestId("jj-resume-file-input"), file);
    await user.click(screen.getByRole("button", { name: "Import resume" }));

    expect(await screen.findByText(/Imported "Baseline 2026"/i)).toBeInTheDocument();
    expect(await screen.findByTestId("jj-resume-version-list")).toHaveTextContent("Baseline 2026");
    const versions = await runtime.resumeLibrary.list();
    expect(versions).toHaveLength(1);
    expect(versions[0]?.label).toBe("Baseline 2026");
    expect(imported).toEqual([versions[0]?.id]);
  });
});
