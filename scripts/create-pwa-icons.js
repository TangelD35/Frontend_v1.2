import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores del tema
const COLORS = {
    red: '#CE1126',
    blue: '#002D62',
    white: '#FFFFFF',
    orange: '#FF6B35'
};

// Tamaños de iconos requeridos
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear SVG dinámico para cada tamaño
function createSVG(size) {
    const scale = size / 512;
    const strokeWidth = Math.max(2, 8 * scale);
    const basketballRadius = 60 * scale;
    const center = size / 2;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.red};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${COLORS.white};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.blue};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${80 * scale}" fill="url(#bgGradient)"/>
  
  <!-- Basketball court outline -->
  <g stroke="${COLORS.white}" stroke-width="${strokeWidth}" fill="none" opacity="0.9">
    <rect x="${120 * scale}" y="${140 * scale}" width="${272 * scale}" height="${232 * scale}" rx="${8 * scale}"/>
    <circle cx="${center}" cy="${center}" r="${40 * scale}"/>
    <path d="M ${160 * scale} ${180 * scale} Q ${180 * scale} ${center} ${160 * scale} ${332 * scale}"/>
    <path d="M ${352 * scale} ${180 * scale} Q ${332 * scale} ${center} ${352 * scale} ${332 * scale}"/>
  </g>
  
  <!-- Basketball -->
  <g>
    <circle cx="${center}" cy="${center}" r="${basketballRadius}" fill="${COLORS.orange}" stroke="${COLORS.white}" stroke-width="${4 * scale}"/>
    <path d="M ${center} ${center - basketballRadius} Q ${center + 24 * scale} ${center} ${center} ${center + basketballRadius}" 
          stroke="${COLORS.white}" stroke-width="${3 * scale}" fill="none"/>
    <path d="M ${center} ${center - basketballRadius} Q ${center - 24 * scale} ${center} ${center} ${center + basketballRadius}" 
          stroke="${COLORS.white}" stroke-width="${3 * scale}" fill="none"/>
    <ellipse cx="${center}" cy="${center}" rx="${basketballRadius}" ry="${20 * scale}" 
             stroke="${COLORS.white}" stroke-width="${3 * scale}" fill="none"/>
  </g>
  
  <!-- Dominican flag colors accent -->
  <g opacity="0.8">
    <rect x="${140 * scale}" y="${160 * scale}" width="${40 * scale}" height="${40 * scale}" 
          rx="${8 * scale}" fill="${COLORS.red}"/>
    <rect x="${332 * scale}" y="${160 * scale}" width="${40 * scale}" height="${40 * scale}" 
          rx="${8 * scale}" fill="${COLORS.blue}"/>
  </g>
</svg>`;
}

// Crear directorio de iconos si no existe
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar SVG para cada tamaño
console.log('🎨 Generando iconos PWA...\n');

SIZES.forEach(size => {
    const svg = createSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);

    fs.writeFileSync(filepath, svg);
    console.log(`✅ Creado: ${filename}`);
});

console.log('\n✨ Iconos SVG generados exitosamente!');
console.log('\n📝 Nota: Los archivos SVG se pueden usar directamente en el manifest.');
console.log('   Para convertir a PNG, usa herramientas como Inkscape o ImageMagick.');
console.log('   Ver: scripts/generate-icons.md para instrucciones.\n');
