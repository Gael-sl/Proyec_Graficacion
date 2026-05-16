# Datos de Prueba — Sistema de Citas "Consultorio Dental Castillo"
(Archivo estructurado para copiar y pegar directamente en GeraSoft)

---

## 1. Módulos
Crea estos registros en la sección **Módulos**:

1. **Nombre**: Autenticación y Seguridad
   **Descripción**: Gestión de inicio de sesión, recuperación de contraseña y control de acceso.
2. **Nombre**: Gestión de Agenda y Citas
   **Descripción**: Calendario principal, visualización de disponibilidad y validación de solapamientos.
3. **Nombre**: Catálogo de Pacientes
   **Descripción**: Directorio de pacientes registrados con su información de contacto.
4. **Nombre**: Configuración de Consultorio
   **Descripción**: Ajustes de horarios laborales y definición de tipos de citas y duraciones.

---

## 2. Funciones
Crea estos registros en la sección **Funciones**:

1. **Nombre**: Inicio de sesión seguro
   **Descripción**: Permitir acceso solo a usuarios registrados mediante usuario y contraseña cifrada.
   **Prioridad**: Alta
2. **Nombre**: Detección de solapamiento
   **Descripción**: Bloquear el guardado de una cita si la fecha y hora elegidas ya están ocupadas.
   **Prioridad**: Alta
3. **Nombre**: Enlace a WhatsApp
   **Descripción**: Generar un link automático (wa.me) con un mensaje predefinido para confirmar la cita.
   **Prioridad**: Media
4. **Nombre**: Cálculo de hora de fin
   **Descripción**: Calcular automáticamente la hora de término de una cita basándose en la duración configurada del tipo de cita.
   **Prioridad**: Alta

---

## 3. Historias de Usuario
Crea estos registros en la sección **Historias de Usuario**:

1. **Título**: Acceso al sistema
   **Como**: Dentista
   **Quiero**: Iniciar sesión con credenciales
   **Para**: Acceder a mi agenda personal de forma segura.
   **Prioridad**: Alta
   **Módulo**: Autenticación y Seguridad

2. **Título**: Visualización de Calendario
   **Como**: Dentista
   **Quiero**: Ver un calendario mensual
   **Para**: Identificar rápidamente los días con mayor carga de trabajo.
   **Prioridad**: Alta
   **Módulo**: Gestión de Agenda y Citas

3. **Título**: Agendar sin solapamientos
   **Como**: Recepcionista
   **Quiero**: Que el sistema rechaze empalmes de horarios
   **Para**: No tener a dos pacientes citados a la misma hora.
   **Prioridad**: Alta
   **Módulo**: Gestión de Agenda y Citas

4. **Título**: Notificar por WhatsApp
   **Como**: Recepcionista
   **Quiero**: Un botón que abra WhatsApp Web con un mensaje de recordatorio
   **Para**: Confirmar la asistencia del paciente rápidamente.
   **Prioridad**: Media
   **Módulo**: Catálogo de Pacientes

---

## 4. Análisis de Documentos
Crea estos registros en la sección **Análisis de Documentos**:

1. **Título**: Agenda Física Actual
   **Tipo**: Archivo Físico
   **Resumen**: Cuaderno donde actualmente se anotan las citas. Falla principal: no hay control de cancelaciones y el texto suele ser ilegible.
2. **Título**: Exportación de Contactos CSV
   **Tipo**: Archivo Digital
   **Resumen**: Base de datos de teléfonos de pacientes extraída de Google Contacts para importar al nuevo sistema.

---

## 5. Seguimiento Transaccional
Ejemplos de eventos a registrar en la sección **Seguimiento Transaccional**:

1. **Evento**: `cita_creada`
   **Detalle**: El sistema debe registrar cuando un usuario agenda exitosamente una cita, guardando el ID del paciente y el timestamp.
2. **Evento**: `intento_login_fallido`
   **Detalle**: Registrar accesos denegados por contraseña incorrecta para auditoría de seguridad.
