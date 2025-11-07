// ============================================
// EXPORTAR FAVORITOS
// ============================================

(function() {
    'use strict';

    async function exportFavorites(format) {
        try {
            // Obtener favoritos
            let favoritos = [];
            
            if (typeof getFavoritosSupabase === 'function') {
                try {
                    favoritos = await getFavoritosSupabase();
                } catch (error) {
                    console.error('Error cargando favoritos de Supabase:', error);
                    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
                }
            } else {
                favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
            }

            if (favoritos.length === 0) {
                if (typeof mostrarToast === 'function') {
                    mostrarToast('No tenés favoritos para exportar.', 'info');
                } else {
                    alert('No tenés favoritos para exportar.');
                }
                return;
            }

            // Obtener datos completos de servicios (si están disponibles)
            let serviciosData = {};
            if (typeof window.serviciosDataBase !== 'undefined') {
                serviciosData = window.serviciosDataBase;
            } else if (typeof serviciosDataBase !== 'undefined') {
                serviciosData = serviciosDataBase;
            }

            if (format === 'json') {
                exportJSON(favoritos, serviciosData);
            } else if (format === 'pdf') {
                await exportPDF(favoritos, serviciosData);
            }
        } catch (error) {
            console.error('Error exportando favoritos:', error);
            if (typeof mostrarToast === 'function') {
                mostrarToast('Error al exportar favoritos.', 'error');
            } else {
                alert('Error al exportar favoritos.');
            }
        }
    }

    function exportJSON(favoritos, serviciosData) {
        const data = {
            fecha: new Date().toISOString(),
            total: favoritos.length,
            favoritos: favoritos.map(id => {
                const servicio = serviciosData[id];
                return {
                    id: id,
                    nombre: servicio?.nombre || id,
                    categoria: servicio?.categoria || 'N/A',
                    descripcion: servicio?.descripcion || '',
                    precio: servicio?.precio || 'N/A',
                    rating: servicio?.rating || 0
                };
            })
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `favoritos-conectalab-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof mostrarToast === 'function') {
            mostrarToast('Favoritos exportados como JSON.', 'success');
        }
    }

    async function exportPDF(favoritos, serviciosData) {
        // Usar jsPDF si está disponible, sino mostrar mensaje
        if (typeof window.jsPDF === 'undefined') {
            // Cargar jsPDF dinámicamente
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = function() {
                generatePDF(favoritos, serviciosData);
            };
            document.head.appendChild(script);
        } else {
            generatePDF(favoritos, serviciosData);
        }
    }

    function generatePDF(favoritos, serviciosData) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.text('Mis Favoritos - ConectaLab', 14, 20);
            
            doc.setFontSize(10);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 30);
            doc.text(`Total: ${favoritos.length} servicios`, 14, 36);
            
            let y = 50;
            favoritos.forEach((id, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                const servicio = serviciosData[id];
                const nombre = servicio?.nombre || id;
                const categoria = servicio?.categoria || 'N/A';
                const descripcion = servicio?.descripcion || '';
                const precio = servicio?.precio || 'N/A';
                
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(`${index + 1}. ${nombre}`, 14, y);
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                y += 7;
                doc.text(`Categoría: ${categoria}`, 20, y);
                y += 6;
                doc.text(`Precio: ${precio}`, 20, y);
                if (descripcion) {
                    y += 6;
                    const lines = doc.splitTextToSize(`Descripción: ${descripcion}`, 180);
                    doc.text(lines, 20, y);
                    y += lines.length * 6;
                }
                y += 8;
            });
            
            doc.save(`favoritos-conectalab-${new Date().toISOString().split('T')[0]}.pdf`);
            
            if (typeof mostrarToast === 'function') {
                mostrarToast('Favoritos exportados como PDF.', 'success');
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            if (typeof mostrarToast === 'function') {
                mostrarToast('Error al generar PDF. Intentá exportar como JSON.', 'error');
            }
        }
    }

    // Agregar opciones de exportación al menú de usuario
    function addExportOptions() {
        const userMenu = document.querySelector('.dropdown-menu-end');
        if (!userMenu) return;

        // Verificar si ya existen las opciones
        if (userMenu.querySelector('#export-favorites-json')) return;

        const divider = document.createElement('li');
        divider.innerHTML = '<hr class="dropdown-divider">';
        userMenu.appendChild(divider);

        const exportHeader = document.createElement('li');
        exportHeader.innerHTML = '<h6 class="dropdown-header"><i class="bi bi-download me-2"></i>Exportar favoritos</h6>';
        userMenu.appendChild(exportHeader);

        const jsonOption = document.createElement('li');
        jsonOption.innerHTML = '<a class="dropdown-item" href="#" id="export-favorites-json"><i class="bi bi-filetype-json me-2"></i>Exportar como JSON</a>';
        jsonOption.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            exportFavorites('json');
        });
        userMenu.appendChild(jsonOption);

        const pdfOption = document.createElement('li');
        pdfOption.innerHTML = '<a class="dropdown-item" href="#" id="export-favorites-pdf"><i class="bi bi-filetype-pdf me-2"></i>Exportar como PDF</a>';
        pdfOption.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            exportFavorites('pdf');
        });
        userMenu.appendChild(pdfOption);
    }

    // Exponer función globalmente
    window.exportFavorites = exportFavorites;

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        addExportOptions();
    });
})();

