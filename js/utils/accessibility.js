// ============================================
// ACCESIBILIDAD - Modo Lectura, Contraste Alto, Tamaño de Fuente
// ============================================

(function() {
    'use strict';

    // ============================================
    // 1. TAMAÑO DE FUENTE AJUSTABLE
    // ============================================
    function initFontSize() {
        const fontDecrease = document.getElementById('font-decrease');
        const fontIncrease = document.getElementById('font-increase');
        const fontReset = document.getElementById('font-reset');
        const fontDisplay = document.getElementById('font-size-display');

        if (!fontDecrease || !fontIncrease || !fontReset || !fontDisplay) return;

        // Cargar tamaño guardado
        let fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
        applyFontSize(fontSize);

        fontDecrease.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (fontSize > 75) {
                fontSize -= 5;
                applyFontSize(fontSize);
                saveFontSize(fontSize);
            }
        });

        fontIncrease.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (fontSize < 150) {
                fontSize += 5;
                applyFontSize(fontSize);
                saveFontSize(fontSize);
            }
        });

        fontReset.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fontSize = 100;
            applyFontSize(fontSize);
            saveFontSize(fontSize);
        });

        function applyFontSize(size) {
            document.documentElement.style.fontSize = size + '%';
            if (fontDisplay) {
                fontDisplay.textContent = size + '%';
            }
        }

        function saveFontSize(size) {
            localStorage.setItem('fontSize', size.toString());
        }
    }

    // ============================================
    // 2. MODO ALTO CONTRASTE
    // ============================================
    function initHighContrast() {
        const toggleBtn = document.getElementById('toggle-high-contrast');
        const checkIcon = document.getElementById('high-contrast-check');

        if (!toggleBtn) return;

        // Cargar estado guardado
        const isEnabled = localStorage.getItem('highContrast') === 'true';
        if (isEnabled) {
            document.body.classList.add('high-contrast');
            if (checkIcon) checkIcon.classList.remove('d-none');
        }

        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isEnabled = document.body.classList.toggle('high-contrast');
            localStorage.setItem('highContrast', isEnabled.toString());
            
            if (checkIcon) {
                if (isEnabled) {
                    checkIcon.classList.remove('d-none');
                } else {
                    checkIcon.classList.add('d-none');
                }
            }

            // Cerrar dropdown
            setTimeout(() => {
                const dropdownElement = toggleBtn.closest('.nav-item').querySelector('[data-bs-toggle="dropdown"]');
                if (dropdownElement && typeof bootstrap !== 'undefined') {
                    const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                    if (dropdown) dropdown.hide();
                }
            }, 100);
        });
    }

    // ============================================
    // 3. MODO LECTURA
    // ============================================
    function createExitButton() {
        // Crear botón de salida si no existe
        let exitBtn = document.getElementById('reading-mode-exit');
        if (!exitBtn) {
            exitBtn = document.createElement('button');
            exitBtn.id = 'reading-mode-exit';
            exitBtn.className = 'reading-mode-exit';
            exitBtn.innerHTML = '<i class="bi bi-x-lg"></i> Salir del modo lectura';
            exitBtn.setAttribute('aria-label', 'Salir del modo lectura');
            document.body.appendChild(exitBtn);
            
            exitBtn.addEventListener('click', function() {
                document.body.classList.remove('reading-mode');
                localStorage.setItem('readingMode', 'false');
                const checkIcon = document.getElementById('reading-mode-check');
                if (checkIcon) checkIcon.classList.add('d-none');
                // Ocultar el botón inmediatamente
                exitBtn.style.display = 'none';
            });
        }
        return exitBtn;
    }

    function initReadingMode() {
        const toggleBtn = document.getElementById('toggle-reading-mode');
        const checkIcon = document.getElementById('reading-mode-check');

        if (!toggleBtn) return;

        // Asegurar que el botón no esté visible inicialmente
        const exitBtn = document.getElementById('reading-mode-exit');
        if (exitBtn) {
            exitBtn.style.display = 'none';
        }

        // Cargar estado guardado
        const isEnabled = localStorage.getItem('readingMode') === 'true';
        if (isEnabled) {
            document.body.classList.add('reading-mode');
            if (checkIcon) checkIcon.classList.remove('d-none');
            const btn = createExitButton();
            btn.style.display = 'flex';
        } else {
            // Asegurar que el botón no esté visible si el modo lectura está desactivado
            if (exitBtn) {
                exitBtn.style.display = 'none';
            }
        }

        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isEnabled = document.body.classList.toggle('reading-mode');
            localStorage.setItem('readingMode', isEnabled.toString());
            
            if (checkIcon) {
                if (isEnabled) {
                    checkIcon.classList.remove('d-none');
                } else {
                    checkIcon.classList.add('d-none');
                }
            }

            // Mostrar/ocultar botón de salida
            const exitBtn = createExitButton();
            if (isEnabled) {
                exitBtn.style.display = 'flex';
            } else {
                exitBtn.style.display = 'none';
            }

            // Cerrar dropdown
            setTimeout(() => {
                const dropdownElement = toggleBtn.closest('.nav-item').querySelector('[data-bs-toggle="dropdown"]');
                if (dropdownElement && typeof bootstrap !== 'undefined') {
                    const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
                    if (dropdown) dropdown.hide();
                }
            }, 100);
        });
    }

    // Cargar estado guardado al inicio
    function loadSavedSettings() {
        // Cargar tamaño de fuente
        const savedFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
        if (savedFontSize !== 100) {
            document.documentElement.style.fontSize = savedFontSize + '%';
        }
        
        // Cargar alto contraste
        if (localStorage.getItem('highContrast') === 'true') {
            document.body.classList.add('high-contrast');
        }
        
        // Cargar modo lectura
        if (localStorage.getItem('readingMode') === 'true') {
            document.body.classList.add('reading-mode');
        }
    }

    // Función para actualizar iconos de check
    function updateCheckIcons() {
        const highContrastCheck = document.getElementById('high-contrast-check');
        const readingModeCheck = document.getElementById('reading-mode-check');
        
        if (highContrastCheck) {
            if (document.body.classList.contains('high-contrast')) {
                highContrastCheck.classList.remove('d-none');
            } else {
                highContrastCheck.classList.add('d-none');
            }
        }
        
        if (readingModeCheck) {
            if (document.body.classList.contains('reading-mode')) {
                readingModeCheck.classList.remove('d-none');
            } else {
                readingModeCheck.classList.add('d-none');
            }
        }
    }

    // Inicializar cuando el DOM esté listo
    function initializeAccessibility() {
        loadSavedSettings();
        
        // Esperar un poco para que los elementos estén disponibles
        setTimeout(() => {
            initFontSize();
            initHighContrast();
            initReadingMode();
            updateCheckIcons();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAccessibility);
    } else {
        initializeAccessibility();
    }
})();

