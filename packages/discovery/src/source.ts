import type { RoleId } from "@jobjitsu/shared";

/**
 * Normalized role listing from a discovery source.
 * No Playwright / board scraping assumed.
 */
export interface RoleListing {
  readonly id: RoleId;
  readonly title: string;
  readonly company: string;
  readonly location?: string;
  readonly url?: string;
  readonly description?: string;
  readonly sourceId: string;
  readonly postedAt?: string;
}

export interface DiscoverySource {
  readonly id: string;
  readonly label: string;
  list(): Promise<readonly RoleListing[]>;
}
