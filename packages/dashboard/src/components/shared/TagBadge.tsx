"use client";

import * as React from "react";
import { Badge, BadgeProps } from "@ui";
import { Tag } from "@backend/features/catalog";
import { cn } from "@lib/utils";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TagBadgeProps extends BadgeProps {
  tag: Tag;
  showGroup?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Admin Tag Badge
 *
 * Renders a tag with distinctive coloring based on its group.
 */
export function TagBadge({ tag, showGroup = false, className, ...props }: TagBadgeProps) {
  // Simple deterministic color generation based on group name
  /**
   *
   */
  const getGroupColor = (group?: string | null) => {
    if (!group) return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";

    const groupLower = group.toLowerCase();

    // Brand/Primary colors for common groups
    if (groupLower === "brand")
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
    if (groupLower === "material")
      return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
    if (groupLower === "color")
      return "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200";
    if (groupLower === "collection")
      return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200";
    if (groupLower === "season")
      return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";

    // Default for other groups: cycle through colors based on string hash
    const colors = [
      "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200",
      "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
      "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200",
      "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
      "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-200",
    ];

    let hash = 0;
    for (let i = 0; i < group.length; i++) {
      hash = group.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const groupClass = getGroupColor(tag.group);
  const customStyle = tag.color
    ? { backgroundColor: tag.color, color: "#fff", borderColor: tag.color }
    : {};

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", !tag.color && groupClass, className)}
      style={tag.color ? customStyle : undefined}
      {...props}
    >
      {showGroup && tag.group && (
        <span className="opacity-60 mr-1.5 border-r border-current pr-1.5 uppercase text-[10px]">
          {tag.group}
        </span>
      )}
      {(() => {
        const Icon = tag.icon
          ? ((LucideIcons as unknown as Record<string, LucideIcon>)[tag.icon] as LucideIcon)
          : null;
        return Icon ? <Icon className="mr-1.5 h-3.5 w-3.5" /> : null;
      })()}
      {tag.key}
    </Badge>
  );
}
