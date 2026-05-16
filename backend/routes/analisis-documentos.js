import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const documentos = db.prepare(`
      SELECT ad.*, 
             GROUP_CONCAT(s.id) as stakeholderIds, 
             GROUP_CONCAT(f.id) as funcionIds
      FROM analisis_documentos ad
      LEFT JOIN analisis_documento_stakeholders ads ON ad.id = ads.analisisDocumentoId
      LEFT JOIN stakeholders s ON ads.stakeholderId = s.id
      LEFT JOIN analisis_documento_funciones adf ON ad.id = adf.analisisDocumentoId
      LEFT JOIN funciones f ON adf.funcionId = f.id
      GROUP BY ad.id
      ORDER BY ad.fechaCreacion DESC
    `).all();
    
    const result = documentos.map(doc => ({
      ...doc,
      stakeholderIds: doc.stakeholderIds ? doc.stakeholderIds.split(',') : [],
      funcionIds: doc.funcionIds ? doc.funcionIds.split(',') : []
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const documento = db.prepare('SELECT * FROM analisis_documentos WHERE id = ?').get(req.params.id);
    if (!documento) return res.status(404).json({ error: 'Documento not found' });
    
    const stakeholderIds = db.prepare('SELECT stakeholderId FROM analisis_documento_stakeholders WHERE analisisDocumentoId = ?').all(req.params.id).map(r => r.stakeholderId);
    const funcionIds = db.prepare('SELECT funcionId FROM analisis_documento_funciones WHERE analisisDocumentoId = ?').all(req.params.id).map(r => r.funcionId);
    
    res.json({ ...documento, stakeholderIds, funcionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { tipoDocumento, nombreDocumento, fuente, autor, fechaDocumento, version, proposito, extractos, requisitos, restricciones, suposiciones, riesgos, stakeholderIds = [], funcionIds = [] } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.transaction(() => {
      db.prepare(`
        INSERT INTO analisis_documentos (id, tipoDocumento, nombreDocumento, fuente, autor, fechaDocumento, version, proposito, extractos, requisitos, restricciones, suposiciones, riesgos, fechaCreacion, fechaActualizacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, tipoDocumento, nombreDocumento, fuente || null, autor || null, fechaDocumento || null, version || null, proposito || null, extractos || null, requisitos || null, restricciones || null, suposiciones || null, riesgos || null, now, now);

      stakeholderIds.forEach(stakeholderId => {
        db.prepare('INSERT INTO analisis_documento_stakeholders (analisisDocumentoId, stakeholderId) VALUES (?, ?)').run(id, stakeholderId);
      });

      funcionIds.forEach(funcionId => {
        db.prepare('INSERT INTO analisis_documento_funciones (analisisDocumentoId, funcionId) VALUES (?, ?)').run(id, funcionId);
      });
    });

    res.status(201).json({
      id, tipoDocumento, nombreDocumento, fuente, autor, fechaDocumento, version, proposito, extractos, requisitos, restricciones, suposiciones, riesgos, stakeholderIds, funcionIds, fechaCreacion: now, fechaActualizacion: now
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { tipoDocumento, nombreDocumento, fuente, autor, fechaDocumento, version, proposito, extractos, requisitos, restricciones, suposiciones, riesgos, stakeholderIds = [], funcionIds = [] } = req.body;
    const now = new Date().toISOString();

    db.transaction(() => {
      const result = db.prepare(`
        UPDATE analisis_documentos 
        SET tipoDocumento = ?, nombreDocumento = ?, fuente = ?, autor = ?, fechaDocumento = ?, version = ?, proposito = ?, extractos = ?, requisitos = ?, restricciones = ?, suposiciones = ?, riesgos = ?, fechaActualizacion = ?
        WHERE id = ?
      `).run(tipoDocumento, nombreDocumento, fuente || null, autor || null, fechaDocumento || null, version || null, proposito || null, extractos || null, requisitos || null, restricciones || null, suposiciones || null, riesgos || null, now, req.params.id);

      if (result.changes === 0) throw new Error('Documento not found');

      db.prepare('DELETE FROM analisis_documento_stakeholders WHERE analisisDocumentoId = ?').run(req.params.id);
      db.prepare('DELETE FROM analisis_documento_funciones WHERE analisisDocumentoId = ?').run(req.params.id);

      stakeholderIds.forEach(stakeholderId => {
        db.prepare('INSERT INTO analisis_documento_stakeholders (analisisDocumentoId, stakeholderId) VALUES (?, ?)').run(req.params.id, stakeholderId);
      });

      funcionIds.forEach(funcionId => {
        db.prepare('INSERT INTO analisis_documento_funciones (analisisDocumentoId, funcionId) VALUES (?, ?)').run(req.params.id, funcionId);
      });
    });

    transaction();
    const documento = db.prepare('SELECT * FROM analisis_documentos WHERE id = ?').get(req.params.id);
    res.json({ ...documento, stakeholderIds, funcionIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM analisis_documentos WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Documento not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
