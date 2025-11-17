// --- ⚙️ Configuración ---
// ¡IMPORTANTE! Reemplaza esta URL con la URL de tu archivo JSON.
const JSON_URL = 'https://datos.comunidad.madrid/dataset/c750856d-3166-4dac-8e80-d1b824c968b5/resource/be2264df-c720-4619-ab79-aebad9b248e0/download/centros_educativos.json'; 
const container = document.getElementById('table-container');
const HEADER_MAP = {
    'nombre': 'Nombre', 
    'cod_centro': 'Número de centro', 
    'tipo_centro': 'Tipo de centro',
    'tipo_dat': 'Dat', // Usamos este campo para el filtro
    'direccion': 'Dirección',
    'municipio': 'Municipio',
};

// Variable global para almacenar los datos originales
let allData = [];
// Clave por la que queremos filtrar
const FILTER_KEY = 'tipo_dat';

// --- 🛠️ Funciones ---

/**
 * Crea el encabezado (<th>) de la tabla usando las claves del primer objeto JSON.
 * @param {Array<Object>} dataArray - El array de objetos JSON.
 * @returns {HTMLTableSectionElement} El elemento <thead>.
 */
function createTableHeader(dataArray) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Usamos las claves de HEADER_MAP para el orden y los nombres de columna
    const keys = Object.keys(HEADER_MAP); 

    keys.forEach(key => {
        const th = document.createElement('th');
        // Usamos el valor del HEADER_MAP para el nombre legible
        th.textContent = HEADER_MAP[key]; 
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
    // Usamos las claves de HEADER_MAP para asegurar que solo se muestren las columnas deseadas
    const keys = Object.keys(HEADER_MAP); 

    dataArray.forEach(item => {
        const row = document.createElement('tr');

        keys.forEach(key => {
            const cell = document.createElement('td');
            // Aseguramos que el valor se muestre como texto
            // Usamos item[key] para obtener el valor del objeto, ¡clave importante!
            cell.textContent = item[key] || ''; // Añadido || '' para evitar 'undefined' si falta la clave
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });

    return tbody;
}

/**
 * Crea el elemento de selección (dropdown) para el filtro.
 * @param {Array<Object>} dataArray - El array completo de objetos JSON.
 */
function createFilterSelect(dataArray) {
    const uniqueValues = new Set();
    dataArray.forEach(item => {
        if (item[FILTER_KEY]) {
            uniqueValues.add(item[FILTER_KEY]);
        }
    });

    const select = document.createElement('select');
    select.id = 'dat-filter';
    
    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Filtrar por ${HEADER_MAP[FILTER_KEY] || FILTER_KEY} (Todos)`;
    select.appendChild(defaultOption);

    // Opciones únicas
    Array.from(uniqueValues).sort().forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });

    // Añadir el listener para aplicar el filtro al cambiar
    select.addEventListener('change', filterData);

    // Insertar el selector antes de la tabla (o en un nuevo div)
    const filterDiv = document.createElement('div');
    filterDiv.id = 'filter-controls';
    filterDiv.appendChild(select);

    // Si ya existe, lo reemplazamos o lo añadimos al inicio del contenedor
    const existingFilterDiv = document.getElementById('filter-controls');
    if (existingFilterDiv) {
        existingFilterDiv.replaceWith(filterDiv);
    } else {
        container.prepend(filterDiv); // Añadir al inicio del contenedor
    }
}

/**
 * Aplica el filtro a los datos y vuelve a renderizar la tabla.
 */
function filterData() {
    const select = document.getElementById('dat-filter');
    const filterValue = select.value;
    
    let filteredArray = allData;

    if (filterValue) {
        // Filtrar si hay un valor seleccionado
        filteredArray = allData.filter(item => item[FILTER_KEY] === filterValue);
    }
    
    // Renderizar la tabla con los datos filtrados
    renderTable(filteredArray);
}

/**
 * Crea el formulario de filtro con un campo de texto y un botón.
 */
function createFilterForm() {
    const filterDiv = document.createElement('div');
    filterDiv.id = 'filter-controls';
    
    // Crear el formulario
    const form = document.createElement('form');
    form.id = 'dat-filter-form';
    
    // Crear el campo de texto
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'dat-filter-input';
    input.placeholder = `Buscar por ${HEADER_MAP[FILTER_KEY] || FILTER_KEY}...`;
    
    // Crear el botón de filtrar
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Filtrar';

    // Añadir los elementos al formulario
    form.appendChild(input);
    form.appendChild(button);

    // Añadir el listener para aplicar el filtro al enviar el formulario
    form.addEventListener('submit', handleFormSubmit);

    // Añadir el formulario al div de control
    filterDiv.appendChild(form);

    // Limpiamos el contenedor y añadimos el control de filtro al inicio
    container.innerHTML = ''; 
    container.appendChild(filterDiv);
}

/**
 * Maneja el evento de envío del formulario (al presionar Enter o el botón).
 * @param {Event} event - El evento de envío del formulario.
 */
function handleFormSubmit(event) {
    // 1. Prevenir el envío del formulario tradicional (que recargaría la página)
    event.preventDefault(); 
    
    // 2. Obtener el valor de búsqueda
    const input = document.getElementById('dat-filter-input');
    // Convertir a minúsculas para hacer la búsqueda insensible a mayúsculas
    const filterValue = input.value.toLowerCase().trim();
    
    let filteredArray = allData;

    if (filterValue) {
        // Filtrar si hay un valor en el campo de texto
        filteredArray = allData.filter(item => {
            const itemValue = item[FILTER_KEY] ? item[FILTER_KEY].toLowerCase() : '';
            // Usamos includes() para buscar cualquier parte del texto
            return itemValue.includes(filterValue);
        });
    }
    
    // Renderizar la tabla con los datos filtrados
    renderTable(filteredArray);
}

/**
 * Limpia el contenedor y añade la tabla.
 * @param {Array<Object>} dataArray - El array de objetos a renderizar.
 */
function renderTable(dataArray) {
    const tableContainer = document.getElementById('table-container');
    const existingTable = document.getElementById('data-table');

    // 1. Crear la tabla
    const table = document.createElement('table');
    table.id = 'data-table'; 

    // 2. Crear y añadir el encabezado y el cuerpo
    // Usamos allData[0] para el encabezado, así el orden siempre es el mismo
    table.appendChild(createTableHeader(allData)); 
    table.appendChild(createTableBody(dataArray));

    // 3. Reemplazar la tabla existente o añadirla
    if (existingTable) {
        existingTable.replaceWith(table);
    } else {
        // Si no existe tabla, asumimos que createFilterSelect ya se ejecutó, 
        // por lo que simplemente la añadimos al contenedor
        tableContainer.appendChild(table);
    }
}

/**
 * Limpia el contenedor y añade la tabla.
 */
function renderTable(dataArray) {
    // ... (El cuerpo de la función renderTable es el mismo)
    const existingTable = document.getElementById('data-table');

    // 1. Crear la tabla
    const table = document.createElement('table');
    table.id = 'data-table'; 

    // 2. Crear y añadir el encabezado y el cuerpo
    table.appendChild(createTableHeader(allData)); 
    table.appendChild(createTableBody(dataArray));

    // 3. Reemplazar la tabla existente o añadirla
    if (existingTable) {
        existingTable.replaceWith(table);
    } else {
        // Si no existe tabla, se añade después del div de control
        container.appendChild(table);
    }
}

/**
 * Función principal para obtener datos y construir la tabla.
 */
async function fetchAndRenderTable() {
    try {
        const response = await fetch(JSON_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const dataArray = Array.isArray(data) ? data : data.items || data[Object.keys(data)[0]]; 

        if (!dataArray || dataArray.length === 0) {
            container.innerHTML = '<p>No se encontraron datos para mostrar.</p>';
            return;
        }

        // 1. ALMACENAR LOS DATOS ORIGINALES en la variable global
        allData = dataArray;

        // 2. Limpiar el contenedor (esto podría dejar el filtro si ya se creó)
        container.innerHTML = ''; 

        // 3. Crear el selector de filtro y añadirlo al DOM
        createFilterSelect(allData);

        // 4. Renderizar la tabla inicial (con todos los datos)
        renderTable(allData);

    } catch (error) {
        console.error('Error al cargar o procesar los datos:', error);
        container.innerHTML = `<p style="color: red;">Error al cargar los datos: ${error.message}. Verifica la URL.</p>`;
    }
}

// --- 🚀 Ejecución ---
// Llamar a la función al cargar la página
fetchAndRenderTable();