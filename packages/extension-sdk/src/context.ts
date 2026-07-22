import { createServiceRegistry, type ServiceKey, type ServiceRegistry } from "@jobjitsu/core";
import type { Logger } from "@jobjitsu/logger";

/**
 * Per-extension DI context — scoped services overlay the host registry.
 * Extensions never receive ambient Node/fs/network via this context.
 */
export interface ExtensionContext {
  readonly extensionId: string;
  readonly logger: Logger;
  /** Scoped registry (child overrides parent). */
  readonly services: ServiceRegistry;
  resolve<T>(key: ServiceKey<T>): T;
  tryResolve<T>(key: ServiceKey<T>): T | undefined;
  registerService<T>(key: ServiceKey<T>, value: T): void;
}

export function createScopedServiceRegistry(parent: ServiceRegistry): ServiceRegistry {
  const local = createServiceRegistry();

  return {
    register(key, value) {
      local.register(key, value);
    },
    resolve(key) {
      if (local.has(key as ServiceKey<unknown>)) {
        return local.resolve(key);
      }
      return parent.resolve(key);
    },
    tryResolve(key) {
      if (local.has(key as ServiceKey<unknown>)) {
        return local.tryResolve(key);
      }
      return parent.tryResolve(key);
    },
    has(key) {
      return local.has(key) || parent.has(key);
    },
  };
}

export function createExtensionContext(options: {
  readonly extensionId: string;
  readonly logger: Logger;
  readonly parentServices: ServiceRegistry;
}): ExtensionContext {
  const services = createScopedServiceRegistry(options.parentServices);
  const logger = options.logger.child({ extensionId: options.extensionId });

  return {
    extensionId: options.extensionId,
    logger,
    services,
    resolve: (key) => services.resolve(key),
    tryResolve: (key) => services.tryResolve(key),
    registerService: (key, value) => {
      services.register(key, value);
    },
  };
}
