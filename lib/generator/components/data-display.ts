import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateDataDisplayComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "table":
      const headers = component.headers || ["Column 1", "Column 2", "Column 3"];
      const rows = component.rows || [
        ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
        ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
      ];
      const tableHeaderHtml = headers
        .map((header) => `              <th>${header}</th>`)
        .join("\n");
      const tableRowsHtml = rows
        .map(
          (row) =>
            `            <tr>
${row.map((cell) => `              <td>${cell}</td>`).join("\n")}
            </tr>`
        )
        .join("\n");
      return `        <div class="table-container"${styleAttr}>
          <table class="data-table">
            <thead>
              <tr>
${tableHeaderHtml}
              </tr>
            </thead>
            <tbody>
${tableRowsHtml}
            </tbody>
          </table>
        </div>`;

    case "badge":
      const badgeVariant = (component as any).badgeVariant || "default";
      const badgeClass = `badge badge-${badgeVariant}`;
      return `        <span class="${badgeClass}"${styleAttr}>${component.content || "Badge"}</span>`;

    case "avatar":
      return `        <div class="avatar"${styleAttr}>
          ${component.src ? `<img src="${component.src}" alt="${component.alt || "Avatar"}" class="avatar-img" />` : `<span class="avatar-initials">${component.initials || "AB"}</span>`}
        </div>`;

    case "progress":
      const progressValue = component.value || 50;
      const progressMax = component.max || 100;
      const progressPercent = (progressValue / progressMax) * 100;
      return `        <div class="progress-container"${styleAttr}>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <span class="progress-text">${progressPercent}%</span>
        </div>`;
    
    default:
      return null;
  }
}
