import React from "react";
import { Package, Code2, Box, Trash2 } from "lucide-react";

export default function PackageBox({ element, isSelected, onClick, onDoubleClick, onDelete, onDuplicate, onMouseDown }) {
  // Pale yellow for UML package
  const bgColor = "#fffdf0";
  const borderColor = "#1e293b";

  return (
    <div
      className={`absolute cursor-pointer select-none group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 100 : 10,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {/* Folder Tab */}
      <div 
        style={{ 
          height: "20px", 
          width: "40%", 
          minWidth: "60px",
          background: bgColor, 
          border: `2px solid ${borderColor}`, 
          borderBottom: "none",
        }}
      />
      {/* Main Body */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          background: bgColor, 
          border: `2px solid ${borderColor}`,
          padding: "8px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <p className={`font-bold text-[13px] text-red-700 text-center truncate ${element.type === 'interface' ? 'italic' : ''}`}>
          {element.name}
        </p>
        <p className="text-[10px] text-slate-800 text-center capitalize mb-1">
          {element.type === 'interface' ? '«interface»' : element.type === 'class' ? '«class»' : ''}
        </p>
        {element.description && (
          <p className="text-[11px] text-slate-700 text-center line-clamp-3 mt-1 leading-tight">
            {element.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
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

      {/* Resize handle */}
      <div
        data-resize="true"
        className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
        title="Redimensionar"
      />
    </div>
  );
}
