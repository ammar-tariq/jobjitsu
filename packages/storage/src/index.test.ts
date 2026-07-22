import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";
import type { KvStore, StorageProvider } from "./index.js";

describe("@jobjitsu/storage", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/storage");
  });

  it("exposes storage interface shapes", () => {
    const kvKeys: Array<keyof KvStore> = ["get", "set", "delete", "list"];
    const providerKeys: Array<keyof StorageProvider> = ["kv", "blobs", "dataRoot"];
    expect(kvKeys.length).toBe(4);
    expect(providerKeys.length).toBe(3);
  });
});
