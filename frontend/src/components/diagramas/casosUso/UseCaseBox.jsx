import React from "react";
import { Trash2 } from "lucide-react";

export default function UseCaseBox({ useCase, isSelected, isDragging, onClick, onDoubleClick, onDelete, onDuplicate, onMouseDown }) {
  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing"
      style={{ left: useCase.x, top: useCase.y, userSelect: "none" }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={`relative flex items-center justify-center transition-all ${
          isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:shadow-sm"
        }`}
        onClick={onClick}
        style={{
          width: useCase.width || 140,
          height: useCase.height || 70,
          background: "#ffffff",
          border: isSelected ? "2px solid #2563eb" : "2px solid #1e293b",
          borderRadius: "50%",
          textAlign: "center",
          padding: "8px",
          opacity: isDragging ? 0.7 : 1,
        }}
      >
        <span className="text-[12px] font-medium text-slate-900 leading-tight px-3 line-clamp-3">
          {useCase.name}
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
