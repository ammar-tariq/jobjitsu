import type { JSX } from "react";
import { useHostActivity } from "./HostProvider.js";

const CASCADE = ["App.Started", "Plugin.Loaded", "Resume.Generated", "Email.Synced"] as const;

/** Calm event feed for Dojo — proves bus-driven architecture. */
export function EventActivityView(): JSX.Element {
  const activity = useHostActivity();
  const cascadeDone = CASCADE.every((name) => activity.some((entry) => entry.name === name));

  return (
    <div className="jj-activity" data-testid="jj-event-activity">
      <h2 className="jj-coming-soon__title">Welcome</h2>
      <p className="jj-coming-soon__body">
        The host talks through events. This view only listens — it never calls the Agent runtime
        directly.
      </p>

      <ol className="jj-activity__cascade" aria-label="Startup cascade">
        {CASCADE.map((name) => {
          const hit = activity.find((entry) => entry.name === name);
          return (
            <li
              key={name}
              className={hit ? "jj-activity__step jj-activity__step--done" : "jj-activity__step"}
            >
              <span className="jj-activity__name">{name}</span>
              <span className="jj-activity__summary">{hit?.summary ?? "Waiting…"}</span>
            </li>
          );
        })}
      </ol>

      <p className="jj-activity__status" role="status">
        {cascadeDone ? "Startup cascade complete." : "Listening for host events…"}
      </p>
    </div>
  );
}
