import React, { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { entities } from "@/api/entities";
import PageHeader from "@/components/shared/PageHeader";
import PackageDiagramTable from "@/components/diagramas/paquetes/PackageDiagramTable";
import DiagramCreateEditModal from "@/components/diagramas/DiagramCreateEditModal";
import { confirmToast } from "@/lib/confirm-toast";
import { getLocalDiagrams, mergeById, saveLocalDiagrams } from "@/lib/diagram-storage";

const STORAGE_KEY = "package_diagrams";

export default function DiagramasPaquetes() {
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
        const packageDiagrams = backendDiagrams
          .filter((diagram) => diagram.tipo === "package")
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
          setDiagrams(mergeById(packageDiagrams, localDiagrams));
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
        tipo: "package",
        nombre: updatedDiagram.name,
        descripcion: updatedDiagram.description || "",
        funcionId: updatedDiagram.funcionId || "",
        contenido: {
          packages: updatedDiagram.packages || [],
          dependencies: updatedDiagram.dependencies || [],
          imports: updatedDiagram.imports || [],
          notes: updatedDiagram.notes || []
        }
      });
      setShowModal(false);
    } else {
      // Create new
      const diagramId = `pkg-${Date.now()}`;
      const newDiagram = {
        id: diagramId,
        ...formData,
        packages: [
          {
            id: "p1",
            name: "Paquete 1",
            description: "",
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            elements: [],
          },
        ],
        dependencies: [],
        imports: [],
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDiagrams(prev => [...prev, newDiagram]);
      await entities.Diagrama.create({
        id: diagramId,
        tipo: "package",
        nombre: newDiagram.name,
        descripcion: newDiagram.description || "",
        funcionId: newDiagram.funcionId || "",
        contenido: {
          packages: newDiagram.packages,
          dependencies: newDiagram.dependencies,
          imports: newDiagram.imports,
          notes: newDiagram.notes
        }
      });
      // Navegar automáticamente al nuevo diagrama
      setTimeout(() => {
        navigate(`/diagrama-paquetes-editor/${newDiagram.id}`);
      }, 100);
      setShowModal(false);
      return;
    }
  };

  const handleView = (diagram) => {
    navigate(`/diagrama-paquetes-editor/${diagram.id}`, { state: { readonly: true } });
  };

  const handleEditDiagram = (diagram) => {
    navigate(`/diagrama-paquetes-editor/${diagram.id}`);
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
        title="Diagramas de Paquetes"
        description="Gestiona tus diagramas de paquetes UML"
        icon={Package}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <PackageDiagramTable
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
          type="package"
          diagram={modalTarget}
          onSave={handleSaveModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
