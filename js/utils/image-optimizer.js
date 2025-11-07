// ============================================
// IMAGE OPTIMIZER - Optimización de imágenes
// ============================================

class ImageOptimizer {
    constructor() {
        this.supportsWebP = null;
        this.init();
    }

    async init() {
        // Detectar soporte WebP
        this.supportsWebP = await this.checkWebPSupport();
        
        // Optimizar imágenes existentes
        this.optimizeExistingImages();
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    optimizeExistingImages() {
        // Buscar todas las imágenes que no tienen picture wrapper
        document.querySelectorAll('img:not(picture img)').forEach(img => {
            if (img.src && !img.closest('picture')) {
                this.wrapWithPicture(img);
            }
        });
    }

    wrapWithPicture(img) {
        // Solo optimizar si tiene src y no está ya en un picture
        if (!img.src || img.closest('picture')) return;

        const src = img.src;
        const alt = img.alt || '';
        const classes = img.className;
        const style = img.getAttribute('style');
        const loading = img.getAttribute('loading');
        const dataAttributes = {};
        
        // Guardar data attributes
        Array.from(img.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                dataAttributes[attr.name] = attr.value;
            }
        });

        // Crear picture element
        const picture = document.createElement('picture');
        
        // Agregar source para WebP si está soportado
        if (this.supportsWebP && src.match(/\.(jpg|jpeg|png)$/i)) {
            const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            const source = document.createElement('source');
            source.type = 'image/webp';
            source.srcset = webpSrc;
            picture.appendChild(source);
        }

        // Agregar source con srcset responsive si es necesario
        if (img.dataset.srcset) {
            const source = document.createElement('source');
            source.srcset = img.dataset.srcset;
            if (img.dataset.sizes) {
                source.sizes = img.dataset.sizes;
            }
            picture.appendChild(source);
        }

        // Clonar imagen original
        const newImg = img.cloneNode(true);
        
        // Restaurar atributos
        if (classes) newImg.className = classes;
        if (style) newImg.setAttribute('style', style);
        if (loading) newImg.setAttribute('loading', loading);
        
        Object.keys(dataAttributes).forEach(key => {
            newImg.setAttribute(key, dataAttributes[key]);
        });

        picture.appendChild(newImg);
        
        // Reemplazar imagen original
        img.parentNode.replaceChild(picture, img);
    }

    // Método para crear imagen optimizada programáticamente
    createOptimizedImage(src, alt = '', options = {}) {
        const picture = document.createElement('picture');
        
        const {
            webpSrc,
            srcset,
            sizes,
            loading = 'lazy',
            className = '',
            style = ''
        } = options;

        // Source WebP
        if (this.supportsWebP && webpSrc) {
            const source = document.createElement('source');
            source.type = 'image/webp';
            source.srcset = webpSrc;
            if (srcset) {
                source.srcset = srcset.replace(/\.(jpg|jpeg|png)/gi, '.webp');
            }
            if (sizes) {
                source.sizes = sizes;
            }
            picture.appendChild(source);
        }

        // Source original con srcset
        if (srcset) {
            const source = document.createElement('source');
            source.srcset = srcset;
            if (sizes) {
                source.sizes = sizes;
            }
            picture.appendChild(source);
        }

        // Imagen
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = loading;
        if (className) img.className = className;
        if (style) img.setAttribute('style', style);

        picture.appendChild(img);
        
        return picture;
    }

    // Helper para generar srcset
    generateSrcset(baseSrc, widths = [400, 800, 1200, 1600]) {
        return widths
            .map(width => {
                const ext = baseSrc.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
                const name = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
                return `${name}-${width}w${ext} ${width}w`;
            })
            .join(', ');
    }
}

// Inicializar cuando el DOM esté listo
let imageOptimizer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        imageOptimizer = new ImageOptimizer();
    });
} else {
    imageOptimizer = new ImageOptimizer();
}

// Exportar para uso global
window.imageOptimizer = imageOptimizer;

