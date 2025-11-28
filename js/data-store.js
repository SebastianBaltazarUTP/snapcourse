/**
 * LÓGICA DE ALMACENAMIENTO (SIMULACIÓN DE BASE DE DATOS)
 * Archivo: js/data-store.js
 * Funcionalidad: Guardar, Cargar y Eliminar proyectos usando LocalStorage.
 */

const STORAGE_KEY = 'snapcourse_proyectos'; 

/**
 * Obtiene la lista de proyectos guardados.
 */
const getProjects = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error al leer LocalStorage:", e);
        return [];
    }
};

/**
 * Guarda un nuevo proyecto.
 */
const saveProject = (newProjectData) => {
    const projects = getProjects();
    
    const projectToSave = {
        id: Date.now(), // ID único basado en tiempo
        nombre: newProjectData.nombre || `Microvideo ${projects.length + 1}`,
        duracion: newProjectData.duracion || '60s',
        fecha: new Date().toLocaleDateString('es-ES'),
        // Simulamos un ID visual para la miniatura (opcional)
        simulacionId: Math.floor(Math.random() * 1000) 
    };

    projects.unshift(projectToSave); // Agrega al principio de la lista

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return true;
    } catch (e) {
        console.error("Error al guardar:", e);
        return false;
    }
};

/**
 * Elimina un proyecto por su ID.
 */
const deleteProject = (projectId) => {
    let projects = getProjects();
    const initialLength = projects.length;
    
    // Filtramos para quitar el proyecto con ese ID
    projects = projects.filter(p => p.id !== projectId);
    
    if (projects.length < initialLength) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true; // Eliminación exitosa
        } catch (e) {
            console.error("Error al actualizar LocalStorage:", e);
            return false;
        }
    }
    return false; // No se encontró el ID
};

/**
 * Calcula estadísticas para el Perfil.
 */
const getStats = () => {
    const total = getProjects().length;
    return {
        totalProyectos: total,
        tiempoAhorrado: `${(total * 0.5).toFixed(1)}h`, // Simulación: 30min por video
        minutosGenerados: `${total * 1.5}m`
    };
};