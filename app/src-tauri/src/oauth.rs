//! Loopback OAuth for Gmail / Outlook.
//!
//! Binds 127.0.0.1, opens an allowlisted sign-in URL in the system browser,
//! and captures one redirect. Tokens are exchanged in the TypeScript host —
//! this module never sees access tokens or mail.

use serde::Serialize;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::Mutex;
use std::time::{Duration, Instant};

const PREFERRED_PORT: u16 = 17342;
const WAIT_TIMEOUT: Duration = Duration::from_secs(300);
const ACCEPT_POLL: Duration = Duration::from_millis(50);

static LISTENER: Mutex<Option<TcpListener>> = Mutex::new(None);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopbackBindResult {
  redirect_uri: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoopbackWaitResult {
  code: Option<String>,
  state: Option<String>,
  error: Option<String>,
}

#[tauri::command]
pub fn oauth_loopback_bind() -> Result<LoopbackBindResult, String> {
  let mut slot = LISTENER
    .lock()
    .map_err(|_| "Could not start sign-in on this device.".to_string())?;
  *slot = None;
  let listener = TcpListener::bind(("127.0.0.1", PREFERRED_PORT))
    .or_else(|_| TcpListener::bind(("127.0.0.1", 0)))
    .map_err(|_| "Could not start sign-in on this device.".to_string())?;
  listener
    .set_nonblocking(true)
    .map_err(|_| "Could not start sign-in on this device.".to_string())?;
  let port = listener
    .local_addr()
    .map_err(|_| "Could not start sign-in on this device.".to_string())?
    .port();
  let redirect_uri = format!("http://127.0.0.1:{port}/oauth");
  *slot = Some(listener);
  Ok(LoopbackBindResult { redirect_uri })
}

#[tauri::command]
pub async fn oauth_loopback_wait() -> Result<LoopbackWaitResult, String> {
  tauri::async_runtime::spawn_blocking(wait_for_oauth_callback)
    .await
    .map_err(|_| "Could not finish sign-in on this device.".to_string())?
}

#[tauri::command]
pub fn open_oauth_url(url: String) -> Result<(), String> {
  if !is_allowed_oauth_url(&url) {
    return Err("That sign-in address is not allowed.".to_string());
  }
  open_system_url(&url)
}

fn wait_for_oauth_callback() -> Result<LoopbackWaitResult, String> {
  let listener = {
    let mut slot = LISTENER
      .lock()
      .map_err(|_| "Sign-in is not waiting on this device.".to_string())?;
    slot
      .take()
      .ok_or_else(|| "Sign-in is not waiting on this device.".to_string())?
  };
  let deadline = Instant::now() + WAIT_TIMEOUT;
  loop {
    if Instant::now() > deadline {
      return Err("Sign-in timed out. Try Connect Gmail again.".to_string());
    }
    match listener.accept() {
      Ok((mut stream, _)) => match handle_http_request(&mut stream)? {
        ParsedRequest::Ignore => continue,
        ParsedRequest::Callback { code, state, error } => {
          return Ok(LoopbackWaitResult { code, state, error });
        }
      },
      Err(err) if err.kind() == std::io::ErrorKind::WouldBlock => {
        std::thread::sleep(ACCEPT_POLL);
      }
      Err(_) => {
        return Err("Could not finish sign-in on this device.".to_string());
      }
    }
  }
}

enum ParsedRequest {
  Ignore,
  Callback {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
  },
}

fn handle_http_request(stream: &mut TcpStream) -> Result<ParsedRequest, String> {
  let _ = stream.set_read_timeout(Some(Duration::from_secs(10)));
  let mut buf = [0u8; 8192];
  let n = stream
    .read(&mut buf)
    .map_err(|_| "Could not finish sign-in on this device.".to_string())?;
  let request = String::from_utf8_lossy(&buf[..n]);
  let parsed = parse_oauth_request(&request);
  let close_page = "<!DOCTYPE html><html><body style=\"font-family:system-ui;background:#0b1220;color:#e8eef7;padding:2rem\"><p>You can close this tab and return to JobJitsu.</p></body></html>";
  let _ = write_html(stream, close_page);
  Ok(parsed)
}

fn parse_oauth_request(request: &str) -> ParsedRequest {
  let first = request.lines().next().unwrap_or("");
  let path = first.split_whitespace().nth(1).unwrap_or("");
  let path_only = path.split('?').next().unwrap_or(path);
  if path_only == "/favicon.ico" {
    return ParsedRequest::Ignore;
  }
  let query = path.split_once('?').map(|(_, q)| q).unwrap_or("");
  let mut code = None;
  let mut state = None;
  let mut error = None;
  for pair in query.split('&') {
    if pair.is_empty() {
      continue;
    }
    let (key, value) = pair.split_once('=').unwrap_or((pair, ""));
    let decoded = url_decode(value);
    match key {
      "code" => code = Some(decoded),
      "state" => state = Some(decoded),
      "error" => error = Some(decoded),
      _ => {}
    }
  }
  ParsedRequest::Callback { code, state, error }
}

fn write_html(stream: &mut TcpStream, body: &str) -> std::io::Result<()> {
  let response = format!(
    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\nContent-Length: {}\r\n\r\n{}",
    body.len(),
    body
  );
  stream.write_all(response.as_bytes())?;
  stream.flush()
}

fn url_decode(value: &str) -> String {
  let plus = value.replace('+', " ");
  let mut out = String::new();
  let bytes = plus.as_bytes();
  let mut i = 0;
  while i < bytes.len() {
    if bytes[i] == b'%' && i + 2 < bytes.len() {
      let hex = &plus[i + 1..i + 3];
      if let Ok(byte) = u8::from_str_radix(hex, 16) {
        out.push(byte as char);
        i += 3;
        continue;
      }
    }
    out.push(bytes[i] as char);
    i += 1;
  }
  out
}

fn is_allowed_oauth_url(url: &str) -> bool {
  url.starts_with("https://accounts.google.com/o/oauth2/")
    || url.starts_with("https://login.microsoftonline.com/")
}

fn open_system_url(url: &str) -> Result<(), String> {
  let result = {
    #[cfg(target_os = "macos")]
    {
      std::process::Command::new("open").arg(url).spawn()
    }
    #[cfg(target_os = "windows")]
    {
      std::process::Command::new("cmd")
        .args(["/C", "start", "", url])
        .spawn()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
      std::process::Command::new("xdg-open").arg(url).spawn()
    }
  };
  result
    .map(|_| ())
    .map_err(|_| "Could not open the sign-in page. Try again.".to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn parses_oauth_query() {
    let request = "GET /oauth?code=abc%2Fde&state=xyz HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";
    match parse_oauth_request(request) {
      ParsedRequest::Callback { code, state, error } => {
        assert_eq!(code.as_deref(), Some("abc/de"));
        assert_eq!(state.as_deref(), Some("xyz"));
        assert!(error.is_none());
      }
      ParsedRequest::Ignore => panic!("expected callback"),
    }
  }

  #[test]
  fn ignores_favicon() {
    let request = "GET /favicon.ico HTTP/1.1\r\n\r\n";
    assert!(matches!(parse_oauth_request(request), ParsedRequest::Ignore));
  }

  #[test]
  fn allows_only_provider_sign_in_urls() {
    assert!(is_allowed_oauth_url(
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=x"
    ));
    assert!(is_allowed_oauth_url(
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?x=1"
    ));
    assert!(!is_allowed_oauth_url("https://evil.example/oauth"));
    assert!(!is_allowed_oauth_url("http://127.0.0.1:17342/oauth"));
  }
}
