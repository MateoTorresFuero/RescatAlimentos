# RescatAlimentos API

Backend para el Sprint 2 de Miguel: persistencia PostgreSQL y endpoints de lotes,
reservas y solicitudes básicas de transporte.

## Requisitos

- Python 3.11 o superior
- PostgreSQL

No se requiere Docker para ejecutar o probar la API.

## Preparación local

Desde esta carpeta, crea y activa un entorno virtual, instala las dependencias y
copia `.env.example` a `.env`. Ajusta `DATABASE_URL` a tu instancia PostgreSQL:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Aplica la migración inicial y arranca la API:

```powershell
alembic upgrade head
uvicorn app.main:app --reload
```

La documentación OpenAPI queda disponible en `http://127.0.0.1:8000/docs`.

## Pruebas

```powershell
pytest
```

Las pruebas usan SQLite temporal y no necesitan una instancia PostgreSQL.

## Autenticación e integración

Las rutas operativas exigen un actor autenticado y su rol. La dependencia
`get_current_actor` es el punto de integración para el JWT que implementará
Mateo. Hasta integrar esa validación, las rutas protegidas responden `401` si
no hay un actor en `request.state.current_actor`; no se aceptan IDs o roles
proporcionados por el cliente como sustituto de autenticación.

## Patrones implementados

- **Repository:** `app/repositories.py` encapsula las consultas y escrituras.
- **Unit of Work:** `app/unit_of_work.py` administra repositorios y confirma o
  revierte cada caso de uso como una transacción.
- **State:** `app/domain/states.py` encapsula las transiciones válidas de lotes
  y solicitudes logísticas. Los estados MVP son `DISPONIBLE` → `RESERVADO` y
  `DISPONIBLE` → `ASIGNADA`, respectivamente.
