//! JobJitsu native host (Tauri).
//!
//! Privileged work stays here; the React webview is presentation-only.
//! No career egress commands are registered — see ADR 0013.

mod oauth;

use oauth::{oauth_loopback_bind, oauth_loopback_wait, open_oauth_url};
use serde::Serialize;
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, RefreshKind, System};
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn allow_data_directory(app: tauri::AppHandle, path: String) -> Result<(), String> {
  app
    .fs_scope()
    .allow_directory(&path, true)
    .map_err(|err| err.to_string())?;
  Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ResourceSnapshot {
  available: bool,
  cpu_percent: Option<f32>,
  memory_used_bytes: Option<u64>,
  memory_total_bytes: Option<u64>,
  memory_percent: Option<f32>,
  message: Option<String>,
}

/// Local machine load for Craft progress — no network, no career data.
#[tauri::command]
fn get_resource_snapshot() -> ResourceSnapshot {
  let mut sys = System::new_with_specifics(
    RefreshKind::nothing()
      .with_cpu(CpuRefreshKind::everything())
      .with_memory(MemoryRefreshKind::everything()),
  );
  // First CPU sample is often zero; brief pause then refresh for a real reading.
  std::thread::sleep(std::time::Duration::from_millis(120));
  sys.refresh_cpu_all();
  sys.refresh_memory();

  let cpu = sys.global_cpu_usage();
  let used = sys.used_memory();
  let total = sys.total_memory();
  let memory_percent = if total > 0 {
    Some((used as f64 / total as f64 * 100.0) as f32)
  } else {
    None
  };

  ResourceSnapshot {
    available: true,
    cpu_percent: Some(cpu),
    memory_used_bytes: Some(used),
    memory_total_bytes: Some(total),
    memory_percent,
    message: Some("Live from this device.".to_string()),
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![
      allow_data_directory,
      get_resource_snapshot,
      oauth_loopback_bind,
      oauth_loopback_wait,
      open_oauth_url
    ])
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
