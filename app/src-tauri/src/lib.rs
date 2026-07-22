//! JobJitsu native host (Tauri).
//!
//! Privileged work stays here; the React webview is presentation-only.
//! No career egress commands are registered in this slice — see ADR 0013.

use tauri_plugin_fs::FsExt;

#[tauri::command]
fn allow_data_directory(app: tauri::AppHandle, path: String) -> Result<(), String> {
  app
    .fs_scope()
    .allow_directory(&path, true)
    .map_err(|err| err.to_string())?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![allow_data_directory])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running JobJitsu");
}
