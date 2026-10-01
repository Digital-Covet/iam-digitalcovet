import { createSignal } from "solid-js";

export type TourId = "console" | "user-directory";

interface RestartRequest {
  id: TourId;
  nonce: number;
}

const STORAGE_PREFIX = "iam:tour-completed:";

const [restartRequest, setRestartRequest] = createSignal<RestartRequest>();

export { restartRequest };

export function requestTourRestart(id: TourId) {
  setRestartRequest((previous) => ({ id, nonce: (previous?.nonce ?? 0) + 1 }));
}

export function hasCompletedTour(id: TourId) {
  try {
    return localStorage.getItem(STORAGE_PREFIX + id) === "true";
  } catch {
    return true;
  }
}

export function markTourCompleted(id: TourId) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, "true");
  } catch {
    // Storage unavailable: the tour simply may show again next visit.
  }
}
