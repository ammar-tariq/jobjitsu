import { describe, expect, it } from "vitest";
import { readMailboxOAuthClientsFromEnv } from "./mailbox-oauth-env.js";

describe("mailbox oauth env", () => {
  it("does not read developer .env keys during tests", () => {
    expect(readMailboxOAuthClientsFromEnv()).toEqual({});
  });
});
