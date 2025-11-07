// ============================================
// VISTA DE LISTA VS GRID
// ============================================

(function () {
    'use strict';

    function initViewToggle() {
        const serviciosContainer = document.getElementById('servicios-container');
        if (!serviciosContainer) return;

        // Crear botón de toggle si no existe
        let toggleContainer = document.querySelector('.view-toggle-container');
        if (!toggleContainer) {
            const categoriasSection = document.querySelector('.categorias');
            if (categoriasSection) {
                toggleContainer = document.createElement('div');
                toggleContainer.className = 'view-toggle-container d-flex justify-content-end mb-3';
                toggleContainer.innerHTML = `
                    <div class="btn-group" role="group" aria-label="Cambiar vista">
                        <button type="button" class="btn btn-outline-primary" id="view-grid" aria-label="Vista de cuadrícula" title="Vista de cuadrícula">
                            <i class="bi bi-grid-3x3-gap"></i>
                        </button>
                        <button type="button" class="btn btn-outline-primary" id="view-list" aria-label="Vista de lista" title="Vista de lista">
                            <i class="bi bi-list-ul"></i>
                        </button>
                    </div>
                `;
                categoriasSection.querySelector('.container').appendChild(toggleContainer);
            }
        }

        const gridBtn = document.getElementById('view-grid');
        const listBtn = document.getElementById('view-list');

        if (!gridBtn || !listBtn) return;

        // Cargar preferencia guardada
        const savedView = localStorage.getItem('serviciosView') || 'grid';
        applyView(savedView);

        gridBtn.addEventListener('click', function () {
            applyView('grid');
            localStorage.setItem('serviciosView', 'grid');
        });

        listBtn.addEventListener('click', function () {
            applyView('list');
            localStorage.setItem('serviciosView', 'list');
        });

        function applyView(view) {
            const cards = Array.from(serviciosContainer.querySelectorAll('.servicio-card'));

            if (view === 'list') {
                serviciosContainer.classList.add('view-list');
                serviciosContainer.classList.remove('view-grid');
                serviciosContainer.classList.remove('row');
                gridBtn.classList.remove('active');
                listBtn.classList.add('active');

                // Remover clases de columnas y hacer que cada tarjeta ocupe todo el ancho
                cards.forEach(card => {
                    const wrapper = card.parentElement;
                    if (wrapper) {
                        // Guardar clases originales si no las tiene guardadas
                        if (!wrapper.dataset.originalClasses) {
                            wrapper.dataset.originalClasses = wrapper.className;
                        }
                        // Remover todas las clases de columna
                        wrapper.className = wrapper.className.replace(/\bcol-\w+(-\w+)?\b/g, '');
                        wrapper.style.width = '100%';
                        wrapper.style.maxWidth = '100%';
                        wrapper.style.flex = '0 0 100%';
                    }
                    // Cambiar alineación del contenido en vista lista
                    const cardBody = card.querySelector('.card-body');
                    if (cardBody) {
                        cardBody.classList.remove('text-center');
                        cardBody.classList.add('text-start');
                    }
                });
            } else {
                serviciosContainer.classList.add('view-grid');
                serviciosContainer.classList.remove('view-list');
                serviciosContainer.classList.add('row');
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');

                // Restaurar clases de columnas para vista grid
                cards.forEach(card => {
                    const wrapper = card.parentElement;
                    if (wrapper && wrapper.dataset.originalClasses) {
                        wrapper.className = wrapper.dataset.originalClasses;
                        wrapper.style.width = '';
                        wrapper.style.maxWidth = '';
                        wrapper.style.flex = '';
                    } else if (wrapper) {
                        // Si no hay clases guardadas, restaurar las por defecto
                        wrapper.classList.add('col-12', 'col-sm-6', 'col-lg-3');
                        wrapper.style.width = '';
                        wrapper.style.maxWidth = '';
                        wrapper.style.flex = '';
                    }
                    // Restaurar alineación centrada en vista grid
                    const cardBody = card.querySelector('.card-body');
                    if (cardBody) {
                        cardBody.classList.remove('text-start');
                        cardBody.classList.add('text-center');
                    }
                });
            }
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function () {
        initViewToggle();
    });
})();

