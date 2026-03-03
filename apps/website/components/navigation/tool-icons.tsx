import {
  GlobeIcon,
  CalendarIcon,
  ListChecksIcon,
  TargetIcon,
  FileLock2Icon,
  BrainIcon,
  KanbanSquareIcon,
  type LucideIcon,
  Layers,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  globe: GlobeIcon,
  calendar: CalendarIcon,
  "list-checks": ListChecksIcon,
  target: TargetIcon,
  "file-lock": FileLock2Icon,
  brain: BrainIcon,
  "kanban-square": KanbanSquareIcon,
};

const shapeMap: Record<string, string> = {
  globe: "/images/shapes/sunburst.svg",
  calendar: "/images/shapes/cloud.svg",
  "list-checks": "/images/shapes/star.svg",
  target: "/images/shapes/pebble.svg",
  "file-lock": "/images/shapes/heart.svg",
  brain: "/images/shapes/spark.svg",
  "kanban-square": "/images/shapes/flower.svg",
};

export function getToolIcon(iconName?: string): LucideIcon {
  if (!iconName) return Layers;
  return iconMap[iconName] ?? Layers;
}

export function getToolShape(iconName?: string): string {
  if (!iconName) return "/images/shapes/blob.svg";
  return shapeMap[iconName] ?? "/images/shapes/blob.svg";
}
