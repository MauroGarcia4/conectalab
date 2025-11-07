// ============================================
// GESTIÓN DE PERFIL DE USUARIO
// ============================================

// Verificar sesión y cargar datos del perfil
document.addEventListener('DOMContentLoaded', async function() {
    // Esperar a que Supabase se inicialice
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let usuario = null;
    
    // Verificar sesión
    if (typeof tieneSesionActiva === 'function' && tieneSesionActiva()) {
        if (typeof getUsuarioActual === 'function') {
            usuario = await getUsuarioActual();
        }
    }
    
    if (!usuario) {
        // No hay sesión - redirigir a login
        window.location.href = 'inicio-sesion.html';
        return;
    }

    // Cargar datos del perfil
    await cargarDatosPerfil(usuario.id);
    
    // Cargar favoritos
    await cargarFavoritos(usuario.id);
    
    // Configurar formulario
    configurarFormularioPerfil(usuario.id);
    
    // Cargar email recordado si existe
    cargarEmailRecordado();
});

/**
 * Cargar datos del perfil del usuario
 */
async function cargarDatosPerfil(userId) {
    let datosUsuario = null;
    
    // Intentar obtener datos completos desde Supabase
    if (typeof getDatosUsuarioCompletos === 'function') {
        datosUsuario = await getDatosUsuarioCompletos(userId);
    }
    
    // Obtener usuario actual para datos básicos
    const usuarioActual = await getUsuarioActual();
    
    // Combinar datos
    const nombreCompleto = datosUsuario?.nombre || usuarioActual?.nombre || usuarioActual?.email || 'Usuario';
    const partesNombre = nombreCompleto.split(' ');
    const nombre = partesNombre[0] || '';
    const apellido = partesNombre.slice(1).join(' ') || '';
    
    // Llenar campos del formulario
    const nombreInput = document.getElementById('perfil-nombre');
    const apellidoInput = document.getElementById('perfil-apellido');
    const emailInput = document.getElementById('perfil-email');
    const telefonoInput = document.getElementById('perfil-telefono');
    const zonaSelect = document.getElementById('perfil-zona');
    
    if (nombreInput) nombreInput.value = datosUsuario?.nombre || nombre;
    if (apellidoInput) apellidoInput.value = datosUsuario?.apellido || apellido;
    if (emailInput) emailInput.value = datosUsuario?.email || usuarioActual?.email || '';
    if (telefonoInput) telefonoInput.value = datosUsuario?.telefono || '';
    if (zonaSelect) zonaSelect.value = datosUsuario?.zona || '';
    
    // Actualizar display
    const nombreDisplay = document.getElementById('perfil-nombre-display');
    const emailDisplay = document.getElementById('perfil-email-display');
    const fechaRegistro = document.getElementById('perfil-fecha-registro');
    
    if (nombreDisplay) {
        const nombreCompletoDisplay = [nombre, apellido].filter(Boolean).join(' ') || nombreCompleto;
        nombreDisplay.textContent = nombreCompletoDisplay;
    }
    if (emailDisplay) emailDisplay.textContent = datosUsuario?.email || usuarioActual?.email || '';
    
    if (fechaRegistro && datosUsuario?.created_at) {
        const fecha = new Date(datosUsuario.created_at);
        fechaRegistro.textContent = fecha.getFullYear();
    } else if (fechaRegistro) {
        fechaRegistro.textContent = new Date().getFullYear();
    }
    
    // Avatar
    const avatarImg = document.getElementById('perfil-avatar');
    if (avatarImg && datosUsuario?.avatar_url) {
        avatarImg.src = datosUsuario.avatar_url;
    }
}

/**
 * Cargar favoritos del usuario
 */
async function cargarFavoritos(userId) {
    let favoritos = [];
    
    if (typeof getFavoritosSupabase === 'function') {
        try {
            favoritos = await getFavoritosSupabase(userId);
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        }
    }
    
    // Actualizar contadores
    const statsFavoritos = document.getElementById('stats-favoritos');
    const favoritosTabCount = document.getElementById('favoritos-tab-count');
    
    if (statsFavoritos) statsFavoritos.textContent = favoritos.length;
    if (favoritosTabCount) favoritosTabCount.textContent = favoritos.length;
    
    // Mostrar lista de favoritos
    const favoritosList = document.getElementById('favoritos-list');
    if (!favoritosList) return;
    
    if (favoritos.length === 0) {
        favoritosList.innerHTML = '<p class="text-muted text-center py-5">No tenés servicios favoritos aún.</p>';
        return;
    }
    
    // Generar lista de favoritos con información completa
    let html = '<div class="list-group">';
    favoritos.forEach(servicioId => {
        const servicioInfo = typeof getServicioInfo === 'function' 
            ? getServicioInfo(servicioId) 
            : { nombre: `Servicio ${servicioId}`, descripcion: '', categoria: '', icono: 'bi-question-circle' };
        
        html += `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-1">
                            <i class="bi ${servicioInfo.icono} text-primary me-2"></i>
                            <h6 class="mb-0">${servicioInfo.nombre}</h6>
                        </div>
                        <p class="text-muted small mb-2">${servicioInfo.descripcion || 'Sin descripción'}</p>
                        <span class="badge bg-secondary-subtle text-secondary small">${servicioInfo.categoria || 'General'}</span>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarFavorito('${servicioId}')" title="Quitar de favoritos">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                        <a href="../pages/servicios.html" class="btn btn-sm btn-outline-primary mt-2 d-block" title="Ver servicio">
                            <i class="bi bi-eye"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    favoritosList.innerHTML = html;
}

/**
 * Eliminar favorito con confirmación
 */
async function eliminarFavorito(servicioId) {
    const servicioInfo = typeof getServicioInfo === 'function' 
        ? getServicioInfo(servicioId) 
        : { nombre: `Servicio ${servicioId}` };
    
    // Confirmar antes de eliminar
    if (!confirm(`¿Estás seguro de que querés quitar "${servicioInfo.nombre}" de tus favoritos?`)) {
        return;
    }
    
    const usuario = await getUsuarioActual();
    if (!usuario) return;
    
    if (typeof removeFavoritoSupabase === 'function') {
        await removeFavoritoSupabase(servicioId, usuario.id);
    }
    
    // Recargar favoritos
    await cargarFavoritos(usuario.id);
    
    // Mostrar toast
    if (typeof mostrarToast === 'function') {
        mostrarToast(`${servicioInfo.nombre} eliminado de favoritos`, 'success');
    }
}

/**
 * Configurar formulario de perfil
 */
function configurarFormularioPerfil(userId) {
    const formulario = document.getElementById('form-perfil-info');
    if (!formulario) return;
    
    // Validación en tiempo real
    const nombreInput = document.getElementById('perfil-nombre');
    const telefonoInput = document.getElementById('perfil-telefono');
    
    if (nombreInput) {
        nombreInput.addEventListener('blur', function() {
            if (this.value.trim().length < 2) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    }
    
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function() {
            // Validar formato de teléfono (opcional, solo números y algunos caracteres)
            const valor = this.value.trim();
            if (valor && !/^[\d\s\-\+\(\)]+$/.test(valor)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                if (valor) this.classList.add('is-valid');
            }
        });
    }
    
    formulario.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = formulario.querySelector('button[type="submit"]');
        const mensaje = document.getElementById('perfil-mensaje');
        const originalText = submitBtn.innerHTML;
        
        // Validar campos requeridos
        const nombre = document.getElementById('perfil-nombre').value.trim();
        if (!nombre || nombre.length < 2) {
            if (mensaje) {
                mensaje.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle me-1"></i>El nombre debe tener al menos 2 caracteres</span>';
            }
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        
        if (mensaje) mensaje.textContent = '';
        
        const datos = {
            nombre: nombre,
            apellido: document.getElementById('perfil-apellido').value.trim(),
            telefono: document.getElementById('perfil-telefono').value.trim(),
            zona: document.getElementById('perfil-zona').value
        };
        
        if (typeof actualizarPerfilUsuario === 'function') {
            try {
                const resultado = await actualizarPerfilUsuario(userId, datos);
                
                if (resultado.success) {
                    if (mensaje) {
                        mensaje.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Cambios guardados</span>';
                        setTimeout(() => {
                            mensaje.textContent = '';
                        }, 3000);
                    }
                    
                    // Actualizar display
                    const nombreDisplay = document.getElementById('perfil-nombre-display');
                    if (nombreDisplay) {
                        const nombreCompleto = [datos.nombre, datos.apellido].filter(Boolean).join(' ') || datos.nombre;
                        nombreDisplay.textContent = nombreCompleto;
                    }
                    
                    if (typeof mostrarToast === 'function') {
                        mostrarToast('Perfil actualizado correctamente', 'success');
                    }
                } else {
                    if (mensaje) {
                        mensaje.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle me-1"></i>Error al guardar</span>';
                    }
                }
            } catch (error) {
                console.error('Error guardando perfil:', error);
                if (mensaje) {
                    mensaje.innerHTML = '<span class="text-danger"><i class="bi bi-exclamation-circle me-1"></i>Error al guardar</span>';
                }
            }
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

/**
 * Configurar guardado de preferencias
 */
function configurarPreferencias() {
    const btnGuardar = document.getElementById('btn-guardar-preferencias');
    const mensaje = document.getElementById('preferencias-mensaje');
    
    if (!btnGuardar) return;
    
    btnGuardar.addEventListener('click', function() {
        const notifEmail = document.getElementById('notificaciones-email');
        const notifPush = document.getElementById('notificaciones-push');
        const idiomaSelect = document.querySelector('#config select');
        
        if (!notifEmail || !notifPush || !idiomaSelect) return;
        
        const preferencias = {
            notificaciones_email: notifEmail.checked,
            notificaciones_push: notifPush.checked,
            idioma: idiomaSelect.value
        };
        
        localStorage.setItem('preferencias_usuario', JSON.stringify(preferencias));
        
        if (mensaje) {
            mensaje.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Preferencias guardadas</span>';
            setTimeout(() => {
                mensaje.textContent = '';
            }, 3000);
        }
        
        if (typeof mostrarToast === 'function') {
            mostrarToast('Preferencias guardadas', 'success');
        }
    });
    
    // Cargar preferencias guardadas
    const preferenciasGuardadas = localStorage.getItem('preferencias_usuario');
    if (preferenciasGuardadas) {
        try {
            const prefs = JSON.parse(preferenciasGuardadas);
            const notifEmail = document.getElementById('notificaciones-email');
            const notifPush = document.getElementById('notificaciones-push');
            const idiomaSelect = document.querySelector('#config select');
            
            if (notifEmail) notifEmail.checked = prefs.notificaciones_email || false;
            if (notifPush) notifPush.checked = prefs.notificaciones_push !== undefined ? prefs.notificaciones_push : true;
            if (idiomaSelect) idiomaSelect.value = prefs.idioma || 'Español';
        } catch (e) {
            console.error('Error cargando preferencias:', e);
        }
    }
}


