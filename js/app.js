// --- ⚙️ Configuración ---
// ¡IMPORTANTE! Reemplaza esta URL con la URL de tu archivo JSON.
const JSON_URL = 'https://datos.comunidad.madrid/dataset/c750856d-3166-4dac-8e80-d1b824c968b5/resource/be2264df-c720-4619-ab79-aebad9b248e0/download/centros_educativos.json'; 
const container = document.getElementById('table-container');

// --- 🛠️ Funciones ---

/**
 * Crea el encabezado (<th>) de la tabla usando las claves del primer objeto JSON.
 * @param {Array<Object>} dataArray - El array de objetos JSON.
 * @returns {HTMLTableSectionElement} El elemento <thead>.
 */
function createTableHeader(dataArray) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Obtenemos las claves del primer objeto para usarlas como encabezados de columna
    const keys = Object.keys(dataArray[0]);

    keys.forEach(key => {
        const th = document.createElement('th');
        // Capitalizamos la primera letra para mejor presentación
        th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    return thead;
}

/**
 * Crea el cuerpo (<tbody>) de la tabla con los datos.
 * @param {Array<Object>} dataArray - El array de objetos JSON.
 * @returns {HTMLTableSectionElement} El elemento <tbody>.
 */
function createTableBody(dataArray) {
    const tbody = document.createElement('tbody');
    const keys = Object.keys(dataArray[0]); // Para mantener el orden de las columnas

    dataArray.forEach(item => {
        const row = document.createElement('tr');

        keys.forEach(key => {
            const cell = document.createElement('td');
            // Aseguramos que el valor se muestre como texto
            cell.textContent = item[key]; 
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    return tbody;
}

/**
 * Función principal para obtener datos y construir la tabla.
 */
async function fetchAndRenderTable() {
    try {
        // 1. Obtener los datos usando Fetch API
        const response = await fetch(JSON_URL);

        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 2. Convertir la respuesta a JSON
        const data = await response.json();
        
        // Asumimos que el JSON es un Array de objetos, si es un objeto con una clave array, 
        // deberías modificar esta línea (ej: const dataArray = data.items;).
        const dataArray = Array.isArray(data) ? data : data.items || data[Object.keys(data)[0]]; 

        if (!dataArray || dataArray.length === 0) {
            container.innerHTML = '<p>No se encontraron datos para mostrar.</p>';
            return;
        }

        // 3. Crear la tabla
        const table = document.createElement('table');
        table.id = 'data-table'; 

        // 4. Crear y añadir el encabezado y el cuerpo
        table.appendChild(createTableHeader(dataArray));
        table.appendChild(createTableBody(dataArray));

        // 5. Limpiar el contenedor y añadir la tabla al DOM
        container.innerHTML = '';
        container.appendChild(table);

    } catch (error) {
        console.error('Error al cargar o procesar los datos:', error);
        container.innerHTML = `<p style="color: red;">Error al cargar los datos: ${error.message}. Verifica la URL.</p>`;
    }
}

// --- 🚀 Ejecución ---
// Llamar a la función al cargar la página
fetchAndRenderTable();