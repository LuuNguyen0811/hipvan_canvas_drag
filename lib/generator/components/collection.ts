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
  
  const headerAlignmentMap: Record<string, string> = {
    left: "justify-content: flex-start;",
    center: "justify-content: center; text-align: center;",
    right: "justify-content: flex-end; text-align: right;",
  };

  const collectionHeaderStyle = data.headerAlignment
    ? headerAlignmentMap[data.headerAlignment]
    : "";

  const headerHtml = data.showHeader && data.headerTitle ? `
          <div class="collection-header" style="${collectionHeaderStyle}">
            <h3 class="collection-title">${data.headerTitle}</h3>
          </div>` : '';
  
  const gridClass = data.layout === 'horizontal' ? 'horizontal' : 'collection-grid-responsive';
  const gridStyle = ` style="gap: ${data.gap || "1rem"}; --items-per-row: ${data.itemsPerRow || 4}; --items-per-row-tablet: ${Math.min(data.itemsPerRow || 4, 3)}; --items-per-row-mobile: ${Math.min(data.itemsPerRow || 4, 1)}; overflow-x: auto;"`;
  
  const itemsHtml = data.items.map((item) => {
    const badgeHtml = item.badge ? `<span class="collection-item-badge">${item.badge}</span>` : '';
    const imageHtml = item.image 
      ? `<img src="${item.image}" alt="${item.title}" />`
      : '';
    const subtitleHtml = item.subtitle ? `<p class="collection-item-subtitle">${item.subtitle}</p>` : '';
    
    const ctaText = item.ctaText || data.itemCtaText || 'Shop';
    const finalCtaBgColor = item.ctaBgColor || data.itemCtaBgColor;
    const finalCtaTextColor = item.ctaTextColor || data.itemCtaTextColor;
    const ctaStyle = finalCtaBgColor || finalCtaTextColor
      ? ` style="${finalCtaBgColor ? `background-color: ${finalCtaBgColor};` : ""} ${finalCtaTextColor ? `color: ${finalCtaTextColor};` : ""}"`
      : "";
    
    const itemBgStyle = (item.itemBgColor || data.itemBgColor) 
      ? ` style="background-color: ${item.itemBgColor || data.itemBgColor};"` 
      : "";
    
    return `            <div class="collection-item"${itemBgStyle}>
              ${badgeHtml}
              <div class="collection-item-image">${imageHtml}</div>
              <div class="collection-item-content">
                <div class="collection-item-info">
                  <h4 class="collection-item-title">${item.title}</h4>
                  ${subtitleHtml}
                </div>
                <a href="${item.url || "#"}" class="collection-item-cta"${ctaStyle}>${ctaText}</a>
              </div>
            </div>`;
  }).join('\n');
  
  return `        <div class="collection component"${styleAttr}>${headerHtml}
          <div class="collection-grid ${gridClass}"${gridStyle}>
${itemsHtml}
          </div>
        </div>`;
}
