import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const entrevistas = db.prepare('SELECT * FROM entrevistas ORDER BY fechaCreacion DESC').all();
    
    // For each interview, load related stakeholders and functions
    const result = entrevistas.map(entrevista => {
      const stakeholderIds = db.prepare('SELECT stakeholderId FROM entrevista_stakeholders WHERE entrevistaId = ?').all(entrevista.id).map(r => r.stakeholderId);
      const funcionIds = db.prepare('SELECT funcionId FROM entrevista_funciones WHERE entrevistaId = ?').all(entrevista.id).map(r => r.funcionId);
      return { ...entrevista, stakeholderIds, funcionIds };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const entrevista = db.prepare('SELECT * FROM entrevistas WHERE id = ?').get(req.params.id);
    if (!entrevista) return res.status(404).json({ error: 'Entrevista not found' });
    
    const stakeholderIds = db.prepare('SELECT stakeholderId FROM entrevista_stakeholders WHERE entrevistaId = ?').all(req.params.id).map(r => r.stakeholderId);
    const funcionIds = db.prepare('SELECT funcionId FROM entrevista_funciones WHERE entrevistaId = ?').all(req.params.id).map(r => r.funcionId);
    
    res.json({ ...entrevista, stakeholderIds, funcionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { 
      titulo, stakeholderId, tipoEntrevista, objetivo, descripcion, 
      preguntas, respuestas, fecha, entrevistador, entrevistado, 
      area, duracion, consentimiento, estado, transcripcion, 
      resumen, hallazgos, requisitos, observaciones, riesgos, notas,
      stakeholderIds = [], funcionIds = []
    } = req.body;
    
    const id = uuidv4();
    const now = new Date().toISOString();

    db.transaction(() => {
      db.prepare(`
        INSERT INTO entrevistas (
          id, titulo, stakeholderId, tipoEntrevista, objetivo, descripcion, 
          preguntas, respuestas, fecha, entrevistador, entrevistado, 
          area, duracion, consentimiento, estado, transcripcion, 
          resumen, hallazgos, requisitos, observaciones, riesgos, notas,
          fechaCreacion, fechaActualizacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, titulo, stakeholderId || null, tipoEntrevista || null, objetivo || null, descripcion || null,
        preguntas || null, respuestas || null, fecha || null, entrevistador || null, entrevistado || null,
        area || null, duracion || null, consentimiento ? 1 : 0, estado || 'borrador', transcripcion || null,
        resumen || null, hallazgos || null, requisitos || null, observaciones || null, riesgos || null, notas || null,
        now, now
      );

      stakeholderIds.forEach(sid => {
        db.prepare('INSERT INTO entrevista_stakeholders (entrevistaId, stakeholderId) VALUES (?, ?)').run(id, sid);
      });

      funcionIds.forEach(fid => {
        db.prepare('INSERT INTO entrevista_funciones (entrevistaId, funcionId) VALUES (?, ?)').run(id, fid);
      });
    });

    res.status(201).json({ id, titulo, fechaCreacion: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { 
      titulo, stakeholderId, tipoEntrevista, objetivo, descripcion, 
      preguntas, respuestas, fecha, entrevistador, entrevistado, 
      area, duracion, consentimiento, estado, transcripcion, 
      resumen, hallazgos, requisitos, observaciones, riesgos, notas,
      stakeholderIds = [], funcionIds = []
    } = req.body;
    
    const now = new Date().toISOString();

    db.transaction(() => {
      const result = db.prepare(`
        UPDATE entrevistas 
        SET titulo = ?, stakeholderId = ?, tipoEntrevista = ?, objetivo = ?, descripcion = ?, 
            preguntas = ?, respuestas = ?, fecha = ?, entrevistador = ?, entrevistado = ?, 
            area = ?, duracion = ?, consentimiento = ?, estado = ?, transcripcion = ?, 
            resumen = ?, hallazgos = ?, requisitos = ?, observaciones = ?, riesgos = ?, notas = ?,
            fechaActualizacion = ?
        WHERE id = ?
      `).run(
        titulo, stakeholderId || null, tipoEntrevista || null, objetivo || null, descripcion || null,
        preguntas || null, respuestas || null, fecha || null, entrevistador || null, entrevistado || null,
        area || null, duracion || null, consentimiento ? 1 : 0, estado || 'borrador', transcripcion || null,
        resumen || null, hallazgos || null, requisitos || null, observaciones || null, riesgos || null, notas || null,
        now, req.params.id
      );

      if (result.changes === 0) throw new Error('Entrevista not found');

      // Update many-to-many
      db.prepare('DELETE FROM entrevista_stakeholders WHERE entrevistaId = ?').run(req.params.id);
      db.prepare('DELETE FROM entrevista_funciones WHERE entrevistaId = ?').run(req.params.id);

      stakeholderIds.forEach(sid => {
        db.prepare('INSERT INTO entrevista_stakeholders (entrevistaId, stakeholderId) VALUES (?, ?)').run(req.params.id, sid);
      });

      funcionIds.forEach(fid => {
        db.prepare('INSERT INTO entrevista_funciones (entrevistaId, funcionId) VALUES (?, ?)').run(req.params.id, fid);
      });
    });

    res.json({ id: req.params.id, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM entrevistas WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Entrevista not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
