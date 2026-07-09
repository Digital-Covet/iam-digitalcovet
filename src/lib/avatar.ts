const PORTFOLIO_BASE = "https://portfolio.digitalcovet.com";
const PUBLIC_FILE_PATH = "/api/public/file";

function decodeIfNeeded(value: string): string {
  if (value.includes("%2F") || value.includes("%3D")) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function resolveAvatarUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const url = new URL(raw);
      if (url.hostname === "portfolio.digitalcovet.com") return raw;
      const key = url.searchParams.get("key");
      return key ? `${PORTFOLIO_BASE}${PUBLIC_FILE_PATH}?key=${decodeIfNeeded(key)}` : raw;
    } catch {
      return raw;
    }
  }

  return `${PORTFOLIO_BASE}${PUBLIC_FILE_PATH}?key=${decodeIfNeeded(raw)}`;
}
