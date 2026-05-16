import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cog, Search } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function FuncionesListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: funciones = [], isLoading } = useQuery({
    queryKey: ['funciones'],
    queryFn: () => entities.Funcion.list('-created_date')
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ['modulos'],
    queryFn: () => entities.Modulo.list()
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

  const { data: diagramasBackend = [] } = useQuery({
    queryKey: ['diagramas'],
    queryFn: () => entities.Diagrama.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Funcion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funciones'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("FuncionDetalle"));
  };

  const handleView = (funcion) => {
    navigate(createPageUrl(`FuncionDetalle?id=${funcion.id}`));
  };

  const handleDelete = async (funcion) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar funcion",
      description: `¿Está seguro de eliminar la función "${funcion.nombre}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(funcion.id);
  };

  const filteredData = funciones.filter(item => {
    const matchesSearch = 
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const modulosById = useMemo(
    () => new Map(modulos.map((modulo) => [modulo.id, modulo.nombre])),
    [modulos]
  );

  const stakeholdersById = useMemo(
    () => new Map(stakeholders.map((stakeholder) => [stakeholder.id, stakeholder.nombre])),
    [stakeholders]
  );

  const artifactsCountByFuncion = useMemo(() => {
    const counts = new Map();
    const artifactLists = [
      analisisDocumentos,
      encuestas,
      entrevistas,
      focusGroups,
      historiasUsuario,
      seguimientosTransaccionales
    ];

    artifactLists.forEach((list) => {
      list.forEach((item) => {
        (item.funcionIds || []).forEach((funcionId) => {
          counts.set(funcionId, (counts.get(funcionId) || 0) + 1);
        });
      });
    });

    return counts;
  }, [
    analisisDocumentos,
    encuestas,
    entrevistas,
    focusGroups,
    historiasUsuario,
    seguimientosTransaccionales
  ]);

  const diagramsCountByFuncion = useMemo(() => {
    const byFuncion = new Map();

    const appendDiagram = (funcionId, diagramId) => {
      if (!funcionId || !diagramId) {
        return;
      }
      if (!byFuncion.has(funcionId)) {
        byFuncion.set(funcionId, new Set());
      }
      byFuncion.get(funcionId).add(diagramId);
    };

    diagramasBackend.forEach((diagram) => {
      appendDiagram(diagram.funcionId, diagram.id);
    });

    if (typeof window !== 'undefined') {
      [
        'sequence_diagrams',
        'usecase_diagrams',
        'class_diagrams',
        'package_diagrams'
      ].forEach((storageKey) => {
        try {
          const saved = localStorage.getItem(storageKey);
          if (!saved) {
            return;
          }
          const parsed = JSON.parse(saved);
          parsed.forEach((diagram) => {
            appendDiagram(diagram.funcionId, diagram.id);
          });
        } catch {
          // Ignore invalid localStorage payloads.
        }
      });
    }

    const countByFuncion = new Map();
    byFuncion.forEach((diagramSet, funcionId) => {
      countByFuncion.set(funcionId, diagramSet.size);
    });

    return countByFuncion;
  }, [diagramasBackend]);

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
    { key: "tipo", label: "Tipo", type: "badge" },
    { 
      key: "modulo", 
      label: "Módulo",
      render: (value) => <span className="text-slate-600">{modulosById.get(value) || "-"}</span>
    },
    {
      key: "responsableId",
      label: "Stakeholder",
      render: (value) => <span className="text-slate-600">{stakeholdersById.get(value) || "-"}</span>
    },
    {
      key: "artefactos",
      label: "Artefactos",
      render: (_value, row) => <span className="text-slate-600">{artifactsCountByFuncion.get(row.id) || 0}</span>
    },
    {
      key: "diagramas",
      label: "Diagramas",
      render: (_value, row) => <span className="text-slate-600">{diagramsCountByFuncion.get(row.id) || 0}</span>
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Funciones del Sistema"
        description="Gestiona las funciones y comportamientos del sistema"
        icon={Cog}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre o descripción..."
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
            emptyMessage="No hay funciones registradas. Crea una nueva para comenzar."
          />
        )}
      </div>
    </div>
  );
}