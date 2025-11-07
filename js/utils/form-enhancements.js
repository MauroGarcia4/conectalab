// ============================================
// MEJORAS DE FORMULARIOS
// ============================================

(function() {
    'use strict';

    // Función para validar fortaleza de contraseña
    function getPasswordStrength(password) {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('Mínimo 8 caracteres');

        if (password.length >= 12) strength++;

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('Incluir letras minúsculas');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('Incluir letras mayúsculas');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('Incluir números');

        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        else feedback.push('Incluir caracteres especiales');

        if (strength <= 2) return { level: 'weak', score: strength, feedback };
        if (strength <= 4) return { level: 'medium', score: strength, feedback };
        return { level: 'strong', score: strength, feedback: [] };
    }

    // Mostrar indicador de fortaleza de contraseña
    function initPasswordStrengthIndicator() {
        const passwordInput = document.getElementById('password-registro');
        const strengthContainer = document.getElementById('password-strength-container');
        
        if (passwordInput && strengthContainer) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = getPasswordStrength(password);
                const container = document.getElementById('password-strength-container');
                
                if (password.length === 0) {
                    container.innerHTML = '';
                    return;
                }

                let strengthHTML = '<div class="d-flex align-items-center gap-2 mb-1">';
                strengthHTML += '<span class="small fw-semibold">Fortaleza:</span>';
                
                // Barra de progreso
                strengthHTML += '<div class="flex-grow-1 progress" style="height: 6px;">';
                strengthHTML += '<div class="progress-bar';
                
                if (strength.level === 'weak') {
                    strengthHTML += ' bg-danger';
                } else if (strength.level === 'medium') {
                    strengthHTML += ' bg-warning';
                } else {
                    strengthHTML += ' bg-success';
                }
                
                const percentage = (strength.score / 6) * 100;
                strengthHTML += `" role="progressbar" style="width: ${percentage}%" aria-valuenow="${strength.score}" aria-valuemin="0" aria-valuemax="6"></div>`;
                strengthHTML += '</div>';
                strengthHTML += `<span class="small text-muted">${strength.level === 'weak' ? 'Débil' : strength.level === 'medium' ? 'Media' : 'Fuerte'}</span>`;
                strengthHTML += '</div>';

                // Feedback
                if (strength.feedback.length > 0) {
                    strengthHTML += '<div class="small text-muted mt-1">';
                    strengthHTML += '<ul class="mb-0 ps-3" style="font-size: 0.85rem;">';
                    strength.feedback.forEach(item => {
                        strengthHTML += `<li>${item}</li>`;
                    });
                    strengthHTML += '</ul>';
                    strengthHTML += '</div>';
                }

                container.innerHTML = strengthHTML;
            });
        }
    }

    // Contador de caracteres para textarea
    function initCharacterCounter() {
        const textarea = document.getElementById('mensaje');
        const counter = document.getElementById('contador-caracteres');
        
        if (textarea && counter) {
            function updateCounter() {
                const length = textarea.value.length;
                counter.textContent = length;
                
                // Cambiar color cuando se acerca al límite
                if (length > 900) {
                    counter.classList.add('text-danger');
                    counter.classList.remove('text-muted');
                } else if (length > 750) {
                    counter.classList.add('text-warning');
                    counter.classList.remove('text-danger', 'text-muted');
                } else {
                    counter.classList.remove('text-danger', 'text-warning');
                    counter.classList.add('text-muted');
                }
            }
            
            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Inicializar contador
        }
    }

    // Mejorar feedback visual en formularios
    function initFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Validación en tiempo real
                input.addEventListener('blur', function() {
                    validateField(this);
                });
                
                input.addEventListener('input', function() {
                    if (this.classList.contains('is-invalid')) {
                        validateField(this);
                    }
                });
            });
        });
    }

    function validateField(field) {
        // Remover clases previas
        field.classList.remove('is-valid', 'is-invalid');
        
        // Validar según el tipo
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('is-invalid');
            return false;
        }
        
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }
        
        if (field.type === 'password' && field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (field.value.length > 0 && field.value.length < minLength) {
                field.classList.add('is-invalid');
                return false;
            }
        }
        
        if (field.value.trim()) {
            field.classList.add('is-valid');
        }
        
        return true;
    }

    // Loading states para botones de formulario
    function initLoadingStates() {
        // Formulario de contacto
        const formContacto = document.getElementById('formulario-contacto');
        if (formContacto) {
            formContacto.addEventListener('submit', function(e) {
                const btn = document.getElementById('btn-enviar-contacto');
                const btnText = btn.querySelector('.btn-text');
                const btnLoading = btn.querySelector('.btn-loading');
                const mensajeExito = document.getElementById('mensaje-exito-contacto');
                const mensajeError = document.getElementById('mensaje-error-contacto');
                
                // Mostrar loading
                if (btnText && btnLoading) {
                    btnText.classList.add('d-none');
                    btnLoading.classList.remove('d-none');
                    btn.disabled = true;
                }
                
                // Ocultar mensajes previos
                if (mensajeExito) mensajeExito.classList.add('d-none');
                if (mensajeError) mensajeError.classList.add('d-none');
                
                // Simular envío (esto debería ser reemplazado por la lógica real)
                setTimeout(() => {
                    // Restaurar botón (esto debería hacerse después de recibir respuesta del servidor)
                    // Por ahora lo dejamos así para que funcione con la lógica existente
                }, 100);
            });
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        initCharacterCounter();
        initFormValidation();
        initLoadingStates();
        initPasswordStrengthIndicator();
    });
})();

