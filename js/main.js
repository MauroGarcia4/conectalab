// ============================================
// CONECTALAB - Funcionalidades JavaScript
// ============================================

// Error Tracking - Capturar errores desde el inicio
if (typeof errorTracker !== 'undefined') {
    // El error tracker ya está cargado desde el HTML
    console.log('[ConectaLab] Error tracker inicializado');
} else {
    // Fallback si no se cargó el error tracker
    console.warn('[ConectaLab] Error tracker no disponible');
}

// ============================================
// REGISTRO DE SERVICE WORKER
// ============================================
if ('serviceWorker' in navigator) {
    // Solo registrar si estamos en http/https (no en file://)
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
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
    } else {
        console.log('[Service Worker] No disponible en protocolo file://. Usá un servidor local (ver SERVIDOR_LOCAL.md)');
    }
}

// ============================================
// DETECCIÓN DE CARGA DE FUENTES
// ============================================
if ('fonts' in document) {
    document.fonts.ready.then(function () {
        document.documentElement.classList.add('fonts-loaded');
    });
} else {
    // Fallback para navegadores antiguos
    window.addEventListener('load', function () {
        document.documentElement.classList.add('fonts-loaded');
    });
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // CODE SPLITTING - Cargar módulos solo cuando se necesiten
    // ============================================
    
    // Cargar módulo de servicios solo si existe el contenedor
    // Nota: Para usar import dinámico, los scripts deben ser type="module"
    // Por ahora, cargamos condicionalmente las funciones
    if (document.querySelector('#servicios-container')) {
        // Cargar funciones de servicios solo si existen
        if (typeof initServiciosFiltros === 'function') {
            initServiciosFiltros();
        } else {
            // Cargar script de servicios dinámicamente si no está disponible
            const serviciosScript = document.createElement('script');
            serviciosScript.src = 'js/servicios-data.js';
            serviciosScript.onload = () => {
                if (typeof initServiciosFiltros === 'function') {
                    initServiciosFiltros();
                }
            };
            document.head.appendChild(serviciosScript);
        }
    }

    // ============================================
    // 1. BOTÓN VOLVER ARRIBA
    // ============================================
    initBackToTop();

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

    // ============================================
    // 18. GESTIÓN DE SESIÓN Y NAVBAR
    // ============================================
    actualizarEstadoSesion();
    
    // Escuchar cambios de sesión
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                actualizarEstadoSesion();
            }
        });
    }

    // ============================================
    // 19. BOTTOM NAVIGATION - Actualizar estado activo
    // ============================================
    initBottomNavigation();
});

// ============================================
// FUNCIÓN: Bottom Navigation
// ============================================
function initBottomNavigation() {
    // Solo en móvil
    if (window.innerWidth > 991) {
        // En desktop, asegurar que el bottom-nav esté oculto
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
        return;
    }

    // Eliminar cualquier botón de chat que pueda estar interfiriendo en móvil
    const chatButtons = document.querySelectorAll('button[data-bs-target="#chatModal"]:not(.bottom-nav-item), button[aria-label="Abrir chat"]:not(.bottom-nav-item)');
    chatButtons.forEach(btn => {
        if (!btn.closest('.bottom-nav')) {
            btn.remove();
        }
    });

    // Asegurar que el bottom-nav siempre sea visible
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        bottomNav.style.display = 'flex';
        bottomNav.style.visibility = 'visible';
        bottomNav.style.opacity = '1';
        bottomNav.style.position = 'fixed';
        bottomNav.style.bottom = '0';
        bottomNav.style.left = '0';
        bottomNav.style.right = '0';
        bottomNav.style.zIndex = '1050';
        bottomNav.classList.remove('d-none');
    }

    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

    bottomNavItems.forEach(item => {
        const href = item.getAttribute('href');
        let isActive = false;

        // Verificar si es la página actual
        if (href) {
            const hrefPage = href.split('/').pop();
            if (currentPage === hrefPage || 
                (currentPage === 'index.html' && (hrefPage === 'index.html' || href.includes('index.html'))) ||
                (currentPage === 'guias.html' && hrefPage === 'guias.html') ||
                (currentPage === 'perfil.html' && item.id === 'bottom-nav-user')) {
                isActive = true;
            }
        } else if (item.id === 'bottom-nav-user' && currentPage === 'perfil.html') {
            isActive = true;
        }

        if (isActive) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Manejar click en botón de usuario
    const userBtn = document.querySelector('#bottom-nav-user');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            // Si estamos en perfil, no hacer nada
            if (currentPage === 'perfil.html') {
                return;
            }
            
            // Intentar abrir menú de usuario
            const userMenu = document.querySelector('#mainMenu .dropdown-toggle, .navbar .dropdown-toggle');
            if (userMenu) {
                userMenu.click();
            } else {
                // Verificar si hay sesión activa
                if (typeof tieneSesionActiva === 'function' && tieneSesionActiva()) {
                    window.location.href = currentPath.includes('pages/') ? 'perfil.html' : 'pages/perfil.html';
                } else {
                    window.location.href = currentPath.includes('pages/') ? 'inicio-sesion.html' : 'pages/inicio-sesion.html';
                }
            }
        });
    }

    // Verificación periódica para asegurar visibilidad (solo en móvil)
    if (bottomNav && window.innerWidth <= 991) {
        setInterval(() => {
            if (window.innerWidth <= 991) {
                const computedStyle = window.getComputedStyle(bottomNav);
                if (computedStyle.display === 'none' || 
                    computedStyle.visibility === 'hidden' ||
                    bottomNav.classList.contains('d-none')) {
                    bottomNav.style.display = 'flex';
                    bottomNav.style.visibility = 'visible';
                    bottomNav.style.opacity = '1';
                    bottomNav.style.position = 'fixed';
                    bottomNav.style.bottom = '0';
                    bottomNav.style.left = '0';
                    bottomNav.style.right = '0';
                    bottomNav.style.zIndex = '1050';
                    bottomNav.classList.remove('d-none');
                }
            }
        }, 1000);
    }
}

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
    formulario.addEventListener('submit', async function (e) {
        e.preventDefault();

        let esValido = true;

        inputs.forEach(input => {
            if (!validarCampo(input)) {
                esValido = false;
            }
        });

        if (esValido) {
            // Obtener datos del formulario
            const nombre = formulario.querySelector('#nombre').value.trim();
            const email = formulario.querySelector('#email-contacto').value.trim();
            const motivo = formulario.querySelector('#motivo').value;
            const mensaje = formulario.querySelector('#mensaje').value.trim();

            // Deshabilitar botón mientras procesa
            const submitBtn = formulario.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

            // Guardar en Supabase
            if (typeof guardarContacto === 'function') {
                try {
                    const resultado = await guardarContacto(nombre, email, motivo, mensaje);
                    
                    if (resultado.success) {
                        // Mostrar mensaje de éxito
                        mostrarMensajeExito(formulario, '¡Mensaje enviado correctamente! Te responderemos a la brevedad.');

                        // Resetear formulario
                        formulario.reset();

                        // Limpiar clases de validación
                        inputs.forEach(input => {
                            input.classList.remove('is-valid', 'is-invalid');
                        });
                    } else {
                        mostrarMensajeError(formulario, resultado.error || 'Error al enviar el mensaje. Intentá nuevamente.');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                } catch (error) {
                    console.error('Error guardando contacto:', error);
                    mostrarMensajeError(formulario, 'Error al enviar el mensaje. Intentá nuevamente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } else {
                // Fallback si Supabase no está disponible
                mostrarMensajeExito(formulario, '¡Mensaje enviado correctamente! Te responderemos a la brevedad.');
                formulario.reset();
                inputs.forEach(input => {
                    input.classList.remove('is-valid', 'is-invalid');
                });
            }
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
    formulario.addEventListener('submit', async function (e) {
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
            // Deshabilitar botón mientras procesa
            const submitBtn = formulario.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

            // Registrar usuario en Supabase
            if (typeof registrarUsuario === 'function') {
                try {
                    const resultado = await registrarUsuario(
                        email.value.trim(),
                        password.value,
                        nombre.value.trim()
                    );

                    if (resultado.success) {
                        mostrarMensajeExito(formulario, '¡Registro exitoso! Ya podés iniciar sesión.');
                        formulario.reset();
                        formulario.querySelectorAll('input').forEach(input => {
                            input.classList.remove('is-valid', 'is-invalid');
                        });

                        setTimeout(() => {
                            window.location.href = 'inicio-sesion.html';
                        }, 2000);
                    } else {
                        mostrarMensajeError(formulario, resultado.error || 'Error al registrarse. Intentá nuevamente.');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                } catch (error) {
                    console.error('Error en registro:', error);
                    mostrarMensajeError(formulario, 'Error al registrarse. Intentá nuevamente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } else {
                // Fallback si Supabase no está disponible
                mostrarMensajeExito(formulario, '¡Registro exitoso! Ya podés iniciar sesión.');
                formulario.reset();
                setTimeout(() => {
                    window.location.href = 'inicio-sesion.html';
                }, 2000);
            }
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
    formulario.addEventListener('submit', async function (e) {
        e.preventDefault();

        let esValido = true;

        [email, password].forEach(input => {
            if (!validarCampoLogin(input)) {
                esValido = false;
            }
        });

        if (esValido) {
            // Deshabilitar botón mientras procesa
            const submitBtn = formulario.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';

            // Verificar si hay checkbox "recordarme"
            const recordarme = formulario.querySelector('#recordarme');
            const recordarSesion = recordarme ? recordarme.checked : false;

            // Iniciar sesión con Supabase
            if (typeof iniciarSesion === 'function') {
                try {
                    const resultado = await iniciarSesion(
                        email.value.trim(),
                        password.value
                    );

                    if (resultado.success) {
                        // Guardar opción "recordarme" si está marcada
                        if (recordarSesion) {
                            localStorage.setItem('recordarme', 'true');
                            // Guardar credenciales (solo email, nunca password)
                            localStorage.setItem('remembered_email', email.value.trim());
                        } else {
                            localStorage.removeItem('recordarme');
                            localStorage.removeItem('remembered_email');
                        }

                        mostrarMensajeExito(formulario, '¡Inicio de sesión exitoso! Redirigiendo...');
                        
                        // Actualizar navbar y redirigir
                        await actualizarEstadoSesion();
                        
                        setTimeout(() => {
                            // Redirigir a index o perfil según preferencia
                            const redirectPath = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
                            window.location.href = redirectPath;
                        }, 1000);
                    } else {
                        mostrarMensajeError(formulario, resultado.error || 'Credenciales incorrectas. Intentá nuevamente.');
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                } catch (error) {
                    console.error('Error en login:', error);
                    mostrarMensajeError(formulario, 'Error al iniciar sesión. Intentá nuevamente.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            } else {
                // Fallback si Supabase no está disponible
                mostrarMensajeExito(formulario, '¡Inicio de sesión exitoso! Redirigiendo...');
                setTimeout(() => {
                    const redirectPath = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
                    window.location.href = redirectPath;
                }, 1500);
            }
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
// FUNCIÓN: Toggle Modo Oscuro/Claro
// ============================================
function initThemeToggle() {
    const themeToggle = document.querySelector('#theme-toggle');
    const themeIcon = document.querySelector('#theme-icon');

    if (!themeToggle) return;

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Event listener para cambiar tema
    themeToggle.addEventListener('click', function () {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);

        // Mostrar notificación opcional (sin toast para no ser intrusivo)
        // mostrarToast(`Modo ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    });

    function updateThemeIcon(theme) {
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.className = 'bi bi-sun-fill fs-5';
                themeIcon.setAttribute('title', 'Cambiar a modo claro');
            } else {
                themeIcon.className = 'bi bi-moon-fill fs-5';
                themeIcon.setAttribute('title', 'Cambiar a modo oscuro');
            }
        }
    }
}

// ============================================
// FUNCIÓN: Sistema de Favoritos
// ============================================
async function initFavoritos() {
    // Cargar favoritos (intentar Supabase primero, luego localStorage)
    let favoritos = [];
    
    if (typeof getFavoritosSupabase === 'function') {
        try {
            favoritos = await getFavoritosSupabase();
        } catch (error) {
            console.error('Error cargando favoritos de Supabase:', error);
            favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        }
    } else {
        favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    }

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

        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const index = favoritos.indexOf(servicio);
            const icon = this.querySelector('i');

            if (index > -1) {
                // Eliminar favorito
                favoritos.splice(index, 1);
                icon.classList.remove('bi-heart-fill', 'text-danger');
                icon.classList.add('bi-heart');
                mostrarToast('Eliminado de favoritos', 'info');
                
                // Guardar en Supabase o localStorage
                if (typeof removeFavoritoSupabase === 'function') {
                    try {
                        await removeFavoritoSupabase(servicio);
                    } catch (error) {
                        console.error('Error eliminando favorito:', error);
                        localStorage.setItem('favoritos', JSON.stringify(favoritos));
                    }
                } else {
                    localStorage.setItem('favoritos', JSON.stringify(favoritos));
                }
            } else {
                // Agregar favorito
                favoritos.push(servicio);
                icon.classList.remove('bi-heart');
                icon.classList.add('bi-heart-fill', 'text-danger');
                mostrarToast('Agregado a favoritos', 'success');
                
                // Guardar en Supabase o localStorage
                if (typeof saveFavoritoSupabase === 'function') {
                    try {
                        await saveFavoritoSupabase(servicio);
                    } catch (error) {
                        console.error('Error guardando favorito:', error);
                        localStorage.setItem('favoritos', JSON.stringify(favoritos));
                    }
                } else {
                    localStorage.setItem('favoritos', JSON.stringify(favoritos));
                }
            }

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
            btn.addEventListener('click', async function () {
                const servicio = this.getAttribute('data-servicio');
                favoritos = favoritos.filter(f => f !== servicio);
                
                // Guardar en Supabase o localStorage
                if (typeof removeFavoritoSupabase === 'function') {
                    try {
                        await removeFavoritoSupabase(servicio);
                    } catch (error) {
                        console.error('Error eliminando favorito:', error);
                        localStorage.setItem('favoritos', JSON.stringify(favoritos));
                    }
                } else {
                    localStorage.setItem('favoritos', JSON.stringify(favoritos));
                }
                
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
                const redirectPath = window.location.pathname.includes('pages/') ? 'perfil.html#favoritos' : 'pages/perfil.html#favoritos';
                window.location.href = redirectPath;
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
    // IMPORTANTE: Solo observar imágenes que realmente necesitan lazy loading (con data-src)
    // NO observar imágenes que ya tienen src definido
    document.querySelectorAll('img[data-src], picture img[data-src]').forEach(img => {
        // Solo observar si tiene data-src y no tiene src ya cargado
        if (img.dataset.src && !img.src) {
            imageObserver.observe(img);
        }
    });

    // Para imágenes con loading="lazy" que ya tienen src, asegurar que se muestren
    document.querySelectorAll('img[loading="lazy"][src]').forEach(img => {
        if (img.src && !img.dataset.src) {
            img.style.opacity = '1';
            img.classList.add('loaded');
        }
    });
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
    // Crear botón flotante de chat (solo visible en desktop)
    const chatBtn = document.createElement('button');
    chatBtn.className = 'btn btn-primary position-fixed bottom-0 start-0 m-4 shadow rounded-circle chat-btn-desktop d-none d-lg-flex';
    chatBtn.style.cssText = 'width: 60px; height: 60px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; z-index: 1040;';
    chatBtn.innerHTML = '<i class="bi bi-chat-dots"></i>';
    chatBtn.setAttribute('data-bs-toggle', 'modal');
    chatBtn.setAttribute('data-bs-target', '#chatModal');
    chatBtn.setAttribute('aria-label', 'Abrir chat');
    document.body.appendChild(chatBtn);
    
    // Asegurar visibilidad en desktop
    if (window.innerWidth > 991) {
        chatBtn.style.display = 'flex';
        chatBtn.classList.remove('d-none');
    } else {
        chatBtn.style.display = 'none';
        chatBtn.classList.add('d-none');
    }

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

// ============================================
// FUNCIÓN: Actualizar Estado de Sesión y Navbar
// ============================================
async function actualizarEstadoSesion() {
    // Obtener usuario actual
    let usuario = null;
    if (typeof getUsuarioActual === 'function') {
        usuario = await getUsuarioActual();
    } else if (typeof tieneSesionActiva === 'function' && tieneSesionActiva()) {
        const session = localStorage.getItem('user_session');
        usuario = session ? JSON.parse(session) : null;
    }

    // Elementos del navbar
    const perfilLink = document.querySelector('#perfil-link');
    const loginLink = document.querySelector('#login-link');
    const registroLink = document.querySelector('#registro-link');
    const logoutBtn = document.querySelector('#logout-btn');
    const userMenu = document.querySelector('#user-menu');
    const userMenuText = document.querySelector('#user-menu-text');

    if (usuario) {
        // Usuario logueado - mostrar perfil y ocultar login/registro
        if (perfilLink) {
            perfilLink.style.display = 'block';
            // Corregir ruta según ubicación
            const currentPath = window.location.pathname;
            if (currentPath.includes('pages/')) {
                perfilLink.href = 'perfil.html';
            } else {
                perfilLink.href = 'pages/perfil.html';
            }
        }
        if (loginLink) loginLink.style.display = 'none';
        if (registroLink) registroLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (userMenuText) {
            userMenuText.textContent = usuario.nombre || usuario.email;
        }
    } else {
        // Usuario no logueado - ocultar perfil y mostrar login/registro
        if (perfilLink) perfilLink.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
        if (registroLink) registroLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (userMenuText) {
            userMenuText.textContent = 'Usuario';
        }
    }
}

// ============================================
// FUNCIÓN: Cerrar Sesión
// ============================================
async function cerrarSesionUsuario() {
    if (typeof cerrarSesion === 'function') {
        await cerrarSesion();
    } else {
        localStorage.removeItem('user_session');
    }
    
    await actualizarEstadoSesion();
    
    // Redirigir a inicio
    const redirectPath = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
    window.location.href = redirectPath;
}

// Agregar listener para botón de logout cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const logoutBtn = document.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                await cerrarSesionUsuario();
            });
        }
    });
} else {
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await cerrarSesionUsuario();
        });
    }
}

