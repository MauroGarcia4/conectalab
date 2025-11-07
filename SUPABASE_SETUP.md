# 🗄️ Configuración de Supabase

## Pasos Rápidos

1. Creá cuenta en https://supabase.com
2. Creá proyecto nuevo
3. Ve a Settings > API y copiá:
   - Project URL
   - anon public key
4. Abrí `js/supabase-config.js` y configurá las credenciales
5. Ejecutá `supabase-schema.sql` en SQL Editor de Supabase

## Archivos SQL

Ejecutá `supabase-schema.sql` completo en el SQL Editor de Supabase.

## Configuración Adicional (NUEVO)

### 1. Tabla de Contactos
Si ya ejecutaste el schema anterior, ejecutá solo la parte de `contactos` desde `supabase-schema.sql`.

### 2. Recuperación de Contraseña
- Settings > Authentication > URL Configuration
- Agregá `http://localhost:8000/pages/reset-password.html` a Redirect URLs

## Verificar

Abrí la consola del navegador (F12) y verificá:
```
[Supabase] Cliente inicializado correctamente
```

## Ver PASOS_INMEDIATOS.md para instrucciones detalladas
