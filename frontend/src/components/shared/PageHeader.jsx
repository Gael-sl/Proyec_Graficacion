import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  onSave = null,
  onNew = null,
  saving = false,
  className = "",
  children
}) {
  return (
    <div className={`apple-glass-panel border-b border-white/60 ${className || "px-8 py-6 mb-6"}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div>
            <h1 className="text-[1.75rem] font-extrabold text-slate-800 tracking-tight leading-none">{title}</h1>
            {description && (
              <p className="text-slate-600 font-medium mt-1.5">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onNew && (
            <Button 
              variant="outline" 
              onClick={onNew}
              className="apple-glass-button bg-white/40 hover:bg-white/60 text-slate-700 px-5 border-white/60"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo registro
            </Button>
          )}
          {onSave && (
            <Button 
              onClick={onSave}
              disabled={saving}
              className="apple-glass-button bg-indigo-600/90 text-white hover:bg-indigo-600 border-transparent shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}