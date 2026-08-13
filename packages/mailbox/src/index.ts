/** Package identity marker. */
export const PACKAGE_NAME = "@jobjitsu/mailbox" as const;

export type * from "./types.js";
export {
  CONFIDENCE_HIGH,
  CONFIDENCE_MEDIUM,
  DEFAULT_MAILBOX_SETTINGS,
  EMAIL_CLASSIFICATIONS,
  MAILBOX_ACTION_PRIORITIES,
  MAILBOX_ACTION_TYPES,
  MAILBOX_PROVIDERS,
  TIMELINE_EVENT_TYPES,
  classificationToLifecycle,
  classificationToTimelineType,
  confidenceBand,
} from "./types.js";

export { cheapJobRelatedFilter } from "./filter.js";
export {
  classifyEmailDeterministic,
  extractCompany,
  extractJobTitle,
  extractUrls,
} from "./classify.js";
export { ATS_AND_BOARD_DOMAINS, emailDomain, isAtsOrBoardDomain } from "./domains.js";
export { MATCH_WEIGHTS, pickBestMatch, scoreApplicationMatch } from "./match.js";
export { parseClassificationJson } from "./schema.js";
export {
  APPLICATION_MATCH_SYSTEM_PROMPT,
  EMAIL_CLASSIFY_PROMPT_VERSION,
  EMAIL_CLASSIFY_SYSTEM_PROMPT,
  MAILBOX_PROMPT_VERSION,
  STATUS_EXTRACT_SYSTEM_PROMPT,
  buildEmailClassifyUserPrompt,
} from "./prompts.js";
export { SAMPLE_MAILBOX_MESSAGES, contentFingerprint } from "./fingerprint.js";
export { createMailboxStore } from "./store.js";
export {
  createMailboxService,
  type CreateMailboxServiceOptions,
  type MailboxService,
} from "./service.js";
export {
  createPkcePair,
  mergeMailboxOAuthClients,
  type MailboxConnectResult,
  type MailboxOAuthClientEnv,
  type MailboxOAuthLoopback,
} from "./oauth.js";
export { ingestProviderMessage, processUnprocessedEmails } from "./process.js";
export {
  applicationFunnel,
  computeAnalytics,
  detectDuplicatePairs,
  detectNoResponseApplications,
  followUpRecommendation,
  summarizeApplications,
} from "./intelligence.js";
export { createFakeMailboxProvider } from "./providers/fake.js";
export {
  buildGmailAuthUrl,
  createGmailMailboxProvider,
  exchangeGmailCode,
  readGmailAccountEmail,
  refreshGmailTokens,
} from "./providers/gmail.js";
export {
  buildOutlookAuthUrl,
  createOutlookMailboxProvider,
  exchangeOutlookCode,
  readOutlookAccountEmail,
  refreshOutlookTokens,
} from "./providers/outlook.js";
