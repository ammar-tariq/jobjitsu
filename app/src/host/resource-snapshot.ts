/**
 * Local CPU / memory snapshot for Craft progress.
 * Desktop (Tauri) reads the machine; browser may show a JS-heap estimate only.
 */

export type ResourceSnapshot = {
  readonly available: boolean;
  readonly cpuPercent: number | null;
  readonly memoryUsedBytes: number | null;
  readonly memoryTotalBytes: number | null;
  readonly memoryPercent: number | null;
  readonly message?: string;
};

type TauriResourcePayload = {
  readonly available?: boolean;
  readonly cpuPercent?: number | null;
  readonly memoryUsedBytes?: number | null;
  readonly memoryTotalBytes?: number | null;
  readonly memoryPercent?: number | null;
  readonly message?: string;
};

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function browserFallback(): ResourceSnapshot {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
  };
  if (perf.memory) {
    const used = perf.memory.usedJSHeapSize;
    const total = perf.memory.jsHeapSizeLimit;
    return {
      available: true,
      cpuPercent: null,
      memoryUsedBytes: used,
      memoryTotalBytes: total,
      memoryPercent: total > 0 ? (used / total) * 100 : null,
      message: "Browser estimate (JS heap). Open the desktop app for CPU and system memory.",
    };
  }
  return {
    available: false,
    cpuPercent: null,
    memoryUsedBytes: null,
    memoryTotalBytes: null,
    memoryPercent: null,
    message: "Resource usage is available in the desktop app on this device.",
  };
}

/**
 * Read local resource usage. Never sends career data; never leaves the device.
 */
export async function readResourceSnapshot(): Promise<ResourceSnapshot> {
  if (!isTauriRuntime()) {
    return browserFallback();
  }
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const raw = await invoke<TauriResourcePayload>("get_resource_snapshot");
    return {
      available: raw.available ?? true,
      cpuPercent: raw.cpuPercent ?? null,
      memoryUsedBytes: raw.memoryUsedBytes ?? null,
      memoryTotalBytes: raw.memoryTotalBytes ?? null,
      memoryPercent: raw.memoryPercent ?? null,
      message: raw.message,
    };
  } catch {
    return {
      available: false,
      cpuPercent: null,
      memoryUsedBytes: null,
      memoryTotalBytes: null,
      memoryPercent: null,
      message: "Could not read device load right now. Agent is still working on this device.",
    };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB", "TB"] as const;
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}
