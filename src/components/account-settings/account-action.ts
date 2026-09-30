import { createSignal } from "solid-js";

interface AuthClientResult<T> {
  data: T | null;
  error: { message?: string } | null;
}

export async function unwrapAuthResult<T>(result: Promise<AuthClientResult<T>>): Promise<T> {
  const { data, error } = await result;
  if (error || data === null) {
    throw new Error(error?.message ?? "Request failed. Please try again.");
  }
  return data;
}

export function createAccountAction() {
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setPending(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, error, run };
}
