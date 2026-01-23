import type { Component, ComponentType } from "../types";
import { DEFAULT_COMPONENT_CONTENT, DEFAULT_COMPONENT_PROPS } from "../types";
import { parseStyles, parseFormatting, getAllTextContent } from "./utils";

// Generate unique IDs
let idCounter = 0;
export const generateId = () => `comp-${Date.now()}-${idCounter++}`;

// Reset ID counter (useful for testing)
export const resetIdCounter = () => {
  idCounter = 0;
};

// HTML tag to component type mapping
export const TAG_TO_COMPONENT: Record<string, ComponentType> = {
  // Headings
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  // Text
  p: "paragraph",
  span: "paragraph",
  // Media
  img: "image",
  video: "video",
  audio: "audio",
  iframe: "embed",
  // Interactive
  button: "button",
  a: "link",
  // Lists
  ul: "list",
  ol: "list",
  // Tables
  table: "table",
  // Form elements
  input: "input",
  textarea: "textareaField",
  select: "select",
  form: "form",
  // Separators
  hr: "divider",
};

// Create a component from an element
export function createComponent(type: ComponentType, element: Element): Component {
  const defaultProps = DEFAULT_COMPONENT_PROPS[type] || {};

  const component: Component = {
    id: generateId(),
    type,
    content: "",
    styles: parseStyles(element),
    formatting: parseFormatting(element),
    ...(defaultProps as Partial<Component>),
  };

  // Type-specific content extraction
  switch (type) {
    case "heading":
    case "paragraph":
    case "button":
      component.content = getAllTextContent(element);
      break;

    case "image":
      component.src = element.getAttribute("src") || "";
      component.alt = element.getAttribute("alt") || "Image";
      // Don't set content for images - it causes duplicate fields
      component.content = "";
      break;

    case "video":
      component.src = element.getAttribute("src") || 
        element.querySelector("source")?.getAttribute("src") || "";
      component.poster = element.getAttribute("poster") || "";
      component.autoplay = element.hasAttribute("autoplay");
      component.controls = element.hasAttribute("controls");
      break;

    case "audio":
      component.src = element.getAttribute("src") ||
        element.querySelector("source")?.getAttribute("src") || "";
      component.controls = element.hasAttribute("controls");
      break;

    case "embed":
      component.src = element.getAttribute("src") || "";
      break;

    case "link":
      component.href = element.getAttribute("href") || "#";
      component.target = (element.getAttribute("target") || "_self") as "_blank" | "_self";
      component.content = getAllTextContent(element);
      break;

    case "list":
      const items = Array.from(element.querySelectorAll(":scope > li"))
        .map((li) => li.textContent?.trim())
        .filter(Boolean);
      component.content = items.join(", ");
      break;

    case "table":
      const headers = Array.from(element.querySelectorAll("th")).map(
        (th) => th.textContent?.trim() || ""
      );
      const rows = Array.from(element.querySelectorAll("tbody tr")).map((tr) =>
        Array.from(tr.querySelectorAll("td")).map(
          (td) => td.textContent?.trim() || ""
        )
      );
      component.headers = headers.length > 0 ? headers : undefined;
      component.rows = rows.length > 0 ? rows : undefined;
      break;

    case "input":
      component.placeholder = element.getAttribute("placeholder") || "";
      component.label = element.getAttribute("aria-label") || 
        element.closest("label")?.textContent?.trim() || "";
      component.required = element.hasAttribute("required");
      component.disabled = element.hasAttribute("disabled");
      break;

    case "textareaField":
      component.placeholder = element.getAttribute("placeholder") || "";
      component.label = element.getAttribute("aria-label") || "";
      break;

    case "select":
      const options = Array.from(element.querySelectorAll("option")).map(
        (opt) => ({
          label: opt.textContent?.trim() || "",
          value: opt.getAttribute("value") || "",
        })
      );
      component.options = options;
      break;

    default:
      component.content = getAllTextContent(element) || DEFAULT_COMPONENT_CONTENT[type] || "";
  }

  return component;
}
