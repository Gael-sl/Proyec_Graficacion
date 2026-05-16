import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function EncuestasListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");

  const { data: encuestas = [], isLoading } = useQuery({
    queryKey: ['encuestas'],
    queryFn: () => entities.Encuesta.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Encuesta.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("EncuestaDetalle"));
  };

  const handleView = (encuesta) => {
    navigate(createPageUrl(`EncuestaDetalle?id=${encuesta.id}`));
  };

  const handleDelete = async (encuesta) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar encuesta",
      description: `¿Está seguro de eliminar la encuesta "${encuesta.titulo}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(encuesta.id);
  };

  const filteredData = encuestas.filter(item => {
    const matchesSearch = 
      item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objetivo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "all" || item.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const columns = [
    { 
      key: "titulo", 
      label: "Título",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "objetivo", 
      label: "Objetivo",
      render: (value) => (
        <span className="text-slate-600 max-w-xs truncate block">
          {value || "-"}
        </span>
      )
    },
    { key: "fechaLanzamiento", label: "Fecha de Lanzamiento", type: "date" },
    { key: "estado", label: "Estado", type: "badge" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Encuestas"
        description="Gestiona las encuestas realizadas a usuarios y stakeholders"
        icon={ClipboardCheck}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por título u objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="creada">Creada</SelectItem>
                <SelectItem value="abierta">Abierta</SelectItem>
                <SelectItem value="cerrada">Cerrada</SelectItem>
                <SelectItem value="analizada">Analizada</SelectItem>
              </SelectContent>
            </Select>
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
            emptyMessage="No hay encuestas registradas. Crea una nueva para comenzar."
          />
        )}
      </div>
    </div>
  );
}