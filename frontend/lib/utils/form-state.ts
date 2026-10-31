/** Refresh unchanged fields from the server without discarding local edits. */
export function rebaseForm<T extends object>(previous: T, current: T, incoming: T): T {
  const next = { ...incoming };
  for (const key of Object.keys(current) as (keyof T)[]) {
    if (current[key] !== previous[key]) next[key] = current[key];
  }
  return next;
}
