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
