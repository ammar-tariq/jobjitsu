# JobJitsu Architecture Principles

Version: 1.0

> This document defines the non-negotiable architectural principles that govern the JobJitsu codebase.
>
> Every architectural decision should reinforce these principles.
>
> If an implementation conflicts with these principles, the implementation should be reconsidered.

---

# Purpose

The purpose of this document is to ensure that JobJitsu remains:

- Maintainable
- Scalable
- Extensible
- Testable
- Understandable
- Privacy-first
- Local-first

These principles apply to every package, module, plugin, and contribution.

---

# Core Philosophy

The architecture should prioritize simplicity over cleverness.

Every module should have a single responsibility.

Every dependency should be intentional.

Every abstraction should solve a real problem.

Avoid unnecessary complexity.

---

# Local First

Local execution is the default.

Core functionality must work without any external server.

Internet access should only be required for optional features such as:

- Job discovery
- Gmail synchronization
- Cloud AI providers
- Software updates

The application should never require a JobJitsu backend server.

---

# Privacy First

User data belongs to the user.

The platform should minimize external communication.

Sensitive information should remain on the user's machine whenever possible.

AI requests should use local models by default.

Cloud AI providers are optional.

Users always choose where their data is processed.

---

# Human Control

The user always has the final decision.

AI may recommend actions.

AI may prepare actions.

AI may automate repetitive work.

AI must never silently perform irreversible actions.

Examples include:

- Sending emails
- Applying for jobs
- Contacting recruiters

These actions require user approval unless Trusted Automation has been explicitly enabled.

---

# Event-Driven Architecture

The platform should be event-driven.

Modules should communicate through events rather than direct coupling whenever practical.

Examples:

Resume Imported

↓

Knowledge Updated

↓

Resume Analysis Started

↓

Resume Analysis Completed

↓

Recommendations Updated

Modules should react to events instead of polling for changes.

---

# Modular Design

Every module should have a clearly defined responsibility.

Examples:

- Resume
- Applications
- AI
- Browser Automation
- Email
- Recruiters
- Settings

Modules should remain independent.

No module should become responsible for unrelated concerns.

---

# Clean Boundaries

Every package should expose a small, intentional public API.

Internal implementation details should remain private.

Packages should communicate only through documented interfaces.

Avoid reaching into another package's internals.

---

# Dependency Direction

Dependencies should always point toward lower-level abstractions.

High-level modules must never depend directly on implementation details.

Example:

UI

↓

Application Layer

↓

Domain Layer

↓

Infrastructure

Never the reverse.

---

# Dependency Inversion

Business logic should depend on interfaces rather than implementations.

Examples:

The Resume module should depend on an AI Provider interface.

It should not depend directly on Ollama, OpenAI, or any specific provider.

This makes providers replaceable without modifying business logic.

---

# Composition Over Inheritance

Prefer composition whenever possible.

Favor small reusable components.

Avoid deep inheritance hierarchies.

---

# Plugin First

Everything that may reasonably vary should be implemented behind extension points.

Examples:

- AI Providers
- Job Providers
- Resume Templates
- Email Providers

The platform core should remain stable while plugins extend functionality.

---

# AI Provider Independence

The application must never assume a specific AI provider.

Every provider should implement a shared interface.

Supported providers should remain interchangeable.

Switching providers should not require changes elsewhere in the codebase.

---

# AI Model Independence

Business logic should not depend on specific AI models.

Changing models should require configuration changes, not code changes.

---

# AI as Infrastructure

Artificial Intelligence is infrastructure—not business logic.

Business rules belong in the application.

AI assists with:

- Generation
- Classification
- Summarization
- Planning
- Analysis

Business decisions should remain deterministic whenever possible.

---

# Event-Based AI

AI should execute only when necessary.

Example:

Import Jobs

↓

Store Jobs

↓

User Clicks Analyze

↓

Load AI

↓

Analyze Jobs

↓

Store Results

↓

Unload AI

Models should never remain loaded unnecessarily.

---

# Resource Efficiency

System resources should be treated as valuable.

The application should:

- Minimize RAM usage
- Minimize GPU usage
- Avoid unnecessary background work
- Release idle resources

Efficiency is a feature.

---

# Predictable Workflows

Long-running operations should follow predictable workflows.

Examples:

Analyze

↓

Validate

↓

Store

↓

Notify

↓

Complete

Hidden behavior should be avoided.

---

# Explicit State

Every long-running task should expose its state.

Examples:

Pending

Running

Waiting

Completed

Failed

Cancelled

State should never be inferred from implementation details.

---

# Testability

Every significant component should be testable in isolation.

Favor dependency injection where appropriate.

Avoid hidden global state.

Modules should support mocking during tests.

---

# Testing Pyramid

Testing should prioritize:

1. Unit Tests
2. Integration Tests
3. End-to-End Tests

Business logic should rely heavily on unit testing.

---

# Documentation First

Architecture should be documented before implementation.

Major architectural changes should update documentation.

Documentation is part of the implementation.

---

# Logging

Logging should provide useful diagnostic information.

Logs should never expose:

- API Keys
- OAuth Tokens
- Passwords
- Resume contents
- Email bodies

Sensitive information must always be redacted.

---

# Error Handling

Errors should be:

- Predictable
- Recoverable
- Actionable

Unexpected failures should not leave the platform in an inconsistent state.

---

# Secure by Default

The safest behavior should be the default behavior.

Examples:

- Local AI enabled by default
- Manual approval enabled by default
- Trusted Automation disabled by default
- Cloud providers disabled until configured

---

# Secrets Management

Sensitive credentials should never be stored in plain text.

The platform should use operating system credential storage whenever available.

Examples:

- macOS Keychain
- Windows Credential Manager
- Linux Secret Service

---

# Open Source Friendly

The architecture should encourage contribution.

New contributors should be able to understand package responsibilities quickly.

Complexity should be minimized.

---

# Backward Compatibility

Internal changes should avoid unnecessarily breaking plugins.

Public interfaces should evolve carefully.

Breaking changes should be intentional and documented.

---

# Single Source of Truth

Each piece of information should have one authoritative owner.

Examples:

The Knowledge Base owns career knowledge.

The Resume module presents that knowledge.

The Resume module should never duplicate the Knowledge Base.

---

# Separation of Concerns

User Interface

Responsible only for presentation.

Application Layer

Responsible for orchestrating workflows.

Domain Layer

Responsible for business rules.

Infrastructure Layer

Responsible for external systems.

Each layer should remain focused on its own responsibilities.

---

# Observability

Every important workflow should be observable.

Users and developers should understand:

- What happened
- Why it happened
- Which module performed the work
- Whether it succeeded

Avoid hidden background behavior.

---

# Simplicity

The simplest correct solution should be preferred.

Avoid introducing abstractions before they become necessary.

Architecture should evolve with the product rather than anticipating every possible future.

---

# Guiding Question

Before introducing any new dependency, abstraction, feature, or architectural pattern, ask:

> Does this make JobJitsu simpler, more maintainable, more extensible, or more understandable?

If the answer is no, it probably does not belong in the platform.