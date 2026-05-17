import React from "react";
import { Box, Database, Shield, File, Trash2 } from "lucide-react";

export default function ClassBox({ classItem, isSelected, onClick, onDoubleClick, onDelete, onDuplicate, onMouseDown }) {
  // Classic UML Colors
  const headerColor = classItem.type === "interface" ? "bg-[#d0e0ed]" : "bg-[#7cb5ec]";

  return (
    <div
      className={`absolute bg-white border-2 rounded-sm shadow-sm transition-all cursor-pointer select-none group overflow-hidden ${isSelected ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-800"}`}
      style={{
        left: classItem.x,
        top: classItem.y,
        width: classItem.width,
        height: classItem.height,
        zIndex: isSelected ? 100 : 10,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {/* Header */}
      <div className={`${headerColor} px-3 py-1.5 flex flex-col items-center justify-center border-b-2 border-slate-800 text-center`}>
        {classItem.type === "interface" && <span className="text-[10px] italic text-slate-800">&laquo;interface&raquo;</span>}
        {classItem.type === "abstract" && <span className="text-[10px] italic text-slate-800">&laquo;abstract&raquo;</span>}
        {classItem.type === "enum" && <span className="text-[10px] italic text-slate-800">&laquo;enum&raquo;</span>}
        <p className={`font-bold text-[13px] text-slate-900 truncate w-full ${classItem.type === "abstract" ? "italic" : ""}`}>{classItem.name}</p>
      </div>

      {/* Atributos */}
      <div className="flex-1 px-2 py-1.5 text-[11px] leading-tight overflow-hidden">
        {classItem.attributes && classItem.attributes.length > 0 ? (
          classItem.attributes.map((attr, i) => (
            <p key={i} className="text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {attr.visibility || '-'} {attr.name}: {attr.type || 'any'}
            </p>
          ))
        ) : null}
      </div>

      {/* Métodos */}
      <div className="flex-1 px-2 py-1.5 text-[11px] leading-tight border-t-2 border-slate-800 overflow-hidden">
        {classItem.methods && classItem.methods.length > 0 ? (
          classItem.methods.map((method, i) => (
            <p key={i} className="text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {method.visibility || '+'} {method.name}()
            </p>
          ))
        ) : null}
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
        className="absolute bottom-0 right-0 w-3 h-3 bg-slate-300 rounded-tl cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
        title="Redimensionar"
      />
    </div>
  );
}
