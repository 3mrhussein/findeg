import React from "react";

interface TabsProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string; // Added className
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string; // Added className
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children, value, defaultValue, onValueChange, className = "" }) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue || "");
  
  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { activeTab, onValueChange: handleValueChange })
          : child
      )}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {children}
  </div>
);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, value }) => (
  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
    {children}
  </button>
);

export const TabsContent: React.FC<TabsContentProps> = ({ children }) => (
  <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
    {children}
  </div>
);
