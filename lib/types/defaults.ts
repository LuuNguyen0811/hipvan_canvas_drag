import type { Component, ComponentType } from "./component";

export const DEFAULT_COMPONENT_CONTENT: Record<ComponentType, string> = {
  // Basic
  heading: "Your Heading Here",
  paragraph: "This is a paragraph. Click to edit and add your own content.",
  image: "Image Placeholder",
  button: "Click Me",
  divider: "",
  spacer: "",
  card: "Card Title",
  list: "Item 1, Item 2, Item 3",
  collection: "",
  "product-list": "",
  layout: "",
  // Form
  input: "",
  textareaField: "",
  select: "",
  checkbox: "Checkbox label",
  radio: "Radio option",
  form: "",
  // Navigation
  navbar: "Logo",
  menu: "Menu Item 1, Menu Item 2, Menu Item 3",
  breadcrumb: "Home, Products, Category",
  footer: "© 2024 Your Company",
  link: "Click here",
  // Media
  video: "",
  audio: "",
  embed: "",
  icon: "star",
  // Data
  table: "",
  badge: "Badge",
  avatar: "",
  progress: "",
  // Layout
  grid: "",
  flex: "",
  accordion: "",
  tabs: "",
};

export const DEFAULT_COMPONENT_PROPS: Partial<Record<ComponentType, Partial<Component>>> = {
  input: {
    placeholder: "Enter text...",
    label: "Label",
  },
  textareaField: {
    placeholder: "Enter your message...",
    label: "Message",
  },
  select: {
    label: "Select an option",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
      { label: "Option 3", value: "3" },
    ],
  },
  checkbox: {
    label: "I agree to the terms",
  },
  radio: {
    label: "Choose an option",
    options: [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ],
  },
  video: {
    controls: true,
    src: "",
  },
  audio: {
    controls: true,
    src: "",
  },
  table: {
    headers: ["Column 1", "Column 2", "Column 3"],
    rows: [
      ["Row 1, Cell 1", "Row 1, Cell 2", "Row 1, Cell 3"],
      ["Row 2, Cell 1", "Row 2, Cell 2", "Row 2, Cell 3"],
    ],
  },
  progress: {
    value: 50,
    max: 100,
  },
  avatar: {
    initials: "AB",
  },
  accordion: {
    items: [
      { title: "Section 1", content: "Content for section 1" },
      { title: "Section 2", content: "Content for section 2" },
    ],
  },
  tabs: {
    items: [
      { title: "Tab 1", content: "Content for tab 1" },
      { title: "Tab 2", content: "Content for tab 2" },
    ],
  },
  link: {
    href: "#",
    target: "_self",
  },
  navbar: {
    items: [
      { title: "Home", content: "/" },
      { title: "About", content: "/about" },
      { title: "Contact", content: "/contact" },
    ],
  },
};
