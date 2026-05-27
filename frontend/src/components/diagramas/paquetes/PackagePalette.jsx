import React from "react";
import { Package, Code2, Box, Share2, StickyNote, Link2 } from "lucide-react";

const paletteItems = [
  { type: "package", label: "Paquete", icon: Package, defaultName: "Paquete" },
  { type: "interface", label: "Interfaz", icon: Code2, defaultName: "Interfaz" },
  { type: "class", label: "Clase", icon: Box, defaultName: "Clase" },
];

const relationshipItems = [
  { relType: "dependency", label: "Dependencia", color: "bg-indigo-500" },
  { relType: "import", label: "Importa", color: "bg-purple-500" },
  { relType: "implements", label: "Implementa", color: "bg-emerald-500" },
];

const otherItems = [
  { kind: "note", label: "Nota", icon: StickyNote, color: "bg-yellow-400" },
];

export default function PackagePalette() {
  const handleDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/palette-item", JSON.stringify(item));
    
    // Create a beautiful small drag preview badge
    const dragImage = document.createElement("div");
    dragImage.innerText = item.label || item.defaultName;
    dragImage.style.position = "fixed";
    dragImage.style.left = "-9999px";
    dragImage.style.top = "-9999px";
    dragImage.style.padding = "6px 12px";
    dragImage.style.background = "#4f46e5"; // indigo-600
    dragImage.style.color = "#ffffff";
    dragImage.style.borderRadius = "8px";
    dragImage.style.fontSize = "12px";
    dragImage.style.fontWeight = "600";
    dragImage.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)";
    dragImage.style.border = "1px solid #818cf8"; // indigo-400
    dragImage.style.zIndex = "99999";
    dragImage.style.pointerEvents = "none";
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 30, 15);
    
    const handleDragEnd = () => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
      e.target.removeEventListener("dragend", handleDragEnd);
    };
    e.target.addEventListener("dragend", handleDragEnd);
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Contenedor scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Elementos */}
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Elementos</p>
        </div>
        <div className="p-3 space-y-2">
          {paletteItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: "element", ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Relaciones */}
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relaciones</p>
        </div>
        <div className="p-3 space-y-2">
          {relationshipItems.map((item) => (
            <div
              key={item.relType}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: "relationship", ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <Link2 className="w-4 h-4 text-white" />
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
          {otherItems.map((item) => (
            <div
              key={item.kind}
              draggable
              onDragStart={(e) => handleDragStart(e, { kind: item.kind, ...item })}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-yellow-50 hover:border-yellow-300 cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>


    </aside>
  );
}
