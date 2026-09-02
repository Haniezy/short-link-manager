/**
 * Standard shape returned by every Server Action and data query.
 * `data` and `error` are mutually exclusive: exactly one is non-null.
 * Raw DB / auth errors are never leaked — callers map them to friendly strings.
 *
 * `fieldErrors` lets an action attribute the failure to a specific input
 * (e.g. "email" → "Enter a valid email address."). When present, the form
 * can render the message inline under the matching field instead of as a
 * generic toast.
 */
export type ActionResult<T> =
  | { data: T; error: null; fieldErrors?: undefined }
  | { data: null; error: string; fieldErrors?: FieldErrors };

export type FieldErrors = Partial<Record<string, string>>;

export function ok<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

export function err<T = never>(
  error: string,
  fieldErrors?: FieldErrors,
): ActionResult<T> {
  return { data: null, error, fieldErrors };
}