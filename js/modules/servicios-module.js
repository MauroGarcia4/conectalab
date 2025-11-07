// ============================================
// MÓDULO DE SERVICIOS - Code Splitting
// ============================================

// Este módulo se carga solo cuando se necesita
export function initServiciosModule() {
    // Importar funciones de servicios solo cuando se necesiten
    if (document.querySelector('#servicios-container')) {
        // Cargar datos de servicios dinámicamente
        import('../servicios-data.js').then(module => {
            if (module.getServicioInfo) {
                window.serviciosData = module;
            }
        });
    }
}

// Inicializar si estamos en la página de servicios
if (document.querySelector('#servicios-container')) {
    initServiciosModule();
}

