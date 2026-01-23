import type { LayoutSection } from "./types";
import { BASE_CSS, generateDynamicSectionCSS } from "./generator/css-templates";
import { generateComponent } from "./generator/components";

export function generateHTML(
  layout: LayoutSection[],
  projectName: string,
): string {
  const css = generateCSS(layout);
  const body = generateBody(layout);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="page-container">
${body}
  </div>
  <script>
    // Tab functionality
    function showTab(button, index) {
      const tabsContainer = button.closest('.tabs');
      const headers = tabsContainer.querySelectorAll('.tab-header');
      const contents = tabsContainer.querySelectorAll('.tab-content');
      
      headers.forEach(h => h.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      button.classList.add('active');
      contents[index].classList.add('active');
    }
  </script>
</body>
</html>`;
}

function generateCSS(layout: LayoutSection[]): string {
  const dynamicCSS = generateDynamicSectionCSS(layout);
  return `${BASE_CSS}\n${dynamicCSS}`;
}

function generateBody(layout: LayoutSection[]): string {
  return layout
    .map((section, index) => {
      const sectionClass = `section section-${index + 1}`;
      const columns = section.components.length > 0 ? Array.from(
        { length: section.columns },
        (_, colIdx) => {
          const columnComponents = section.components.filter(
            (_, compIdx) => compIdx % section.columns === colIdx,
          );
          const componentsHtml = columnComponents
            .map((comp) => generateComponent(comp))
            .join("\n");
          return `      <div class="column">\n${componentsHtml}\n      </div>`;
        },
      ).join("\n") : "";

      return `    <div class="${sectionClass}">\n${columns}\n    </div>`;
    })
    .join("\n");
}

export function generateCSSSeparate(layout: LayoutSection[]): string {
  return generateCSS(layout);
}
