/** Exhaustiveness check for switch/if narrowing. */
export function assertNever(value: never, message = "Unexpected value"): never {
  throw new Error(`${message}: ${String(value)}`);
}
