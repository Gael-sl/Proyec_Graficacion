import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function EntrevistasListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");

  const { data: entrevistas = [], isLoading } = useQuery({
    queryKey: ['entrevistas'],
    queryFn: () => entities.Entrevista.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Entrevista.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entrevistas'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("EntrevistasDetalle"));
  };

  const handleView = (entrevista) => {
    navigate(createPageUrl(`EntrevistasDetalle?id=${entrevista.id}`));
  };

  const handleDelete = async (entrevista) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar entrevista",
      description: `¿Está seguro de eliminar la entrevista con "${entrevista.entrevistado}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(entrevista.id);
  };

  const filteredData = entrevistas.filter(item => {
    const matchesSearch = 
      item.entrevistado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.objetivo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "all" || item.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  const columns = [
    { 
      key: "entrevistado", 
      label: "Entrevistado",
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
    { key: "fecha", label: "Fecha", type: "date" },
    { key: "estado", label: "Estado", type: "badge" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Entrevistas"
        description="Gestiona las entrevistas realizadas con stakeholders"
        icon={Users}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por entrevistado u objetivo..."
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
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="completo">Completo</SelectItem>
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
            emptyMessage="No hay entrevistas registradas. Crea una nueva para comenzar."
          />
        )}
      </div>
    </div>
  );
}