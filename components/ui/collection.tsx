import * as React from "react";

import { cn } from "@/lib/utils";

export type CollectionLayout = "horizontal" | "vertical";

interface CollectionProps extends React.ComponentProps<"div"> {
  layout?: CollectionLayout;
  itemsPerRow?: number;
  gap?: string;
}

function Collection({
  className,
  layout = "horizontal",
  itemsPerRow = 4,
  gap = "1rem",
  ...props
}: CollectionProps) {
  return (
    <div
      data-slot="collection"
      data-layout={layout}
      className={cn(
        "w-full",
        layout === "horizontal"
          ? "flex overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2"
          : "grid",
        className,
      )}
      style={{
        gap,
        ...(layout === "vertical" && {
          gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
        }),
      }}
      {...props}
    />
  );
}

function CollectionHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collection-header"
      className={cn("mb-4 flex items-center justify-between", className)}
      {...props}
    />
  );
}

function CollectionTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="collection-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function CollectionDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="collection-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CollectionAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collection-action"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function CollectionContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="collection-content"
      className={cn("", className)}
      {...props}
    />
  );
}

interface CollectionItemProps extends React.ComponentProps<"div"> {
  layout?: CollectionLayout;
  isDragging?: boolean;
}

function CollectionItem({
  className,
  layout = "horizontal",
  draggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  ...props
}: CollectionItemProps) {
  return (
    <div
      data-slot="collection-item"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={cn(
        "group relative flex-shrink-0 overflow-hidden bg-[#f5f5f5] transition-all duration-300 ease-in-out",
        layout === "horizontal" ? "w-full md:w-[calc(25%-1rem)]" : "w-full",
        isDragging && "z-50 opacity-40 scale-105 shadow-2xl ring-2 ring-primary/20",
        !isDragging && "hover:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function CollectionItemImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"div"> & { src?: string; alt?: string }) {
  return (
    <div
      data-slot="collection-item-image"
      className={cn(
        "relative aspect-[5/3] w-full overflow-hidden bg-muted",
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || ""}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <svg
            className="h-12 w-12 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

function CollectionItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="collection-item-content"
      className={cn('flex items-center justify-between gap-4 p-4', className)}
      {...props}
    />
  )
}

function CollectionItemTitle({
  className,
  ...props
}: React.ComponentProps<"h4">) {
  return (
    <h4
      data-slot="collection-item-title"
      className={cn(
        "line-clamp-1 text-base font-semibold text-[#333333]",
        className,
      )}
      {...props}
    />
  );
}

function CollectionItemSubtitle({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="collection-item-subtitle"
      className={cn("mt-0.5 truncate text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

interface CollectionItemCTAProps extends React.ComponentProps<"a"> {
  variant?: "default" | "outline" | "ghost";
}

function CollectionItemCTA({ className, variant = 'default', style, ...props }: CollectionItemCTAProps) {
  return (
    <a
      data-slot="collection-item-cta"
      className={cn(
        'inline-flex h-[34px] items-center justify-center rounded-[8px] px-[12px] text-[15px] font-semibold transition-all duration-300',
        variant === 'default' && !style?.backgroundColor && 'bg-[#ff4d5f] text-white hover:bg-[#ff334a] hover:shadow-md',
        variant === 'outline' && 'border border-[#ff4d5f] bg-transparent text-[#ff4d5f] hover:bg-[#ff4d5f]/5',
        variant === 'ghost' && 'text-[#ff4d5f] hover:bg-[#ff4d5f]/5',
        className,
      )}
      style={style}
      {...props}
    >
      {props.children || 'Shop'}
    </a>
  )
}

function CollectionItemBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="collection-item-badge"
      className={cn(
        "absolute left-3 top-3 rounded-sm bg-[#ff5a5f] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white",
        className,
      )}
      {...props}
    />
  );
}

export {
  Collection,
  CollectionHeader,
  CollectionTitle,
  CollectionDescription,
  CollectionAction,
  CollectionContent,
  CollectionItem,
  CollectionItemImage,
  CollectionItemContent,
  CollectionItemTitle,
  CollectionItemSubtitle,
  CollectionItemCTA,
  CollectionItemBadge,
};
