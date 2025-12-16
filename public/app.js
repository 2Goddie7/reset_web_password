const SUPABASE_URL = 'https://ihesibvdlxzcsgdjtdbv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNpYnZkbHh6Y3NnZGp0ZGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTQ1OTcsImV4cCI6MjA4MTQzMDU5N30.hSvNJSCx6NYbJfDwFbkCx7lbZ0tzqOfQ3a9OEyMIa6g';

// Debug: Mostrar la URL completa al cargar
console.log('URL completa:', window.location.href);
console.log('Hash:', window.location.hash);

// Verificar si hay token al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const type = params.get('type');
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    console.log('Token encontrado →', accessToken ? 'Sí' : 'No');
    console.log('Tipo:', type);
    
    const errorDiv = document.getElementById('error');
    
    if (errorParam) {
        errorDiv.textContent = `Error: ${errorDescription || errorParam}`;
        errorDiv.style.display = 'block';
        return;
    }

    if (!accessToken) {
        errorDiv.textContent = 'No se ha encontrado el token en la URL. Asegúrate de usar el enlace del email.';
        errorDiv.style.display = 'block';
    }
});

document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no son iguales, asegurate de que coincidan';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.style.display = 'block';
        return;
    }

    // Obtener access token de la URL
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    console.log('Intentando actualizar contraseña con token →', accessToken?.substring(0, 20) + '...');

    if (!accessToken) {
        errorDiv.textContent = 'Token no válido o expirado. Vuelve a solicitar el enlace.';
        errorDiv.style.display = 'block';
        return;
    }

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

        if (response.ok) {
            console.log('La contraseña se actualizó de forma exitosa.');
            successDiv.textContent = 'Contraseña actualizada!';
            successDiv.style.display = 'block';
            document.getElementById('resetForm').reset();

            setTimeout(() => {
                window.close();
            }, 3000);
        } else {
            const error = await response.json();
            console.error('Error de Supabase:', error);
            errorDiv.textContent = error.msg || error.message || 'Error al actualizar contraseña';
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
