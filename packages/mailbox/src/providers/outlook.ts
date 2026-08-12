import type { MailboxListPage, MailboxOAuthTokens, MailboxProviderMessage } from "../types.js";
import type { MailboxProvider } from "./types.js";

export type OutlookMailboxProviderOptions = {
  readonly getTokens: () => Promise<MailboxOAuthTokens | undefined>;
  readonly putTokens?: (tokens: MailboxOAuthTokens) => Promise<void>;
  readonly getClientCredentials?: () => Promise<{
    readonly clientId?: string;
  }>;
  readonly fetchImpl?: typeof fetch;
};

type GraphMessage = {
  readonly id: string;
  readonly conversationId?: string;
  readonly subject?: string;
  readonly bodyPreview?: string;
  readonly receivedDateTime?: string;
  readonly sentDateTime?: string;
  readonly from?: { readonly emailAddress?: { readonly address?: string; readonly name?: string } };
  readonly toRecipients?: readonly { readonly emailAddress?: { readonly address?: string } }[];
  readonly hasAttachments?: boolean;
  readonly body?: { readonly content?: string };
};

type GraphListResponse = {
  readonly value?: readonly GraphMessage[];
  readonly "@odata.nextLink"?: string;
  readonly "@odata.deltaLink"?: string;
};

function toProviderMessage(message: GraphMessage): MailboxProviderMessage {
  return {
    providerMessageId: message.id,
    threadId: message.conversationId,
    senderEmail: message.from?.emailAddress?.address ?? "",
    senderName: message.from?.emailAddress?.name,
    recipients:
      message.toRecipients?.map((row) => row.emailAddress?.address ?? "").filter(Boolean) ?? [],
    subject: message.subject ?? "",
    receivedAt: message.receivedDateTime,
    sentAt: message.sentDateTime,
    direction: "inbound",
    snippet: message.bodyPreview ?? "",
    bodyText: message.body?.content,
    attachmentNames: message.hasAttachments ? ["attachment"] : [],
  };
}

/**
 * Microsoft Graph mail adapter — readonly. Tokens stay in the host secret store.
 */
export function createOutlookMailboxProvider(
  options: OutlookMailboxProviderOptions,
): MailboxProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    id: "outlook",
    async listPage(input): Promise<MailboxListPage> {
      const tokens = await resolveOutlookTokens(options);
      if (!tokens?.accessToken) {
        throw new Error("Outlook access expired. Connect Outlook again in Preferences.");
      }
      const url = resolveOutlookListUrl(input);
      const listed = (await graphJson(fetchImpl, tokens.accessToken, url)) as GraphListResponse;
      return {
        messages: (listed.value ?? []).map(toProviderMessage),
        nextCursor: listed["@odata.nextLink"],
        totalEstimate: listed.value?.length,
        historyCursor: listed["@odata.deltaLink"] ?? input.historyCursor,
      };
    },
  };
}

function resolveOutlookListUrl(input: {
  readonly cursor?: string;
  readonly since?: string;
  readonly historyCursor?: string;
  readonly pageSize?: number;
  readonly exclusiveSince?: boolean;
}): string {
  if (input.cursor?.startsWith("http")) {
    return input.cursor;
  }
  if (input.exclusiveSince && input.historyCursor?.startsWith("http")) {
    return input.historyCursor;
  }
  return buildGraphListUrl(input.since, input.pageSize ?? 25, Boolean(input.exclusiveSince));
}

function buildGraphListUrl(
  since: string | undefined,
  pageSize: number,
  exclusiveSince: boolean,
): string {
  const params = new URLSearchParams({
    $top: String(pageSize),
    $select:
      "id,conversationId,subject,bodyPreview,receivedDateTime,sentDateTime,from,toRecipients,hasAttachments,body",
    $orderby: "receivedDateTime desc",
  });
  if (since) {
    const op = exclusiveSince ? "gt" : "ge";
    params.set("$filter", `receivedDateTime ${op} ${since}`);
  }
  return `https://graph.microsoft.com/v1.0/me/messages?${params.toString()}`;
}

async function graphJson(
  fetchImpl: typeof fetch,
  accessToken: string,
  url: string,
): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 401) {
    throw new Error("Outlook access expired. Connect Outlook again in Preferences.");
  }
  if (response.status === 429) {
    throw new Error("Outlook asked us to slow down. Try sync again in a few minutes.");
  }
  if (!response.ok) {
    throw new Error("Outlook could not list mail right now. Try again.");
  }
  return response.json();
}

export function buildOutlookAuthUrl(input: {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
  readonly codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "offline_access Mail.Read",
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeOutlookCode(input: {
  readonly clientId: string;
  readonly code: string;
  readonly redirectUri: string;
  readonly codeVerifier: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<MailboxOAuthTokens> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const body = new URLSearchParams({
    client_id: input.clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.codeVerifier,
  });
  const response = await fetchImpl("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Outlook could not finish connecting. Try again.");
  }
  const json = (await response.json()) as {
    readonly access_token?: string;
    readonly refresh_token?: string;
    readonly expires_in?: number;
    readonly token_type?: string;
    readonly scope?: string;
  };
  if (!json.access_token) {
    throw new Error("Outlook could not finish connecting. Try again.");
  }
  return tokensFromMicrosoftJson(json);
}

export async function refreshOutlookTokens(input: {
  readonly clientId: string;
  readonly refreshToken: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<MailboxOAuthTokens> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const body = new URLSearchParams({
    client_id: input.clientId,
    refresh_token: input.refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetchImpl("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Outlook access expired. Connect Outlook again in Preferences.");
  }
  const json = (await response.json()) as MicrosoftTokenResponse;
  const next = tokensFromMicrosoftJson(json);
  return {
    ...next,
    refreshToken: next.refreshToken ?? input.refreshToken,
  };
}

export async function readOutlookAccountEmail(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | undefined> {
  const profile = (await graphJson(
    fetchImpl,
    accessToken,
    "https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName",
  )) as {
    readonly mail?: string;
    readonly userPrincipalName?: string;
  };
  return profile.mail ?? profile.userPrincipalName;
}

async function resolveOutlookTokens(
  options: OutlookMailboxProviderOptions,
): Promise<MailboxOAuthTokens | undefined> {
  const tokens = await options.getTokens();
  if (!tokens?.accessToken) {
    return tokens;
  }
  if (!isExpiringSoon(tokens.expiresAt) || !tokens.refreshToken || !options.getClientCredentials) {
    return tokens;
  }
  const credentials = await options.getClientCredentials();
  if (!credentials.clientId) {
    return tokens;
  }
  const next = await refreshOutlookTokens({
    clientId: credentials.clientId,
    refreshToken: tokens.refreshToken,
    fetchImpl: options.fetchImpl,
  });
  await options.putTokens?.(next);
  return next;
}

type MicrosoftTokenResponse = {
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
  readonly scope?: string;
};

function tokensFromMicrosoftJson(json: MicrosoftTokenResponse): MailboxOAuthTokens {
  if (!json.access_token) {
    throw new Error("Outlook could not finish connecting. Try again.");
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt:
      typeof json.expires_in === "number"
        ? new Date(Date.now() + json.expires_in * 1000).toISOString()
        : undefined,
    tokenType: json.token_type,
    scope: json.scope,
  };
}

function isExpiringSoon(expiresAt: string | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const at = Date.parse(expiresAt);
  return Number.isFinite(at) && at - Date.now() < 60_000;
}
