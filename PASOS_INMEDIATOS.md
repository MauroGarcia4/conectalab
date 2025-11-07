# 🚀 Pasos Inmediatos - Configuración

## ✅ Lo que ya está hecho:
- ✅ Formulario de contacto guarda en Supabase
- ✅ Sistema de recuperación de contraseña implementado
- ✅ Código listo y funcional

## 📋 Lo que TENÉS que hacer ahora:

### PASO 1: Actualizar la Base de Datos en Supabase (5 minutos)

1. **Abrí tu proyecto en Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Seleccioná tu proyecto

2. **Abrí el SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Ejecutá este SQL** (solo la parte nueva de contactos):
   ```sql
   -- Tabla de contactos
   CREATE TABLE IF NOT EXISTS contactos (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     nombre TEXT NOT NULL,
     email TEXT NOT NULL,
     motivo TEXT NOT NULL,
     mensaje TEXT NOT NULL,
     leido BOOLEAN DEFAULT FALSE,
     respondido BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Índices
   CREATE INDEX IF NOT EXISTS idx_contactos_email ON contactos(email);
   CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_contactos_leido ON contactos(leido);

   -- RLS
   ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
   DROP POLICY IF EXISTS "Contactos públicos" ON contactos;
   CREATE POLICY "Contactos públicos" ON contactos
     FOR ALL USING (true);
   ```

4. **Verificá que se creó**:
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver la tabla `contactos`

---

### PASO 2: Configurar Recuperación de Contraseña (5 minutos)

1. **Settings > Authentication**
   - En el menú lateral, click en "Settings" (⚙️)
   - Click en "Authentication"

2. **Configurar Redirect URLs**
   - Buscá la sección "URL Configuration"
   - En "Redirect URLs", agregá:
     ```
     http://localhost:8000/pages/reset-password.html
     ```
   - Si tenés un dominio de producción, agregalo también:
     ```
     https://tu-dominio.com/pages/reset-password.html
     ```

3. **Configurar Email Template de Reset Password** (IMPORTANTE)
   
   **Paso a paso:**
   
   a. **En el menú de templates, click en "Reset password"**
      - Debería estar en la barra horizontal de templates
   
   b. **Subject heading (Asunto):**
      - Dejá el default o cambiá a: `Recuperar tu contraseña - ConectaLab`
   
   c. **Message body (Cuerpo del mensaje):**
      - Click en la pestaña "<> Source" para ver el código
      - Asegurate de que tenga este contenido:
      ```html
   <h2>Recuperar tu contraseña</h2>
   <p>Hola,</p>
   <p>Recibiste este email porque solicitaste restablecer tu contraseña en ConectaLab.</p>
   <p>Hacé click en el siguiente enlace para restablecer tu contraseña:</p>
   <p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
   <p>Si no solicitaste este cambio, podés ignorar este email.</p>
   <p>Saludos,<br>El equipo de ConectaLab</p>
   ```
   
   d. **Verificá que el link sea correcto:**
      - El `{{ .ConfirmationURL }}` es la variable que Supabase usa automáticamente
      - Este link llevará a `reset-password.html` con el token necesario
   
   e. **Click en "Save"** para guardar los cambios
   
   **⚠️ IMPORTANTE:** 
   - El template "Reset password" debe estar habilitado (no desactivado)
   - Si está desactivado, activalo con el toggle/switch

---

### PASO 3: Probar que todo funcione (10 minutos)

#### A) Probar Formulario de Contacto:

1. **Abrí la página de contacto**:
   - Usá un servidor local (no `file://`)
   - `http://localhost:8000/pages/contacto.html`

2. **Completá y enviá el formulario**:
   - Llená todos los campos
   - Click en "Enviar mensaje"

3. **Verificá en Supabase**:
   - Ve a Supabase Dashboard > Table Editor > `contactos`
   - Deberías ver tu mensaje ahí

#### B) Probar Recuperación de Contraseña:

1. **Abrí la página de login**:
   - `http://localhost:8000/pages/inicio-sesion.html`

2. **Click en "¿Olvidaste tu contraseña?"**

3. **Ingresá un email que esté registrado**:
   - Debe ser un email que ya tengas registrado en Supabase

4. **Revisá tu email**:
   - Buscá el email de Supabase (puede estar en spam)
   - Click en el enlace del email

5. **Restablecé tu contraseña**:
   - Ingresá nueva contraseña (mínimo 8 caracteres)
   - Confirmá la contraseña
   - Click en "Restablecer contraseña"

6. **Probá iniciar sesión**:
   - Volvé a la página de login
   - Usá el email y la nueva contraseña

---

## ❌ Si algo no funciona:

### Formulario de contacto no guarda:
- Verificá que ejecutaste el SQL correctamente
- Revisá la consola del navegador (F12) por errores
- Verificá que Supabase esté habilitado en `js/supabase-config.js`

### Recuperación de contraseña no envía email:
- **Verificá que el template "Reset password" esté habilitado** (Settings > Authentication > Email Templates)
- Verificá que el email esté registrado en Supabase (debe estar en la tabla `auth.users`)
- Revisá la carpeta de spam (el email puede tardar unos minutos)
- Verificá que las Redirect URLs estén configuradas correctamente
- Revisá la consola del navegador por errores (F12)
- **Si ves el warning de SMTP**: En desarrollo está bien usar el servicio built-in, pero para producción configurá SMTP personalizado

### Errores en la consola:
- Asegurate de estar usando un servidor local (no `file://`)
- Verificá que todos los scripts se carguen correctamente
- Revisá que las credenciales de Supabase estén correctas

---

## 📝 Checklist Final:

- [ ] Tabla `contactos` creada en Supabase
- [ ] Redirect URLs configuradas en Supabase Auth
- [ ] **Template "Reset password" configurado y habilitado**
- [ ] Formulario de contacto guarda mensajes
- [ ] Recuperación de contraseña envía email
- [ ] Puedo restablecer mi contraseña
- [ ] Puedo iniciar sesión con la nueva contraseña

---

## 🎯 Siguiente paso (cuando termines):

Una vez que todo funcione, podés continuar con las mejoras importantes:
- Sistema de mensajes/chat
- Página de ayuda/FAQ
- Compartir en redes sociales

¡Avísame cuando termines y probamos juntos! 🚀

