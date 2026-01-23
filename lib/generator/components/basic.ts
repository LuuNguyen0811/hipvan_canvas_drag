import type { Component } from "../../types";
import { renderInlineMarkdownToHTML } from "../../markdown-parser";

export function getStyleAttr(component: Component): string {
  const styles: Record<string, string> = { ...component.styles };

  // Add formatting properties if they exist
  if (component.formatting) {
    if (component.formatting.bold !== undefined) {
      styles["font-weight"] = component.formatting.bold ? "bold" : "normal";
    }
    if (component.formatting.italic) {
      styles["font-style"] = "italic";
    }
    if (component.formatting.underline) {
      styles["text-decoration"] = "underline";
    }
    if (component.formatting.align) {
      styles["text-align"] = component.formatting.align;
    }
    if (component.formatting.fontSize) {
      styles["font-size"] = component.formatting.fontSize;
    }
  }

  const styleEntries = Object.entries(styles);
  return styleEntries.length
    ? ` style="${styleEntries.map(([k, v]) => `${k}: ${v}`).join("; ")}"`
    : "";
}

export function generateBasicComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "heading": {
      const headingContent = renderInlineMarkdownToHTML(
        component.content || "Heading",
      ).replace(/\n/g, "<br/>");
      return `        <h2 class="component"${styleAttr}>${headingContent}</h2>`;
    }

    case "paragraph": {
      const paragraphContent = renderInlineMarkdownToHTML(
        component.content || "Your paragraph text goes here.",
      ).replace(/\n/g, "<br/>");
      return `        <p class="component"${styleAttr}>${paragraphContent}</p>`;
    }

    case "image": {
      if (component.src) {
        const borderClass = component.border ? " image-bordered" : "";
        // If mobile image exists, use <picture> for responsive images
        if (component.mobileSrc) {
          return `        <picture class="component responsive-picture${borderClass}"${styleAttr}>
          <source media="(max-width: 768px)" srcset="${component.mobileSrc}" />
          <img src="${component.src}" alt="${component.alt || component.content || "Image"}" class="responsive-image" />
        </picture>`;
        }
        return `        <img src="${component.src}" alt="${component.alt || component.content || "Image"}" class="component responsive-image${borderClass}"${styleAttr} />`;
      }
      return `        <div class="component image-placeholder"${styleAttr}>${component.content || "Image Placeholder"}</div>`;
    }

    case "button":
      return `        <div class="component"><a href="#" class="btn"${styleAttr}>${component.content || "Click me"}</a></div>`;

    case "divider":
      return `        <hr class="divider"${styleAttr} />`;

    case "spacer":
      return `        <div class="spacer"${styleAttr}></div>`;

    case "card":
      return `        <div class="card"${styleAttr}>
          <h3>${component.content || "Card Title"}</h3>
          <p>Card content goes here.</p>
        </div>`;

    case "list": {
      const items = (component.content || "Item 1, Item 2, Item 3")
        .split(",")
        .map((item) => `            <li>${item.trim()}</li>`)
        .join("\n");
      return `        <ul class="component"${styleAttr}>
${items}
        </ul>`;
    }
    
    case "link":
      return `        <a href="${component.href || "#"}" class="link" target="${component.target || "_self"}"${styleAttr}>${component.content || "Click here"}</a>`;

    default:
      return null;
  }
}
