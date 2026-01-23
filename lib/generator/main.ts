import type { LayoutSection } from "../types";
import { BASE_CSS, generateDynamicSectionCSS } from "./css-templates";
import { generateBody } from "./body";

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

export function generateCSS(layout: LayoutSection[]): string {
  const sectionStyles = generateDynamicSectionCSS(layout);

  return `${BASE_CSS}
    ${sectionStyles}`;
}

export function generateCSSSeparate(layout: LayoutSection[]): string {
  return generateCSS(layout);
}
