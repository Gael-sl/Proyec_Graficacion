import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function HistoriasUsuarioListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [prioridadFilter, setPrioridadFilter] = useState("all");

  const { data: historias = [], isLoading } = useQuery({
    queryKey: ['historias-usuario'],
    queryFn: () => entities.HistoriaUsuario.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.HistoriaUsuario.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historias-usuario'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("HistoriaUsuarioDetalle"));
  };

  const handleView = (historia) => {
    navigate(createPageUrl(`HistoriaUsuarioDetalle?id=${historia.id}`));
  };

  const handleDelete = async (historia) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar historia",
      description: `¿Está seguro de eliminar la historia "${historia.idHistoria}: ${historia.titulo}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(historia.id);
  };

  const filteredData = historias.filter(item => {
    const matchesSearch = 
      item.idHistoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "all" || item.estado === estadoFilter;
    const matchesPrioridad = prioridadFilter === "all" || item.prioridad === prioridadFilter;
    return matchesSearch && matchesEstado && matchesPrioridad;
  });

  const prioridadColors = {
    alta: "bg-red-100 text-red-700 border-red-200",
    media: "bg-yellow-100 text-yellow-700 border-yellow-200",
    baja: "bg-green-100 text-green-700 border-green-200"
  };

  const columns = [
    { 
      key: "idHistoria", 
      label: "ID",
      render: (value) => <span className="font-mono font-semibold text-indigo-600">{value}</span>
    },
    { 
      key: "titulo", 
      label: "Título",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "prioridad", 
      label: "Prioridad",
      render: (value) => (
        <Badge variant="secondary" className={prioridadColors[value] || "bg-slate-100 text-slate-700 border-slate-200"}>
          {value || "media"}
        </Badge>
      )
    },
    { key: "estado", label: "Estado", type: "badge" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Historias de Usuario"
        description="Gestiona las historias de usuario del producto"
        icon={BookOpen}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por ID o título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en desarrollo">En desarrollo</SelectItem>
                <SelectItem value="terminada">Terminada</SelectItem>
                <SelectItem value="validada">Validada</SelectItem>
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
            emptyMessage="No hay historias de usuario registradas. Crea una nueva para comenzar."
          />
        )}
      </div>
    </div>
  );
}