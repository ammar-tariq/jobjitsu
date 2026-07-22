import { expect } from "vitest";
import type { AppError, Result } from "@jobjitsu/shared";
import { isErr, isOk } from "@jobjitsu/shared";

export function expectOk<T>(result: Result<T>): T {
  expect(result.ok).toBe(true);
  if (!isOk(result)) {
    throw new Error("Expected ok Result");
  }
  return result.value;
}

export function expectErr<T>(result: Result<T>, code?: AppError["code"]): AppError {
  expect(result.ok).toBe(false);
  if (!isErr(result)) {
    throw new Error("Expected err Result");
  }
  if (code !== undefined) {
    expect(result.error.code).toBe(code);
  }
  return result.error;
}
