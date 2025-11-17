// --- ⚙️ Configuración ---
const JSON_URL = 'https://datos.comunidad.madrid/dataset/c750856d-3166-4dac-8e80-d1b824c968b5/resource/be2264df-c720-4619-ab79-aebad9b248e0/download/centros_educativos.json';
const container = document.getElementById('table-container');

const HEADER_MAP = {
    'centro_nombre': 'Nombre',
    'centro_codigo': 'Número de centro',
    'centro_tipo_desc_abreviada': 'Tipo de centro',
    'dat_nombre': 'DAT', // Campo para el filtro
    'municipio_nombre': 'Municipio',
    'direccion_completa': 'Dirección',
    'centro_titularidad': 'Titularidad',
};

// Variable global para almacenar los datos originales
let allData = [];
// Claves para filtros
const FILTER_KEY_DAT = 'dat_nombre';
const FILTER_KEY_TITULARIDAD = 'centro_titularidad';
const FILTER_KEY_TIPO_CENTRO = 'centro_tipo_desc_abreviada'; 

// --- ⚙️ Configuración de Paginación ---
const ITEMS_PER_PAGE = 50; // Constante para definir el límite por página
let currentPage = 1;       // Variable de estado para la página actual
let currentFilteredData = []; // Almacena los resultados filtrados para paginar

// --- 🛠️ Funciones ---

// (createTableHeader y createTableBody se mantienen sin cambios)

/**
 * Función auxiliar para crear un label con checkbox.
 * Se añade ID específico a los checkboxes de control.
 */
function createCheckboxLabel(text, className, eventHandler, value = text) {
    const label = document.createElement('label');
    label.className = 'checkbox-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = value;
    checkbox.className = className;
    checkbox.checked = true; // Todos seleccionados por defecto
    
    // 💡 CAMBIO 1: Añadir ID al checkbox de Titularidad 'PRIVADO CONCERTADO'
    if (value === 'PRIVADO') {
        checkbox.id = 'privado-titularidad-checkbox';
    }
    if (value === 'PÚBLICO') {
        checkbox.id = 'publico-titularidad-checkbox';
    }
    if (value === 'PRIVADO CONCERTADO') {
        checkbox.id = 'concertado-titularidad-checkbox'; // Nuevo ID
    }

    if (eventHandler) { 
        checkbox.addEventListener('change', eventHandler);
    }

    const span = document.createElement('span');
    span.textContent = text;

    label.appendChild(checkbox);
    label.appendChild(span);
    return label;
}

// -------------------------------------------------------------------------
// Lógica de Toggle para cada tipo de Titularidad
// -------------------------------------------------------------------------

/**
 * Lógica de IF/ELSE para Tipo de Centro Privado.
 */
function togglePrivateTypeCenter() {
    const privadoCheckbox = document.getElementById('privado-titularidad-checkbox');
    if (!privadoCheckbox) return;
    const tipoCentroTitle = document.getElementById('type-center-pri-title');
    const tipoCentroContainer = document.getElementById('type-center-pri-container');
    const tipoCentroCheckboxes = tipoCentroContainer ? tipoCentroContainer.querySelectorAll('.typeCenterPri-checkbox') : [];
    
    const isChecked = privadoCheckbox.checked;

    if (isChecked) {
        if (tipoCentroTitle) tipoCentroTitle.style.color = 'black';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 1;
            tipoCentroContainer.style.pointerEvents = 'auto';
        }
        tipoCentroCheckboxes.forEach(cb => cb.disabled = false);
    } else {
        if (tipoCentroTitle) tipoCentroTitle.style.color = '#ccc';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 0.5;
            tipoCentroContainer.style.pointerEvents = 'none';
        }
        tipoCentroCheckboxes.forEach(cb => {
            cb.checked = false; 
            cb.disabled = true;
        });
    }
}

/**
 * Lógica de IF/ELSE para Tipo de Centro Público.
 */
function togglePublicTypeCenter() {
    const publicoCheckbox = document.getElementById('publico-titularidad-checkbox');
    if (!publicoCheckbox) return;
    const tipoCentroTitle = document.getElementById('type-center-pub-title');
    const tipoCentroContainer = document.getElementById('type-center-pub-container');
    const tipoCentroCheckboxes = tipoCentroContainer ? tipoCentroContainer.querySelectorAll('.typeCenterPub-checkbox') : [];
    
    const isChecked = publicoCheckbox.checked;

    if (isChecked) {
        if (tipoCentroTitle) tipoCentroTitle.style.color = 'black';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 1;
            tipoCentroContainer.style.pointerEvents = 'auto';
        }
        tipoCentroCheckboxes.forEach(cb => cb.disabled = false);
    } else {
        if (tipoCentroTitle) tipoCentroTitle.style.color = '#ccc';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 0.5;
            tipoCentroContainer.style.pointerEvents = 'none';
        }
        tipoCentroCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = true;
        });
    }
}

/**
 * 💡 NUEVA FUNCIÓN: Lógica de IF/ELSE para Tipo de Centro Concertado.
 */
function toggleConcertadoTypeCenter() {
    const concertadoCheckbox = document.getElementById('concertado-titularidad-checkbox');
    if (!concertadoCheckbox) return;

    // 💡 NUEVOS IDs para la sección Concertado
    const tipoCentroTitle = document.getElementById('type-center-conc-title');
    const tipoCentroContainer = document.getElementById('type-center-conc-container');
    const tipoCentroCheckboxes = tipoCentroContainer ? tipoCentroContainer.querySelectorAll('.typeCenterConc-checkbox') : [];
    
    const isChecked = concertadoCheckbox.checked;

    if (isChecked) {
        // Habilitar la sección
        if (tipoCentroTitle) tipoCentroTitle.style.color = 'black';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 1;
            tipoCentroContainer.style.pointerEvents = 'auto';
        }
        tipoCentroCheckboxes.forEach(cb => cb.disabled = false);
    } else {
        // Deshabilitar la sección
        if (tipoCentroTitle) tipoCentroTitle.style.color = '#ccc';
        if (tipoCentroContainer) {
            tipoCentroContainer.style.opacity = 0.5;
            tipoCentroContainer.style.pointerEvents = 'none';
        }
        tipoCentroCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = true;
        });
    }
}

/**
 * Crea y renderiza los controles de paginación.
 */
/**
 * Crea y renderiza los controles de paginación.
 */
function renderPagination(totalItems) {
    // Buscar o crear el contenedor de paginación
    let paginationContainer = document.getElementById('pagination-container');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination-container';
        paginationContainer.className = 'pagination-controls';
        
        // 💡 CAMBIO CLAVE: Añadir el contenedor de paginación al final del #table-container
        // Esto lo coloca DESPUÉS de la tabla.
        const existingTable = document.getElementById('data-table');
        if (existingTable) {
            existingTable.after(paginationContainer); // Colocar después de la tabla
        } else {
            // Si la tabla no está, la añadimos al contenedor principal
            container.appendChild(paginationContainer);
        }
    }
    
    paginationContainer.innerHTML = ''; // Limpiar contenido existente

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return; 

    // --- Botones de Paginación ---
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Página Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        applyPagination();
    });
    paginationContainer.appendChild(prevButton);

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    pageInfo.style.margin = '0 10px';
    paginationContainer.appendChild(pageInfo);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Página Siguiente';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        applyPagination();
    });
    paginationContainer.appendChild(nextButton);
}


/**
 * Aplica la paginación a los datos filtrados y renderiza la tabla.
 * El renderizado de la paginación se hace ahora en renderPagination.
 */
function applyPagination() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedData = currentFilteredData.slice(startIndex, endIndex);
    
    // Renderizar la tabla con la página actual
    renderTable(paginatedData); 
    
    // Renderizar los controles de paginación, que ahora se añadirán DESPUÉS de la tabla
    renderPagination(currentFilteredData.length); 
}

/**
 * Crea la sección completa de filtros para un tipo de centro específico.
 * @param {string} title El título de la sección (ej: 'Público', 'Privado').
 * @param {string} idSuffix El sufijo usado para los IDs y clases (ej: 'pub', 'pri', 'conc').
 * @param {Array<string>} values Los valores de los checkboxes.
 * @returns {HTMLDivElement} El div contenedor de la sección.
 */
function createTypeCenterSection(title, idSuffix, values) {
    const sectionContainer = document.createElement('div');
    
    // --- Título ---
    const typeCenterTitle = document.createElement('h3');
    typeCenterTitle.textContent = `Filtrar por Tipo de centro ${title}:`;
    typeCenterTitle.id = `type-center-${idSuffix}-title`;
    sectionContainer.appendChild(typeCenterTitle);

    // --- Contenedor de Checkboxes ---
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';
    checkboxContainer.id = `type-center-${idSuffix}-container`;
    
    // --- Checkboxes ---
    const className = `typeCenter${title.charAt(0).toUpperCase() + title.slice(1).toLowerCase().replace(' ', '')}-checkbox`;

    values.forEach(value => {
        // Usamos el sufijo para la clase para que el applyFilters y toggles funcionen.
        const label = createCheckboxLabel(value, `typeCenter${idSuffix}-checkbox`, null); 
        checkboxContainer.appendChild(label);
    });

    sectionContainer.appendChild(checkboxContainer);
    
    return sectionContainer;
}

/**
 * Crea los checkboxes de filtro por DAT y por Titularidad, y el botón de Aplicar.
 */
function createFilterButtons() {
    const filterDiv = document.createElement('div');
    filterDiv.id = 'filter-controls';
    filterDiv.className = 'filter-buttons';

    // --- Sección de Filtro por DAT ---
    const datTitle = document.createElement('h3');
    datTitle.textContent = 'Filtrar por DAT:';
    filterDiv.appendChild(datTitle);

    const datCheckboxContainer = document.createElement('div');
    datCheckboxContainer.className = 'checkbox-container';

    const datValues = ['Madrid-Norte', 'Madrid-Sur', 'Madrid-Este', 'Madrid-Oeste'];

    datValues.forEach(datValue => {
        const label = createCheckboxLabel(datValue, 'dat-checkbox', null);
        datCheckboxContainer.appendChild(label);
    });

    filterDiv.appendChild(datCheckboxContainer);

    // --- Separador Titularidad ---
    filterDiv.appendChild(document.createElement('hr'));

    // --- Sección de Filtro por Titularidad (Público/Privado/Concertado) ---
    const titTitle = document.createElement('h3');
    titTitle.textContent = 'Filtrar por Titularidad:';
    filterDiv.appendChild(titTitle);

    const titCheckboxContainer = document.createElement('div');
    titCheckboxContainer.className = 'checkbox-container';

    const titValues = ['PÚBLICO', 'PRIVADO CONCERTADO', 'PRIVADO'];

    titValues.forEach(titValue => {
        let handler = null;
        if (titValue === 'PRIVADO') handler = togglePrivateTypeCenter;
        if (titValue === 'PÚBLICO') handler = togglePublicTypeCenter;
        if (titValue === 'PRIVADO CONCERTADO') handler = toggleConcertadoTypeCenter;

        const label = createCheckboxLabel(titValue, 'tit-checkbox', handler);
        titCheckboxContainer.appendChild(label);
    });

    filterDiv.appendChild(titCheckboxContainer);
    
    // --- Separador Tipo de Centro ---
    filterDiv.appendChild(document.createElement('hr'));
    
    // =========================================================================
    // 💡 SECCIONES DE TIPO DE CENTRO (Ahora limpias y compactas)
    // =========================================================================

    const concertadoValues = ['CPR EGB', 'CPR INF-PRI-SEC', 'CPR INF-PRI']; 
    const publicValues = ['CP EGB', 'CP INF-PRI-SEC', 'CP INF-PRI', 'IES'];
    const privateValues = ['CPR EGB', 'CPR INF-PRI-SEC', 'CPR INF-PRI'];

    // Tipo Público
    filterDiv.appendChild(
        createTypeCenterSection('Público', 'pub', publicValues)
    );
    filterDiv.appendChild(document.createElement('hr'));

    // Tipo Concertado
    filterDiv.appendChild(
        createTypeCenterSection('Concertado', 'conc', concertadoValues)
    );
    filterDiv.appendChild(document.createElement('hr'));

    // Tipo Privado
    filterDiv.appendChild(
        createTypeCenterSection('Privado', 'pri', privateValues)
    );
    
    // 💡 EJECUCIÓN INICIAL de los toggles de deshabilitación
    togglePrivateTypeCenter();
    togglePublicTypeCenter();
    toggleConcertadoTypeCenter(); 
    
    // --- Separador Final ---
    filterDiv.appendChild(document.createElement('hr'));
    
    // --- Botón de Aplicar Filtros (SUBMIT) ---
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Aplicar Filtros';
    submitButton.id = 'apply-filters-btn';
    submitButton.addEventListener('click', applyFilters);
    filterDiv.appendChild(submitButton);

    // --- Contador de Resultados ---
    const counter = document.createElement('div');
    counter.id = 'results-counter';
    counter.className = 'results-counter';
    filterDiv.appendChild(counter);

    return filterDiv;
}

/**
 * Aplica todos los filtros (Titularidad, Tipo Centro Público/Concertado/Privado y DAT).
 * Los resultados se guardan en currentFilteredData y se inicia la paginación.
 */
function applyFilters() {
    let filteredArray = allData;
    
    // 1. Obtener y Aplicar Filtro por Titularidad
    // -------------------------------------------------------------------
    const titCheckboxes = document.querySelectorAll('.tit-checkbox');
    const selectedTits = Array.from(titCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const allTitsSelected = selectedTits.length === titCheckboxes.length;
    
    if (!allTitsSelected) {
        filteredArray = filteredArray.filter(item =>
            selectedTits.includes(item[FILTER_KEY_TITULARIDAD])
        );
    }
    
    // 2. Obtener y Aplicar Filtro por Tipo de Centro (PÚBLICO, CONCERTADO y PRIVADO)
    // -------------------------------------------------------------------
    const publicTypeCheckboxes = document.querySelectorAll('.typeCenterPub-checkbox');
    const privateTypeCheckboxes = document.querySelectorAll('.typeCenterPri-checkbox');
    const concertadoTypeCheckboxes = document.querySelectorAll('.typeCenterConc-checkbox'); 
    
    // Combina los tipos de centro seleccionados de todas las secciones
    const selectedTypes = [
        ...Array.from(publicTypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
        ...Array.from(privateTypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
        ...Array.from(concertadoTypeCheckboxes).filter(cb => cb.checked).map(cb => cb.value) 
    ];
    
    // 💡 CAMBIO INTEGRADO: Aplicar Filtro por Tipo de Centro
    // Si selectedTypes.length > 0, se aplica el filtro, permitiendo filtrar por un solo tipo (ej. IES).
    if (selectedTypes.length > 0) {
        filteredArray = filteredArray.filter(item =>
            selectedTypes.includes(item[FILTER_KEY_TIPO_CENTRO])
        );
    }

    // 3. Obtener y Aplicar Filtro por DAT
    // -------------------------------------------------------------------
    const datCheckboxes = document.querySelectorAll('.dat-checkbox');
    const selectedDATs = Array.from(datCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    const allDATsSelected = selectedDATs.length === datCheckboxes.length;

    if (!allDATsSelected) {
        filteredArray = filteredArray.filter(item =>
            selectedDATs.includes(item[FILTER_KEY_DAT])
        );
    }

    // 4. Actualizar Estado y Paginación 🚀
    // -------------------------------------------------------------------
    currentFilteredData = filteredArray; 
    currentPage = 1; // Siempre volvemos a la primera página tras un nuevo filtro
    
    applyPagination(); // Renderiza la primera página y los controles de paginación
    
    updateCounter(currentFilteredData.length, allData.length);
}

/**
 * Actualiza el contador de resultados.
 */
function updateCounter(filtered, total) {
    const counter = document.getElementById('results-counter');
    if (filtered !== total) {
         counter.textContent = `Mostrando ${filtered} de ${total} centros`;
    } else {
         counter.textContent = `Mostrando los ${total} centros`;
    }
}

// (renderTable y fetchAndRenderTable se mantienen igual)
function createTableHeader(dataArray) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const keys = Object.keys(HEADER_MAP);
    keys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = HEADER_MAP[key];
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    return thead;
}

function createTableBody(dataArray) {
    const tbody = document.createElement('tbody');
    const keys = Object.keys(HEADER_MAP);
    dataArray.forEach(item => {
        const row = document.createElement('tr');
        keys.forEach(key => {
            const cell = document.createElement('td');
            if (key === 'direccion_completa') {
                const tipo = item['Direccion_via_tipo'] || '';
                const nombre = item['Direccion_via_nombre'] || '';
                cell.textContent = `${tipo} ${nombre}`.trim();
            } else {
                cell.textContent = item[key] || '';
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    return tbody;
}

function renderTable(dataArray) {
    const existingTable = document.getElementById('data-table');
    const table = document.createElement('table');
    table.id = 'data-table';
    table.appendChild(createTableHeader(allData));
    table.appendChild(createTableBody(dataArray));
    if (existingTable) {
        existingTable.replaceWith(table);
    } else {
        container.appendChild(table);
    }
}

/**
 * Función principal para obtener datos y construir la tabla.
 */
async function fetchAndRenderTable() {
    // Asegúrate de que 'container' y 'JSON_URL' estén definidas globalmente
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

        // 1. Guardar todos los datos
        allData = dataArray;
        
        // 2. Inicializar los datos filtrados (al inicio, son todos los datos)
        currentFilteredData = dataArray; 

        container.innerHTML = '';

        // 3. Crear controles de filtro, botones y contenedor de paginación
        const filterControls = createFilterButtons();
        container.appendChild(filterControls);

        // 4. Renderizar la primera página y los controles de paginación
        // Esto reemplaza la llamada directa a renderTable(allData)
        currentPage = 1; // Reiniciar o asegurar que la página es 1 al inicio
        applyPagination();

        // 5. Actualizar contador inicial (muestra el total de centros)
        updateCounter(allData.length, allData.length);

    } catch (error) {
        console.error('Error al cargar o procesar los datos:', error);
        container.innerHTML = `<p style="color: red;">Error al cargar los datos: ${error.message}. Verifica la URL.</p>`;
    }
}

// --- 🚀 Ejecución ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderTable();
});