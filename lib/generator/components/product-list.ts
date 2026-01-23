import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateProductListComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  if (component.type !== 'product-list') return null;

  const data = component.productListData;
  if (!data || data.items.length === 0) {
    return `        <div class="product-list component"${styleAttr}>
          <p style="text-align: center; color: #64748b;">No products configured</p>
        </div>`;
  }
  
  const headerAlignmentMap: Record<string, string> = {
    left: "justify-content: flex-start;",
    center: "justify-content: center; text-align: center;",
    right: "justify-content: flex-end; text-align: right;",
  };

  const pHeaderStyle = data.headerAlignment
    ? headerAlignmentMap[data.headerAlignment]
    : "";

  const headerHtml = data.showHeader && data.headerTitle ? `
          <div class="product-list-header" style="${pHeaderStyle}">
            <h3 class="product-list-title">${data.headerTitle}</h3>
          </div>` : '';
  
  const gridClass = data.layout === 'horizontal' ? 'horizontal' : 'collection-grid-responsive';
  const gridStyle = ` style="gap: ${data.gap || "1.5rem"}; --items-per-row: ${data.itemsPerRow || 4}; --items-per-row-tablet: ${Math.min(data.itemsPerRow || 4, 3)}; --items-per-row-mobile: ${Math.min(data.itemsPerRow || 4, 2)}; overflow-x: auto;"`;
  
  const itemsHtml = data.items.map((item) => {
    const badgeClass = `product-item-badge ${item.isPopular ? "popular" : ""}`;
    const badgeHtml = item.badge
      ? `<div class="absolute left-2 top-2 z-10"><div class="${badgeClass}">${item.badge}</div></div>`
      : "";
    const imageHtml = item.image 
      ? `<img src="${item.image}" alt="${item.title}" />`
      : '';
    const originalPriceHtml = item.originalPrice 
      ? `<span class="product-item-original-price">${item.originalPrice}</span>` 
      : '';
    
    return `            <a href="${item.url || "#"}" class="product-item">
              <div class="product-item-image">
                ${badgeHtml}
                ${imageHtml}
              </div>
              <div class="product-item-content">
                <h4 class="product-item-title">${item.title}</h4>
                <div class="product-item-price-container">
                  <span class="product-item-price">${item.price}</span>
                  ${originalPriceHtml}
                </div>
              </div>
            </a>`;
  }).join('\n');
  
  return `        <div class="product-list component"${styleAttr}>${headerHtml}
          <div class="product-list-grid ${gridClass}"${gridStyle}>
${itemsHtml}
          </div>
        </div>`;
}
