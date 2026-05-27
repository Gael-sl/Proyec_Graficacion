import React, { useState, useEffect } from "react";
import { Package, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import PackagePalette from "@/components/diagramas/paquetes/PackagePalette";
import PackageCanvas from "@/components/diagramas/paquetes/PackageCanvas";
import { Button } from "@/components/ui/button";
import { entities } from "@/api/entities";
import { getLocalDiagrams, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "package_diagrams";

export default function DiagramaPaquetes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [packages, setPackages] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [imports, setImports] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [diagramName, setDiagramName] = useState("Diagrama de Paquetes");
  const [diagramDescription, setDiagramDescription] = useState("");
  const [funcionId, setFuncionId] = useState("");
  const [isLoading, setIsLoading] = useState(!!id);

  // Load diagram from localStorage if ID is provided
  useEffect(() => {
    if (id) {
      const localDiagrams = getLocalDiagrams(STORAGE_KEY);
      const setDiagramState = (diagram) => {
        setPackages(diagram.packages || []);
        setDependencies(diagram.dependencies || []);
        setImports(diagram.imports || []);
        setNotes(diagram.notes || []);
        setDiagramName(diagram.name || diagram.nombre || "Diagrama de Paquetes");
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
      setPackages([]);
      setImports([]);
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
        packages,
        dependencies,
        imports,
        notes,
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
            tipo: "package",
            nombre: diagramName,
            descripcion: diagramDescription,
            funcionId,
            contenido: {
              packages,
              dependencies,
              imports,
              notes
            }
          }).catch(e => console.error('Error saving to backend:', e));
        });
      } catch (e) {
        console.error('Error in auto-save:', e);
      }
    }
  }, [id, packages, dependencies, imports, notes, diagramName, diagramDescription, funcionId, isLoading]);

  const handleBack = () => {
    navigate("/DiagramasPaquetes");
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
        packages,
        dependencies,
        imports,
        notes,
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
          tipo: "package",
          nombre: diagramName,
          descripcion: diagramDescription,
          funcionId,
          contenido: {
            packages,
            dependencies,
            imports,
            notes
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
        description="Editor visual UML — arrastra componentes al canvas para construir tu diagrama"
        icon={Package}
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
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PackagePalette />
        <PackageCanvas
          packages={packages}
          setPackages={setPackages}
          dependencies={dependencies}
          setDependencies={setDependencies}
          notes={notes}
          setNotes={setNotes}
          selected={selected}
          setSelected={setSelected}
          diagramName={diagramName}
        />
      </div>
    </div>
  );
}