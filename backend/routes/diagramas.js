import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();
const SUPPORTED_TYPES = new Set(['class', 'package', 'sequence', 'usecase']);

function getExpectedShapeByType(tipo) {
  if (tipo === 'class') return ['classes', 'relationships', 'interfaces', 'enums'];
  if (tipo === 'package') return ['packages', 'dependencies', 'imports', 'notes'];
  if (tipo === 'sequence') return ['actors', 'messages', 'fragments', 'notes', 'activations'];
  if (tipo === 'usecase') return ['actors', 'useCases', 'associations', 'systemBoundary'];
  return [];
}

function buildMetadata(base = {}, tipo) {
  const now = new Date().toISOString();
  return {
    version: typeof base.version === 'string' && base.version.trim() ? base.version : '1.0',
    language: typeof base.language === 'string' && base.language.trim() ? base.language : 'es-MX',
    author: typeof base.author === 'string' ? base.author.trim() : '',
    source: typeof base.source === 'string' ? base.source.trim() : 'manual',
    assumptions: Array.isArray(base.assumptions) ? base.assumptions : [],
    constraints: Array.isArray(base.constraints) ? base.constraints : [],
    businessRules: Array.isArray(base.businessRules) ? base.businessRules : [],
    acceptanceCriteria: Array.isArray(base.acceptanceCriteria) ? base.acceptanceCriteria : [],
    updatedAt: now,
    diagramType: tipo
  };
}

function validateAndNormalizeContent(tipo, contenido = {}) {
  if (typeof contenido !== 'object' || Array.isArray(contenido) || contenido === null) {
    throw new Error('El contenido debe ser un objeto JSON válido');
  }

  const requiredKeys = getExpectedShapeByType(tipo);
  const normalized = { ...contenido };

  requiredKeys.forEach((key) => {
    if (normalized[key] === undefined) {
      normalized[key] = key === 'systemBoundary' ? {} : [];
    }
  });

  requiredKeys.forEach((key) => {
    if (key === 'systemBoundary') {
      if (normalized[key] && typeof normalized[key] !== 'object') {
        throw new Error(`La propiedad "${key}" debe ser un objeto`);
      }
      return;
    }
    if (!Array.isArray(normalized[key])) {
      throw new Error(`La propiedad "${key}" debe ser un arreglo`);
    }
  });

  normalized.metadata = buildMetadata(normalized.metadata, tipo);
  return normalized;
}

function parseStoredDiagram(diagrama) {
  if (diagrama.contenido) {
    try {
      diagrama.contenido = JSON.parse(diagrama.contenido);
    } catch (e) {
      // Leave as string if can't parse
    }
  }
  return diagrama;
}

router.get('/', (req, res) => {
  try {
    const diagramas = db.prepare('SELECT * FROM diagramas ORDER BY fechaCreacion DESC').all();
    const diagramasContenido = diagramas.map(parseStoredDiagram);

    res.json(diagramasContenido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/build-prompt', (req, res) => {
  try {
    const diagrams = db.prepare('SELECT * FROM diagramas ORDER BY tipo ASC, fechaActualizacion DESC').all();
    const parsed = diagrams.map(parseStoredDiagram);

    const grouped = {
      class: parsed.filter(d => d.tipo === 'class'),
      package: parsed.filter(d => d.tipo === 'package'),
      sequence: parsed.filter(d => d.tipo === 'sequence'),
      usecase: parsed.filter(d => d.tipo === 'usecase')
    };

    const metadataSummary = parsed.map((d) => ({
      id: d.id,
      tipo: d.tipo,
      nombre: d.nombre,
      metadata: d.contenido?.metadata || {}
    }));

    const prompt = [
      'Actua como arquitecto y desarrollador senior.',
      'Genera especificaciones tecnicas y una propuesta de implementacion basada en estos diagramas UML.',
      '',
      'Reglas:',
      '- Conserva trazabilidad entre casos de uso, clases, secuencias y paquetes.',
      '- Detecta inconsistencias y propon correcciones.',
      '- Entrega: resumen funcional, entidades, APIs, flujo principal y pruebas recomendadas.',
      '',
      'Diagramas (JSON):',
      JSON.stringify(grouped, null, 2),
      '',
      'Metadatos de especificacion:',
      JSON.stringify(metadataSummary, null, 2)
    ].join('\n');

    res.json({
      totalDiagramas: parsed.length,
      porTipo: {
        class: grouped.class.length,
        package: grouped.package.length,
        sequence: grouped.sequence.length,
        usecase: grouped.usecase.length
      },
      prompt,
      diagrams: grouped,
      metadataSummary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const diagrama = db.prepare('SELECT * FROM diagramas WHERE id = ?').get(req.params.id);
    if (!diagrama) {
      return res.status(404).json({ error: 'Diagrama not found' });
    }

    res.json(parseStoredDiagram(diagrama));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { id, tipo, nombre, descripcion, funcionId, contenido } = req.body;
    if (!SUPPORTED_TYPES.has(tipo)) {
      return res.status(400).json({ error: 'Tipo de diagrama no soportado' });
    }

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'El nombre del diagrama es requerido' });
    }

    const contenidoNormalizado = validateAndNormalizeContent(tipo, contenido || {});
    const diagramId = id || `${tipo || 'diagram'}-${Date.now()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO diagramas (id, tipo, nombre, descripcion, funcionId, contenido, fechaCreacion, fechaActualizacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const contenidoJSON = JSON.stringify(contenidoNormalizado);
    stmt.run(diagramId, tipo, nombre, descripcion || null, funcionId || null, contenidoJSON, now, now);

    res.status(201).json({
      id: diagramId,
      tipo,
      nombre,
      descripcion,
      funcionId,
      contenido: contenidoNormalizado,
      fechaCreacion: now,
      fechaActualizacion: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tipo, nombre, descripcion, funcionId, contenido } = req.body;
    if (!SUPPORTED_TYPES.has(tipo)) {
      return res.status(400).json({ error: 'Tipo de diagrama no soportado' });
    }

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ error: 'El nombre del diagrama es requerido' });
    }

    const contenidoNormalizado = validateAndNormalizeContent(tipo, contenido || {});
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE diagramas
      SET tipo = ?, nombre = ?, descripcion = ?, funcionId = ?, contenido = ?, fechaActualizacion = ?
      WHERE id = ?
    `);

    const contenidoJSON = JSON.stringify(contenidoNormalizado);
    const result = stmt.run(tipo, nombre, descripcion || null, funcionId || null, contenidoJSON, now, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Diagrama not found' });
    }

    const diagrama = db.prepare('SELECT * FROM diagramas WHERE id = ?').get(req.params.id);
    res.json(parseStoredDiagram(diagrama));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM diagramas WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Diagrama not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;