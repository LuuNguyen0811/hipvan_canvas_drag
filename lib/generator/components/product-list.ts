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
  
  const headerHtml = data.showHeader && data.headerTitle ? `
          <div class="product-list-header">
            <h3 class="product-list-header-title">${data.headerTitle}</h3>
          </div>` : '';
  
  const gridClass = data.layout === 'horizontal' ? 'horizontal' : 'vertical';
  const itemsPerRow = data.itemsPerRow || 4;
  const gridStyle = data.layout === 'vertical' 
    ? ` style="--items-per-row: ${itemsPerRow}; --items-per-row-mobile: 2; --items-per-row-tablet: 3; grid-template-columns: repeat(var(--items-per-row), 1fr); gap: ${data.gap || '1.5rem'};"`
    : ` style="gap: ${data.gap || '1.5rem'};"`;
  
  const itemsHtml = data.items.map((item) => {
    const badgeHtml = item.badge ? `<div class="product-item-badge ${item.isPopular ? 'popular' : ''}">${item.badge}</div>` : '';
    const imageHtml = item.image 
      ? `<img src="${item.image}" alt="${item.title}" />`
      : '';
    const originalPriceHtml = item.originalPrice ? `<span class="product-item-price-original">${item.originalPrice}</span>` : '';
    
    return `            <div class="product-item">
              <a href="${item.url}" class="product-item-link">
                <div class="product-item-image-container">
                  ${badgeHtml}
                  ${imageHtml}
                </div>
                <div class="product-item-content">
                  <h4 class="product-item-title">${item.title}</h4>
                  <div class="product-item-price">
                    <span class="product-item-price-current">${item.price}</span>
                    ${originalPriceHtml}
                  </div>
                </div>
              </a>
            </div>`;
  }).join('\n');
  
  return `        <div class="product-list component"${styleAttr}>${headerHtml}
          <div class="product-list-container ${gridClass}"${gridStyle}>
${itemsHtml}
          </div>
        </div>`;
}
