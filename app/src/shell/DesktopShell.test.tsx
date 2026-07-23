import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
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
    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "dark");
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();

    for (const label of [
      "Applications",
      "Queue",
      "Follow-ups",
      "Profile",
      "Agent",
      "Preferences",
      "Timeline",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("keeps Agent chrome unavailable until the local runtime is ready", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);

    expect(screen.getByRole("status", { name: "Agent · Unavailable" })).toBeInTheDocument();

    await runtime.start();

    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-agent-privacy-pill").textContent).not.toMatch(/llm/i);
  });

  it("never shows Agent · On-device for a remote-ready provider", async () => {
    const runtime = createHostRuntime({
      ai: createFakeAiProvider({ id: "fake-remote", locality: "remote" }),
    });
    render(<App runtime={runtime} />);
    await runtime.start();

    expect(await screen.findByRole("status", { name: "Agent · Ready" })).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Agent · On-device" })).not.toBeInTheDocument();
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

    await user.click(screen.getByRole("button", { name: "Profile" }));
    expect(screen.getByTestId("jj-profile-form")).toBeInTheDocument();
    expect(screen.getByTestId("jj-profile-tree")).toBeInTheDocument();
    expect(screen.getByTestId("jj-tree-profile")).toBeInTheDocument();
    expect(screen.getByText(/Create a profile|on this device/i)).toBeInTheDocument();
    expect(screen.getByTestId("jj-profile-paths-locked")).toBeInTheDocument();
    expect(screen.queryByTestId("jj-path-library")).not.toBeInTheDocument();
    expect(screen.queryByText(/cloud sync/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("jj-preferences")).not.toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.type(screen.getByRole("textbox", { name: /^email$/i }), "sam@example.com");
    await user.type(screen.getByRole("textbox", { name: /location/i }), "On this device");
    await user.click(screen.getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText(/Profile created\. Stored on this device/i)).toBeInTheDocument();
    expect(screen.getByTestId("jj-path-library")).toBeInTheDocument();
    const profile = await runtime.profiles.get();
    expect(profile?.displayName).toBe("Sam Chen");
    expect(profile?.email).toBe("sam@example.com");
    expect(profile?.location).toMatch(/device/i);
  });

  it("creates and selects a Path under identity without sending", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    await user.type(screen.getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(screen.getByRole("button", { name: "Create profile" }));
    expect(await screen.findByTestId("jj-path-library")).toBeInTheDocument();
    expect(screen.getByText(/^Paths$/)).toBeInTheDocument();
    expect(screen.queryByText(/sub-profile/i)).not.toBeInTheDocument();

    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.type(screen.getByRole("textbox", { name: /notes/i }), "Primary web path");
    await user.click(screen.getByRole("button", { name: "Add path" }));

    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Fullstack Developer · Active|Fullstack Developer$/),
    ).toBeInTheDocument();

    await user.clear(screen.getByTestId("jj-path-name-input"));
    await user.type(screen.getByTestId("jj-path-name-input"), "Mobile App");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/Mobile App · Active|Mobile App$/)).toBeInTheDocument();

    const selectButtons = screen.getAllByRole("button", { name: "Select" });
    await user.click(selectButtons[selectButtons.length - 1]!);
    expect(await screen.findByText(/path selected\. nothing was sent/i)).toBeInTheDocument();

    expect((await runtime.pathLibrary.getSelected())?.name).toBe("Mobile App");
    expect(await runtime.pathLibrary.list()).toHaveLength(2);
  });

  it("imports a resume under a Path", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const imported: string[] = [];
    runtime.bus.subscribe("Resume.Imported", async (event) => {
      imported.push(event.payload.resumeId);
    });

    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    await user.type(screen.getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(screen.getByRole("button", { name: "Create profile" }));
    expect(await screen.findByTestId("jj-path-library")).toBeInTheDocument();
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    // New path opens the resume panel automatically.
    const path = (await runtime.pathLibrary.list())[0]!;
    expect(screen.getByTestId(`jj-path-resumes-${path.id}`)).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: /version label/i }), "Baseline 2026");
    const file = new File(["# Sam Chen\nStaff engineer\n"], "sam-chen.md", {
      type: "text/markdown",
    });
    await user.upload(screen.getByTestId(`jj-path-resume-file-${path.id}`), file);
    await user.click(screen.getByRole("button", { name: "Import resume" }));

    expect(await screen.findByText(/Resume imported for this path/i)).toBeInTheDocument();
    const versions = await runtime.resumeLibrary.list();
    expect(versions).toHaveLength(1);
    expect(versions[0]?.label).toBe("Baseline 2026");
    expect(versions[0]?.pathId).toBe(path.id);
    expect(imported).toEqual([versions[0]?.id]);
    expect((await runtime.pathLibrary.get(path.id))?.selectedResumeVersionId).toBe(versions[0]?.id);
  });

  it("selects a resume version for a Path without sending", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    await runtime.profiles.upsert({ displayName: "Sam Chen" });
    const path = await runtime.pathLibrary.upsert({ name: "Fullstack Developer" });
    const baseline = await runtime.resumeLibrary.import({
      label: "Baseline",
      fileName: "base.md",
      bytes: new TextEncoder().encode("# Baseline"),
      pathId: path.id,
    });
    await runtime.pathLibrary.upsert({
      id: path.id,
      name: path.name,
      selectedResumeVersionId: baseline.id,
    });
    const alternate = await runtime.resumeLibrary.import({
      label: "Alternate",
      fileName: "alt.md",
      bytes: new TextEncoder().encode("# Alternate"),
      pathId: path.id,
    });

    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    await user.click(screen.getByTestId(`jj-tree-path-${path.id}`));
    const resumes = screen.getByTestId(`jj-path-resumes-${path.id}`);
    await user.click(within(resumes).getByRole("button", { name: "Select" }));

    expect(
      await screen.findByText(/Resume selected for this path\. Nothing was sent/i),
    ).toBeInTheDocument();
    expect((await runtime.resumeLibrary.getSelected())?.id).toBe(alternate.id);
    expect((await runtime.pathLibrary.get(path.id))?.selectedResumeVersionId).toBe(alternate.id);
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
    expect(screen.queryByTestId("jj-profile-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("jj-path-library")).not.toBeInTheDocument();
    expect(
      screen.getByDisplayValue("/Users/sam/Library/Application Support/JobJitsu"),
    ).toBeInTheDocument();

    const pathField = screen.getByRole("textbox", { name: "Folder path" });
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
    expect(screen.getByDisplayValue("/Volumes/Vault/JobJitsu")).toBeInTheDocument();
  });
});
