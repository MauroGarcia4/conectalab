// ============================================
// LOGGER - Sistema de logging condicional
// Solo muestra logs en desarrollo
// ============================================

(function() {
    'use strict';

    // Detectar si estamos en desarrollo o producción
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.protocol === 'file:';

    // Crear objeto logger
    const logger = {
        log: function(...args) {
            if (isDevelopment) {
                console.log(...args);
            }
        },
        warn: function(...args) {
            if (isDevelopment) {
                console.warn(...args);
            }
        },
        error: function(...args) {
            // Los errores siempre se muestran, incluso en producción
            console.error(...args);
        },
        info: function(...args) {
            if (isDevelopment) {
                console.info(...args);
            }
        }
    };

    // Exponer logger globalmente
    window.logger = logger;
})();

