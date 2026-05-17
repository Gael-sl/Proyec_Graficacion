import React from "react";
import { Trash2 } from "lucide-react";
import { User } from "lucide-react";

export default function ActorBox({ actor, isSelected, isDragging, onClick, onDoubleClick, onDelete, onDuplicate, onMouseDown }) {
  return (
    <div
      className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
      style={{ left: actor.x, top: actor.y, userSelect: "none" }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
    >
      <div
        className={`relative flex flex-col items-center gap-1 p-2 transition-all ${
          isSelected ? "ring-2 ring-blue-400 bg-blue-50/50 rounded-lg" : ""
        }`}
        style={{ opacity: isDragging ? 0.7 : 1 }}
      >
        {/* UML Stick Figure */}
        <svg width="40" height="60" viewBox="0 0 40 60" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="10" r="8" fill="none" />
          <line x1="20" y1="18" x2="20" y2="40" />
          <line x1="20" y1="24" x2="5" y2="24" />
          <line x1="20" y1="24" x2="35" y2="24" />
          <line x1="20" y1="40" x2="10" y2="58" />
          <line x1="20" y1="40" x2="30" y2="58" />
        </svg>
        <span className="text-[11px] font-medium text-slate-900 text-center max-w-[80px] leading-tight">
          {actor.name}
        </span>

        {isSelected && (
          <div className="absolute -top-3 -right-3 flex gap-1 bg-white p-1 rounded-full shadow border border-slate-200 z-50">
            {onDuplicate && (
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
                title="Duplicar"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            )}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-5 h-5 flex items-center justify-center hover:bg-red-50 rounded-full transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
