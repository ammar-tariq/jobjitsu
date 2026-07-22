import { describe, expect, it } from "vitest";
import type { ApplicationId } from "@jobjitsu/shared";
import { PACKAGE_NAME, createFakeGmailChannel } from "./index.js";

describe("@jobjitsu/send fake gmail", () => {
  it("exports package identity", () => {
    expect(PACKAGE_NAME).toBe("@jobjitsu/send");
  });

  it("records mail in an in-memory outbox without network", async () => {
    const gmail = createFakeGmailChannel();
    const result = await gmail.send({
      applicationId: "app-1" as ApplicationId,
      to: "recruiter@example.com",
      subject: "Application",
      body: "Hello",
      destinationClass: "mail",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.outcome).toBe("succeeded");
      expect(result.value.detail).toMatch(/not delivered/i);
    }
    expect(gmail.outbox).toHaveLength(1);
    expect(gmail.outbox[0]?.to).toBe("recruiter@example.com");
  });

  it("fails closed on invalid recipient", async () => {
    const gmail = createFakeGmailChannel();
    const result = await gmail.send({
      applicationId: "app-1" as ApplicationId,
      to: "not-an-email",
      subject: "x",
      body: "y",
      destinationClass: "mail",
    });
    expect(result.ok).toBe(false);
    expect(gmail.outbox).toHaveLength(0);
  });
});
