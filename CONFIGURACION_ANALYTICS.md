# 📊 Configuración de Google Analytics

## Instrucciones para Configurar Google Analytics

1. **Crear cuenta en Google Analytics**
   - Ve a https://analytics.google.com/
   - Crea una cuenta y una propiedad para tu sitio web
   - Obtén tu Measurement ID (formato: `G-XXXXXXXXXX`)

2. **Reemplazar el ID en todas las páginas**
   
   Busca y reemplaza `G-XXXXXXXXXX` con tu ID real en estos archivos:
   - `index.html` (línea ~87)
   - `pages/servicios.html` (línea ~77)
   - `pages/contacto.html` (línea ~63)
   - `pages/sobre.html` (línea ~66)
   - Cualquier otra página que quieras trackear

3. **Eventos Personalizados (Opcional)**
   
   Puedes agregar eventos personalizados en `js/main.js`:
   ```javascript
   // Ejemplo: Trackear clicks en botones de favoritos
   gtag('event', 'favorite_click', {
     'event_category': 'engagement',
     'event_label': 'servicio_favorito'
   });
   ```

4. **Verificar la Instalación**
   - Abre tu sitio web
   - Ve a Google Analytics > Admin > Data Streams
   - Verifica que aparezcan eventos en tiempo real

## Nota de Privacidad

El código incluye `anonymize_ip: true` para cumplir con GDPR y proteger la privacidad de los usuarios.

