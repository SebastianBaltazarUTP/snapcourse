// ==================================================
// CONFIGURACIÓN GLOBAL
// ==================================================
// ESTA CLAVE DEBE SER IGUAL A LA DE PROYECTOS.HTML
const STORAGE_KEY = 'snapcourse_projects'; 
const TEMP_KEY = 'snapcourse_temp_project';

// Inicializar iconos al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// ==================================================
// 1. UTILIDADES GLOBALES (Toast y Accesibilidad)
// ==================================================

// Mostrar notificación flotante
function showToast(mensaje) {
    const toast = document.getElementById('app-toast');
    const msg = document.getElementById('toast-message');
    
    if(toast && msg) {
        msg.innerText = mensaje;
        toast.classList.add('active');
        
        // Ocultar automáticamente
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
}

// Ajustar tamaño de texto (Mejora Docente - Semana 16)
function ajustarTexto(cambio) {
    const textarea = document.getElementById('input-guion');
    if (!textarea) return;

    let currentSize = parseInt(window.getComputedStyle(textarea).fontSize);
    let newSize = currentSize + cambio;
    if (newSize >= 12 && newSize <= 24) {
        textarea.style.fontSize = newSize + "px";
    }
}

// ==================================================
// 2. FLUJO DE CREACIÓN (WIZARD)
// ==================================================

// PASO 1: Subida de archivo / Inicio
function manejarSubidaArchivo(input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        iniciarProyecto(fileName);
        
        // Feedback visual
        const btnContinuar = document.querySelector('.btn-main');
        if(btnContinuar) {
            btnContinuar.style.opacity = '1';
            btnContinuar.style.pointerEvents = 'auto';
        }
        
        const uploadText = document.querySelector('.upload-text');
        if(uploadText) {
            uploadText.innerHTML = `Archivo seleccionado:<br><span style="color:#3341A2">${fileName}</span>`;
        }
    }
}

function iniciarProyecto(nombreArchivo) {
    const tempProject = {
        id: 'proj_' + Date.now(),
        nombre: nombreArchivo,
        fecha: 'Hace un momento',
        duracion: '0:45', 
        estilo: 'Clásico',
        thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
    };
    sessionStorage.setItem(TEMP_KEY, JSON.stringify(tempProject));
}

// PASO 3: Simulación de IA (Loading realista)
function iniciarSimulacionIA() {
    // Solo ejecutar si estamos en la pantalla de vista previa (Paso 3)
    if(!document.getElementById('ai-status')) return;

    const statusText = document.getElementById('ai-status');
    const loaderContainer = document.getElementById('ai-loader');
    const videoPreview = document.getElementById('preview-video');
    
    const pasos = [
        { texto: "Analizando tu contenido...", tiempo: 0 },
        { texto: "Resumiendo conceptos clave...", tiempo: 1500 },
        { texto: "Generando guion educativo...", tiempo: 3000 },
        { texto: "Sintetizando voz neuronal...", tiempo: 4500 },
        { texto: "Sincronizando subtítulos...", tiempo: 6000 }
    ];

    pasos.forEach(paso => {
        setTimeout(() => {
            statusText.innerText = paso.texto;
            statusText.style.opacity = 0.5;
            setTimeout(() => statusText.style.opacity = 1, 300);
        }, paso.tiempo);
    });

    setTimeout(() => {
        loaderContainer.style.display = 'none';
        videoPreview.style.display = 'block';
        videoPreview.play();
    }, 7500); 
}

// ==================================================
// 3. GUARDADO FINAL
// ==================================================

function guardarProyectoFinal() {
    const project = JSON.parse(sessionStorage.getItem(TEMP_KEY));
    
    if (project) {
        // 1. Obtener lista actual (Usando la misma clave que proyectos.html)
        let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // 2. Añadir el nuevo
        projects.unshift(project);
        
        // 3. Guardar
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        
        // 4. Limpiar temporal
        sessionStorage.removeItem(TEMP_KEY);
        
        // 5. Feedback y Redirección
        showToast("¡Proyecto guardado con éxito!");
        
        setTimeout(() => {
            window.location.href = 'proyectos.html';
        }, 2000); 

    } else {
        showToast("Error: No hay proyecto para guardar.");
    }
}