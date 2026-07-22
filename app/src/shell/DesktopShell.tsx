import { useState, type JSX } from "react";
import { JjAgentPrivacyPill } from "@jobjitsu/ui";
import {
  APP_NAME,
  DEFAULT_SHELL_NAV_ID,
  SHELL_NAV_ITEMS,
  shellPageTitle,
  type ShellNavId,
} from "../index.js";
import { ComingSoonView } from "./ComingSoonView.js";
import { EventActivityView } from "./EventActivityView.js";

/**
 * Desktop shell — sidebar + main + status.
 * Subscribes to host activity only; must never import `@jobjitsu/ai`.
 */
export function DesktopShell(): JSX.Element {
  const [activeId, setActiveId] = useState<ShellNavId>(DEFAULT_SHELL_NAV_ID);
  const title = shellPageTitle(activeId);

  return (
    <div className="jj-shell" data-theme="dark" data-testid="jj-desktop-shell">
      <header className="jj-shell__titlebar">
        <h1 className="jj-shell__brand">{APP_NAME}</h1>
      </header>

      <div className="jj-shell__body">
        <nav className="jj-shell__nav" aria-label="Primary">
          <ul className="jj-shell__nav-list">
            {SHELL_NAV_ITEMS.map((item) => {
              const selected = item.id === activeId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      selected
                        ? "jj-shell__nav-item jj-shell__nav-item--active"
                        : "jj-shell__nav-item"
                    }
                    aria-current={selected ? "page" : undefined}
                    onClick={() => {
                      setActiveId(item.id);
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="jj-shell__main" id="main-content">
          {activeId === "dojo" ? <EventActivityView /> : <ComingSoonView title={title} />}
        </main>
      </div>

      <footer className="jj-shell__status">
        <JjAgentPrivacyPill />
      </footer>
    </div>
  );
}
