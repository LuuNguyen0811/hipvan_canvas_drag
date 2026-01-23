import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateFormComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "input":
      return `        <div class="form-field"${styleAttr}>
          ${component.label ? `<label class="form-label">${component.label}</label>` : ""}
          <input type="text" class="form-input" placeholder="${component.placeholder || "Enter text..."}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} />
        </div>`;

    case "textareaField":
      return `        <div class="form-field"${styleAttr}>
          ${component.label ? `<label class="form-label">${component.label}</label>` : ""}
          <textarea class="form-textarea" placeholder="${component.placeholder || "Enter your message..."}" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""}></textarea>
        </div>`;

    case "select":
      const selectOptions = component.options || [
        { label: "Option 1", value: "1" },
        { label: "Option 2", value: "2" },
        { label: "Option 3", value: "3" },
      ];
      const selectOptionsHtml = selectOptions
        .map((opt) => `              <option value="${opt.value}">${opt.label}</option>`)
        .join("\n");
      return `        <div class="form-field"${styleAttr}>
          ${component.label ? `<label class="form-label">${component.label}</label>` : ""}
          <select class="form-select" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""}>
${selectOptionsHtml}
          </select>
        </div>`;

    case "checkbox":
      return `        <div class="form-field checkbox-field"${styleAttr}>
          <label class="checkbox-label">
            <input type="checkbox" class="form-checkbox" ${component.required ? "required" : ""} ${component.disabled ? "disabled" : ""} />
            <span>${component.label || component.content || "Checkbox label"}</span>
          </label>
        </div>`;

    case "radio":
      const radioOptions = component.options || [
        { label: "Option A", value: "a" },
        { label: "Option B", value: "b" },
      ];
      const radioHtml = radioOptions
        .map(
          (opt) => `          <label class="radio-label">
            <input type="radio" name="radio-${component.id}" value="${opt.value}" class="form-radio" ${component.disabled ? "disabled" : ""} />
            <span>${opt.label}</span>
          </label>`
        )
        .join("\n");
      return `        <div class="form-field radio-group"${styleAttr}>
          ${component.label ? `<label class="form-label">${component.label}</label>` : ""}
${radioHtml}
        </div>`;

    case "form":
      return `        <form class="form-container"${styleAttr}>
          ${component.content || "<p>Form content goes here</p>"}
          <button type="submit" class="btn">Submit</button>
        </form>`;
    
    default:
      return null;
  }
}
