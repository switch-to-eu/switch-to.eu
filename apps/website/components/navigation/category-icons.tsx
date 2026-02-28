import {
  Brain,
  Globe,
  Mail,
  MessageSquare,
  MapPin,
  Search,
  Users,
  FolderOpen,
  type LucideIcon,
  Layers,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  globe: Globe,
  mail: Mail,
  "message-square": MessageSquare,
  "map-pin": MapPin,
  search: Search,
  users: Users,
  folder: FolderOpen,
};

// Each category gets a unique SVG shape background from /images/shapes/
const shapeMap: Record<string, string> = {
  brain: "/images/shapes/blob.svg",
  globe: "/images/shapes/pebble.svg",
  mail: "/images/shapes/cloud.svg",
  "message-square": "/images/shapes/scallop.svg",
  "map-pin": "/images/shapes/puddle.svg",
  search: "/images/shapes/flower.svg",
  users: "/images/shapes/clover-3.svg",
  folder: "/images/shapes/daisy.svg",
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Layers;
  return iconMap[iconName] ?? Layers;
}

export function getCategoryShape(iconName?: string): string {
  if (!iconName) return "/images/shapes/blob.svg";
  return shapeMap[iconName] ?? "/images/shapes/blob.svg";
}
