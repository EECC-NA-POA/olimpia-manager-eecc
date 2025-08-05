import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // Allow common formatting tags but strip dangerous elements
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    // Prevent dangerous attributes
    FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
    // Remove script tags and event handlers
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input']
  });
};

/**
 * Extracts the first line of HTML content and sanitizes it
 * @param html - The HTML string to process
 * @returns Sanitized first line of HTML
 */
export const sanitizeFirstLine = (html: string): string => {
  const firstLine = html.split('\n')[0] || html.substring(0, 200);
  return sanitizeHtml(firstLine);
};