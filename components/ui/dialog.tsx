import React, { createContext, useContext, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../atoms/Icon';

type DialogContextProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextProps | null>(null);

const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a Dialog');
    }
    return context;
};

const Dialog = ({ children, open: controlledOpen, onOpenChange: setControlledOpen }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const onOpenChange = setControlledOpen ?? setUncontrolledOpen;

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onOpenChange]);

    return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
};

// FIX: Correctly implement `asChild` prop to resolve type error and compose onClick handlers.
const DialogTrigger = ({ children, asChild = false }: { children: React.ReactNode, asChild?: boolean }) => {
    const { onOpenChange } = useDialog();
    if (asChild) {
        const child = React.Children.only(children);

        if (React.isValidElement(child)) {
            const element = child as React.ReactElement<any>;
            return React.cloneElement(element, {
                ...element.props,
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    if (element.props.onClick) {
                        element.props.onClick(e);
                    }
                    onOpenChange(true);
                },
            });
        }
    }
    return <button onClick={() => onOpenChange(true)}>{children}</button>;
};

const DialogPortal = ({ children }: { children: React.ReactNode }) => {
    const { open } = useDialog();
    return open ? <>{children}</> : null;
};

const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn('fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
            {...props}
        />
    );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useDialog();
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <DialogOverlay onClick={() => onOpenChange(false)} />
            <div
                ref={ref}
                className={cn(
                    'fixed z-50 grid w-full max-w-lg gap-4 border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg',
                    className
                )}
                {...props}
            >
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                >
                    <Icon name="x" className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    );
});
DialogContent.displayName = 'DialogContent';


const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};