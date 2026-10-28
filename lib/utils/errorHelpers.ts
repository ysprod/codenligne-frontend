/**
 * Extract a human-readable error message from an unknown error.
 * Handles Error instances, Axios-like responses, and plain strings.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message || fallback;
  }
  return fallback;
}

/**
 * Lightweight variant that returns null when there is no error.
 */
export function getErrorMessageOrNull(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    if (maybeResponse.response?.data?.message) return maybeResponse.response.data.message;
  }
  return 'Erreur inconnue';
}
