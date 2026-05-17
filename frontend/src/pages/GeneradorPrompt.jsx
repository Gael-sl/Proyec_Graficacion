// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileText,
  Layout,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/lib/ProjectContext";
import { entities } from "@/api/entities";
import { cn } from "@/lib/utils";
import { generateMermaid } from "@/lib/mermaid-generator";

const BACKEND_OPTIONS = [
  {
    id: "node-express",
    label: "Node.js + Express",
    short: "Node",
    description: "Backend JavaScript ligero, ideal para APIs rápidas.",
  },
  {
    id: "python-fastapi",
    label: "Python + FastAPI",
    short: "FastAPI",
    description: "API moderna con validación automática y tipado fuerte.",
  },
  {
    id: "java-spring",
    label: "Java + Spring Boot",
    short: "Spring",
    description: "Estructura robusta para proyectos empresariales.",
  },
  {
    id: "dotnet-webapi",
    label: "C# + ASP.NET Core",
    short: ".NET",
    description: "Rendimiento sólido y excelente organización.",
  },
];

const FRONTEND_OPTIONS = [
  {
    id: "react-vite",
    label: "React + Vite",
    short: "React",
    description: "Frontend moderno, rápido y modular.",
  },
  {
    id: "vue-vite",
    label: "Vue + Vite",
    short: "Vue",
    description: "Progresivo con curva de aprendizaje suave.",
  },
  {
    id: "angular",
    label: "Angular",
    short: "Angular",
    description: "Estructurado con convenciones estrictas.",
  },
  {
    id: "html-js",
    label: "HTML + JS",
    short: "Native",
    description: "Sin frameworks, ideal para prototipos puros.",
  },
];

const DATABASE_OPTIONS = [
  {
    id: "sqlite",
    label: "SQLite",
    short: "SQLite",
    description: "Local, ligera y rápida de configurar.",
  },
  {
    id: "postgresql",
    label: "PostgreSQL",
    short: "Postgres",
    description: "Relacional avanzada para producción.",
  },
  {
    id: "mysql",
    label: "MySQL",
    short: "MySQL",
    description: "Clásica, fiable y con despliegue sencillo.",
  },
  {
    id: "mongodb",
    label: "MongoDB",
    short: "MongoDB",
    description: "NoSQL flexible para iteración rápida.",
  },
];

const AUTH_OPTIONS = [
  {
    id: "email-jwt",
    label: "Email + Password",
    short: "JWT",
    description: "Autenticación tradicional (JWT).",
  },
  {
    id: "google-oauth",
    label: "Google OAuth",
    short: "Google",
    description: "Login rápido con Google Workspace.",
  },
  {
    id: "magic-link",
    label: "Magic Links",
    short: "Magic",
    description: "Login sin contraseña por correo.",
  },
  {
    id: "firebase-auth",
    label: "Firebase Auth",
    short: "Firebase",
    description: "Servicio BaaS de identidad.",
  },
];

const SECTION_ORDER = [
  "project",
  "stack",
  "auth",
  "fileStructure",
  "permissionMatrix",
  "research",
  "stakeholders",
  "roles",
  "functions",
  "modules",
  "requirements",
  "diagrams",
  "implementationPlan",
  "instructions",
];

const DEFAULT_SELECTIONS = {
  backend: "node-express",
  frontend: "react-vite",
  database: "sqlite",
  auth: "google-oauth",
};

function safeArray(v) { return Array.isArray(v) ? v : []; }
function asText(v, f = "") { return v ? String(v).trim() : f; }

function buildFileStructure(backendId, frontendId, databaseId, modules) {
  const modNames = safeArray(modules).map(m => asText(m.nombre || m.name));
  return `=== ESTRUCTURA DE ARCHIVOS REQUERIDA ===\n- Backend (${backendId}): controllers/, routes/, models/, config/\n- Frontend (${frontendId}): components/, pages/, hooks/, context/\n- Database (${databaseId})\n\nMódulos a implementar: ${modNames.join(", ")}`;
}

function buildPermissionMatrix(matrix) {
  if (!matrix?.length) return "- Sin matriz de permisos generada.";
  return matrix.map(e => `ROL: ${e.role.nombre}\n  - Funciones: ${e.funciones.map(f => f.nombre).join(", ")}\n  - Módulos: ${e.modulos.map(m => m.nombre).join(", ")}`).join("\n\n");
}

function buildImplementationPlan(modules) {
  return `1. Setup Inicial\n2. Auth & Roles\n3. Módulos: ${safeArray(modules).map(m => m.nombre).join(", ")}\n4. Integración y Test`;
}

function buildAuthConfig(authId, roles) {
  const envVars = {
    "email-jwt": ["JWT_SECRET", "JWT_EXPIRES_IN", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"],
    "google-oauth": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL", "JWT_SECRET", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"],
    "magic-link": ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "JWT_SECRET", "EMAIL_FROM"],
    "firebase-auth": ["FIREBASE_API_KEY", "FIREBASE_AUTH_DOMAIN", "FIREBASE_PROJECT_ID"],
  };

  const selectedEnvVars = envVars[authId] || [];
  
  const roleRedirects = safeArray(roles).map(r => {
    const name = r.nombre.toLowerCase();
    let redirect = "/dashboard";
    if (name.includes("admin")) redirect = "/admin";
    if (name.includes("recep") || name.includes("venta") || name.includes("mostrador")) redirect = "/punto-de-venta";
    if (name.includes("cliente") || name.includes("paciente")) redirect = "/mi-perfil";
    return `- Al logearse, el rol "${r.nombre}" debe ser redirigido a la pantalla: ${redirect}`;
  }).join("\n");

  const isGoogle = authId === "google-oauth";

  return `=== ESTRATEGIA DE AUTENTICACIÓN Y SEGURIDAD: ${authId} ===
Se requiere implementar un sistema de Autenticación y Control de Acceso completo. El agente debe generar el código con las siguientes especificaciones técnicas de producción:

1. ARCHIVO .ENV DE PRODUCCIÓN:
Genera un archivo \`.env.example\` y el archivo \`.env\` correspondiente configurado para soportar tanto autenticación como envío de correos:
\`\`\`env
# Autenticación
${selectedEnvVars.filter(v => !v.startsWith("SMTP") && v !== "EMAIL_FROM").map(v => `${v}=valor_real_aqui`).join("\n")}

# Configuración de Servidor de Correos (SMTP) para Recuperación de Contraseña
${selectedEnvVars.filter(v => v.startsWith("SMTP") || v === "EMAIL_FROM").map(v => `${v}=valor_real_aqui`).join("\n")}
\`\`\`

2. FLUJO DE RECUPERACIÓN DE CONTRASEÑA (EMAIL OTP):
INSTRUCCIÓN CRÍTICA: Implementa un flujo completo de "Recuperar Contraseña" funcional:
- El usuario podrá dar clic en "¿Olvidaste tu contraseña?".
- El sistema solicitará su correo y, utilizando la librería \`nodemailer\` (o similar según stack), enviará un correo con un token numérico de seguridad temporal (OTP).
- El usuario ingresará el código en la pantalla de verificación para poder definir de forma segura su nueva contraseña.

3. LOGIN HÍBRIDO Y BYPASS DE DESARROLLO:
${isGoogle ? `- MODO HÍBRIDO: Integra el login tradicional (Correo/Contraseña) junto con el botón de "Google Sign-In".
- BYPASS DE SEGURIDAD EN DESARROLLO: Si las credenciales de Google o SMTP no están configuradas en el \`.env\` local, el sistema debe alertar en consola de desarrollo y permitir un bypass rápido (usando un botón "Demo" o detectando credenciales mock) para que la UI se pueda probar instantáneamente sin configurar APIs.` : ""}

4. USUARIO ADMINISTRADOR DE PRUEBA (SEEDER):
Crea un script (seeder) de base de datos que inserte un usuario administrador por defecto:
- Correo: admin@demo.com
- Password: password123

=== CONTROL DE ACCESO BASADO EN ROLES (RBAC) ===
Definición de redirecciones post-login:
${roleRedirects || "- No hay roles definidos. El usuario debe ser redirigido al /dashboard general."}
`;
}

function buildResearchSummary(data) {
  const parts = [];
  if (data.interviews?.length) {
    parts.push("=== ENTREVISTAS ===\n" + data.interviews.map(i => `- Con ${i.participante} (${i.fecha}): ${i.resumen}`).join("\n"));
  }
  if (data.surveys?.length) {
    parts.push("=== ENCUESTAS ===\n" + data.surveys.map(s => `- ${s.titulo}: ${s.resultados || s.objetivo}`).join("\n"));
  }
  if (data.focusGroups?.length) {
    parts.push("=== FOCUS GROUPS ===\n" + data.focusGroups.map(fg => `- ${fg.nombre}: ${fg.conclusiones}`).join("\n"));
  }
  if (data.docs?.length) {
    parts.push("=== ANÁLISIS DE DOCUMENTOS ===\n" + data.docs.map(d => `- ${d.titulo} (${d.tipo}): ${d.resumen}`).join("\n"));
  }
  return parts.length ? parts.join("\n\n") : "- Sin datos de investigación registrados.";
}

function buildPromptText({ projectName, projectDescription, selections, data, synthesis }) {
  const sections = {
    project: `Proyecto: ${projectName}\nDescripción: ${projectDescription}`,
    stack: `Stack: ${selections.backend}, ${selections.frontend}, ${selections.database}`,
    auth: buildAuthConfig(selections.auth, data.roles),
    fileStructure: buildFileStructure(selections.backend, selections.frontend, selections.database, data.modules),
    permissionMatrix: buildPermissionMatrix(synthesis?.permissionMatrix),
    research: buildResearchSummary(data),
    stakeholders: `Stakeholders:\n${safeArray(data.stakeholders).map(s => `- ${s.nombre} (${s.tipo})`).join("\n")}`,
    roles: `Roles:\n${safeArray(data.roles).map(r => `- ${r.nombre}: ${r.descripcion}`).join("\n")}`,
    functions: `Funciones:\n${safeArray(data.functions).map(f => `- ${f.nombre} [Módulo: ${f.moduloId}]`).join("\n")}`,
    modules: `Módulos:\n${safeArray(data.modules).map(m => `- ${m.nombre}: ${m.descripcion}`).join("\n")}`,
    requirements: `Historias de Usuario:\n${safeArray(data.stories).map(s => `- ${s.titulo}: Como ${s.como} -> Quiero ${s.quiero} -> Para ${s.paraQue}`).join("\n")}`,
    diagrams: `Diagramas UML (Mermaid):\n${safeArray(data.diagrams).map(d => `### ${d.nombre} (${d.tipo})\n\`\`\`mermaid\n${generateMermaid(d)}\n\`\`\``).join("\n\n")}`,
    implementationPlan: buildImplementationPlan(data.modules),
    instructions: "Eres un desarrollador senior. Basado en TODA la información anterior (incluyendo los diagramas Mermaid y los resultados de las entrevistas), genera una propuesta técnica completa y modular.",
  };

  return SECTION_ORDER.map(k => `## ${k.toUpperCase()}\n${sections[k]}`).join("\n\n");
}

function TechPicker({ title, icon: Icon, options, value, onChange }) {
  return (
    <div className="apple-glass-card p-4 bg-white border-white/50 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "text-left p-3 rounded-xl border text-xs transition-all",
              opt.id === value 
                ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100" 
                : "bg-slate-50/30 border-slate-100 hover:bg-white"
            )}
          >
            <div className="font-bold text-slate-800">{opt.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GeneradorPrompt() {
  const { currentProject } = useProjects();
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [copied, setCopied] = useState(false);
  const [projectName, setProjectName] = useState("Proyecto HERMAN_8");
  const [projectDescription, setProjectDescription] = useState("");
  const [selections, setSelections] = useState(DEFAULT_SELECTIONS);
  const [synthesis, setSynthesis] = useState(null);
  const [data, setData] = useState({ stakeholders: [], roles: [], functions: [], modules: [], stories: [], diagrams: [] });

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name || projectName);
      setProjectDescription(currentProject.description || projectDescription);
    }
  }, [currentProject]);

  useEffect(() => {
    async function load() {
      try {
        const [stakeholders, roles, functions, modules, stories, diagrams, interviews, surveys, focusGroups, docs] = await Promise.all([
          entities.Stakeholder.list(), entities.Role.list(), entities.Funcion.list(),
          entities.Modulo.list(), entities.HistoriaUsuario.list(), entities.Diagrama.list(),
          entities.Entrevista.list(), entities.Encuesta.list(), entities.FocusGroup.list(),
          entities.AnalisisDocumento.list()
        ]);
        setData({ stakeholders, roles, functions, modules, stories, diagrams, interviews, surveys, focusGroups, docs });
        const res = await fetch('http://localhost:3001/api/prompt/synthesis');
        if (res.ok) setSynthesis(await res.json());
      } catch (e) { console.error(e); }
    }
    load();
  }, []);

  const regeneratePrompt = () => {
    setIsGenerating(true);
    const text = buildPromptText({ projectName, projectDescription, selections, data, synthesis });
    setPromptText(text);
    setTimeout(() => setIsGenerating(false), 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!promptText) return;
    const blob = new Blob([promptText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Prompt_${projectName.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-20">
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-sm sticky top-0 z-50 rounded-2xl mb-8">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generador de prompt</h1>
              <p className="text-xs text-slate-500 font-medium">Consolida tu levantamiento de requerimientos</p>
            </div>
          </div>
          <Button onClick={regeneratePrompt} disabled={isGenerating} className="bg-indigo-600 text-white hover:bg-indigo-700 px-8">
            <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
            {isGenerating ? "Generando..." : "Sincronizar y Generar"}
          </Button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="apple-glass-card p-6 bg-white relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Estado del Proyecto</h3>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="text-4xl font-black text-slate-900">{synthesis?.completionScore?.percentage || 0}%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Nivel de Madurez</div>
                </div>
                <div className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase", (synthesis?.completionScore?.percentage || 0) >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {(synthesis?.completionScore?.percentage || 0) >= 80 ? "Listo para IA" : "En progreso"}
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-indigo-600 transition-all duration-1000" style={{ width: `${synthesis?.completionScore?.percentage || 0}%` }} />
              </div>
            </div>

            <div className="apple-glass-card p-6 bg-white space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Metadata</h3>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} className="text-xs font-bold h-10" placeholder="Nombre" />
              <Input value={projectDescription} onChange={e => setProjectDescription(e.target.value)} className="text-xs h-10" placeholder="Descripción" />
            </div>

            <div className="space-y-4">
              <TechPicker title="Autenticación" icon={ShieldCheck} options={AUTH_OPTIONS} value={selections.auth} onChange={v => setSelections(s => ({ ...s, auth: v }))} />
              <TechPicker title="Backend" icon={Server} options={BACKEND_OPTIONS} value={selections.backend} onChange={v => setSelections(s => ({ ...s, backend: v }))} />
              <TechPicker title="Frontend" icon={Layout} options={FRONTEND_OPTIONS} value={selections.frontend} onChange={v => setSelections(s => ({ ...s, frontend: v }))} />
              <TechPicker title="Database" icon={Database} options={DATABASE_OPTIONS} value={selections.database} onChange={v => setSelections(s => ({ ...s, database: v }))} />
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <div className="apple-glass-card bg-white/70 border-white/60 shadow-lg flex flex-col flex-1 min-h-[750px] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/50 bg-white/40">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300" /><div className="w-3 h-3 rounded-full bg-slate-300" /><div className="w-3 h-3 rounded-full bg-slate-300" /></div>
                  <span className="text-xs font-medium text-slate-600 ml-4">Prompt Maestro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleDownload} disabled={!promptText} className="h-8 text-xs text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent px-4">
                    <Download className="w-4 h-4 mr-1.5" /> Descargar .md
                  </Button>
                  <Button variant="ghost" onClick={handleCopy} disabled={!promptText} className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent px-4">
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {copied ? "¡Copiado!" : "Copiar todo"}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 relative bg-white/50">
                {promptText ? (
                  <textarea
                    value={promptText}
                    readOnly
                    className="w-full h-full min-h-[700px] resize-none border-0 bg-transparent p-8 text-sm font-mono leading-relaxed text-slate-700 outline-none scrollbar-thin"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <Bot className="w-16 h-16 mb-4 text-slate-300" />
                    <p className="font-medium text-slate-500">Haz clic en Sincronizar y Generar para crear el prompt.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}