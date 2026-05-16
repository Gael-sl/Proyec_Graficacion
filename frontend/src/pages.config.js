/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AnalisisDocumentosDetalle from './pages/AnalisisDocumentosDetalle';
import AnalisisDocumentosListado from './pages/AnalisisDocumentosListado';
import Desarrollo from './pages/Desarrollo';
import Despliegue from './pages/Despliegue';
import Diseno from './pages/Diseno';
import EncuestaDetalle from './pages/EncuestaDetalle';
import EncuestasListado from './pages/EncuestasListado';
import EntrevistasDetalle from './pages/EntrevistasDetalle';
import EntrevistasListado from './pages/EntrevistasListado';
import FocusGroupDetalle from './pages/FocusGroupDetalle';
import FocusGroupListado from './pages/FocusGroupListado';
import HistoriaUsuarioDetalle from './pages/HistoriaUsuarioDetalle';
import HistoriasUsuarioListado from './pages/HistoriasUsuarioListado';
import Home from './pages/Home';
import ProjectsList from './pages/ProjectsList';
import Pruebas from './pages/Pruebas';
import Requerimientos from './pages/Requerimientos';
import ModulosListado from './pages/ModulosListado';
import ModuloDetalle from './pages/ModuloDetalle';
import RolesListado from './pages/RolesListado';
import RoleDetalle from './pages/RoleDetalle';
import SeguimientoTransaccionalDetalle from './pages/SeguimientoTransaccionalDetalle';
import SeguimientoTransaccionalListado from './pages/SeguimientoTransaccionalListado';
import StakeholdersListado from './pages/StakeholdersListado';
import FuncionesListado from './pages/FuncionesListado';
import StakeholderDetalle from './pages/StakeholderDetalle';
import FuncionDetalle from './pages/FuncionDetalle';
import DiagramaSecuencia from './pages/DiagramaSecuencia';
import DiagramaCasosUso from './pages/DiagramaCasosUso';
import DiagramasSecuencia from './pages/DiagramasSecuencia';
import DiagramasCasosUso from './pages/DiagramasCasosUso';
import DiagramaPaquetes from './pages/DiagramaPaquetes';
import DiagramaClases from './pages/DiagramaClases';
import DiagramasClases from './pages/DiagramasClases';
import DiagramasPaquetes from './pages/DiagramasPaquetes';
import GeneradorPrompt from './pages/GeneradorPrompt';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AnalisisDocumentosDetalle": AnalisisDocumentosDetalle,
    "AnalisisDocumentosListado": AnalisisDocumentosListado,
    "Desarrollo": Desarrollo,
    "Despliegue": Despliegue,
    "Diseno": Diseno,
    "EncuestaDetalle": EncuestaDetalle,
    "EncuestasListado": EncuestasListado,
    "EntrevistasDetalle": EntrevistasDetalle,
    "EntrevistasListado": EntrevistasListado,
    "FocusGroupDetalle": FocusGroupDetalle,
    "FocusGroupListado": FocusGroupListado,
    "HistoriaUsuarioDetalle": HistoriaUsuarioDetalle,
    "HistoriasUsuarioListado": HistoriasUsuarioListado,
    "Home": Home,
    "ModulosListado": ModulosListado,
    "ModuloDetalle": ModuloDetalle,
    "RolesListado": RolesListado,
    "RoleDetalle": RoleDetalle,
    "Pruebas": Pruebas,
    "Requerimientos": Requerimientos,
    "SeguimientoTransaccionalDetalle": SeguimientoTransaccionalDetalle,
    "SeguimientoTransaccionalListado": SeguimientoTransaccionalListado,
    "StakeholdersListado": StakeholdersListado,
    "FuncionesListado": FuncionesListado,
    "StakeholderDetalle": StakeholderDetalle,
    "FuncionDetalle": FuncionDetalle,
    "DiagramaSecuencia": DiagramaSecuencia,
    "DiagramaCasosUso": DiagramaCasosUso,
    "DiagramasSecuencia": DiagramasSecuencia,
    "DiagramasCasosUso": DiagramasCasosUso,
    "DiagramaPaquetes": DiagramaPaquetes,
    "DiagramaClases": DiagramaClases,
    "DiagramasClases": DiagramasClases,
    "DiagramasPaquetes": DiagramasPaquetes,
    "GeneradorPrompt": GeneradorPrompt,
    "ProjectsList": ProjectsList,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};