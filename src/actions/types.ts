export type ActionResult<T> = {
  data: T | null;
  error: string | null;
  fieldErrors?: Record<string, string[]>;
};
