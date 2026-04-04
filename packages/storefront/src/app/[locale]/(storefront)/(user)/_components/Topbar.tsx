"use client";

import { Button } from "@findeg/ui";
import { IconTooltip } from "@findeg/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@findeg/ui";
import { CircleUser, Search } from "lucide-react";
import { Input } from "@findeg/ui";
import { logoutAction } from "@/features/identity/application/actions/auth";

/**
 * Topbar for the user dashboard.
 */
export function Topbar() {
  return (
    <header className="flex h-[60px] items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background ps-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <IconTooltip label="Toggle user menu" asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              aria-label="Toggle user menu"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
        </IconTooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={logoutAction}>
            <button type="submit" className="w-full text-left">
              <DropdownMenuItem asChild>
                <span>Logout</span>
              </DropdownMenuItem>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
