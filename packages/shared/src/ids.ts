/** Branded opaque string IDs. */
export type EntityId = string & { readonly __brand?: "EntityId" };

export type ApplicationId = EntityId & { readonly __application?: true };
export type RoleId = EntityId & { readonly __role?: true };
export type FollowUpId = EntityId & { readonly __followUp?: true };
export type PluginId = EntityId & { readonly __plugin?: true };
export type JobId = EntityId & { readonly __job?: true };
export type TimelineEntryId = EntityId & { readonly __timeline?: true };
export type BlobId = EntityId & { readonly __blob?: true };

let seq = 0;

/** Create a unique opaque id (local only — not a network identity). */
export function createEntityId(prefix = "id"): EntityId {
  seq += 1;
  const random =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${seq.toString(36)}`;
  return `${prefix}_${random}` as EntityId;
}
