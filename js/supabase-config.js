// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================
// 
// INSTRUCCIONES PARA CONFIGURAR:
// 1. Creá una cuenta en https://supabase.com
// 2. Creá un nuevo proyecto
// 3. Ve a Settings > API
// 4. Copiá tu "Project URL" y "anon public key"
// 5. Reemplazá los valores de abajo
//
// IMPORTANTE: No subas este archivo con tus keys reales a Git
// Usá variables de entorno o un archivo de configuración separado

const SUPABASE_CONFIG = {
    // Tu URL del proyecto Supabase
    url: 'https://jmgmsnzdiimbxwliflhc.supabase.co',
    
    // Tu anon public key (segura para usar en el frontend)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ21zbnpkaWltYnh3bGlmbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODY3MDYsImV4cCI6MjA3Nzg2MjcwNn0.OXlt7kTwKFoTM7eLx40f1qc37enJ_1467V-RmgBfoso',
    
    // Habilitar Supabase (cambiar a true cuando tengas la configuración)
    enabled: true
};

// ============================================
// HELPER FUNCTIONS PARA SUPABASE
// ============================================

// Inicializar cliente de Supabase (solo si está habilitado)
let supabaseClient = null;

// Función para inicializar cliente cuando Supabase esté disponible
function initSupabaseClient() {
    if (SUPABASE_CONFIG.enabled && typeof supabase !== 'undefined') {
        try {
            supabaseClient = supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('[Supabase] Cliente inicializado correctamente');
        } catch (error) {
            console.error('[Supabase] Error inicializando cliente:', error);
        }
    }
}

// Intentar inicializar inmediatamente
initSupabaseClient();

// Si no está disponible, intentar de nuevo cuando el DOM esté listo
if (!supabaseClient && SUPABASE_CONFIG.enabled) {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof supabase !== 'undefined') {
            initSupabaseClient();
        }
    });
}

// ============================================
// FUNCIONES PARA FAVORITOS
// ============================================

/**
 * Guardar favorito en Supabase (con fallback a localStorage)
 */
async function saveFavoritoSupabase(servicioId, userId = null) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        return saveFavoritoLocalStorage(servicioId);
    }

    try {
        // Intentar insertar (upsert por si ya existe)
        const { data, error } = await supabaseClient
            .from('favoritos')
            .upsert({
                usuario_id: userId || 'anon',
                servicio_id: servicioId,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'usuario_id,servicio_id'
            });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error guardando favorito en Supabase:', error);
        // Fallback a localStorage
        return saveFavoritoLocalStorage(servicioId);
    }
}

/**
 * Eliminar favorito de Supabase (con fallback a localStorage)
 */
async function removeFavoritoSupabase(servicioId, userId = null) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        return removeFavoritoLocalStorage(servicioId);
    }

    try {
        const { error } = await supabaseClient
            .from('favoritos')
            .delete()
            .eq('usuario_id', userId || 'anon')
            .eq('servicio_id', servicioId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error eliminando favorito de Supabase:', error);
        // Fallback a localStorage
        return removeFavoritoLocalStorage(servicioId);
    }
}

/**
 * Obtener favoritos de Supabase (con fallback a localStorage)
 */
async function getFavoritosSupabase(userId = null) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        return getFavoritosLocalStorage();
    }

    try {
        const { data, error } = await supabaseClient
            .from('favoritos')
            .select('servicio_id')
            .eq('usuario_id', userId || 'anon');

        if (error) throw error;
        return data.map(item => item.servicio_id);
    } catch (error) {
        console.error('Error obteniendo favoritos de Supabase:', error);
        // Fallback a localStorage
        return getFavoritosLocalStorage();
    }
}

// ============================================
// FUNCIONES PARA REVIEWS/COMENTARIOS
// ============================================

/**
 * Guardar review en Supabase (con fallback a localStorage)
 */
async function saveReviewSupabase(servicioId, rating, comentario, userId = null) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        return saveReviewLocalStorage(servicioId, rating, comentario);
    }

    try {
        const { data, error } = await supabaseClient
            .from('reviews')
            .insert({
                usuario_id: userId || 'anon',
                servicio_id: servicioId,
                rating: rating,
                comentario: comentario,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error guardando review en Supabase:', error);
        // Fallback a localStorage
        return saveReviewLocalStorage(servicioId, rating, comentario);
    }
}

/**
 * Obtener reviews de Supabase (con fallback a localStorage)
 */
async function getReviewsSupabase(servicioId) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        return getReviewsLocalStorage(servicioId);
    }

    try {
        const { data, error } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('servicio_id', servicioId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error obteniendo reviews de Supabase:', error);
        // Fallback a localStorage
        return getReviewsLocalStorage(servicioId);
    }
}

// ============================================
// FUNCIONES DE FALLBACK (LOCALSTORAGE)
// ============================================

function saveFavoritoLocalStorage(servicioId) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if (!favoritos.includes(servicioId)) {
        favoritos.push(servicioId);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    }
    return { success: true };
}

function removeFavoritoLocalStorage(servicioId) {
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    favoritos = favoritos.filter(id => id !== servicioId);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    return { success: true };
}

function getFavoritosLocalStorage() {
    return JSON.parse(localStorage.getItem('favoritos')) || [];
}

function saveReviewLocalStorage(servicioId, rating, comentario) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    if (!reviews[servicioId]) {
        reviews[servicioId] = [];
    }
    reviews[servicioId].push({
        rating,
        comentario,
        fecha: new Date().toISOString(),
        usuario: 'Usuario Anónimo'
    });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    return { success: true };
}

function getReviewsLocalStorage(servicioId) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    return reviews[servicioId] || [];
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Registrar nuevo usuario en Supabase Auth
 */
async function registrarUsuario(email, password, nombre) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        return { success: false, error: 'Supabase no está configurado' };
    }

    try {
        // Registrar usuario en Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    nombre: nombre
                }
            }
        });

        if (authError) throw authError;

        // Guardar información adicional en tabla usuarios
        if (authData.user) {
            const { error: userError } = await supabaseClient
                .from('usuarios')
                .upsert({
                    id: authData.user.id,
                    email: email,
                    nombre: nombre,
                    created_at: new Date().toISOString()
                }, {
                    onConflict: 'id'
                });

            if (userError) {
                console.error('Error guardando datos del usuario:', userError);
            }
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Iniciar sesión con Supabase Auth
 */
async function iniciarSesion(email, password) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        return { success: false, error: 'Supabase no está configurado' };
    }

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;

        // Guardar sesión en localStorage como backup
        if (data.user) {
            localStorage.setItem('user_session', JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                nombre: data.user.user_metadata?.nombre || email
            }));
        }

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cerrar sesión
 */
async function cerrarSesion() {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        localStorage.removeItem('user_session');
        return { success: true };
    }

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('user_session');
        return { success: true };
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        localStorage.removeItem('user_session');
        return { success: true }; // Forzar cierre local
    }
}

/**
 * Obtener usuario actual
 */
async function getUsuarioActual() {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        const session = localStorage.getItem('user_session');
        return session ? JSON.parse(session) : null;
    }

    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
            // Guardar en localStorage como backup
            const userData = {
                id: user.id,
                email: user.email,
                nombre: user.user_metadata?.nombre || user.email
            };
            localStorage.setItem('user_session', JSON.stringify(userData));
            return userData;
        }
        
        return null;
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        // Fallback a localStorage
        const session = localStorage.getItem('user_session');
        return session ? JSON.parse(session) : null;
    }
}

/**
 * Verificar si hay sesión activa
 */
function tieneSesionActiva() {
    const session = localStorage.getItem('user_session');
    return session !== null;
}

/**
 * Obtener datos completos del usuario desde tabla usuarios
 */
async function getDatosUsuarioCompletos(userId) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        return null;
    }

    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return data;
    } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
        return null;
    }
}

/**
 * Guardar mensaje de contacto en Supabase
 */
async function guardarContacto(nombre, email, motivo, mensaje) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        const contactos = JSON.parse(localStorage.getItem('contactos') || '[]');
        contactos.push({
            nombre,
            email,
            motivo,
            mensaje,
            fecha: new Date().toISOString()
        });
        localStorage.setItem('contactos', JSON.stringify(contactos));
        return { success: true };
    }

    try {
        const { data, error } = await supabaseClient
            .from('contactos')
            .insert({
                nombre: nombre,
                email: email,
                motivo: motivo,
                mensaje: mensaje,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error guardando contacto:', error);
        // Fallback a localStorage
        const contactos = JSON.parse(localStorage.getItem('contactos') || '[]');
        contactos.push({
            nombre,
            email,
            motivo,
            mensaje,
            fecha: new Date().toISOString()
        });
        localStorage.setItem('contactos', JSON.stringify(contactos));
        return { success: true, error: error.message };
    }
}

/**
 * Solicitar recuperación de contraseña
 */
async function solicitarRecuperacionPassword(email) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        return { success: false, error: 'Supabase no está configurado' };
    }

    try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/pages/reset-password.html`
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error solicitando recuperación:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualizar contraseña después de recuperación
 */
async function actualizarPassword(nuevaPassword) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        return { success: false, error: 'Supabase no está configurado' };
    }

    try {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: nuevaPassword
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error actualizando contraseña:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Actualizar datos del perfil del usuario
 */
async function actualizarPerfilUsuario(userId, datos) {
    if (!SUPABASE_CONFIG.enabled || !supabaseClient) {
        // Fallback a localStorage
        const perfilData = JSON.parse(localStorage.getItem('perfil_usuario') || '{}');
        Object.assign(perfilData, datos);
        localStorage.setItem('perfil_usuario', JSON.stringify(perfilData));
        return { success: true };
    }

    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .upsert({
                id: userId,
                ...datos,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            })
            .select()
            .single();

        if (error) throw error;
        
        // También actualizar metadata en Auth
        if (datos.nombre) {
            await supabaseClient.auth.updateUser({
                data: { nombre: datos.nombre }
            });
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        return { success: false, error: error.message };
    }
}


