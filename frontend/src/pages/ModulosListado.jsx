import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Search } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function ModulosListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: modulos = [], isLoading } = useQuery({
    queryKey: ['modulos'],
    queryFn: () => entities.Modulo.list('-fechaCreacion')
  });

  const { data: funciones = [] } = useQuery({
    queryKey: ['funciones'],
    queryFn: () => entities.Funcion.list()
  });

  const { data: stakeholders = [] } = useQuery({
    queryKey: ['stakeholders'],
    queryFn: () => entities.Stakeholder.list()
  });

  const { data: analisisDocumentos = [] } = useQuery({
    queryKey: ['analisis-documentos'],
    queryFn: () => entities.AnalisisDocumento.list()
  });

  const { data: encuestas = [] } = useQuery({
    queryKey: ['encuestas'],
    queryFn: () => entities.Encuesta.list()
  });

  const { data: entrevistas = [] } = useQuery({
    queryKey: ['entrevistas'],
    queryFn: () => entities.Entrevista.list()
  });

  const { data: focusGroups = [] } = useQuery({
    queryKey: ['focus-groups'],
    queryFn: () => entities.FocusGroup.list()
  });

  const { data: historiasUsuario = [] } = useQuery({
    queryKey: ['historias-usuario'],
    queryFn: () => entities.HistoriaUsuario.list()
  });

  const { data: seguimientosTransaccionales = [] } = useQuery({
    queryKey: ['seguimientos-transaccionales'],
    queryFn: () => entities.SeguimientoTransaccional.list()
  });

  const { data: diagramas = [] } = useQuery({
    queryKey: ['diagramas'],
    queryFn: () => entities.Diagrama.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Modulo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modulos'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("ModuloDetalle"));
  };

  const handleView = (modulo) => {
    navigate(createPageUrl(`ModuloDetalle?id=${modulo.id}`));
  };

  const handleDelete = async (modulo) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar módulo",
      description: `¿Está seguro de eliminar el módulo "${modulo.nombre}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(modulo.id);
  };

  const moduleRows = modulos.map((modulo) => {
    const linkedFunctions = funciones.filter((funcion) => funcion.modulo === modulo.id);
    const linkedFunctionIds = new Set(linkedFunctions.map((funcion) => funcion.id));
    const linkedStakeholders = stakeholders.filter((stakeholder) =>
      linkedFunctions.some((funcion) => funcion.responsableId === stakeholder.id)
    );

    const artifactGroups = [
      {
        label: "Docs",
        items: analisisDocumentos.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      },
      {
        label: "Encuestas",
        items: encuestas.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      },
      {
        label: "Entrevistas",
        items: entrevistas.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      },
      {
        label: "Focus",
        items: focusGroups.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      },
      {
        label: "Historias",
        items: historiasUsuario.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      },
      {
        label: "Seguimientos",
        items: seguimientosTransaccionales.filter((item) => item.funcionIds?.some((id) => linkedFunctionIds.has(id)))
      }
    ];

    const linkedArtifacts = artifactGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })));
    const linkedDiagrams = diagramas.filter((diagram) => diagram.funcionId && linkedFunctionIds.has(diagram.funcionId));

    return {
      ...modulo,
      linkedFunctions,
      linkedStakeholders,
      linkedArtifacts,
      artifactGroups,
      linkedDiagrams,
      functionsCount: linkedFunctions.length,
      stakeholdersCount: linkedStakeholders.length,
      artifactsCount: linkedArtifacts.length,
      diagramsCount: linkedDiagrams.length,
      searchIndex: [
        modulo.nombre,
        modulo.descripcion,
        ...linkedFunctions.map((funcion) => funcion.nombre),
        ...linkedStakeholders.map((stakeholder) => stakeholder.nombre),
        ...linkedArtifacts.map((item) => item.nombreDocumento || item.titulo || item.nombre),
        ...linkedDiagrams.map((diagram) => diagram.name)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    };
  });

  const filteredData = moduleRows.filter((item) => item.searchIndex.includes(searchTerm.toLowerCase()));

  const columns = [
    { 
      key: "nombre", 
      label: "Nombre",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "descripcion", 
      label: "Descripción",
      render: (value) => <span className="text-slate-600 line-clamp-2">{value || "-"}</span>
    },
    { 
      key: "functionsCount",
      label: "Funciones",
      render: (value, row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
            {value}
          </span>
          <p className="text-xs text-slate-500 line-clamp-2">
            {row.linkedFunctions.length ? row.linkedFunctions.map((funcion) => funcion.nombre).join(", ") : "Sin funciones"}
          </p>
        </div>
      )
    },
    {
      key: "stakeholdersCount",
      label: "Stakeholders",
      render: (value, row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {value}
          </span>
          <p className="text-xs text-slate-500 line-clamp-2">
            {row.linkedStakeholders.length ? row.linkedStakeholders.map((stakeholder) => stakeholder.nombre).join(", ") : "Sin stakeholders"}
          </p>
        </div>
      )
    },
    {
      key: "artifactsCount",
      label: "Artefactos",
      render: (value, row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
            {value}
          </span>
          <p className="text-xs text-slate-500 line-clamp-2">
            {row.artifactGroups.map((group) => `${group.label}: ${group.items.length}`).join(" · ") || "Sin artefactos"}
          </p>
        </div>
      )
    },
    {
      key: "diagramsCount",
      label: "Diagramas",
      render: (value, row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            {value}
          </span>
          <p className="text-xs text-slate-500 line-clamp-2">
            {row.linkedDiagrams.length ? row.linkedDiagrams.map((diagram) => diagram.name).join(", ") : "Sin diagramas"}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Módulos del Sistema"
        description="Gestiona los módulos y componentes del sistema"
        icon={Boxes}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre, descripción, funciones, stakeholders, artefactos o diagramas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Cargando...</p>
          </div>
        ) : (
          <CatalogTable
            data={filteredData}
            columns={columns}
            onView={handleView}
            onDelete={handleDelete}
            emptyMessage="No hay módulos registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}
