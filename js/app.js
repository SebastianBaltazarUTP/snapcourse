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
// LÓGICA PARA PEGAR TEXTO (FALTABA ESTO)
// ==================================================

// 1. Habilitar el botón cuando el usuario escribe
function detectarEscritura(textarea) {
    const btn = document.getElementById('btn-continuar');
    if (textarea.value.trim().length > 0) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    }
}

// 2. Procesar el texto y crear el proyecto
function procesarTextoYContinuar(e) {
    // Si la pestaña activa es la de TEXTO, guardamos eso
    const tabTexto = document.getElementById('tab-text');
    
    if (tabTexto && tabTexto.classList.contains('active')) {
        e.preventDefault(); // Evitamos irnos todavía
        
        const contenido = document.getElementById('input-guion').value;
        
        if (contenido.trim().length > 0) {
            // Usamos las primeras 4 palabras como título del proyecto
            let titulo = contenido.split(' ').slice(0, 4).join(' ') + "...";
            
            // Si es muy corto, ponemos un genérico
            if(titulo.length < 5) titulo = "Apuntes de Clase";

            // Creamos el proyecto en memoria
            iniciarProyecto(titulo);
            
            // Ahora sí, navegamos al paso 2
            window.location.href = 'crear-paso2.html';
        }
    } else {
        // MODO PDF: Asumimos que ya se "subió" algo
        // Si ya hay un proyecto iniciado (por subir archivo), avanzamos
        if(sessionStorage.getItem(TEMP_KEY)) {
            window.location.href = 'crear-paso2.html';
        } else {
            // Si no ha subido nada y da click (raro pq debería estar deshabilitado), forzamos un default
            iniciarProyecto("Documento PDF");
            window.location.href = 'crear-paso2.html';
        }
    }
}
// ==================================================
// 3. GUARDADO FINAL (VERSIÓN A PRUEBA DE FALLOS)
// ==================================================

function guardarProyectoFinal() {
    // 1. Intentamos leer el proyecto que viene del paso anterior
    let project = JSON.parse(sessionStorage.getItem(TEMP_KEY));
    
    // --- CORRECCIÓN DE SEGURIDAD ---
    // Si 'project' está vacío (null) porque recargaste la página o saltaste pasos,
    // creamos uno "fantasma" para que la DEMO NO FALLE.
    if (!project) {
        project = {
            id: 'proj_' + Date.now(),
            nombre: 'Proyecto Demo (Autogenerado)', // Nombre por defecto
            fecha: 'Hace un momento',
            duracion: '0:45', 
            estilo: 'Clásico',
            thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80'
        };
    }
    // --------------------------------

    // 2. Obtener lista actual de proyectos guardados
    let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // 3. Añadir el nuevo al principio
    projects.unshift(project);
    
    // 4. Guardar en LocalStorage (Persistencia)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    
    // 5. Limpiar temporal
    sessionStorage.removeItem(TEMP_KEY);
    
    // 6. Feedback y Redirección
    if(typeof showToast === 'function') {
        showToast("¡Proyecto guardado con éxito!");
    } else {
        alert("¡Proyecto guardado con éxito!");
    }
    
    // Esperar 2 segundos y redirigir
    setTimeout(() => {
        window.location.href = 'proyectos.html';
    }, 2000); 
}