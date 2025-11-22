# 📱 Instrucciones para Crear Iconos PWA

## ⚠️ ACCIÓN REQUERIDA

Los iconos PWA necesitan ser creados manualmente. Sigue estos pasos:

### 1. Crear el Logo Base

Necesitas crear un logo cuadrado de **512x512px** con:

- Fondo: Gradiente de rojo (#CE1126) a azul (#002D62)
- Texto: "RD" en blanco, fuente bold
- O usar el escudo de la selección dominicana de baloncesto

### 2. Generar Tamaños Necesarios

Desde el logo 512x512, genera estos tamaños:

```
logo-192x192.png   → Para Android
logo-512x512.png   → Para Android (alta resolución)
logo-maskable-512x512.png → Para Android (con safe zone)
apple-touch-icon.png (180x180) → Para iOS
favicon.ico (16x16, 32x32, 48x48) → Para navegadores
```

### 3. Herramientas Recomendadas

**Opción 1: PWA Asset Generator (Recomendado)**

```bash
npx @vite-pwa/assets-generator --preset minimal public/logo-rdscore.png
```

**Opción 2: Online**

- <https://realfavicongenerator.net/>
- <https://www.pwabuilder.com/imageGenerator>

**Opción 3: Manual con Photoshop/Figma**

- Crear canvas de 512x512px
- Diseñar logo centrado
- Exportar en diferentes tamaños

### 4. Safe Zone para Maskable Icons

Para el icono maskable (Android), asegúrate de:

- Dejar 10% de margen en todos los lados
- El contenido importante debe estar en el 80% central
- Fondo sólido (no transparente)

### 5. Ubicación de Archivos

Coloca todos los iconos en:

```
Frontend/public/
├── logo-192x192.png
├── logo-512x512.png
├── logo-maskable-512x512.png
├── apple-touch-icon.png
└── favicon.ico
```

### 6. Actualizar manifest.json

Una vez creados los iconos, actualiza `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/logo-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/logo-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 7. Verificar

Después de crear los iconos:

1. Abre Chrome DevTools
2. Ve a Application > Manifest
3. Verifica que todos los iconos se muestren correctamente
4. Prueba instalar la PWA en móvil

## 🎨 Especificaciones de Diseño

### Colores

- Rojo primario: `#CE1126`
- Azul primario: `#002D62`
- Blanco: `#FFFFFF`

### Contenido del Logo

- Opción 1: Letras "RD" en blanco, fuente bold
- Opción 2: Silueta de jugador de baloncesto
- Opción 3: Balón de baloncesto con bandera RD
- Opción 4: Escudo oficial de la selección

### Estilo

- Moderno y profesional
- Alto contraste
- Legible en tamaños pequeños
- Representativo de República Dominicana

---

**Nota:** Mientras no se creen los iconos, la PWA usará el logo-rdscore.png actual como fallback.
