import React, { useState, useEffect } from "react";
import { GitBranch, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/entities";
import PageHeader from "@/components/shared/PageHeader";
import SequenceDiagramTable from "@/components/diagramas/secuencia/SequenceDiagramTable";
import DiagramCreateEditModal from "@/components/diagramas/DiagramCreateEditModal";
import { confirmToast } from "@/lib/confirm-toast";
import { getLocalDiagrams, mergeById, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "sequence_diagrams";

export default function DiagramasSecuencia() {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState([]);
  const [modalTarget, setModalTarget] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load from backend first, fallback to localStorage
  useEffect(() => {
    let mounted = true;
    const loadDiagrams = async () => {
      const localDiagrams = getLocalDiagrams(STORAGE_KEY);
      try {
        const backendDiagrams = await entities.Diagrama.list();
        const sequenceDiagrams = backendDiagrams
          .filter((diagram) => diagram.tipo === "sequence")
          .map((diagram) => ({
            id: diagram.id,
            name: diagram.nombre,
            description: diagram.descripcion || "",
            funcionId: diagram.funcionId || "",
            ...(diagram.contenido || {}),
            createdAt: diagram.fechaCreacion,
            updatedAt: diagram.fechaActualizacion
          }));
        if (mounted) {
          setDiagrams(mergeById(sequenceDiagrams, localDiagrams));
        }
      } catch (e) {
        console.error("Error loading backend diagrams:", e);
        if (mounted) {
          setDiagrams(localDiagrams);
        }
      }
    };
    loadDiagrams();
    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage
  useEffect(() => {
    saveLocalDiagrams(STORAGE_KEY, diagrams);
  }, [diagrams]);

  const handleCreateNew = () => {
    setModalTarget(null);
    setShowModal(true);
  };

  const handleEdit = (diagram) => {
    setModalTarget(diagram);
    setShowModal(true);
  };

  const handleSaveModal = async (formData) => {
    if (modalTarget) {
      const updatedDiagram = {
        ...modalTarget,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      // Edit existing
      setDiagrams(prev =>
        prev.map(d =>
          d.id === modalTarget.id
            ? updatedDiagram
            : d
        )
      );
      await entities.Diagrama.update(modalTarget.id, {
        id: modalTarget.id,
        tipo: "sequence",
        nombre: updatedDiagram.name,
        descripcion: updatedDiagram.description || "",
        funcionId: updatedDiagram.funcionId || "",
        contenido: {
          actors: updatedDiagram.actors || [],
          messages: updatedDiagram.messages || [],
          fragments: updatedDiagram.fragments || [],
          notes: updatedDiagram.notes || [],
          activations: updatedDiagram.activations || []
        }
      });
    } else {
      // Create new
      const diagramId = `seq-${Date.now()}`;
      const newDiagram = {
        id: diagramId,
        ...formData,
        actors: [],
        messages: [],
        fragments: [],
        notes: [],
        activations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDiagrams(prev => [...prev, newDiagram]);
      await entities.Diagrama.create({
        id: diagramId,
        tipo: "sequence",
        nombre: newDiagram.name,
        descripcion: newDiagram.description || "",
        funcionId: newDiagram.funcionId || "",
        contenido: {
          actors: newDiagram.actors,
          messages: newDiagram.messages,
          fragments: newDiagram.fragments,
          notes: newDiagram.notes,
          activations: newDiagram.activations
        }
      });
      // Navegar automáticamente al nuevo diagrama
      setTimeout(() => {
        navigate(`/diagrama-secuencia-editor/${newDiagram.id}`);
      }, 100);
      setShowModal(false);
      return;
    }
    setShowModal(false);
  };

  const handleView = (diagram) => {
    navigate(`/diagrama-secuencia-editor/${diagram.id}`, { state: { readonly: true } });
  };

  const handleEditDiagram = (diagram) => {
    navigate(`/diagrama-secuencia-editor/${diagram.id}`);
  };

  const handleDelete = async (diagramId) => {
    const shouldDelete = await confirmToast({
      title: "Eliminar diagrama",
      description: "¿Estás seguro de que deseas eliminar este diagrama?"
    });
    if (!shouldDelete) {
      return;
    }
    setDiagrams(prev => prev.filter(d => d.id !== diagramId));
    void entities.Diagrama.delete(diagramId);
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <PageHeader
        title="Diagramas de Secuencia"
        description="Gestiona tus diagramas de secuencia UML"
        icon={GitBranch}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <SequenceDiagramTable
            diagrams={diagrams}
            onView={handleView}
            onEdit={handleEditDiagram}
            onDelete={handleDelete}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>

      {showModal && (
        <DiagramCreateEditModal
          type="sequence"
          diagram={modalTarget}
          onSave={handleSaveModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
