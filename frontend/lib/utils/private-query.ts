/** Cached account/admin data must never carry over to another signed-in user. */
export function isPrivateQueryKey(key: readonly unknown[]): boolean {
  if (key[0] === "auth" || key[0] === "admin" || key[0] === "leads") return true;
  if (key[0] === "properties") return ["my-properties", "my-stats", "manage", "translations", "admin"].includes(String(key[1]));
  return (key[0] === "projects" || key[0] === "developers") && key[1] === "admin";
}
