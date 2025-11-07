// ============================================
// TOURS GUIADOS (ONBOARDING)
// ============================================

(function () {
    'use strict';

    let currentStep = 0;
    let tourSteps = [];
    let tourOverlay = null;
    let tourHighlight = null;

    const tours = {
        home: [
            {
                element: '#hero',
                title: '¡Bienvenido a ConectaLab!',
                content: 'Conectamos profesionales con clientes en San Nicolás de los Arroyos. Deslizá para conocer más.',
                position: 'bottom'
            },
            {
                element: '[aria-labelledby="como-funciona-title"]',
                title: 'Cómo funciona',
                content: 'Simple, rápido y seguro. En solo 3 pasos conectás con el profesional que necesitás.',
                position: 'bottom'
            },
            {
                element: '[aria-labelledby="servicios-title"]',
                title: 'Servicios populares',
                content: 'Acá podés ver las categorías más elegidas por nuestra comunidad. Hacé clic para explorar más.',
                position: 'top'
            },
            {
                element: '[aria-labelledby="estadisticas-title"]',
                title: 'Números que nos respaldan',
                content: 'Más de 500 profesionales verificados y miles de clientes satisfechos confían en nosotros.',
                position: 'bottom'
            },
            {
                element: '[aria-labelledby="testimonios-title"]',
                title: 'Lo que dicen nuestros usuarios',
                content: 'Leé las experiencias de clientes que ya usaron nuestros servicios.',
                position: 'top'
            },
            {
                element: '.navbar',
                title: 'Navegación principal',
                content: 'Usá el menú superior para acceder a todas las secciones: Servicios, Sobre Nosotros, Contacto y más.',
                position: 'bottom'
            },
            {
                element: '#theme-toggle',
                title: 'Personalizá tu experiencia',
                content: 'Cambiá entre modo claro y oscuro según tu preferencia.',
                position: 'left'
            },
            {
                element: '#accessibility-menu-toggle',
                title: 'Opciones de accesibilidad',
                content: 'Ajustá el tamaño de fuente, activá alto contraste o modo lectura para una mejor experiencia.',
                position: 'left'
            }
        ],
        servicios: [
            {
                element: '.page-header',
                title: 'Nuestros servicios',
                content: 'Explorá más de 50 servicios profesionales disponibles en San Nicolás y alrededores.',
                position: 'bottom'
            },
            {
                element: '#categorias-list',
                title: 'Filtrá por categoría',
                content: 'Hacé clic en las categorías para filtrar los servicios. Podés seleccionar múltiples categorías.',
                position: 'bottom'
            },
            {
                element: '#search-input',
                title: 'Buscá servicios',
                content: 'Escribí palabras clave para encontrar servicios específicos. La búsqueda es en tiempo real.',
                position: 'bottom'
            },
            {
                element: '.view-toggle-container',
                title: 'Cambiá la vista',
                content: 'Alterná entre vista de cuadrícula y lista según tu preferencia. Tu elección se guarda automáticamente.',
                position: 'bottom'
            },
            {
                element: '#servicios-container',
                title: 'Explorá los servicios',
                content: 'Hacé clic en cualquier servicio para ver más detalles, precios, disponibilidad y calificaciones.',
                position: 'top'
            },
            {
                element: '.favorito-btn',
                title: 'Guardá tus favoritos',
                content: 'Hacé clic en el corazón para guardar servicios que te interesen y acceder rápido después.',
                position: 'right'
            }
        ],
        perfil: [
            {
                element: '.perfil-header',
                title: 'Tu perfil',
                content: 'Acá podés ver y editar tu información personal, foto de perfil y datos de contacto.',
                position: 'bottom'
            },
            {
                element: '#favoritos-tab',
                title: 'Tus favoritos',
                content: 'Guardá servicios que te interesen para acceder rápido después. Podés exportarlos como PDF o JSON.',
                position: 'bottom'
            },
            {
                element: '#servicios-tab',
                title: 'Tus servicios',
                content: 'Si sos profesional, acá podés gestionar los servicios que ofrecés.',
                position: 'bottom'
            }
        ]
    };

    function initTour() {
        // Usar event delegation en el dropdown menu para mayor robustez
        const accessibilityMenu = document.querySelector('#accessibility-menu-toggle')?.closest('.nav-item');
        const dropdownMenu = accessibilityMenu?.querySelector('.dropdown-menu');

        if (dropdownMenu) {
            console.log('[Tour] Dropdown menu encontrado, configurando event delegation');
            // Event delegation desde el dropdown menu
            dropdownMenu.addEventListener('click', function (e) {
                console.log('[Tour] Click en dropdown menu', e.target);

                // Buscar el botón start-tour desde cualquier elemento clickeado dentro
                let target = e.target;
                let startTourBtn = null;

                // Si el click fue directamente en el botón
                if (target.id === 'start-tour') {
                    startTourBtn = target;
                }
                // Si el click fue en un hijo (icono, span, etc.), buscar el padre con id
                else if (target.closest && target.closest('#start-tour')) {
                    startTourBtn = target.closest('#start-tour');
                }
                // Buscar en el árbol de padres
                else {
                    let current = target.parentElement;
                    while (current && current !== dropdownMenu) {
                        if (current.id === 'start-tour') {
                            startTourBtn = current;
                            break;
                        }
                        current = current.parentElement;
                    }
                }

                if (startTourBtn) {
                    console.log('[Tour] Click detectado en start-tour vía event delegation');
                    handleTourStart(e, startTourBtn);
                    return;
                }
            }, true); // Capture phase para interceptar antes
        } else {
            console.warn('[Tour] Dropdown menu no encontrado');
        }

        // También buscar el botón directamente como fallback
        let startBtn = document.getElementById('start-tour');

        // Si no está disponible, esperar un poco más
        if (!startBtn) {
            setTimeout(() => {
                startBtn = document.getElementById('start-tour');
                if (startBtn) {
                    setupTourButton(startBtn);
                } else {
                    console.warn('[Tour] Botón start-tour no encontrado después de esperar');
                }
            }, 500);
        } else {
            setupTourButton(startBtn);
        }
    }

    function handleTourStart(e, btn) {
        console.log('[Tour] handleTourStart llamado', { e, btn });

        // Prevenir navegación y propagación inmediatamente
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }

        // Prevenir comportamiento por defecto del enlace
        if (btn && btn.tagName === 'A') {
            btn.href = 'javascript:void(0)';
        }

        console.log('[Tour] Evento prevenido, cerrando dropdown...');

        // Cerrar dropdown primero
        const dropdownParent = btn?.closest('.nav-item');
        if (dropdownParent) {
            const dropdownElement = dropdownParent.querySelector('[data-bs-toggle="dropdown"]');
            const dropdownMenu = dropdownParent.querySelector('.dropdown-menu');

            if (dropdownElement) {
                // Intentar cerrar con Bootstrap si está disponible
                if (typeof bootstrap !== 'undefined') {
                    try {
                        const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                        if (dropdown) {
                            dropdown.hide();
                        }
                    } catch (err) {
                        console.warn('[Tour] Error cerrando dropdown con Bootstrap:', err);
                    }
                }

                // También remover la clase show manualmente como fallback
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('show');
                    dropdownMenu.setAttribute('aria-hidden', 'true');
                }
                dropdownElement.setAttribute('aria-expanded', 'false');
                dropdownElement.classList.remove('show');
            }
        }

        // Esperar a que el dropdown se cierre antes de iniciar el tour
        setTimeout(() => {
            // Determinar qué tour mostrar según la página
            const currentPath = window.location.pathname || '';
            const currentHref = window.location.href || '';
            const fileName = currentPath.split('/').pop() || currentHref.split('/').pop() || '';
            let tourKey = 'home';

            console.log('[Tour] Detectando página:', { currentPath, currentHref, fileName });

            // Detectar página actual usando múltiples métodos
            if (fileName.includes('servicios') || currentPath.includes('servicios') || currentHref.includes('servicios')) {
                tourKey = 'servicios';
            } else if (fileName.includes('perfil') || currentPath.includes('perfil') || currentHref.includes('perfil')) {
                tourKey = 'perfil';
            } else if (fileName.includes('index') ||
                fileName === '' ||
                currentPath === '/' ||
                currentPath.endsWith('/') ||
                (!currentPath.includes('.html') && !currentHref.includes('pages/') && !fileName)) {
                tourKey = 'home';
            }

            console.log('[Tour] TourKey detectado:', tourKey);
            console.log('[Tour] Iniciando tour:', tourKey, 'en página:', currentPath || currentHref);
            startTour(tourKey);
        }, 300);

        return false;
    }

    function setupTourButton(startBtn) {
        // Evitar múltiples inicializaciones
        if (startBtn.hasAttribute('data-tour-initialized')) {
            return;
        }

        // Marcar como inicializado
        startBtn.setAttribute('data-tour-initialized', 'true');

        // Cambiar href para evitar navegación
        if (startBtn.tagName === 'A') {
            startBtn.href = 'javascript:void(0)';
            startBtn.setAttribute('role', 'button');
            startBtn.setAttribute('aria-label', 'Iniciar tour guiado');
        }

        // Agregar listener directo como backup adicional
        startBtn.addEventListener('click', function handleTourClick(e) {
            console.log('[Tour] Click detectado directamente en botón');
            handleTourStart(e, startBtn);
        }, true); // Capture phase para interceptar antes

        // Listener adicional en bubble phase
        startBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, false);

        console.log('[Tour] Botón start-tour inicializado correctamente');
    }

    function startTour(tourKey) {
        console.log('[Tour] startTour llamado con tourKey:', tourKey);

        // Limpiar tour anterior si existe
        endTour();

        const allSteps = tours[tourKey] || tours.home;
        if (allSteps.length === 0) {
            console.warn('[Tour] No hay pasos definidos para el tour:', tourKey);
            if (typeof mostrarToast === 'function') {
                mostrarToast('No hay pasos definidos para el tour.', 'warning');
            } else {
                alert('No hay pasos definidos para el tour.');
            }
            return;
        }

        console.log('[Tour] Pasos disponibles:', allSteps.length, 'para tourKey:', tourKey);

        // Filtrar solo los pasos cuyos elementos existen
        tourSteps = allSteps.filter(step => {
            try {
                const element = document.querySelector(step.element);
                // Verificar que el elemento existe y es visible
                if (!element) {
                    console.warn('[Tour] Elemento no encontrado:', step.element);
                    return false;
                }
                const rect = element.getBoundingClientRect();
                const isVisible = (rect.width > 0 && rect.height > 0) ||
                    (element.offsetWidth > 0 && element.offsetHeight > 0);
                if (!isVisible) {
                    console.warn('[Tour] Elemento no visible:', step.element, rect);
                }
                return isVisible;
            } catch (e) {
                console.warn('[Tour] Error buscando elemento del tour:', step.element, e);
                return false;
            }
        });

        console.log('[Tour] Pasos válidos después del filtrado:', tourSteps.length);

        if (tourSteps.length === 0) {
            console.error('[Tour] No hay elementos disponibles para el tour');
            if (typeof mostrarToast === 'function') {
                mostrarToast('No hay elementos disponibles para el tour en esta página.', 'info');
            } else {
                alert('No hay elementos disponibles para el tour en esta página.');
            }
            return;
        }

        console.log('[Tour] Iniciando tour con', tourSteps.length, 'pasos');
        currentStep = 0;
        createTourOverlay();
        console.log('[Tour] Overlay creado');

        // Pequeño delay para asegurar que el overlay esté renderizado
        setTimeout(() => {
            console.log('[Tour] Mostrando primer paso');
            showStep(0);
        }, 150);
    }

    function createTourOverlay() {
        // Ocultar navbar móvil cuando el tour está activo
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Detectar modo oscuro
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
            document.body.classList.contains('dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Crear overlay oscuro - más oscuro para mejor contraste
        tourOverlay = document.createElement('div');
        tourOverlay.id = 'tour-overlay';
        tourOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${isDarkMode ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.82)'};
            z-index: 9998;
            pointer-events: none;
        `;
        document.body.appendChild(tourOverlay);

        // Crear highlight para el elemento actual - MUCHO más visible
        tourHighlight = document.createElement('div');
        tourHighlight.id = 'tour-highlight';
        const highlightColor = isDarkMode ? '#60a5fa' : '#3b82f6';
        const highlightGlow = isDarkMode ? '#93c5fd' : '#60a5fa';
        tourHighlight.style.cssText = `
            position: fixed;
            border: 5px solid ${highlightColor};
            border-radius: 12px;
            box-shadow: 
                0 0 0 9999px ${isDarkMode ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.82)'},
                0 0 0 6px ${highlightColor}80,
                0 0 0 10px ${highlightGlow}40,
                0 0 30px ${highlightColor}90,
                0 0 50px ${highlightGlow}60,
                0 8px 20px rgba(0, 0, 0, 0.5);
            z-index: 9999;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(tourHighlight);

        // Crear tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'tour-tooltip';

        // Detectar modo oscuro para tooltip
        const tooltipDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
            document.body.classList.contains('dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

        tooltip.className = tooltipDarkMode ? 'tour-tooltip-dark' : 'tour-tooltip-light';
        tooltip.style.cssText = `
            position: fixed;
            background: ${tooltipDarkMode ? '#1f2937' : 'white'};
            color: ${tooltipDarkMode ? '#f3f4f6' : '#1f2937'};
            border-radius: 12px;
            padding: 1.5rem;
            max-width: 380px;
            box-shadow: 
                0 10px 40px rgba(0, 0, 0, ${tooltipDarkMode ? '0.6' : '0.2'}),
                0 4px 12px rgba(0, 0, 0, ${tooltipDarkMode ? '0.4' : '0.15'}),
                0 0 0 1px ${tooltipDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
            z-index: 10000;
            pointer-events: auto;
            border: 1px solid ${tooltipDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
        `;
        document.body.appendChild(tooltip);
    }

    function showStep(stepIndex) {
        // Validar índice
        if (stepIndex < 0) {
            currentStep = 0;
            stepIndex = 0;
        }

        if (stepIndex >= tourSteps.length) {
            endTour();
            return;
        }

        const step = tourSteps[stepIndex];
        if (!step) {
            endTour();
            return;
        }

        let element;
        try {
            element = document.querySelector(step.element);
        } catch (e) {
            console.warn('Error al buscar elemento:', step.element, e);
            // Intentar siguiente paso
            if (stepIndex + 1 < tourSteps.length) {
                showStep(stepIndex + 1);
            } else {
                endTour();
            }
            return;
        }

        if (!element) {
            // Si el elemento no existe, intentar el siguiente paso
            if (stepIndex + 1 < tourSteps.length) {
                showStep(stepIndex + 1);
            } else {
                endTour();
            }
            return;
        }

        // Actualizar currentStep
        currentStep = stepIndex;

        // Detectar si es móvil (declarar una sola vez)
        const isMobile = window.innerWidth <= 768;

        // Detectar modo oscuro para el tooltip
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
            document.body.classList.contains('dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Calcular posición del elemento
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Posicionar highlight con padding más visible
        const highlightPadding = isMobile ? 8 : 10;
        tourHighlight.style.top = (rect.top + scrollY - highlightPadding) + 'px';
        tourHighlight.style.left = (rect.left + scrollX - highlightPadding) + 'px';
        tourHighlight.style.width = (rect.width + (highlightPadding * 2)) + 'px';
        tourHighlight.style.height = (rect.height + (highlightPadding * 2)) + 'px';

        // Actualizar el highlight para modo oscuro si cambió - hacerlo MUY visible
        const currentDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' ||
            document.body.classList.contains('dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
        const currentHighlightColor = currentDarkMode ? '#60a5fa' : '#3b82f6';
        const currentGlowColor = currentDarkMode ? '#93c5fd' : '#60a5fa';

        // Actualizar estilos del highlight para máxima visibilidad
        tourHighlight.style.borderColor = currentHighlightColor;
        tourHighlight.style.borderWidth = isMobile ? '5px' : '6px';
        tourHighlight.style.boxShadow = `
            0 0 0 9999px ${currentDarkMode ? 'rgba(0, 0, 0, 0.92)' : 'rgba(0, 0, 0, 0.82)'},
            0 0 0 6px ${currentHighlightColor}80,
            0 0 0 12px ${currentGlowColor}50,
            0 0 40px ${currentHighlightColor}100,
            0 0 60px ${currentGlowColor}70,
            0 8px 20px rgba(0, 0, 0, 0.6)
        `;

        // Posicionar tooltip
        const tooltip = document.getElementById('tour-tooltip');
        tooltip.style.maxWidth = isMobile ? 'calc(100vw - 40px)' : '380px';
        tooltip.style.fontSize = isMobile ? '0.9rem' : '1rem';

        // Aplicar estilos al tooltip según el modo
        if (isDarkMode) {
            tooltip.style.background = '#1f2937';
            tooltip.style.color = '#f3f4f6';
            tooltip.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            tooltip.style.background = 'white';
            tooltip.style.color = '#1f2937';
            tooltip.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }

        const textMutedColor = isDarkMode ? 'rgba(243, 244, 246, 0.7)' : '';

        tooltip.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="mb-0" style="font-size: ${isMobile ? '1rem' : '1.25rem'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'}">${step.title}</h5>
                <button type="button" class="btn-close" id="tour-close" aria-label="Cerrar tour" style="${isDarkMode ? 'filter: invert(1)' : ''}"></button>
            </div>
            <p class="mb-3" style="font-size: ${isMobile ? '0.85rem' : '0.95rem'}; color: ${isDarkMode ? 'rgba(243, 244, 246, 0.9)' : '#4b5563'}">${step.content}</p>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <small class="text-muted" style="color: ${textMutedColor || ''}">${stepIndex + 1} de ${tourSteps.length}</small>
                <div class="d-flex gap-2">
                    ${stepIndex > 0 ? '<button class="btn btn-sm btn-outline-secondary" id="tour-prev">Anterior</button>' : ''}
                    <button class="btn btn-sm btn-primary" id="tour-next">
                        ${stepIndex === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                    </button>
                </div>
            </div>
        `;

        // Posicionar tooltip según la posición especificada
        let tooltipTop, tooltipLeft;
        const tooltipWidth = isMobile ? Math.min(320, window.innerWidth - 40) : 380;
        const tooltipHalfWidth = tooltipWidth / 2;

        // En móvil, preferir posición bottom o top para mejor visibilidad
        if (isMobile) {
            // En móvil, siempre poner el tooltip abajo o arriba del elemento
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow > 200 || spaceBelow > spaceAbove) {
                // Poner abajo
                tooltipTop = rect.bottom + scrollY + 15;
                tooltipLeft = Math.max(15, Math.min(rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth, window.innerWidth - tooltipWidth - 15));
            } else {
                // Poner arriba
                tooltipTop = rect.top + scrollY - (tooltipWidth > 250 ? 220 : 200);
                tooltipLeft = Math.max(15, Math.min(rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth, window.innerWidth - tooltipWidth - 15));
            }
        } else {
            // Desktop: usar posición especificada
            if (step.position === 'bottom') {
                tooltipTop = rect.bottom + scrollY + 20;
                tooltipLeft = rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth;
            } else if (step.position === 'top') {
                tooltipTop = rect.top + scrollY - 200;
                tooltipLeft = rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth;
            } else if (step.position === 'left') {
                tooltipTop = rect.top + scrollY + (rect.height / 2) - 100;
                tooltipLeft = rect.left + scrollX - 400;
            } else { // right
                tooltipTop = rect.top + scrollY + (rect.height / 2) - 100;
                tooltipLeft = rect.right + scrollX + 20;
            }
        }

        // Ajustar si se sale de la pantalla (especialmente en mobile)
        const margin = isMobile ? 15 : 20;
        if (tooltipLeft < margin) tooltipLeft = margin;
        if (tooltipLeft > window.innerWidth - tooltipWidth - margin) {
            tooltipLeft = window.innerWidth - tooltipWidth - margin;
        }
        if (tooltipTop < margin) tooltipTop = margin;
        const maxTop = window.innerHeight - (isMobile ? 250 : 200);
        if (tooltipTop > maxTop) {
            tooltipTop = maxTop;
        }

        tooltip.style.top = tooltipTop + 'px';
        tooltip.style.left = tooltipLeft + 'px';

        // Scroll al elemento si es necesario (mejorado para mobile)
        // isMobile ya está declarado arriba, reutilizamos la variable
        setTimeout(() => {
            element.scrollIntoView({
                behavior: 'smooth',
                block: isMobile ? 'center' : 'center',
                inline: 'nearest'
            });

            // Ajustar posición después del scroll en mobile
            if (isMobile) {
                setTimeout(() => {
                    const newRect = element.getBoundingClientRect();
                    const newScrollY = window.scrollY;
                    const newScrollX = window.scrollX;

                    // Recalcular posición del highlight con el mismo padding
                    const highlightPaddingMobile = isMobile ? 8 : 10;
                    tourHighlight.style.top = (newRect.top + newScrollY - highlightPaddingMobile) + 'px';
                    tourHighlight.style.left = (newRect.left + newScrollX - highlightPaddingMobile) + 'px';
                    tourHighlight.style.width = (newRect.width + (highlightPaddingMobile * 2)) + 'px';
                    tourHighlight.style.height = (newRect.height + (highlightPaddingMobile * 2)) + 'px';

                    // Recalcular posición del tooltip
                    const recalcTooltipWidth = isMobile ? Math.min(320, window.innerWidth - 40) : 380;
                    const recalcTooltipHalfWidth = recalcTooltipWidth / 2;

                    let newTooltipTop, newTooltipLeft;
                    if (step.position === 'bottom') {
                        newTooltipTop = newRect.bottom + newScrollY + 20;
                        newTooltipLeft = newRect.left + newScrollX + (newRect.width / 2) - recalcTooltipHalfWidth;
                    } else if (step.position === 'top') {
                        newTooltipTop = newRect.top + newScrollY - 180;
                        newTooltipLeft = newRect.left + newScrollX + (newRect.width / 2) - recalcTooltipHalfWidth;
                    } else if (step.position === 'left') {
                        newTooltipTop = newRect.top + newScrollY + (newRect.height / 2) - 100;
                        newTooltipLeft = newRect.left + newScrollX - (isMobile ? 340 : 400);
                    } else {
                        newTooltipTop = newRect.top + newScrollY + (newRect.height / 2) - 100;
                        newTooltipLeft = newRect.right + newScrollX + 20;
                    }

                    // Ajustar si se sale de la pantalla
                    if (newTooltipLeft < 20) newTooltipLeft = 20;
                    if (newTooltipLeft > window.innerWidth - recalcTooltipWidth - 20) {
                        newTooltipLeft = window.innerWidth - recalcTooltipWidth - 20;
                    }
                    if (newTooltipTop < 20) newTooltipTop = 20;
                    if (newTooltipTop > window.innerHeight - 200) {
                        newTooltipTop = window.innerHeight - 200;
                    }

                    // Obtener el tooltip actualizado del DOM (puede haber cambiado después del clone)
                    const currentTooltip = document.getElementById('tour-tooltip');
                    if (currentTooltip) {
                        currentTooltip.style.top = newTooltipTop + 'px';
                        currentTooltip.style.left = newTooltipLeft + 'px';
                    }
                }, 500);
            }
        }, 100);

        // Event listeners - usar event delegation para evitar duplicados
        // Obtener el tooltip del DOM (puede haber cambiado)
        const tooltipForListeners = document.getElementById('tour-tooltip');
        if (tooltipForListeners) {
            // Remover todos los listeners anteriores clonando el elemento
            const newTooltip = tooltipForListeners.cloneNode(true);
            tooltipForListeners.parentNode.replaceChild(newTooltip, tooltipForListeners);

            // Agregar listeners usando event delegation
            newTooltip.addEventListener('click', function (e) {
                if (e.target.id === 'tour-close' || e.target.closest('#tour-close')) {
                    endTour();
                } else if (e.target.id === 'tour-next' || e.target.closest('#tour-next')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (stepIndex + 1 < tourSteps.length) {
                        showStep(stepIndex + 1);
                    } else {
                        endTour();
                    }
                } else if (e.target.id === 'tour-prev' || e.target.closest('#tour-prev')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (stepIndex > 0) {
                        showStep(stepIndex - 1);
                    }
                }
            });
        }
    }

    function endTour() {
        console.log('Finalizando tour');

        // Mostrar navbar móvil nuevamente
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = '';
        }

        if (tourOverlay) {
            tourOverlay.remove();
            tourOverlay = null;
        }
        if (tourHighlight) {
            tourHighlight.remove();
            tourHighlight = null;
        }
        const tooltip = document.getElementById('tour-tooltip');
        if (tooltip) {
            tooltip.remove();
        }

        // Resetear variables
        currentStep = 0;
        tourSteps = [];

        // Marcar tour como completado
        const currentPath = window.location.pathname || window.location.href;
        const currentHref = window.location.href;
        let tourKey = 'home';

        if (currentPath.includes('servicios.html') || currentHref.includes('servicios.html')) {
            tourKey = 'servicios';
        } else if (currentPath.includes('perfil.html') || currentHref.includes('perfil.html')) {
            tourKey = 'perfil';
        } else if (currentPath.includes('index.html') ||
            currentPath === '/' ||
            currentPath.endsWith('/') ||
            (!currentPath.includes('.html') && !currentHref.includes('pages/'))) {
            tourKey = 'home';
        }

        localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    }

    // Inicializar cuando el DOM esté listo
    function initializeTour() {
        // Esperar a que Bootstrap esté disponible si es necesario
        if (typeof bootstrap === 'undefined' && document.querySelector('[data-bs-toggle="dropdown"]')) {
            // Si Bootstrap aún no está cargado, esperar un poco más
            setTimeout(initializeTour, 100);
            return;
        }

        initTour();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Esperar un poco más para asegurar que todo esté listo
            setTimeout(initializeTour, 100);
        });
    } else {
        // DOM ya está listo, pero esperar un poco para Bootstrap
        setTimeout(initializeTour, 100);
    }

    // También intentar inicializar cuando la ventana se carga completamente (fallback)
    let loadAttempted = false;
    window.addEventListener('load', function () {
        if (!loadAttempted) {
            loadAttempted = true;
            // Verificar si el botón existe y no tiene listener aún
            const startBtn = document.getElementById('start-tour');
            if (startBtn && !startBtn.hasAttribute('data-tour-initialized')) {
                console.log('Inicializando tour desde evento load (fallback)');
                setTimeout(initTour, 200);
            }
        }
    });
})();

