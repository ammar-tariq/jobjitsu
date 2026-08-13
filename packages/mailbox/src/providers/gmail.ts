import type { MailboxListPage, MailboxOAuthTokens, MailboxProviderMessage } from "../types.js";
import type { MailboxProvider } from "./types.js";

export type GmailMailboxProviderOptions = {
  readonly getTokens: () => Promise<MailboxOAuthTokens | undefined>;
  readonly putTokens?: (tokens: MailboxOAuthTokens) => Promise<void>;
  readonly getClientCredentials?: () => Promise<{
    readonly clientId?: string;
    readonly clientSecret?: string;
  }>;
  readonly fetchImpl?: typeof fetch;
};

type GmailListResponse = {
  readonly messages?: readonly { readonly id: string; readonly threadId?: string }[];
  readonly nextPageToken?: string;
  readonly resultSizeEstimate?: number;
};

type GmailMessageResponse = {
  readonly id: string;
  readonly threadId?: string;
  readonly internalDate?: string;
  readonly snippet?: string;
  readonly payload?: {
    readonly headers?: readonly { readonly name: string; readonly value: string }[];
    readonly filename?: string;
    readonly parts?: readonly { readonly filename?: string }[];
    readonly body?: { readonly data?: string };
  };
};

function header(
  headers: readonly { readonly name: string; readonly value: string }[] | undefined,
  name: string,
): string {
  return headers?.find((entry) => entry.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

/** Webview-safe base64url decode — Tauri has no Node `Buffer`. */
function decodeBody(data: string | undefined): string | undefined {
  if (!data) {
    return undefined;
  }
  try {
    const padded = data.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const binary = atob(`${padded}${pad}`);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return undefined;
  }
}

function parseFrom(value: string): { readonly email: string; readonly name?: string } {
  const match = value.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return { name: match[1]?.trim().replace(/^"|"$/g, ""), email: match[2]?.trim() ?? value };
  }
  return { email: value.trim() };
}

function toProviderMessage(message: GmailMessageResponse): MailboxProviderMessage {
  const headers = message.payload?.headers;
  const from = parseFrom(header(headers, "From"));
  const to = header(headers, "To")
    .split(",")
    .map((part) => parseFrom(part.trim()).email)
    .filter(Boolean);
  const dateHeader = header(headers, "Date");
  const internal = message.internalDate
    ? new Date(Number(message.internalDate)).toISOString()
    : undefined;
  const receivedAt = dateHeader ? new Date(dateHeader).toISOString() : internal;
  const attachments =
    message.payload?.parts
      ?.map((part) => part.filename)
      .filter((name): name is string => Boolean(name)) ??
    (message.payload?.filename ? [message.payload.filename] : []);
  return {
    providerMessageId: message.id,
    threadId: message.threadId,
    senderEmail: from.email,
    senderName: from.name,
    recipients: to,
    subject: header(headers, "Subject"),
    receivedAt,
    direction: "inbound",
    snippet: message.snippet ?? "",
    bodyText: decodeBody(message.payload?.body?.data),
    attachmentNames: attachments,
  };
}

/**
 * Gmail REST adapter — readonly. Tokens stay in the host secret store.
 */
export function createGmailMailboxProvider(options: GmailMailboxProviderOptions): MailboxProvider {
  const fetchImpl = options.fetchImpl ?? fetch;
  return {
    id: "gmail",
    async listPage(input): Promise<MailboxListPage> {
      const tokens = await resolveGmailTokens(options);
      if (!tokens?.accessToken) {
        throw new Error("Gmail access expired. Connect Gmail again in Preferences.");
      }
      if (input.exclusiveSince && input.historyCursor) {
        const incremental = await listGmailHistory(fetchImpl, tokens.accessToken, input);
        if (incremental) {
          return incremental;
        }
      }
      const params = new URLSearchParams({ maxResults: String(input.pageSize ?? 25) });
      if (input.cursor) {
        params.set("pageToken", input.cursor);
      }
      if (input.since) {
        // Gmail search `after:` expects YYYY/MM/DD — not a Unix timestamp.
        const day = input.since.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
          params.set("q", `after:${day.replaceAll("-", "/")}`);
        }
      }
      const listed = (await gmailJson(
        fetchImpl,
        tokens.accessToken,
        `/users/me/messages?${params.toString()}`,
      )) as GmailListResponse;
      const messages: MailboxProviderMessage[] = [];
      for (const row of listed.messages ?? []) {
        const full = (await gmailJson(
          fetchImpl,
          tokens.accessToken,
          `/users/me/messages/${encodeURIComponent(row.id)}?format=full`,
        )) as GmailMessageResponse;
        messages.push(toProviderMessage(full));
      }
      const historyId = await readGmailHistoryId(fetchImpl, tokens.accessToken);
      return {
        messages,
        nextCursor: listed.nextPageToken,
        totalEstimate: listed.resultSizeEstimate,
        historyCursor: historyId,
      };
    },
  };
}

type GmailHistoryResponse = {
  readonly history?: readonly {
    readonly messagesAdded?: readonly { readonly message?: { readonly id: string } }[];
  }[];
  readonly nextPageToken?: string;
  readonly historyId?: string;
};

async function listGmailHistory(
  fetchImpl: typeof fetch,
  accessToken: string,
  input: {
    readonly cursor?: string;
    readonly historyCursor?: string;
    readonly pageSize?: number;
  },
): Promise<MailboxListPage | undefined> {
  if (!input.historyCursor) {
    return undefined;
  }
  const params = new URLSearchParams({
    startHistoryId: input.historyCursor,
    historyTypes: "messageAdded",
    maxResults: String(input.pageSize ?? 25),
  });
  if (input.cursor) {
    params.set("pageToken", input.cursor);
  }
  const response = await fetchImpl(
    `https://gmail.googleapis.com/gmail/v1/users/me/history?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (response.status === 401) {
    throw new Error("Gmail access expired. Connect Gmail again in Preferences.");
  }
  if (response.status === 429) {
    throw new Error("Gmail asked us to slow down. Try sync again in a few minutes.");
  }
  if (response.status === 404 || response.status === 400) {
    return undefined;
  }
  if (!response.ok) {
    throw new Error("Gmail could not list mail right now. Try again.");
  }
  const listed = (await response.json()) as GmailHistoryResponse;
  const ids = new Set<string>();
  for (const row of listed.history ?? []) {
    for (const added of row.messagesAdded ?? []) {
      if (added.message?.id) {
        ids.add(added.message.id);
      }
    }
  }
  const messages: MailboxProviderMessage[] = [];
  for (const id of ids) {
    const full = (await gmailJson(
      fetchImpl,
      accessToken,
      `/users/me/messages/${encodeURIComponent(id)}?format=full`,
    )) as GmailMessageResponse;
    messages.push(toProviderMessage(full));
  }
  return {
    messages,
    nextCursor: listed.nextPageToken,
    totalEstimate: ids.size,
    historyCursor: listed.historyId ?? (await readGmailHistoryId(fetchImpl, accessToken)),
  };
}

async function readGmailHistoryId(
  fetchImpl: typeof fetch,
  accessToken: string,
): Promise<string | undefined> {
  const profile = (await gmailJson(fetchImpl, accessToken, "/users/me/profile")) as {
    readonly historyId?: string;
  };
  return profile.historyId;
}

async function gmailJson(
  fetchImpl: typeof fetch,
  accessToken: string,
  path: string,
): Promise<unknown> {
  const response = await fetchImpl(`https://gmail.googleapis.com/gmail/v1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 401) {
    throw new Error("Gmail access expired. Connect Gmail again in Preferences.");
  }
  if (response.status === 403) {
    throw new Error(
      "Gmail denied access. Enable the Gmail API on your Google Cloud project, then Sync now.",
    );
  }
  if (response.status === 429) {
    throw new Error("Gmail asked us to slow down. Try sync again in a few minutes.");
  }
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as {
        readonly error?: { readonly message?: string };
      };
      detail = body.error?.message?.trim() ?? "";
    } catch {
      detail = "";
    }
    throw new Error(
      detail
        ? `Gmail could not list mail (${detail}). Try Sync now again.`
        : "Gmail could not list mail right now. Try again.",
    );
  }
  return response.json();
}

export function buildGmailAuthUrl(input: {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
  readonly codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    access_type: "offline",
    prompt: "consent",
    state: input.state,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGmailCode(input: {
  readonly clientId: string;
  readonly clientSecret?: string;
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
  if (input.clientSecret) {
    body.set("client_secret", input.clientSecret);
  }
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    let detail = "";
    try {
      const errJson = (await response.json()) as {
        readonly error?: string;
        readonly error_description?: string;
      };
      detail = [errJson.error, errJson.error_description].filter(Boolean).join(": ");
    } catch {
      detail = "";
    }
    throw new Error(
      detail
        ? `Gmail could not finish connecting (${detail}). Check the Desktop client ID/secret and try again.`
        : "Gmail could not finish connecting. Try again.",
    );
  }
  const json = (await response.json()) as {
    readonly access_token?: string;
    readonly refresh_token?: string;
    readonly expires_in?: number;
    readonly token_type?: string;
    readonly scope?: string;
  };
  if (!json.access_token) {
    throw new Error("Gmail could not finish connecting. Try again.");
  }
  return tokensFromGoogleJson(json);
}

export async function refreshGmailTokens(input: {
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly refreshToken: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<MailboxOAuthTokens> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const body = new URLSearchParams({
    client_id: input.clientId,
    refresh_token: input.refreshToken,
    grant_type: "refresh_token",
  });
  if (input.clientSecret) {
    body.set("client_secret", input.clientSecret);
  }
  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error("Gmail access expired. Connect Gmail again in Preferences.");
  }
  const json = (await response.json()) as GoogleTokenResponse;
  const next = tokensFromGoogleJson(json);
  return {
    ...next,
    refreshToken: next.refreshToken ?? input.refreshToken,
  };
}

export async function readGmailAccountEmail(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | undefined> {
  const profile = (await gmailJson(fetchImpl, accessToken, "/users/me/profile")) as {
    readonly emailAddress?: string;
  };
  return profile.emailAddress;
}

async function resolveGmailTokens(
  options: GmailMailboxProviderOptions,
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
  const next = await refreshGmailTokens({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    refreshToken: tokens.refreshToken,
    fetchImpl: options.fetchImpl,
  });
  await options.putTokens?.(next);
  return next;
}

type GoogleTokenResponse = {
  readonly access_token?: string;
  readonly refresh_token?: string;
  readonly expires_in?: number;
  readonly token_type?: string;
  readonly scope?: string;
};

function tokensFromGoogleJson(json: GoogleTokenResponse): MailboxOAuthTokens {
  if (!json.access_token) {
    throw new Error("Gmail could not finish connecting. Try again.");
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
