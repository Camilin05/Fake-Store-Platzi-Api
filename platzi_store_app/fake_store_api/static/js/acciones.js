/**
 * Obtiene el token CSRF de las cookies del documento.
 * @returns {string|null} El valor del token CSRF o null si no se encuentra.
 */
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Muestra una notificación temporal en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de notificación ('success' o 'error').
 * @param {number} duration - Duración en milisegundos.
 */
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.body;
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, duration);
}


/**
 * Maneja la eliminación de un producto de forma asíncrona.
 * @param {number} id - El ID del producto a eliminar.
 * @param {HTMLElement} buttonElement - El botón que activó la función.
 */
async function deleteProduct(id, buttonElement) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    const card = buttonElement.closest('.product-card');
    card.style.opacity = '0.5';
    buttonElement.disabled = true;

    try {
        const response = await fetch('/eliminar_producto/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ id: id })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message || 'Producto eliminado', 'success');
            card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            card.style.transform = 'scale(0)';
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 300);
        } else {
            throw new Error(data.error || 'Error desconocido del servidor.');
        }

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showNotification(error.message, 'error');
        card.style.opacity = '1';
        buttonElement.disabled = false;
    }
}

// Lógica que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Auto-cierre para notificaciones cargadas desde el servidor
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        setTimeout(() => {
            if (notification) {
                notification.style.transition = 'opacity 0.5s ease';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500);
            }
        }, 5000);
    });

    // --- LÓGICA DE LA BARRA DE PROGRESO ---
    const form = document.querySelector('.forms');
    if (form) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        const requiredFields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'));
        const totalFields = requiredFields.length;

        const updateProgressBar = () => {
            let filledFields = 0;
            requiredFields.forEach(field => {
                if (field.value && field.value.trim() !== '') {
                    filledFields++;
                }
            });
            const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
            if (progressBar && progressText) {
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `${percentage}% Completado`;
            }
        };

        requiredFields.forEach(field => {
            field.addEventListener('input', updateProgressBar);
        });

        updateProgressBar(); // Comprobación inicial al cargar la página
    }

    // --- LÓGICA DEL MODAL DE VISTA PREVIA DE IMAGEN ---
    const modal = document.getElementById('imagePreviewModal');
    const modalImage = document.getElementById('previewImage');
    const closeModalBtn = document.getElementById('closePreviewModal');

    document.querySelectorAll('.preview-btn').forEach(button => {
        button.addEventListener('click', () => {
            const inputId = button.getAttribute('data-input-id');
            const imageUrl = document.getElementById(inputId).value;
            
            if (imageUrl && imageUrl.trim().match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                if(modal && modalImage) {
                    modalImage.src = imageUrl;
                    modal.style.display = 'flex';
                }
            } else {
                alert('Por favor, ingresa una URL de imagen válida.');
            }
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            // Cierra el modal si se hace clic fuera de la imagen
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});