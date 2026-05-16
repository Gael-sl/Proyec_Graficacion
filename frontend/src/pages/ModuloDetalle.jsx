import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, ExternalLink, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entities } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { confirmToast } from "@/lib/confirm-toast";
import PageHeader from "@/components/shared/PageHeader";
import FormCard from "@/components/shared/FormCard";

export default function ModuloDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const moduloId = urlParams.get("id");
  const isEditing = !!moduloId;

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    funcionalidades: ""
  });
  const [saving, setSaving] = useState(false);

  const { data: modulo } = useQuery({
    queryKey: ["modulo", moduloId],
    queryFn: async () => {
      const list = await entities.Modulo.list();
      return list.find((item) => item.id === moduloId);
    },
    enabled: isEditing
  });

  const { data: funciones = [] } = useQuery({
    queryKey: ["funciones"],
    queryFn: () => entities.Funcion.list()
  });

  const { data: stakeholders = [] } = useQuery({
    queryKey: ["stakeholders"],
    queryFn: () => entities.Stakeholder.list()
  });

  const { data: analisisDocumentos = [] } = useQuery({
    queryKey: ["analisis-documentos"],
    queryFn: () => entities.AnalisisDocumento.list()
  });

  const { data: encuestas = [] } = useQuery({
    queryKey: ["encuestas"],
    queryFn: () => entities.Encuesta.list()
  });

  const { data: entrevistas = [] } = useQuery({
    queryKey: ["entrevistas"],
    queryFn: () => entities.Entrevista.list()
  });

  const { data: focusGroups = [] } = useQuery({
    queryKey: ["focus-groups"],
    queryFn: () => entities.FocusGroup.list()
  });

  const { data: historiasUsuario = [] } = useQuery({
    queryKey: ["historias-usuario"],
    queryFn: () => entities.HistoriaUsuario.list()
  });

  const { data: seguimientosTransaccionales = [] } = useQuery({
    queryKey: ["seguimientos-transaccionales"],
    queryFn: () => entities.SeguimientoTransaccional.list()
  });

  const { data: diagramasBackend = [] } = useQuery({
    queryKey: ["diagramas"],
    queryFn: () => entities.Diagrama.list()
  });

  const funcionesAsociadas = funciones.filter((funcion) => funcion.modulo === moduloId);
  const linkedFunctionIds = new Set(funcionesAsociadas.map((funcion) => funcion.id));
  const linkedStakeholderIds = new Set(
    funcionesAsociadas
      .map((funcion) => funcion.responsableId)
      .filter(Boolean)
  );
  const readLegacyDiagrams = (storageKey, type, editorPath) => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);
      return parsed
        .filter((diagram) => diagram.funcionId && linkedFunctionIds.has(diagram.funcionId))
        .map((diagram) => ({
          ...diagram,
          tipo: type,
          editorPath,
          source: "localStorage"
        }));
    } catch {
      return [];
    }
  };

  const linkedArtifacts = [
    {
      key: "AnalisisDocumento",
      label: "Análisis de documentos",
      items: analisisDocumentos.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.nombreDocumento,
      getDescription: (item) => item.proposito || item.fuente || "Sin propósito",
      getTag: (item) => item.tipoDocumento || "documento",
      detailRoute: (id) => createPageUrl(`AnalisisDocumentosDetalle?id=${id}`)
    },
    {
      key: "Encuesta",
      label: "Encuestas",
      items: encuestas.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.titulo,
      getDescription: (item) => item.descripcion || "Sin descripción",
      getTag: () => "encuesta",
      detailRoute: (id) => createPageUrl(`EncuestaDetalle?id=${id}`)
    },
    {
      key: "Entrevista",
      label: "Entrevistas",
      items: entrevistas.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.titulo,
      getDescription: (item) => item.resumen || item.descripcion || "Sin resumen",
      getTag: (item) => item.tipoEntrevista || "entrevista",
      detailRoute: (id) => createPageUrl(`EntrevistasDetalle?id=${id}`)
    },
    {
      key: "FocusGroup",
      label: "Focus Group",
      items: focusGroups.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.titulo,
      getDescription: (item) => item.resultados || item.descripcion || "Sin resultados",
      getTag: () => "focus group",
      detailRoute: (id) => createPageUrl(`FocusGroupDetalle?id=${id}`)
    },
    {
      key: "HistoriaUsuario",
      label: "Historias de usuario",
      items: historiasUsuario.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.titulo,
      getDescription: (item) => item.descripcion || "Sin descripción",
      getTag: (item) => item.prioridad || "historia",
      detailRoute: (id) => createPageUrl(`HistoriaUsuarioDetalle?id=${id}`)
    },
    {
      key: "SeguimientoTransaccional",
      label: "Seguimientos transaccionales",
      items: seguimientosTransaccionales.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id))),
      getTitle: (item) => item.titulo,
      getDescription: (item) => item.descripcion || "Sin descripción",
      getTag: () => "seguimiento",
      detailRoute: (id) => createPageUrl(`SeguimientoTransaccionalDetalle?id=${id}`)
    }
  ];

  const linkedBackendDiagrams = diagramasBackend.filter((diagram) => diagram.funcionId && linkedFunctionIds.has(diagram.funcionId));
  const legacyDiagrams = [
    ...readLegacyDiagrams("sequence_diagrams", "sequence", "/diagrama-secuencia-editor"),
    ...readLegacyDiagrams("usecase_diagrams", "usecase", "/diagrama-casos-uso-editor"),
    ...readLegacyDiagrams("class_diagrams", "class", "/diagrama-clases-editor"),
    ...readLegacyDiagrams("package_diagrams", "package", "/diagrama-paquetes-editor")
  ];

  const diagramsById = new Map();
  [...linkedBackendDiagrams, ...legacyDiagrams].forEach((diagram) => {
    if (!diagramsById.has(diagram.id)) {
      diagramsById.set(diagram.id, diagram);
    }
  });
  const linkedDiagrams = Array.from(diagramsById.values());
  const linkedStakeholders = stakeholders.filter((stakeholder) => linkedStakeholderIds.has(stakeholder.id));

  useEffect(() => {
    if (modulo) {
      setFormData({
        nombre: modulo.nombre || "",
        descripcion: modulo.descripcion || "",
        funcionalidades: modulo.funcionalidades || ""
      });
    }
  }, [modulo]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return entities.Modulo.update(moduloId, data);
      }
      return entities.Modulo.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modulos"] });
      navigate(createPageUrl("ModulosListado"));
    },
    onError: () => {
      setSaving(false);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    saveMutation.mutate(formData, {
      onSettled: () => setSaving(false)
    });
  };

  const handleDesvinculateFuncion = async (funcionId) => {
    const shouldUnlink = await confirmToast({
      title: "Desvincular función",
      description: "¿Desea desvincular esta función del módulo?"
    });
    if (!shouldUnlink) {
      return;
    }

    const funcion = funciones.find((item) => item.id === funcionId);
    if (!funcion) {
      return;
    }

    await entities.Funcion.update(funcionId, { ...funcion, modulo: "" });
    queryClient.invalidateQueries({ queryKey: ["funciones"] });
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar Módulo" : "Nuevo Módulo"}
        description="Información del módulo del sistema"
        icon={Boxes}
        onSave={handleSave}
        saving={saving}
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl space-y-6">
          <FormCard title="Información básica" description="Datos principales del módulo">
            <div className="grid grid-cols-1 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="nombre">Nombre del módulo *</Label>
                <Input
                  placeholder="Ej: Módulo de Inventario"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  placeholder="Describa detalladamente el propósito y funcionalidad del módulo..."
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          </FormCard>

          <FormCard title="Funciones vinculadas" description="Relaciones con otras funciones">
            {isEditing ? (
              <div className="space-y-4">
                {funcionesAsociadas.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-500 text-sm">
                      No hay funciones vinculadas a este módulo. Asocia funciones desde Funciones {'>'} Editar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {funcionesAsociadas.map((funcion) => (
                      <div
                        key={funcion.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{funcion.nombre}</p>
                          <p className="text-sm text-slate-600 truncate">{funcion.descripcion || "Sin descripción"}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              {funcion.tipo || "funcional"}
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                              {funcion.prioridad || "media"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <button
                            onClick={() => window.open(createPageUrl(`FuncionDetalle?id=${funcion.id}`), "_blank")}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Abrir en nueva pestaña"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDesvinculateFuncion(funcion.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desvincular función"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-4">
                  Total de funciones: <span className="font-medium">{funcionesAsociadas.length}</span>
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <p className="text-slate-500 text-sm">
                  Guarda el módulo primero para ver las funciones asociadas.
                </p>
              </div>
            )}
          </FormCard>

          <FormCard title="Stakeholders vinculados" description="Stakeholders responsables de las funciones asociadas al módulo">
            {linkedStakeholders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                No hay stakeholders vinculados a las funciones de este módulo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {linkedStakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-amber-300 transition-all">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-medium text-slate-800 truncate">{stakeholder.nombre}</p>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-600">
                        {stakeholder.rol || "stakeholder"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{stakeholder.departamento || stakeholder.contacto || "Sin información adicional"}</p>
                  </div>
                ))}
              </div>
            )}
          </FormCard>

          <FormCard title="Artefactos vinculados" description="Se obtienen desde el backend y se relacionan con las funciones del módulo">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{linkedArtifacts.reduce((total, group) => total + group.items.length, 0)} elementos</span>
              </div>

              <div className="space-y-4">
                {linkedArtifacts.map((group) => (
                  <div key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-700">{group.label}</h5>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{group.items.length}</span>
                    </div>

                    {group.items.length === 0 ? (
                      <p className="text-sm text-slate-500">No hay registros vinculados para este módulo.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => window.open(group.detailRoute(item.id), "_blank")}
                            className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <p className="font-medium text-slate-800 truncate">{group.getTitle(item)}</p>
                              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                                {group.getTag(item)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{group.getDescription(item)}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FormCard>

          <FormCard title="Diagramas vinculados" description="Se leen desde backend y, para registros antiguos, desde el almacenamiento local">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{linkedDiagrams.length} elementos</span>
              </div>

              {linkedDiagrams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
                  Todavía no hay diagramas asociados a las funciones de este módulo.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {linkedDiagrams.map((diagram) => {
                    const editorPath = diagram.editorPath || (
                      diagram.tipo === "sequence"
                        ? `/diagrama-secuencia-editor/${diagram.id}`
                        : diagram.tipo === "usecase"
                          ? `/diagrama-casos-uso-editor/${diagram.id}`
                          : diagram.tipo === "class"
                            ? `/diagrama-clases-editor/${diagram.id}`
                            : `/diagrama-paquetes-editor/${diagram.id}`
                    );

                    return (
                      <button
                        key={diagram.id}
                        type="button"
                        onClick={() => window.open(editorPath, "_blank")}
                        className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <p className="font-medium text-slate-800 truncate">{diagram.name}</p>
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                            {diagram.tipo || "diagrama"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{diagram.description || "Sin descripción"}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}
