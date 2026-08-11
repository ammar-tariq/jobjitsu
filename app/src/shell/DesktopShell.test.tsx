import { cleanup, render, screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("heading", { level: 2, name: "Craft" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-craft-view")).toBeInTheDocument();
    expect(screen.getByTestId("jj-desktop-shell")).toHaveAttribute("data-theme", "dark");
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();

    for (const label of [
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

  it("shows one primary view and Agent listens to host events", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Agent" }));

    expect(screen.getByRole("heading", { level: 2, name: "Agent" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-event-activity")).toBeInTheDocument();
    expect(await screen.findByText("Startup cascade complete.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agent" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByTestId("jj-coming-soon")).not.toBeInTheDocument();
  });

  it("generates résumé and cover letter drafts on Craft without sending (PE28-S01)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

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
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Queue" })).toHaveAttribute("aria-current", "page");
  });

  it("tailors an editable résumé draft without sending (PE03-S04)", async () => {
    const user = userEvent.setup();
    const runtime = createHostRuntime();
    render(<App runtime={runtime} />);
    await configureStubLocalModel(runtime.preferences);
    await runtime.start();

    await user.click(screen.getByRole("button", { name: "Applications" }));
    expect(screen.getByTestId("jj-applications-view")).toBeInTheDocument();
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
    expect(screen.getByText(/Create one or more profiles/i)).toBeInTheDocument();
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
    expect(screen.getByText(/Contractor Face/)).toBeInTheDocument();
    expect(screen.getByText(/Sam Chen/)).toBeInTheDocument();
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
    expect(
      screen.getByText(/Choose a local Ollama model name so Agent can run/i),
    ).toBeInTheDocument();

    const pathField = screen.getByRole("textbox", { name: "Ollama model name" });
    await user.type(pathField, "qwen2.5:3b");
    await user.click(screen.getByRole("button", { name: "Save model" }));

    expect(await screen.findByText(/Model saved\. Stored on this device/i)).toBeInTheDocument();
    expect(await screen.findByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
  });
});
