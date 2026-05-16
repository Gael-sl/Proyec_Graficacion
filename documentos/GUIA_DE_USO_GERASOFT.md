# Guía de Llenado - GeraSoft

Esta guía te ayudará a utilizar el sistema **GeraSoft** de manera estructurada. Si sigues este orden, al llegar al **Generador de Prompts** tendrás un documento maestro rico en contexto, listo para generar código o arquitecturas de forma automatizada.

---

## 1. Configuración Inicial (Metadata)
Antes de empezar a llenar módulos, es importante tener claro de qué trata el proyecto.
- Ve a la página principal o al **Generador de Prompts** y asegúrate de llenar el **Nombre del Proyecto** y una **Descripción** breve pero concisa.
- Selecciona tu *Stack Tecnológico* preferido (Frontend, Backend, y Base de Datos). Esto le dará instrucciones claras a la IA sobre qué lenguajes y frameworks utilizar.

## 2. Personas e Involucrados (Stakeholders y Roles)
El sistema necesita saber *quiénes* interactúan con el software.
1. **Stakeholders**: Ve al apartado de Stakeholders y registra a todas las personas interesadas en el proyecto (ej. Cliente, Gerente, Usuario Final).
2. **Roles**: Crea los roles del sistema (ej. Administrador, Recepcionista, Cliente).
3. **Funciones**: Define qué funciones específicas podrá hacer cada rol dentro del sistema.

> **Tip:** Al llenar esto primero, cuando crees Historias de Usuario será mucho más fácil saber "Quién" hace "Qué".

## 3. Recolección de Datos
Aquí es donde registras la investigación previa que justifica tu proyecto.
- **Entrevistas**: Documenta las reuniones con el cliente. Pon resúmenes de lo que pidieron.
- **Encuestas / Focus Groups**: Si hiciste cuestionarios a usuarios, registra los resultados principales.
- **Análisis de Documentos**: Si el cliente te dio un PDF, un Excel viejo o un manual, regístralo aquí como referencia.

## 4. Requerimientos Estructurales (Módulos e Historias de Usuario)
Esta es la columna vertebral de tu aplicación.
1. **Módulos**: Divide tu sistema en piezas grandes. Ej: *Módulo de Autenticación*, *Módulo de Ventas*, *Módulo de Inventario*.
2. **Historias de Usuario**: Ve a esta sección y crea historias usando la estructura estándar:
   * **Como** [Rol]
   * **Quiero** [Acción]
   * **Para** [Beneficio/Objetivo]

> **Importante:** Asigna cada Historia de Usuario a su Módulo correspondiente. Esto hará que el prompt final se divida de forma lógica y modular.

## 5. Diseño Estructural (Diagramas)
GeraSoft te permite crear la arquitectura en código utilizando **Mermaid.js**.
- Accede a la sección de **Diagramas** (Casos de Uso, Clases, Secuencia, Paquetes).
- Crea diagramas usando la sintaxis de Mermaid. El sistema los previsualizará automáticamente.
- Estos diagramas se inyectarán en el prompt final, permitiendo que la IA entienda la arquitectura exacta y las relaciones en la base de datos.

## 6. Seguimiento y Trazabilidad (Opcional pero recomendado)
- Usa el **Seguimiento Transaccional** para registrar cualquier decisión importante, cambio de rumbo en el proyecto o acuerdo firmado con el cliente.

---

## 7. Generador de Prompts (El Paso Final)
Una vez que hayas llenado toda la información anterior, ve a la sección **Generador de Prompt**.

1. Revisa tu "Nivel de Madurez" en el panel lateral. Debería mostrar un buen porcentaje si llenaste todos los campos anteriores.
2. Haz clic en **Sincronizar y Generar**.
3. El sistema tomará:
   - Tus stakeholders y roles.
   - Tu stack tecnológico seleccionado.
   - Tus módulos e historias de usuario.
   - El código fuente de tus diagramas.
   Y construirá el **Prompt Maestro**.
4. Usa el botón **Descargar .md** para guardar tu archivo localmente y pásaselo a GPT-4, Claude o a tu equipo de desarrollo para que empiecen a codificar con un contexto perfecto.

---
**¡Listo para iniciar las pruebas!** Sigue este flujo con un caso de prueba imaginario (como un sistema de inventario o un consultorio dental) para ver cómo se alimenta el prompt final.
