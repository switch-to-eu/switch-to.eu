"use client";

import {
  ArrowLeftIcon,
  ArrowRight,
  AlertTriangle,
  Brain,
  Calendar,
  Check,
  CheckCircle,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleIcon,
  Clock,
  Component,
  Edit,
  ExternalLink,
  FileQuestion,
  FileText,
  FolderOpen,
  Globe,
  Heart,
  Info,
  Layers,
  LayoutGrid,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Palette,
  Plus,
  Search,
  SearchIcon,
  Shield,
  Sparkles,
  Star,
  Type,
  User,
  Users,
  X,
  XCircle,
  XIcon,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface IconEntry {
  name: string;
  Icon: LucideIcon;
  usedIn: string;
}

const categories: { title: string; description: string; icons: IconEntry[] }[] =
  [
    {
      title: "Navigation & Category",
      description: "Icons used in mega dropdown, navigation, and category indicators.",
      icons: [
        { name: "Brain", Icon: Brain, usedIn: "category-icons" },
        { name: "Globe", Icon: Globe, usedIn: "category-icons" },
        { name: "Mail", Icon: Mail, usedIn: "category-icons" },
        { name: "MessageSquare", Icon: MessageSquare, usedIn: "category-icons" },
        { name: "MapPin", Icon: MapPin, usedIn: "category-icons" },
        { name: "Search", Icon: Search, usedIn: "category-icons, search" },
        { name: "Users", Icon: Users, usedIn: "category-icons" },
        { name: "FolderOpen", Icon: FolderOpen, usedIn: "category-icons" },
        { name: "Layers", Icon: Layers, usedIn: "category-icons (fallback)" },
        { name: "Menu", Icon: Menu, usedIn: "mobile-nav" },
        { name: "ChevronDown", Icon: ChevronDown, usedIn: "nav dropdowns" },
      ],
    },
    {
      title: "Actions & Status",
      description: "Icons for interactive elements, form states, and feedback.",
      icons: [
        { name: "Check", Icon: Check, usedIn: "guides, steps" },
        { name: "CheckIcon", Icon: CheckIcon, usedIn: "checkbox, select" },
        { name: "CheckCircle", Icon: CheckCircle, usedIn: "plotty, success" },
        { name: "Plus", Icon: Plus, usedIn: "plotty create" },
        { name: "X", Icon: X, usedIn: "close, dismiss" },
        { name: "XIcon", Icon: XIcon, usedIn: "dialog, sheet close" },
        { name: "XCircle", Icon: XCircle, usedIn: "error states" },
        { name: "Edit", Icon: Edit, usedIn: "plotty edit" },
        { name: "Loader2", Icon: Loader2, usedIn: "loading-button" },
        { name: "ExternalLink", Icon: ExternalLink, usedIn: "brand-indicator" },
      ],
    },
    {
      title: "Chevrons & Arrows",
      description: "Directional indicators for menus, selects, and navigation.",
      icons: [
        { name: "ChevronDownIcon", Icon: ChevronDownIcon, usedIn: "select, nav" },
        { name: "ChevronUpIcon", Icon: ChevronUpIcon, usedIn: "select" },
        { name: "ChevronRightIcon", Icon: ChevronRightIcon, usedIn: "dropdown-menu" },
        { name: "ArrowLeftIcon", Icon: ArrowLeftIcon, usedIn: "back navigation" },
        { name: "ArrowRight", Icon: ArrowRight, usedIn: "tool-showcase" },
      ],
    },
    {
      title: "Content & Data",
      description: "Icons representing content types, time, and data.",
      icons: [
        { name: "Calendar", Icon: Calendar, usedIn: "plotty" },
        { name: "Clock", Icon: Clock, usedIn: "plotty" },
        { name: "FileText", Icon: FileText, usedIn: "plotty" },
        { name: "FileQuestion", Icon: FileQuestion, usedIn: "error states" },
        { name: "User", Icon: User, usedIn: "plotty" },
        { name: "Info", Icon: Info, usedIn: "domain analyzer" },
      ],
    },
    {
      title: "Security & Trust",
      description: "Icons conveying security, privacy, and trust signals.",
      icons: [
        { name: "Shield", Icon: Shield, usedIn: "plotty, domain analyzer" },
        { name: "Lock", Icon: Lock, usedIn: "plotty, error states" },
        { name: "AlertTriangle", Icon: AlertTriangle, usedIn: "error states" },
      ],
    },
    {
      title: "UI Kit & Design System",
      description: "Icons used in the UI kit navigation and overview.",
      icons: [
        { name: "Palette", Icon: Palette, usedIn: "ui-kit colors" },
        { name: "Type", Icon: Type, usedIn: "ui-kit typography" },
        { name: "Component", Icon: Component, usedIn: "ui-kit components" },
        { name: "LayoutGrid", Icon: LayoutGrid, usedIn: "ui-kit blocks" },
        { name: "Sparkles", Icon: Sparkles, usedIn: "ui-kit shapes" },
        { name: "Package", Icon: Package, usedIn: "ui-kit blocks, keepfocus" },
        { name: "SearchIcon", Icon: SearchIcon, usedIn: "command palette" },
        { name: "CircleIcon", Icon: CircleIcon, usedIn: "dropdown-menu" },
      ],
    },
    {
      title: "General Purpose",
      description: "Versatile icons useful across the platform.",
      icons: [
        { name: "Heart", Icon: Heart, usedIn: "general" },
        { name: "Star", Icon: Star, usedIn: "general" },
        { name: "Zap", Icon: Zap, usedIn: "general" },
      ],
    },
  ];

const allIcons = categories.flatMap((c) => c.icons);

export default function IconsPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      icons: cat.icons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(search.toLowerCase()) ||
          icon.usedIn.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => cat.icons.length > 0);

  return (
    <div>
      <h1 className="text-4xl mb-2">Icons</h1>
      <p className="text-muted-foreground mb-8">
        All {allIcons.length} Lucide icons used across the Switch-to.eu
        platform, organized by category.
      </p>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Filter icons by name or usage..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>

      {/* Categories */}
      {filteredCategories.map((cat) => (
        <section key={cat.title} className="mb-10">
          <h2 className="text-2xl mb-1">{cat.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {cat.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {cat.icons.map(({ name, Icon, usedIn }) => (
              <div
                key={name}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 bg-muted/20 hover:bg-white hover:border-primary/30 transition-colors"
              >
                <Icon className="h-6 w-6 text-foreground group-hover:text-brand-navy transition-colors" />
                <span className="text-xs font-medium text-center">{name}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {usedIn}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {filteredCategories.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No icons match &ldquo;{search}&rdquo;.
        </p>
      )}
    </div>
  );
}
