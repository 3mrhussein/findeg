"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@findeg/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@findeg/ui";
import { Input } from "@findeg/ui";
import { ScrollArea } from "@findeg/ui";

const COMMON_ICONS = [
  "Tag",
  "Star",
  "Heart",
  "Clock",
  "Package",
  "Truck",
  "Sparkles",
  "Percent",
  "Gift",
  "Zap",
  "Shield",
  "Award",
  "Flame",
  "Crown",
  "Anchor",
  "Bell",
  "Book",
  "Check",
  "Circle",
  "Eye",
  "Flag",
  "Ghost",
  "GlassWater",
  "Home",
  "Image",
  "Info",
  "Leaf",
  "Lightbulb",
  "Lock",
  "Map",
  "Moon",
  "Music",
  "Palette",
  "Phone",
  "Pin",
  "Plane",
  "Rocket",
  "Scissors",
  "Search",
  "Settings",
  "Share",
  "ShoppingCart",
  "Smile",
  "Sun",
  "Target",
  "ThumbsUp",
  "Trophy",
  "User",
  "Video",
  "Watch",
  "Scissors",
  "Pen",
  "Eraser",
  "Pencil",
  "GraduationCap",
  "Library",
  "School",
  "Medal",
  "TrendingUp",
  "Flashlight",
].sort();

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 *
 */
export function IconPicker({ value, onChange, placeholder = "Select icon..." }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredIcons = COMMON_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 px-3 rounded-md"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {SelectedIcon ? (
              <SelectedIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
            ) : (
              <span className="text-muted-foreground text-[11px] font-normal">{placeholder}</span>
            )}
            {value && <span className="truncate text-xs font-medium">{value}</span>}
          </div>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center border-b px-2.5">
          <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-40" />
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md bg-transparent py-2 text-[11px] outline-none border-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <ScrollArea className="h-[300px] p-2">
          <div className="grid grid-cols-4 gap-1">
            {filteredIcons.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName];
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  className={cn(
                    "h-11 w-full flex flex-col items-center justify-center p-0.5 hover:bg-muted relative rounded-sm transition-colors",
                    value === iconName && "bg-muted text-primary font-bold",
                  )}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  title={iconName}
                >
                  {Icon && (
                    <Icon
                      className={cn("h-4 w-4", value === iconName ? "opacity-100" : "opacity-70")}
                    />
                  )}
                  <span className="text-[7px] mt-0.5 truncate w-full px-1 text-center opacity-70">
                    {iconName}
                  </span>
                  {value === iconName && (
                    <div className="absolute top-0.5 right-0.5 bg-primary rounded-full p-0.5">
                      <Check className="h-1.5 w-1.5 text-primary-foreground" />
                    </div>
                  )}
                </Button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-4 p-4 text-center text-sm text-muted-foreground">
                No icons found.
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t bg-muted/50">
          <p className="text-[10px] text-muted-foreground text-center">
            Type any Lucide icon name to select from common options.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
