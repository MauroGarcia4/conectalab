// ============================================
// TOUCH GESTURES - Gestos táctiles para móvil
// ============================================

class TouchGestures {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.pullToRefreshThreshold = 80;
        this.pullToRefreshActive = false;
        this.init();
    }

    init() {
        // Solo en dispositivos táctiles
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.initSwipeGestures();
            this.initPullToRefresh();
            this.initQuickActions();
        }
    }

    // Swipe para navegar entre servicios
    initSwipeGestures() {
        const swipeableContainers = document.querySelectorAll('.swipeable, .carousel, .servicios-container');
        
        swipeableContainers.forEach(container => {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(container, touchStartX, touchStartY, touchEndX, touchEndY);
            }, { passive: true });
        });
    }

    handleSwipe(element, startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Solo procesar si es un swipe horizontal
        if (absDeltaX > absDeltaY && absDeltaX > this.minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe derecho - Anterior
                this.triggerSwipeAction(element, 'right');
            } else {
                // Swipe izquierdo - Siguiente
                this.triggerSwipeAction(element, 'left');
            }
        }
    }

    triggerSwipeAction(element, direction) {
        // Para carousels de Bootstrap
        const carousel = element.closest('.carousel');
        if (carousel) {
            const carouselInstance = bootstrap.Carousel.getInstance(carousel);
            if (carouselInstance) {
                if (direction === 'left') {
                    carouselInstance.next();
                } else {
                    carouselInstance.prev();
                }
                return;
            }
        }

        // Para contenedores de servicios
        if (element.classList.contains('servicios-container')) {
            const cards = element.querySelectorAll('.servicio-card, .card');
            const currentIndex = Array.from(cards).findIndex(card => {
                const rect = card.getBoundingClientRect();
                return rect.left >= 0 && rect.left < window.innerWidth / 2;
            });

            if (currentIndex !== -1) {
                let nextIndex;
                if (direction === 'left' && currentIndex < cards.length - 1) {
                    nextIndex = currentIndex + 1;
                } else if (direction === 'right' && currentIndex > 0) {
                    nextIndex = currentIndex - 1;
                }

                if (nextIndex !== undefined) {
                    cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }

        // Evento personalizado para otros elementos
        element.dispatchEvent(new CustomEvent('swipe', {
            detail: { direction }
        }));
    }

    // Pull to Refresh
    initPullToRefresh() {
        let touchStartY = 0;
        let touchCurrentY = 0;
        let pullDistance = 0;
        let refreshIndicator = null;

        // Crear indicador de refresh
        refreshIndicator = document.createElement('div');
        refreshIndicator.className = 'pull-to-refresh-indicator';
        refreshIndicator.innerHTML = '<i class="bi bi-arrow-down"></i><span>Deslizá para actualizar</span>';
        document.body.appendChild(refreshIndicator);

        window.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                touchStartY = e.touches[0].clientY;
                this.pullToRefreshActive = true;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.pullToRefreshActive && window.scrollY === 0) {
                touchCurrentY = e.touches[0].clientY;
                pullDistance = touchCurrentY - touchStartY;

                if (pullDistance > 0) {
                    e.preventDefault();
                    const progress = Math.min(pullDistance / this.pullToRefreshThreshold, 1);
                    refreshIndicator.style.opacity = progress;
                    refreshIndicator.style.transform = `translateY(${Math.min(pullDistance, this.pullToRefreshThreshold)}px)`;

                    if (pullDistance >= this.pullToRefreshThreshold) {
                        refreshIndicator.classList.add('ready');
                        refreshIndicator.querySelector('i').style.transform = 'rotate(180deg)';
                    } else {
                        refreshIndicator.classList.remove('ready');
                        refreshIndicator.querySelector('i').style.transform = 'rotate(0deg)';
                    }
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            if (this.pullToRefreshActive && pullDistance >= this.pullToRefreshThreshold) {
                this.triggerRefresh();
            }
            this.resetPullToRefresh(refreshIndicator);
        }, { passive: true });
    }

    triggerRefresh() {
        // Mostrar indicador de carga
        const indicator = document.querySelector('.pull-to-refresh-indicator');
        if (indicator) {
            indicator.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i><span>Actualizando...</span>';
        }

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('pulltorefresh'));

        // Recargar página después de un delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    resetPullToRefresh(indicator) {
        this.pullToRefreshActive = false;
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-100px)';
            setTimeout(() => {
                indicator.innerHTML = '<i class="bi bi-arrow-down"></i><span>Deslizá para actualizar</span>';
                indicator.classList.remove('ready');
            }, 300);
        }
    }

    // Gestos para acciones rápidas
    initQuickActions() {
        // Doble tap para agregar a favoritos
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;

            if (tapLength < 300 && tapLength > 0) {
                // Doble tap detectado
                const target = e.target.closest('.servicio-card, .card-raise, .favorito-btn');
                if (target) {
                    const favoritoBtn = target.querySelector('.favorito-btn') || target;
                    if (favoritoBtn && typeof initFavoritos === 'function') {
                        favoritoBtn.click();
                    }
                }
            }
            lastTap = currentTime;
        }, { passive: true });

        // Long press para menú contextual
        let longPressTimer = null;
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.servicio-card, .card-raise');
            if (target) {
                longPressTimer = setTimeout(() => {
                    this.showQuickActionsMenu(target, e.touches[0].clientX, e.touches[0].clientY);
                }, 500);
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });

        document.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
    }

    showQuickActionsMenu(element, x, y) {
        // Crear menú contextual
        const menu = document.createElement('div');
        menu.className = 'quick-actions-menu';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.innerHTML = `
            <button class="quick-action-btn" data-action="favorito">
                <i class="bi bi-heart"></i> Favorito
            </button>
            <button class="quick-action-btn" data-action="compartir">
                <i class="bi bi-share"></i> Compartir
            </button>
            <button class="quick-action-btn" data-action="ver">
                <i class="bi bi-eye"></i> Ver detalles
            </button>
        `;

        document.body.appendChild(menu);

        // Manejar clicks
        menu.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleQuickAction(element, action);
                menu.remove();
            });
        });

        // Cerrar al tocar fuera
        setTimeout(() => {
            document.addEventListener('touchstart', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('touchstart', closeMenu);
                }
            }, { once: true });
        }, 100);
    }

    handleQuickAction(element, action) {
        switch (action) {
            case 'favorito':
                const favoritoBtn = element.querySelector('.favorito-btn');
                if (favoritoBtn) favoritoBtn.click();
                break;
            case 'compartir':
                // Implementar compartir
                if (navigator.share) {
                    navigator.share({
                        title: element.querySelector('h3, h4')?.textContent || 'Servicio',
                        text: element.querySelector('p')?.textContent || '',
                        url: window.location.href
                    });
                }
                break;
            case 'ver':
                const link = element.querySelector('a, button[data-bs-toggle]');
                if (link) link.click();
                break;
        }
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TouchGestures();
    });
} else {
    new TouchGestures();
}

// Exportar para uso global
window.TouchGestures = TouchGestures;

