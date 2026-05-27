import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const parseFields = (row) => {
  if (!row) return row;
  try { row.stakeholderIds = JSON.parse(row.stakeholderIds || '[]'); } catch (e) { row.stakeholderIds = []; }
  try { row.funcionIds = JSON.parse(row.funcionIds || '[]'); } catch (e) { row.funcionIds = []; }
  try { row.resultadosFiles = JSON.parse(row.resultadosFiles || '[]'); } catch (e) { row.resultadosFiles = []; }
  return row;
};

router.get('/', (req, res) => {
  try {
    const encuestas = db.prepare('SELECT * FROM encuestas ORDER BY fechaCreacion DESC').all();
    res.json(encuestas.map(parseFields));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const encuesta = db.prepare('SELECT * FROM encuestas WHERE id = ?').get(req.params.id);
    if (!encuesta) return res.status(404).json({ error: 'Encuesta not found' });
    res.json(parseFields(encuesta));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { 
      titulo, objetivo, plataforma, fechaLanzamiento, fechaCierre, 
      numeroRespuestas, urlEncuesta, estado, stakeholderIds = [], 
      funcionIds = [], analisisResultados, hallazgos, recomendaciones, 
      resultadosFiles = [] 
    } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO encuestas (
        id, titulo, objetivo, plataforma, fechaLanzamiento, fechaCierre, 
        numeroRespuestas, urlEncuesta, estado, stakeholderIds, 
        funcionIds, analisisResultados, hallazgos, recomendaciones, 
        resultadosFiles, fechaCreacion, fechaActualizacion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, titulo, objetivo || null, plataforma || null, fechaLanzamiento || null, fechaCierre || null,
      numeroRespuestas || 0, urlEncuesta || null, estado || 'creada', 
      JSON.stringify(stakeholderIds), JSON.stringify(funcionIds), 
      analisisResultados || null, hallazgos || null, recomendaciones || null, 
      JSON.stringify(resultadosFiles), now, now
    );

    res.status(201).json({ id, titulo, fechaCreacion: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { 
      titulo, objetivo, plataforma, fechaLanzamiento, fechaCierre, 
      numeroRespuestas, urlEncuesta, estado, stakeholderIds = [], 
      funcionIds = [], analisisResultados, hallazgos, recomendaciones, 
      resultadosFiles = [] 
    } = req.body;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE encuestas 
      SET titulo = ?, objetivo = ?, plataforma = ?, fechaLanzamiento = ?, fechaCierre = ?, 
          numeroRespuestas = ?, urlEncuesta = ?, estado = ?, stakeholderIds = ?, 
          funcionIds = ?, analisisResultados = ?, hallazgos = ?, recomendaciones = ?, 
          resultadosFiles = ?, fechaActualizacion = ?
      WHERE id = ?
    `).run(
      titulo, objetivo || null, plataforma || null, fechaLanzamiento || null, fechaCierre || null,
      numeroRespuestas || 0, urlEncuesta || null, estado || 'creada', 
      JSON.stringify(stakeholderIds), JSON.stringify(funcionIds), 
      analisisResultados || null, hallazgos || null, recomendaciones || null, 
      JSON.stringify(resultadosFiles), now, req.params.id
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Encuesta not found' });
    res.json(parseFields(db.prepare('SELECT * FROM encuestas WHERE id = ?').get(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM encuestas WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Encuesta not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
