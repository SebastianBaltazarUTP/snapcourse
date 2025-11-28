// ==================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==================================================
const STORAGE_KEY = 'snapcourse_projects';
const TEMP_KEY = 'snapcourse_temp_project';

// Variable para rastrear qué tarjeta se seleccionó para editar/eliminar
let currentCardId = null;

// ==================================================
// 1. LÓGICA DEL WIZARD (PROCESO DE CREACIÓN)
// ==================================================

/**
 * Paso 1: Iniciar un proyecto temporal al subir archivo
 */
function iniciarProyecto(nombreArchivo) {
    // Creamos un ID único usando 'proj_' + timestamp para evitar conflictos
    const tempProject = {
        id: 'proj_' + Date.now(),
        nombre: nombreArchivo,
        fecha: 'Hace un momento',
        duracion: '0:45', // Valor por defecto
        estilo: 'Clásico', // Valor por defecto
        // Video de stock para la simulación
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        // Thumbnail de stock
        thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80'
    };
    
    // Guardamos en memoria temporal (SessionStorage)
    sessionStorage.setItem(TEMP_KEY, JSON.stringify(tempProject));
    console.log('Proyecto iniciado:', tempProject);
}

/**
 * Paso 2: Actualizar datos (si el usuario cambia configuración)
 */
function actualizarProyecto(datos) {
    let project = JSON.parse(sessionStorage.getItem(TEMP_KEY));
    if (project) {
        project = { ...project, ...datos };
        sessionStorage.setItem(TEMP_KEY, JSON.stringify(project));
    }
}

/**
 * Paso Final: Guardar proyecto en el Dashboard permanente
 */
function guardarProyectoFinal() {
    const project = JSON.parse(sessionStorage.getItem(TEMP_KEY));
    
    if (project) {
        // 1. Obtener lista actual de proyectos guardados
        let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        // 2. Añadir el nuevo al principio
        projects.unshift(project);
        
        // 3. Guardar en LocalStorage (Persistencia)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        
        // 4. Limpiar temporal
        sessionStorage.removeItem(TEMP_KEY);
        
        // 5. Redirigir al dashboard
        window.location.href = 'proyectos.html';
    } else {
        alert("Error: No hay proyecto para guardar.");
    }
}

// Helper para el input de archivo en crear-paso1.html
function manejarSubidaArchivo(input) {
    if (input.files && input.files[0]) {
        const fileName = input.files[0].name;
        
        // Iniciar lógica
        iniciarProyecto(fileName);
        
        // Feedback visual en el botón "Continuar"
        const btnContinuar = document.querySelector('.btn-main');
        if(btnContinuar) {
            btnContinuar.style.opacity = '1';
            btnContinuar.style.pointerEvents = 'auto';
            btnContinuar.textContent = 'Continuar →'; // Restaurar texto si cambió
        }
        
        // Feedback en el texto de carga
        const uploadText = document.querySelector('.upload-text');
        if(uploadText) {
            uploadText.innerHTML = `Archivo seleccionado:<br><span style="color:#3341A2">${fileName}</span>`;
        }
    }
}

// ==================================================
// 2. LÓGICA DEL DASHBOARD (MIS PROYECTOS)
// ==================================================

/**
 * Renderiza la lista de proyectos en el HTML
 */
function cargarDashboard() {
    const container = document.getElementById('grid-proyectos');
    // Si no existe el contenedor, no estamos en la página correcta, salimos.
    if (!container) return;

    // Recuperar proyectos
    let projects = JSON.parse(localStorage.getItem(STORAGE_KEY));

    // Si está vacío o es la primera vez, cargamos datos de ejemplo
    if (!projects || projects.length === 0) {
        const iniciales = [
            {
                id: 'demo_1',
                nombre: 'Introducción a React Hooks',
                fecha: 'Hace 2 días',
                duracion: '5:30',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=60'
            },
            {
                id: 'demo_2',
                nombre: 'Optimización Web Vitals',
                fecha: 'Hace 1 semana',
                duracion: '7:20',
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=60'
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
        projects = iniciales;
    }

    // Limpiar contenedor
    container.innerHTML = '';
    
    // Generar HTML para cada tarjeta
    projects.forEach(p => {
        const cardHTML = `
        <div class="project-card" id="${p.id}">
            <div class="card-thumb">
                <img src="${p.thumbnail}" alt="${p.nombre}" style="width:100%; height:100%; object-fit:cover;">
                <div class="thumb-overlay">
                    <i data-lucide="play-circle" size="48" color="white" stroke-width="1.5"></i>
                </div>
                <!-- Botón de menú con el ID específico -->
                <button class="card-menu-btn" onclick="openSheet(event, '${p.id}')">
                    <i data-lucide="more-vertical" size="20"></i>
                </button>
            </div>
            <div class="card-body">
                <h3 class="card-title">${p.nombre}</h3>
                <div class="card-meta">
                    <div class="meta-item"><i data-lucide="clock" size="14"></i> ${p.duracion}</div>
                    <div class="meta-item"><i data-lucide="calendar" size="14"></i> ${p.fecha}</div>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardHTML;
    });

    // Refrescar iconos
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// ==================================================
// 3. GESTIÓN DE ACCIONES (ELIMINAR / DUPLICAR)
// ==================================================

function openSheet(event, cardId) {
    if(event) event.stopPropagation(); // Evitar abrir el video
    currentCardId = cardId; // Guardar ID globalmente
    
    const sheet = document.getElementById('action-sheet');
    const overlay = document.getElementById('sheet-overlay');
    
    if(sheet && overlay) {
        overlay.classList.add('active');
        sheet.classList.add('active');
    }
}

function closeSheet() {
    const sheet = document.getElementById('action-sheet');
    const overlay = document.getElementById('sheet-overlay');
    
    if(sheet && overlay) {
        overlay.classList.remove('active');
        sheet.classList.remove('active');
    }
}

function handleAction(action) {
    closeSheet(); // Cerrar menú primero

    if (action === 'eliminar') {
        // Esperar animación de cierre
        setTimeout(eliminarProyecto, 300);
    } 
    else if (action === 'duplicar') {
        setTimeout(duplicarProyecto, 300);
    }
}

function eliminarProyecto() {
    let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    // FILTRADO SEGURO: Comparamos como String para evitar errores de tipo (number vs string)
    const nuevosProyectos = projects.filter(p => String(p.id) !== String(currentCardId));
    
    // Guardar cambios
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosProyectos));
    
    // Mostrar Feedback Visual (Modal Éxito)
    const modal = document.getElementById('success-modal');
    if(modal) {
        modal.classList.add('active');
        setTimeout(() => {
            modal.classList.remove('active');
            // Recargar la lista para reflejar cambios
            cargarDashboard(); 
        }, 1500);
    } else {
        // Si no hay modal, recargar directo
        cargarDashboard();
    }
}

function duplicarProyecto() {
    let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // Buscar el original
    const original = projects.find(p => String(p.id) === String(currentCardId));
    
    if (original) {
        // Crear copia
        const copia = {
            ...original,
            id: 'proj_' + Date.now(), // Nuevo ID único
            nombre: original.nombre + ' (Copia)'
        };
        
        projects.unshift(copia); // Añadir al inicio
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        cargarDashboard();
    }
}

// ==================================================
// 4. INICIALIZACIÓN
// ==================================================

// Se ejecuta cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página de proyectos (buscando el grid), cargar datos
    if (document.getElementById('grid-proyectos')) {
        cargarDashboard();
    }
    
    // Inicializar Iconos Lucide globalmente
    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});