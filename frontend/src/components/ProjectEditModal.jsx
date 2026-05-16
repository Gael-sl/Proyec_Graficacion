import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProjectEditModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'En progreso'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'En progreso'
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="apple-glass rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/60">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/40">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del proyecto"
              className="w-full apple-glass-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripción detallada del proyecto"
              rows="3"
              className="w-full apple-glass-input resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full apple-glass-input bg-white/40"
            >
              <option value="En progreso">En progreso</option>
              <option value="Completado">Completado</option>
              <option value="En pausa">En pausa</option>
              <option value="No iniciado">No iniciado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-white/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-[1rem] text-slate-600 font-semibold hover:bg-white/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-indigo-600/90 text-white rounded-[1rem] font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 transition-all backdrop-blur-md"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
