import { cn } from "@/lib/utils";
import React from "react";

export default function ShineBorder({
  children,
  className,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
}) {
  return (
    <div
      className={cn(
        "relative w-full h-full rounded-lg overflow-hidden",
        className
      )}
    >
      <div
        className="absolute -inset-[1px] rounded-lg"
        style={{
          background: `linear-gradient(135deg, 
            ${color[0]} 0%, 
            ${color[1]} 50%,
            ${color[2]} 100%
          )`,
          backgroundSize: "100% 100%"
        }}
      />
      
      <div className="absolute inset-[1px] bg-white rounded-[6px]">
        {children}
      </div>
    </div>
  );
}
