import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 *
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children && <div className="flex items-center space-x-2">{children}</div>}
      </div>
      <Separator />
    </div>
  );
}
