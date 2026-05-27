import express from 'express';
import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const parseFields = (row) => {
  if (!row) return row;
  try { row.stakeholderIds = JSON.parse(row.stakeholderIds || '[]'); } catch (e) { row.stakeholderIds = []; }
  try { row.funcionIds = JSON.parse(row.funcionIds || '[]'); } catch (e) { row.funcionIds = []; }
  try { row.dataFiles = JSON.parse(row.dataFiles || '[]'); } catch (e) { row.dataFiles = []; }
  return row;
};

router.get('/', (req, res) => {
  try {
    const seguimientos = db.prepare('SELECT * FROM seguimientos_transaccionales ORDER BY fechaCreacion DESC').all();
    res.json(seguimientos.map(parseFields));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const seguimiento = db.prepare('SELECT * FROM seguimientos_transaccionales WHERE id = ?').get(req.params.id);
    if (!seguimiento) return res.status(404).json({ error: 'Seguimiento not found' });
    res.json(parseFields(seguimiento));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { 
      titulo, descripcion, transacciones, actores, flujo, excepciones,
      sistema, tipoTransaccion, periodoInicio, periodoFin, fuenteDatos, objetivo,
      stakeholderIds = [], funcionIds = [], dataFiles = [], patrones, frecuencias,
      cuellos, reglas, conclusiones
    } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO seguimientos_transaccionales (
        id, titulo, descripcion, transacciones, actores, flujo, excepciones,
        sistema, tipoTransaccion, periodoInicio, periodoFin, fuenteDatos, objetivo,
        stakeholderIds, funcionIds, dataFiles, patrones, frecuencias,
        cuellos, reglas, conclusiones, fechaCreacion, fechaActualizacion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, titulo, descripcion || null, transacciones || null, actores || null, flujo || null, excepciones || null,
      sistema || null, tipoTransaccion || null, periodoInicio || null, periodoFin || null, fuenteDatos || null, objetivo || null,
      JSON.stringify(stakeholderIds), JSON.stringify(funcionIds), JSON.stringify(dataFiles), patrones || null, frecuencias || null,
      cuellos || null, reglas || null, conclusiones || null, now, now
    );

    res.status(201).json({ id, titulo, fechaCreacion: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { 
      titulo, descripcion, transacciones, actores, flujo, excepciones,
      sistema, tipoTransaccion, periodoInicio, periodoFin, fuenteDatos, objetivo,
      stakeholderIds = [], funcionIds = [], dataFiles = [], patrones, frecuencias,
      cuellos, reglas, conclusiones
    } = req.body;
    const now = new Date().toISOString();

    const result = db.prepare(`
      UPDATE seguimientos_transaccionales 
      SET titulo = ?, descripcion = ?, transacciones = ?, actores = ?, flujo = ?, excepciones = ?,
          sistema = ?, tipoTransaccion = ?, periodoInicio = ?, periodoFin = ?, fuenteDatos = ?, objetivo = ?,
          stakeholderIds = ?, funcionIds = ?, dataFiles = ?, patrones = ?, frecuencias = ?,
          cuellos = ?, reglas = ?, conclusiones = ?, fechaActualizacion = ?
      WHERE id = ?
    `).run(
      titulo, descripcion || null, transacciones || null, actores || null, flujo || null, excepciones || null,
      sistema || null, tipoTransaccion || null, periodoInicio || null, periodoFin || null, fuenteDatos || null, objetivo || null,
      JSON.stringify(stakeholderIds), JSON.stringify(funcionIds), JSON.stringify(dataFiles), patrones || null, frecuencias || null,
      cuellos || null, reglas || null, conclusiones || null, now, req.params.id
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Seguimiento not found' });
    res.json(parseFields(db.prepare('SELECT * FROM seguimientos_transaccionales WHERE id = ?').get(req.params.id)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM seguimientos_transaccionales WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Seguimiento not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
