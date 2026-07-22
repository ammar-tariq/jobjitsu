import type { RoleId } from "@jobjitsu/shared";
import type { DiscoverySource, RoleListing } from "./source.js";

export const FAKE_JOBS_SOURCE_ID = "fake-jobs" as const;

const DEFAULT_JOBS: readonly RoleListing[] = [
  {
    id: "role_fake_staff_eng" as RoleId,
    title: "Staff Engineer",
    company: "Northwind Labs",
    location: "Remote",
    description: "Build calm career tools. Local-first mindset preferred.",
    sourceId: FAKE_JOBS_SOURCE_ID,
    postedAt: "2026-07-01",
  },
  {
    id: "role_fake_product_eng" as RoleId,
    title: "Product Engineer",
    company: "Harbor Softworks",
    location: "New York, NY",
    description: "Ship desktop craft with privacy as architecture.",
    sourceId: FAKE_JOBS_SOURCE_ID,
    postedAt: "2026-07-10",
  },
  {
    id: "role_fake_platform" as RoleId,
    title: "Platform Engineer",
    company: "Cedar Systems",
    location: "Hybrid",
    description: "Own local event buses and extension hosts.",
    sourceId: FAKE_JOBS_SOURCE_ID,
    postedAt: "2026-07-15",
  },
];

export type FakeJobsSourceOptions = {
  readonly id?: string;
  readonly label?: string;
  readonly jobs?: readonly RoleListing[];
};

/**
 * Fake jobs source — fixture listings only.
 * Does **not** use Playwright, scrapers, or job-board APIs.
 */
export function createFakeJobsSource(options: FakeJobsSourceOptions = {}): DiscoverySource {
  const id = options.id ?? FAKE_JOBS_SOURCE_ID;
  const jobs = (options.jobs ?? DEFAULT_JOBS).map((job) => ({
    ...job,
    sourceId: id,
  }));

  return {
    id,
    label: options.label ?? "Fake Jobs",
    async list() {
      return jobs;
    },
  };
}
