// ============================================
// TOURS GUIADOS (ONBOARDING)
// ============================================

(function() {
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
        const startBtn = document.getElementById('start-tour');
        if (!startBtn) return;

        // Usar event delegation para evitar problemas con múltiples listeners
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Cerrar dropdown primero
            const dropdownElement = startBtn.closest('.nav-item')?.querySelector('[data-bs-toggle="dropdown"]');
            if (dropdownElement && typeof bootstrap !== 'undefined') {
                const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                if (dropdown) {
                    dropdown.hide();
                }
            }
            
            // Esperar a que el dropdown se cierre antes de iniciar el tour
            setTimeout(() => {
                // Determinar qué tour mostrar según la página
                const currentPage = window.location.pathname;
                let tourKey = 'home';
                
                if (currentPage.includes('servicios.html')) {
                    tourKey = 'servicios';
                } else if (currentPage.includes('perfil.html')) {
                    tourKey = 'perfil';
                }
                
                startTour(tourKey);
            }, 300);
        });
    }

    function startTour(tourKey) {
        // Limpiar tour anterior si existe
        endTour();
        
        const allSteps = tours[tourKey] || tours.home;
        if (allSteps.length === 0) {
            console.warn('No hay pasos definidos para el tour:', tourKey);
            return;
        }

        // Filtrar solo los pasos cuyos elementos existen
        tourSteps = allSteps.filter(step => {
            try {
                const element = document.querySelector(step.element);
                // Verificar que el elemento existe y es visible
                if (!element) return false;
                const rect = element.getBoundingClientRect();
                // Permitir elementos con dimensiones pequeñas pero válidas
                return (rect.width > 0 && rect.height > 0) || 
                       (element.offsetWidth > 0 && element.offsetHeight > 0);
            } catch (e) {
                console.warn('Error buscando elemento del tour:', step.element, e);
                return false;
            }
        });

        if (tourSteps.length === 0) {
            if (typeof mostrarToast === 'function') {
                mostrarToast('No hay elementos disponibles para el tour en esta página.', 'info');
            } else {
                alert('No hay elementos disponibles para el tour en esta página.');
            }
            return;
        }

        console.log('Iniciando tour con', tourSteps.length, 'pasos');
        currentStep = 0;
        createTourOverlay();
        
        // Pequeño delay para asegurar que el overlay esté renderizado
        setTimeout(() => {
            showStep(0);
        }, 100);
    }

    function createTourOverlay() {
        // Crear overlay oscuro
        tourOverlay = document.createElement('div');
        tourOverlay.id = 'tour-overlay';
        tourOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            pointer-events: none;
        `;
        document.body.appendChild(tourOverlay);

        // Crear highlight para el elemento actual
        tourHighlight = document.createElement('div');
        tourHighlight.id = 'tour-highlight';
        tourHighlight.style.cssText = `
            position: fixed;
            border: 3px solid var(--primary, #2563eb);
            border-radius: 8px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
            z-index: 9999;
            pointer-events: none;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(tourHighlight);

        // Crear tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'tour-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            max-width: 350px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            pointer-events: auto;
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

        // Calcular posición del elemento
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Posicionar highlight
        tourHighlight.style.top = (rect.top + scrollY - 4) + 'px';
        tourHighlight.style.left = (rect.left + scrollX - 4) + 'px';
        tourHighlight.style.width = (rect.width + 8) + 'px';
        tourHighlight.style.height = (rect.height + 8) + 'px';

        // Posicionar tooltip
        const tooltip = document.getElementById('tour-tooltip');
        const isMobile = window.innerWidth <= 768;
        tooltip.style.maxWidth = isMobile ? 'calc(100vw - 40px)' : '350px';
        tooltip.style.fontSize = isMobile ? '0.9rem' : '1rem';
        
        tooltip.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="mb-0" style="font-size: ${isMobile ? '1rem' : '1.25rem'}">${step.title}</h5>
                <button type="button" class="btn-close" id="tour-close" aria-label="Cerrar tour"></button>
            </div>
            <p class="mb-3" style="font-size: ${isMobile ? '0.85rem' : '0.95rem'}">${step.content}</p>
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <small class="text-muted">${stepIndex + 1} de ${tourSteps.length}</small>
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
        const isMobile = window.innerWidth <= 768;
        const tooltipWidth = isMobile ? Math.min(320, window.innerWidth - 40) : 350;
        const tooltipHalfWidth = tooltipWidth / 2;

        if (step.position === 'bottom') {
            tooltipTop = rect.bottom + scrollY + 20;
            tooltipLeft = rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth;
        } else if (step.position === 'top') {
            tooltipTop = rect.top + scrollY - (isMobile ? 180 : 200);
            tooltipLeft = rect.left + scrollX + (rect.width / 2) - tooltipHalfWidth;
        } else if (step.position === 'left') {
            tooltipTop = rect.top + scrollY + (rect.height / 2) - 100;
            tooltipLeft = rect.left + scrollX - (isMobile ? 340 : 380);
        } else { // right
            tooltipTop = rect.top + scrollY + (rect.height / 2) - 100;
            tooltipLeft = rect.right + scrollX + 20;
        }

        // Ajustar si se sale de la pantalla (especialmente en mobile)
        const margin = isMobile ? 20 : 20;
        if (tooltipLeft < margin) tooltipLeft = margin;
        if (tooltipLeft > window.innerWidth - tooltipWidth - margin) {
            tooltipLeft = window.innerWidth - tooltipWidth - margin;
        }
        if (tooltipTop < margin) tooltipTop = margin;
        if (tooltipTop > window.innerHeight - 200) {
            tooltipTop = window.innerHeight - 200;
        }

        tooltip.style.top = tooltipTop + 'px';
        tooltip.style.left = tooltipLeft + 'px';

        // Scroll al elemento si es necesario (mejorado para mobile)
        const isMobile = window.innerWidth <= 768;
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
                    
                    // Recalcular posición del highlight
                    tourHighlight.style.top = (newRect.top + newScrollY - 4) + 'px';
                    tourHighlight.style.left = (newRect.left + newScrollX - 4) + 'px';
                    
                    // Recalcular posición del tooltip
                    const tooltipWidth = Math.min(320, window.innerWidth - 40);
                    const tooltipHalfWidth = tooltipWidth / 2;
                    
                    let newTooltipTop, newTooltipLeft;
                    if (step.position === 'bottom') {
                        newTooltipTop = newRect.bottom + newScrollY + 20;
                        newTooltipLeft = newRect.left + newScrollX + (newRect.width / 2) - tooltipHalfWidth;
                    } else if (step.position === 'top') {
                        newTooltipTop = newRect.top + newScrollY - 180;
                        newTooltipLeft = newRect.left + newScrollX + (newRect.width / 2) - tooltipHalfWidth;
                    } else if (step.position === 'left') {
                        newTooltipTop = newRect.top + newScrollY + (newRect.height / 2) - 100;
                        newTooltipLeft = newRect.left + newScrollX - 340;
                    } else {
                        newTooltipTop = newRect.top + newScrollY + (newRect.height / 2) - 100;
                        newTooltipLeft = newRect.right + newScrollX + 20;
                    }
                    
                    // Ajustar si se sale de la pantalla
                    if (newTooltipLeft < 20) newTooltipLeft = 20;
                    if (newTooltipLeft > window.innerWidth - tooltipWidth - 20) {
                        newTooltipLeft = window.innerWidth - tooltipWidth - 20;
                    }
                    if (newTooltipTop < 20) newTooltipTop = 20;
                    if (newTooltipTop > window.innerHeight - 200) {
                        newTooltipTop = window.innerHeight - 200;
                    }
                    
                    tooltip.style.top = newTooltipTop + 'px';
                    tooltip.style.left = newTooltipLeft + 'px';
                }, 500);
            }
        }, 100);

        // Event listeners - usar event delegation para evitar duplicados
        const tooltip = document.getElementById('tour-tooltip');
        if (tooltip) {
            // Remover todos los listeners anteriores clonando el elemento
            const newTooltip = tooltip.cloneNode(true);
            tooltip.parentNode.replaceChild(newTooltip, tooltip);
            
            // Agregar listeners usando event delegation
            newTooltip.addEventListener('click', function(e) {
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
        const currentPage = window.location.pathname;
        let tourKey = 'home';
        if (currentPage.includes('servicios.html')) {
            tourKey = 'servicios';
        } else if (currentPage.includes('perfil.html')) {
            tourKey = 'perfil';
        }
        localStorage.setItem(`tour-${tourKey}-completed`, 'true');
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTour();
        });
    } else {
        // DOM ya está listo
        initTour();
    }
})();

