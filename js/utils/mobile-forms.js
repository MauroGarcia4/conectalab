// ============================================
// MOBILE FORMS - Optimización de formularios para móvil
// ============================================

class MobileForms {
    constructor() {
        this.init();
    }

    init() {
        // Solo en dispositivos móviles
        if (window.innerWidth <= 768 || 'ontouchstart' in window) {
            this.optimizeInputTypes();
            this.improveAutocomplete();
            this.addRealTimeValidation();
            this.optimizeFormLayout();
        }
    }

    // Optimizar tipos de input
    optimizeInputTypes() {
        document.querySelectorAll('input').forEach(input => {
            const name = input.name || input.id || '';
            const placeholder = input.placeholder || '';

            // Detectar tipo de input basado en nombre o placeholder
            if (name.includes('email') || name.includes('correo') || placeholder.includes('@')) {
                input.type = 'email';
                input.autocomplete = 'email';
                input.inputMode = 'email';
            } else if (name.includes('tel') || name.includes('telefono') || name.includes('phone')) {
                input.type = 'tel';
                input.autocomplete = 'tel';
                input.inputMode = 'tel';
            } else if (name.includes('url') || name.includes('web') || name.includes('sitio')) {
                input.type = 'url';
                input.autocomplete = 'url';
                input.inputMode = 'url';
            } else if (name.includes('password') || name.includes('contraseña') || name.includes('pass')) {
                input.type = 'password';
                input.autocomplete = 'current-password';
            } else if (name.includes('nombre') || name.includes('name')) {
                input.autocomplete = 'name';
            } else if (name.includes('apellido') || name.includes('surname')) {
                input.autocomplete = 'family-name';
            }
        });
    }

    // Mejorar autocomplete
    improveAutocomplete() {
        document.querySelectorAll('form').forEach(form => {
            // Agregar autocomplete a formularios de contacto
            if (form.id === 'formulario-contacto') {
                const nombreInput = form.querySelector('input[name="nombre"], input#nombre');
                const emailInput = form.querySelector('input[type="email"], input[name="email"]');
                
                if (nombreInput) {
                    nombreInput.autocomplete = 'name';
                    nombreInput.setAttribute('autocapitalize', 'words');
                }
                if (emailInput) {
                    emailInput.autocomplete = 'email';
                }
            }

            // Agregar autocomplete a formularios de registro
            if (form.id === 'formulario-registro') {
                const inputs = form.querySelectorAll('input');
                inputs.forEach((input, index) => {
                    if (input.type === 'text' && index === 0) {
                        input.autocomplete = 'name';
                        input.setAttribute('autocapitalize', 'words');
                    } else if (input.type === 'email') {
                        input.autocomplete = 'email';
                    } else if (input.type === 'password') {
                        if (index === inputs.length - 2) {
                            input.autocomplete = 'new-password';
                        } else {
                            input.autocomplete = 'current-password';
                        }
                    }
                });
            }

            // Agregar autocomplete a formularios de login
            if (form.id === 'formulario-login') {
                const emailInput = form.querySelector('input[type="email"]');
                const passwordInput = form.querySelector('input[type="password"]');
                
                if (emailInput) {
                    emailInput.autocomplete = 'email';
                }
                if (passwordInput) {
                    passwordInput.autocomplete = 'current-password';
                }
            }
        });
    }

    // Validación en tiempo real
    addRealTimeValidation() {
        document.querySelectorAll('input, textarea, select').forEach(field => {
            // Validar mientras el usuario escribe
            field.addEventListener('input', () => {
                this.validateField(field);
            });

            // Validar al perder el foco
            field.addEventListener('blur', () => {
                this.validateField(field);
            });

            // Prevenir envío si hay errores
            const form = field.closest('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    if (!this.validateForm(form)) {
                        e.preventDefault();
                        // Enfocar el primer campo con error
                        const firstError = form.querySelector('.is-invalid');
                        if (firstError) {
                            firstError.focus();
                            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                });
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validar campo requerido
        if (field.hasAttribute('required') && value === '') {
            isValid = false;
            errorMessage = 'Este campo es obligatorio';
        }

        // Validar email
        if (field.type === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Ingresá un email válido';
            }
        }

        // Validar teléfono
        if (field.type === 'tel' && value !== '') {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 8) {
                isValid = false;
                errorMessage = 'Ingresá un teléfono válido';
            }
        }

        // Validar password
        if (field.type === 'password' && value !== '') {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
            }
        }

        // Validar URL
        if (field.type === 'url' && value !== '') {
            try {
                new URL(value);
            } catch {
                isValid = false;
                errorMessage = 'Ingresá una URL válida';
            }
        }

        // Aplicar estilos
        this.applyValidationStyles(field, isValid, errorMessage);
        
        return isValid;
    }

    applyValidationStyles(field, isValid, errorMessage) {
        // Remover clases anteriores
        field.classList.remove('is-valid', 'is-invalid');

        // Remover mensaje de error anterior
        const existingFeedback = field.parentElement.querySelector('.invalid-feedback, .valid-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (isValid && field.value.trim() !== '') {
            field.classList.add('is-valid');
            const feedback = document.createElement('div');
            feedback.className = 'valid-feedback';
            feedback.innerHTML = '<i class="bi bi-check-circle me-1"></i>Correcto';
            field.parentElement.appendChild(feedback);
        } else if (!isValid) {
            field.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>${errorMessage}`;
            field.parentElement.appendChild(feedback);
        }
    }

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Optimizar layout de formularios en móvil
    optimizeFormLayout() {
        document.querySelectorAll('form').forEach(form => {
            // Agregar clase móvil
            if (window.innerWidth <= 768) {
                form.classList.add('mobile-form');
            }

            // Mejorar espaciado en inputs
            form.querySelectorAll('.form-control, .form-select').forEach(input => {
                if (window.innerWidth <= 768) {
                    input.style.minHeight = '48px'; // Tamaño táctil mínimo
                    input.style.fontSize = '16px'; // Evitar zoom en iOS
                }
            });

            // Agregar botones de acción rápida en móvil
            if (window.innerWidth <= 768) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.classList.contains('mobile-optimized')) {
                    submitBtn.classList.add('mobile-optimized');
                    submitBtn.style.minHeight = '48px';
                    submitBtn.style.fontSize = '16px';
                }
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MobileForms();
    });
} else {
    new MobileForms();
}

// Re-inicializar en resize para detectar cambios de orientación
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        new MobileForms();
    }
});

// Exportar para uso global
window.MobileForms = MobileForms;

