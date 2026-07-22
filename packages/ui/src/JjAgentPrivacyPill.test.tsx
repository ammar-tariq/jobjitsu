import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JjAgentPrivacyPill } from "./JjAgentPrivacyPill.js";

afterEach(() => {
  cleanup();
});

describe("JjAgentPrivacyPill", () => {
  it("renders Agent · On-device by default with accessible name", () => {
    render(<JjAgentPrivacyPill />);
    const pill = screen.getByRole("status", { name: "Agent · On-device" });
    expect(pill).toHaveTextContent("Agent · On-device");
  });

  it("does not use LLM wording in the default label", () => {
    render(<JjAgentPrivacyPill />);
    expect(screen.getByTestId("jj-agent-privacy-pill").textContent).not.toMatch(/llm/i);
  });
});
