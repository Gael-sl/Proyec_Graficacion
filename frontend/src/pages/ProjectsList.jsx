import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProjects } from '@/lib/ProjectContext';
import ProjectCard from '@/components/ProjectCard';
import ProjectEditModal from '@/components/ProjectEditModal';
import { createPageUrl } from '@/utils';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { projects, currentProject, addProject, updateProject, deleteProject, selectProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleOpenModal = (project = null) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSave = (formData) => {
    if (editingProject) {
      updateProject(editingProject.id, formData);
    } else {
      addProject(formData);
    }
    handleCloseModal();
  };

  const handleSelectProject = (project) => {
    selectProject(project);
    // Navegar a /Home después de seleccionar proyecto
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="apple-glass p-6 flex-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mis Proyectos</h1>
            <p className="text-slate-600 mt-2 font-medium">Gestiona todos tus proyectos en un solo lugar</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-4 apple-glass-button bg-indigo-500/20 font-bold hover:bg-indigo-500/30 text-indigo-700 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nuevo Proyecto
          </button>
        </div>

        {/* Grid de Proyectos */}
        {projects.length === 0 ? (
          <div className="apple-glass text-center py-16 flex flex-col items-center justify-center">
            <div className="text-6xl mb-6 opacity-80">📁</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No hay proyectos</h3>
            <p className="text-slate-600 mb-6 font-medium">Crea tu primer proyecto para comenzar a documentar</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-6 py-3 apple-glass-button bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-700"
            >
              <Plus className="w-5 h-5" />
              Crear Proyecto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => handleOpenModal(project)}
                onDelete={deleteProject}
                onSelect={handleSelectProject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProjectEditModal
          project={editingProject}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
