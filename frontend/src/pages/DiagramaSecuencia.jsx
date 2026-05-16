import React, { useState, useRef, useCallback, useEffect } from "react";
import { GitBranch, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import SequencePalette from "@/components/diagramas/secuencia/SequencePalette";
import SequenceCanvas from "@/components/diagramas/secuencia/SequenceCanvas";
import { Button } from "@/components/ui/button";
import { entities } from "@/api/entities";
import { getLocalDiagrams, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "sequence_diagrams";

export default function DiagramaSecuencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [actors, setActors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fragments, setFragments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activations, setActivations] = useState([]);
  const [selected, setSelected] = useState(null);
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
        setMessages(diagram.messages || []);
        setFragments(diagram.fragments || []);
        setNotes(diagram.notes || []);
        setActivations(diagram.activations || []);
        setDiagramName(diagram.name || diagram.nombre || "Diagrama de Secuencia");
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
        { id: "a1", name: "Usuario", type: "actor", x: 100 },
        { id: "a2", name: "Sistema", type: "system", x: 300 },
      ]);
      setMessages([
        { id: "m1", from: "a1", to: "a2", label: "solicitar()", type: "sync", order: 1 },
        { id: "m2", from: "a2", to: "a1", label: "respuesta()", type: "return", order: 2 },
      ]);
      setFragments([]);
      setNotes([]);
      setActivations([]);
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
        messages,
        fragments,
        notes,
        activations,
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
            tipo: "sequence",
            nombre: diagramName,
            descripcion: diagramDescription,
            funcionId,
            contenido: {
              actors,
              messages,
              fragments,
              notes,
              activations
            }
          }).catch(e => console.error('Error saving to backend:', e));
        });
      } catch (e) {
        console.error('Error in auto-save:', e);
      }
    }
  }, [id, actors, messages, fragments, notes, activations, diagramName, diagramDescription, funcionId, isLoading]);

  const handleBack = () => {
    navigate("/DiagramasSecuencia");
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando diagrama...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden overflow-x-hidden">
      <PageHeader
        title={diagramName}
        description="Editor visual UML — arrastra componentes al canvas para construir tu diagrama"
        icon={GitBranch}
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
      <div className="flex flex-1 min-h-0 overflow-hidden overflow-x-hidden">
        <SequencePalette />
        <SequenceCanvas
          actors={actors}
          setActors={setActors}
          messages={messages}
          setMessages={setMessages}
          selected={selected}
          setSelected={setSelected}
          diagramName={diagramName}
        />
      </div>
    </div>
  );
}