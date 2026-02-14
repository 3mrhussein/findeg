import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getServices } from "@/server/getServices";

/**
 *
 */
export async function Topbar() {
  const { auth } = getServices();
  const session = await auth.getSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-end border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium">{session?.email || "Admin User"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {session?.role || "Admin"}
          </span>
        </div>
        <Avatar>
          <AvatarImage src="" alt="Admin" />
          <AvatarFallback className="bg-primary text-primary-foreground">A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
