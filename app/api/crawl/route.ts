import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface CrawledElement {
  id: string;
  tag: string;
  type: "container" | "content" | "layout";
  label: string;
  children: CrawledElement[];
  dimensions?: {
    estimated_width: "full" | "partial" | "narrow";
    estimated_height: "small" | "medium" | "large";
  };
}

interface CrawledLayout {
  url: string;
  title: string;
  structure: CrawledElement[];
}

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => `element-${idCounter++}`;

// Helper to determine element type
const getElementType = (
  tagName: string,
): "container" | "content" | "layout" => {
  const layoutTags = ["header", "main", "footer", "nav", "aside", "section"];
  const containerTags = ["div", "article", "form", "ul", "ol", "li"];

  if (layoutTags.includes(tagName)) return "layout";
  if (containerTags.includes(tagName)) return "container";
  return "content";
};

// Helper to create human-readable labels
const getElementLabel = (tagName: string, className: string = ""): string => {
  const labelMap: Record<string, string> = {
    header: "Header",
    nav: "Navigation",
    main: "Main Content",
    footer: "Footer",
    aside: "Sidebar",
    section: "Section",
    article: "Article",
    div: "Container",
    ul: "List",
    ol: "Ordered List",
    li: "List Item",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    p: "Paragraph",
    img: "Image",
    button: "Button",
    a: "Link",
    form: "Form",
  };

  let label = labelMap[tagName] || tagName.toUpperCase();

  // Add class name hint if it's meaningful
  if (className) {
    const cleanClass = className
      .split(" ")
      .find(
        (c) =>
          !c.includes("-") &&
          c.length < 20 &&
          !c.match(/^(flex|grid|p-|m-|text-|bg-)/),
      );
    if (cleanClass) {
      label += ` (${cleanClass})`;
    }
  }

  return label;
};

// Helper to estimate dimensions based on tag and attributes
const estimateDimensions = (
  tagName: string,
): {
  estimated_width: "full" | "partial" | "narrow";
  estimated_height: "small" | "medium" | "large";
} => {
  const fullWidthTags = ["header", "footer", "nav", "main", "section"];
  const tallTags = ["main", "article", "section"];

  return {
    estimated_width: fullWidthTags.includes(tagName) ? "full" : "partial",
    estimated_height: tallTags.includes(tagName) ? "large" : "medium",
  };
};

// Recursively parse HTML elements into our structure
const parseElement = (
  element: cheerio.Element,
  $: cheerio.CheerioAPI,
  depth: number = 0,
  maxDepth: number = 6,
): CrawledElement | null => {
  if (depth > maxDepth) return null;

  const tagName = element.tagName?.toLowerCase();
  if (!tagName) return null;

  // Skip script, style, and other non-visual elements
  const skipTags = [
    "script",
    "style",
    "link",
    "meta",
    "noscript",
    "iframe",
    "svg",
    "path",
  ];
  if (skipTags.includes(tagName)) return null;

  const $el = $(element);
  const className = $el.attr("class") || "";

  // Only parse meaningful structural elements
  const meaningfulTags = [
    "header",
    "nav",
    "main",
    "footer",
    "aside",
    "section",
    "article",
    "div",
    "ul",
    "ol",
    "form",
  ];

  // Parse children
  const children: CrawledElement[] = [];
  if (meaningfulTags.includes(tagName)) {
    $el.children().each((_, child) => {
      const parsed = parseElement(child, $, depth + 1, maxDepth);
      if (parsed) {
        children.push(parsed);
      }
    });
  }

  // Skip divs that don't have meaningful children or classes
  if (
    tagName === "div" &&
    children.length === 0 &&
    !className &&
    depth > 2
  ) {
    return null;
  }

  return {
    id: generateId(),
    tag: tagName,
    type: getElementType(tagName),
    label: getElementLabel(tagName, className),
    children,
    dimensions: estimateDimensions(tagName),
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, returnHtml } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 },
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!["http:", "https:"].includes(validUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format. Please include http:// or https://" },
        { status: 400 },
      );
    }

    // Reset ID counter for each request
    idCounter = 0;

    // Fetch the HTML with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(validUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LayoutCrawler/1.0; +http://example.com)",
        },
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout. The website took too long to respond." },
          { status: 408 },
        );
      }
      return NextResponse.json(
        {
          error:
            "Failed to fetch the website. It may be blocking automated access or is currently unavailable.",
        },
        { status: 500 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch website: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      );
    }

    const html = await response.text();

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Extract page title
    const title = $("title").text() || "Untitled Page";

    // If returnHtml is true, return the raw HTML content
    if (returnHtml) {
      return NextResponse.json({
        url: validUrl.toString(),
        title,
        html,
      });
    }

    // Parse the body structure
    const structure: CrawledElement[] = [];
    $("body")
      .children()
      .each((_, element) => {
        const parsed = parseElement(element, $);
        if (parsed) {
          structure.push(parsed);
        }
      });

    // If no structure found, return an error
    if (structure.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not parse a meaningful layout structure from this page. The page may be too simple or dynamically rendered.",
        },
        { status: 422 },
      );
    }

    const result: CrawledLayout = {
      url: validUrl.toString(),
      title,
      structure,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while crawling the website. Please try again.",
      },
      { status: 500 },
    );
  }
}
