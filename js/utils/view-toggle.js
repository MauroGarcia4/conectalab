// ============================================
// VISTA DE LISTA VS GRID
// ============================================

(function() {
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

        gridBtn.addEventListener('click', function() {
            applyView('grid');
            localStorage.setItem('serviciosView', 'grid');
        });

        listBtn.addEventListener('click', function() {
            applyView('list');
            localStorage.setItem('serviciosView', 'list');
        });

        function applyView(view) {
            if (view === 'list') {
                serviciosContainer.classList.add('view-list');
                serviciosContainer.classList.remove('view-grid');
                gridBtn.classList.remove('active');
                listBtn.classList.add('active');
            } else {
                serviciosContainer.classList.add('view-grid');
                serviciosContainer.classList.remove('view-list');
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            }
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        initViewToggle();
    });
})();

