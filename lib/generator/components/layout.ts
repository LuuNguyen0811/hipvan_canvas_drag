import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateLayoutComponent(
  component: Component,
  generateComponentFn: (comp: Component) => string
): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "layout":
      const layoutChildren = component.children
        ? component.children.map((child) => generateComponentFn(child)).join("\n")
        : "";
      return `        <div class="layout-container"${styleAttr}>
${layoutChildren}
        </div>`;

    case "grid":
      const gridChildren = component.children
        ? component.children.map((child) => generateComponentFn(child)).join("\n")
        : "";
      return `        <div class="grid-container"${styleAttr}>
${gridChildren || "          <p>Grid content goes here</p>"}
        </div>`;

    case "flex":
      const flexChildren = component.children
        ? component.children.map((child) => generateComponentFn(child)).join("\n")
        : "";
      return `        <div class="flex-container"${styleAttr}>
${flexChildren || "          <p>Flex content goes here</p>"}
        </div>`;

    case "accordion":
      const accordionItems = (component as any).items || [
        { title: "Section 1", content: "Content for section 1" },
        { title: "Section 2", content: "Content for section 2" },
      ];
      const accordionHtml = accordionItems
        .map(
          (item: any) => `          <div class="accordion-item">
            <button class="accordion-header" onclick="this.parentElement.classList.toggle('active')">${item.title}</button>
            <div class="accordion-content">
              <p>${item.content}</p>
            </div>
          </div>`
        )
        .join("\n");
      return `        <div class="accordion"${styleAttr}>
${accordionHtml}
        </div>`;

    case "tabs":
      const tabItems = (component as any).items || [
        { title: "Tab 1", content: "Content for tab 1" },
        { title: "Tab 2", content: "Content for tab 2" },
      ];
      const tabHeadersHtml = tabItems
        .map((item: any, idx: number) => `            <button class="tab-header${idx === 0 ? " active" : ""}" onclick="showTab(this, ${idx})">${item.title}</button>`)
        .join("\n");
      const tabContentsHtml = tabItems
        .map((item: any, idx: number) => `          <div class="tab-content${idx === 0 ? " active" : ""}">
            <p>${item.content}</p>
          </div>`)
        .join("\n");
      return `        <div class="tabs"${styleAttr}>
          <div class="tab-headers">
${tabHeadersHtml}
          </div>
          <div class="tab-contents">
${tabContentsHtml}
          </div>
        </div>`;
    
    default:
      return null;
  }
}
