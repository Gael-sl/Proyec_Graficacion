import React from "react";
import { User, Circle, Zap } from "lucide-react";

const PALETTE_ITEMS = [
  {
    id: "actor",
    kind: "actor",
    icon: User,
    label: "Actor",
    defaultName: "Actor",
    description: "Representa un usuario o sistema externo"
  },
  {
    id: "usecase",
    kind: "usecase",
    icon: Circle,
    label: "Caso de Uso",
    defaultName: "Caso de Uso",
    description: "Representa una funcionalidad del sistema"
  },
  {
    id: "association",
    kind: "association",
    icon: Zap,
    label: "Asociación",
    defaultName: "Asociación",
    assocType: "association",
    description: "Conecta actores con casos de uso"
  }
];

export default function UseCasePalette() {
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
    <div className="w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto flex flex-col gap-3">
      <div className="mb-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Elementos</h3>
        <p className="text-xs text-slate-500 mt-1">Arrastra elementos al canvas</p>
      </div>

      {PALETTE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
