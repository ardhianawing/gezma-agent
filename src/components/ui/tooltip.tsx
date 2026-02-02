'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

function useTooltip() {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within a TooltipProvider");
  }
  return context;
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface TooltipProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  children: React.ReactNode;
}

const Tooltip = ({ open: controlledOpen, onOpenChange, delayDuration = 200, children }: TooltipProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (newOpen) {
        timeoutRef.current = setTimeout(() => {
          (onOpenChange || setUncontrolledOpen)(true);
        }, delayDuration);
      } else {
        (onOpenChange || setUncontrolledOpen)(false);
      }
    },
    [onOpenChange, delayDuration]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { onOpenChange } = useTooltip();

  return (
    <div
      ref={ref}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      onFocus={() => onOpenChange(true)}
      onBlur={() => onOpenChange(false)}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, side = "top", sideOffset = 4, children, ...props }, ref) => {
    const { open } = useTooltip();

    if (!open) return null;

    const sideStyles = {
      top: `bottom-full left-1/2 -translate-x-1/2 mb-${sideOffset}`,
      bottom: `top-full left-1/2 -translate-x-1/2 mt-${sideOffset}`,
      left: `right-full top-1/2 -translate-y-1/2 mr-${sideOffset}`,
      right: `left-full top-1/2 -translate-y-1/2 ml-${sideOffset}`,
    };

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 overflow-hidden rounded-[8px] border border-[var(--gray-border)] bg-[var(--charcoal)] px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95",
          sideStyles[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
