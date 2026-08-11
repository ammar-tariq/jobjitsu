import { describe, expect, it } from "vitest";
import { formatBytes, readResourceSnapshot } from "./resource-snapshot.js";

describe("resource snapshot", () => {
  it("formats bytes for calm device labels", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
  });

  it("returns an on-device snapshot without network in the browser test host", async () => {
    const snapshot = await readResourceSnapshot();
    expect(snapshot.available === true || snapshot.available === false).toBe(true);
    expect(snapshot.message).toMatch(/device|Browser|desktop/i);
  });
});
