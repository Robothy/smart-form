/**
 * Copy text to clipboard using the Clipboard API with fallback
 *
 * @param text - The text to copy to clipboard
 * @returns Promise<boolean> - True if successful, false otherwise
 *
 * @example
 * await copyToClipboard("https://example.com/forms/share/abc123")
 * // Returns: true
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fall back to legacy method if Clipboard API fails
      return fallbackCopyToClipboard(text);
    }
  }

  // Use fallback for browsers without Clipboard API
  return fallbackCopyToClipboard(text);
}

/**
 * Legacy fallback for copying text to clipboard
 * Uses the deprecated document.execCommand method
 *
 * @param text - The text to copy to clipboard
 * @returns boolean - True if successful, false otherwise
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);

    // Select and copy
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');

    // Clean up
    document.body.removeChild(textarea);

    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Check if the clipboard API is available
 *
 * @returns boolean - True if clipboard API is available
 */
export function isClipboardAvailable(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}
