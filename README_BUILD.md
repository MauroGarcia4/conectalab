# 🚀 Guía de Build y Optimización

Este documento explica cómo usar las herramientas de optimización implementadas en ConectaLab.

## 📦 Mejoras Técnicas Implementadas

### 1. Code Splitting
Los módulos se cargan dinámicamente solo cuando se necesitan:
- `js/modules/servicios-module.js` - Se carga solo en páginas de servicios
- Reduce el tamaño inicial del bundle
- Mejora el tiempo de carga inicial

### 2. Image Optimization
- Uso de `<picture>` con soporte WebP
- Fallback automático a formatos tradicionales
- Lazy loading implementado
- `js/utils/image-optimizer.js` optimiza imágenes automáticamente

### 3. Error Tracking
- Sistema de seguimiento de errores en `js/utils/error-tracker.js`
- Captura errores de JavaScript, promesas y recursos
- Almacena errores en localStorage
- Listo para integrar con Sentry u otros servicios

**Uso:**
```javascript
// Reportar error manualmente
trackError('Mensaje de error', error, { contexto: 'adicional' });

// Ver errores almacenados
const errores = errorTracker.getStoredErrors();
```

### 4. Bundle Optimization
Script de build básico para minificación:
- `build.js` - Script de Node.js para optimización
- Minifica CSS y JavaScript
- Crea versión optimizada en carpeta `dist/`

## 🔧 Uso del Script de Build

### Requisitos
- Node.js instalado

### Ejecutar Build
```bash
node build.js
```

O usando npm:
```bash
npm run build
```

### Resultado
Se crea una carpeta `dist/` con:
- Archivos HTML copiados
- CSS minificado (`styles.min.css`)
- JavaScript minificado (`*.min.js`)
- Imágenes copiadas

## 📝 Notas

### Para Producción Avanzada
Para optimización más avanzada, considera usar:
- **Terser** - Minificación JS avanzada
- **cssnano** - Minificación CSS avanzada
- **imagemin** - Optimización de imágenes
- **webpack/rollup** - Bundling y tree-shaking

### Integración con Sentry
Para integrar error tracking con Sentry:

1. Agregar script de Sentry en HTML:
```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
```

2. Modificar `error-tracker.js`:
```javascript
sendToServer(errorData) {
    if (typeof Sentry !== 'undefined') {
        Sentry.captureException(new Error(errorData.message), {
            extra: errorData
        });
    }
}
```

## 🎯 Próximos Pasos

1. Configurar CI/CD para ejecutar build automáticamente
2. Integrar con servicio de error tracking (Sentry)
3. Implementar optimización avanzada de imágenes
4. Agregar tree-shaking para eliminar código no usado

