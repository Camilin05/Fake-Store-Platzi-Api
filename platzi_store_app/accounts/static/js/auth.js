document.addEventListener('DOMContentLoaded', () => {

    // --- MANEJO DINÁMICO DE LA UI DE AUTENTICACIÓN ---
    const updateAuthUI = async () => {
        const token = localStorage.getItem('authToken');
        const authLinksContainer = document.getElementById('auth-links-container');
        const authContent = document.getElementById('auth-content'); // Para la página de inicio

        if (token) {
            // Usuario potencialmente logueado, se verifica el token consultando el perfil
            try {
                const response = await fetch('/accounts/api/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const user = data.user;

                    // Actualiza la barra de navegación (base.html) con información del usuario
                    if (authLinksContainer) {
                        authLinksContainer.innerHTML = `
                            <span class="user-greeting">Hola, ${user.username}</span>
                            <a href="#" class="auth-button">Perfil</a>
                            <button id="logout-btn" class="auth-button logout">Cerrar Sesión</button>
                        `;
                        // Se añade el evento al botón de logout recién creado
                        document.getElementById('logout-btn').addEventListener('click', handleLogout);
                    }

                    // Actualiza el contenido en la página de inicio (inicio.html)
                    if (authContent) {
                        authContent.innerHTML = `
                            <div class="text-center user-actions">
                                <h3>¡Qué bueno verte de nuevo!</h3>
                                <p>Ya puedes administrar tus productos.</p>
                                <a href="/productos/" class="btn btn-primary">Ver Productos</a>
                            </div>
                        `;
                    }

                } else {
                    // Si el token es inválido o expirado, se limpia y se muestra la UI de invitado
                    localStorage.removeItem('authToken');
                    renderGuestUI();
                }

            } catch (error) {
                console.error('Error verificando el perfil:', error);
                renderGuestUI(); // Renderiza como invitado si hay error de red
            }
        } else {
            // Si no hay token, el usuario es un invitado
            renderGuestUI();
        }
    };

    // Función para renderizar la UI para usuarios no autenticados (invitados)
    const renderGuestUI = () => {
        const authLinksContainer = document.getElementById('auth-links-container');
        const authContent = document.getElementById('auth-content');

        const guestButtons = `
            <a href="/accounts/login/" class="auth-button">Iniciar Sesión</a>
            <a href="/accounts/signup/" class="auth-button register">Registrarse</a>
        `;

        // Actualiza la barra de navegación
        if (authLinksContainer) {
            authLinksContainer.innerHTML = guestButtons;
        }

        // Actualiza el contenido de la página de inicio
        if (authContent) {
            authContent.innerHTML = `
                <div class="text-center guest-actions">
                    <p>Para acceder a todas las funcionalidades, por favor inicia sesión o crea una cuenta.</p>
                    ${guestButtons}
                </div>
            `;
        }
    };

    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            await fetch('/accounts/api/logout/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // Independientemente del resultado de la API, se limpia el token local y se redirige
            localStorage.removeItem('authToken');
            window.location.href = '/'; 
        }
    };

    // --- CÓDIGO EXISTENTE PARA FORMULARIOS (CON PEQUEÑAS MEJORAS) ---

    // Lógica para el formulario de registro
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-btn');
            const errorDiv = document.getElementById('error-messages');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
            errorDiv.style.display = 'none';
            errorDiv.innerHTML = '';

            const formData = new FormData(signupForm);
            const csrfToken = formData.get('csrfmiddlewaretoken');
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/accounts/api/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem('authToken', result.token);
                    window.location.href = '/';
                } else {
                    let errorHtml = '<ul>';
                    for (const key in result.errors) {
                        const errorMessage = Array.isArray(result.errors[key]) ? result.errors[key][0] : result.errors[key];
                        errorHtml += `<li>${key}: ${errorMessage}</li>`;
                    }
                    errorHtml += '</ul>';
                    errorDiv.innerHTML = errorHtml;
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'Ocurrió un error de red. Inténtalo de nuevo.';
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
            }
        });
    }

    // Lógica para el formulario de inicio de sesión
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const errorDiv = document.getElementById('error-messages');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Ingresando...';
            errorDiv.style.display = 'none';

            const formData = new FormData(loginForm);
            const csrfToken = formData.get('csrfmiddlewaretoken');
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/accounts/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (response.ok) {
                    localStorage.setItem('authToken', result.token);
                    window.location.href = '/';
                } else {
                    const errorMessage = result.errors?.non_field_errors?.[0] || 'Error en la autenticación. Verifica tus credenciales.';
                    errorDiv.textContent = errorMessage;
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = 'Ocurrió un error de red. Inténtalo de nuevo.';
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
            }
        });
    }
    
    // --- INICIALIZACIÓN ---
    // Se llama a la función principal para configurar la UI al cargar la página
    updateAuthUI();
});
