# 🚀 Optimizaciones de PageSpeed Insights

## Optimizaciones Implementadas

### ✅ 1. Carga Diferida de Scripts
- **Bootstrap JS**: Agregado `defer` para no bloquear el render
- **JavaScript propio**: Agregado `defer` para mejor performance
- **Google Analytics**: Carga diferida después del evento `load`

### ✅ 2. Optimización de Fuentes
- **Font Loading**: Implementado `media="print" onload="this.media='all'"` para carga asíncrona
- **Fallback**: `<noscript>` para navegadores sin JavaScript
- **Preconnect**: Ya implementado para Google Fonts

### ✅ 3. Resource Hints
- **Preconnect**: Para Google Fonts y Google Analytics
- **DNS Prefetch**: Para CDN y recursos externos

### ✅ 4. Lazy Loading de Imágenes
- **Nativo**: `loading="lazy"` en todas las imágenes
- **IntersectionObserver**: Lazy loading avanzado con fade-in
- **WebP Support**: Detección automática y fallback

### ✅ 5. Service Worker
- **Cache Offline**: Implementado en `sw.js`
- **Strategies**: Cache First para assets, Network First para HTML

### ✅ 6. Structured Data
- **Schema.org**: JSON-LD para mejor SEO y rich results

### ✅ 7. Optimizaciones Específicas para Móvil
- **Viewport optimizado**: `maximum-scale=5.0, user-scalable=yes` para mejor UX
- **Imágenes responsive**: `srcset` y `sizes` para cargar tamaños apropiados según viewport (300w, 400w, 600w)
- **Touch optimizations**: Botones con `min-height: 44px` y `touch-action: manipulation`
- **Media queries móvil**: Reducción de tamaños de fuente (14px base, 13px en pantallas pequeñas), padding y animaciones
- **Tap highlight**: Optimizado para mejor feedback táctil (`-webkit-tap-highlight-color`)
- **AOS deshabilitado**: Animaciones AOS desactivadas en móvil para mejor performance
- **Formularios optimizados**: Botones full-width en móvil, mejor spacing

## Optimizaciones Adicionales Recomendadas

### 📋 Para Netlify (si usas Netlify)

1. **Archivo `_headers`**: Ya creado en la raíz del proyecto
   - Configuración de cache headers
   - Compresión Gzip/Brotli
   - Security headers

2. **Netlify Build Settings**:
   ```bash
   # En netlify.toml o configuración del sitio
   [build]
     command = "npm run build" # Si usas build
     publish = "dist" # Tu carpeta de output
   
   [[plugins]]
     package = "@netlify/plugin-minify-html"
   
   [[plugins]]
     package = "@netlify/plugin-lighthouse"
   ```

### 📋 Optimizaciones Manuales

#### 1. Minificar CSS y JS
```bash
# Usar herramientas como:
- CSS: cssnano, clean-css
- JS: terser, uglify-js
```

#### 2. Imágenes WebP
Convertir todas las imágenes a WebP:
- https://squoosh.app/
- https://convertio.co/es/jpg-webp/

#### 3. Critical CSS (Opcional)
Para páginas muy grandes, extraer CSS crítico:
- Usar herramientas como: https://www.sitelocity.com/critical-path-css-generator

#### 4. Preload de Recursos Críticos
Agregar en `<head>`:
```html
<link rel="preload" href="css/styles.css" as="style">
<link rel="preload" href="js/main.js" as="script">
```

### 📊 Métricas Objetivo de PageSpeed

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **FID (First Input Delay)**: < 100ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅
- **FCP (First Contentful Paint)**: < 1.8s ✅
- **TTI (Time to Interactive)**: < 3.8s ✅

### 🔍 Herramientas de Análisis

1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **GTmetrix**: https://gtmetrix.com/
3. **WebPageTest**: https://www.webpagetest.org/
4. **Chrome DevTools**: Lighthouse tab

### 📝 Checklist de Performance

- [x] Scripts con `defer` o `async`
- [x] Imágenes con `loading="lazy"`
- [x] Fuentes optimizadas
- [x] Preconnect y DNS prefetch
- [x] Service Worker
- [x] Structured Data
- [x] Viewport optimizado para móvil
- [x] Imágenes responsive con `srcset` y `sizes`
- [x] Optimizaciones CSS específicas para móvil
- [x] Botones optimizados para touch (min 44x44px)
- [x] Headers de cache configurados (Netlify)
- [ ] Imágenes en formato WebP (convertir manualmente)
- [ ] CSS y JS minificados (en producción)

### 🎯 Próximos Pasos

1. **Desplegar en Netlify/Vercel**: Para aprovechar CDN automático
2. **Convertir imágenes a WebP**: Mejorará significativamente el LCP
3. **Minificar assets**: En producción
4. **Monitorear con PageSpeed Insights**: Regularmente para detectar regresiones

