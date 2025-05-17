import * as React from "react";
import { cn } from "../../utils/cn";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportRef?: React.RefObject<HTMLDivElement>;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, viewportRef, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
        <div ref={viewportRef} className="h-full w-full overflow-auto">
          {children}
        </div>
      </div>
    );
  }
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea }; 