import React, { useState, useEffect } from "react";
import { LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/entities";
import PageHeader from "@/components/shared/PageHeader";
import ClassDiagramTable from "@/components/diagramas/clases/ClassDiagramTable";
import DiagramCreateEditModal from "@/components/diagramas/DiagramCreateEditModal";
import { confirmToast } from "@/lib/confirm-toast";
import { getLocalDiagrams, mergeById, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "class_diagrams";

export default function DiagramasClases() {
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
        const classDiagrams = backendDiagrams
          .filter((diagram) => diagram.tipo === "class")
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
          setDiagrams(mergeById(classDiagrams, localDiagrams));
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
        tipo: "class",
        nombre: updatedDiagram.name,
        descripcion: updatedDiagram.description || "",
        funcionId: updatedDiagram.funcionId || "",
        contenido: {
          classes: updatedDiagram.classes || [],
          relationships: updatedDiagram.relationships || [],
          interfaces: updatedDiagram.interfaces || [],
          enums: updatedDiagram.enums || []
        }
      });
      setShowModal(false);
    } else {
      // Create new
      const diagramId = `class-${Date.now()}`;
      const newDiagram = {
        id: diagramId,
        ...formData,
        classes: [],
        relationships: [],
        interfaces: [],
        enums: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDiagrams(prev => [...prev, newDiagram]);
      await entities.Diagrama.create({
        id: diagramId,
        tipo: "class",
        nombre: newDiagram.name,
        descripcion: newDiagram.description || "",
        funcionId: newDiagram.funcionId || "",
        contenido: {
          classes: newDiagram.classes,
          relationships: newDiagram.relationships,
          interfaces: newDiagram.interfaces,
          enums: newDiagram.enums
        }
      });
      // Navegar automáticamente al nuevo diagrama
      setTimeout(() => {
        navigate(`/diagrama-clases-editor/${newDiagram.id}`);
      }, 100);
      setShowModal(false);
      return;
    }
  };

  const handleView = (diagram) => {
    navigate(`/diagrama-clases-editor/${diagram.id}`, { state: { readonly: true } });
  };

  const handleEditDiagram = (diagram) => {
    navigate(`/diagrama-clases-editor/${diagram.id}`);
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
        title="Diagramas de Clases"
        description="Gestiona tus diagramas de clases UML"
        icon={LayoutGrid}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <ClassDiagramTable
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
          type="class"
          diagram={modalTarget}
          onSave={handleSaveModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
