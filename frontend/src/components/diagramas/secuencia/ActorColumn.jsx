import React from "react";
import { User, Monitor, Database, Globe, Server, Trash2, Pencil } from "lucide-react";

const ACTOR_WIDTH = 120;

const iconMap = {
  actor: User,
  system: Monitor,
  database: Database,
  external: Globe,
  service: Server,
};

const typeColors = {
  actor: "from-indigo-500 to-purple-600",
  system: "from-blue-500 to-cyan-600",
  database: "from-orange-500 to-amber-600",
  external: "from-slate-500 to-slate-700",
  service: "from-emerald-500 to-teal-600",
};

export default function ActorColumn({ actor, isSelected, isDragging, onClick, onDoubleClick, onMouseDown, onDelete, onDuplicate }) {
  return (
    <div
      className="absolute"
      style={{ left: actor.x, top: 20, width: ACTOR_WIDTH, zIndex: 10, cursor: isDragging ? "grabbing" : "grab" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      <div className={`relative flex flex-col items-center`}>
        {/* UML Strict Rectangle */}
        <div className={`
          w-full border-2 bg-white flex flex-col items-center justify-center min-h-[40px] px-2 transition-all
          ${isSelected ? "border-blue-600 shadow-md ring-2 ring-blue-100" : "border-slate-800 shadow-sm"}
        `}>
          <p className="text-[11px] font-bold text-slate-900 text-center leading-tight">{actor.name}</p>
        </div>

        {/* Action buttons */}
        {isSelected && (
          <div className="absolute -top-3 -right-3 flex gap-1 bg-white p-1 rounded-full shadow border border-slate-200 z-50">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
              className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors"
              title="Editar"
            >
              <Pencil className="w-3 h-3 text-slate-700" />
            </button>
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