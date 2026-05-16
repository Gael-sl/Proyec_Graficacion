import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSearch, Plus, Search, Filter } from "lucide-react";
import { entities } from "@/api/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import CatalogTable from "@/components/shared/CatalogTable";
import { confirmToast } from "@/lib/confirm-toast";

export default function AnalisisDocumentosListado() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['analisis-documentos'],
    queryFn: () => entities.AnalisisDocumento.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => entities.AnalisisDocumento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analisis-documentos'] });
    }
  });

  const handleNew = () => {
    navigate(createPageUrl("AnalisisDocumentosDetalle"));
  };

  const handleView = (documento) => {
    navigate(createPageUrl(`AnalisisDocumentosDetalle?id=${documento.id}`));
  };

  const handleDelete = async (documento) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar analisis",
      description: `¿Está seguro de eliminar el análisis de "${documento.nombreDocumento}"?`
    });
    if (!shouldDelete) {
      return;
    }
    deleteMutation.mutate(documento.id);
  };

  const filteredData = documentos.filter(item => {
    return (
      item.nombreDocumento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fuente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tipoDocumento?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    { 
      key: "nombreDocumento", 
      label: "Nombre del documento",
      render: (value) => <span className="font-medium text-slate-800">{value}</span>
    },
    { 
      key: "tipoDocumento", 
      label: "Tipo",
      render: (value) => (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          {value || "otro"}
        </Badge>
      )
    },
    { 
      key: "fuente", 
      label: "Fuente",
      render: (value) => <span className="text-slate-600">{value || "-"}</span>
    },
    { 
      key: "version", 
      label: "Versión",
      render: (value) => (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
          {value || "N/A"}
        </Badge>
      )
    },
    { key: "fechaDocumento", label: "Fecha", type: "date" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Análisis de documentos"
        description="Gestiona los análisis de documentos del dominio"
        icon={FileSearch}
        onNew={handleNew}
      />
      
      <div className="p-8">
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nombre, tipo o fuente..."
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
            emptyMessage="No hay análisis de documentos registrados. Crea uno nuevo para comenzar."
          />
        )}
      </div>
    </div>
  );
}