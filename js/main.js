// ============================================
// CONECTALAB - Funcionalidades JavaScript
// ============================================

// ============================================
// REGISTRO DE SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('[Service Worker] Registrado exitosamente:', registration.scope);

                // Verificar actualizaciones cada hora
                setInterval(() => {
                    registration.update();
                }, 3600000);
            })
            .catch(function (error) {
                console.log('[Service Worker] Error al registrar:', error);
            });
    });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // 1. BOTÓN VOLVER ARRIBA
    // ============================================
    initBackToTop();

    // ============================================
    // 2. FILTROS Y BÚSQUEDA DE SERVICIOS
    // ============================================
    if (document.querySelector('#servicios-container')) {
        initServiciosFiltros();
    }

    // ============================================
    // 3. VALIDACIÓN FORMULARIO DE CONTACTO
    // ============================================
    if (document.querySelector('#formulario-contacto')) {
        initFormularioContacto();
    }

    // ============================================
    // 4. VALIDACIÓN FORMULARIO DE REGISTRO
    // ============================================
    if (document.querySelector('#formulario-registro')) {
        initFormularioRegistro();
    }

    // ============================================
    // 5. VALIDACIÓN FORMULARIO DE INICIO DE SESIÓN
    // ============================================
    if (document.querySelector('#formulario-login')) {
        initFormularioLogin();
    }

    // ============================================
    // 6. BOTONES DE LOGIN SOCIAL
    // ============================================
    initSocialAuth();

    // ============================================
    // 7. CONTADORES ANIMADOS
    // ============================================
    initCounters();

    // ============================================
    // 8. TEMAS PERSONALIZADOS (Modo Oscuro/Claro + Esquemas)
    // ============================================
    initThemeToggle();

    // ============================================
    // 9. SISTEMA DE FAVORITOS
    // ============================================
    initFavoritos();

    // ============================================
    // 10. BÚSQUEDA AVANZADA
    // ============================================
    if (document.querySelector('#filtrosAvanzados')) {
        initBusquedaAvanzada();
    }

    // ============================================
    // 11. TOOLTIPS
    // ============================================
    initTooltips();

    // ============================================
    // 12. LAZY LOADING
    // ============================================
    initLazyLoading();

    // ============================================
    // 13. MODAL DE SERVICIOS
    // ============================================
    if (document.querySelector('#modalServicio')) {
        initModalServicio();
    }

    // ============================================
    // 14. CHAT DEMO
    // ============================================
    initChatDemo();

    // ============================================
    // 15. NEWSLETTER
    // ============================================
    initNewsletter();

    // ============================================
    // 16. ACCESIBILIDAD (Navegación por teclado)
    // ============================================
    initAccesibilidad();

    // ============================================
    // 17. ANIMACIONES AOS (Animate On Scroll)
    // ============================================
    initAOS();
});

// ============================================
// FUNCIÓN: Animaciones AOS
// ============================================
function initAOS() {
    if (!('IntersectionObserver' in window)) return;

    const aosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                aosObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
        aosObserver.observe(el);
    });
}

// ============================================
// FUNCIÓN: Botón Volver Arriba
// ============================================
function initBackToTop() {
    const backToTopBtn = document.querySelector('#back-to-top, a[href="#top"].back-to-top, a[href="#top"]');

    if (!backToTopBtn) return;

    // Configuración inicial
    backToTopBtn.style.zIndex = '9999';

    // Agregar transición suave para mostrar/ocultar
    backToTopBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

    // Función para mostrar/ocultar botón
    function toggleButton() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

        if (scrollTop > 300) {
            // Mostrar botón - siempre mantener display: flex para que sea clickeable
            backToTopBtn.style.display = 'flex';
            backToTopBtn.style.visibility = 'visible';
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.pointerEvents = 'auto';
        } else {
            // Ocultar botón pero mantener display para evitar problemas de timing
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.pointerEvents = 'none';
        }
    }

    // Scroll suave al hacer click
    backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // Usar múltiples métodos para compatibilidad
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        // Fallback para navegadores antiguos
        if (document.documentElement.scrollTop > 0) {
            document.documentElement.scrollTop = 0;
        }
        if (document.body.scrollTop > 0) {
            document.body.scrollTop = 0;
        }
    });

    // Inicializar estado inmediatamente
    toggleButton();

    // Agregar listeners de scroll
    window.addEventListener('scroll', toggleButton, { passive: true });
    document.addEventListener('scroll', toggleButton, { passive: true });

    // Verificar estado después de que la página cargue completamente
    // para casos donde la página se recarga con scroll
    window.addEventListener('load', () => {
        toggleButton();
    });

    // También verificar cuando el DOM esté listo
    if (document.readyState === 'complete') {
        toggleButton();
    }
}

// ============================================
// FUNCIÓN: Filtros y Búsqueda de Servicios
// ============================================
function initServiciosFiltros() {
    const serviciosContainer = document.querySelector('#servicios-container');
    const categoriaBtns = document.querySelectorAll('.categoria-btn');
    const busquedaForm = document.querySelector('#servicio-busqueda');
    const busquedaInput = document.querySelector('#busqueda-input');
    const serviciosCards = document.querySelectorAll('.servicio-card');

    let categoriaActiva = 'todas';
    let busquedaTexto = '';

    // Guardar estado original de las cards
    const serviciosOriginales = Array.from(serviciosCards).map(card => ({
        elemento: card,
        categoria: card.dataset.categoria || '',
        titulo: card.querySelector('h3')?.textContent.toLowerCase() || '',
        descripcion: card.querySelector('p')?.textContent.toLowerCase() || ''
    }));

    // Función auxiliar para restaurar colores originales de los botones
    function restaurarColoresBotones() {
        const colorMap = {
            'Hogar': { bg: 'bg-primary', text: 'text-white' },
            'Tecnología': { bg: 'bg-success', text: 'text-white' },
            'Diseño': { bg: 'bg-warning', text: 'text-dark' },
            'Emergencias': { bg: 'bg-danger', text: 'text-white' },
            'Educación': { bg: 'bg-info', text: 'text-white' },
            'Construcción': { bg: 'bg-secondary', text: 'text-white' }
        };

        categoriaBtns.forEach(b => {
            const cat = b.dataset.categoria;
            // Remover clases de color activo
            Object.values(colorMap).forEach(colors => {
                b.classList.remove(colors.bg, colors.text);
            });

            // Restaurar colores originales según su categoría
            if (cat === 'Hogar') {
                b.classList.add('bg-primary-subtle', 'text-primary');
            } else if (cat === 'Tecnología') {
                b.classList.add('bg-success-subtle', 'text-success');
            } else if (cat === 'Diseño') {
                b.classList.add('bg-warning-subtle', 'text-dark');
            } else if (cat === 'Emergencias') {
                b.classList.add('bg-danger-subtle', 'text-danger');
            } else if (cat === 'Educación') {
                b.classList.add('bg-info-subtle', 'text-info');
            } else if (cat === 'Construcción') {
                b.classList.add('bg-secondary-subtle', 'text-secondary');
            }
        });
    }

    // Event listeners para botones de categoría
    categoriaBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Mapa de colores para cada categoría
            const colorMap = {
                'Hogar': { bg: 'bg-primary', text: 'text-white' },
                'Tecnología': { bg: 'bg-success', text: 'text-white' },
                'Diseño': { bg: 'bg-warning', text: 'text-dark' },
                'Emergencias': { bg: 'bg-danger', text: 'text-white' },
                'Educación': { bg: 'bg-info', text: 'text-white' },
                'Construcción': { bg: 'bg-secondary', text: 'text-white' }
            };

            const categoriaClick = this.dataset.categoria || 'todas';

            // Si el botón clickeado ya está activo, deseleccionarlo
            if (categoriaActiva === categoriaClick) {
                categoriaActiva = 'todas';
                restaurarColoresBotones();
            } else {
                // Si no está activo, seleccionarlo
                categoriaActiva = categoriaClick;

                // Restaurar todos los botones primero
                restaurarColoresBotones();

                // Aplicar estilo activo al botón seleccionado
                if (colorMap[categoriaActiva]) {
                    this.classList.remove('bg-primary-subtle', 'bg-success-subtle', 'bg-warning-subtle', 'bg-danger-subtle', 'bg-info-subtle', 'bg-secondary-subtle');
                    this.classList.remove('text-primary', 'text-success', 'text-dark', 'text-danger', 'text-info', 'text-secondary');
                    this.classList.add(colorMap[categoriaActiva].bg, colorMap[categoriaActiva].text);
                }
            }

            // Filtrar servicios
            filtrarServicios();
        });
    });

    // Event listener para búsqueda en tiempo real
    if (busquedaInput) {
        busquedaInput.addEventListener('input', function () {
            busquedaTexto = this.value.toLowerCase().trim();
            filtrarServicios();
        });
    }

    // Event listener para formulario de búsqueda
    if (busquedaForm) {
        busquedaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            busquedaTexto = busquedaInput.value.toLowerCase().trim();
            filtrarServicios();
        });
    }

    // Función para filtrar servicios
    function filtrarServicios() {
        let serviciosVisibles = 0;

        serviciosOriginales.forEach(servicio => {
            const card = servicio.elemento;
            const parentCol = card.closest('.col-12, .col-sm-6, .col-lg-3, .col-md-4');

            // Verificar filtro de categoría
            const cumpleCategoria = categoriaActiva === 'todas' ||
                servicio.categoria.toLowerCase() === categoriaActiva.toLowerCase();

            // Verificar búsqueda
            const cumpleBusqueda = busquedaTexto === '' ||
                servicio.titulo.includes(busquedaTexto) ||
                servicio.descripcion.includes(busquedaTexto);

            // Mostrar u ocultar card
            if (cumpleCategoria && cumpleBusqueda) {
                card.style.display = '';
                if (parentCol) parentCol.style.display = '';
                serviciosVisibles++;
            } else {
                card.style.display = 'none';
                if (parentCol) parentCol.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        mostrarMensajeSinResultados(serviciosVisibles === 0);
    }

    // Función para mostrar mensaje cuando no hay resultados
    function mostrarMensajeSinResultados(mostrar) {
        let mensaje = document.querySelector('#sin-resultados');

        if (mostrar && !mensaje) {
            mensaje = document.createElement('div');
            mensaje.id = 'sin-resultados';
            mensaje.className = 'col-12 text-center py-5';
            mensaje.innerHTML = `
        <i class="bi bi-search fs-1 text-muted"></i>
        <h4 class="mt-3 text-muted">No se encontraron servicios</h4>
        <p class="text-muted">Intentá con otros términos de búsqueda o seleccioná otra categoría.</p>
      `;
            serviciosContainer.appendChild(mensaje);
        } else if (!mostrar && mensaje) {
            mensaje.remove();
        }
    }
}

// ============================================
// FUNCIÓN: Validación Formulario de Contacto
// ============================================
function initFormularioContacto() {
    const formulario = document.querySelector('#formulario-contacto');
    const inputs = formulario.querySelectorAll('input, select, textarea');

    // Validación en tiempo real
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validarCampo(this);
        });

        input.addEventListener('input', function () {
            if (this.classList.contains('is-invalid')) {
                validarCampo(this);
            }
        });
    });

    // Validación al enviar
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        let esValido = true;

        inputs.forEach(input => {
            if (!validarCampo(input)) {
                esValido = false;
            }
        });

        if (esValido) {
            // Mostrar mensaje de éxito
            mostrarMensajeExito(formulario, '¡Mensaje enviado correctamente! Te responderemos a la brevedad.');

            // Resetear formulario
            formulario.reset();

            // Limpiar clases de validación
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        } else {
            // Mostrar mensaje de error
            mostrarMensajeError(formulario, 'Por favor, completá todos los campos correctamente.');
        }
    });

    function validarCampo(campo) {
        const valor = campo.value.trim();
        let esValido = true;
        let mensajeError = '';

        // Validar campo requerido
        if (campo.hasAttribute('required') && valor === '') {
            esValido = false;
            mensajeError = 'Este campo es obligatorio.';
        }

        // Validar email (solo si tiene valor)
        if (campo.type === 'email' && valor !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valor)) {
                esValido = false;
                mensajeError = 'Ingresá un email válido.';
            }
        } else if (campo.type === 'email' && valor === '' && campo.hasAttribute('required')) {
            // Si es email requerido y está vacío, el mensaje ya se estableció arriba
            esValido = false;
        }

        // Validar select
        if (campo.tagName === 'SELECT' && valor === '' && campo.hasAttribute('required')) {
            esValido = false;
            mensajeError = 'Seleccioná una opción.';
        }

        // Aplicar estilos
        if (esValido) {
            campo.classList.remove('is-invalid');
            campo.classList.add('is-valid');
            if (campo.nextElementSibling && campo.nextElementSibling.classList.contains('invalid-feedback')) {
                campo.nextElementSibling.remove();
            }
        } else {
            campo.classList.remove('is-valid');
            campo.classList.add('is-invalid');

            // Agregar mensaje de error si no existe
            if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains('invalid-feedback')) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = mensajeError;
                campo.parentElement.appendChild(errorDiv);
            } else {
                campo.nextElementSibling.textContent = mensajeError;
            }
        }

        return esValido;
    }
}

// ============================================
// FUNCIÓN: Validación Formulario de Registro
// ============================================
function initFormularioRegistro() {
    const formulario = document.querySelector('#formulario-registro');
    if (!formulario) return;

    const passwordInputs = formulario.querySelectorAll('input[type="password"]');
    const password = passwordInputs[0] || null;
    const confirmPassword = passwordInputs[1] || null;
    const email = formulario.querySelector('input[type="email"]');
    const nombre = formulario.querySelector('input[type="text"]');
    const terminos = formulario.querySelector('#terminos');

    // Validación en tiempo real
    [nombre, email, password, confirmPassword].forEach(input => {
        if (input) {
            input.addEventListener('blur', function () {
                validarCampoRegistro(this);
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('is-invalid')) {
                    validarCampoRegistro(this);
                }
            });
        }
    });

    // Validar confirmación de contraseña en tiempo real
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function () {
            validarConfirmacionPassword();
        });
    }

    // Validación al enviar
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        let esValido = true;

        // Validar campos individuales
        [nombre, email, password, confirmPassword].forEach(input => {
            if (input && !validarCampoRegistro(input)) {
                esValido = false;
            }
        });

        // Validar confirmación de contraseña
        if (!validarConfirmacionPassword()) {
            esValido = false;
        }

        // Validar términos y condiciones
        if (!terminos.checked) {
            esValido = false;
            terminos.classList.add('is-invalid');
            mostrarMensajeError(formulario, 'Debés aceptar los términos y condiciones para registrarte.');
        } else {
            terminos.classList.remove('is-invalid');
        }

        if (esValido) {
            // Mostrar mensaje de éxito
            mostrarMensajeExito(formulario, '¡Registro exitoso! Ya podés iniciar sesión.');

            // Resetear formulario
            formulario.reset();

            // Limpiar clases de validación
            formulario.querySelectorAll('input').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });

            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'inicio-sesion.html';
            }, 2000);
        } else {
            mostrarMensajeError(formulario, 'Por favor, completá todos los campos correctamente.');
        }
    });

    function validarCampoRegistro(campo) {
        const valor = campo.value.trim();
        let esValido = true;
        let mensajeError = '';

        if (campo.hasAttribute('required') && valor === '') {
            esValido = false;
            mensajeError = 'Este campo es obligatorio.';
        }

        // Validar nombre
        if (campo === nombre && valor !== '') {
            if (valor.length < 3) {
                esValido = false;
                mensajeError = 'El nombre debe tener al menos 3 caracteres.';
            }
        }

        // Validar email
        if (campo === email && valor !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valor)) {
                esValido = false;
                mensajeError = 'Ingresá un email válido.';
            }
        }

        // Validar contraseña
        if (campo === password && valor !== '') {
            if (valor.length < 8) {
                esValido = false;
                mensajeError = 'La contraseña debe tener al menos 8 caracteres.';
            }
        }

        // Aplicar estilos
        aplicarEstilosValidacion(campo, esValido, mensajeError);

        return esValido;
    }

    function validarConfirmacionPassword() {
        if (!password || !confirmPassword) return false;

        const passwordValor = password.value;
        const confirmPasswordValor = confirmPassword.value;

        if (confirmPasswordValor === '') {
            aplicarEstilosValidacion(confirmPassword, false, 'Este campo es obligatorio.');
            return false;
        }

        if (passwordValor !== confirmPasswordValor) {
            aplicarEstilosValidacion(confirmPassword, false, 'Las contraseñas no coinciden.');
            return false;
        }

        aplicarEstilosValidacion(confirmPassword, true, '');
        return true;
    }
}

// ============================================
// FUNCIÓN: Validación Formulario de Login
// ============================================
function initFormularioLogin() {
    const formulario = document.querySelector('#formulario-login');
    const email = formulario.querySelector('#email');
    const password = formulario.querySelector('#password');

    // Validación en tiempo real
    [email, password].forEach(input => {
        input.addEventListener('blur', function () {
            validarCampoLogin(this);
        });

        input.addEventListener('input', function () {
            if (this.classList.contains('is-invalid')) {
                validarCampoLogin(this);
            }
        });
    });

    // Validación al enviar
    formulario.addEventListener('submit', function (e) {
        e.preventDefault();

        let esValido = true;

        [email, password].forEach(input => {
            if (!validarCampoLogin(input)) {
                esValido = false;
            }
        });

        if (esValido) {
            // Mostrar mensaje de éxito
            mostrarMensajeExito(formulario, '¡Inicio de sesión exitoso! Redirigiendo...');

            // Simular redirección (en producción sería al dashboard)
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        } else {
            mostrarMensajeError(formulario, 'Por favor, verificá tus credenciales.');
        }
    });

    function validarCampoLogin(campo) {
        const valor = campo.value.trim();
        let esValido = true;
        let mensajeError = '';

        if (campo.hasAttribute('required') && valor === '') {
            esValido = false;
            mensajeError = 'Este campo es obligatorio.';
        }

        if (campo === email && valor !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(valor)) {
                esValido = false;
                mensajeError = 'Ingresá un email válido.';
            }
        }

        if (campo === password && valor !== '' && valor.length < 6) {
            esValido = false;
            mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
        }

        aplicarEstilosValidacion(campo, esValido, mensajeError);

        return esValido;
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Aplicar estilos de validación Bootstrap
function aplicarEstilosValidacion(campo, esValido, mensajeError) {
    if (esValido) {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
        if (campo.nextElementSibling && campo.nextElementSibling.classList.contains('invalid-feedback')) {
            campo.nextElementSibling.remove();
        }
    } else {
        campo.classList.remove('is-valid');
        campo.classList.add('is-invalid');

        if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains('invalid-feedback')) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = mensajeError;
            campo.parentElement.appendChild(errorDiv);
        } else {
            campo.nextElementSibling.textContent = mensajeError;
        }
    }
}

// Mostrar mensaje de éxito
function mostrarMensajeExito(formulario, mensaje) {
    // Mostrar toast moderno
    mostrarToast(mensaje, 'success');

    // También mostrar en el formulario si existe
    if (formulario) {
        const mensajesAnteriores = formulario.querySelectorAll('.alert');
        mensajesAnteriores.forEach(msg => msg.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        formulario.insertBefore(alertDiv, formulario.firstChild);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Mostrar mensaje de error
function mostrarMensajeError(formulario, mensaje) {
    // Mostrar toast moderno
    mostrarToast(mensaje, 'error');

    // También mostrar en el formulario si existe
    if (formulario) {
        const mensajesAnteriores = formulario.querySelectorAll('.alert');
        mensajesAnteriores.forEach(msg => msg.remove());

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        formulario.insertBefore(alertDiv, formulario.firstChild);

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// ============================================
// FUNCIÓN: Sistema de Notificaciones Toast
// ============================================
function mostrarToast(mensaje, tipo = 'info', duracion = 4000) {
    // Crear contenedor si no existe
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Iconos según el tipo
    const iconos = {
        success: '<i class="bi bi-check-circle-fill text-success"></i>',
        error: '<i class="bi bi-x-circle-fill text-danger"></i>',
        warning: '<i class="bi bi-exclamation-triangle-fill text-warning"></i>',
        info: '<i class="bi bi-info-circle-fill text-info"></i>'
    };

    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast-custom ${tipo}`;
    toast.style.pointerEvents = 'auto';
    toast.innerHTML = `
        ${iconos[tipo] || iconos.info}
        <div class="flex-grow-1">
            <p class="mb-0 fw-semibold">${mensaje}</p>
        </div>
        <button type="button" class="btn-close" aria-label="Cerrar" style="pointer-events: auto; z-index: 10001;"></button>
    `;

    // Agregar al contenedor
    container.appendChild(toast);

    // Botón cerrar - con mejor manejo de eventos
    const closeBtn = toast.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.style.pointerEvents = 'auto';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '10001';

        closeBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cerrarToast(toast);
        });

        // También permitir cerrar haciendo clic en el toast
        toast.addEventListener('click', function (e) {
            if (e.target === toast || e.target.closest('.flex-grow-1')) {
                cerrarToast(toast);
            }
        });
    }

    // Auto-cerrar después de la duración
    setTimeout(() => {
        cerrarToast(toast);
    }, duracion);
}

function cerrarToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

// ============================================
// FUNCIÓN: Autenticación Social
// ============================================
function initSocialAuth() {
    const btnGoogle = document.querySelectorAll('#btn-google');
    const btnFacebook = document.querySelectorAll('#btn-facebook');

    // Función para mostrar modal de autenticación social
    function mostrarModalSocial(provider) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'modal-social';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center p-5">
                        <div class="mb-4">
                            <i class="bi bi-${provider === 'google' ? 'google' : 'facebook'} text-${provider === 'google' ? 'danger' : 'primary'}" style="font-size: 4rem;"></i>
                        </div>
                        <h4 class="mb-3">Autenticación con ${provider === 'google' ? 'Google' : 'Facebook'}</h4>
                        <div class="spinner-border text-primary mb-3" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="text-muted mb-0">Conectando con ${provider === 'google' ? 'Google' : 'Facebook'}...</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Simular proceso de autenticación
        setTimeout(() => {
            modal.querySelector('.spinner-border').remove();
            modal.querySelector('p').textContent = '¡Autenticación exitosa!';
            modal.querySelector('p').classList.remove('text-muted');
            modal.querySelector('p').classList.add('text-success', 'fw-bold');

            setTimeout(() => {
                bsModal.hide();
                mostrarMensajeExitoSocial(provider);
                setTimeout(() => {
                    // Redirigir al inicio (detectar si estamos en pages/ o en root)
                    const currentPath = window.location.pathname;
                    const redirectPath = currentPath.includes('/pages/') ? '../index.html' : 'index.html';
                    window.location.href = redirectPath;
                }, 2000);
            }, 1500);
        }, 2000);

        // Limpiar modal cuando se cierre
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Función para mostrar mensaje de éxito
    function mostrarMensajeExitoSocial(provider) {
        const authCard = document.querySelector('.auth-card');
        if (!authCard) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            ¡Autenticación exitosa con ${provider === 'google' ? 'Google' : 'Facebook'}! 
            Redirigiendo...
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        authCard.insertBefore(alertDiv, authCard.firstChild);
    }

    // Event listeners para botones de Google
    btnGoogle.forEach(btn => {
        const originalHTML = btn.innerHTML;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Conectando...';

            mostrarModalSocial('google');

            // Restaurar botón después de un tiempo
            setTimeout(() => {
                this.disabled = false;
                this.innerHTML = originalHTML;
            }, 4000);
        });
    });

    // Event listeners para botones de Facebook
    btnFacebook.forEach(btn => {
        const originalHTML = btn.innerHTML;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Conectando...';

            mostrarModalSocial('facebook');

            // Restaurar botón después de un tiempo
            setTimeout(() => {
                this.disabled = false;
                this.innerHTML = originalHTML;
            }, 4000);
        });
    });
}

// ============================================
// FUNCIÓN: Contadores Animados
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');

    if (counters.length === 0) return;

    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    // Intersection Observer para activar cuando esté visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// ============================================
// FUNCIÓN: Temas Personalizados (Modo Oscuro/Claro + Esquemas de Color)
// ============================================
function initThemeToggle() {
    const themeOptions = document.querySelectorAll('.theme-option');

    if (!themeOptions.length) {
        // Fallback para botón simple si no hay dropdown
        const themeToggle = document.querySelector('#theme-toggle');
        const themeIcon = document.querySelector('#theme-icon');

        if (!themeToggle) return;

        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', function () {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);

            mostrarToast(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
        });

        function updateThemeIcon(theme) {
            if (themeIcon) {
                if (theme === 'dark') {
                    themeIcon.className = 'bi bi-sun-fill fs-5';
                } else {
                    themeIcon.className = 'bi bi-moon-fill fs-5';
                }
            }
        }
        return;
    }

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColorScheme = localStorage.getItem('colorScheme') || 'blue';
    applyTheme(savedTheme, savedColorScheme);

    // Event listeners para opciones de tema
    themeOptions.forEach(option => {
        option.addEventListener('click', function (e) {
            e.preventDefault();
            const theme = this.getAttribute('data-theme');

            if (theme === 'light' || theme === 'dark') {
                const currentColor = localStorage.getItem('colorScheme') || 'blue';
                applyTheme(theme, currentColor);
                localStorage.setItem('theme', theme);
                mostrarToast(`Modo ${theme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
            } else {
                const currentTheme = localStorage.getItem('theme') || 'light';
                applyTheme(currentTheme, theme);
                localStorage.setItem('colorScheme', theme);
                mostrarToast(`Tema ${getThemeName(theme)} activado`, 'success');
            }

            // Cerrar dropdown
            const dropdown = bootstrap.Dropdown.getInstance(document.querySelector('#theme-toggle'));
            if (dropdown) dropdown.hide();
        });
    });

    function applyTheme(mode, colorScheme) {
        document.documentElement.setAttribute('data-theme', mode);
        document.documentElement.setAttribute('data-color-scheme', colorScheme);

        // Marcar opción activa
        themeOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-theme') === mode || opt.getAttribute('data-theme') === colorScheme) {
                opt.classList.add('active');
            }
        });
    }

    function getThemeName(scheme) {
        const names = {
            blue: 'Azul',
            green: 'Verde',
            purple: 'Púrpura',
            orange: 'Naranja'
        };
        return names[scheme] || scheme;
    }
}

// ============================================
// FUNCIÓN: Sistema de Favoritos
// ============================================
function initFavoritos() {
    // Cargar favoritos desde localStorage
    let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

    // Actualizar contador
    function actualizarContador() {
        const count = favoritos.length;
        const badge = document.querySelector('#favoritos-badge');
        const countElement = document.querySelector('#favoritos-count');
        const tabCount = document.querySelector('#favoritos-tab-count');
        const statsFavoritos = document.querySelector('#stats-favoritos');

        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
        if (countElement) countElement.textContent = count;
        if (tabCount) tabCount.textContent = count;
        if (statsFavoritos) statsFavoritos.textContent = count;
    }

    // Botones de favorito
    document.querySelectorAll('.favorito-btn').forEach(btn => {
        const servicio = btn.getAttribute('data-servicio');
        const isFavorito = favoritos.includes(servicio);

        if (isFavorito) {
            btn.querySelector('i').classList.remove('bi-heart');
            btn.querySelector('i').classList.add('bi-heart-fill', 'text-danger');
        }

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const index = favoritos.indexOf(servicio);
            const icon = this.querySelector('i');

            if (index > -1) {
                favoritos.splice(index, 1);
                icon.classList.remove('bi-heart-fill', 'text-danger');
                icon.classList.add('bi-heart');
                mostrarToast('Eliminado de favoritos', 'info');
            } else {
                favoritos.push(servicio);
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill', 'text-danger');
                mostrarToast('Agregado a favoritos', 'success');
            }

            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            actualizarContador();
            actualizarListaFavoritos();
        });
    });

    // Actualizar lista de favoritos en perfil
    function actualizarListaFavoritos() {
        const lista = document.querySelector('#favoritos-list');
        if (!lista) return;

        if (favoritos.length === 0) {
            lista.innerHTML = '<p class="text-muted text-center py-5">No tenés servicios favoritos aún.</p>';
            return;
        }

        lista.innerHTML = favoritos.map(servicio => `
            <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                    <h6 class="mb-1">${servicio.charAt(0).toUpperCase() + servicio.slice(1)}</h6>
                    <small class="text-muted">Servicio favorito</small>
                </div>
                <button class="btn btn-sm btn-outline-danger remove-favorito" data-servicio="${servicio}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `).join('');

        // Event listeners para eliminar
        lista.querySelectorAll('.remove-favorito').forEach(btn => {
            btn.addEventListener('click', function () {
                const servicio = this.getAttribute('data-servicio');
                favoritos = favoritos.filter(f => f !== servicio);
                localStorage.setItem('favoritos', JSON.stringify(favoritos));
                actualizarContador();
                actualizarListaFavoritos();
                mostrarToast('Eliminado de favoritos', 'info');
            });
        });
    }

    // Link de favoritos en menú
    const favoritosLink = document.querySelector('#favoritos-link');
    if (favoritosLink) {
        favoritosLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (favoritos.length === 0) {
                mostrarToast('No tenés favoritos aún', 'info');
            } else {
                window.location.href = 'pages/perfil.html#favoritos';
            }
        });
    }

    actualizarContador();
    actualizarListaFavoritos();
}

// ============================================
// FUNCIÓN: Búsqueda Avanzada
// ============================================
function initBusquedaAvanzada() {
    const filtroRating = document.querySelector('#filtro-rating');
    const filtroZona = document.querySelector('#filtro-zona');
    const filtroPrecio = document.querySelector('#filtro-precio');
    const filtroDisponibilidad = document.querySelector('#filtro-disponibilidad');
    const limpiarBtn = document.querySelector('#limpiar-filtros');

    const filtros = [filtroRating, filtroZona, filtroPrecio, filtroDisponibilidad];

    filtros.forEach(filtro => {
        if (filtro) {
            filtro.addEventListener('change', function () {
                aplicarFiltrosAvanzados();
            });
        }
    });

    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', function () {
            filtros.forEach(f => {
                if (f) f.value = '';
            });
            aplicarFiltrosAvanzados();
            mostrarToast('Filtros limpiados', 'info');
        });
    }

    function aplicarFiltrosAvanzados() {
        const rating = filtroRating ? filtroRating.value : '';
        const zona = filtroZona ? filtroZona.value : '';
        const precio = filtroPrecio ? filtroPrecio.value : '';
        const disponibilidad = filtroDisponibilidad ? filtroDisponibilidad.value : '';

        const cards = document.querySelectorAll('.servicio-card');
        let visibleCount = 0;

        cards.forEach(card => {
            let mostrar = true;

            // Filtro por rating
            if (rating && card.getAttribute('data-rating')) {
                const cardRating = parseInt(card.getAttribute('data-rating'));
                const minRating = parseInt(rating);
                if (cardRating < minRating) mostrar = false;
            }

            // Filtro por zona
            if (zona && card.getAttribute('data-zona')) {
                const cardZona = card.getAttribute('data-zona');
                if (cardZona !== zona) mostrar = false;
            }

            // Filtro por precio
            if (precio && card.getAttribute('data-precio')) {
                const cardPrecio = card.getAttribute('data-precio');
                if (cardPrecio !== precio) mostrar = false;
            }

            // Filtro por disponibilidad
            if (disponibilidad && card.getAttribute('data-disponibilidad')) {
                const cardDisponibilidad = card.getAttribute('data-disponibilidad');
                if (cardDisponibilidad !== disponibilidad && disponibilidad !== '24hs') mostrar = false;
            }

            if (mostrar) {
                card.closest('.col-12').style.display = '';
                visibleCount++;
            } else {
                card.closest('.col-12').style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            mostrarToast('No se encontraron servicios con estos filtros', 'warning');
        } else {
            mostrarToast(`${visibleCount} servicio${visibleCount > 1 ? 's' : ''} encontrado${visibleCount > 1 ? 's' : ''}`, 'success');
        }
    }
}

// ============================================
// FUNCIÓN: Tooltips
// ============================================
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ============================================
// FUNCIÓN: Lazy Loading Avanzado (con WebP)
// ============================================
function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: cargar todas las imágenes
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
        return;
    }

    // Configuración optimizada para lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Soporte para WebP con fallback
                if (img.dataset.srcset) {
                    const picture = img.closest('picture');
                    if (picture) {
                        const source = picture.querySelector('source');
                        if (source && source.dataset.srcset) {
                            source.srcset = source.dataset.srcset;
                            source.removeAttribute('data-srcset');
                        }
                    }
                }

                // Cargar imagen principal
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }

                // Agregar clase de carga completada
                img.classList.add('loaded');
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';

                // Fade in cuando la imagen carga
                img.addEventListener('load', function () {
                    this.style.opacity = '1';
                }, { once: true });

                // Manejar errores
                img.addEventListener('error', function () {
                    this.style.opacity = '1';
                    this.classList.add('img-error');
                    if (this.dataset.fallback) {
                        this.src = this.dataset.fallback;
                    }
                }, { once: true });

                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Cargar 50px antes de que entre en viewport
        threshold: 0.01
    });

    // Observar todas las imágenes con lazy loading
    document.querySelectorAll('img[loading="lazy"], img[data-src], picture img').forEach(img => {
        // Solo observar si no tiene src o tiene data-src
        if (!img.src || img.dataset.src) {
            imageObserver.observe(img);
        }
    });

    // Detectar soporte WebP
    function supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // Si no soporta WebP, remover las sources de WebP
    if (!supportsWebP()) {
        document.querySelectorAll('picture source[type="image/webp"]').forEach(source => {
            source.remove();
        });
    }
}

// ============================================
// FUNCIÓN: Modal de Servicio
// ============================================
function initModalServicio() {
    const modal = document.querySelector('#modalServicio');
    const modalContent = document.querySelector('#modal-servicio-content');

    if (!modal || !modalContent) return;

    modal.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const servicio = button.getAttribute('data-servicio');

        const serviciosData = {
            electricidad: {
                nombre: 'Electricidad',
                descripcion: 'Instalaciones eléctricas completas, tableros, mantenimiento y reparaciones.',
                precio: 'Desde $5.000',
                disponibilidad: 'Disponible',
                rating: 4.8,
                zona: 'Centro y alrededores'
            },
            diseno: {
                nombre: 'Diseño Gráfico',
                descripcion: 'Identidad visual, logos, redes sociales y material gráfico profesional.',
                precio: 'Desde $8.000',
                disponibilidad: 'Disponible',
                rating: 5.0,
                zona: 'Centro y alrededores'
            },
            plomeria: {
                nombre: 'Plomería',
                descripcion: 'Reparaciones, instalaciones, cañerías y sanitarios. Servicio 24 horas.',
                precio: 'Desde $4.000',
                disponibilidad: '24 horas',
                rating: 4.2,
                zona: 'Norte y alrededores'
            },
            carpinteria: {
                nombre: 'Carpintería',
                descripcion: 'Muebles a medida, restauración y trabajos de carpintería de calidad.',
                precio: 'Consultar',
                disponibilidad: 'Disponible',
                rating: 4.9,
                zona: 'Sur y alrededores'
            },
            tecnologia: {
                nombre: 'Tecnología',
                descripcion: 'Reparación de PCs, notebooks, celulares y dispositivos electrónicos.',
                precio: 'Desde $3.000',
                disponibilidad: 'Disponible',
                rating: 4.5,
                zona: 'Centro y alrededores'
            },
            pintura: {
                nombre: 'Pintura',
                descripcion: 'Pintura interior, exterior y texturas. Trabajos de calidad garantizada.',
                precio: 'Desde $6.000',
                disponibilidad: 'Disponible',
                rating: 4.3,
                zona: 'Este y alrededores'
            },
            albanileria: {
                nombre: 'Albañilería',
                descripcion: 'Construcción, refacciones y trabajos de albañilería profesional.',
                precio: 'Consultar',
                disponibilidad: 'Disponible',
                rating: 4.7,
                zona: 'Oeste y alrededores'
            },
            clases: {
                nombre: 'Clases Particulares',
                descripcion: 'Apoyo escolar y clases de materias específicas. Todos los niveles.',
                precio: 'Desde $2.500',
                disponibilidad: 'Disponible',
                rating: 5.0,
                zona: 'Centro y alrededores'
            },
            limpieza: {
                nombre: 'Limpieza',
                descripcion: 'Servicios de limpieza para hogar, oficinas y locales comerciales.',
                precio: 'Desde $3.500',
                disponibilidad: 'Disponible',
                rating: 4.6,
                zona: 'Sur y alrededores'
            },
            cerrajeria: {
                nombre: 'Cerrajería',
                descripcion: 'Urgencias 24 horas, cambio de cerraduras y servicios de seguridad.',
                precio: 'Desde $4.500',
                disponibilidad: '24 horas',
                rating: 4.9,
                zona: 'Centro y alrededores'
            },
            fotografia: {
                nombre: 'Fotografía',
                descripcion: 'Fotografía profesional para eventos, productos y sesiones.',
                precio: 'Desde $10.000',
                disponibilidad: 'Disponible',
                rating: 5.0,
                zona: 'Norte y alrededores'
            }
        };

        const data = serviciosData[servicio] || {
            nombre: servicio,
            descripcion: 'Servicio profesional de calidad.',
            precio: 'Consultar',
            disponibilidad: 'Disponible',
            rating: 4.5,
            zona: 'Todas las zonas'
        };

        const stars = Array(Math.floor(data.rating)).fill(0).map(() =>
            '<i class="bi bi-star-fill text-warning"></i>'
        ).join('');

        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-6 mb-3">
                    <img src="../img/srv-${servicio}.jpg" class="img-fluid rounded" alt="${data.nombre}" onerror="this.src='../img/srv-electricidad.jpeg'">
                </div>
                <div class="col-md-6">
                    <h4>${data.nombre}</h4>
                    <div class="mb-2">
                        ${stars}
                        <span class="ms-2">${data.rating}</span>
                    </div>
                    <p class="text-muted">${data.descripcion}</p>
                    <div class="mb-3">
                        <strong>Precio:</strong> ${data.precio}<br>
                        <strong>Disponibilidad:</strong> ${data.disponibilidad}<br>
                        <strong>Zona:</strong> ${data.zona}
                    </div>
                </div>
            </div>
        `;
    });
}

// ============================================
// FUNCIÓN: Chat Demo
// ============================================
function initChatDemo() {
    // Crear botón flotante de chat
    const chatBtn = document.createElement('button');
    chatBtn.className = 'btn btn-primary position-fixed bottom-0 start-0 m-4 shadow rounded-circle';
    chatBtn.style.cssText = 'width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; z-index: 9998;';
    chatBtn.innerHTML = '<i class="bi bi-chat-dots"></i>';
    chatBtn.setAttribute('data-bs-toggle', 'modal');
    chatBtn.setAttribute('data-bs-target', '#chatModal');
    chatBtn.setAttribute('aria-label', 'Abrir chat');
    document.body.appendChild(chatBtn);

    // Crear modal de chat
    const chatModal = document.createElement('div');
    chatModal.className = 'modal fade';
    chatModal.id = 'chatModal';
    chatModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 400px;">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-chat-dots me-2"></i>Chat de Soporte
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="chat-messages" style="height: 400px; overflow-y: auto;">
                    <div class="chat-message mb-3">
                        <div class="d-flex align-items-start">
                            <div class="flex-shrink-0">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    <i class="bi bi-person-fill"></i>
                                </div>
                            </div>
                            <div class="flex-grow-1 ms-3">
                                <div class="bg-light rounded p-2">
                                    <p class="mb-0 small">¡Hola! ¿En qué puedo ayudarte hoy?</p>
                                </div>
                                <small class="text-muted">Ahora</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <input type="text" class="form-control" id="chat-input" placeholder="Escribí tu mensaje...">
                    <button class="btn btn-primary" id="chat-send">
                        <i class="bi bi-send"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatModal);

    // Funcionalidad del chat
    const chatInput = chatModal.querySelector('#chat-input');
    const chatSend = chatModal.querySelector('#chat-send');
    const chatMessages = chatModal.querySelector('#chat-messages');

    const respuestas = [
        'Gracias por tu consulta. Nuestro equipo te responderá pronto.',
        '¿Necesitás ayuda con algún servicio en particular?',
        'Podemos ayudarte a encontrar el profesional ideal.',
        '¿Tenés alguna pregunta sobre cómo funciona ConectaLab?'
    ];

    function agregarMensaje(texto, esUsuario = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message mb-3';
        messageDiv.innerHTML = `
            <div class="d-flex align-items-start ${esUsuario ? 'flex-row-reverse' : ''}">
                <div class="flex-shrink-0">
                    <div class="${esUsuario ? 'bg-success' : 'bg-primary'} text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="bi ${esUsuario ? 'bi-person-fill' : 'bi-person-fill'}"></i>
                    </div>
                </div>
                <div class="flex-grow-1 ${esUsuario ? 'me-3 text-end' : 'ms-3'}">
                    <div class="bg-light rounded p-2">
                        <p class="mb-0 small">${texto}</p>
                    </div>
                    <small class="text-muted">Ahora</small>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function enviarMensaje() {
        const mensaje = chatInput.value.trim();
        if (!mensaje) return;

        agregarMensaje(mensaje, true);
        chatInput.value = '';

        // Simular respuesta automática
        setTimeout(() => {
            const respuesta = respuestas[Math.floor(Math.random() * respuestas.length)];
            agregarMensaje(respuesta, false);
        }, 1000);
    }

    if (chatSend) {
        chatSend.addEventListener('click', enviarMensaje);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                enviarMensaje();
            }
        });
    }
}

// ============================================
// FUNCIÓN: Accesibilidad Avanzada
// ============================================
function initAccesibilidad() {
    // Navegación por teclado mejorada
    document.addEventListener('keydown', function (e) {
        // Skip to main content con Alt + S
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            const main = document.querySelector('main');
            if (main) {
                main.focus();
                main.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            });
        }
    });

    // Mejorar focus visible
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-nav');
    });

    // Agregar ARIA labels donde falten
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
        if (!btn.textContent.trim() && btn.querySelector('i')) {
            const icon = btn.querySelector('i');
            const iconClass = icon.className;
            if (iconClass.includes('heart')) {
                btn.setAttribute('aria-label', 'Agregar a favoritos');
            } else if (iconClass.includes('search')) {
                btn.setAttribute('aria-label', 'Buscar');
            } else if (iconClass.includes('close') || iconClass.includes('x')) {
                btn.setAttribute('aria-label', 'Cerrar');
            }
        }
    });

    // Skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido principal';
    skipLink.style.cssText = 'position: absolute; top: -40px; left: 0; background: #2563eb; color: white; padding: 8px; z-index: 10000; text-decoration: none;';
    skipLink.addEventListener('focus', function () {
        this.style.top = '0';
    });
    skipLink.addEventListener('blur', function () {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ============================================
// FUNCIÓN: Newsletter
// ============================================
function initNewsletter() {
    const newsletterForm = document.querySelector('#newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = document.querySelector('#newsletter-email');
        const email = emailInput.value.trim();

        if (!email) {
            mostrarToast('Por favor ingresá tu email', 'warning');
            return;
        }

        // Simular suscripción
        const emails = JSON.parse(localStorage.getItem('newsletter_emails') || '[]');
        if (emails.includes(email)) {
            mostrarToast('Ya estás suscripto a nuestro newsletter', 'info');
            return;
        }

        emails.push(email);
        localStorage.setItem('newsletter_emails', JSON.stringify(emails));

        mostrarToast('¡Te suscribiste exitosamente al newsletter!', 'success');
        emailInput.value = '';
    });
}

