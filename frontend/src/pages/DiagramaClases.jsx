import React, { useState, useEffect } from "react";
import { LayoutGrid, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import ClassPalette from "@/components/diagramas/clases/ClassPalette";
import ClassCanvas from "@/components/diagramas/clases/ClassCanvas";
import { Button } from "@/components/ui/button";
import { entities } from "@/api/entities";
import { getLocalDiagrams, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "class_diagrams";

export default function DiagramaClases() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [enums, setEnums] = useState([]);
  const [selected, setSelected] = useState(null);
  const [diagramName, setDiagramName] = useState("Diagrama de Clases");
  const [diagramDescription, setDiagramDescription] = useState("");
  const [funcionId, setFuncionId] = useState("");
  const [isLoading, setIsLoading] = useState(!!id);

  // Load diagram from localStorage if ID is provided
  useEffect(() => {
    if (id) {
      const localDiagrams = getLocalDiagrams(STORAGE_KEY);
      const setDiagramState = (diagram) => {
        setClasses(diagram.classes || []);
        setRelationships(diagram.relationships || []);
        setInterfaces(diagram.interfaces || []);
        setEnums(diagram.enums || []);
        setDiagramName(diagram.name || diagram.nombre || "Diagrama de Clases");
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
      setClasses([
        {
          id: "c1",
          type: "class",
          name: "Clase 1",
          x: 100,
          y: 100,
          width: 180,
          height: 150,
          attributes: [],
          methods: [],
        },
      ]);
      setInterfaces([]);
      setEnums([]);
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
        classes,
        relationships,
        interfaces,
        enums,
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
            tipo: "class",
            nombre: diagramName,
            descripcion: diagramDescription,
            funcionId,
            contenido: {
              classes,
              relationships,
              interfaces,
              enums
            }
          }).catch(e => console.error('Error saving to backend:', e));
        });
      } catch (e) {
        console.error('Error in auto-save:', e);
      }
    }
  }, [id, classes, relationships, interfaces, enums, diagramName, diagramDescription, funcionId, isLoading]);

  const handleBack = () => {
    navigate("/DiagramasClases");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando diagrama...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title={diagramName}
        description="Editor visual UML — arrastra componentes al canvas para construir tu diagrama"
        icon={LayoutGrid}
      >
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
      </PageHeader>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ClassPalette />
        <ClassCanvas
          classes={classes}
          setClasses={setClasses}
          relationships={relationships}
          setRelationships={setRelationships}
          selected={selected}
          setSelected={setSelected}
          diagramName={diagramName}
        />
      </div>
    </div>
  );
}