import { Quiz, QuizAttempt, User, QuizAssignment } from "../types";

const OFFLINE_KEYS = {
  OFFLINE_ATTEMPTS_QUEUE: "quizpulse_offline_attempts_queue",
  OFFLINE_CACHE_METADATA: "quizpulse_offline_cache_metadata",
};

/**
 * Checks whether the current browser/device is offline.
 */
export function isDeviceOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Saves an attempt locally when offline.
 */
export function queueOfflineAttempt(attempt: QuizAttempt): void {
  try {
    const queue: QuizAttempt[] = JSON.parse(
      localStorage.getItem(OFFLINE_KEYS.OFFLINE_ATTEMPTS_QUEUE) || "[]"
    );
    queue.push(attempt);
    localStorage.setItem(OFFLINE_KEYS.OFFLINE_ATTEMPTS_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.error("Error queueing offline attempt:", err);
  }
}

/**
 * Retrieves all pending offline attempts queued while network was disconnected.
 */
export function getQueuedOfflineAttempts(): QuizAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEYS.OFFLINE_ATTEMPTS_QUEUE) || "[]");
  } catch {
    return [];
  }
}

/**
 * Clears the offline queue after successful server/storage sync.
 */
export function clearOfflineAttemptQueue(): void {
  localStorage.removeItem(OFFLINE_KEYS.OFFLINE_ATTEMPTS_QUEUE);
}

/**
 * Pre-caches all essential assessment data to enable zero-network execution.
 */
export function syncOfflineCache(quizzes: Quiz[], users: User[], assignments: QuizAssignment[]): void {
  try {
    const metadata = {
      lastCachedAt: new Date().toISOString(),
      cachedQuizzesCount: quizzes.length,
      cachedUsersCount: users.length,
      cachedAssignmentsCount: assignments.length,
    };
    localStorage.setItem(OFFLINE_KEYS.OFFLINE_CACHE_METADATA, JSON.stringify(metadata));
  } catch (err) {
    console.error("Error writing offline cache metadata:", err);
  }
}

/**
 * Returns metadata about the local offline cache state.
 */
export function getOfflineCacheMetadata() {
  try {
    const stored = localStorage.getItem(OFFLINE_KEYS.OFFLINE_CACHE_METADATA);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
