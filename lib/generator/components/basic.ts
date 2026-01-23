import type { Component } from "../../types";

export function getStyleAttr(component: Component): string {
  return Object.keys(component.styles).length
    ? ` style="${Object.entries(component.styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ")}"`
    : "";
}

export function generateBasicComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "heading":
      return `        <h2 class="component"${styleAttr}>${component.content || "Heading"}</h2>`;

    case "paragraph":
      return `        <p class="component"${styleAttr}>${component.content || "Your paragraph text goes here."}</p>`;

    case "image":
      if (component.src) {
        return `        <img src="${component.src}" alt="${component.alt || component.content || "Image"}" class="component responsive-image"${styleAttr} />`;
      }
      return `        <div class="component image-placeholder"${styleAttr}>${component.content || "Image Placeholder"}</div>`;

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

    case "list":
      const items = (component.content || "Item 1, Item 2, Item 3")
        .split(",")
        .map((item) => `            <li>${item.trim()}</li>`)
        .join("\n");
      return `        <ul class="component"${styleAttr}>
${items}
        </ul>`;
    
    default:
      return null;
  }
}
