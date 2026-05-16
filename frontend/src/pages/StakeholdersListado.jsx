import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, Search } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function StakeholdersListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stakeholders = [], isLoading } = useQuery({
    queryKey: ['stakeholders'],
    queryFn: () => entities.Stakeholder.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Stakeholder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("StakeholderDetalle"));
  };

  const handleView = (stakeholder) => {
    navigate(createPageUrl(`StakeholderDetalle?id=${stakeholder.id}`));
  };

  const handleDelete = async (stakeholder) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar stakeholder",
      description: `¿Está seguro de eliminar al stakeholder "${stakeholder.nombre}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(stakeholder.id);
  };

  const filteredData = stakeholders.filter(item => {
    const matchesSearch = 
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.rol?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    { 
      key: "nombre", 
      label: "Nombre",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "rol", 
      label: "Rol",
      render: (value) => <span className="text-slate-600">{value || "-"}</span>
    },
    { 
      key: "departamento", 
      label: "Departamento",
      render: (value) => <span className="text-slate-600">{value || "-"}</span>
    },
    { key: "prioridad", label: "Prioridad", type: "badge" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Stakeholders"
        description="Gestiona los stakeholders y roles de usuario del proyecto"
        icon={UserCog}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre o rol..."
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
            emptyMessage="No hay stakeholders registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}