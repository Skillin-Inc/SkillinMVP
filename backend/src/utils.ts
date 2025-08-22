// Helper function to validate ID (UUID format, including Cognito userSub)
export function isValidId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof id === "string" && uuidRegex.test(id);
}
