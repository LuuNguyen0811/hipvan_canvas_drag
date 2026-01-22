"use client";

import React, { useRef } from "react";
import { useState } from "react";
import { useProjectStore } from "@/lib/store";
import { WireframeDisplay } from "./wireframe-display";
import { HTMLPreview } from "./html-preview";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  SECTION_TEMPLATES,
  COMPONENT_CATEGORIES,
  ALL_COMPONENT_TYPES,
  DEFAULT_COMPONENT_CONTENT,
  DEFAULT_COMPONENT_PROPS,
  type Component,
  type ComponentCategory,
  type ComponentTypeDefinition,
} from "@/lib/types";
import {
  parseHTML,
  readHTMLFile,
  isValidHTML,
  resolveURLs,
  type ParsedHTML,
} from "@/lib/html-parser";
import { htmlToSections, analyzeHTML } from "@/lib/html-to-components";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Type,
  AlignLeft,
  ImageIcon,
  Square,
  Minus,
  MoveVertical,
  CreditCard,
  List,
  Layout,
  Layers,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  GripVertical,
  Info,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Upload,
  Code,
  Link,
  FileCode,
  Eye,
  // Form icons
  FormInput,
  CheckSquare,
  Circle,
  FileInput,
  // Navigation icons
  Menu,
  MoreHorizontal,
  PanelBottom,
  Navigation,
  // Media icons
  Video,
  Music,
  Smile,
  Play,
  // Data icons
  Table,
  Tag,
  User,
  BarChart,
  Database,
  // Layout icons
  Grid3x3,
  Columns,
  PanelTopClose,
  LayoutPanelTop,
  Shapes,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  // Basic
  Type: <Type className="h-5 w-5" />,
  AlignLeft: <AlignLeft className="h-5 w-5" />,
  ImageIcon: <ImageIcon className="h-5 w-5" />,
  Image: <ImageIcon className="h-5 w-5" />,
  Square: <Square className="h-5 w-5" />,
  Minus: <Minus className="h-5 w-5" />,
  MoveVertical: <MoveVertical className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  List: <List className="h-5 w-5" />,
  // Form
  FormInput: <FormInput className="h-5 w-5" />,
  CheckSquare: <CheckSquare className="h-5 w-5" />,
  Circle: <Circle className="h-5 w-5" />,
  FileInput: <FileInput className="h-5 w-5" />,
  ChevronDown: <ChevronDown className="h-5 w-5" />,
  // Navigation
  Menu: <Menu className="h-5 w-5" />,
  MoreHorizontal: <MoreHorizontal className="h-5 w-5" />,
  ChevronRight: <ChevronRight className="h-5 w-5" />,
  PanelBottom: <PanelBottom className="h-5 w-5" />,
  Link: <Link className="h-5 w-5" />,
  Navigation: <Navigation className="h-5 w-5" />,
  // Media
  Video: <Video className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  Smile: <Smile className="h-5 w-5" />,
  Play: <Play className="h-5 w-5" />,
  // Data
  Table: <Table className="h-5 w-5" />,
  Tag: <Tag className="h-5 w-5" />,
  User: <User className="h-5 w-5" />,
  BarChart: <BarChart className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  // Layout
  Grid3x3: <Grid3x3 className="h-5 w-5" />,
  Columns: <Columns className="h-5 w-5" />,
  PanelTopClose: <PanelTopClose className="h-5 w-5" />,
  LayoutPanelTop: <LayoutPanelTop className="h-5 w-5" />,
  Layout: <Layout className="h-5 w-5" />,
  Shapes: <Shapes className="h-5 w-5" />,
};

const generateId = () => Math.random().toString(36).substring(2, 9);

interface CrawledElement {
  id: string;
  tag: string;
  type: "container" | "content" | "layout";
  label: string;
  children: CrawledElement[];
  dimensions?: {
    estimated_width: "full" | "partial" | "narrow";
    estimated_height: "small" | "medium" | "large";
  };
}

interface CrawledLayout {
  url: string;
  title: string;
  structure: CrawledElement[];
}

export function ToolsPanel() {
  const {
    currentProject,
    addSection,
    addComponent,
    removeSection,
    duplicateSection,
    moveSectionUp,
    moveSectionDown,
    updateSection,
  } = useProjectStore();
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("sections");
  const [expandedCategory, setExpandedCategory] = useState<ComponentCategory | null>("basic");

  // Import states
  const [importMode, setImportMode] = useState<"url" | "file" | "code">("url");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutData, setLayoutData] = useState<CrawledLayout | null>(null);
  const [parsedHTML, setParsedHTML] = useState<ParsedHTML | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderedSectionTemplates = [...SECTION_TEMPLATES].sort((a, b) => {
    const order: Record<string, number> = {
      "full-width": 0,
      "two-equal": 1,
      "three-equal": 2,
    };
    return (order[a.id] ?? 999) - (order[b.id] ?? 999);
  });

  const handleAddSection = (templateId: string) => {
    const template = SECTION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    addSection(template.id, template);
  };

  const handleLayoutDragStart = (e: React.DragEvent, templateId: string) => {
    e.dataTransfer.setData("layoutTemplateId", templateId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragStart = (e: React.DragEvent, componentType: string) => {
    e.dataTransfer.setData("componentType", componentType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleAddComponent = (type: string) => {
    const targetSection = selectedSection || currentProject?.layout[0]?.id;
    if (!targetSection) return;

    const componentType = type as Component["type"];
    const defaultProps = DEFAULT_COMPONENT_PROPS[componentType] || {};

    const newComponent: Component = {
      id: generateId(),
      type: componentType,
      content: DEFAULT_COMPONENT_CONTENT[componentType] || "",
      styles: {},
      formatting:
        type === "heading" || type === "paragraph"
          ? { align: "center" }
          : undefined,
      ...defaultProps,
    };

    addComponent(targetSection, newComponent);
  };

  const handleCrawl = async () => {
    if (!crawlUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLayoutData(null);

    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: crawlUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to crawl website");
      }

      setLayoutData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLayoutData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCrawlUrl("");
    setHtmlCode("");
    setLayoutData(null);
    setParsedHTML(null);
    setShowPreview(false);
    setError(null);
  };

  // Handle HTML file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      setError("Please upload an HTML file (.html or .htm)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await readHTMLFile(file);
      const parsed = parseHTML(content);
      setParsedHTML(parsed);
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      setParsedHTML(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle HTML code paste/input
  const handleParseCode = () => {
    if (!htmlCode.trim()) {
      setError("Please enter some HTML code");
      return;
    }

    if (!isValidHTML(htmlCode)) {
      setError("Invalid HTML. Please check your code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = parseHTML(htmlCode);
      setParsedHTML(parsed);
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse HTML");
      setParsedHTML(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL fetch and parse
  const handleFetchURL = async () => {
    if (!crawlUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);
    setParsedHTML(null);

    try {
      // First try to fetch the actual HTML content
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: crawlUrl, returnHtml: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch website");
      }

      // If we got raw HTML, parse it
      if (data.html) {
        const resolvedHtml = resolveURLs(data.html, crawlUrl);
        const parsed = parseHTML(resolvedHtml);
        setParsedHTML({
          ...parsed,
          title: data.title || parsed.title,
        });
        setShowPreview(true);
      } else {
        // Fallback to layout data for wireframe
        setLayoutData(data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setParsedHTML(null);
      setLayoutData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle converting HTML to components
  const handleConvertToComponents = async () => {
    if (!parsedHTML || !currentProject) return;

    try {
      // Analyze the HTML structure
      const analysis = analyzeHTML(parsedHTML.bodyContent);
      
      // Convert HTML to sections with components
      const newSections = htmlToSections(parsedHTML.bodyContent);
      
      if (newSections.length === 0) {
        toast({
          title: "No components found",
          description: "Could not extract any components from the HTML",
          variant: "destructive",
        });
        return;
      }

      // Add each section to the project
      for (const section of newSections) {
        const template = SECTION_TEMPLATES.find(t => t.id === section.layoutType) || SECTION_TEMPLATES[0];
        addSection(template.id, template);
        
        // Small delay to let state update
        await new Promise((resolve) => setTimeout(resolve, 50));
        
        // Get the latest project state and add components
        const latestProject = useProjectStore.getState().currentProject;
        if (latestProject) {
          const newSection = latestProject.layout[latestProject.layout.length - 1];
          if (newSection) {
            // Update section with name, columns and columnWidths from parsed section
            updateSection(newSection.id, { 
              name: section.name,
              columns: section.columns,
              columnWidths: section.columnWidths,
              layoutType: section.layoutType,
            }, true);
            
            // Add all components to this section with their columnIndex preserved
            section.components.forEach((component) => {
              // Ensure columnIndex is in props
              const compWithProps = {
                ...component,
                props: {
                  ...component.props,
                  columnIndex: component.props?.columnIndex ?? 0,
                },
              };
              addComponent(newSection.id, compWithProps);
            });
          }
        }
      }

      // Show success message
      toast({
        title: "Conversion Complete!",
        description: `Created ${newSections.length} section(s) with ${analysis.totalElements} component(s)`,
      });

      // Reset and switch to layers
      handleReset();
      setTimeout(() => {
        setActiveTab("layers");
      }, 100);
    } catch (err) {
      console.error("Error converting HTML:", err);
      toast({
        title: "Conversion Error",
        description: "Failed to convert HTML to components. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertCrawledElementsToComponents = (
    elements: CrawledElement[],
  ): Component[] => {
    const components: Component[] = [];

    for (const element of elements) {
      // Map HTML tags to component types
      const tagToComponentType: Record<string, Component["type"]> = {
        h1: "heading",
        h2: "heading",
        h3: "heading",
        h4: "heading",
        h5: "heading",
        h6: "heading",
        p: "paragraph",
        button: "button",
        a: "button",
        ul: "list",
        ol: "list",
        hr: "divider",
        img: "image",
      };

      const componentType = tagToComponentType[element.tag];

      if (componentType) {
        // Create a component for recognized tags
        const component: Component = {
          id: generateId(),
          type: componentType,
          content:
            componentType === "heading"
              ? `${element.label}`
              : componentType === "paragraph"
                ? "Sample paragraph text"
                : componentType === "button"
                  ? "Button"
                  : componentType === "list"
                    ? "Item 1, Item 2, Item 3"
                    : "",
          styles: {},
          formatting:
            componentType === "heading" || componentType === "paragraph"
              ? { align: "left" as const }
              : undefined,
        };
        components.push(component);
      } else if (element.children && element.children.length > 0) {
        // Recursively process children for container elements
        const childComponents =
          convertCrawledElementsToComponents(element.children);
        components.push(...childComponents);
      }
    }

    return components;
  };

  const handleApplyLayout = async () => {
    if (!layoutData || !currentProject) return;

    try {
      let sectionsCreated = 0;
      let componentsCreated = 0;

      // Process main structural elements (header, main, footer, sections)
      const mainSections = layoutData.structure.filter(
        (el) =>
          el.type === "layout" ||
          ["header", "main", "footer", "section", "article", "nav"].includes(
            el.tag,
          ),
      );

      // If no main sections found, create one section with all content
      const sectionsToProcess =
        mainSections.length > 0 ? mainSections : layoutData.structure.slice(0, 3);

      // Process sections sequentially to maintain order
      for (let i = 0; i < sectionsToProcess.length; i++) {
        const crawledSection = sectionsToProcess[i];
        if (!crawledSection) continue;

        // Create components from this section's content
        const components = convertCrawledElementsToComponents(
          crawledSection.children.length > 0
            ? crawledSection.children
            : [crawledSection],
        );

        // Only create section if we have components
        if (components.length > 0) {
          // Add the section with a descriptive name
          const sectionName =
            crawledSection.label || `${crawledSection.tag.toUpperCase()}`;

          const sectionTemplate = SECTION_TEMPLATES[0]; // Full-width
          addSection(sectionTemplate.id, sectionTemplate);
          sectionsCreated++;

          // Small delay to let state update
          await new Promise((resolve) => setTimeout(resolve, 50));

          // Get the latest project state and add components
          const latestProject = useProjectStore.getState().currentProject;
          if (latestProject) {
            const newSection =
              latestProject.layout[latestProject.layout.length - 1];
            if (newSection) {
              // Update section name
              updateSection(newSection.id, { name: sectionName }, true);

              // Add all components to this section
              components.forEach((component) => {
                addComponent(newSection.id, component);
                componentsCreated++;
              });
            }
          }
        }
      }

      // Show success message
      toast({
        title: "Layout Applied! ✨",
        description: `Created ${sectionsCreated} section(s) with ${componentsCreated} element(s)`,
      });

      // Clear the crawl data and switch to layers
      setLayoutData(null);
      setCrawlUrl("");
      setTimeout(() => {
        setActiveTab("layers"); // Switch to layers tab to see results
      }, 100);
    } catch (err) {
      console.error("Error applying layout:", err);
      toast({
        title: "Error",
        description: "Failed to apply layout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold text-foreground">Tools</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Build your page with sections and elements
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <TabsList className="mx-4 mt-4 grid w-auto grid-cols-4">
            <TabsTrigger value="sections" className="gap-1.5 text-xs">
              <Layout className="h-3.5 w-3.5" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-1.5 text-xs">
              <Square className="h-3.5 w-3.5" />
              Elements
            </TabsTrigger>
            <TabsTrigger value="layers" className="gap-1.5 text-xs">
              <Layers className="h-3.5 w-3.5" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" />
              Import
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Sections Tab - Add new section layouts */}
            <TabsContent value="sections" className="m-0 p-4">
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-foreground">
                  💡 Getting Started
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  <strong>Step 1:</strong> Click any section below to add it to
                  your page
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <strong>Step 2:</strong> Go to <strong>Elements</strong> tab
                  to add content
                </p>
              </div>
              <div className="grid gap-2">
                {orderedSectionTemplates.map((template) => (
                  <button
                    key={template.id}
                    draggable
                    onDragStart={(e) => handleLayoutDragStart(e, template.id)}
                    onClick={() => handleAddSection(template.id)}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-20 flex-shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded bg-muted px-1 font-mono text-[10px] leading-none text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      {template.preview}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {template.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Components Tab - Drag elements */}
            <TabsContent value="components" className="m-0 p-4">
              {!currentProject || currentProject.layout.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                  <Layout className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No sections yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Go to <strong>Sections</strong> tab to add a layout first
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-foreground">
                      Drag or Click to Add
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <strong>Click:</strong> Add to selected section |{" "}
                      <strong>Drag:</strong> Drop on canvas
                    </p>
                  </div>

                  {/* Section selector */}
                  <div className="mb-4">
                    <label className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
                      Target Section
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">
                            Click an element below to add it to this section
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <select
                      value={
                        selectedSection || currentProject.layout[0]?.id || ""
                      }
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {currentProject.layout.map((section, index) => (
                        <option key={section.id} value={section.id}>
                          {section.name || `Section ${index + 1}`} (
                          {section.columns} col)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Component Categories */}
                  <div className="space-y-2">
                    {COMPONENT_CATEGORIES.map((category) => (
                      <div
                        key={category.id}
                        className="rounded-lg border border-border bg-background overflow-hidden"
                      >
                        {/* Category Header */}
                        <button
                          onClick={() =>
                            setExpandedCategory(
                              expandedCategory === category.id
                                ? null
                                : category.id
                            )
                          }
                          className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
                              {iconMap[category.icon] || (
                                <Shapes className="h-4 w-4" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {category.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({category.components.length})
                            </span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              expandedCategory === category.id
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>

                        {/* Category Components */}
                        {expandedCategory === category.id && (
                          <div className="border-t border-border bg-muted/30 p-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              {category.components.map((comp) => (
                                <Tooltip key={comp.type}>
                                  <TooltipTrigger asChild>
                                    <button
                                      draggable
                                      onDragStart={(e) =>
                                        handleDragStart(e, comp.type)
                                      }
                                      onClick={() =>
                                        handleAddComponent(comp.type)
                                      }
                                      className="flex items-center gap-2 rounded-md border border-transparent bg-background p-2 text-left transition-all hover:border-primary hover:bg-accent hover:shadow-sm active:scale-95"
                                    >
                                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                        {iconMap[comp.icon] || (
                                          <Square className="h-4 w-4" />
                                        )}
                                      </div>
                                      <span className="text-xs font-medium text-foreground truncate">
                                        {comp.label}
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    <p className="text-xs">
                                      {comp.description ||
                                        `Add a ${comp.label.toLowerCase()}`}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Layers Tab - Manage sections */}
            <TabsContent value="layers" className="m-0 p-4">
              <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-foreground">
                  📚 Layer Management
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reorder, duplicate, or delete your sections
                </p>
              </div>

              {!currentProject || currentProject.layout.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                  <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    No sections yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add sections from the <strong>Sections</strong> tab
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentProject.layout.map((section, index) => (
                    <div
                      key={section.id}
                      className={`group rounded-lg border p-3 transition-all ${
                        selectedSection === section.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                        <button
                          onClick={() => setSelectedSection(section.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="text-sm font-medium text-foreground">
                            {section.name || `Section ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {section.columns} column
                            {section.columns > 1 ? "s" : ""} ·{" "}
                            {section.components.length} element
                            {section.components.length !== 1 ? "s" : ""}
                          </div>
                        </button>

                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSectionUp(section.id)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move up</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => moveSectionDown(section.id)}
                                disabled={
                                  index === currentProject.layout.length - 1
                                }
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move down</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => duplicateSection(section.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeSection(section.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Import Tab - Import HTML from URL, File, or Code */}
            <TabsContent value="import" className="m-0 p-4">
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-medium text-foreground">
                  Import HTML
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Import HTML from URL, file, or paste code directly
                </p>
              </div>

              {/* Show preview if we have parsed HTML */}
              {showPreview && parsedHTML ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">
                      {parsedHTML.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 gap-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border bg-background overflow-hidden" style={{ height: "400px" }}>
                    <HTMLPreview
                      html={parsedHTML.html}
                      title={parsedHTML.title}
                      baseUrl={importMode === "url" ? crawlUrl : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleConvertToComponents}
                      className="w-full"
                      size="sm"
                    >
                      <Layout className="mr-2 h-4 w-4" />
                      Convert to Components
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Convert HTML structure to editable components
                    </p>
                  </div>

                  {/* Asset info */}
                  {parsedHTML.assets.length > 0 && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-foreground">
                        Assets Found: {parsedHTML.assets.length}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Images and media will be loaded from their original URLs
                      </p>
                    </div>
                  )}
                </div>
              ) : layoutData ? (
                /* Show wireframe if we have layout data (fallback) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">
                      Layout Analysis
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-7 gap-1 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border bg-background">
                    <WireframeDisplay layout={layoutData} />
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleApplyLayout}
                      className="w-full"
                      size="sm"
                    >
                      <Layout className="mr-2 h-4 w-4" />
                      Apply Layout to Canvas
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      This will create sections and components based on the
                      analyzed structure
                    </p>
                  </div>
                </div>
              ) : (
                /* Input modes */
                <div className="space-y-4">
                  {/* Mode selector */}
                  <div className="flex gap-1 rounded-lg bg-muted p-1">
                    <button
                      onClick={() => setImportMode("url")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        importMode === "url"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Link className="h-3.5 w-3.5" />
                      URL
                    </button>
                    <button
                      onClick={() => setImportMode("file")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        importMode === "file"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      File
                    </button>
                    <button
                      onClick={() => setImportMode("code")}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        importMode === "code"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code className="h-3.5 w-3.5" />
                      Code
                    </button>
                  </div>

                  {/* URL Mode */}
                  {importMode === "url" && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-foreground">
                          Website URL
                        </label>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={crawlUrl}
                          onChange={(e) => setCrawlUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isLoading) {
                              handleFetchURL();
                            }
                          }}
                          className="text-sm"
                          disabled={isLoading}
                        />
                      </div>

                      <Button
                        onClick={handleFetchURL}
                        disabled={isLoading || !crawlUrl.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Page
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* File Mode */}
                  {importMode === "file" && (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".html,.htm"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary hover:bg-muted/50"
                      >
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          Click to upload HTML file
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Supports .html and .htm files
                        </p>
                      </div>

                      {isLoading && (
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">
                            Processing file...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Code Mode */}
                  {importMode === "code" && (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-foreground">
                          HTML Code
                        </label>
                        <Textarea
                          placeholder="<html>&#10;  <body>&#10;    <h1>Hello World</h1>&#10;  </body>&#10;</html>"
                          value={htmlCode}
                          onChange={(e) => setHtmlCode(e.target.value)}
                          className="min-h-[200px] font-mono text-xs"
                          disabled={isLoading}
                        />
                      </div>

                      <Button
                        onClick={handleParseCode}
                        disabled={isLoading || !htmlCode.trim()}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Parsing...
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview HTML
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Error display */}
                  {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-destructive">
                            Error
                          </p>
                          <p className="mt-1 text-xs text-destructive/90">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Help text */}
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-foreground">
                      How it works:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {importMode === "url" && (
                        <>
                          <li>• Enter any website URL</li>
                          <li>• Preview the page in live mode</li>
                          <li>• Edit content directly on the preview</li>
                          <li>• Convert to components for further editing</li>
                        </>
                      )}
                      {importMode === "file" && (
                        <>
                          <li>• Upload any .html or .htm file</li>
                          <li>• Preview the page instantly</li>
                          <li>• Styles and assets will be preserved</li>
                          <li>• Convert to editable components</li>
                        </>
                      )}
                      {importMode === "code" && (
                        <>
                          <li>• Paste your HTML code directly</li>
                          <li>• Supports full HTML documents or fragments</li>
                          <li>• Preview and edit in real-time</li>
                          <li>• Export or convert to components</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
