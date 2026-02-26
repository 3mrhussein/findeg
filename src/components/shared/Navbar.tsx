import { CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";
import ToggleTheme from "./ToggleTheme";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import ToggleLanguage from "./ToggleLanguage";

import { SidebarTrigger } from "../ui/sidebar";

/**
 *
 */
const Navbar = () => {
  return (
    <nav className="p-4 flex items-center justify-between border-b">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link href={"/"} className="font-bold text-lg">
          FindEg
        </Link>
      </div>
      {/* RIGHT SIDE */}
      <div className="flex gap-4 items-center">
        {/* Language Toggle */}
        <ToggleLanguage />
        <ToggleTheme />
        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCardIcon />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
