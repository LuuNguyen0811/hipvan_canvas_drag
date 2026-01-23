import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateNavigationComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  switch (component.type) {
    case "navbar":
      const navItems = (component as any).items || [
        { title: "Home", content: "/" },
        { title: "About", content: "/about" },
        { title: "Contact", content: "/contact" },
      ];
      const navItemsHtml = navItems
        .map((item: any) => `            <a href="${item.content}" class="nav-link">${item.title}</a>`)
        .join("\n");
      return `        <nav class="navbar"${styleAttr}>
          <div class="navbar-brand">${component.content || "Logo"}</div>
          <div class="navbar-menu">
${navItemsHtml}
          </div>
        </nav>`;

    case "menu":
      const menuItems = (component.content || "Menu Item 1, Menu Item 2, Menu Item 3")
        .split(",")
        .map((item) => `            <li class="menu-item"><a href="#">${item.trim()}</a></li>`)
        .join("\n");
      return `        <ul class="menu"${styleAttr}>
${menuItems}
        </ul>`;

    case "breadcrumb":
      const breadcrumbItems = (component.content || "Home, Products, Category")
        .split(",")
        .map((item, idx, arr) => {
          const separator = idx < arr.length - 1 ? '<span class="breadcrumb-separator">/</span>' : "";
          return `            <span class="breadcrumb-item"><a href="#">${item.trim()}</a></span>${separator}`;
        })
        .join("\n");
      return `        <nav class="breadcrumb"${styleAttr}>
${breadcrumbItems}
        </nav>`;

    case "footer":
      return `        <footer class="footer"${styleAttr}>
          <div class="footer-content">
            <p>${component.content || "© 2024 Your Company"}</p>
          </div>
        </footer>`;

    case "link":
      return `        <a href="${component.href || "#"}" class="link" target="${component.target || "_self"}"${styleAttr}>${component.content || "Click here"}</a>`;
    
    default:
      return null;
  }
}
