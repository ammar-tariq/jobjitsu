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
  /** When set, update that profile. */
  readonly id?: string;
  readonly displayName?: string;
  readonly email?: string;
  readonly location?: string;
  /**
   * When true, always create a new local identity (PE27).
   * Without this flag, upsert updates the selected profile (or creates the first).
   */
  readonly createNew?: boolean;
};

export interface ProfileRepository {
  /** All local identities (sorted by display name). */
  list(): Promise<readonly Profile[]>;
  getById(id: string): Promise<Profile | undefined>;
  /** Currently selected identity — local only; switch ≠ send. */
  get(): Promise<Profile | undefined>;
  select(profileId: string): Promise<Profile>;
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

/** Where the original file came from — local only, never scraping. */
export type ResumeSource = "resume" | "linkedin-pdf";

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
  /** Career path this version belongs to (UI: Path). */
  readonly pathId?: string;
  /** Manual review fields (PE03-S06) — no AI required. */
  readonly contactName?: string;
  readonly contactEmail?: string;
  readonly notes?: string;
  /** Import origin — defaults to resume. */
  readonly source?: ResumeSource;
}

export type ResumeImportInput = {
  readonly label: string;
  readonly fileName: string;
  readonly bytes: Uint8Array;
  readonly contentType?: string;
  /** Defaults to a local placeholder when profile is not yet set. */
  readonly profileId?: string;
  readonly parentVersionId?: string;
  /** When set, version is scoped to that Path. */
  readonly pathId?: string;
  readonly contactName?: string;
  readonly contactEmail?: string;
  readonly notes?: string;
  readonly source?: ResumeSource;
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

/**
 * Career Path under one Profile (UI: “Path”) — Fullstack, Mobile, etc.
 * Not a second identity (that is PE27).
 */
export interface Path {
  readonly id: string;
  readonly profileId: string;
  readonly name: string;
  readonly notes?: string;
  readonly archived: boolean;
  readonly updatedAt: string;
  /** Reserved for PE03-S07 attach — optional until wired. */
  readonly selectedResumeVersionId?: string;
}

export type PathPatch = {
  /** When set, update that path; otherwise create. */
  readonly id?: string;
  readonly name: string;
  readonly notes?: string;
  readonly archived?: boolean;
  readonly profileId?: string;
  readonly selectedResumeVersionId?: string | null;
};

export type PathListOptions = {
  readonly includeArchived?: boolean;
  /** When set, only paths under that profile. */
  readonly profileId?: string;
};

/**
 * Path library — create / rename / archive / select active path.
 * Selection is local only — never Send.
 */
export interface PathLibrary {
  list(options?: PathListOptions): Promise<readonly Path[]>;
  get(id: string): Promise<Path | undefined>;
  upsert(patch: PathPatch): Promise<Path>;
  archive(pathId: string): Promise<Path>;
  getSelected(): Promise<Path | undefined>;
  select(pathId: string): Promise<Path>;
}
