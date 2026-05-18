import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { entities } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function DiagramCreateEditModal({ type, diagram, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    funcionId: "",
  });
  const { toast } = useToast();

  const { data: funciones = [] } = useQuery({
    queryKey: ["funciones"],
    queryFn: () => entities.Funcion.list()
  });

  useEffect(() => {
    if (diagram) {
      setForm({
        name: diagram.name || "",
        description: diagram.description || "",
        funcionId: diagram.funcionId || "",
      });
    } else {
      setForm({ name: "", description: "", funcionId: "" });
    }
  }, [diagram]);

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({
        title: "Nombre requerido",
        description: "El nombre del diagrama es obligatorio.",
        variant: "destructive"
      });
      return;
    }
    onSave(form);
  };

  const typeLabel =
    type === "sequence"
      ? "Diagrama de Secuencia"
      : type === "package"
      ? "Diagrama de Paquetes"
      : type === "class"
      ? "Diagrama de Clases"
      : "Diagrama de Casos de Uso";
  const title = diagram ? `Editar ${typeLabel}` : `Crear ${typeLabel}`;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="apple-glass-panel w-full max-w-lg overflow-hidden border border-white/70 shadow-[0_24px_64px_rgba(15,23,42,0.28)] animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 bg-white/75 backdrop-blur-2xl">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">Especifica el modelo conceptual de tu diagrama UML</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all rounded-xl p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-white/25 backdrop-blur-2xl">
          <div className="space-y-2">
            <Label className="text-slate-800 font-semibold">Nombre del diagrama *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder={`Ej: Mi ${typeLabel.toLowerCase()}`}
              autoFocus
              className="bg-white/65 border-white/70 focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-800 font-semibold">Descripción (opcional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe el propósito de este diagrama..."
              className="min-h-[90px] bg-white/65 border-white/70 focus-visible:ring-sky-400"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-800 font-semibold">Función vinculada</Label>
            <Select value={form.funcionId} onValueChange={(value) => setForm((p) => ({ ...p, funcionId: value }))}>
              <SelectTrigger className="bg-white/65 border-white/70">
                <SelectValue placeholder="Selecciona una función" />
              </SelectTrigger>
              <SelectContent>
                {funciones.length === 0 ? (
                  <div className="p-2 text-sm text-slate-500">No hay funciones registradas</div>
                ) : (
                  funciones.map((funcion) => (
                    <SelectItem key={funcion.id} value={funcion.id}>
                      {funcion.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 bg-white/35 border-t border-white/60 backdrop-blur-xl">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-white/55 border-white/70 hover:bg-white/75 text-slate-700">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
          >
            <Save className="w-4 h-4 mr-2" />
            {diagram ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </div>
    </div>
  );
}
