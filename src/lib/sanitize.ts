import sanitizeHtml from 'sanitize-html'

// Allowlist alineada con lo que RichTextEditor puede producir (negrita, cursiva,
// subrayado, listas y enlaces). Cualquier otra etiqueta o atributo se elimina.
const options: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'strong', 'i', 'em', 'u', 'ul', 'li', 'br', 'a', 'p', 'div'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
  },
}

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, options).trim()
}
