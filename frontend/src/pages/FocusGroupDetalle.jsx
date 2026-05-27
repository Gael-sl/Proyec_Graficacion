import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
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

export default function FocusGroupDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const focusGroupId = urlParams.get('id');
  const isEditing = !!focusGroupId;

  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    tema: "",
    objetivo: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    participantes: "",
    moderador: "",
    estado: "planificado",
    stakeholderIds: [],
    funcionIds: []
  });
  const [audioVideoFiles, setAudioVideoFiles] = useState([]);
  const [transcripcion, setTranscripcion] = useState("");
  const [conclusiones, setConclusiones] = useState({
    resumenDiscusiones: "",
    hallazgos: "",
    puntosConflicto: ""
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

  const { data: focusGroup } = useQuery({
    queryKey: ['focus-group', focusGroupId],
    queryFn: async () => {
      const list = await entities.FocusGroup.list();
      return list.find(f => f.id === focusGroupId);
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (focusGroup) {
      setFormData({
        tema: focusGroup.tema || focusGroup.titulo || "",
        objetivo: focusGroup.objetivo || focusGroup.descripcion || "",
        fecha: focusGroup.fecha || "",
        horaInicio: focusGroup.horaInicio || "",
        horaFin: focusGroup.horaFin || "",
        participantes: focusGroup.participantes || "",
        moderador: focusGroup.moderador || "",
        estado: focusGroup.estado || "planificado",
        stakeholderIds: focusGroup.stakeholderIds || [],
        funcionIds: focusGroup.funcionIds || []
      });
      setTranscripcion(focusGroup.transcripcion || "");
      setConclusiones({
        resumenDiscusiones: focusGroup.resumenDiscusiones || "",
        hallazgos: focusGroup.hallazgos || "",
        puntosConflicto: focusGroup.puntosConflicto || ""
      });
      setAudioVideoFiles(focusGroup.audioVideoFiles || []);
    }
  }, [focusGroup]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await entities.FocusGroup.update(focusGroupId, data);
      } else {
        return await entities.FocusGroup.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-groups'] });
      navigate(createPageUrl("FocusGroupListado"));
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
      titulo: formData.tema || "Focus Group",
      descripcion: formData.objetivo || "",
      temas: formData.tema || "",
      resultados: conclusiones.hallazgos || conclusiones.resumenDiscusiones || "",
      notas: conclusiones.puntosConflicto || "",
      transcripcion,
      ...conclusiones,
      audioVideoFiles: audioVideoFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };
    saveMutation.mutate(dataToSave);
    setSaving(false);
  };

  const informacionContent = (
    <div className="space-y-6">
      <FormCard title="Datos del focus group" description="Información general de la sesión">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="tema">Tema de discusión *</Label>
            <Input 
              placeholder="Ej: Experiencia de usuario en el proceso de compra"
              value={formData.tema}
              onChange={(e) => handleInputChange("tema", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="objetivo">Objetivo del focus group</Label>
            <Textarea 
              placeholder="Describa el objetivo de esta sesión..."
              value={formData.objetivo}
              onChange={(e) => handleInputChange("objetivo", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de realización</Label>
            <Input 
              type="date" 
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moderador">Moderador</Label>
            <Input 
              placeholder="Nombre del moderador"
              value={formData.moderador}
              onChange={(e) => handleInputChange("moderador", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaInicio">Hora de inicio</Label>
            <Input 
              type="time" 
              value={formData.horaInicio}
              onChange={(e) => handleInputChange("horaInicio", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaFin">Hora de fin</Label>
            <Input 
              type="time" 
              value={formData.horaFin}
              onChange={(e) => handleInputChange("horaFin", e.target.value)}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="participantes">Participantes</Label>
            <Textarea 
              placeholder="Lista de participantes, roles, áreas..."
              value={formData.participantes}
              onChange={(e) => handleInputChange("participantes", e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(v) => handleInputChange("estado", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planificado">Planificado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="analizado">Analizado</SelectItem>
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
      <FormCard title="Grabaciones" description="Archivos de audio y video de la sesión">
        <FileUploader
          accept=".mp3,.mp4,.wav,.avi,.mov"
          files={audioVideoFiles}
          onFilesChange={setAudioVideoFiles}
          title="Cargar audio/video"
          description="Arrastra archivos de audio o video aquí"
        />
      </FormCard>

      <FormCard title="Transcripción" description="Texto transcrito de la sesión">
        <Textarea
          placeholder="Escriba o pegue aquí la transcripción del focus group..."
          value={transcripcion}
          onChange={(e) => setTranscripcion(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
      </FormCard>
    </div>
  );

  const conclusionesContent = (
    <div className="space-y-6">
      <FormCard title="Resumen de las discusiones" description="Síntesis de los temas tratados">
        <Textarea
          placeholder="Resumen ejecutivo de las discusiones del focus group..."
          value={conclusiones.resumenDiscusiones}
          onChange={(e) => handleConclusionChange("resumenDiscusiones", e.target.value)}
          className="min-h-[150px]"
        />
      </FormCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard title="Hallazgos principales" description="Descubrimientos e insights clave">
          <Textarea
            placeholder="• Hallazgo 1&#10;• Hallazgo 2&#10;• Hallazgo 3"
            value={conclusiones.hallazgos}
            onChange={(e) => handleConclusionChange("hallazgos", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Puntos de conflicto" description="Desacuerdos o tensiones identificadas">
          <Textarea
            placeholder="• Conflicto 1: Descripción y partes involucradas&#10;• Conflicto 2: ..."
            value={conclusiones.puntosConflicto}
            onChange={(e) => handleConclusionChange("puntosConflicto", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar focus group" : "Nuevo focus group"}
        description="Documenta sesiones de focus group realizadas"
        icon={MessageSquare}
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