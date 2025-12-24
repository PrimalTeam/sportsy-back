import { API_BASE_URL } from './api-client';

export async function safeRequest<T>(
  operation: string,
  requestFn: () => Promise<T>,
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    const details = extractErrorDetails(error);
    const connectionHint = /ECONNREFUSED|ENOTFOUND|EHOSTUNREACH/i.test(details)
      ? ` Ensure the API server is running and reachable at ${API_BASE_URL}.`
      : '';

    throw new Error(
      `${operation} failed. Details: ${details}.${connectionHint}`,
    );
  }
}

function extractErrorDetails(error: unknown): string {
  if (error instanceof AggregateError) {
    if (error.errors) {
      const combined = Array.from(error.errors)
        .map((inner) =>
          inner instanceof Error ? inner.message : String(inner),
        )
        .filter(Boolean)
        .join('; ');
      if (combined) {
        return combined;
      }
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
