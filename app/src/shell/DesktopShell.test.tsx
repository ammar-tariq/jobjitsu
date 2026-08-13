import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { createFakeAiProvider } from "@jobjitsu/ai";
import { createMemoryAppearanceStore } from "../host/appearance-store.js";
import { createMemoryDataRootStore } from "../host/data-root-store.js";
import { createStubFileSaver } from "../host/file-saver.js";
import { createStubFolderPicker } from "../host/folder-picker.js";
import { createHostRuntime } from "../host/runtime.js";
import { configureStubLocalModel } from "../host/test-local-model.js";
import { App } from "../App.js";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});

describe("DesktopShell", () => {
  it("renders JobJitsu chrome and primary H1 nav", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    expect(screen.getByRole("heading", { level: 1, name: "JobJitsu" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Overview" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-dashboard-view")).toBeInTheDocument();
    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "dark");
    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-layout");
    expect(screen.getByTestId("jj-shell-status-bar")).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();

    for (const label of [
      "Overview",
      "Craft",
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

  it("keeps primary nav names when the window is compact", async () => {
    const previous = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    window.dispatchEvent(new Event("resize"));
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-layout", "compact");
    expect(screen.getByRole("button", { name: "Applications" })).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: previous });
  });

  it("keeps Agent chrome unavailable until the local runtime is ready", async () => {
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);

    expect(screen.getByRole("status", { name: "Agent · Unavailable" })).toBeInTheDocument();

    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-agent-privacy-pill").textContent).not.toMatch(/llm/i);
  });

  it("never shows Agent · On-device for a remote-ready provider", async () => {
    const runtime = createHostRuntime({
      ai: createFakeAiProvider({ id: "fake-remote", locality: "remote" }),
    });
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    expect(await screen.findByRole("status", { name: "Agent · Ready" })).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Agent · On-device" })).not.toBeInTheDocument();
  });

  it("shows Agent status without cascade theater", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Agent" }));

    expect(screen.getByRole("heading", { level: 2, name: "Agent" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-agent-view")).toBeInTheDocument();
    expect(await screen.findByTestId("jj-agent-status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agent" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByTestId("jj-coming-soon")).not.toBeInTheDocument();
  });

  it("generates résumé and cover letter drafts on Craft without sending (PE28-S01)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Craft" }));
    expect(screen.getByTestId("jj-craft-view")).toBeInTheDocument();
    await user.type(screen.getByTestId("jj-craft-resume-input"), "Sam Chen\nStaff engineer");
    await user.type(screen.getByTestId("jj-craft-jd-input"), "Staff Engineer at Acme");
    await user.click(screen.getByTestId("jj-craft-generate-both"));

    expect(
      await screen.findByText(
        /Drafts ready\. Edit freely — you remain the author\. Nothing was sent/i,
      ),
    ).toBeInTheDocument();
    const resumeDraft = screen.getByTestId("jj-craft-resume-draft") as HTMLTextAreaElement;
    const coverDraft = screen.getByTestId("jj-craft-cover-draft") as HTMLTextAreaElement;
    expect(resumeDraft.value).toMatch(/Tailored résumé draft/i);
    expect(coverDraft.value).toMatch(/Cover letter draft/i);
    expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
  });

  it("keeps résumé and job description when both sources are edited quickly", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Craft" }));
    const resumeInput = screen.getByTestId("jj-craft-resume-input");
    const jdInput = screen.getByTestId("jj-craft-jd-input");

    await user.click(resumeInput);
    await user.paste("Sam Chen\nStaff engineer résumé body");
    // Let the résumé patch flush on its own so the JD paste is a separate patch —
    // this is the path that used to wipe the first field.
    await waitFor(() => {
      expect(runtime.craftSession.get().resumeText).toContain("Sam Chen");
    });

    await user.click(jdInput);
    await user.paste("Staff Engineer at Acme — on-device privacy");

    await waitFor(() => {
      expect(runtime.craftSession.get().jobDescription).toContain("Staff Engineer at Acme");
    });
    expect(runtime.craftSession.get().resumeText).toContain("Sam Chen");
    expect(resumeInput).toHaveValue("Sam Chen\nStaff engineer résumé body");
    expect(jdInput).toHaveValue("Staff Engineer at Acme — on-device privacy");
  });

  it("shows a Craft working view with inputs, phases, and device load while preparing", async () => {
    const user = userEvent.setup();
    const inner = createFakeAiProvider();
    const runtime = createHostRuntime({
      ai: {
        ...inner,
        async complete(request) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          return inner.complete(request);
        },
      },
    });
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Craft" }));
    await user.type(screen.getByTestId("jj-craft-resume-input"), "Sam Chen\nStaff engineer");
    await user.type(screen.getByTestId("jj-craft-jd-input"), "Staff Engineer at Acme");
    await user.type(screen.getByTestId("jj-craft-about-company"), "Privacy-first tools");
    await user.click(screen.getByTestId("jj-craft-generate-both"));

    expect(await screen.findByTestId("jj-craft-working-view")).toBeInTheDocument();
    expect(screen.getByTestId("jj-craft-working-inputs")).toHaveTextContent(/Sam Chen/);
    expect(screen.getByTestId("jj-craft-working-inputs")).toHaveTextContent(
      /Staff Engineer at Acme/,
    );
    expect(screen.getByTestId("jj-craft-working-inputs")).toHaveTextContent(/Privacy-first tools/);
    expect(screen.getByTestId("jj-craft-working-phases")).toBeInTheDocument();
    expect(screen.getByTestId("jj-craft-working-resources")).toBeInTheDocument();
    expect(screen.getByTestId("jj-craft-resource-cpu")).toBeInTheDocument();
    expect(screen.getByTestId("jj-craft-resource-memory")).toBeInTheDocument();
    expect(screen.queryByTestId("jj-craft-resume-input")).not.toBeInTheDocument();

    expect(
      await screen.findByText(
        /Drafts ready\. Edit freely — you remain the author\. Nothing was sent/i,
        {},
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("jj-craft-working-view")).not.toBeInTheDocument();
  });

  it("previews résumé HTML and exports PDF on Craft (PE28-S02)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime({
      fileSaver: createStubFileSaver(async ({ defaultPath }) => ({
        status: "saved",
        path: `/tmp/${defaultPath}`,
      })),
    });
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Craft" }));
    await user.type(screen.getByTestId("jj-craft-resume-input"), "Sam Chen");
    await user.type(screen.getByTestId("jj-craft-jd-input"), "Staff Engineer");
    await user.click(screen.getByTestId("jj-craft-generate-resume"));
    expect(
      await screen.findByText(
        /Drafts ready\. Edit freely — you remain the author\. Nothing was sent/i,
      ),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("jj-craft-html-preview")).toBeInTheDocument();

    await user.click(screen.getByTestId("jj-craft-export-pdf"));
    expect(await screen.findByText(/Saved on this device\. Nothing was sent/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
  });

  it("refines craft drafts via chat and asks clarifying questions (PE28-S03)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Craft" }));
    await user.type(
      screen.getByTestId("jj-craft-resume-input"),
      "Sam Chen\nStaff Engineer 2019-present\n- Shipped on-device privacy tools\n- Led platform delivery",
    );
    await user.type(
      screen.getByTestId("jj-craft-jd-input"),
      "Staff Engineer at Acme — own platform reliability and mentor engineers carefully.",
    );
    await user.click(screen.getByTestId("jj-craft-generate-resume"));
    expect(
      await screen.findByText(
        /Drafts ready\. Edit freely — you remain the author\. Nothing was sent/i,
      ),
    ).toBeInTheDocument();

    await user.type(
      screen.getByTestId("jj-craft-chat-input"),
      "Make the summary more systems-focused",
    );
    await user.click(screen.getByTestId("jj-craft-chat-send"));
    expect(await screen.findByTestId("jj-craft-chat-log")).toBeInTheDocument();
    expect(await screen.findByTestId("jj-craft-status")).toHaveTextContent(
      /Draft updated from your request\. Edit freely — you remain the author\. Nothing was sent/i,
    );
    expect(screen.queryByRole("button", { name: /approve send/i })).not.toBeInTheDocument();

    await user.clear(screen.getByTestId("jj-craft-resume-input"));
    await user.type(screen.getByTestId("jj-craft-resume-input"), "thin");
    await user.type(screen.getByTestId("jj-craft-chat-input"), "invent fake experience");
    await user.click(screen.getByTestId("jj-craft-chat-send"));
    expect(await screen.findByTestId("jj-craft-status")).toHaveTextContent(
      /Agent asked a few clarifying questions\. Nothing was sent/i,
    );
  });

  it("switches main title when navigating", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Queue" }));

    expect(screen.getByRole("heading", { level: 2, name: "Queue" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-queue-view")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Queue" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByTestId("jj-coming-soon")).not.toBeInTheDocument();
  });

  it("reviews queue without sending and surfaces approval preference", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    await user.click(screen.getByTestId("jj-application-new-draft"));
    await user.type(screen.getByTestId("jj-application-company"), "Acme");
    await user.type(screen.getByTestId("jj-application-role"), "Engineer");
    await user.click(screen.getByTestId("jj-application-save"));
    expect(await screen.findByText(/Application draft saved/i)).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-ready-for-review"));
    expect(await screen.findByText(/Marked ready for review/i)).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-editor-dialog-close"));
    await waitFor(() => {
      expect(screen.queryByTestId("jj-application-draft-dialog")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Queue" }));
    expect(screen.getByTestId("jj-queue-view")).toBeInTheDocument();
    expect(screen.getByText(/Acme · Engineer/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(await screen.findByText(/Approved on this device/i)).toBeInTheDocument();
    expect(screen.getByTestId("jj-queue-empty")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-approval-before-send")).toBeInTheDocument();
    expect(screen.getByLabelText(/Require approval before send/i)).toBeChecked();
  });

  it("tailors an editable résumé draft without sending (PE03-S04)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-applications-view")).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-new-draft"));
    await user.type(screen.getByTestId("jj-application-company"), "Acme");
    await user.type(screen.getByTestId("jj-application-role"), "Staff Engineer");
    await user.click(screen.getByTestId("jj-application-save"));

    expect(
      await screen.findByText(/Application draft saved\. Nothing was sent/i),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-tailor"));

    expect(
      await screen.findByText(
        /Draft ready\. Edit freely — you remain the author\. Nothing was sent/i,
      ),
    ).toBeInTheDocument();
    const draftField = screen.getByTestId("jj-application-resume-draft") as HTMLTextAreaElement;
    expect(draftField.value).toMatch(/Tailored résumé draft/i);
    expect(screen.queryByRole("button", { name: /send/i })).not.toBeInTheDocument();
  });

  it("lists applications with status and opens detail (PE08-S04)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-application-empty")).toBeInTheDocument();
    expect(screen.getByText("No applications yet")).toBeInTheDocument();

    await user.click(screen.getByTestId("jj-application-new-draft"));
    await user.type(screen.getByTestId("jj-application-company"), "Acme");
    await user.type(screen.getByTestId("jj-application-role"), "Staff Engineer");
    await user.type(screen.getByTestId("jj-application-notes"), "Local craft notes");
    await user.click(screen.getByTestId("jj-application-save"));
    expect(
      await screen.findByText(/Application draft saved\. Nothing was sent/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    await user.type(screen.getByTestId("jj-application-company"), "Globex");
    await user.type(screen.getByTestId("jj-application-role"), "Platform Lead");
    await user.click(screen.getByTestId("jj-application-save"));
    expect(
      await screen.findByText(/Application draft saved\. Nothing was sent/i),
    ).toBeInTheDocument();

    await user.click(screen.getByTestId("jj-editor-dialog-close"));

    const list = screen.getByTestId("jj-application-list");
    expect(within(list).getByText(/Acme · Staff Engineer/i)).toBeInTheDocument();
    expect(within(list).getByText(/Globex · Platform Lead/i)).toBeInTheDocument();
    expect(within(list).getAllByText("Discovered").length).toBeGreaterThanOrEqual(2);

    const acmeRow = within(list)
      .getByText(/Acme · Staff Engineer/i)
      .closest("div[role='button']");
    expect(acmeRow).toBeTruthy();
    await user.click(acmeRow!);

    expect(screen.getByTestId("jj-application-draft-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("jj-application-detail-title")).toHaveTextContent(
      /Edit draft · Discovered/i,
    );
    expect(screen.getByTestId("jj-application-company")).toHaveValue("Acme");
    expect(screen.getByTestId("jj-application-role")).toHaveValue("Staff Engineer");
    expect(screen.getByTestId("jj-application-notes")).toHaveValue("Local craft notes");
    expect(screen.getByTestId("jj-application-resume-draft")).toBeInTheDocument();
    expect(screen.getByTestId("jj-application-cover-draft")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /approve send/i })).not.toBeInTheDocument();
  });

  it("generates an editable cover letter without sending (PE08-S02)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-applications-view")).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-new-draft"));
    await user.type(screen.getByTestId("jj-application-company"), "Acme");
    await user.type(screen.getByTestId("jj-application-role"), "Staff Engineer");
    await user.click(screen.getByTestId("jj-application-save"));

    expect(
      await screen.findByText(/Application draft saved\. Nothing was sent/i),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-cover-letter"));

    expect(await screen.findByTestId("jj-application-status")).toHaveTextContent(
      /Cover letter ready\. Edit freely — you remain the author\. Nothing was sent/i,
    );
    const coverField = screen.getByTestId("jj-application-cover-draft") as HTMLTextAreaElement;
    expect(coverField.value).toMatch(/Cover letter draft/i);
    expect(screen.queryByRole("button", { name: /approve send/i })).not.toBeInTheDocument();
  });

  it("toggles appearance from Preferences and keeps it on the shared store", async () => {
    const user = userEvent.setup();
    const appearance = createMemoryAppearanceStore("dark");
    const runtime = createHostRuntime({ appearance });
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-preferences")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(await screen.findByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(await appearance.getTheme()).toBe("light");
  });

  it("groups Preferences into quiet panels without LLM copy", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(
      screen.getByRole("heading", { level: 3, name: "Outbound approval" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "On-device Agent model" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Reset" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3, name: "Email" })).not.toBeInTheDocument();
    expect(screen.getByTestId("jj-preferences").textContent).not.toMatch(/llm/i);
  });

  it("saves profile on-device through the identity bridge", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    expect(screen.getByTestId("jj-profile-tree")).toBeInTheDocument();
    expect(screen.getByTestId("jj-tree-create-profile")).toBeInTheDocument();
    expect(screen.getByTestId("jj-profile-create-form")).toBeInTheDocument();
    expect(screen.getByText(/One identity on this screen/i)).toBeInTheDocument();
    expect(screen.queryByTestId("jj-path-library")).not.toBeInTheDocument();
    expect(screen.queryByText(/cloud sync/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("jj-preferences")).not.toBeInTheDocument();

    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.type(
      within(createForm).getByRole("textbox", { name: /^email$/i }),
      "sam@example.com",
    );
    await user.type(
      within(createForm).getByRole("textbox", { name: /location/i }),
      "On this device",
    );
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));

    expect(await screen.findByText(/Profile created\. Stored on this device/i)).toBeInTheDocument();
    expect(screen.getByTestId("jj-path-library")).toBeInTheDocument();
    expect(screen.getByTestId("jj-profile-form")).toBeInTheDocument();
    const profile = await runtime.profiles.get();
    expect(profile?.displayName).toBe("Sam Chen");
    expect(profile?.email).toBe("sam@example.com");
    expect(profile?.location).toMatch(/device/i);
  });

  it("creates a second profile without replacing the first", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    expect(await screen.findByText(/Profile created/i)).toBeInTheDocument();

    await user.click(screen.getByTestId("jj-tree-create-profile"));
    const secondForm = screen.getByTestId("jj-profile-create-form");
    await user.type(
      within(secondForm).getByRole("textbox", { name: /display name/i }),
      "Contractor Face",
    );
    await user.click(within(secondForm).getByRole("button", { name: "Create profile" }));
    expect(await screen.findByText(/Profile created/i)).toBeInTheDocument();

    expect(await runtime.profiles.list()).toHaveLength(2);
    await user.click(screen.getByRole("combobox", { name: /Active profile/i }));
    expect(await screen.findByRole("option", { name: /Sam Chen/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Contractor Face/i })).toBeInTheDocument();
  });

  it("creates and selects a Path under identity without sending", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
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

  it("reviews then attaches import to identity and path", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const imported: string[] = [];
    runtime.bus.subscribe("Resume.Imported", async (event) => {
      imported.push(event.payload.resumeId);
    });

    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    expect(await screen.findByTestId("jj-path-library")).toBeInTheDocument();
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    const path = (await runtime.pathLibrary.list())[0]!;
    expect(screen.getByTestId(`jj-path-resumes-${path.id}`)).toBeInTheDocument();
    const file = new File(["# Sam Chen\nsam@example.com\nStaff engineer\n"], "sam-chen.md", {
      type: "text/markdown",
    });
    await user.upload(screen.getByTestId(`jj-path-resume-file-${path.id}`), file);

    const review = await screen.findByTestId(`jj-import-review-${path.id}`);
    expect(within(review).getByText(/Review import/i)).toBeInTheDocument();
    expect(await runtime.resumeLibrary.list()).toHaveLength(0);
    expect(await screen.findByText(/Agent suggested fields/i)).toBeInTheDocument();
    expect(within(review).getByRole("textbox", { name: /display name/i })).toHaveValue("Sam Chen");
    expect(within(review).getByRole("textbox", { name: /contact email/i })).toHaveValue(
      "sam@example.com",
    );

    const labelField = within(review).getByRole("textbox", { name: /version label/i });
    await user.clear(labelField);
    await user.type(labelField, "Baseline 2026");
    const notesField = within(review).getByRole("textbox", { name: /^notes$/i });
    await user.clear(notesField);
    await user.type(notesField, "Staff engineer notes");
    await user.click(within(review).getByRole("button", { name: "Save to library" }));

    const attach = await screen.findByTestId(`jj-import-attach-${path.id}`);
    expect(within(attach).getByText(/Attach resume/i)).toBeInTheDocument();
    expect((await runtime.pathLibrary.get(path.id))?.selectedResumeVersionId).toBeUndefined();

    await user.click(within(attach).getByRole("button", { name: "Both" }));

    expect(await screen.findByText(/Attached to identity and path/i)).toBeInTheDocument();
    const versions = await runtime.resumeLibrary.list();
    expect(versions).toHaveLength(1);
    expect(versions[0]?.label).toBe("Baseline 2026");
    expect(versions[0]?.pathId).toBe(path.id);
    expect(versions[0]?.contactName).toBe("Sam Chen");
    expect(versions[0]?.contactEmail).toBe("sam@example.com");
    expect(versions[0]?.notes).toBe("Staff engineer notes");
    expect(imported).toEqual([versions[0]?.id]);
    expect((await runtime.pathLibrary.get(path.id))?.selectedResumeVersionId).toBe(versions[0]?.id);
    expect((await runtime.profiles.get())?.email).toBe("sam@example.com");
  });

  it("attaches import to path only without overwriting identity", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const attached: string[] = [];
    runtime.bus.subscribe("Resume.Attached", async (event) => {
      attached.push(event.payload.resumeId);
    });

    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.type(
      within(createForm).getByRole("textbox", { name: /^email$/i }),
      "keep@example.com",
    );
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    const path = (await runtime.pathLibrary.list())[0]!;
    const file = new File(["# Other Name\n"], "other.md", { type: "text/markdown" });
    await user.upload(screen.getByTestId(`jj-path-resume-file-${path.id}`), file);
    const review = await screen.findByTestId(`jj-import-review-${path.id}`);
    expect(await screen.findByText(/Agent suggested fields/i)).toBeInTheDocument();
    expect(within(review).getByRole("textbox", { name: /display name/i })).toHaveValue(
      "Other Name",
    );
    await user.type(
      within(review).getByRole("textbox", { name: /contact email/i }),
      "other@example.com",
    );
    await user.click(within(review).getByRole("button", { name: "Save to library" }));

    const attach = await screen.findByTestId(`jj-import-attach-${path.id}`);
    await user.click(within(attach).getByRole("button", { name: "Save to path" }));

    expect(await screen.findByText(/Attached to path/i)).toBeInTheDocument();
    expect((await runtime.profiles.get())?.displayName).toBe("Sam Chen");
    expect((await runtime.profiles.get())?.email).toBe("keep@example.com");
    const versions = await runtime.resumeLibrary.list();
    expect((await runtime.pathLibrary.get(path.id))?.selectedResumeVersionId).toBe(versions[0]?.id);
    expect(attached).toEqual([versions[0]?.id]);
    expect(runtime.bridge).not.toHaveProperty("send");
  });

  it("falls back to manual import review when Agent is unavailable", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime({
      ai: createFakeAiProvider({ healthStatus: "unavailable", locality: "local" }),
    });
    render(<App runtime={runtime} />);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    const path = (await runtime.pathLibrary.list())[0]!;
    const file = new File(["# Sam Chen\n"], "sam.md", { type: "text/markdown" });
    await user.upload(screen.getByTestId(`jj-path-resume-file-${path.id}`), file);

    expect(await screen.findByTestId(`jj-import-review-${path.id}`)).toBeInTheDocument();
    expect(await screen.findByText(/Agent isn’t ready yet/i)).toBeInTheDocument();
    expect(screen.getByTestId(`jj-import-contact-name-${path.id}`)).toHaveValue("");
    expect(await runtime.resumeLibrary.list()).toHaveLength(0);
  });

  it("cancels import review without writing to the library", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    const path = (await runtime.pathLibrary.list())[0]!;
    const file = new File(["# Draft\n"], "draft.md", { type: "text/markdown" });
    await user.upload(screen.getByTestId(`jj-path-resume-file-${path.id}`), file);
    const review = await screen.findByTestId(`jj-import-review-${path.id}`);
    expect(await screen.findByText(/Agent suggested fields/i)).toBeInTheDocument();
    await user.click(within(review).getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText(/Import cancelled\. Nothing was saved/i)).toBeInTheDocument();
    expect(await runtime.resumeLibrary.list()).toHaveLength(0);
    expect(screen.queryByTestId(`jj-import-review-${path.id}`)).not.toBeInTheDocument();
  });

  it("imports a LinkedIn PDF with guidance and linkedin-pdf source", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByRole("textbox", { name: /display name/i }), "Sam Chen");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    await user.type(screen.getByTestId("jj-path-name-input"), "Fullstack Developer");
    await user.click(screen.getByRole("button", { name: "Add path" }));
    expect(await screen.findByText(/path saved/i)).toBeInTheDocument();

    const path = (await runtime.pathLibrary.list())[0]!;
    expect(screen.getByTestId(`jj-linkedin-guidance-${path.id}`)).toBeInTheDocument();
    expect(screen.getByText(/does not log into LinkedIn or scrape/i)).toBeInTheDocument();

    const file = new File(["%PDF-1.4 linkedin export"], "sam-linkedin.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByTestId(`jj-path-linkedin-file-${path.id}`), file);

    const review = await screen.findByTestId(`jj-import-review-${path.id}`);
    expect(within(review).getByText(/Review LinkedIn PDF/i)).toBeInTheDocument();
    expect(
      await within(review).findByText(/Edit what you can before saving\. Empty fields stay empty/i),
    ).toBeInTheDocument();
    await user.click(within(review).getByRole("button", { name: "Save to library" }));

    expect(await screen.findByTestId(`jj-import-attach-${path.id}`)).toBeInTheDocument();
    const versions = await runtime.resumeLibrary.list();
    expect(versions).toHaveLength(1);
    expect(versions[0]?.source).toBe("linkedin-pdf");
    expect(versions[0]?.fileName).toBe("sam-linkedin.pdf");
  });

  it("creates a Path from an existing résumé version without sending", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const profile = await runtime.profiles.upsert({ displayName: "Sam Chen" });
    const version = await runtime.resumeLibrary.import({
      label: "Baseline",
      fileName: "base.md",
      bytes: new TextEncoder().encode("# Baseline"),
      profileId: profile.id,
    });

    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    await user.click(screen.getByTestId(`jj-path-from-resume-open-${profile.id}`));
    const form = await screen.findByTestId(`jj-path-from-resume-${profile.id}`);
    expect(within(form).getByText(/Pick an existing résumé/i)).toBeInTheDocument();
    expect(within(form).queryByText(/sub-profile/i)).not.toBeInTheDocument();

    await user.type(screen.getByTestId(`jj-path-from-resume-name-${profile.id}`), "Mobile App");
    await user.type(within(form).getByRole("textbox", { name: /notes/i }), "From baseline résumé");
    await user.click(within(form).getByRole("button", { name: "Create path" }));

    expect(await screen.findByText(/Path created from résumé/i)).toBeInTheDocument();
    const paths = await runtime.pathLibrary.list();
    expect(paths).toHaveLength(1);
    expect(paths[0]?.name).toBe("Mobile App");
    expect(paths[0]?.selectedResumeVersionId).toBe(version.id);
    expect((await runtime.pathLibrary.getSelected())?.id).toBe(paths[0]?.id);
    expect((await runtime.resumeLibrary.getSelected())?.id).toBe(version.id);
    expect(runtime.bridge).not.toHaveProperty("send");
  });

  it("selects a resume version for a Path without sending", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    const profile = await runtime.profiles.upsert({ displayName: "Sam Chen" });
    const path = await runtime.pathLibrary.upsert({
      name: "Fullstack Developer",
      profileId: profile.id,
    });
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
    await configureStubLocalModel(runtime.preferences);
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
    await configureStubLocalModel(runtime.preferences);
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
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    await user.click(screen.getByRole("button", { name: "Choose folder" }));

    expect(await screen.findByText(/Data folder updated/i)).toBeInTheDocument();
    expect((await runtime.dataRoot.get()).path).toBe("/Volumes/Vault/JobJitsu");
    expect(screen.getByDisplayValue("/Volumes/Vault/JobJitsu")).toBeInTheDocument();
  });

  it("keeps Agent unavailable when model path is missing and recovers from Preferences", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await runtime.start();

    expect(await screen.findByRole("status", { name: "Agent · Unavailable" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.getByTestId("jj-local-model-path")).toBeInTheDocument();
    expect(screen.getByTestId("jj-local-model-select")).toBeInTheDocument();
    expect(screen.getByText(/Choose a local model so Agent can run/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText("Installed model"));
    await user.click(await screen.findByRole("option", { name: "qwen2.5:3b" }));
    await user.click(screen.getByRole("button", { name: "Save model" }));

    expect(await screen.findByText(/Model saved\. Stored on this device/i)).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
  });

  it("connects a sample mailbox from Job Mail and shows application intelligence", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByLabelText(/Display name/i), "Sam");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    expect(await screen.findByTestId("jj-profile-job-mail-cta")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Job Mail" }));
    expect(screen.getByTestId("jj-job-mail-view")).toBeInTheDocument();
    expect(screen.getByTestId("jj-mailbox-preferences")).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-mailbox-connect-sample"));
    expect(await screen.findByTestId("jj-mailbox-status")).toHaveTextContent(
      /sample mailbox connected/i,
    );

    await waitFor(
      async () => {
        const listed = await runtime.bridge.listMailboxIntegrations();
        expect(listed.ok).toBe(true);
        if (!listed.ok) {
          return;
        }
        const row = listed.value.integrations[0];
        expect(row?.emailsIngested).toBeGreaterThan(0);
        expect(row?.emailsTotal).toBeUndefined();
        const counts = screen.getByTestId(`jj-mailbox-counts-${row!.id}`);
        expect(counts.textContent).toMatch(/Imported [1-9]/);
        expect(counts.textContent).not.toMatch(/~/);
        const dash = await runtime.bridge.getMailboxDashboard();
        expect(dash.ok && dash.value.dashboard.summary.totalApplications).toBeGreaterThan(0);
      },
      { timeout: 12000 },
    );

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-application-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("jj-application-dashboard").textContent).toMatch(
      /[1-9]\d* applications/,
    );
  }, 20000);

  it("opens Job Mail from Applications after a profile exists", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-application-open-profile")).toBeInTheDocument();
    expect(screen.queryByTestId("jj-application-connect-gmail")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("jj-application-open-profile"));
    expect(screen.getByTestId("jj-profile")).toBeInTheDocument();

    const createForm = screen.getByTestId("jj-profile-create-form");
    await user.type(within(createForm).getByLabelText(/Display name/i), "Sam");
    await user.click(within(createForm).getByRole("button", { name: "Create profile" }));
    expect(await screen.findByTestId("jj-profile-job-mail-cta")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    await user.click(screen.getByTestId("jj-application-connect-gmail"));
    expect(screen.getByTestId("jj-job-mail-view")).toBeInTheDocument();
    expect(screen.getByTestId("jj-mailbox-connect-gmail")).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-mailbox-connect-gmail"));
    expect(await screen.findByTestId("jj-mailbox-status")).toHaveTextContent(/client ID/i);
  });

  it("requires a profile before Connect Gmail on Job Mail", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Job Mail" }));
    expect(screen.getByTestId("jj-mailbox-requires-profile")).toBeInTheDocument();
    expect(screen.queryByTestId("jj-mailbox-connect-gmail")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("jj-mailbox-open-profile"));
    expect(screen.getByTestId("jj-profile")).toBeInTheDocument();
    expect(screen.getByTestId("jj-profile-connect-requires-profile")).toBeInTheDocument();
  });

  it("shows Sources as coming soon with links to Craft and Job Mail", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Sources" }));
    expect(screen.getByTestId("jj-sources-view")).toBeInTheDocument();
    await user.click(screen.getByTestId("jj-sources-open-job-mail"));
    expect(screen.getByTestId("jj-job-mail-view")).toBeInTheDocument();
  });

  it("keeps Preferences free of the mailbox dump and exposes Reset", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    expect(screen.queryByTestId("jj-mailbox-connect-gmail")).not.toBeInTheDocument();
    expect(screen.getByTestId("jj-preferences-reset")).toBeInTheDocument();
  });
});
