import type { LayoutSection, Component } from './types'

export function generateHTML(layout: LayoutSection[], projectName: string): string {
  const css = generateCSS(layout)
  const body = generateBody(layout)
  
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
</body>
</html>`
}

function generateCSS(layout: LayoutSection[]): string {
  // Generate dynamic section CSS based on column widths
  const sectionStyles = layout.map((section, index) => {
    const sectionClass = `section-${index + 1}`
    let gridCols = '1fr'
    
    if (section.columnWidths && section.columnWidths.length > 0) {
      gridCols = section.columnWidths.join(' ')
    } else if (section.columns > 1) {
      gridCols = Array(section.columns).fill('1fr').join(' ')
    }
    
    return `
    .${sectionClass} {
      display: grid;
      grid-template-columns: ${gridCols};
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .${sectionClass} {
        grid-template-columns: 1fr;
      }
    }`
  }).join('\n')

  return `    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background-color: #f8f9fa;
    }
    
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .section {
      margin-bottom: 3rem;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    
    .section-hero {
      min-height: 300px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .column {
      padding: 0.5rem;
    }
    ${sectionStyles}
    
    .component {
      padding: 0.5rem 0;
    }
    
    h1, h2, h3 {
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    h1 { font-size: 2.5rem; }
    h2 { font-size: 1.875rem; }
    h3 { font-size: 1.5rem; }
    
    p {
      margin-bottom: 1rem;
      color: #4a5568;
      line-height: 1.7;
    }
    
    .btn {
      display: inline-block;
      padding: 0.875rem 1.75rem;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s, transform 0.1s;
    }
    
    .btn:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
    }
    
    .divider {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1.5rem 0;
    }
    
    .spacer {
      height: 2rem;
    }
    
    .card {
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      transition: box-shadow 0.2s;
    }
    
    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .card h3 {
      margin-bottom: 0.75rem;
    }
    
    .image-placeholder {
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      border-radius: 0.75rem;
      padding: 4rem 2rem;
      text-align: center;
      color: #64748b;
      aspect-ratio: 16/9;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }
    
    li {
      margin-bottom: 0.5rem;
      color: #4a5568;
    }
    
    .collection {
      width: 100%;
    }
    
    .collection-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .collection-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a2e;
    }
    
    .collection-cta {
      font-size: 0.875rem;
      font-weight: 500;
      color: #3b82f6;
      text-decoration: none;
    }
    
    .collection-cta:hover {
      text-decoration: underline;
    }
    
    .collection-grid {
      display: grid;
      gap: 1rem;
    }
    
    .collection-grid.horizontal {
      display: flex;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scroll-snap-type: x mandatory;
    }
    
    .collection-grid.horizontal .collection-item {
      flex-shrink: 0;
      width: 12rem;
      scroll-snap-align: start;
    }
    
    .collection-item {
      position: relative;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      overflow: hidden;
      background: white;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    
    .collection-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #3b82f6;
    }
    
    .collection-item-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: #3b82f6;
      color: white;
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      z-index: 1;
    }
    
    .collection-item-image {
      aspect-ratio: 1;
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    }
    
    .collection-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    
    .collection-item:hover .collection-item-image img {
      transform: scale(1.05);
    }
    
    .collection-item-content {
      padding: 0.75rem;
    }
    
    .collection-item-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #1a1a2e;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .collection-item-subtitle {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .collection-item-cta {
      display: inline-flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      margin-top: 0.5rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      background-color: #3b82f6;
      border-radius: 0.5rem;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .collection-item-cta:hover {
      background-color: #2563eb;
    }
    
    @media (max-width: 768px) {
      .collection-grid:not(.horizontal) {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }`
}

function generateBody(layout: LayoutSection[]): string {
  return layout
    .map((section, sectionIndex) => {
      const sectionClass = `section section-${sectionIndex + 1}`
      const isHero = section.layoutType === 'hero'
      const heroClass = isHero ? ' section-hero' : ''
      
      // Group components by column
      const componentsByColumn: Record<number, Component[]> = {}
      for (let i = 0; i < section.columns; i++) {
        componentsByColumn[i] = []
      }
      section.components.forEach((comp) => {
        const colIndex = (comp.props?.columnIndex as number) ?? 0
        const targetCol = Math.min(colIndex, section.columns - 1)
        if (!componentsByColumn[targetCol]) componentsByColumn[targetCol] = []
        componentsByColumn[targetCol].push(comp)
      })
      
      if (section.columns === 1) {
        const components = section.components
          .map((comp) => generateComponent(comp))
          .join('\n')
        
        return `    <section class="${sectionClass}${heroClass}">
      <div class="column">
${components || '        <!-- Empty section -->'}
      </div>
    </section>`
      } else {
        const columns = Array.from({ length: section.columns }).map((_, colIndex) => {
          const colComponents = componentsByColumn[colIndex] || []
          const componentsHtml = colComponents
            .map((comp) => generateComponent(comp))
            .join('\n')
          
          return `      <div class="column">
${componentsHtml || '        <!-- Empty column -->'}
      </div>`
        }).join('\n')
        
        return `    <section class="${sectionClass}${heroClass}">
${columns}
    </section>`
      }
    })
    .join('\n\n')
}

function generateComponent(component: Component): string {
  const styleAttr = Object.keys(component.styles).length
    ? ` style="${Object.entries(component.styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}"`
    : ''
  
  switch (component.type) {
    case 'heading':
      return `        <h2 class="component"${styleAttr}>${component.content || 'Heading'}</h2>`
    
    case 'paragraph':
      return `        <p class="component"${styleAttr}>${component.content || 'Your paragraph text goes here.'}</p>`
    
    case 'image':
      return `        <div class="component image-placeholder"${styleAttr}>${component.content || 'Image Placeholder'}</div>`
    
    case 'button':
      return `        <div class="component"><a href="#" class="btn"${styleAttr}>${component.content || 'Click me'}</a></div>`
    
    case 'divider':
      return `        <hr class="divider"${styleAttr} />`
    
    case 'spacer':
      return `        <div class="spacer"${styleAttr}></div>`
    
    case 'card':
      return `        <div class="card"${styleAttr}>
          <h3>${component.content || 'Card Title'}</h3>
          <p>Card content goes here.</p>
        </div>`
    
    case 'list':
      const items = (component.content || 'Item 1, Item 2, Item 3')
        .split(',')
        .map((item) => `            <li>${item.trim()}</li>`)
        .join('\n')
      return `        <ul class="component"${styleAttr}>
${items}
        </ul>`
    
    case 'collection':
      const data = component.collectionData
      if (!data || data.items.length === 0) {
        return `        <div class="collection component"${styleAttr}>
          <p style="text-align: center; color: #64748b;">No collection items configured</p>
        </div>`
      }
      
      const headerHtml = data.showHeader && data.headerTitle ? `
          <div class="collection-header">
            <h3 class="collection-title">${data.headerTitle}</h3>
            ${data.headerCtaText ? `<a href="${data.headerCtaUrl || '#'}" class="collection-cta">${data.headerCtaText}</a>` : ''}
          </div>` : ''
      
      const gridClass = data.layout === 'horizontal' ? 'horizontal' : ''
      const gridStyle = data.layout === 'vertical' 
        ? ` style="grid-template-columns: repeat(${data.itemsPerRow || 4}, 1fr); gap: ${data.gap || '1rem'};"`
        : ` style="gap: ${data.gap || '1rem'};"`
      
      const itemsHtml = data.items.map((item) => {
        const badgeHtml = item.badge ? `<span class="collection-item-badge">${item.badge}</span>` : ''
        const imageHtml = item.image 
          ? `<img src="${item.image}" alt="${item.title}" />`
          : ''
        const subtitleHtml = item.subtitle ? `<p class="collection-item-subtitle">${item.subtitle}</p>` : ''
        
        return `            <div class="collection-item">
              ${badgeHtml}
              <div class="collection-item-image">${imageHtml}</div>
              <div class="collection-item-content">
                <h4 class="collection-item-title">${item.title}</h4>
                ${subtitleHtml}
                <a href="${item.ctaUrl}" class="collection-item-cta">${item.ctaText}</a>
              </div>
            </div>`
      }).join('\n')
      
      return `        <div class="collection component"${styleAttr}>${headerHtml}
          <div class="collection-grid ${gridClass}"${gridStyle}>
${itemsHtml}
          </div>
        </div>`
    
    default:
      return `        <div class="component"${styleAttr}>${component.content}</div>`
  }
}

export function generateCSSSeparate(layout: LayoutSection[]): string {
  return generateCSS(layout)
}
