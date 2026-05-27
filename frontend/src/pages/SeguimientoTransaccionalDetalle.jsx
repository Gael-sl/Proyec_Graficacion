import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Filter, Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { entities } from "@/api/entities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import TemplateTabs from "@/components/shared/TemplateTabs";
import FormCard from "@/components/shared/FormCard";
import FileUploader from "@/components/shared/FileUploader";
import RelacionesSection from "@/components/shared/RelacionesSection";

export default function SeguimientoTransaccionalDetalle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const seguimientoId = urlParams.get('id');
  const isEditing = !!seguimientoId;

  const [activeTab, setActiveTab] = useState("informacion");
  const [formData, setFormData] = useState({
    sistema: "",
    tipoTransaccion: "",
    periodoInicio: "",
    periodoFin: "",
    fuenteDatos: "",
    objetivo: "",
    stakeholderIds: [],
    funcionIds: []
  });
  const [dataFiles, setDataFiles] = useState([]);
  const [parsedData] = useState([
    { id: 1, fecha: "2024-01-15", hora: "09:32:15", tipo: "LOGIN", usuario: "usr001", estado: "exitoso", duracion: "1.2s" },
    { id: 2, fecha: "2024-01-15", hora: "09:33:42", tipo: "CONSULTA", usuario: "usr001", estado: "exitoso", duracion: "0.8s" },
    { id: 3, fecha: "2024-01-15", hora: "09:35:18", tipo: "ACTUALIZACION", usuario: "usr001", estado: "error", duracion: "15.3s" }
  ]);
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    tipoEvento: "all"
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [conclusiones, setConclusiones] = useState({
    patrones: "",
    frecuencias: "",
    cuellos: "",
    reglas: "",
    conclusiones: ""
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

  const { data: seguimiento } = useQuery({
    queryKey: ['seguimiento-transaccional', seguimientoId],
    queryFn: async () => {
      const list = await entities.SeguimientoTransaccional.list();
      return list.find(s => s.id === seguimientoId);
    },
    enabled: isEditing
  });

  useEffect(() => {
    if (seguimiento) {
      setFormData({
        sistema: seguimiento.sistema || seguimiento.titulo || "",
        tipoTransaccion: seguimiento.tipoTransaccion || seguimiento.transacciones || "",
        periodoInicio: seguimiento.periodoInicio || "",
        periodoFin: seguimiento.periodoFin || "",
        fuenteDatos: seguimiento.fuenteDatos || "",
        objetivo: seguimiento.objetivo || seguimiento.descripcion || "",
        stakeholderIds: seguimiento.stakeholderIds || [],
        funcionIds: seguimiento.funcionIds || []
      });
      setConclusiones({
        patrones: seguimiento.patrones || "",
        frecuencias: seguimiento.frecuencias || "",
        cuellos: seguimiento.cuellos || "",
        reglas: seguimiento.reglas || "",
        conclusiones: seguimiento.conclusiones || ""
      });
      setDataFiles(seguimiento.dataFiles || []);
    }
  }, [seguimiento]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) {
        return await entities.SeguimientoTransaccional.update(seguimientoId, data);
      } else {
        return await entities.SeguimientoTransaccional.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seguimientos-transaccionales'] });
      navigate(createPageUrl("SeguimientoTransaccionalListado"));
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
      titulo: formData.sistema || "Seguimiento transaccional",
      descripcion: formData.objetivo || "",
      transacciones: formData.tipoTransaccion || "",
      actores: formData.stakeholderIds?.join(",") || "",
      flujo: conclusiones.patrones || "",
      excepciones: conclusiones.cuellos || "",
      ...conclusiones,
      dataFiles: dataFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
    };
    saveMutation.mutate(dataToSave);
    setSaving(false);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...parsedData];
    
    if (filters.fechaInicio) {
      result = result.filter(row => row.fecha >= filters.fechaInicio);
    }
    if (filters.fechaFin) {
      result = result.filter(row => row.fecha <= filters.fechaFin);
    }
    if (filters.tipoEvento !== "all") {
      result = result.filter(row => row.tipo === filters.tipoEvento);
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [parsedData, filters, sortConfig]);

  const uniqueEventTypes = useMemo(() => {
    return [...new Set(parsedData.map(row => row.tipo))];
  }, [parsedData]);

  const SortableHeader = ({ column, label }) => (
    <TableHead 
      className="cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortConfig.key === column && (
          sortConfig.direction === "asc" ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </TableHead>
  );

  const informacionContent = (
    <div className="space-y-6">
      <FormCard title="Datos del seguimiento" description="Información general del monitoreo transaccional">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sistema">Sistema o proceso monitoreado *</Label>
            <Input 
              placeholder="Ej: ERP SAP, Sistema de ventas..."
              value={formData.sistema}
              onChange={(e) => handleInputChange("sistema", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de transacción o evento *</Label>
            <Select value={formData.tipoTransaccion} onValueChange={(v) => handleInputChange("tipoTransaccion", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="login">Accesos al sistema</SelectItem>
                <SelectItem value="transaccion">Transacciones financieras</SelectItem>
                <SelectItem value="crud">Operaciones CRUD</SelectItem>
                <SelectItem value="api">Llamadas a API</SelectItem>
                <SelectItem value="error">Logs de errores</SelectItem>
                <SelectItem value="auditoria">Logs de auditoría</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodoInicio">Periodo de captura - Inicio *</Label>
            <Input 
              type="date" 
              value={formData.periodoInicio}
              onChange={(e) => handleInputChange("periodoInicio", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodoFin">Periodo de captura - Fin</Label>
            <Input 
              type="date" 
              value={formData.periodoFin}
              onChange={(e) => handleInputChange("periodoFin", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuente">Fuente de los datos</Label>
            <Input 
              placeholder="Ej: Base de datos de producción, API REST..."
              value={formData.fuenteDatos}
              onChange={(e) => handleInputChange("fuenteDatos", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo del seguimiento</Label>
            <Input 
              placeholder="¿Qué se busca identificar o validar?"
              value={formData.objetivo}
              onChange={(e) => handleInputChange("objetivo", e.target.value)}
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
      <FormCard title="Carga de datos" description="CSV, JSON o archivos de logs">
        <FileUploader
          accept=".csv,.json,.log,.txt"
          files={dataFiles}
          onFilesChange={setDataFiles}
          title="Cargar archivos de datos"
          description="Arrastra archivos CSV, JSON o logs aquí"
        />
      </FormCard>

      {parsedData.length > 0 && (
        <>
          <FormCard title="Filtros" description="Filtra los datos para análisis específico">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input 
                  type="date" 
                  placeholder="Fecha inicio"
                  value={filters.fechaInicio}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input 
                  type="date" 
                  placeholder="Fecha fin"
                  value={filters.fechaFin}
                  onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select 
                  value={filters.tipoEvento} 
                  onValueChange={(v) => setFilters(prev => ({ ...prev, tipoEvento: v }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueEventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </FormCard>

          <FormCard title="Visualización de datos (Demo)" description={`${filteredAndSortedData.length} registros`}>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <SortableHeader column="fecha" label="Fecha" />
                    <SortableHeader column="hora" label="Hora" />
                    <SortableHeader column="tipo" label="Tipo" />
                    <SortableHeader column="usuario" label="Usuario" />
                    <SortableHeader column="estado" label="Estado" />
                    <SortableHeader column="duracion" label="Duración" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{row.fecha}</TableCell>
                      <TableCell className="text-slate-500">{row.hora}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {row.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{row.usuario}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={
                            row.estado === "exitoso" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {row.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-500">{row.duracion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </FormCard>
        </>
      )}
    </div>
  );

  const conclusionesContent = (
    <div className="space-y-6">
      <FormCard title="Patrones identificados" description="Patrones de comportamiento observados en los datos">
        <Textarea
          placeholder="• Patrón 1: Descripción del comportamiento observado&#10;• Patrón 2: ..."
          value={conclusiones.patrones}
          onChange={(e) => handleConclusionChange("patrones", e.target.value)}
          className="min-h-[120px]"
        />
      </FormCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormCard title="Frecuencias y comportamientos recurrentes" description="Eventos que se repiten constantemente">
          <Textarea
            placeholder="• Evento X ocurre cada Y minutos&#10;• Pico de actividad a las HH:MM"
            value={conclusiones.frecuencias}
            onChange={(e) => handleConclusionChange("frecuencias", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Cuellos de botella" description="Puntos de lentitud o congestión">
          <Textarea
            placeholder="• Proceso X toma demasiado tiempo&#10;• Recurso Y se satura en horario Z"
            value={conclusiones.cuellos}
            onChange={(e) => handleConclusionChange("cuellos", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Reglas de negocio implícitas" description="Reglas no documentadas pero observables">
          <Textarea
            placeholder="• RN-001: Si ocurre X entonces Y&#10;• RN-002: El proceso no permite..."
            value={conclusiones.reglas}
            onChange={(e) => handleConclusionChange("reglas", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>

        <FormCard title="Conclusiones generales" description="Resumen del análisis transaccional">
          <Textarea
            placeholder="Resumen ejecutivo de los hallazgos principales..."
            value={conclusiones.conclusiones}
            onChange={(e) => handleConclusionChange("conclusiones", e.target.value)}
            className="min-h-[150px]"
          />
        </FormCard>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={isEditing ? "Editar seguimiento transaccional" : "Nuevo seguimiento transaccional"}
        description="Analiza logs y datos transaccionales del sistema"
        icon={Activity}
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