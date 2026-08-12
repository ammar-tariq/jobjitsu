/**
 * Overlay a patch field onto an existing optional value.
 * `undefined` keeps current; `null` clears.
 */
export function overlayOptional<T>(
  current: T | undefined,
  patch: T | null | undefined,
): T | undefined {
  if (patch === undefined) {
    return current;
  }
  if (patch === null) {
    return undefined;
  }
  return patch;
}
