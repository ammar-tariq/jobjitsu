# Plugin Architecture

> User-enabled, inspectable **agent skills** — technique packs for the local black belt.

Parent: [OVERVIEW.md](./OVERVIEW.md) · Broader host hooks: [EXTENSION_SYSTEM.md](./EXTENSION_SYSTEM.md) · SDK: `packages/plugin-sdk`

---

## What a plugin is

A **plugin** is a packaged **agent skill**: a discrete, reviewable capability the Agent may invoke during preparative work (e.g. tailor strategy, parse a board HTML shape, suggest follow-up timing heuristics).

Plugins:

- Are **off until the user enables them**.
- Declare a **manifest** (name, version, capabilities, permissions).
- Run under the host’s **sandbox / capability gate**.
- **Cannot** call Send or ambient network unless explicitly granted — and high-stakes egress still goes through Queue → Send.

Plugins are not a back door to spray-and-pray or employer surveillance ([NON_GOALS](../product/NON_GOALS.md)).

---

## Relationship to extensions

| | Plugin | Extension |
|---|--------|-----------|
| Primary job | Agent skill / tool | Host contribution (UI, discovery source, send channel) |
| Loaded by | Plugin host in Agent/AI tool registry | Extension host in app |
| SDK | `plugin-sdk` | `extension-sdk` |

An artifact may ship both (skill + discovery source) as one installable unit with one enablement toggle — still capability-gated. See [EXTENSION_SYSTEM.md](./EXTENSION_SYSTEM.md).

---

## Manifest (conceptual)

```
id: community.tailor-concise
name: Concise tailor
version: 1.2.0
engines.jobjitsu: ">=0.x"
capabilities:
  - agent.tool
permissions:
  - ai.complete          # may ask local LLM
  - identity.read        # may read résumé
  - applications.read
  # no network.egress
entry: ./skill
```

Manifests are human-readable in-product before enablement (“inspectable trust”).

---

## Capability model (plugins)

| Capability | Allows | Denies by default |
|------------|--------|-------------------|
| `ai.complete` | Local (or user-configured) completion | Silent vendor upload |
| `identity.read` | Read profile/résumé | Write identity |
| `applications.read/write` | Draft assist | Send |
| `queue.enqueue` | Request review enqueue | Approve / send |
| `network.fetch` | Only if user granted; scoped hosts | Ambient internet |
| `send.request` | Create send *intent* via queue policy | Direct socket send |

**Hard rule:** no capability lets a plugin mark `Send.Succeeded` or skip approval when preferences require it.

---

## Host responsibilities

1. Discover plugins from configured local directories / official set.
2. Show enablement UI with permissions list (calm, precise — not fear theater).
3. Load only enabled plugins into the Agent tool registry.
4. Revoke on disable; in-flight tools cancel safely; queue remains intact.
5. Log `Plugin.Enabled` / `Plugin.Disabled` to Timeline when relevant to trust.

---

## Runtime shape

```
Agent planner
    │
    ▼
Tool registry (built-in + enabled plugins)
    │
    ├── skill.invoke(ctx) → may call ai.complete / read models
    │
    └── results → Application / Queue updates → events
```

Context passed to skills is **minimum necessary** (IDs + relevant excerpts), not the entire disk.

---

## Official vs community

| Kind | Location | Trust |
|------|----------|-------|
| Official | `plugins/official/` | Reviewed with product; still user-toggleable where sensitive |
| Community | User-installed path | Manifest review + capabilities; never auto-run on clone |

---

## Failure & safety

- Skill errors surface as Agent preparative failures — plain recovery language.
- Timeouts and cancellation honor Agent.Paused.
- Malformed manifests refuse to load; no partial privilege escalation.

---

## Non-goals for plugins

- Autopilot that sends without user signal.
- Hidden ranking of candidates for employers.
- Requiring a cloud account to enable a skill.
- Obfuscated binaries as the only distributable (source or auditable build preferred for trust).
