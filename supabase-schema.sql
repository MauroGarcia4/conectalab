-- ============================================
-- SCHEMA DE BASE DE DATOS PARA CONECTALAB
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Abrí Supabase Dashboard
-- 2. Ve a SQL Editor
-- 3. Pegá este código completo
-- 4. Ejecutá todo el script
-- ============================================

-- ============================================
-- TABLA: favoritos
-- ============================================
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  servicio_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, servicio_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_servicio ON favoritos(servicio_id);

-- ============================================
-- TABLA: reviews
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  servicio_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reviews_servicio ON reviews(servicio_id);
CREATE INDEX IF NOT EXISTS idx_reviews_fecha ON reviews(created_at DESC);

-- ============================================
-- TABLA: usuarios (opcional, para autenticación futura)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  zona TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en las tablas
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos (lectura/escritura pública por ahora)
-- Podés cambiar esto después cuando agregues autenticación
DROP POLICY IF EXISTS "Favoritos públicos" ON favoritos;
CREATE POLICY "Favoritos públicos" ON favoritos
  FOR ALL USING (true);

-- Políticas para reviews (lectura/escritura pública por ahora)
DROP POLICY IF EXISTS "Reviews públicos" ON reviews;
CREATE POLICY "Reviews públicos" ON reviews
  FOR ALL USING (true);

-- ============================================
-- FUNCIONES ÚTILES (OPCIONAL)
-- ============================================

-- Función para obtener el rating promedio de un servicio
CREATE OR REPLACE FUNCTION get_avg_rating(servicio_id_param TEXT)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(rating), 0)
  FROM reviews
  WHERE servicio_id = servicio_id_param;
$$ LANGUAGE sql STABLE;

-- Función para contar reviews de un servicio
CREATE OR REPLACE FUNCTION get_review_count(servicio_id_param TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)
  FROM reviews
  WHERE servicio_id = servicio_id_param;
$$ LANGUAGE sql STABLE;

-- ============================================
-- TABLA: contactos (formulario de contacto)
-- ============================================
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

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_contactos_email ON contactos(email);
CREATE INDEX IF NOT EXISTS idx_contactos_fecha ON contactos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_leido ON contactos(leido);

-- RLS para contactos (lectura/escritura pública por ahora)
ALTER TABLE contactos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Contactos públicos" ON contactos;
CREATE POLICY "Contactos públicos" ON contactos
  FOR ALL USING (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que todo se creó correctamente, ejecutá:
-- SELECT * FROM favoritos;
-- SELECT * FROM reviews;
-- SELECT * FROM usuarios;
-- SELECT * FROM contactos;

