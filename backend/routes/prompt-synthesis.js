import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/prompt/synthesis
 * Generates a cross-referenced data synthesis for the prompt generator.
 * Crosses: Stakeholders → Roles → Funciones → Módulos → Historias
 * Returns a structured permission matrix + key requirements matrix.
 */
router.get('/synthesis', (req, res) => {
  try {
    // Load all base entities
    const stakeholders = db.prepare('SELECT * FROM stakeholders').all();
    const roles = db.prepare('SELECT * FROM roles').all();
    const funciones = db.prepare('SELECT * FROM funciones').all();
    const modulos = db.prepare('SELECT * FROM modulos').all();
    const historias = db.prepare('SELECT * FROM historias_usuario').all();
    const diagramas = db.prepare('SELECT * FROM diagramas').all();
    const entrevistas = db.prepare('SELECT * FROM entrevistas').all();

    // --- 1. PERMISSION MATRIX: Roles × Funciones ---
    // Each role is mapped to the functions whose responsableId matches the role ID,
    // OR whose name/description semantically overlaps.
    const permissionMatrix = roles.map(role => {
      // Direct assignment via responsableId
      const directFunctions = funciones.filter(f => f.responsableId === role.id);
      
      // Semantic match: role name appears in function description
      const roleKeywords = (role.nombre + ' ' + (role.descripcion || '')).toLowerCase();
      const semanticFunctions = funciones.filter(f => {
        if (directFunctions.find(df => df.id === f.id)) return false; // avoid duplicates
        const fnWords = (f.nombre + ' ' + (f.descripcion || '')).toLowerCase();
        // Check if any significant word from the role matches function
        const roleWords = roleKeywords.split(/\s+/).filter(w => w.length > 3);
        return roleWords.some(word => fnWords.includes(word));
      });

      const allFunctions = [...directFunctions, ...semanticFunctions];

      // Map functions to modules
      const relatedModuleIds = new Set(allFunctions.map(f => f.moduloId).filter(Boolean));
      const relatedModules = modulos.filter(m => relatedModuleIds.has(m.id));

      // Map functions to user stories
      const relatedStories = historias.filter(h => 
        h.funcionId && allFunctions.find(f => f.id === h.funcionId)
      );

      return {
        role: {
          id: role.id,
          nombre: role.nombre,
          descripcion: role.descripcion,
          nivel: role.nivel,
        },
        funciones: allFunctions.map(f => ({
          id: f.id,
          nombre: f.nombre,
          descripcion: f.descripcion,
          prioridad: f.prioridad,
        })),
        modulos: relatedModules.map(m => ({
          id: m.id,
          nombre: m.nombre,
          descripcion: m.descripcion,
        })),
        historias: relatedStories.map(h => ({
          id: h.id,
          idHistoria: h.idHistoria,
          titulo: h.titulo,
          como: h.como,
          quiero: h.quiero,
          paraQue: h.paraQue,
          criteriosAceptacion: h.criteriosAceptacion,
          prioridad: h.prioridad,
        })),
      };
    });

    // --- 2. STAKEHOLDER → ROLE CROSS ---
    const stakeholderRoleCross = stakeholders.map(sh => {
      // Match by rol field (stakeholder.rol might be a role name)
      const matchedRole = roles.find(r => 
        r.nombre.toLowerCase() === (sh.rol || '').toLowerCase() ||
        r.id === sh.rolId
      );

      return {
        stakeholder: {
          id: sh.id,
          nombre: sh.nombre,
          rol: sh.rol,
          email: sh.email,
          organizacion: sh.organizacion,
        },
        matchedRole: matchedRole ? {
          id: matchedRole.id,
          nombre: matchedRole.nombre,
          nivel: matchedRole.nivel,
        } : null,
      };
    });

    // --- 3. CRITICAL REQUIREMENTS MATRIX ---
    // Find high-priority stories and cross-reference with interviews
    const criticalStories = historias.filter(h => 
      h.prioridad === 'alta' || h.estado === 'validada'
    );

    const storiesWithContext = criticalStories.map(h => {
      // Find interviews that might reference this function
      const relatedInterview = h.funcionId 
        ? entrevistas.find(e => e.requisitos && e.requisitos.includes(h.titulo))
        : null;

      return {
        historia: h,
        evidencia: relatedInterview ? {
          titulo: relatedInterview.titulo,
          entrevistado: relatedInterview.entrevistado,
          hallazgos: relatedInterview.hallazgos,
        } : null,
      };
    });

    // --- 4. DIAGRAM COVERAGE ---
    // Check which entity types have diagrams
    const diagramTypes = [...new Set(diagramas.map(d => d.tipo))];
    const missingDiagramTypes = ['class', 'usecase', 'sequence', 'package']
      .filter(t => !diagramTypes.includes(t));

    const encuestas = db.prepare('SELECT * FROM encuestas').all();
    const focusGroups = db.prepare('SELECT * FROM focus_groups').all();
    const documentos = db.prepare('SELECT * FROM analisis_documentos').all();

    // --- 5. SUMMARY STATS ---
    const completionScore = {
      hasStakeholders: stakeholders.length > 0,
      hasRoles: roles.length > 0,
      hasFunctions: funciones.length > 0,
      hasModules: modulos.length > 0,
      hasStories: historias.length > 0,
      hasInterviews: entrevistas.length > 0,
      hasSurveys: encuestas.length > 0,
      hasFocusGroups: focusGroups.length > 0,
      hasDocs: documentos.length > 0,
      hasDiagrams: diagramas.length > 0,
      hasAllDiagramTypes: missingDiagramTypes.length === 0,
    };
    const score = Object.values(completionScore).filter(Boolean).length;

    res.json({
      permissionMatrix,
      stakeholderRoleCross,
      criticalRequirements: storiesWithContext,
      diagramCoverage: {
        present: diagramTypes,
        missing: missingDiagramTypes,
      },
      completionScore: {
        details: completionScore,
        score,
        maxScore: 11,
        percentage: Math.round((score / 11) * 100),
      },
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
