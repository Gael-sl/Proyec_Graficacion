// @ts-nocheck
import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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

function buildAuthConfig(authId, roles, credentials = {}) {
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

  // Map variable names to UI entered values or fallbacks
  const getVal = (v) => {
    if (v === "GOOGLE_CLIENT_ID" && credentials.googleClientId) return credentials.googleClientId;
    if (v === "GOOGLE_CLIENT_SECRET" && credentials.googleClientSecret) return credentials.googleClientSecret;
    if (v === "GOOGLE_CALLBACK_URL") return "http://localhost:3000/api/auth/google/callback";
    if (v === "SMTP_USER" && credentials.smtpUser) return credentials.smtpUser;
    if (v === "SMTP_PASS" && credentials.smtpPass) return credentials.smtpPass;
    if (v === "SMTP_HOST") return "smtp.gmail.com";
    if (v === "SMTP_PORT") return "587";
    if (v === "JWT_SECRET") return "super_secret_jwt_key_gerasoft_123456";
    if (v === "JWT_EXPIRES_IN") return "7d";
    if (v === "EMAIL_FROM" && credentials.smtpUser) return credentials.smtpUser;
    if (v === "EMAIL_FROM") return "noreply@demo.com";
    return "reemplazar_con_tu_valor_real";
  };

  return `=== ESTRATEGIA DE AUTENTICACIÓN Y SEGURIDAD: ${authId} ===
Se requiere implementar un sistema de Autenticación y Control de Acceso completo. El agente debe generar el código con las siguientes especificaciones técnicas de producción:

1. ARCHIVO .ENV DE PRODUCCIÓN (CREADO POR EL AGENTE):
DEBES crear directamente el archivo \`.env\` con las variables necesarias para que el sistema funcione. Deja los valores listos para que yo pegue mis credenciales (ejemplo: credenciales de gmail para enviar correos):
\`\`\`env
# Autenticación
${selectedEnvVars.filter(v => !v.startsWith("SMTP") && v !== "EMAIL_FROM").map(v => `${v}="pegar_credencial_aqui"`).join("\n")}

# Configuración de Servidor de Correos (SMTP) para Recuperación de Contraseña
${selectedEnvVars.filter(v => v.startsWith("SMTP") || v === "EMAIL_FROM").map(v => `${v}="pegar_credencial_aqui"`).join("\n")}
\`\`\`

2. FLUJO DE RECUPERACIÓN DE CONTRASEÑA (EMAIL OTP):
INSTRUCCIÓN CRÍTICA: Implementa un flujo completo de "Recuperar Contraseña" funcional:
- El usuario podrá dar clic en "¿Olvidaste tu contraseña?".
- El sistema solicitará su correo y enviará un correo con un token numérico de seguridad temporal (OTP).
- El usuario ingresará el código en la pantalla de verificación para poder definir de forma segura su nueva contraseña.

3. LOGIN HÍBRIDO Y BYPASS DE DESARROLLO:
${isGoogle ? `- MODO HÍBRIDO: Integra el login tradicional (Correo/Contraseña) junto con el botón de "Google Sign-In".
- BYPASS DE SEGURIDAD EN DESARROLLO: Si las credenciales no están configuradas en el \`.env\` local, el sistema debe alertar en consola de desarrollo y permitir un bypass rápido.` : ""}

4. USUARIO ADMINISTRADOR DE PRUEBA (SEEDER):
Crea un script (seeder) de base de datos que inserte un usuario administrador por defecto para poder entrar y probar:
- Correo: dentista@demo.com o dentista (según el login)
- Password: dental123

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

function buildPromptText({ projectName, projectDescription }) {
  return `¡Hola! Eres un Desarrollador Senior y Arquitecto de Software experto.

Te acabo de proveer un archivo ZIP descomprimido con la estructura y contexto de mi nuevo proyecto llamado "${projectName}".

He organizado los requerimientos en las siguientes carpetas para que tengas un contexto claro y modular:
- \`backend/\`: Contiene la configuración de base de datos, arquitectura, roles y estrategias de autenticación y seguridad.
- \`frontend/\`: Contiene el stack UI, las historias de usuario y los módulos a desarrollar.
- \`documentacion/\`: Contiene la investigación de campo y los diagramas UML.
- \`reglas_criticas.md\`: Reglas inquebrantables que debes seguir al generar código para evitar dañar el sistema.

Descripción del Proyecto:
${projectDescription || "Sin descripción proporcionada."}

**Instrucción:**
1. Por favor, lee cuidadosamente el contenido de todos los archivos \`.md\` dentro de esas carpetas.
2. Analiza las \`reglas_criticas.md\` antes de escribir una sola línea de código.
3. Cuando estés listo, confirma que has entendido todo el contexto y propón el primer paso del Plan de Implementación para que comencemos a codificar.`;
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

  // Custom Env Credentials States
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

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
    const text = buildPromptText({ projectName, projectDescription });
    setPromptText(text);
    setTimeout(() => setIsGenerating(false), 300);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!promptText) return;
    setIsGenerating(true);

    const zip = new JSZip();
    const folderName = projectName.replace(/[^a-zA-Z0-9_-]/g, "_") || "Proyecto";
    const root = zip.folder(folderName);

    // Backend
    const backend = root.folder("backend");
    backend.file("1_arquitectura_y_bd.md", `=== ARQUITECTURA Y BASE DE DATOS ===\nStack: ${selections.backend}\nBase de datos: ${selections.database}\n\n${buildFileStructure(selections.backend, selections.frontend, selections.database, data.modules)}`);
    backend.file("2_logica_y_seguridad.md", buildAuthConfig(selections.auth, data.roles, { googleClientId, googleClientSecret, smtpUser, smtpPass }) + "\n\n=== ROLES ===\n" + safeArray(data.roles).map(r => `- ${r.nombre}: ${r.descripcion}`).join("\n") + "\n\n=== MATRIZ DE PERMISOS ===\n" + buildPermissionMatrix(synthesis?.permissionMatrix));

    // Frontend
    const frontend = root.folder("frontend");
    frontend.file("1_stack_y_ui.md", `=== STACK FRONTEND ===\nStack: ${selections.frontend}\n\n=== FUNCIONES ===\n${safeArray(data.functions).map(f => `- ${f.nombre} [Módulo: ${f.moduloId}]`).join("\n")}`);
    frontend.file("2_historias_y_modulos.md", `=== MÓDULOS ===\n${safeArray(data.modules).map(m => `- ${m.nombre}: ${m.descripcion}`).join("\n")}\n\n=== HISTORIAS DE USUARIO ===\n${safeArray(data.stories).map(s => `- ${s.titulo}: Como ${s.como} -> Quiero ${s.quiero} -> Para ${s.paraQue}`).join("\n")}`);

    // Documentacion
    const doc = root.folder("documentacion");
    doc.file("investigacion_y_diagramas.md", `${buildResearchSummary(data)}\n\n=== DIAGRAMAS UML ===\n${safeArray(data.diagrams).map(d => `### ${d.nombre} (${d.tipo})\n\`\`\`mermaid\n${generateMermaid(d)}\n\`\`\``).join("\n\n")}\n\n=== STAKEHOLDERS ===\n${safeArray(data.stakeholders).map(s => `- ${s.nombre} (${s.tipo})`).join("\n")}`);

    // Reglas Críticas
    root.file("reglas_criticas.md", `=== REGLAS CRÍTICAS DE DESARROLLO ===\n1. NO asumas dependencias no mencionadas. Pide confirmación si necesitas librerías externas.\n2. TODO el código debe ser funcional, no omitas funciones con comentarios como "// la lógica va aquí". Escribe la implementación completa.\n3. Asegúrate de manejar errores (Try/Catch) en todas las operaciones asíncronas.\n4. Si el código que generas rompe una funcionalidad existente, provee el plan para solucionarlo inmediatamente.\n5. Sigue el Plan de Implementación paso a paso, no te saltes etapas.`);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${folderName}_Contexto_IA.zip`);
    
    setIsGenerating(false);
  };

  return (
    <div className="pb-20">
      <div className="bg-white/80 backdrop-blur-md border border-white/50 shadow-sm sticky top-0 z-50 rounded-2xl mb-8">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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