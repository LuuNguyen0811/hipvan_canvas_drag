/**
 * Parse inline markdown formatting in text
 * Supports: **bold**, *italic*, __bold__, _italic_
 */

export function parseInlineMarkdown(text: string): (string | { type: 'bold' | 'italic'; content: string })[] {
  if (!text) return []
  
  const result: (string | { type: 'bold' | 'italic'; content: string })[] = []
  
  // Regex to match **bold** or *italic* or __bold__ or _italic_
  const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g
  
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index))
    }
    
    // Add the formatted text
    if (match[1]) {
      // **bold** or __bold__
      result.push({ type: 'bold', content: match[2] })
    } else if (match[3]) {
      // *italic* or _italic_
      result.push({ type: 'italic', content: match[4] })
    }
    
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex))
  }
  
  return result
}

export function renderInlineMarkdownToHTML(text: string): string {
  const parsed = parseInlineMarkdown(text)
  
  return parsed.map(part => {
    if (typeof part === 'string') {
      return part
    }
    if (part.type === 'bold') {
      return `<strong>${part.content}</strong>`
    }
    if (part.type === 'italic') {
      return `<em>${part.content}</em>`
    }
    return part.content
  }).join('')
}
