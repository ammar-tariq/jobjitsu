//! Native application menu — JobJitsu destinations, not generic File/View chrome.

use tauri::menu::{MenuBuilder, SubmenuBuilder};
use tauri::{AppHandle, Emitter, Runtime};

/// Install the macOS / desktop menu bar and emit `shell:navigate` for Go items.
pub fn install_app_menu<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
  let app_menu = SubmenuBuilder::new(app, "JobJitsu")
    .about(None)
    .separator()
    .text("nav-preferences", "Preferences…")
    .separator()
    .services()
    .separator()
    .hide()
    .hide_others()
    .show_all()
    .separator()
    .quit()
    .build()?;

  let go = SubmenuBuilder::new(app, "Go")
    .text("nav-overview", "Overview")
    .text("nav-craft", "Craft")
    .text("nav-applications", "Applications")
    .text("nav-queue", "Queue")
    .text("nav-follow-ups", "Follow-ups")
    .separator()
    .text("nav-profile", "Profile")
    .text("nav-job-mail", "Job Mail")
    .text("nav-sources", "Sources")
    .separator()
    .text("nav-agent", "Agent")
    .text("nav-timeline", "Timeline")
    .separator()
    .text("nav-preferences-go", "Preferences")
    .build()?;

  let edit = SubmenuBuilder::new(app, "Edit")
    .undo()
    .redo()
    .separator()
    .cut()
    .copy()
    .paste()
    .select_all()
    .build()?;

  let window = SubmenuBuilder::new(app, "Window")
    .minimize()
    .maximize()
    .separator()
    .close_window()
    .build()?;

  let menu = MenuBuilder::new(app)
    .item(&app_menu)
    .item(&go)
    .item(&edit)
    .item(&window)
    .build()?;

  app.set_menu(menu)?;

  app.on_menu_event(|app, event| {
    let id = event.id().as_ref();
    let destination = match id {
      "nav-preferences" | "nav-preferences-go" => Some("preferences"),
      "nav-overview" => Some("overview"),
      "nav-craft" => Some("craft"),
      "nav-applications" => Some("applications"),
      "nav-queue" => Some("queue"),
      "nav-follow-ups" => Some("follow-ups"),
      "nav-profile" => Some("profile"),
      "nav-job-mail" => Some("job-mail"),
      "nav-sources" => Some("sources"),
      "nav-agent" => Some("agent"),
      "nav-timeline" => Some("timeline"),
      _ => None,
    };
    if let Some(destination) = destination {
      let _ = app.emit("shell:navigate", destination);
    }
  });

  Ok(())
}
