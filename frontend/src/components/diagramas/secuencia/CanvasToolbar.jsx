import React from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CanvasToolbar({ pendingMessage, onCancelPending, actorCount, messageCount, zoom, setZoom }) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          {actorCount} participante{actorCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          {messageCount} mensaje{messageCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold text-xs"
            title="Zoom -"
          >
            -
          </button>
          <span className="text-xs font-semibold px-2 text-slate-700 min-w-[40px] text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded font-bold text-xs"
            title="Zoom +"
          >
            +
          </button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <button
            onClick={() => setZoom(1.0)}
            className="text-[10px] text-indigo-600 hover:underline px-1 font-semibold"
            title="Restablecer"
          >
            1:1
          </button>
        </div>

        {pendingMessage && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-700">
                {!pendingMessage.from
                  ? "Haz clic en una línea de vida para seleccionar el origen"
                  : "Ahora haz clic en la línea de vida destino"}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onCancelPending} className="gap-1">
              <X className="w-3 h-3" /> Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}