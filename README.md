# VestiIA — Probador virtual híbrido (Cámara Sensor + Subir Foto)

Proyecto completo de sitio web responsive con catálogo, modo híbrido para capturar foto en vivo con silueta guía tipo sensor o subir fotografía desde el equipo, e integración preparada para IA Virtual Try-On.

## 1. Requisitos
- Node.js 18 o superior
- npm

## 2. Instalar y ejecutar
```bash
npm install
npm start
```
Abre `http://localhost:3000`.

## 3. Características de esta versión
- **Modo Híbrido en Paso 1:** Permite elegir entre **📷 Usar cámara** (con silueta guía, cambio de cámara frontal/trasera y temporizador de 3s) o **↑ Subir foto** (con drag & drop y selector de archivos para equipos sin cámara).
- **Detección inteligente:** Si el equipo no cuenta con cámara conectada, muestra un aviso claro y permite cambiar con un clic a subir foto.
