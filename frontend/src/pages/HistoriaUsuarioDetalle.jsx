import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { entities } from "@/api/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import PageHeader from "@/components/shared/PageHeader";
import TemplateTabs from "@/components/shared/TemplateTabs";
import FormCard from "@/components/shared/FormCard";
import FileUploader from "@/components/shared/FileUploader";
import RelacionesSection from "@/components/shared/RelacionesSection";

export default function HistoriaUsuarioDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const historiaId = urlParams.get('id');
  const isEditing = !!historiaId;

  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    idHistoria: "",
    titulo: "",
    como: "",
    quiero: "",
    paraQue: "",
    prioridad: "media",
    estimacion: "",
    estado: "pendiente",
    stakeholderIds: [],
    funcionIds: []
  });
  const [prototiposFiles, setPrototiposFiles] = useState([]);
  const [conclusiones, setConclusiones] = useState({
    criteriosAceptacion: "",
    comentarios: "",
    dependencias: ""
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

  const { data: historia } = useQuery({
    queryKey: ['historia-usuario', historiaId],
    queryFn: async () => {
      const list = await entities.HistoriaUsuario.list();
      return list.find(h => h.id === historiaId);
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (historia) {
      setFormData({
        idHistoria: historia.idHistoria || "",
        titulo: historia.titulo || "",
        como: historia.como || "",
        quiero: historia.quiero || "",
        paraQue: historia.paraQue || "",
        prioridad: historia.prioridad || "media",
        estimacion: historia.estimacion || "",
        estado: historia.estado || "pendiente",
        stakeholderIds: historia.stakeholderIds || [],
        funcionIds: historia.funcionIds || []
      });
      setConclusiones({
        criteriosAceptacion: historia.criteriosAceptacion || "",
        comentarios: historia.comentarios || "",
        dependencias: historia.dependencias || ""
      });
      setPrototiposFiles(historia.prototiposFiles || []);
    }
  }, [historia]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await entities.HistoriaUsuario.update(historiaId, data);
      } else {
        return await entities.HistoriaUsuario.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historias-usuario'] });
      navigate(createPageUrl("HistoriasUsuarioListado"));
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
      ...conclusiones,
      prototiposFiles: prototiposFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };
    saveMutation.mutate(dataToSave);
    setSaving(false);
  };

  const informacionContent = (
    <div className="space-y-6">
      <FormCard title="Identificación" description="Datos básicos de la historia de usuario">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="idHistoria">ID de la historia *</Label>
            <Input 
              placeholder="Ej: HU-001"
              value={formData.idHistoria}
              onChange={(e) => handleInputChange("idHistoria", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input 
              placeholder="Título breve de la historia"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Narrativa de usuario" description="Como [rol], quiero [acción], para [beneficio]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="como">Como (rol del usuario)</Label>
            <Input 
              placeholder="Ej: Como usuario registrado"
              value={formData.como}
              onChange={(e) => handleInputChange("como", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiero">Quiero (acción deseada)</Label>
            <Input 
              placeholder="Ej: Quiero poder filtrar mis pedidos"
              value={formData.quiero}
              onChange={(e) => handleInputChange("quiero", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paraQue">Para qué (beneficio esperado)</Label>
            <Input 
              placeholder="Ej: Para encontrar rápidamente un pedido específico"
              value={formData.paraQue}
              onChange={(e) => handleInputChange("paraQue", e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Atributos" description="Prioridad, estimación y estado">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select value={formData.prioridad} onValueChange={(v) => handleInputChange("prioridad", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimacion">Estimación</Label>
            <Input 
              placeholder="Ej: 5 puntos, 3 días"
              value={formData.estimacion}
              onChange={(e) => handleInputChange("estimacion", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estado} onValueChange={(v) => handleInputChange("estado", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en desarrollo">En desarrollo</SelectItem>
                <SelectItem value="terminada">Terminada</SelectItem>
                <SelectItem value="validada">Validada</SelectItem>
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
      <FormCard title="Prototipos y mockups" description="Imágenes, wireframes, diseños">
        <FileUploader
          accept=".png,.jpg,.jpeg,.pdf,.fig"
          files={prototiposFiles}
          onFilesChange={setPrototiposFiles}
          title="Cargar prototipos"
          description="Arrastra imágenes o archivos de diseño aquí"
        />
      </FormCard>
    </div>
  );

  const conclusionesContent = (
    <div className="space-y-6">
      <FormCard title="Criterios de aceptación" description="Condiciones que debe cumplir la historia">
        <div className="space-y-4">
          <Textarea
            placeholder={"Escribe los criterios en formato markdown:\n\n- Dado que...\n- Cuando...\n- Entonces...\n\nO lista simple:\n- Criterio 1\n- Criterio 2"}
            value={conclusiones.criteriosAceptacion}
            onChange={(e) => handleConclusionChange("criteriosAceptacion", e.target.value)}
            className="min-h-[150px] font-mono text-sm"
          />
          {conclusiones.criteriosAceptacion && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-2 font-semibold">Vista previa:</p>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{conclusiones.criteriosAceptacion}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </FormCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard title="Comentarios" description="Notas adicionales sobre la historia">
          <Textarea
            placeholder="Comentarios, observaciones, decisiones tomadas..."
            value={conclusiones.comentarios}
            onChange={(e) => handleConclusionChange("comentarios", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Dependencias" description="Otras historias o tareas relacionadas">
          <Textarea
            placeholder="• HU-002: Debe completarse antes&#10;• HU-015: Requiere integración con..."
            value={conclusiones.dependencias}
            onChange={(e) => handleConclusionChange("dependencias", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar historia de usuario" : "Nueva historia de usuario"}
        description="Documenta historias de usuario del producto"
        icon={BookOpen}
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