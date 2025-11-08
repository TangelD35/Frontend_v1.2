# BasktscoreRD - Frontend

Sistema de análisis y gestión de datos deportivos para baloncesto dominicano. Frontend construido con React 19, Vite, TailwindCSS y Zustand.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5175
```

### Producción

```bash
# Construir para producción
npm run build

# Vista previa del build
npm run preview
```

## 📁 Estructura del Proyecto

```
Frontend/
├── public/                 # Archivos estáticos
│   ├── icons/             # Iconos PWA
│   ├── manifest.json      # Manifest PWA
│   └── sw.js             # Service Worker
├── src/
│   ├── app/              # Configuración de la app
│   │   ├── App.jsx       # Componente principal
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── assets/           # Recursos estáticos
│   │   ├── styles/       # Estilos globales
│   │   └── images/       # Imágenes
│   ├── config/           # Configuración (deprecated - usar lib/constants)
│   ├── features/         # Módulos de features
│   │   ├── auth/         # Autenticación
│   │   ├── dashboard/    # Dashboard
│   │   ├── tournaments/  # Torneos
│   │   ├── teams/        # Equipos
│   │   ├── players/      # Jugadores
│   │   ├── games/        # Partidos
│   │   ├── predictions/  # Predicciones
│   │   └── analytics/    # Analíticas
│   ├── lib/              # Utilidades y constantes
│   │   ├── constants/    # Configuración centralizada
│   │   ├── utils/        # Utilidades
│   │   └── validations/  # Validaciones
│   ├── shared/           # Código compartido
│   │   ├── api/          # Cliente API y endpoints
│   │   ├── hooks/        # Custom hooks
│   │   ├── providers/    # Context providers
│   │   ├── store/        # Estado global (Zustand)
│   │   ├── ui/           # Componentes UI reutilizables
│   │   └── utils/        # Utilidades compartidas
│   └── main.jsx          # Punto de entrada
├── .env.example          # Ejemplo de variables de entorno
├── eslint.config.js      # Configuración ESLint
├── tailwind.config.js    # Configuración TailwindCSS
├── vite.config.js        # Configuración Vite
└── package.json
```

## 🏗️ Arquitectura

### Feature-Based Architecture

El proyecto está organizado por features (módulos de funcionalidad). Cada feature contiene:

- `pages/` - Páginas/vistas
- `components/` - Componentes específicos del feature
- `hooks/` - Hooks específicos (opcional)
- `services/` - Servicios específicos (opcional)

### Código Compartido

El código compartido está en `shared/`:

- **API**: Cliente axios centralizado con interceptores
- **Hooks**: Custom hooks reutilizables
- **Store**: Estado global con Zustand
- **UI**: Componentes UI reutilizables
- **Utils**: Utilidades y logger

### Configuración

La configuración centralizada está en `src/lib/constants/index.js`. Este archivo exporta:

- Configuración de API
- Configuración de WebSocket
- Configuración de autenticación
- Configuración de logging
- Constantes de la aplicación

> **Nota**: `src/config/index.js` está deprecated pero se mantiene por compatibilidad. Usa `lib/constants` en su lugar.

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8000

# Application
VITE_APP_NAME=BasktscoreRD
VITE_APP_VERSION=2.0
VITE_DEBUG=false

# Logging
VITE_LOG_LEVEL=info
```

### Logger

El proyecto usa un logger centralizado (`shared/utils/logger`) que:

- Solo loguea en desarrollo (o según configuración)
- Proporciona diferentes niveles: debug, info, warn, error
- Formatea mensajes consistentemente

**Uso:**

```javascript
import logger from '@/shared/utils/logger';

// Crear logger con contexto
const apiLogger = logger.create('API');

// Logging
logger.debug('Mensaje de debug');
logger.info('Información');
logger.warn('Advertencia');
logger.error('Error', errorObject);
```

## 📦 Dependencias Principales

### Producción

- **React 19** - Biblioteca UI
- **React Router 7** - Enrutamiento
- **Zustand** - Gestión de estado
- **Axios** - Cliente HTTP
- **TailwindCSS** - Estilos
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos
- **Socket.io-client** - WebSocket

### Desarrollo

- **Vite** - Build tool
- **ESLint** - Linter
- **Vitest** - Testing

## 🎨 Estilos

El proyecto usa TailwindCSS con un tema personalizado. Los colores y estilos están definidos en:

- `tailwind.config.js` - Configuración de Tailwind
- `src/assets/styles/` - Estilos globales y variables CSS

### Dark Mode

El dark mode está implementado usando la clase `dark` de Tailwind. El toggle está en el componente `ThemeSwitcher`.

## 🔐 Autenticación

La autenticación está gestionada por:

- `shared/store/authStore.js` - Estado de autenticación (Zustand)
- `shared/api/endpoints/auth.js` - Servicios de autenticación
- `app/ProtectedRoute.jsx` - Protección de rutas
- `app/PublicRoute.jsx` - Rutas públicas

El token se almacena en `localStorage` con la clave `token` (configurable en `config.auth.tokenKey`).

## 🌐 API Client

El cliente API está centralizado en `shared/api/client.js` y proporciona:

- Interceptores para agregar tokens
- Manejo global de errores
- Logging de requests/responses
- Métodos de conveniencia (upload, download)

**Uso:**

```javascript
import { api } from '@/shared/api/client';

// GET
const data = await api.get('/endpoint');

// POST
const result = await api.post('/endpoint', { data });

// Upload
await api.upload('/upload', formData, (progress) => {
  console.log(`Progress: ${progress}%`);
});
```

## 📱 PWA (Progressive Web App)

El proyecto está configurado como PWA:

- Service Worker en `public/sw.js`
- Manifest en `public/manifest.json`
- Iconos en `public/icons/`

El Service Worker está deshabilitado en desarrollo para evitar problemas con hot reload.

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm test -- --coverage
```

## 📝 Linting

```bash
# Ejecutar linter
npm run lint
```

## 🚀 Deployment

### Build de Producción

```bash
npm run build
```

El build se genera en `dist/`.

### Variables de Entorno en Producción

Asegúrate de configurar las variables de entorno en tu plataforma de deployment:

- Vercel: Variables en el dashboard
- Netlify: Variables en netlify.toml o dashboard
- Docker: Variables en docker-compose.yml

## 🔄 Migraciones y Actualizaciones

### Migrar de config/index.js a lib/constants

Si encuentras código que importa desde `config/index.js`, migra a:

```javascript
// Antes
import { config } from '@/config';

// Después
import { config } from '@/lib/constants';
```

### Usar Logger en lugar de console.log

```javascript
// Antes
console.log('Mensaje');
console.error('Error', error);

// Después
import logger from '@/shared/utils/logger';
logger.debug('Mensaje');
logger.error('Error', error);
```

## 📚 Recursos

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

## 🤝 Contribución

1. Crear una rama desde `main`
2. Hacer cambios
3. Ejecutar tests y linter
4. Crear Pull Request

## 📄 Licencia

Copyright © 2025 BasktscoreRD

