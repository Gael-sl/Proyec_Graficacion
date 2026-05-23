import React from "react";
import { User, Monitor, Database, Globe, Server, ArrowRight, StickyNote, Layers, Zap } from "lucide-react";

const paletteItems = [
  { type: "actor",    label: "Actor",         icon: User,     defaultName: "Actor" },
  { type: "system",   label: "Sistema",        icon: Monitor,  defaultName: "Sistema" },
  { type: "database", label: "Base de datos",  icon: Database, defaultName: "BD" },
  { type: "external", label: "Externo",        icon: Globe,    defaultName: "Externo" },
  { type: "service",  label: "Servicio",       icon: Server,   defaultName: "Servicio" },
];

const messageItems = [
  { msgType: "sync",   label: "Mensaje síncrono",  color: "bg-indigo-500" },
  { msgType: "async",  label: "Mensaje asíncrono", color: "bg-purple-500" },
  { msgType: "return", label: "Retorno",            color: "bg-emerald-500" },
  { msgType: "self",   label: "Auto-mensaje",       color: "bg-amber-500" },
];

const fragmentItems = [
  { fragType: "alt",  label: "alt — alternativa",  color: "bg-indigo-400" },
  { fragType: "loop", label: "loop — bucle",        color: "bg-amber-400" },
  { fragType: "opt",  label: "opt — opcional",      color: "bg-emerald-400" },
  { fragType: "par",  label: "par — paralelo",      color: "bg-purple-400" },
];

export default function SequencePalette() {
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("application/palette-item", JSON.stringify(item));
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Contenedor scrollable con flujo interno */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Participantes */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Participantes</p>
        </div>
        <div className="p-3 space-y-2">
          {paletteItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: "actor", ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Mensajes */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mensajes</p>
        </div>
        <div className="p-3 space-y-2">
          {messageItems.map((item) => (
            <div
              key={item.msgType}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: "message", ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Fragmentos */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fragmentos</p>
        </div>
        <div className="p-3 space-y-2">
          {fragmentItems.map((item) => (
            <div
              key={item.fragType}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: "fragment", ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Otros */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Otros</p>
        </div>
        <div className="p-3 space-y-2">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, { kind: "note" })}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-300 cursor-grab active:cursor-grabbing transition-all select-none"
          >
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Nota</span>
          </div>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, { kind: "activation" })}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
          >
            <div className="w-8 h-8 bg-indigo-300 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700">Activación</span>
          </div>
        </div>
      </div>


    </aside>
  );
}