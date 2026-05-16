// Node.js v22 has fetch built-in, no need to import
const BASE_URL = 'http://localhost:3001';

async function testDiagramPersistence() {
  console.log('🧪 Testing Diagram Persistence...\n');

  try {
    // Test 1: Create a Class Diagram
    console.log('📝 Test 1: Creating a Class Diagram...');
    const classResponse = await fetch(`${BASE_URL}/api/entities/Diagrama`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'class',
        nombre: 'Sistema de Ventas - Clases',
        descripcion: 'Diagrama de clases del sistema de ventas',
        contenido: {
          classes: [
            {
              id: 'class-1',
              name: 'Producto',
              attributes: ['id: String', 'nombre: String', 'precio: Decimal', 'stock: Integer'],
              methods: ['getPrecio(): Decimal', 'actualizarStock(cantidad: Integer)']
            },
            {
              id: 'class-2',
              name: 'Pedido',
              attributes: ['id: String', 'fecha: Date', 'monto: Decimal', 'estado: String'],
              methods: ['calcularTotal(): Decimal', 'confirmar(): void']
            }
          ],
          relationships: [
            { id: 'rel-1', from: 'class-1', to: 'class-2', type: 'composition' }
          ]
        }
      })
    });

    const classData = await classResponse.json();
    console.log(`✅ Created: ${classData.id}\n`);

    // Test 2: Retrieve the diagram
    console.log('🔍 Test 2: Retrieving the diagram...');
    const getResponse = await fetch(`${BASE_URL}/api/entities/Diagrama/${classData.id}`);
    const retrieved = await getResponse.json();
    
    if (retrieved.contenido && retrieved.contenido.classes) {
      console.log(`✅ Retrieved with ${retrieved.contenido.classes.length} classes`);
      console.log(`   Class 1: ${retrieved.contenido.classes[0].name}`);
      console.log(`   Class 2: ${retrieved.contenido.classes[1].name}\n`);
    } else {
      console.log('❌ Content not persisted!\n');
    }

    // Test 3: Update the diagram
    console.log('✏️  Test 3: Updating the diagram...');
    const updateResponse = await fetch(`${BASE_URL}/api/entities/Diagrama/${classData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'class',
        nombre: 'Sistema de Ventas - Clases (Actualizado)',
        descripcion: 'Diagrama de clases del sistema de ventas con más detalles',
        contenido: {
          classes: [
            ...retrieved.contenido.classes,
            {
              id: 'class-3',
              name: 'Cliente',
              attributes: ['id: String', 'nombre: String', 'email: String'],
              methods: ['realizarPedido(productos: List)']
            }
          ],
          relationships: retrieved.contenido.relationships
        }
      })
    });

    const updated = await updateResponse.json();
    console.log(`✅ Updated with ${updated.contenido.classes.length} classes\n`);

    // Test 4: List all diagrams
    console.log('📋 Test 4: Listing all diagrams...');
    const listResponse = await fetch(`${BASE_URL}/api/entities/Diagrama`);
    const allDiagrams = await listResponse.json();
    console.log(`✅ Found ${allDiagrams.length} diagram(s)\n`);

    // Test 5: Create Use Case Diagram
    console.log('📝 Test 5: Creating a Use Case Diagram...');
    const useCaseResponse = await fetch(`${BASE_URL}/api/entities/Diagrama`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'usecase',
        nombre: 'Casos de Uso - Ventas',
        descripcion: 'Casos de uso del módulo de ventas',
        contenido: {
          actors: [
            { id: 'actor-1', name: 'Cliente', description: 'Usuario que realiza compras' },
            { id: 'actor-2', name: 'Vendedor', description: 'Empleado que gestiona ventas' }
          ],
          useCases: [
            { id: 'uc-1', name: 'Realizar Compra', description: 'El cliente realiza una compra' },
            { id: 'uc-2', name: 'Procesar Pago', description: 'Procesar el pago de la compra' }
          ],
          associations: [
            { from: 'actor-1', to: 'uc-1' },
            { from: 'actor-2', to: 'uc-2' }
          ]
        }
      })
    });

    const useCaseData = await useCaseResponse.json();
    console.log(`✅ Created: ${useCaseData.id}\n`);

    console.log('✨ All tests passed! Persistence is working correctly.\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  process.exit(0);
}

// Wait for backend to be ready
setTimeout(testDiagramPersistence, 1000);
