import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { JjAgentPrivacyPill, labelForAgentPrivacy } from "./JjAgentPrivacyPill.js";

afterEach(() => {
  cleanup();
});

describe("JjAgentPrivacyPill", () => {
  it("defaults to calm Agent · Unavailable", () => {
    render(<JjAgentPrivacyPill />);
    const pill = screen.getByRole("status", { name: "Agent · Unavailable" });
    expect(pill).toHaveTextContent("Agent · Unavailable");
    expect(pill).toHaveAttribute("data-state", "unavailable");
  });

  it("renders Agent · On-device for local ready state", () => {
    render(<JjAgentPrivacyPill state="on-device" />);
    expect(screen.getByRole("status", { name: "Agent · On-device" })).toBeInTheDocument();
  });

  it("renders Agent · Ready without claiming on-device for remote-ready", () => {
    render(<JjAgentPrivacyPill state="ready" />);
    expect(screen.getByRole("status", { name: "Agent · Ready" })).toBeInTheDocument();
    expect(screen.getByTestId("jj-agent-privacy-pill").textContent).not.toMatch(/on-device/i);
  });

  it("does not use LLM wording in any standard label", () => {
    for (const state of ["unavailable", "on-device", "ready"] as const) {
      expect(labelForAgentPrivacy(state)).not.toMatch(/llm/i);
    }
  });
});
