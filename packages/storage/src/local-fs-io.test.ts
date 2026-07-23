import { describe, expect, it } from "vitest";
import { isNotFoundError } from "./local-fs-io.js";

describe("isNotFoundError", () => {
  it("recognizes Node ENOENT", () => {
    expect(isNotFoundError({ code: "ENOENT", message: "nope" })).toBe(true);
  });

  it("recognizes Tauri-style string and nested errors", () => {
    expect(isNotFoundError("path not found")).toBe(true);
    expect(isNotFoundError({ message: "No such file or directory (os error 2)" })).toBe(true);
    expect(
      isNotFoundError({
        message: "invoke failed",
        error: "os error 2: No such file or directory",
      }),
    ).toBe(true);
  });

  it("does not treat permission failures as missing", () => {
    expect(isNotFoundError({ message: "path not allowed on the configured scope" })).toBe(false);
    expect(isNotFoundError({ code: "EACCES", message: "permission denied" })).toBe(false);
  });
});
