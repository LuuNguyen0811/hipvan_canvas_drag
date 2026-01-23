/**
 * HTML Parser Service
 * Parse, sanitize, and extract information from HTML input
 */

export interface ParsedHTML {
  html: string; // Sanitized HTML
  css: string; // Extracted/inline styles
  stylesheets: string[]; // External stylesheet URLs
  scripts: string[]; // External script URLs (for reference)
  assets: string[]; // Image/media URLs
  title: string;
  bodyContent: string; // Just the body content
}

// List of dangerous tags to remove
const DANGEROUS_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "meta",
  "link",
  "base",
];

// List of dangerous attributes to remove
const DANGEROUS_ATTRS = [
  "onclick",
  "onload",
  "onerror",
  "onmouseover",
  "onmouseout",
  "onkeydown",
  "onkeyup",
  "onsubmit",
  "onfocus",
  "onblur",
  "onchange",
  "oninput",
];

/**
 * Extract CSS from HTML (both inline styles and style tags)
 */
function extractCSS(html: string): string {
  const cssBlocks: string[] = [];

  // Extract style tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    cssBlocks.push(match[1]);
  }

  // Extract linked stylesheets (keep the link tags for proper loading)
  const linkRegex = /<link[^>]*href=["']([^"']*\.css[^"']*)["'][^>]*>/gi;
  while ((match = linkRegex.exec(html)) !== null) {
    cssBlocks.push(`/* External stylesheet: ${match[1]} */`);
  }

  return cssBlocks.join("\n\n");
}

/**
 * Extract all link tags for stylesheets
 */
function extractStylesheetLinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
  const linkRegex2 = /<link[^>]*href=["']([^"']*\.css[^"']*)["'][^>]*>/gi;
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }
  while ((match = linkRegex2.exec(html)) !== null) {
    if (!links.includes(match[1])) {
      links.push(match[1]);
    }
  }
  
  return links;
}

/**
 * Extract script URLs from HTML
 */
function extractScripts(html: string): string[] {
  const scripts: string[] = [];
  const scriptRegex = /<script[^>]*src=["']([^"']*)["'][^>]*>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }
  return scripts;
}

/**
 * Extract asset URLs (images, videos, etc.) from HTML
 */
function extractAssets(html: string): string[] {
  const assets: string[] = [];
  const assetPatterns = [
    /<img[^>]*src=["']([^"']*)["'][^>]*>/gi,
    /<video[^>]*src=["']([^"']*)["'][^>]*>/gi,
    /<audio[^>]*src=["']([^"']*)["'][^>]*>/gi,
    /<source[^>]*src=["']([^"']*)["'][^>]*>/gi,
  ];

  for (const pattern of assetPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1] && !match[1].startsWith("data:")) {
        assets.push(match[1]);
      }
    }
  }

  return [...new Set(assets)]; // Remove duplicates
}

/**
 * Extract title from HTML
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : "Untitled Page";
}

/**
 * Extract body content from HTML
 */
function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1].trim() : html;
}

/**
 * Sanitize HTML by removing dangerous elements and attributes
 */
export function sanitizeHTML(html: string): string {
  let sanitized = html;

  // Remove dangerous tags and their content
  for (const tag of DANGEROUS_TAGS) {
    const tagRegex = new RegExp(
      `<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`,
      "gi"
    );
    sanitized = sanitized.replace(tagRegex, "");
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, "gi");
    sanitized = sanitized.replace(selfClosingRegex, "");
  }

  // Remove dangerous attributes
  for (const attr of DANGEROUS_ATTRS) {
    const attrRegex = new RegExp(`\\s${attr}=["'][^"']*["']`, "gi");
    sanitized = sanitized.replace(attrRegex, "");
    // Also handle attributes without quotes
    const attrNoQuoteRegex = new RegExp(`\\s${attr}=[^\\s>]*`, "gi");
    sanitized = sanitized.replace(attrNoQuoteRegex, "");
  }

  // Remove javascript: URLs
  sanitized = sanitized.replace(/href=["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src=["']javascript:[^"']*["']/gi, 'src=""');

  return sanitized;
}

/**
 * Parse HTML and extract all relevant information
 */
export function parseHTML(input: string): ParsedHTML {
  // Trim and normalize input
  const normalizedInput = input.trim();

  // Check if it's a full HTML document or just a fragment
  const isFullDocument =
    normalizedInput.toLowerCase().includes("<!doctype") ||
    normalizedInput.toLowerCase().includes("<html");

  // Extract components
  const css = extractCSS(normalizedInput);
  const stylesheets = extractStylesheetLinks(normalizedInput);
  const scripts = extractScripts(normalizedInput);
  const assets = extractAssets(normalizedInput);
  const title = extractTitle(normalizedInput);

  // Get body content
  const bodyContent = isFullDocument
    ? extractBodyContent(normalizedInput)
    : normalizedInput;

  // Sanitize the HTML (but keep styles intact)
  const sanitizedBody = sanitizeHTML(bodyContent);

  // Build stylesheet link tags
  const stylesheetLinks = stylesheets
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("\n  ");

  // Extract original head content for styles
  const headMatch = normalizedInput.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const originalHead = headMatch ? headMatch[1] : "";
  
  // Extract all style tags from original head
  const originalStyles: string[] = [];
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleTagRegex.exec(originalHead)) !== null) {
    originalStyles.push(styleMatch[0]);
  }

  // Create a complete HTML document for rendering
  const sanitizedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${stylesheetLinks}
  ${originalStyles.join("\n  ")}
  <style>
    /* Base styles */
    * { box-sizing: border-box; }
    img { max-width: 100%; height: auto; }
    
    /* Additional extracted styles */
    ${css}
  </style>
</head>
<body>
  ${sanitizedBody}
</body>
</html>
  `.trim();

  return {
    html: sanitizedHtml,
    css,
    stylesheets,
    scripts,
    assets,
    title,
    bodyContent: sanitizedBody,
  };
}

/**
 * Convert relative URLs to absolute URLs
 */
export function resolveURLs(html: string, baseUrl: string): string {
  try {
    const base = new URL(baseUrl);

    // Resolve src attributes
    let resolved = html.replace(
      /src=["'](?!data:|http|https|\/\/)([^"']*)["']/gi,
      (match, url) => {
        try {
          const absoluteUrl = new URL(url, base).href;
          return `src="${absoluteUrl}"`;
        } catch {
          return match;
        }
      }
    );

    // Resolve href attributes (including stylesheets)
    resolved = resolved.replace(
      /href=["'](?!data:|http|https|\/\/|#|mailto:|tel:|javascript:)([^"']*)["']/gi,
      (match, url) => {
        try {
          const absoluteUrl = new URL(url, base).href;
          return `href="${absoluteUrl}"`;
        } catch {
          return match;
        }
      }
    );

    // Resolve url() in CSS
    resolved = resolved.replace(
      /url\(["']?(?!data:|http|https)([^"')]+)["']?\)/gi,
      (match, url) => {
        try {
          const absoluteUrl = new URL(url, base).href;
          return `url("${absoluteUrl}")`;
        } catch {
          return match;
        }
      }
    );

    // Resolve srcset attributes
    resolved = resolved.replace(
      /srcset=["']([^"']*)["']/gi,
      (match, srcset) => {
        try {
          const resolvedSrcset = srcset
            .split(",")
            .map((item: string) => {
              const parts = item.trim().split(/\s+/);
              if (parts[0] && !parts[0].startsWith("http") && !parts[0].startsWith("data:")) {
                parts[0] = new URL(parts[0], base).href;
              }
              return parts.join(" ");
            })
            .join(", ");
          return `srcset="${resolvedSrcset}"`;
        } catch {
          return match;
        }
      }
    );

    // Resolve poster attributes (for video)
    resolved = resolved.replace(
      /poster=["'](?!data:|http|https|\/\/)([^"']*)["']/gi,
      (match, url) => {
        try {
          const absoluteUrl = new URL(url, base).href;
          return `poster="${absoluteUrl}"`;
        } catch {
          return match;
        }
      }
    );

    return resolved;
  } catch {
    return html;
  }
}

/**
 * Read HTML from a file
 */
export async function readHTMLFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

/**
 * Validate if the input is valid HTML
 */
export function isValidHTML(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Check for basic HTML structure
  const hasHTMLTags = /<[a-z][\s\S]*>/i.test(trimmed);
  return hasHTMLTags;
}
