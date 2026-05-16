# Diagramas Arquitectónicos — Consultorio Dental Castillo
(Archivo estructurado para copiar y pegar directamente en GeraSoft)

---

## 1. Diagrama de Casos de Uso
Crea este registro en la sección **Diagramas (Casos de Uso)**. Copia el siguiente código y pégalo en el editor Mermaid:

```mermaid
%%{init: {"theme":"base"}}%%
usecaseDiagram
  actor Dentista
  actor Recepcionista
  Dentista --> (Iniciar sesión)
  Dentista --> (Ver calendario)
  Dentista --> (Crear cita)
  Dentista --> (Editar cita)
  Dentista --> (Reagendar cita)
  Dentista --> (Generar enlace WhatsApp)
  Recepcionista --> (Crear cita)
  Recepcionista --> (Listado de citas)
```

---

## 2. Diagrama de Secuencia
Crea este registro en la sección **Diagramas (Secuencia)**. Copia el siguiente código y pégalo en el editor Mermaid:

```mermaid
sequenceDiagram
  participant UI
  participant API
  participant DB

  UI->>API: POST /api/citas {paciente, tipo, fecha, hora_inicio}
  API->>DB: verificar solapamientos (fecha, hora_inicio, hora_fin)
  DB-->>API: resultado (disponible|conflicto)
  alt disponible
    API->>DB: INSERT cita
    DB-->>API: cita_id
    API-->>UI: 201 Created {cita_id}
  else conflicto
    API-->>UI: 409 Conflict {mensaje de solapamiento}
  end
```

---

## 3. Diagrama de Clases
Crea este registro en la sección **Diagramas (Clases)**. Copia el siguiente código y pégalo en el editor Mermaid:

```mermaid
classDiagram
  class Usuario {
    +int id
    +string nombre
    +string username
    +string password_hash
    +changePassword()
  }
  class Paciente {
    +int id
    +string nombre
    +string telefono
  }
  class TipoCita {
    +int id
    +string nombre
    +int duracion_minutos
  }
  class Cita {
    +int id
    +datetime hora_inicio
    +datetime hora_fin
    +string estado
    +calcularFin()
  }
  Usuario "1" --> "*" Cita : crea
  Paciente "1" --> "*" Cita : tiene
  TipoCita "1" --> "*" Cita : define
```

---

## 4. Diagrama de Paquetes
Crea este registro en la sección **Diagramas (Paquetes)**. Copia el siguiente código y pégalo en el editor Mermaid:

```mermaid
package "Frontend (React)" {
  component Calendar
  component ModalCita
  component ListaCitas
}
package "Backend (Express)" {
  component Auth
  component API_Citas
  component API_Config
  component DB_Access
}
package "Base de Datos" {
  component SQLite
}

Frontend (React) --> Backend (Express)
Backend (Express) --> SQLite
```
