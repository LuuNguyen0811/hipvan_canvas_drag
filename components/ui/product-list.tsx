import * as React from "react";
import { cn } from "@/lib/utils";

interface ProductListProps extends React.ComponentProps<"div"> {
  layout?: "horizontal" | "vertical";
  itemsPerRow?: number;
  gap?: string;
}

function ProductList({
  className,
  layout = "horizontal",
  itemsPerRow = 4,
  gap = "1.5rem",
  ...props
}: ProductListProps) {
  return (
    <div
      data-slot="product-list"
      data-layout={layout}
      className={cn(
        "w-full",
        layout === "horizontal"
          ? "flex overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
          : "grid collection-grid-responsive",
        className,
      )}
      style={{
        gap,
        "--items-per-row": itemsPerRow,
        "--items-per-row-mobile": Math.min(itemsPerRow, 2), // Product rows often show 2 on mobile
        "--items-per-row-tablet": Math.min(itemsPerRow, 3),
      } as React.CSSProperties}
      {...props}
    />
  );
}

function ProductItem({
  className,
  layout = "horizontal",
  ...props
}: React.ComponentProps<"div"> & { layout?: "horizontal" | "vertical" }) {
  return (
    <div
      data-slot="product-item"
      className={cn(
        "group relative flex flex-col bg-white transition-all duration-300",
        layout === "horizontal" ? "w-[240px] flex-shrink-0 snap-start sm:w-[280px]" : "w-full",
        className,
      )}
      {...props}
    />
  );
}

function ProductItemImage({
  className,
  src,
  alt,
  badge,
  isPopular,
  ...props
}: React.ComponentProps<"div"> & { src?: string; alt?: string; badge?: string; isPopular?: boolean }) {
  return (
    <div
      data-slot="product-item-image"
      className={cn(
        "relative aspect-square w-full overflow-hidden bg-[#f8f9fa] rounded-sm",
        className,
      )}
      {...props}
    >
      {badge && (
        <div className="absolute left-2 top-2 z-10">
          <div className={cn(
            "inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm",
            isPopular ? "bg-emerald-500" : "bg-[#ff4d5f]"
          )}>
            {badge}
          </div>
        </div>
      )}
      {src ? (
        <img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/20">
          <svg className="h-10 w-10 text-muted-foreground/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
}

function ProductItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="product-item-content"
      className={cn("flex flex-col gap-1 py-3", className)}
      {...props}
    />
  );
}

function ProductItemTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="product-item-title"
      className={cn(
        "line-clamp-2 text-[14px] leading-tight text-[#1a1a2e] group-hover:text-[#ff4d5f] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function ProductItemPrice({ 
  className, 
  price, 
  originalPrice,
  ...props 
}: React.ComponentProps<"div"> & { price: string; originalPrice?: string }) {
  return (
    <div
      data-slot="product-item-price"
      className={cn("flex items-center gap-2 mt-1", className)}
      {...props}
    >
      <span className="text-[15px] font-bold text-[#1a1a2e]">{price}</span>
      {originalPrice && (
        <span className="text-[13px] text-muted-foreground line-through opacity-70">
          {originalPrice}
        </span>
      )}
    </div>
  );
}

export {
  ProductList,
  ProductItem,
  ProductItemImage,
  ProductItemContent,
  ProductItemTitle,
  ProductItemPrice,
};
