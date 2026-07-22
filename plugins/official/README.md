# Official plugins

Workspace path for first-party plugins (`@jobjitsu/plugin-*`).

Empty for now. When adding a plugin:

1. Create `plugins/official/<id>/` with `package.json`, `README.md`, `tsconfig.json`
2. Depend on `@jobjitsu/plugin-sdk` only as needed
3. Declare capabilities in a manifest (see architecture docs)
4. Keep default disabled in product preferences
