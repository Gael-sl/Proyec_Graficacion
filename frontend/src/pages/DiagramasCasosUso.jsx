import React, { useState, useEffect } from "react";
import { Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/entities";
import PageHeader from "@/components/shared/PageHeader";
import UseCaseDiagramTable from "@/components/diagramas/casosUso/UseCaseDiagramTable";
import DiagramCreateEditModal from "@/components/diagramas/DiagramCreateEditModal";
import { confirmToast } from "@/lib/confirm-toast";
import { getLocalDiagrams, mergeById, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "usecase_diagrams";

export default function DiagramasCasosUso() {
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
        const useCaseDiagrams = backendDiagrams
          .filter((diagram) => diagram.tipo === "usecase")
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
          setDiagrams(mergeById(useCaseDiagrams, localDiagrams));
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
        tipo: "usecase",
        nombre: updatedDiagram.name,
        descripcion: updatedDiagram.description || "",
        funcionId: updatedDiagram.funcionId || "",
        contenido: {
          actors: updatedDiagram.actors || [],
          useCases: updatedDiagram.useCases || [],
          associations: updatedDiagram.associations || [],
          systemBoundary: updatedDiagram.systemBoundary || {}
        }
      });
      setShowModal(false);
    } else {
      // Create new
      const diagramId = `uc-${Date.now()}`;
      const newDiagram = {
        id: diagramId,
        ...formData,
        actors: [],
        useCases: [],
        associations: [],
        systemBoundary: { x: 200, y: 100, width: 400, height: 300 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDiagrams(prev => [...prev, newDiagram]);
      await entities.Diagrama.create({
        id: diagramId,
        tipo: "usecase",
        nombre: newDiagram.name,
        descripcion: newDiagram.description || "",
        funcionId: newDiagram.funcionId || "",
        contenido: {
          actors: newDiagram.actors,
          useCases: newDiagram.useCases,
          associations: newDiagram.associations,
          systemBoundary: newDiagram.systemBoundary
        }
      });
      // Navegar automáticamente al nuevo diagrama
      setTimeout(() => {
        navigate(`/diagrama-casos-uso-editor/${newDiagram.id}`);
      }, 100);
      setShowModal(false);
      return;
    }
  };

  const handleView = (diagram) => {
    navigate(`/diagrama-casos-uso-editor/${diagram.id}`, { state: { readonly: true } });
  };

  const handleEditDiagram = (diagram) => {
    navigate(`/diagrama-casos-uso-editor/${diagram.id}`);
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
        title="Diagramas de Casos de Uso"
        description="Gestiona tus diagramas de casos de uso UML"
        icon={Users}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <UseCaseDiagramTable
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
          type="usecase"
          diagram={modalTarget}
          onSave={handleSaveModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
