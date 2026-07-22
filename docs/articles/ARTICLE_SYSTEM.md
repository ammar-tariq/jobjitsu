# JobJitsu Article System

How JobJitsu turns meaningful engineering milestones into community content — calmly, without turning the docs site into a marketing funnel.

**Folder layout**

```
docs/articles/
├── ARTICLE_SYSTEM.md          # This file
├── SERIES_PLAN.md             # Planned series (placeholders only for future)
├── ARTICLE_TEMPLATE.md        # Required sections for every article
├── proposals/                 # AI/human proposals awaiting approval
├── drafts/                    # In-progress articles
├── published/                 # Final published copies (repo record)
└── research/                  # Blueprints and research briefs
```

Related: [SERIES_PLAN.md](./SERIES_PLAN.md) · [ARTICLE_TEMPLATE.md](./ARTICLE_TEMPLATE.md) · [AI development workflow](../development/AI_DEVELOPMENT_WORKFLOW.md) · `.cursor/prompts/article-review.md`

---

## Why we write articles

- Document the **engineering journey**, not hype.
- Help contributors understand *why* architecture laws exist (Agent ≠ Send, local-first).
- Build trust through inspectable narrative aligned with `/docs` SSOT.
- Attract help (development, docs, testing, design, branding, community) without FOMO or urgency theater.

Articles must represent the **actual** project — no invented features, no exaggerated shipping claims.

---

## When a new article should be created

Create a proposal when the work is a **meaningful milestone**:

| Create when | Examples |
|-------------|----------|
| Architecture milestone completed | Event bus, Send boundary, AI runtime ADR landed in code |
| Major feature released | First usable Queue → Approve → Send path |
| New Agent capability introduced | Documented, tested preparative workflow that ships |
| Major engineering challenge solved | Cross-platform packaging, local model lifecycle |
| Important open-source milestone | License chosen, first external contributor path |
| Community contribution changes direction | Admitted module or policy change |

**Do not** create articles for:

- Bug fixes  
- Dependency updates  
- Small refactors  
- Minor documentation edits  
- Routine chore commits  

Default: **Not Needed**. Silence is fine.

---

## How AI detects article-worthy milestones

After a major milestone (issue closed, wave/CP advanced, or explicit human ask):

1. Run the **Historian** review (`.cursor/prompts/article-review.md`) or apply [Article Milestone Detection](../development/AI_DEVELOPMENT_WORKFLOW.md#article-milestone-detection) in the normal AI workflow.
2. Answer: What changed? Why does it matter? Is it a significant engineering story? Would the community benefit?
3. If yes → write `docs/articles/proposals/<nnn>-<slug>.md` and optionally open a GitHub issue labeled `article-needed`.
4. If no → stop. Do not invent topics.

AI **proposes**. Humans **approve**. AI does not publish without approval.

---

## Article approval workflow

```
Issue / milestone complete
        ↓
AI Article Review (Historian)
        ↓
ARTICLE_REQUIRED: YES/NO
        ↓ (if YES)
Proposal in docs/articles/proposals/
        + GitHub issue "Write Article: …" [article-needed]
        + Project field Content Status = Potential Article
        ↓
Human approval → label article-approved
        + Content Status = Approved
        ↓
Draft in docs/articles/drafts/ [article-draft]
        + Content Status = Drafting
        ↓
Publish externally (e.g. Medium) + copy in docs/articles/published/
        [article-published] + Content Status = Published
```

**Labels:** `article-needed` → `article-approved` → `article-draft` → `article-published`  
**Project field:** `Content Status` — Not Needed | Potential Article | Approved | Drafting | Published

---

## Article structure

Every article must:

1. Stay aligned with product/architecture SSOT under `/docs`.  
2. Use calm JobJitsu voice (`docs/brand/VOICE_AND_TONE.md`).  
3. Say **Agent** (not bot/autopilot) in user-facing narrative; reserve model jargon for technical depth.  
4. Include the **Join the Journey** section from [ARTICLE_TEMPLATE.md](./ARTICLE_TEMPLATE.md).  
5. State shipping status honestly (e.g. early foundation vs released capability).

---

## Community invitation

All articles end with the Join the Journey block (template). Help sought: development, documentation, testing, design, branding, community building — no pressure copy.

---

## Historical record keeping

| Location | Role |
|----------|------|
| `proposals/` | Ideas before approval |
| `drafts/` | Work in progress |
| `published/` | Canonical in-repo copy after external publish |
| `research/` | Blueprints and research (not the Medium post itself) |
| `SERIES_PLAN.md` | Series map; future slots are placeholders only |

Update `SERIES_PLAN.md` when an article moves from proposal → published. Do not invent future feature articles ahead of admitted product status.
