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

  let key = decodeIfNeeded(raw);

  if (key.startsWith("http://") || key.startsWith("https://")) {
    try {
      const url = new URL(key);
      key = url.searchParams.get("key") ?? key;
    } catch {
      return raw;
    }
  }

  return `${PORTFOLIO_BASE}${PUBLIC_FILE_PATH}?key=${key}`;
}
