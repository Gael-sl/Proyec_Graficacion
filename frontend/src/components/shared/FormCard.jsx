import React from "react";
import { cn } from "@/lib/utils";

export default function FormCard({ title, description, children, className }) {
  return (
    <div className={cn(
      "apple-glass-card overflow-hidden",
      className
    )}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-white/40 bg-white/30">
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}