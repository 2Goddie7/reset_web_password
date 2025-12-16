const SUPABASE_URL = 'https://ihesibvdlxzcsgdjtdbv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXNpYnZkbHh6Y3NnZGp0ZGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NTQ1OTcsImV4cCI6MjA4MTQzMDU5N30.hSvNJSCx6NYbJfDwFbkCx7lbZ0tzqOfQ3a9OEyMIa6g';

// Función para extraer parámetros del hash o query string
function getTokenFromUrl() {
    console.log('🔍 Buscando token...');
    
    // Intentar primero desde el hash (#)
    const hash = window.location.hash.substring(1);
    console.log('Hash encontrado:', hash);
    let params = new URLSearchParams(hash);
    let accessToken = params.get('access_token');
    
    // Si no está en el hash, intentar desde query string (?)
    if (!accessToken) {
        console.log('No hay token en hash, buscando en query string...');
        const search = window.location.search.substring(1);
        console.log('Query string encontrado:', search);
        params = new URLSearchParams(search);
        accessToken = params.get('access_token');
        
        // También probar con 'token' (por si acaso)
        if (!accessToken) {
            accessToken = params.get('token');
        }
    }
    
    const result = {
        accessToken,
        type: params.get('type'),
        error: params.get('error'),
        errorDescription: params.get('error_description')
    };
    
    console.log('Resultado de búsqueda:', result);
    return result;
}

// Debug mejorado al cargar
console.log('=== 🚀 INICIANDO PÁGINA DE RESET ===');
console.log('📍 URL completa:', window.location.href);
console.log('🔗 Protocol:', window.location.protocol);
console.log('🌐 Host:', window.location.host);
console.log('📂 Pathname:', window.location.pathname);
console.log('❓ Search (query):', window.location.search);
console.log('#️⃣ Hash:', window.location.hash);
console.log('=====================================');

// Verificar token al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, verificando token...');
    
    const { accessToken, type, error, errorDescription } = getTokenFromUrl();
    
    const errorDiv = document.getElementById('error');
    
    if (error) {
        console.error('❌ Error en URL:', error);
        errorDiv.textContent = `Error: ${errorDescription || error}`;
        errorDiv.style.display = 'block';
        return;
    }

    if (!accessToken) {
        console.warn('⚠️ No se encontró token en la URL');
        console.log('💡 La URL debe verse así:');
        console.log('   http://localhost:3000/reset-password#access_token=xxxxx&type=recovery');
        console.log('   O:');
        console.log('   http://localhost:3000/reset-password?access_token=xxxxx&type=recovery');
        
        errorDiv.innerHTML = `
            <strong>No se encontró el token en la URL.</strong><br><br>
            <strong>Posibles causas:</strong><br>
            1. No usaste el enlace del email<br>
            2. La URL de redirección no está configurada en Supabase<br>
            3. El email de Supabase no incluye el token<br><br>
            <strong>URL actual:</strong><br>
            <code style="font-size: 12px; word-break: break-all;">${window.location.href}</code>
        `;
        errorDiv.style.display = 'block';
    } else {
        console.log('✅ Token válido detectado!');
        console.log('Token (primeros 20 chars):', accessToken.substring(0, 20) + '...');
        console.log('Tipo:', type);
    }
});

// Manejar el envío del formulario
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('📝 Formulario enviado');

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
        console.warn('⚠️ Las contraseñas no coinciden');
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        console.warn('⚠️ Contraseña muy corta');
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.style.display = 'block';
        return;
    }

    // Obtener token
    const { accessToken } = getTokenFromUrl();

    console.log('🔐 Intentando actualizar contraseña...');

    if (!accessToken) {
        console.error('❌ No hay token disponible');
        errorDiv.textContent = 'Token no válido o expirado. Solicita un nuevo enlace de recuperación.';
        errorDiv.style.display = 'block';
        return;
    }

    // Mostrar loader
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
        console.log('📡 Enviando petición a Supabase...');
        console.log('URL:', `${SUPABASE_URL}/auth/v1/user`);
        
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
        console.log('📨 Respuesta de Supabase:', data);
        console.log('Status:', response.status);

        if (response.ok) {
            console.log('✅ Contraseña actualizada exitosamente!');
            successDiv.textContent = '¡Contraseña actualizada exitosamente!';
            successDiv.style.display = 'block';
            document.getElementById('resetForm').reset();

            // Cerrar ventana después de 3 segundos
            setTimeout(() => {
                console.log('🚪 Cerrando ventana...');
                window.close();
                // Si no se puede cerrar, redirigir
                if (!window.closed) {
                    window.location.href = 'about:blank';
                }
            }, 3000);
        } else {
            console.error('❌ Error de Supabase:', data);
            errorDiv.textContent = data.msg || data.message || 'Error al actualizar la contraseña';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
        errorDiv.textContent = 'Error de conexión: ' + error.message;
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
});