// ============================================
// ERROR TRACKER - Sistema de seguimiento de errores
// ============================================

class ErrorTracker {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Limitar cantidad de errores guardados
        this.init();
    }

    init() {
        // Capturar errores de JavaScript
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Capturar promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            });
        });

        // Capturar errores de recursos (imágenes, scripts, etc.)
        window.addEventListener('error', (event) => {
            if (event.target !== window && event.target.tagName) {
                this.trackError({
                    type: 'resource',
                    resource: event.target.tagName,
                    src: event.target.src || event.target.href,
                    message: `Failed to load ${event.target.tagName}`,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                });
            }
        }, true);
    }

    trackError(errorData) {
        // Agregar a la lista local
        this.errors.push(errorData);
        
        // Limitar cantidad de errores
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Guardar en localStorage para análisis posterior
        try {
            const storedErrors = JSON.parse(localStorage.getItem('error_log') || '[]');
            storedErrors.push(errorData);
            
            // Mantener solo los últimos 50 errores
            if (storedErrors.length > this.maxErrors) {
                storedErrors.splice(0, storedErrors.length - this.maxErrors);
            }
            
            localStorage.setItem('error_log', JSON.stringify(storedErrors));
        } catch (e) {
            console.warn('Error guardando en localStorage:', e);
        }

        // Enviar a servidor si está configurado (Sentry, etc.)
        this.sendToServer(errorData);

        // Log en consola en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error tracked:', errorData);
        }
    }

    sendToServer(errorData) {
        // Aquí puedes integrar con Sentry, LogRocket, o tu propio endpoint
        // Ejemplo con fetch:
        /*
        if (typeof SENTRY_DSN !== 'undefined') {
            fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(errorData)
            }).catch(() => {
                // Silenciar errores de red para evitar loops
            });
        }
        */
    }

    getErrors() {
        return this.errors;
    }

    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('error_log') || '[]');
        } catch (e) {
            return [];
        }
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('error_log');
    }

    // Método para reportar errores manualmente
    reportError(message, error, context = {}) {
        this.trackError({
            type: 'manual',
            message: message,
            error: error?.message || String(error),
            stack: error?.stack,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
}

// Inicializar error tracker
const errorTracker = new ErrorTracker();

// Exportar para uso global
window.errorTracker = errorTracker;

// Función helper para uso fácil
window.trackError = (message, error, context) => {
    errorTracker.reportError(message, error, context);
};

