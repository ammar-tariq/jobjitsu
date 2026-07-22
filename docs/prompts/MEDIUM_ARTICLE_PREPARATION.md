# Medium Article Preparation Prompt — JobJitsu

You are acting as:

- Senior Technical Writer
- Open Source Storyteller
- Software Architect
- Product Strategist

Your task is to prepare a complete article blueprint and research document for a Medium article about JobJitsu.

Do NOT write the final Medium article.

Create the technical and narrative foundation that another AI writer can transform into a polished article.

---

# Important Rules

Before starting:

1. Read every document inside `/docs`.
2. Read:
   - MANIFESTO.md
   - PLATFORM_SPECIFICATION.md
   - ARCHITECTURE_PRINCIPLES.md
   - ENGINEERING_CONSTITUTION.md
   - IMPLEMENTATION_ROADMAP.md
   - BRAND_GUIDELINES.md
   - USER_STORIES.md
3. Understand the complete project vision.
4. Do not invent features.
5. Do not exaggerate capabilities.
6. Do not make unsupported claims.

The article must represent the actual project philosophy and architecture.

---

# Article Goal

The article should explain:

Why JobJitsu exists.

The problem it solves.

The engineering philosophy behind it.

The challenges of building a privacy-first local AI agent.

The future of personal AI assistants.

---

# Main Article Theme

Explore this idea:

"Building an open-source, privacy-first AI assistant for the modern job search in a world where AI has changed how people get hired."

---

# Research Section 1 — The Problem

Analyze and explain:

## The Modern Job Market

Cover:

- Increasing difficulty of getting interviews
- Competition in online applications
- Automated screening systems
- Changing hiring workflows
- Why candidates need better tools

Do not claim AI is the only reason hiring is harder.

Explain that AI is one of many factors changing the landscape.

---

## The Accessibility Problem

Explain:

- Many AI career tools require subscriptions
- Advanced job search assistance is becoming paywalled
- Job seekers who are unemployed or transitioning careers may struggle with recurring costs

Discuss categories of tools:

- AI resume optimization
- Interview preparation platforms
- Career coaching assistants
- Job application automation tools

Do not attack specific companies.

---

# Research Section 2 — Why JobJitsu Exists

Explain:

Why an open-source alternative is valuable.

Cover:

- Local-first AI
- Privacy ownership
- No mandatory subscription
- User-controlled AI providers
- Community development

Explain:

"The goal is not to replace human decision making. The goal is to amplify the user's ability."

---

# Research Section 3 — Product Vision

Explain JobJitsu.

Include:

- Desktop application
- Cross-platform approach
- Local LLM execution
- Optional paid AI providers through user API keys
- User-selectable models
- AI agent workflow

Explain the complete user journey:

User provides resume

↓

User defines preferences

↓

AI analyzes opportunities

↓

Resume customization

↓

Cover letter generation

↓

Application organization

↓

Communication tracking

↓

Follow-up management

---

# Research Section 4 — AI Agent Architecture

Explain the agent system.

Include:

## Planner Agent

Responsibilities:

- Understand goals
- Break tasks into steps
- Coordinate workflows


## Worker Agent

Responsibilities:

- Execute approved tasks
- Generate content
- Perform transformations


## Verifier Agent

Responsibilities:

- Validate results
- Check requirements
- Ensure quality


Explain why separating these responsibilities improves reliability.

---

# Research Section 5 — Local AI Architecture

Explain:

Why local models.

Discuss:

- Privacy
- Cost reduction
- User ownership
- Offline capability
- Model flexibility

Explain:

Users can choose:

- Free local models
- Recommended models based on hardware
- Their own paid AI provider API keys

---

# Research Section 6 — Engineering Philosophy

Explain how JobJitsu is built.

Cover:

Documentation-first development:

Documentation

↓

Architecture

↓

User Stories

↓

GitHub Project

↓

Implementation

↓

Verification

↓

Release


Explain:

- Monorepo architecture
- Open-source contribution model
- Testing philosophy
- Branch workflow
- Pull request workflow
- AI-assisted development process

---

# Research Section 7 — Architecture Deep Dive

Explain:

## Desktop Application

Why desktop instead of mobile/web.

## Storage Layer

Responsibilities.

## AI Runtime

Responsibilities.

## Integration Layer

Responsibilities:

- Email
- Browser automation
- External services

## Plugin System

Why extensibility matters.

---

# Research Section 8 — Technical Challenges

Identify real engineering challenges.

Include:

## Local LLM Challenges

- Hardware limitations
- Model performance
- Context management


## AI Agent Challenges

- Reliability
- Hallucinations
- Verification


## Automation Challenges

- External service changes
- Authentication
- User privacy


## Desktop Application Challenges

- Cross-platform support
- Packaging
- Updates

---

# Research Section 9 — Open Source Vision

Explain:

Why the project is open source.

Cover:

- Transparency
- Community contribution
- Shared improvement
- Educational value
- Avoiding vendor lock-in

---

# Generate Article Structure

Create a recommended Medium article structure.

Include:

## Title Ideas

Generate 10 titles.

## Hook

Create multiple opening approaches.

## Sections

Recommend:

1. Introduction
2. The Problem
3. Why Existing Approaches Are Not Enough
4. The Idea Behind JobJitsu
5. Building a Local AI Agent
6. Architecture Overview
7. Engineering Workflow
8. Challenges
9. Lessons Learned
10. Future Vision
11. Conclusion

---

# Include Technical Visual Suggestions

Recommend diagrams:

Examples:

- System architecture diagram
- Agent workflow diagram
- Development lifecycle diagram
- Local AI pipeline diagram

---

# Final Output

Create:

docs/articles/JOBJITSU_MEDIUM_ARTICLE_BLUEPRINT.md

The output should contain:

- Article thesis
- Story structure
- Technical explanations
- Key talking points
- Architecture explanations
- Diagram suggestions
- Important quotes/themes

The document should be ready to give to Claude for writing the final Medium article.