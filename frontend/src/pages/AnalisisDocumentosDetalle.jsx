import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileSearch } from "lucide-react";
import { entities } from "@/api/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import TemplateTabs from "@/components/shared/TemplateTabs";
import FormCard from "@/components/shared/FormCard";
import FileUploader from "@/components/shared/FileUploader";
import RelacionesSection from "@/components/shared/RelacionesSection";

export default function AnalisisDocumentosDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const documentoId = urlParams.get('id');
  const isEditing = !!documentoId;

  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    nombreDocumento: "",
    fuente: "",
    autor: "",
    fechaDocumento: "",
    version: "",
    proposito: "",
    stakeholderIds: [],
    funcionIds: []
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [conclusiones, setConclusiones] = useState({
    extractos: "",
    requisitos: "",
    restricciones: "",
    suposiciones: "",
    riesgos: ""
  });
  const [saving, setSaving] = useState(false);

  const { data: stakeholders = [] } = useQuery({
    queryKey: ['stakeholders'],
    queryFn: () => entities.Stakeholder.list()
  });

  const { data: funciones = [] } = useQuery({
    queryKey: ['funciones'],
    queryFn: () => entities.Funcion.list()
  });

  const { data: documento } = useQuery({
    queryKey: ['analisis-documento', documentoId],
    queryFn: async () => {
      const list = await entities.AnalisisDocumento.list();
      return list.find(d => d.id === documentoId);
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (documento) {
      setFormData({
        tipoDocumento: documento.tipoDocumento || "",
        nombreDocumento: documento.nombreDocumento || "",
        fuente: documento.fuente || "",
        autor: documento.autor || "",
        fechaDocumento: documento.fechaDocumento || "",
        version: documento.version || "",
        proposito: documento.proposito || "",
        stakeholderIds: documento.stakeholderIds || [],
        funcionIds: documento.funcionIds || []
      });
      setConclusiones({
        extractos: documento.extractos || "",
        requisitos: documento.requisitos || "",
        restricciones: documento.restricciones || "",
        suposiciones: documento.suposiciones || "",
        riesgos: documento.riesgos || ""
      });
    }
  }, [documento]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await entities.AnalisisDocumento.update(documentoId, data);
      } else {
        return await entities.AnalisisDocumento.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analisis-documentos'] });
      navigate(createPageUrl("AnalisisDocumentosListado"));
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConclusionChange = (field, value) => {
    setConclusiones(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = {
      ...formData,
      ...conclusiones
    };
    saveMutation.mutate(dataToSave);
    setSaving(false);
  };

  const informacionContent = (
    <div className="space-y-6">
      <FormCard title="Datos del documento" description="Información general del documento analizado">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombreDocumento">Nombre del documento *</Label>
            <Input 
              placeholder="Ej: Manual de procesos v2.0"
              value={formData.nombreDocumento}
              onChange={(e) => handleInputChange("nombreDocumento", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de documento</Label>
            <Select value={formData.tipoDocumento} onValueChange={(v) => handleInputChange("tipoDocumento", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual de usuario</SelectItem>
                <SelectItem value="proceso">Documento de proceso</SelectItem>
                <SelectItem value="politica">Política empresarial</SelectItem>
                <SelectItem value="reglamento">Reglamento</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="informe">Informe técnico</SelectItem>
                <SelectItem value="especificacion">Especificación técnica</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuente">Fuente u origen *</Label>
            <Input 
              placeholder="Ej: Departamento de Finanzas, Sistema Legacy..."
              value={formData.fuente}
              onChange={(e) => handleInputChange("fuente", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autor">Autor</Label>
            <Input 
              placeholder="Nombre del autor o departamento"
              value={formData.autor}
              onChange={(e) => handleInputChange("autor", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha del documento *</Label>
            <Input 
              type="date" 
              value={formData.fechaDocumento}
              onChange={(e) => handleInputChange("fechaDocumento", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Versión</Label>
            <Input 
              placeholder="Ej: 1.0, 2.3, Rev. A..."
              value={formData.version}
              onChange={(e) => handleInputChange("version", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="proposito">Propósito del análisis</Label>
            <Input 
              placeholder="¿Por qué se analiza este documento?"
              value={formData.proposito}
              onChange={(e) => handleInputChange("proposito", e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      <RelacionesSection
        stakeholders={stakeholders}
        funciones={funciones}
        selectedStakeholderIds={formData.stakeholderIds}
        selectedFuncionIds={formData.funcionIds}
        onStakeholderAdd={(id) => handleInputChange("stakeholderIds", [...formData.stakeholderIds, id])}
        onStakeholderRemove={(id) => handleInputChange("stakeholderIds", formData.stakeholderIds.filter(sid => sid !== id))}
        onFuncionAdd={(id) => handleInputChange("funcionIds", [...formData.funcionIds, id])}
        onFuncionRemove={(id) => handleInputChange("funcionIds", formData.funcionIds.filter(fid => fid !== id))}
      />
    </div>
  );

  const evidenciaContent = (
    <div className="space-y-6">
      <FormCard title="Carga de documentos" description="PDF, DOCX, XLSX">
        <FileUploader
          accept=".pdf,.docx,.xlsx,.doc,.xls"
          files={documentFiles}
          onFilesChange={setDocumentFiles}
          title="Cargar documentos"
          description="Arrastra archivos de documentos aquí"
        />
      </FormCard>
    </div>
  );

  const conclusionesContent = (
    <div className="space-y-6">
      <FormCard title="Extractos relevantes" description="Citas o secciones importantes del documento">
        <Textarea
          placeholder="Copie aquí los extractos más relevantes del documento...&#10;&#10;Página X: '...'&#10;Sección Y: '...'"
          value={conclusiones.extractos}
          onChange={(e) => handleConclusionChange("extractos", e.target.value)}
          className="min-h-[150px] font-mono text-sm"
        />
      </FormCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard title="Requisitos identificados" description="Requerimientos detectados en el documento">
          <Textarea
            placeholder="• REQ-001: Descripción&#10;• REQ-002: Descripción"
            value={conclusiones.requisitos}
            onChange={(e) => handleConclusionChange("requisitos", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Restricciones detectadas" description="Limitaciones o condiciones">
          <Textarea
            placeholder="• Restricción técnica&#10;• Restricción de negocio&#10;• Restricción legal"
            value={conclusiones.restricciones}
            onChange={(e) => handleConclusionChange("restricciones", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Suposiciones" description="Supuestos identificados durante el análisis">
          <Textarea
            placeholder="• Se asume que...&#10;• Se da por hecho que..."
            value={conclusiones.suposiciones}
            onChange={(e) => handleConclusionChange("suposiciones", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Riesgos o implicaciones" description="Posibles problemas o consecuencias">
          <Textarea
            placeholder="• Riesgo 1: Descripción e impacto&#10;• Implicación 1: Consecuencias"
            value={conclusiones.riesgos}
            onChange={(e) => handleConclusionChange("riesgos", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar análisis de documento" : "Nuevo análisis de documento"}
        description="Documenta el análisis de documentos del dominio"
        icon={FileSearch}
        onSave={handleSave}
        saving={saving}
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <TemplateTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          informacionContent={informacionContent}
          evidenciaContent={evidenciaContent}
          conclusionesContent={conclusionesContent}
        />
      </div>
    </div>
  );
}