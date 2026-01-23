import type { LayoutSection } from "../types";

export const BASE_CSS = `    * {
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
      width: 100%;
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
    
    .column {
      padding: 0.5rem;
    }

    @media (max-width: 1024px) {
      .page-container {
        padding: 1.5rem;
      }
      .section {
        padding: 1.5rem;
        margin-bottom: 2rem;
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }
      .section {
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-radius: 0.5rem;
      }
    }
    
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
    
    .responsive-image {
      max-width: 100%;
      height: auto;
      border-radius: 0.75rem;
      display: block;
    }
    
    .responsive-picture {
      display: block;
      max-width: 100%;
    }
    
    .responsive-picture img {
      max-width: 100%;
      height: auto;
      border-radius: 0.75rem;
      display: block;
    }
    
    .image-bordered {
      border: 1px solid #e2e8f0;
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
    
    /* Form Components */
    .form-container {
      padding: 1.5rem;
      background: white;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    
    .form-field {
      margin-bottom: 1.25rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #1a1a2e;
      font-size: 0.875rem;
    }
    
    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: white;
      color: #1a1a2e;
    }
    
    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .form-textarea {
      min-height: 120px;
      resize: vertical;
      font-family: inherit;
    }
    
    .checkbox-field,
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .checkbox-label,
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #4a5568;
    }
    
    .form-checkbox,
    .form-radio {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }
    
    /* Navigation Components */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      gap: 1rem;
    }
    
    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        padding: 1rem;
        text-align: center;
      }
      .navbar-menu {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
      }
      .nav-link {
        width: 100%;
        padding: 0.5rem;
      }
    }
    
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    .navbar-menu {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-link:hover {
      color: #3b82f6;
    }
    
    .menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .menu-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .menu-item:last-child {
      border-bottom: none;
    }
    
    .menu-item a {
      color: #4a5568;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .menu-item a:hover {
      color: #3b82f6;
    }
    
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0;
      font-size: 0.875rem;
    }
    
    .breadcrumb-item a {
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .breadcrumb-item a:hover {
      color: #3b82f6;
    }
    
    .breadcrumb-separator {
      color: #cbd5e1;
      margin: 0 0.25rem;
    }
    
    .footer {
      margin-top: 3rem;
      padding: 2rem 0;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    }
    
    .footer-content {
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .link {
      color: #3b82f6;
      text-decoration: underline;
      transition: color 0.2s;
    }
    
    .link:hover {
      color: #2563eb;
    }
    
    /* Media Components */
    .media-container {
      margin: 1rem 0;
      border-radius: 0.75rem;
      overflow: hidden;
    }
    
    .video-player,
    .audio-player {
      width: 100%;
      max-width: 100%;
    }
    
    .embed-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
      border-radius: 0.75rem;
      background: #f1f5f9;
    }
    
    .embed-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .embed-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #64748b;
    }
    
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      width: 2rem;
      height: 2rem;
    }
    
    /* Data Display Components */
    .table-container {
      overflow-x: auto;
      margin: 1rem 0;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
    }
    
    .data-table thead {
      background: #f8fafc;
    }
    
    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #1a1a2e;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .data-table td {
      padding: 0.75rem 1rem;
      color: #4a5568;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .data-table tbody tr:hover {
      background: #f8fafc;
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    
    .badge-default {
      background: #e0e7ff;
      color: #3730a3;
    }
    
    .badge-secondary {
      background: #f1f5f9;
      color: #475569;
    }
    
    .badge-destructive {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .badge-outline {
      background: transparent;
      border: 1px solid #cbd5e1;
      color: #475569;
    }
    
    .avatar {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #e0e7ff;
      color: #3730a3;
      font-weight: 600;
    }
    
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-initials {
      font-size: 0.875rem;
    }
    
    .progress-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0;
    }
    
    .progress-bar {
      flex: 1;
      height: 0.5rem;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
      min-width: 3rem;
      text-align: right;
    }
    
    /* Layout Components */
    .layout-container {
      padding: 1rem;
    }
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem 0;
    }
    
    .flex-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 1rem 0;
    }
    
    .accordion {
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      overflow: hidden;
    }
    
    .accordion-item {
      border-bottom: 1px solid #e2e8f0;
    }
    
    .accordion-item:last-child {
      border-bottom: none;
    }
    
    .accordion-header {
      width: 100%;
      padding: 1rem 1.25rem;
      background: white;
      border: none;
      text-align: left;
      font-size: 1rem;
      font-weight: 600;
      color: #1a1a2e;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .accordion-header:hover {
      background: #f8fafc;
    }
    
    .accordion-content {
      display: none;
      padding: 1rem 1.25rem;
      background: #fafafa;
      color: #4a5568;
    }
    
    .accordion-item.active .accordion-content {
      display: block;
    }
    
    .tabs {
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      overflow: hidden;
      background: white;
    }
    
    .tab-headers {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    
    .tab-header {
      flex: 1;
      padding: 0.875rem 1.25rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .tab-header:hover {
      color: #3b82f6;
      background: white;
    }
    
    .tab-header.active {
      color: #3b82f6;
      background: white;
      border-bottom-color: #3b82f6;
    }
    
    .tab-contents {
      position: relative;
    }
    
    .tab-content {
      display: none;
      padding: 1.25rem;
    }
    
    .tab-content.active {
      display: block;
    }
    
    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }
      
      .navbar-menu {
        width: 100%;
        justify-content: center;
      }
      
      .table-container {
        font-size: 0.875rem;
      }
      
      .tab-headers {
        flex-direction: column;
      }
    }
    
    /* Collection Components */
    .collection {
      width: 100%;
    }
    
    .collection-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    
    .collection-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a1a2e;
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
      scrollbar-width: thin;
    }
    
    .collection-grid.horizontal .collection-item {
      flex-shrink: 0;
      width: calc(25% - 0.75rem);
      min-width: 200px;
      scroll-snap-align: start;
    }
    
    .collection-item {
      position: relative;
      border-radius: 0;
      overflow: hidden;
      background-color: #f5f5f5;
      transition: all 0.3s ease-in-out;
    }
    
    .collection-item:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .collection-item-badge {
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      background: #ff5a5f;
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      border-radius: 2px;
      z-index: 10;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .collection-item-image {
      aspect-ratio: 5 / 3;
      width: 100%;
      overflow: hidden;
      background-color: #e2e8f0;
    }
    
    .collection-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    
    .collection-item:hover .collection-item-image img {
      transform: scale(1.05);
    }
    
    .collection-item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
    }
    
    .collection-item-info {
      flex: 1;
      min-width: 0;
    }
    
    .collection-item-title {
      font-size: 1rem;
      font-weight: 600;
      color: #333333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .collection-item-subtitle {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .collection-item-cta {
      display: inline-flex;
      height: 34px;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
      font-size: 15px;
      font-weight: 600;
      color: white;
      background-color: #ff4d5f;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    
    .collection-item-cta:hover {
      background-color: #ff334a;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    @media (max-width: 768px) {
      .collection-grid.horizontal .collection-item {
        width: calc(50% - 0.5rem);
      }
    }

    /* Grid Responsive Utility */
    .collection-grid-responsive {
      display: grid;
      grid-template-columns: repeat(var(--items-per-row, 4), minmax(0, 1fr));
    }
    
    @media (max-width: 1024px) {
      .collection-grid-responsive {
        grid-template-columns: repeat(var(--items-per-row-tablet, 3), minmax(0, 1fr));
      }
    }
    
    @media (max-width: 640px) {
      .collection-grid-responsive {
        grid-template-columns: repeat(var(--items-per-row-mobile, 1), minmax(0, 1fr));
        gap: 0.75rem !important;
      }
    }

    /* Product List Components */
    .product-list {
      width: 100%;
    }
    
    .product-list-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .product-list-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    .product-list-grid {
      display: grid;
    }
    
    .product-list-grid.horizontal {
      overflow-x: auto;
      padding-bottom: 1rem;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
    }
    
    .product-list-grid.horizontal::-webkit-scrollbar {
      display: none;
    }
    
    .product-list-grid.horizontal .product-item {
      flex-shrink: 0;
      width: 240px;
      scroll-snap-align: start;
    }
    
    @media (min-width: 640px) {
      .product-list-grid.horizontal .product-item {
        width: 280px;
      }
    }
    
    .product-item {
      position: relative;
      display: flex;
      flex-direction: column;
      background: white;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .product-item:hover .product-item-title {
      color: #ff4d5f;
    }
    
    .product-item-image {
      aspect-ratio: 1;
      width: 100%;
      position: relative;
      background: #f8f9fa;
      overflow: hidden;
      border-radius: 2px;
    }
    
    .product-item-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      transition: transform 0.5s;
    }
    
    .product-item:hover .product-item-image img {
      transform: scale(1.05);
    }
    
    .product-item-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.625rem;
      background: #ff4d5f;
      color: white;
      font-size: 10px;
      font-weight: 700;
      border-radius: 2px;
      z-index: 10;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .product-item-badge.popular {
      background: #10b981;
    }
    
    .product-item-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 0;
    }
    
    .product-item-title {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a2e;
      line-height: 1.25;
      height: 2.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s;
    }
    
    .product-item-price-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }
    
    .product-item-price {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
    }
    
    .product-item-original-price {
      font-size: 13px;
      color: #94a3b8;
      text-decoration: line-through;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .product-list-grid.horizontal .product-item {
        width: 220px;
      }
    }

    @media (max-width: 640px) {
      .product-list-grid:not(.horizontal) {
        grid-template-columns: repeat(var(--items-per-row-mobile, 2), minmax(0, 1fr)) !important;
        gap: 1rem;
      }
      .product-list-grid.horizontal .product-item {
        width: 180px;
      }
    }
`;

export function generateDynamicSectionCSS(layout: LayoutSection[]): string {
  return layout
    .map((section, index) => {
      const sectionClass = `section-${index + 1}`;
      let gridCols = "1fr";

      if (section.columnWidths && section.columnWidths.length > 0) {
        gridCols = section.columnWidths.join(" ");
      } else if (section.columns > 1) {
        gridCols = Array(section.columns).fill("1fr").join(" ");
      }

      return `
    .${sectionClass} {
      display: grid;
      grid-template-columns: ${gridCols};
      gap: 1.5rem;
    }
    
    @media (max-width: 1024px) {
      .${sectionClass} {
        gap: 1rem;
      }
    }

    @media (max-width: 768px) {
      .${sectionClass} {
        grid-template-columns: 1fr !important;
        gap: 1rem;
      }
    }`;
    })
    .join("\n");
}
