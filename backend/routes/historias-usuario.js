import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const historias = db.prepare('SELECT * FROM historias_usuario ORDER BY fechaCreacion DESC').all();
    
    const result = historias.map(historia => {
      const stakeholderIds = db.prepare('SELECT stakeholderId FROM historia_stakeholders WHERE historiaId = ?').all(historia.id).map(r => r.stakeholderId);
      const funcionIds = db.prepare('SELECT funcionId FROM historia_funciones WHERE historiaId = ?').all(historia.id).map(r => r.funcionId);
      return { ...historia, stakeholderIds, funcionIds };
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const historia = db.prepare('SELECT * FROM historias_usuario WHERE id = ?').get(req.params.id);
    if (!historia) return res.status(404).json({ error: 'Historia not found' });
    
    const stakeholderIds = db.prepare('SELECT stakeholderId FROM historia_stakeholders WHERE historiaId = ?').all(req.params.id).map(r => r.stakeholderId);
    const funcionIds = db.prepare('SELECT funcionId FROM historia_funciones WHERE historiaId = ?').all(req.params.id).map(r => r.funcionId);
    
    res.json({ ...historia, stakeholderIds, funcionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { 
      idHistoria, titulo, como, quiero, paraQue, 
      descripcion, aceptacion, criteriosAceptacion, 
      prioridad, estimacion, estado, comentarios, 
      dependencias, funcionId, stakeholderIds = [], funcionIds = []
    } = req.body;
    
    const id = uuidv4();
    const now = new Date().toISOString();

    db.transaction(() => {
      db.prepare(`
        INSERT INTO historias_usuario (
          id, idHistoria, titulo, como, quiero, paraQue, 
          descripcion, aceptacion, criteriosAceptacion, 
          prioridad, estimacion, estado, comentarios, 
          dependencias, funcionId, fechaCreacion, fechaActualizacion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, idHistoria || null, titulo, como || null, quiero || null, paraQue || null,
        descripcion || null, aceptacion || null, criteriosAceptacion || null,
        prioridad || 'media', estimacion || null, estado || 'pendiente', comentarios || null,
        dependencias || null, funcionId || null, now, now
      );

      stakeholderIds.forEach(sid => {
        db.prepare('INSERT INTO historia_stakeholders (historiaId, stakeholderId) VALUES (?, ?)').run(id, sid);
      });

      funcionIds.forEach(fid => {
        db.prepare('INSERT INTO historia_funciones (historiaId, funcionId) VALUES (?, ?)').run(id, fid);
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
      idHistoria, titulo, como, quiero, paraQue, 
      descripcion, aceptacion, criteriosAceptacion, 
      prioridad, estimacion, estado, comentarios, 
      dependencias, funcionId, stakeholderIds = [], funcionIds = []
    } = req.body;
    
    const now = new Date().toISOString();

    db.transaction(() => {
      const result = db.prepare(`
        UPDATE historias_usuario 
        SET idHistoria = ?, titulo = ?, como = ?, quiero = ?, paraQue = ?, 
            descripcion = ?, aceptacion = ?, criteriosAceptacion = ?, 
            prioridad = ?, estimacion = ?, estado = ?, comentarios = ?, 
            dependencias = ?, funcionId = ?, fechaActualizacion = ?
        WHERE id = ?
      `).run(
        idHistoria || null, titulo, como || null, quiero || null, paraQue || null,
        descripcion || null, aceptacion || null, criteriosAceptacion || null,
        prioridad || 'media', estimacion || null, estado || 'pendiente', comentarios || null,
        dependencias || null, funcionId || null, now, req.params.id
      );

      if (result.changes === 0) throw new Error('Historia not found');

      db.prepare('DELETE FROM historia_stakeholders WHERE historiaId = ?').run(req.params.id);
      db.prepare('DELETE FROM historia_funciones WHERE historiaId = ?').run(req.params.id);

      stakeholderIds.forEach(sid => {
        db.prepare('INSERT INTO historia_stakeholders (historiaId, stakeholderId) VALUES (?, ?)').run(req.params.id, sid);
      });

      funcionIds.forEach(fid => {
        db.prepare('INSERT INTO historia_funciones (historiaId, funcionId) VALUES (?, ?)').run(req.params.id, fid);
      });
    });

    res.json({ id: req.params.id, message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM historias_usuario WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Historia not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
