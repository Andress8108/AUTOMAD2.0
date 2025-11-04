# SAVISER Backend

Backend para el Sistema de Clasificación de Triage SAVISER.

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:

Editar el archivo `.env` con tus credenciales de MongoDB:

```
MONGODB_URI=mongodb://localhost:27017/saviser
PORT=3000
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_cambiar_en_produccion
NODE_ENV=development
```

## Iniciar el servidor

```bash
npm start
```

Para desarrollo con auto-reload:
```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints disponibles

### Auth
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Obtener perfil
- PUT `/api/auth/profile` - Actualizar perfil
- PUT `/api/auth/change-password` - Cambiar contraseña

### Patients
- POST `/api/patients` - Crear paciente
- GET `/api/patients` - Obtener todos los pacientes
- GET `/api/patients/identification/:identificacion` - Obtener por identificación
- PUT `/api/patients/:id` - Actualizar paciente
- DELETE `/api/patients/:id` - Eliminar paciente

### Triage
- POST `/api/triage` - Crear evaluación
- GET `/api/triage` - Obtener todas las evaluaciones
- GET `/api/triage/stats` - Obtener estadísticas
- GET `/api/triage/:id` - Obtener evaluación por ID
- PUT `/api/triage/:id/status` - Actualizar estado

## Requisitos

- Node.js 16+
- MongoDB 4.4+
