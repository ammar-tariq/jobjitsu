import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryResumeLibrary } from "@jobjitsu/identity";
import { createMemoryAppearanceStore } from "../host/appearance-store.js";
import { createMemoryDataRootStore } from "../host/data-root-store.js";
import { createStubFolderPicker } from "../host/folder-picker.js";
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

  it("selects a resume version without sending anything", async () => {
    const user = userEvent.setup();
    const resumeLibrary = createMemoryResumeLibrary();
    const first = await resumeLibrary.import({
      label: "Baseline",
      fileName: "base.md",
      bytes: new TextEncoder().encode("# Baseline"),
    });
    await resumeLibrary.import({
      label: "Alternate",
      fileName: "alt.md",
      bytes: new TextEncoder().encode("# Alternate"),
      parentVersionId: first.id,
    });

    const runtime = createHostRuntime({ resumeLibrary });
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-resume-version-list")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use Alternate" }));
    expect(await screen.findByText(/Selected “Alternate” — nothing was sent/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selected Alternate" })).toBeDisabled();
    expect((await runtime.resumeLibrary.getSelected())?.label).toBe("Alternate");
    expect(runtime.bridge).not.toHaveProperty("send");
  });

  it("shows the default data folder and lets the user change it on-device", async () => {
    const user = userEvent.setup();
    const dataRoot = createMemoryDataRootStore({
      defaultPath: "/Users/sam/Library/Application Support/JobJitsu",
    });
    const runtime = createHostRuntime({ dataRoot });
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-data-folder")).toBeInTheDocument();
    expect(screen.getByTestId("jj-data-folder-default")).toHaveTextContent(
      "/Users/sam/Library/Application Support/JobJitsu",
    );

    const pathField = screen.getByRole("textbox", { name: "Current folder" });
    await user.clear(pathField);
    await user.type(pathField, "/Volumes/Vault/JobJitsu");
    await user.click(screen.getByRole("button", { name: "Save path" }));

    expect(await screen.findByText(/Data folder updated/i)).toBeInTheDocument();
    expect((await runtime.dataRoot.get()).path).toBe("/Volumes/Vault/JobJitsu");
    expect((await runtime.dataRoot.get()).isCustom).toBe(true);

    await user.click(screen.getByRole("button", { name: "Use default" }));
    expect(await screen.findByText(/Restored the default data folder/i)).toBeInTheDocument();
    expect((await runtime.dataRoot.get()).isCustom).toBe(false);
  });

  it("lets the user choose a data folder with the system picker", async () => {
    const user = userEvent.setup();
    const dataRoot = createMemoryDataRootStore({
      defaultPath: "/Users/sam/Library/Application Support/JobJitsu",
    });
    const folderPicker = createStubFolderPicker(async () => "/Volumes/Vault/JobJitsu");
    const runtime = createHostRuntime({ dataRoot, folderPicker });
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    await user.click(screen.getByRole("button", { name: "Choose folder" }));

    expect(await screen.findByText(/Data folder updated/i)).toBeInTheDocument();
    expect((await runtime.dataRoot.get()).path).toBe("/Volumes/Vault/JobJitsu");
    expect((await runtime.dataRoot.get()).isCustom).toBe(true);
    expect(screen.getByDisplayValue("/Volumes/Vault/JobJitsu")).toBeInTheDocument();
  });
});
