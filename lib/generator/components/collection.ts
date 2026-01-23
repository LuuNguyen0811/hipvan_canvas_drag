import type { Component } from "../../types";
import { getStyleAttr } from "./basic";

export function generateCollectionComponent(component: Component): string | null {
  const styleAttr = getStyleAttr(component);

  if (component.type !== 'collection') return null;

  const data = component.collectionData;
  if (!data || data.items.length === 0) {
    return `        <div class="collection component"${styleAttr}>
          <p style="text-align: center; color: #64748b;">No collection items configured</p>
        </div>`;
  }
  
  const headerHtml = data.showHeader && data.headerTitle ? `
          <div class="collection-header">
            <h3 class="collection-title">${data.headerTitle}</h3>
          </div>` : '';
  
  const gridClass = data.layout === 'horizontal' ? 'horizontal' : '';
  const gridStyle = data.layout === 'vertical' 
    ? ` style="grid-template-columns: repeat(${data.itemsPerRow || 4}, 1fr); gap: ${data.gap || '1rem'};"`
    : ` style="gap: ${data.gap || '1rem'};"`;
  
  const itemsHtml = data.items.map((item) => {
    const badgeHtml = item.badge ? `<span class="collection-item-badge">${item.badge}</span>` : '';
    const imageHtml = item.image 
      ? `<img src="${item.image}" alt="${item.title}" />`
      : '';
    const subtitleHtml = item.subtitle ? `<p class="collection-item-subtitle">${item.subtitle}</p>` : '';
    
    const ctaText = item.ctaText || data.itemCtaText || 'Shop';
    const ctaStyle = (item.ctaBgColor || data.itemCtaBgColor) 
      ? ` style="background-color: ${item.ctaBgColor || data.itemCtaBgColor}; color: white;"` 
      : '';
    
    return `            <div class="collection-item">
              ${badgeHtml}
              <div class="collection-item-image">${imageHtml}</div>
              <div class="collection-item-content">
                <h4 class="collection-item-title">${item.title}</h4>
                ${subtitleHtml}
                <a href="${item.ctaUrl}" class="collection-item-cta"${ctaStyle}>${ctaText}</a>
              </div>
            </div>`;
  }).join('\n');
  
  return `        <div class="collection component"${styleAttr}>${headerHtml}
          <div class="collection-grid ${gridClass}"${gridStyle}>
${itemsHtml}
          </div>
        </div>`;
}
