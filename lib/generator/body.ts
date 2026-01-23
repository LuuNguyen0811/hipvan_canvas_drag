import type { LayoutSection, Component } from "../types";
import { generateComponent } from "./components";

export function generateBody(layout: LayoutSection[]): string {
  return layout
    .map((section, sectionIndex) => {
      const sectionClass = `section section-${sectionIndex + 1}`;

      // Group components by column
      const componentsByColumn: Record<number, Component[]> = {};
      for (let i = 0; i < section.columns; i++) {
        componentsByColumn[i] = [];
      }
      section.components.forEach((comp) => {
        const colIndex = (comp.props?.columnIndex as number) ?? 0;
        const targetCol = Math.min(colIndex, section.columns - 1);
        if (!componentsByColumn[targetCol]) componentsByColumn[targetCol] = [];
        componentsByColumn[targetCol].push(comp);
      });

      if (section.columns === 1) {
        const components = section.components
          .map((comp) => generateComponent(comp))
          .join("\n");

        return `    <section class="${sectionClass}">
      <div class="column">
${components || "        <!-- Empty section -->"}
      </div>
    </section>`;
      } else {
        const columns = Array.from({ length: section.columns })
          .map((_, colIndex) => {
            const colComponents = componentsByColumn[colIndex] || [];
            const componentsHtml = colComponents
              .map((comp) => generateComponent(comp))
              .join("\n");

            return `      <div class="column">
${componentsHtml || "        <!-- Empty column -->"}
      </div>`;
          })
          .join("\n");

        return `    <section class="${sectionClass}">
${columns}
    </section>`;
      }
    })
    .join("\n\n");
}
