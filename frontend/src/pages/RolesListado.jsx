import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cog, Search } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function RolesListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => entities.Role.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("RoleDetalle"));
  };

  const handleView = (role) => {
    navigate(createPageUrl(`RoleDetalle?id=${role.id}`));
  };

  const handleDelete = async (role) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar rol",
      description: `¿Está seguro de eliminar el rol "${role.nombre}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(role.id);
  };

  const filteredData = roles.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.nombre?.toLowerCase().includes(term) ||
      item.descripcion?.toLowerCase().includes(term) ||
      item.nivel?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      key: "nombre",
      label: "Nombre",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    {
      key: "descripcion",
      label: "Descripción",
      render: (value) => <span className="text-slate-600">{value || "-"}</span>
    },
    {
      key: "nivel",
      label: "Nivel",
      render: (value) => <span className="text-slate-600 capitalize">{value || "-"}</span>
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Roles"
        description="Gestiona el catálogo de roles que pueden asignarse a los stakeholders"
        icon={Cog}
        onNew={handleNew}
      />

      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre, descripción o nivel..."
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
            emptyMessage="No hay roles registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}
