// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ClipboardList, 
  FileText, 
  Layers, 
  Code2, 
  TestTube, 
  Rocket,
  Users,
  FileSearch,
  Activity,
  ArrowRight,
  ClipboardCheck,
  MessageSquare,
  BookOpen,
  Settings,
  UserCog,
  Cog,
  GitBranch,
  Package,
  LayoutGrid,
  Wand2,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const phases = [
  {
    name: "Gestión del Proyecto",
    description: "Organización, seguimiento y control de los roles del proyecto",
    icon: Settings,
    color: "from-slate-800 to-slate-900",
    shadowColor: "shadow-slate-500/25",
    items: [
      { name: "Módulos", icon: Package, page: "ModulosListado" },
      { name: "Funciones", icon: Cog, page: "FuncionesListado" },
      { name: "Stakeholders", icon: UserCog, page: "StakeholdersListado" }
    ]
  },
  {
    name: "Recolección de datos",
    description: "Técnicas y herramientas para capturar información del dominio",
    icon: ClipboardList,
    color: "from-indigo-600 to-violet-700",
    shadowColor: "shadow-indigo-500/25",
    items: [
      { name: "Entrevistas", icon: Users, page: "EntrevistasListado" },
      { name: "Encuestas", icon: ClipboardCheck, page: "EncuestasListado" },
      { name: "Focus Group", icon: MessageSquare, page: "FocusGroupListado" },
      { name: "Historias de Usuario", icon: BookOpen, page: "HistoriasUsuarioListado" },
      { name: "Análisis de documentos", icon: FileSearch, page: "AnalisisDocumentosListado" },
      { name: "Seguimiento transaccional", icon: Activity, page: "SeguimientoTransaccionalListado" }
    ]
  },
  {
    name: "Diagramas UML",
    description: "Modelado visual de procesos, comportamiento y estructura",
    icon: Layers,
    color: "from-emerald-600 to-teal-700",
    shadowColor: "shadow-emerald-500/25",
    items: [
      { name: "Secuencia", icon: GitBranch, page: "DiagramasSecuencia" },
      { name: "Casos de uso", icon: Users, page: "DiagramasCasosUso" },
      { name: "Paquetes", icon: Package, page: "DiagramasPaquetes" },
      { name: "Clases", icon: LayoutGrid, page: "DiagramasClases" }
    ]
  },
  {
    name: "Generador de Prompt",
    description: "Consolida todo el levantamiento y crea el prompt maestro para la IA",
    icon: Wand2,
    color: "from-blue-600 to-indigo-700",
    shadowColor: "shadow-blue-500/25",
    page: "GeneradorPrompt"
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <div className="apple-glass p-8 lg:p-10 flex-shrink-0 transition-transform hover:scale-[1.01] duration-500 shadow-xl">
        <div className="max-w-4xl relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-[1.05]">
            Documenta cada fase del ciclo de desarrollo
          </h1>
          
          <p className="text-base md:text-lg text-slate-600 max-w-2xl font-medium tracking-wide opacity-90 leading-relaxed">
            Captura y organiza los artefactos generados durante las distintas fases del desarrollo de software de manera estructurada y profesional.
          </p>

          <div className="mt-6">
            <Link 
              to={createPageUrl("GeneradorPrompt")} 
              className="inline-flex px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 text-sm"
            >
              Empezar ahora <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Phases Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 relative z-10">
          {phases.map((phase) => (
            <Card 
              key={phase.name}
              className="apple-glass border-white/40 group hover:-translate-y-2 transition-all duration-500 overflow-hidden bg-white/40 backdrop-blur-2xl shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header */}
                <div className={`p-8 bg-gradient-to-br ${phase.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                      <phase.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-white mt-6 tracking-tight">{phase.name}</h3>
                  <p className="text-white/70 text-sm mt-2 font-medium max-w-[250px]">{phase.description}</p>
                </div>

                {/* Content Area */}
                <div className="p-6 bg-white/20 flex-1 border-t border-white/40">
                  {phase.items ? (
                    <div className="grid grid-cols-1 gap-3">
                      {phase.items.map((item) => (
                        <Link
                          key={item.name}
                          to={createPageUrl(item.page)}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 hover:bg-white border border-white/40 hover:border-indigo-200 transition-all duration-300 group/item shadow-sm hover:shadow-md"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${phase.color} rounded-xl flex items-center justify-center shadow-lg ${phase.shadowColor}`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex-1 text-sm font-bold text-slate-800">{item.name}</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all">
                            <ArrowRight className="w-4 h-4 text-indigo-600" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center py-4">
                      <Link
                        to={createPageUrl(phase.page)}
                        className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 transition-all duration-300 text-sm font-bold shadow-lg"
                      >
                        Ingresar al Generador
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}