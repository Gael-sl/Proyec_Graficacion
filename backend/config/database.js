import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'herman.db');

let sqlDb = null;

// Wrapper to make sql.js API compatible with better-sqlite3
class DatabaseWrapper {
  constructor(sqlDb) {
    this.sqlDb = sqlDb;
  }

  prepare(sql) {
    const db = this.sqlDb;
    const wrapper = this;
    return {
      run: (...params) => {
        try {
          db.run(sql, params);
          // Only save to disk if we're NOT inside a transaction block
          // (the transaction() method will save once at COMMIT)
          if (!wrapper._inTransaction) saveDatabase();
          return { changes: 1 };
        } catch (e) {
          console.error('SQL Error:', e, 'SQL:', sql);
          throw e;
        }
      },
      get: (...params) => {
        try {
          const results = db.exec(sql, params);
          if (results.length === 0) return undefined;
          const columns = results[0].columns;
          const values = results[0].values[0];
          const row = {};
          columns.forEach((col, i) => {
            row[col] = values[i];
          });
          return row;
        } catch (e) {
          console.error('SQL Error:', e, 'SQL:', sql);
          throw e;
        }
      },
      all: (...params) => {
        try {
          const results = db.exec(sql, params);
          if (results.length === 0) return [];
          const columns = results[0].columns;
          const rows = results[0].values.map(values => {
            const row = {};
            columns.forEach((col, i) => {
              row[col] = values[i];
            });
            return row;
          });
          return rows;
        } catch (e) {
          console.error('SQL Error:', e, 'SQL:', sql);
          throw e;
        }
      }
    };
  }

  exec(sql) {
    try {
      this.sqlDb.run(sql);
      saveDatabase();
    } catch (e) {
      console.error('SQL Error:', e, 'SQL:', sql);
    }
  }

  transaction(fn) {
    // sql.js works in autocommit mode - each run() is its own transaction.
    // To simulate a transaction, we run BEGIN, set a flag so prepare().run()
    // skips saveDatabase(), then COMMIT and save once at the end.
    this._inTransaction = true;
    try {
      this.sqlDb.run('BEGIN');
      const result = fn();
      this.sqlDb.run('COMMIT');
      this._inTransaction = false;
      saveDatabase();
      return result;
    } catch (e) {
      this._inTransaction = false;
      try { this.sqlDb.run('ROLLBACK'); } catch (_) { /* ignore rollback errors */ }
      console.error('Transaction Error:', e);
      throw e;
    }
  }

  pragma(pragmaStr) {
    // sql.js doesn't support pragma, just ignore
  }
}

// Initialize database
export async function initDatabase() {
  if (sqlDb) return;
  
  const SQL = await initSqlJs();
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing DB or create new
  let filebuffer;
  if (fs.existsSync(dbPath)) {
    filebuffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(filebuffer);
  } else {
    sqlDb = new SQL.Database();
  }
}

// Save database to file
export function saveDatabase() {
  if (!sqlDb) return;
  try {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

// Get wrapped database instance
export function getDatabase() {
  if (!sqlDb) {
    throw new Error('Database not initialized');
  }
  return new DatabaseWrapper(sqlDb);
}

let wrapperInstance = null;

// Lazy-loading proxy that initializes on first use
export const db = new Proxy({}, {
  get(target, prop) {
    if (!sqlDb) {
      return undefined;
    }
    if (!wrapperInstance) {
      wrapperInstance = new DatabaseWrapper(sqlDb);
    }
    const val = wrapperInstance[prop];
    if (typeof val === 'function') {
      return val.bind(wrapperInstance);
    }
    return val;
  }
});

// Initialize tables
export function initializeDatabase() {
  const wrapper = getDatabase();

  const statements = [
    `CREATE TABLE IF NOT EXISTS stakeholders (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      rol TEXT,
      email TEXT,
      organizacion TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      nivel TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS funciones (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      prioridad TEXT,
      estado TEXT,
      responsableId TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS modulos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      version TEXT,
      estado TEXT,
      responsableId TEXT,
      funcionalidades TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS historias_usuario (
      id TEXT PRIMARY KEY,
      idHistoria TEXT,
      titulo TEXT NOT NULL,
      como TEXT,
      quiero TEXT,
      paraQue TEXT,
      descripcion TEXT,
      aceptacion TEXT,
      criteriosAceptacion TEXT,
      prioridad TEXT,
      estimacion TEXT,
      estado TEXT,
      comentarios TEXT,
      dependencias TEXT,
      funcionId TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS analisis_documentos (
      id TEXT PRIMARY KEY,
      tipoDocumento TEXT,
      nombreDocumento TEXT NOT NULL,
      fuente TEXT,
      autor TEXT,
      fechaDocumento TEXT,
      version TEXT,
      proposito TEXT,
      extractos TEXT,
      requisitos TEXT,
      restricciones TEXT,
      suposiciones TEXT,
      riesgos TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS encuestas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      preguntas TEXT,
      respuestas TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS entrevistas (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      stakeholderId TEXT,
      tipoEntrevista TEXT,
      objetivo TEXT,
      descripcion TEXT,
      preguntas TEXT,
      respuestas TEXT,
      fecha TEXT,
      entrevistador TEXT,
      entrevistado TEXT,
      area TEXT,
      duracion TEXT,
      consentimiento INTEGER,
      estado TEXT,
      transcripcion TEXT,
      resumen TEXT,
      hallazgos TEXT,
      requisitos TEXT,
      observaciones TEXT,
      riesgos TEXT,
      notas TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS focus_groups (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      participantes TEXT,
      temas TEXT,
      resultados TEXT,
      fecha TEXT,
      notas TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS seguimientos_transaccionales (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      transacciones TEXT,
      actores TEXT,
      flujo TEXT,
      excepciones TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS diagramas (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      funcionId TEXT,
      contenido TEXT,
      fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP,
      fechaActualizacion TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    // Pivot tables for many-to-many relationships
    `CREATE TABLE IF NOT EXISTS entrevista_stakeholders (
      entrevistaId TEXT,
      stakeholderId TEXT,
      PRIMARY KEY (entrevistaId, stakeholderId)
    )`,
    `CREATE TABLE IF NOT EXISTS entrevista_funciones (
      entrevistaId TEXT,
      funcionId TEXT,
      PRIMARY KEY (entrevistaId, funcionId)
    )`,
    `CREATE TABLE IF NOT EXISTS historia_stakeholders (
      historiaId TEXT,
      stakeholderId TEXT,
      PRIMARY KEY (historiaId, stakeholderId)
    )`,
    `CREATE TABLE IF NOT EXISTS historia_funciones (
      historiaId TEXT,
      funcionId TEXT,
      PRIMARY KEY (historiaId, funcionId)
    )`,
    `CREATE TABLE IF NOT EXISTS analisis_documento_stakeholders (
      analisisDocumentoId TEXT,
      stakeholderId TEXT,
      PRIMARY KEY (analisisDocumentoId, stakeholderId)
    )`,
    `CREATE TABLE IF NOT EXISTS analisis_documento_funciones (
      analisisDocumentoId TEXT,
      funcionId TEXT,
      PRIMARY KEY (analisisDocumentoId, funcionId)
    )`
  ];

  statements.forEach(stmt => {
    wrapper.exec(stmt);
  });

  // Insert default roles if not exist
  try {
    const rolesExist = wrapper.prepare('SELECT COUNT(*) as count FROM roles').get();
    if (rolesExist && rolesExist.count === 0) {
      const now = new Date().toISOString();
      const roles = [
        ['role-sponsor', 'Sponsor', 'Patrocinador ejecutivo del proyecto', 'estrategico'],
        ['role-po', 'Product Owner', 'Define y prioriza el valor del producto', 'tactico'],
        ['role-ba', 'Analista de negocio', 'Modela requerimientos y procesos', 'tactico'],
        ['role-tl', 'Lider tecnico', 'Supervisa la arquitectura y decisiones tecnicas', 'tactico'],
        ['role-dev', 'Desarrollador', 'Implementa la solución y sus componentes', 'operativo'],
        ['role-qa', 'Tester', 'Valida la calidad y pruebas del sistema', 'operativo'],
        ['role-user', 'Usuario final', 'Consume y evalua la solución entregada', 'operativo']
      ];

      roles.forEach(([id, nombre, descripcion, nivel]) => {
        wrapper.prepare(
          'INSERT INTO roles (id, nombre, descripcion, nivel, fechaCreacion, fechaActualizacion) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, nombre, descripcion, nivel, now, now);
      });
    }
  } catch (e) {
    // Roles might already exist
  }

  console.log('✓ Database initialized');
}
