// ============================================
// SISTEMA DE REVIEWS/COMENTARIOS
// ============================================

// Inicializar sistema de reviews
function initReviews() {
    // Cargar reviews existentes al cargar la página
    document.querySelectorAll('[data-servicio]').forEach(card => {
        const servicioId = card.dataset.servicio;
        loadReviewsForService(servicioId);
    });

    // Agregar listeners para botones de review
    document.querySelectorAll('.btn-review').forEach(btn => {
        btn.addEventListener('click', function() {
            const servicioId = this.dataset.servicio;
            showReviewModal(servicioId);
        });
    });
}

// Mostrar modal para agregar review
function showReviewModal(servicioId) {
    // Crear modal dinámicamente si no existe
    let modal = document.getElementById('modalReview');
    
    if (!modal) {
        modal = createReviewModal();
        document.body.appendChild(modal);
    }

    // Actualizar datos del servicio
    modal.dataset.servicio = servicioId;
    const servicioNombre = document.querySelector(`[data-servicio="${servicioId}"] h3`)?.textContent || 'Servicio';
    modal.querySelector('#reviewServicioNombre').textContent = servicioNombre;
    
    // Limpiar formulario
    modal.querySelector('#reviewRating').value = '5';
    modal.querySelector('#reviewComentario').value = '';
    
    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Crear modal de review
function createReviewModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalReview';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-star me-2"></i>Dejar una reseña
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-3">
                        <strong>Servicio:</strong> <span id="reviewServicioNombre"></span>
                    </p>
                    
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Calificación</label>
                        <div class="rating-input mb-2">
                            <input type="radio" name="rating" id="rating5" value="5" checked>
                            <label for="rating5" class="star-label">⭐</label>
                            <input type="radio" name="rating" id="rating4" value="4">
                            <label for="rating4" class="star-label">⭐</label>
                            <input type="radio" name="rating" id="rating3" value="3">
                            <label for="rating3" class="star-label">⭐</label>
                            <input type="radio" name="rating" id="rating2" value="2">
                            <label for="rating2" class="star-label">⭐</label>
                            <input type="radio" name="rating" id="rating1" value="1">
                            <label for="rating1" class="star-label">⭐</label>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="reviewComentario" class="form-label fw-semibold">Comentario (opcional)</label>
                        <textarea 
                            class="form-control" 
                            id="reviewComentario" 
                            rows="4" 
                            placeholder="Compartí tu experiencia con este servicio..."
                            maxlength="500"
                        ></textarea>
                        <small class="text-muted">
                            <span id="reviewCharCount">0</span>/500 caracteres
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="submitReview">
                        <i class="bi bi-check-circle me-2"></i>Publicar reseña
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar listeners
    const submitBtn = modal.querySelector('#submitReview');
    submitBtn.addEventListener('click', submitReview);
    
    const textarea = modal.querySelector('#reviewComentario');
    textarea.addEventListener('input', function() {
        modal.querySelector('#reviewCharCount').textContent = this.value.length;
    });
    
    return modal;
}

// Enviar review
async function submitReview() {
    const modal = document.getElementById('modalReview');
    const servicioId = modal.dataset.servicio;
    const rating = parseInt(modal.querySelector('input[name="rating"]:checked').value);
    const comentario = modal.querySelector('#reviewComentario').value.trim();
    
    if (!servicioId) {
        showToast('Error al guardar la reseña', 'error');
        return;
    }
    
    try {
        // Intentar guardar en Supabase primero, luego localStorage
        if (typeof saveReviewSupabase === 'function') {
            await saveReviewSupabase(servicioId, rating, comentario);
        } else {
            saveReviewLocalStorage(servicioId, rating, comentario);
        }
        
        // Cerrar modal
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        
        // Mostrar éxito
        showToast('¡Gracias por tu reseña!', 'success');
        
        // Recargar reviews
        loadReviewsForService(servicioId);
        
        // Actualizar rating promedio
        updateServiceRating(servicioId);
        
    } catch (error) {
        console.error('Error guardando review:', error);
        showToast('Error al guardar la reseña', 'error');
    }
}

// Cargar reviews para un servicio
async function loadReviewsForService(servicioId) {
    try {
        let reviews = [];
        
        // Intentar cargar de Supabase primero, luego localStorage
        if (typeof getReviewsSupabase === 'function') {
            reviews = await getReviewsSupabase(servicioId);
        } else {
            reviews = getReviewsLocalStorage(servicioId);
        }
        
        // Mostrar reviews en la UI
        displayReviews(servicioId, reviews);
        
    } catch (error) {
        console.error('Error cargando reviews:', error);
    }
}

// Mostrar reviews en la UI
function displayReviews(servicioId, reviews) {
    // Buscar contenedor de reviews (si existe)
    const container = document.querySelector(`[data-servicio="${servicioId}"] .reviews-container`);
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-muted small mb-0">Aún no hay reseñas</p>';
        return;
    }
    
    // Calcular rating promedio
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    // Mostrar rating promedio y últimas reviews
    container.innerHTML = `
        <div class="mb-2">
            <strong class="text-primary">${avgRating.toFixed(1)}</strong>
            <span class="text-muted small">(${reviews.length} ${reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
        </div>
        <div class="reviews-list">
            ${reviews.slice(0, 3).map(review => `
                <div class="review-item small mb-2">
                    <div class="stars mb-1">
                        ${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                    ${review.comentario ? `<p class="mb-0 text-muted">${review.comentario}</p>` : ''}
                    <small class="text-muted">${formatDate(review.fecha || review.created_at)}</small>
                </div>
            `).join('')}
        </div>
    `;
}

// Actualizar rating promedio del servicio
async function updateServiceRating(servicioId) {
    try {
        let reviews = [];
        
        if (typeof getReviewsSupabase === 'function') {
            reviews = await getReviewsSupabase(servicioId);
        } else {
            reviews = getReviewsLocalStorage(servicioId);
        }
        
        if (reviews.length === 0) return;
        
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const card = document.querySelector(`[data-servicio="${servicioId}"]`);
        
        if (card) {
            const starsContainer = card.querySelector('.stars');
            if (starsContainer) {
                // Actualizar visualmente las estrellas
                const fullStars = Math.floor(avgRating);
                const hasHalfStar = avgRating % 1 >= 0.5;
                
                starsContainer.innerHTML = `
                    ${'<i class="bi bi-star-fill text-warning"></i>'.repeat(fullStars)}
                    ${hasHalfStar ? '<i class="bi bi-star-half text-warning"></i>' : ''}
                    ${'<i class="bi bi-star text-warning"></i>'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
                    <span class="small text-muted ms-1">(${avgRating.toFixed(1)})</span>
                `;
            }
        }
    } catch (error) {
        console.error('Error actualizando rating:', error);
    }
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Funciones de localStorage (fallback)
function saveReviewLocalStorage(servicioId, rating, comentario) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    if (!reviews[servicioId]) {
        reviews[servicioId] = [];
    }
    reviews[servicioId].push({
        rating,
        comentario,
        fecha: new Date().toISOString(),
        usuario: 'Usuario Anónimo'
    });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    return { success: true };
}

function getReviewsLocalStorage(servicioId) {
    let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    return reviews[servicioId] || [];
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviews);
} else {
    initReviews();
}

