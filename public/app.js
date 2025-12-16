const SUPABASE_URL = 'https://ihesibvdlxzcsgdjtdbv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNpYnZkbHh6Y3NnZGp0ZGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTQ1OTcsImV4cCI6MjA4MTQzMDU5N30.hSvNJSCx6NYbJfDwFbkCx7lbZ0tzqOfQ3a9OEyMIa6g';

// Función para extraer parámetros del hash o query string
function getTokenFromUrl() {
    // Intentar primero desde el hash (#)
    let params = new URLSearchParams(window.location.hash.substring(1));
    let accessToken = params.get('access_token');
    
    // Si no está en el hash, intentar desde query string (?)
    if (!accessToken) {
        params = new URLSearchParams(window.location.search);
        accessToken = params.get('access_token');
    }
    
    return {
        accessToken,
        type: params.get('type'),
        error: params.get('error'),
        errorDescription: params.get('error_description')
    };
}

// Debug mejorado al cargar
console.log('=== DEBUG INFO ===');
console.log('URL completa:', window.location.href);
console.log('Hash:', window.location.hash);
console.log('Search:', window.location.search);

// Verificar token al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const { accessToken, type, error, errorDescription } = getTokenFromUrl();
    
    console.log('Token encontrado:', accessToken ? 'Sí' : 'No');
    console.log('Tipo:', type);
    
    const errorDiv = document.getElementById('error');
    
    if (error) {
        errorDiv.textContent = `Error: ${errorDescription || error}`;
        errorDiv.style.display = 'block';
        return;
    }

    if (!accessToken) {
        errorDiv.textContent = 'No se ha encontrado el token en la URL. Asegúrate de usar el enlace del email.';
        errorDiv.style.display = 'block';
    } else {
        console.log('Token válido detectado (primeros 20 chars):', accessToken.substring(0, 20) + '...');
    }
});

// Manejar el envío del formulario
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    // Ocultar mensajes previos
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validaciones
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.style.display = 'block';
        return;
    }

    // Obtener token
    const { accessToken } = getTokenFromUrl();

    console.log('Intentando actualizar contraseña...');
    console.log('Token (primeros 20 chars):', accessToken?.substring(0, 20) + '...');

    if (!accessToken) {
        errorDiv.textContent = 'Token no válido o expirado. Solicita un nuevo enlace de recuperación.';
        errorDiv.style.display = 'block';
        return;
    }

    // Mostrar loader
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        console.log('Respuesta de Supabase:', data);

        if (response.ok) {
            successDiv.textContent = '¡Contraseña actualizada exitosamente!';
            successDiv.style.display = 'block';
            document.getElementById('resetForm').reset();

            // Cerrar ventana después de 3 segundos
            setTimeout(() => {
                window.close();
                // Si no se puede cerrar, redirigir
                if (!window.closed) {
                    window.location.href = 'about:blank';
                }
            }, 3000);
        } else {
            console.error('Error de Supabase:', data);
            errorDiv.textContent = data.msg || data.message || 'Error al actualizar la contraseña';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error de red:', error);
        errorDiv.textContent = 'Error de conexión: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});