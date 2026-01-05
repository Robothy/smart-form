/**
 * Generate a slug from form ID
 * Uses the form ID directly as the slug for guaranteed uniqueness
 *
 * @param formId - The form ID to use as slug
 * @returns The form ID as a slug
 *
 * @example
 * generateSlugFromId("550e8400-e29b-41d4-a716-446655440000")
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateSlugFromId(formId: string): string {
  return formId
}
