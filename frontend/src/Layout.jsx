import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { useProjects } from "@/lib/ProjectContext";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  Code2,
  TestTube,
  Rocket,
  Settings,
  ClipboardList,
  Users,
  FileSearch,
  Activity,
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  UserCog,
  Cog,
  GitBranch,
  Package,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Wand2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    page: "Home"
  },
  {
    name: "Gestión del Proyecto",
    icon: Settings,
    children: [
      { name: "Módulos", icon: Package, page: "ModulosListado" },
      { name: "Funciones", icon: Cog, page: "FuncionesListado" },
      {
        name: "Stakeholders",
        icon: UserCog,
        children: [
          { name: "Catálogo de stakeholders", icon: UserCog, page: "StakeholdersListado" },
          { name: "Roles", icon: Cog, page: "RolesListado" }
        ]
      }
    ]
  },
  {
    name: "Recolección de datos",
    icon: ClipboardList,
    children: [
      { name: "Entrevistas", icon: Users, page: "EntrevistasListado" },
      { name: "Encuestas", icon: ClipboardCheck, page: "EncuestasListado" },
      { name: "Focus Group", icon: MessageSquare, page: "FocusGroupListado" },
      { name: "Historias de Usuario", icon: BookOpen, page: "HistoriasUsuarioListado" },
      { name: "Análisis de documentos", icon: FileSearch, page: "AnalisisDocumentosListado" },
      { name: "Seguimiento transaccional", icon: Activity, page: "SeguimientoTransaccionalListado" }
    ]
  },
  {
    name: "Diagramas",
    icon: Layers,
    children: [
      { name: "Secuencia", icon: GitBranch, page: "DiagramasSecuencia" },
      { name: "Casos de uso", icon: Users, page: "DiagramasCasosUso" },
      { name: "Paquetes", icon: Package, page: "DiagramasPaquetes" },
      { name: "Clases", icon: LayoutGrid, page: "DiagramasClases" }
    ]
  },
  {
    name: "Generador de Prompt",
    icon: Wand2,
    page: "GeneradorPrompt"
  }
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProject } = useProjects();
  const [expandedItems, setExpandedItems] = useState([]);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  const toggleExpand = (name) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (page) => {
    const currentPath = location.pathname;
    return currentPath === createPageUrl(page);
  };

  const renderNavItem = (item) => {
    if (item.children?.length) {
      const isExpanded = expandedItems.includes(item.name);

      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpand(item.name)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-[1rem] text-sm font-medium transition-all duration-300",
              isExpanded
                ? "bg-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-slate-900 border border-white/60"
                : "text-slate-600 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm border border-transparent"
            )}
            title={isSidebarMinimized ? item.name : ""}
          >
            <div className={cn("flex items-center min-w-0", isSidebarMinimized ? "justify-center w-full" : "gap-3")}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isSidebarMinimized && <span className="truncate">{item.name}</span>}
            </div>
            {!isSidebarMinimized && (isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />)}
          </button>

          {!isSidebarMinimized && isExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-200/80 space-y-1">
              {item.children.map((child) => renderNavItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={createPageUrl(item.page)}
        className={cn(
          "flex items-center px-4 py-[10px] rounded-[1rem] text-sm transition-all duration-300 border",
          isSidebarMinimized ? "justify-center" : "gap-3",
          isActive(item.page)
            ? "bg-white/80 text-slate-900 font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.06)] border-white/60"
            : "text-slate-600 hover:bg-white/50 border-transparent hover:border-white/40 hover:text-slate-900"
        )}
        title={isSidebarMinimized ? item.name : ""}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        {!isSidebarMinimized && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Background Orbs */}
      <div className="ambient-orbs"></div>
      
      <div className="min-h-screen flex text-slate-800 z-10 relative overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "fixed h-[calc(100vh-2rem)] my-4 ml-4 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-50 apple-glass-panel",
          isSidebarMinimized ? "w-[5.5rem]" : "w-72"
        )}>
          {/* Logo/Header */}
          <div className="relative p-4 border-b border-white/60 rounded-t-[2rem] transition-colors duration-300">
            {isSidebarMinimized ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/60">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="h-10 w-10 rounded-xl border border-white/60 bg-white/50 hover:bg-white/70 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900"
                  aria-label="Expandir menú lateral"
                  title="Expandir menú"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 transition-all duration-300 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200/60">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-slate-900 font-bold text-lg tracking-tighter whitespace-nowrap">GeraSoft</h1>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="h-10 w-10 rounded-xl border border-white/60 bg-white/50 hover:bg-white/70 transition-colors flex items-center justify-center text-slate-600 hover:text-slate-900"
                  aria-label="Colapsar menú lateral"
                  title="Colapsar menú"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto min-h-0 scrollbar-hidden-until-scroll">
          {navigationItems.map((item) => renderNavItem(item))}
        </nav>

        {/* Footer */}
        {!isSidebarMinimized && (
          <div className="p-4 border-t border-white/60 shrink-0">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-subtle">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {currentProject?.name?.charAt(0).toUpperCase() || 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 font-medium truncate">{currentProject?.name || 'Mi Proyecto'}</p>
                <p className="text-xs text-slate-500 font-bold tracking-tighter">ENGINE v2.0</p>
              </div>
            </div>
          </div>
        )}
      </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] min-h-screen p-4 pl-0",
          isSidebarMinimized ? "ml-[7.5rem]" : "ml-[21rem]"
        )}>
          <div className="apple-glass-panel min-h-[calc(100vh-2rem)] w-full p-8 text-slate-800">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}