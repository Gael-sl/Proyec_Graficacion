import { db, initializeDatabase } from '../config/database.js';

// Initialize database tables
initializeDatabase();

console.log('\n=== PRUEBAS DE PERSISTENCIA DE DIAGRAMAS ===\n');

try {
  // Test 1: Crear diagrama de Clases
  console.log('📝 Test 1: Crear diagrama de Clases...');
  const classDiagramId = `class-${Date.now()}`;
  const classContent = {
    classes: [
      {
        id: "c1",
        name: "Usuario",
        description: "Clase de usuario del sistema",
        x: 100,
        y: 100,
        width: 150,
        height: 120,
        attributes: [
          { id: "a1", name: "id", type: "String" },
          { id: "a2", name: "email", type: "String" },
          { id: "a3", name: "password", type: "String" }
        ],
        methods: [
          { id: "m1", name: "login()", type: "void" },
          { id: "m2", name: "logout()", type: "void" }
        ]
      },
      {
        id: "c2",
        name: "Pedido",
        description: "Clase de pedidos",
        x: 350,
        y: 100,
        width: 150,
        height: 120,
        attributes: [
          { id: "a1", name: "id", type: "String" },
          { id: "a2", name: "fecha", type: "Date" },
          { id: "a3", name: "total", type: "Decimal" }
        ],
        methods: [
          { id: "m1", name: "crear()", type: "void" },
          { id: "m2", name: "cancelar()", type: "void" }
        ]
      }
    ],
    relationships: [
      {
        id: "r1",
        from: "c1",
        to: "c2",
        type: "association",
        label: "crea"
      }
    ]
  };

  const stmtClass = db.prepare(`
    INSERT INTO diagramas (id, tipo, nombre, descripcion, contenido, fechaCreacion, fechaActualizacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmtClass.run(classDiagramId, 'class', 'Diagrama de Clases Test', 'Prueba de persistencia', JSON.stringify(classContent), new Date().toISOString(), new Date().toISOString());
  console.log('✅ Diagrama de Clases creado\n');

  // Test 2: Crear diagrama de Casos de Uso
  console.log('📝 Test 2: Crear diagrama de Casos de Uso...');
  const ucDiagramId = `uc-${Date.now()}`;
  const ucContent = {
    actors: [
      {
        id: "a1",
        type: "actor",
        name: "Usuario",
        description: "Usuario del sistema",
        x: 50,
        y: 150
      },
      {
        id: "a2",
        type: "actor",
        name: "Administrador",
        description: "Administrador del sistema",
        x: 600,
        y: 150
      }
    ],
    useCases: [
      {
        id: "uc1",
        type: "usecase",
        name: "Iniciar Sesión",
        description: "El usuario inicia sesión en el sistema",
        x: 250,
        y: 100,
        width: 120,
        height: 80
      },
      {
        id: "uc2",
        type: "usecase",
        name: "Crear Pedido",
        description: "Crear un nuevo pedido",
        x: 250,
        y: 220,
        width: 120,
        height: 80
      }
    ],
    associations: [
      {
        id: "assoc1",
        from: "a1",
        to: "uc1",
        type: "association"
      },
      {
        id: "assoc2",
        from: "a1",
        to: "uc2",
        type: "association"
      }
    ],
    systemBoundary: { x: 200, y: 100, width: 400, height: 300 }
  };

  const stmtUC = db.prepare(`
    INSERT INTO diagramas (id, tipo, nombre, descripcion, contenido, fechaCreacion, fechaActualizacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmtUC.run(ucDiagramId, 'usecase', 'Diagrama de Casos de Uso Test', 'Prueba de persistencia', JSON.stringify(ucContent), new Date().toISOString(), new Date().toISOString());
  console.log('✅ Diagrama de Casos de Uso creado\n');

  // Test 3: Crear diagrama de Secuencia
  console.log('📝 Test 3: Crear diagrama de Secuencia...');
  const seqDiagramId = `seq-${Date.now()}`;
  const seqContent = {
    actors: [
      { id: "a1", name: "Usuario", type: "actor", x: 100 },
      { id: "a2", name: "Sistema", type: "system", x: 300 },
      { id: "a3", name: "Base de Datos", type: "system", x: 500 }
    ],
    messages: [
      { id: "m1", from: "a1", to: "a2", label: "login()", type: "sync", order: 1 },
      { id: "m2", from: "a2", to: "a3", label: "verificar()", type: "sync", order: 2 },
      { id: "m3", from: "a3", to: "a2", label: "datos", type: "return", order: 3 },
      { id: "m4", from: "a2", to: "a1", label: "autenticado", type: "return", order: 4 }
    ]
  };

  const stmtSeq = db.prepare(`
    INSERT INTO diagramas (id, tipo, nombre, descripcion, contenido, fechaCreacion, fechaActualizacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmtSeq.run(seqDiagramId, 'sequence', 'Diagrama de Secuencia Test', 'Prueba de persistencia', JSON.stringify(seqContent), new Date().toISOString(), new Date().toISOString());
  console.log('✅ Diagrama de Secuencia creado\n');

  // Test 4: Crear diagrama de Paquetes
  console.log('📝 Test 4: Crear diagrama de Paquetes...');
  const pkgDiagramId = `pkg-${Date.now()}`;
  const pkgContent = {
    packages: [
      {
        id: "p1",
        name: "com.proyecto.autenticacion",
        description: "Paquete de autenticación",
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        elements: ["Login", "Logout", "VerificarToken"]
      },
      {
        id: "p2",
        name: "com.proyecto.pedidos",
        description: "Paquete de gestión de pedidos",
        x: 350,
        y: 100,
        width: 200,
        height: 150,
        elements: ["CrearPedido", "CancelarPedido", "ListarPedidos"]
      },
      {
        id: "p3",
        name: "com.proyecto.persistencia",
        description: "Paquete de acceso a datos",
        x: 225,
        y: 300,
        width: 200,
        height: 150,
        elements: ["UsuarioDAO", "PedidoDAO"]
      }
    ],
    dependencies: [
      {
        id: "d1",
        from: "p1",
        to: "p3",
        type: "depends"
      },
      {
        id: "d2",
        from: "p2",
        to: "p3",
        type: "depends"
      }
    ],
    imports: []
  };

  const stmtPkg = db.prepare(`
    INSERT INTO diagramas (id, tipo, nombre, descripcion, contenido, fechaCreacion, fechaActualizacion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmtPkg.run(pkgDiagramId, 'package', 'Diagrama de Paquetes Test', 'Prueba de persistencia', JSON.stringify(pkgContent), new Date().toISOString(), new Date().toISOString());
  console.log('✅ Diagrama de Paquetes creado\n');

  // Test 5: Recuperar y verificar todos los diagramas
  console.log('🔍 Test 5: Recuperar diagramas guardados...\n');
  const allDiagrams = db.prepare('SELECT * FROM diagramas ORDER BY fechaCreacion DESC').all();
  
  console.log(`Total de diagramas: ${allDiagrams.length}\n`);

  allDiagrams.forEach((diagram, index) => {
    console.log(`Diagrama ${index + 1}:`);
    console.log(`  ID: ${diagram.id}`);
    console.log(`  Tipo: ${diagram.tipo}`);
    console.log(`  Nombre: ${diagram.nombre}`);
    console.log(`  Descripción: ${diagram.descripcion}`);
    
    if (diagram.contenido) {
      try {
        const contenido = JSON.parse(diagram.contenido);
        console.log(`  ✅ Contenido guardado correctamente`);
        
        if (diagram.tipo === 'class') {
          console.log(`     - Clases: ${contenido.classes?.length || 0}`);
          console.log(`     - Relaciones: ${contenido.relationships?.length || 0}`);
        } else if (diagram.tipo === 'usecase') {
          console.log(`     - Actores: ${contenido.actors?.length || 0}`);
          console.log(`     - Casos de Uso: ${contenido.useCases?.length || 0}`);
          console.log(`     - Asociaciones: ${contenido.associations?.length || 0}`);
        } else if (diagram.tipo === 'sequence') {
          console.log(`     - Actores: ${contenido.actors?.length || 0}`);
          console.log(`     - Mensajes: ${contenido.messages?.length || 0}`);
        } else if (diagram.tipo === 'package') {
          console.log(`     - Paquetes: ${contenido.packages?.length || 0}`);
          console.log(`     - Dependencias: ${contenido.dependencies?.length || 0}`);
        }
      } catch (e) {
        console.log(`  ❌ Error al parsear contenido: ${e.message}`);
      }
    } else {
      console.log(`  ⚠️  No hay contenido guardado`);
    }
    console.log('');
  });

  console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE\n');

} catch (error) {
  console.error('❌ Error en las pruebas:', error.message);
  process.exit(1);
}
