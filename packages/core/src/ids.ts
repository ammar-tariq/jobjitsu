/** Branded opaque string IDs — no runtime branding helper yet. */
export type EntityId = string & { readonly __brand?: "EntityId" };

export type ApplicationId = EntityId & { readonly __application?: true };
export type RoleId = EntityId & { readonly __role?: true };
export type FollowUpId = EntityId & { readonly __followUp?: true };
export type PluginId = EntityId & { readonly __plugin?: true };
export type JobId = EntityId & { readonly __job?: true };
export type TimelineEntryId = EntityId & { readonly __timeline?: true };
export type BlobId = EntityId & { readonly __blob?: true };
