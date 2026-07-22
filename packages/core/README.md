# `@jobjitsu/core`

Shared foundations: entity IDs, pipeline stages, `Result` / `AppError`, and **logging interfaces**.

## Status

Interfaces and shared constants only — **no runtime implementations** (except exported constants like `PIPELINE_STAGES`).

## Exports

- `EntityId` and branded ID aliases
- `PIPELINE_STAGES` / `PipelineStage`
- `Result`, `AppError`, `AppErrorCode`
- `Logger`, `LogSink`, `LogRecord`

See [docs/architecture/PACKAGE_BOUNDARIES.md](../../docs/architecture/PACKAGE_BOUNDARIES.md).
