import type { BlobId, Result } from "@jobjitsu/core";

/**
 * On-device persistence contracts.
 * Implementations must not sync to cloud object stores by default.
 */

export interface StorageKey {
  readonly namespace: string;
  readonly id: string;
}

export interface KvStore {
  get<T>(key: StorageKey): Promise<Result<T | undefined>>;
  set<T>(key: StorageKey, value: T): Promise<Result<void>>;
  delete(key: StorageKey): Promise<Result<void>>;
  list(namespace: string): Promise<Result<readonly string[]>>;
}

export interface BlobPutOptions {
  readonly contentType?: string;
  readonly fileName?: string;
}

export interface BlobMeta {
  readonly id: BlobId;
  readonly contentType?: string;
  readonly fileName?: string;
  readonly byteLength: number;
  readonly createdAt: string;
}

export interface BlobStore {
  put(bytes: Uint8Array, options?: BlobPutOptions): Promise<Result<BlobMeta>>;
  get(id: BlobId): Promise<Result<Uint8Array | undefined>>;
  getMeta(id: BlobId): Promise<Result<BlobMeta | undefined>>;
  delete(id: BlobId): Promise<Result<void>>;
}

/** Document-oriented collection API over local storage. */
export interface DocumentStore<T extends { readonly id: string }> {
  get(id: string): Promise<Result<T | undefined>>;
  put(doc: T): Promise<Result<void>>;
  delete(id: string): Promise<Result<void>>;
  list(): Promise<Result<readonly T[]>>;
}

export interface StorageProvider {
  readonly kv: KvStore;
  readonly blobs: BlobStore;
  /** Absolute path root for this profile’s on-device data. */
  readonly dataRoot: string;
}
