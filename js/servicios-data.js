// ============================================
// DATOS DE SERVICIOS PARA MAPEO
// ============================================
// Mapeo de IDs de servicios a información completa

const SERVICIOS_DATA = {
    'electricidad': {
        nombre: 'Electricidad',
        descripcion: 'Instalaciones, tableros y mantenimiento general',
        categoria: 'Hogar',
        icono: 'bi-lightning-charge',
        imagen: '../img/srv-electricidad.jpeg'
    },
    'diseno': {
        nombre: 'Diseño Gráfico',
        descripcion: 'Identidad visual, branding y diseño web',
        categoria: 'Diseño',
        icono: 'bi-palette',
        imagen: '../img/srv-diseño.webp'
    },
    'plomeria': {
        nombre: 'Plomería',
        descripcion: 'Reparaciones e instalaciones de plomería',
        categoria: 'Hogar',
        icono: 'bi-droplet',
        imagen: '../img/srv-plomeria.webp'
    },
    'carpinteria': {
        nombre: 'Carpintería',
        descripcion: 'Muebles a medida y trabajos en madera',
        categoria: 'Hogar',
        icono: 'bi-hammer',
        imagen: '../img/srv-carpinteria.webp'
    },
    'tecnologia': {
        nombre: 'Soporte Técnico',
        descripcion: 'Reparación de computadoras y dispositivos',
        categoria: 'Tecnología',
        icono: 'bi-laptop',
        imagen: '../img/srv-diseño.webp'
    },
    'pintura': {
        nombre: 'Pintura',
        descripcion: 'Pintura de interiores y exteriores',
        categoria: 'Hogar',
        icono: 'bi-brush',
        imagen: '../img/srv-diseño.webp'
    },
    'albanileria': {
        nombre: 'Albañilería',
        descripcion: 'Construcción y reparaciones generales',
        categoria: 'Hogar',
        icono: 'bi-tools',
        imagen: '../img/srv-diseño.webp'
    },
    'clases': {
        nombre: 'Clases Particulares',
        descripcion: 'Apoyo escolar y materias específicas',
        categoria: 'Educación',
        icono: 'bi-book',
        imagen: '../img/srv-diseño.webp'
    },
    'cerrajeria': {
        nombre: 'Cerrajería',
        descripcion: 'Urgencias 24hs y cambio de cerraduras',
        categoria: 'Hogar',
        icono: 'bi-key',
        imagen: '../img/srv-diseño.webp'
    }
};

/**
 * Obtener información de un servicio por su ID
 */
function getServicioInfo(servicioId) {
    return SERVICIOS_DATA[servicioId] || {
        nombre: `Servicio ${servicioId}`,
        descripcion: 'Información no disponible',
        categoria: 'General',
        icono: 'bi-question-circle',
        imagen: '../img/srv-diseño.webp'
    };
}

