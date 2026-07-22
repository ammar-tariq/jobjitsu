/**
 * Local identity & résumé contracts.
 * Source of truth stays on-device — never upload by default.
 */

export interface ResumeSection {
  readonly heading: string;
  readonly body: string;
}

export interface ResumeDocument {
  readonly id: string;
  readonly fullName: string;
  readonly email?: string;
  readonly headline?: string;
  readonly summary?: string;
  readonly sections: readonly ResumeSection[];
  readonly updatedAt: string;
}

/**
 * On-device profile — DATA_MODELS Profile.
 * Sensitive fields stay local; no cloud sync implied.
 */
export interface Profile {
  readonly id: string;
  readonly displayName: string;
  readonly email?: string;
  readonly location?: string;
  readonly updatedAt: string;
}

export type ProfilePatch = {
  readonly displayName?: string;
  readonly email?: string;
  readonly location?: string;
};

export interface ProfileRepository {
  get(): Promise<Profile | undefined>;
  /** Create or update; always refreshes `updatedAt`. */
  upsert(patch: ProfilePatch): Promise<Profile>;
}

export interface ResumeStore {
  getResume(): Promise<ResumeDocument | undefined>;
  saveResume(document: ResumeDocument): Promise<ResumeDocument>;
  getProfile(): Promise<Profile | undefined>;
  saveProfile(profile: Profile): Promise<Profile>;
}

/** DATA_MODELS ResumeVersion — library entry with optional original blob. */
export type ResumeFormat = "document" | "structured";

export interface ResumeVersion {
  readonly id: string;
  readonly profileId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly format: ResumeFormat;
  readonly blobId?: string;
  readonly fileName?: string;
  readonly contentType?: string;
  readonly byteLength?: number;
  /** Optional parent in the version graph (tailor / fork). */
  readonly parentVersionId?: string;
}

export type ResumeImportInput = {
  readonly label: string;
  readonly fileName: string;
  readonly bytes: Uint8Array;
  readonly contentType?: string;
  /** Defaults to a local placeholder when profile is not yet set. */
  readonly profileId?: string;
  readonly parentVersionId?: string;
};

/**
 * Resume Library — import originals on-device; select without sending.
 */
export interface ResumeLibrary {
  import(input: ResumeImportInput): Promise<ResumeVersion>;
  list(): Promise<readonly ResumeVersion[]>;
  get(id: string): Promise<ResumeVersion | undefined>;
  /** Currently selected version for applications — local only. */
  getSelected(): Promise<ResumeVersion | undefined>;
  /**
   * Pick a library version as active.
   * Must not call Send or enqueue outbound work.
   */
  select(resumeId: string): Promise<ResumeVersion>;
}
