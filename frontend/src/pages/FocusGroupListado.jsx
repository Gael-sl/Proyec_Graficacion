import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function FocusGroupListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");

  const { data: focusGroups = [], isLoading } = useQuery({
    queryKey: ['focus-groups'],
    queryFn: () => entities.FocusGroup.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.FocusGroup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-groups'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("FocusGroupDetalle"));
  };

  const handleView = (focusGroup) => {
    navigate(createPageUrl(`FocusGroupDetalle?id=${focusGroup.id}`));
  };

  const handleDelete = async (focusGroup) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar focus group",
      description: `¿Está seguro de eliminar el focus group "${focusGroup.tema}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(focusGroup.id);
  };

  const filteredData = focusGroups.filter(item => {
    const matchesSearch = 
      item.tema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.participantes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "all" || item.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const columns = [
    { 
      key: "tema", 
      label: "Tema",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { key: "fecha", label: "Fecha", type: "date" },
    { 
      key: "participantes", 
      label: "Participantes",
      render: (value) => (
        <span className="text-slate-600 max-w-xs truncate block">
          {value || "-"}
        </span>
      )
    },
    { key: "estado", label: "Estado", type: "badge" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Focus Group"
        description="Gestiona las sesiones de focus group realizadas"
        icon={MessageSquare}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por tema o participantes..."
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
                <SelectItem value="planificado">Planificado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="analizado">Analizado</SelectItem>
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
            emptyMessage="No hay focus groups registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}