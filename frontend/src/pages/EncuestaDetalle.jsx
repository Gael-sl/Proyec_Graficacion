import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
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

export default function EncuestaDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const encuestaId = urlParams.get('id');
  const isEditing = !!encuestaId;

  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    titulo: "",
    objetivo: "",
    plataforma: "",
    fechaLanzamiento: "",
    fechaCierre: "",
    numeroRespuestas: "",
    urlEncuesta: "",
    estado: "creada",
    stakeholderIds: [],
    funcionIds: []
  });
  const [resultadosFiles, setResultadosFiles] = useState([]);
  const [conclusiones, setConclusiones] = useState({
    analisisResultados: "",
    hallazgos: "",
    recomendaciones: ""
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

  const { data: encuesta } = useQuery({
    queryKey: ['encuesta', encuestaId],
    queryFn: async () => {
      const list = await entities.Encuesta.list();
      return list.find(e => e.id === encuestaId);
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (encuesta) {
      setFormData({
        titulo: encuesta.titulo || "",
        objetivo: encuesta.objetivo || "",
        plataforma: encuesta.plataforma || "",
        fechaLanzamiento: encuesta.fechaLanzamiento || "",
        fechaCierre: encuesta.fechaCierre || "",
        numeroRespuestas: encuesta.numeroRespuestas || "",
        urlEncuesta: encuesta.urlEncuesta || "",
        estado: encuesta.estado || "creada",
        stakeholderIds: encuesta.stakeholderIds || [],
        funcionIds: encuesta.funcionIds || []
      });
      setConclusiones({
        analisisResultados: encuesta.analisisResultados || "",
        hallazgos: encuesta.hallazgos || "",
        recomendaciones: encuesta.recomendaciones || ""
      });
      setResultadosFiles(encuesta.resultadosFiles || []);
    }
  }, [encuesta]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await entities.Encuesta.update(encuestaId, data);
      } else {
        return await entities.Encuesta.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encuestas'] });
      navigate(createPageUrl("EncuestasListado"));
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
      numeroRespuestas: formData.numeroRespuestas ? Number(formData.numeroRespuestas) : 0,
      ...conclusiones,
      resultadosFiles: resultadosFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };
    saveMutation.mutate(dataToSave);
    setSaving(false);
  };

  const informacionContent = (
    <div className="space-y-6">
      <FormCard title="Datos de la encuesta" description="Información general sobre la encuesta">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="titulo">Título de la encuesta *</Label>
            <Input 
              placeholder="Ej: Encuesta de satisfacción del usuario"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Textarea 
              placeholder="Describa el objetivo de esta encuesta..."
              value={formData.objetivo}
              onChange={(e) => handleInputChange("objetivo", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plataforma">Plataforma</Label>
            <Input 
              placeholder="Ej: Google Forms, SurveyMonkey..."
              value={formData.plataforma}
              onChange={(e) => handleInputChange("plataforma", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urlEncuesta">URL de la encuesta</Label>
            <Input 
              type="url"
              placeholder="https://..."
              value={formData.urlEncuesta}
              onChange={(e) => handleInputChange("urlEncuesta", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaLanzamiento">Fecha de lanzamiento</Label>
            <Input 
              type="date" 
              value={formData.fechaLanzamiento}
              onChange={(e) => handleInputChange("fechaLanzamiento", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaCierre">Fecha de cierre</Label>
            <Input 
              type="date" 
              value={formData.fechaCierre}
              onChange={(e) => handleInputChange("fechaCierre", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroRespuestas">Número de respuestas</Label>
            <Input 
              type="number"
              min="0"
              placeholder="0"
              value={formData.numeroRespuestas}
              onChange={(e) => handleInputChange("numeroRespuestas", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(v) => handleInputChange("estado", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creada">Creada</SelectItem>
                <SelectItem value="abierta">Abierta</SelectItem>
                <SelectItem value="cerrada">Cerrada</SelectItem>
                <SelectItem value="analizada">Analizada</SelectItem>
              </SelectContent>
            </Select>
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
      <FormCard title="Archivos de resultados" description="PDF, XLSX, CSV con los resultados de la encuesta">
        <FileUploader
          accept=".pdf,.xlsx,.xls,.csv"
          files={resultadosFiles}
          onFilesChange={setResultadosFiles}
          title="Cargar resultados"
          description="Arrastra archivos de resultados aquí"
        />
      </FormCard>
    </div>
  );

  const conclusionesContent = (
    <div className="space-y-6">
      <FormCard title="Análisis de resultados" description="Análisis detallado de las respuestas obtenidas">
        <Textarea
          placeholder="Describa el análisis de los resultados de la encuesta..."
          value={conclusiones.analisisResultados}
          onChange={(e) => handleConclusionChange("analisisResultados", e.target.value)}
          className="min-h-[150px]"
        />
      </FormCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard title="Hallazgos principales" description="Descubrimientos clave">
          <Textarea
            placeholder="• Hallazgo 1&#10;• Hallazgo 2&#10;• Hallazgo 3"
            value={conclusiones.hallazgos}
            onChange={(e) => handleConclusionChange("hallazgos", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Recomendaciones" description="Acciones sugeridas basadas en los resultados">
          <Textarea
            placeholder="• Recomendación 1&#10;• Recomendación 2"
            value={conclusiones.recomendaciones}
            onChange={(e) => handleConclusionChange("recomendaciones", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar encuesta" : "Nueva encuesta"}
        description="Documenta encuestas realizadas a usuarios y stakeholders"
        icon={ClipboardCheck}
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