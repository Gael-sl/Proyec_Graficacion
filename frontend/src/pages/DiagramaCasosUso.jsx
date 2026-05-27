import React, { useState, useEffect } from "react";
import { Users, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import UseCasePalette from "@/components/diagramas/casosUso/UseCasePalette";
import UseCaseCanvas from "@/components/diagramas/casosUso/UseCaseCanvas";
import { Button } from "@/components/ui/button";
import { entities } from "@/api/entities";
import { getLocalDiagrams, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "usecase_diagrams";

export default function DiagramaCasosUso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actors, setActors] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [systemBoundary, setSystemBoundary] = useState({ x: 200, y: 100, width: 400, height: 300 });
  const [diagramName, setDiagramName] = useState("Diagrama sin guardar");
  const [diagramDescription, setDiagramDescription] = useState("");
  const [funcionId, setFuncionId] = useState("");
  const [isLoading, setIsLoading] = useState(!!id);

  // Load diagram from localStorage if ID is provided
  useEffect(() => {
    if (id) {
      const localDiagrams = getLocalDiagrams(STORAGE_KEY);
      const setDiagramState = (diagram) => {
        setActors(diagram.actors || []);
        setUseCases(diagram.useCases || []);
        setAssociations(diagram.associations || []);
        setSystemBoundary(diagram.systemBoundary || { x: 200, y: 100, width: 400, height: 300 });
        setDiagramName(diagram.name || diagram.nombre || "Diagrama de Casos de Uso");
        setDiagramDescription(diagram.description || diagram.descripcion || "");
        setFuncionId(diagram.funcionId || "");
      };
      if (localDiagrams.length) {
        try {
          const diagram = localDiagrams.find(d => d.id === id);
          if (diagram) {
            setDiagramState(diagram);
          }
        } catch (e) {
          console.error("Error loading diagram:", e);
        }
      }
      entities.Diagrama.get(id)
        .then((diagram) => {
          if (!diagram) return;
          setDiagramState({
            id: diagram.id,
            ...diagram.contenido,
            name: diagram.nombre,
            description: diagram.descripcion,
            funcionId: diagram.funcionId
          });
        })
        .catch((error) => {
          console.error("Error loading backend diagram:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Default state for new diagram
      setActors([
        { id: "a1", type: "actor", name: "Usuario", description: "Usuario del sistema", x: 50, y: 150 },
        { id: "a2", type: "actor", name: "Administrador", description: "Administrador del sistema", x: 600, y: 150 },
      ]);
      setUseCases([
        { id: "uc1", type: "usecase", name: "Iniciar sesión", description: "El usuario inicia sesión en el sistema", x: 250, y: 100, width: 120, height: 80 },
        { id: "uc2", type: "usecase", name: "Gestionar datos", description: "Administración de datos del sistema", x: 250, y: 220, width: 120, height: 80 },
      ]);
      setAssociations([]);
      setDiagramDescription("");
      setFuncionId("");
      setIsLoading(false);
    }
  }, [id]);

  // Auto-save to localStorage
  useEffect(() => {
    if (id && !isLoading) {
      const diagrams = getLocalDiagrams(STORAGE_KEY);
      const index = diagrams.findIndex(d => d.id === id);
      
      const updatedDiagram = {
        id,
        name: diagramName,
        description: diagramDescription,
        funcionId,
        actors,
        useCases,
        associations,
        systemBoundary,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        diagrams[index] = { ...diagrams[index], ...updatedDiagram };
      } else {
        diagrams.push(updatedDiagram);
      }
      
      saveLocalDiagrams(STORAGE_KEY, diagrams);

      // Also save to backend
      try {
        import('@/api/entities').then(({ entities }) => {
          entities.Diagrama.update(id, {
            id,
            tipo: "usecase",
            nombre: diagramName,
            descripcion: diagramDescription,
            funcionId,
            contenido: {
              actors,
              useCases,
              associations,
              systemBoundary
            }
          }).catch(e => console.error('Error saving to backend:', e));
        });
      } catch (e) {
        console.error('Error in auto-save:', e);
      }
    }
  }, [id, actors, useCases, associations, systemBoundary, diagramName, diagramDescription, funcionId, isLoading]);

  const handleBack = () => {
    navigate("/DiagramasCasosUso");
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const diagrams = getLocalDiagrams(STORAGE_KEY);
      const index = diagrams.findIndex(d => d.id === id);
      
      const updatedDiagram = {
        id,
        name: diagramName,
        description: diagramDescription,
        funcionId,
        actors,
        useCases,
        associations,
        systemBoundary,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        diagrams[index] = { ...diagrams[index], ...updatedDiagram };
      } else {
        diagrams.push(updatedDiagram);
      }
      saveLocalDiagrams(STORAGE_KEY, diagrams);

      if (id) {
        await entities.Diagrama.update(id, {
          id,
          tipo: "usecase",
          nombre: diagramName,
          descripcion: diagramDescription,
          funcionId,
          contenido: {
            actors,
            useCases,
            associations,
            systemBoundary
          }
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error("Error manually saving diagram:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando diagrama...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7.5rem)] w-full bg-slate-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <PageHeader
        title={diagramName}
        description="Editor visual UML — arrastra elementos para construir tu diagrama"
        icon={Users}
        className="px-6 py-4 mb-2"
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualSave}
            disabled={isSaving}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200"
            size="sm"
          >
            {saveSuccess ? "Guardado ✓" : isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </PageHeader>
      <div className="flex flex-1 min-h-0 overflow-hidden overflow-x-hidden">
        <UseCasePalette />
        <UseCaseCanvas
          actors={actors}
          setActors={setActors}
          useCases={useCases}
          setUseCases={setUseCases}
          associations={associations}
          setAssociations={setAssociations}
          systemBoundary={systemBoundary}
          setSystemBoundary={setSystemBoundary}
          diagramName={diagramName}
        />
      </div>
    </div>
  );
}