/** Akceptuje tylko względne ścieżki aplikacji (ochrona przed open redirect). */
export function safeCallbackUrl(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/",
): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
