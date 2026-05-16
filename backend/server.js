import express from 'express';
import cors from 'cors';
import { initDatabase, initializeDatabase, saveDatabase } from './config/database.js';

// Import routes
import stakeholdersRouter from './routes/stakeholders.js';
import funcionesRouter from './routes/funciones.js';
import modulosRouter from './routes/modulos.js';
import historiasRouter from './routes/historias-usuario.js';
import documentosRouter from './routes/analisis-documentos.js';
import encuestasRouter from './routes/encuestas.js';
import entrevistasRouter from './routes/entrevistas.js';
import focusGroupsRouter from './routes/focus-groups.js';
import seguimientosRouter from './routes/seguimientos-transaccionales.js';
import diagramasRouter from './routes/diagramas.js';
import rolesRouter from './routes/roles.js';
import authRouter from './routes/auth.js';
import promptSynthesisRouter from './routes/prompt-synthesis.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Start server
async function start() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initDatabase();
    initializeDatabase();
    console.log('✓ Database ready');

    // Routes
    app.use('/api/auth', authRouter);
    app.use('/api/entities/Stakeholder', stakeholdersRouter);
    app.use('/api/entities/Funcion', funcionesRouter);
    app.use('/api/entities/Modulo', modulosRouter);
    app.use('/api/entities/HistoriaUsuario', historiasRouter);
    app.use('/api/entities/AnalisisDocumento', documentosRouter);
    app.use('/api/entities/Encuesta', encuestasRouter);
    app.use('/api/entities/Entrevista', entrevistasRouter);
    app.use('/api/entities/FocusGroup', focusGroupsRouter);
    app.use('/api/entities/SeguimientoTransaccional', seguimientosRouter);
    app.use('/api/entities/Role', rolesRouter);
    app.use('/api/entities/Diagrama', diagramasRouter);
    app.use('/api/prompt', promptSynthesisRouter);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Graceful shutdown - save DB
    process.on('SIGINT', () => {
      saveDatabase();
      console.log('\n✓ Database saved on shutdown');
      process.exit(0);
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Backend server running on http://localhost:${PORT}`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api/entities`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
