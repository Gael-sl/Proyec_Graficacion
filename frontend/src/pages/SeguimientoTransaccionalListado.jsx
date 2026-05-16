import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Plus, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function SeguimientoTransaccionalListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: seguimientos = [], isLoading } = useQuery({
    queryKey: ['seguimientos-transaccionales'],
    queryFn: () => entities.SeguimientoTransaccional.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.SeguimientoTransaccional.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seguimientos-transaccionales'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("SeguimientoTransaccionalDetalle"));
  };

  const handleView = (seguimiento) => {
    navigate(createPageUrl(`SeguimientoTransaccionalDetalle?id=${seguimiento.id}`));
  };

  const handleDelete = async (seguimiento) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar seguimiento",
      description: `¿Está seguro de eliminar el seguimiento de "${seguimiento.sistema}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(seguimiento.id);
  };

  const filteredData = seguimientos.filter(item => {
    return (
      item.sistema?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipoTransaccion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    { 
      key: "sistema", 
      label: "Sistema / Proceso",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "tipoTransaccion", 
      label: "Tipo de evento",
      render: (value) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {value || "otro"}
        </Badge>
      )
    },
    { 
      key: "periodoInicio", 
      label: "Periodo de captura",
      render: (value, row) => {
        if (!value) return "-";
        const inicio = format(new Date(value), "dd MMM yyyy", { locale: es });
        const fin = row.periodoFin ? format(new Date(row.periodoFin), "dd MMM yyyy", { locale: es }) : "presente";
        return (
          <span className="text-slate-600 text-sm">
            {inicio} - {fin}
          </span>
        );
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Seguimiento transaccional"
        description="Gestiona los análisis de logs y datos transaccionales"
        icon={Activity}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por sistema o tipo de evento..."
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
            emptyMessage="No hay seguimientos transaccionales registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}