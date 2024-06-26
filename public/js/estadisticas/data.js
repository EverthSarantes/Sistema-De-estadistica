const chart_container = document.getElementById('chart');
const load_chart_button = document.getElementById('load-chart-button');
let modal = new bootstrap.Modal(document.getElementById('modal_save_data'));
let modal_chart = new bootstrap.Modal(document.getElementById('modal_load_grafic'));
let modal_config = new bootstrap.Modal(document.getElementById('modal_config_grafic'));
let modal_info = new bootstrap.Modal(document.getElementById('modal_info'));
let title = '';

let dataset = {
    labels: [],
    data: []
};

function getMayorLengthData(){
    let mayor = 0;
    dataset.data.forEach(function(data){
        if(data.length > mayor){
            mayor = data.length;
        }
    });
    return mayor;
}

function resetLabels(){
    dataset.labels = [];
}

function resetData(){
    dataset.data = [];
}

function deleteData(name){
    dataset.data = dataset.data.filter(data => data.name != name);
}

function setLabels(data){
    data.forEach(row => {
        dataset.labels.push(row);
    });
}

function setData(data, name = 'Data'){
    dataset.data.push({
        name: name,
        data: data
    });
}

let chart;
function loadChart(){
    let type = document.getElementById('chart-type-selector').value;
    title = document.getElementById('chart-title').value;
    let background_color = document.getElementById('chart-background-color').value;
    let border_color = document.getElementById('chart-border-color').value;
    let font_color = document.getElementById('chart-font-color').value;
    const elements_color_inputs = document.getElementsByName('color[]');
    const elements_color = Array.from(elements_color_inputs).map(input => input.value);

    document.getElementById('modal_load_graficModalLabel').innerHTML = title || 'Grafico';
    if(chart){
        chart.destroy();
    }

    const changeBackgroundColor = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
            const {ctx} = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#99ffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    Chart.defaults.color = font_color || 'rgba(54, 162, 235, 1)';
    chart = new Chart(chart_container, {
        type: type || 'bar',
        data: {
            labels: dataset.labels,
            datasets: dataset.data.map((data, index) => ({
                label: data.name || `Grafico ${index + 1}`,
                data: data.data,
                borderWidth: 1,
                backgroundColor: elements_color[index] || 'rgba(54, 162, 235, 0.2)',
                borderColor: border_color || 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }))
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            plugins: {
                customCanvasBackgroundColor: {
                    color: background_color || '#ffffff',
                }
            },
        },
        plugins: [changeBackgroundColor],
    })
    modal_config.hide();
    modal_chart.show();
}

load_chart_button.addEventListener('click', loadChart);

function setTableLabels(){
    let tr = document.getElementById('tr-labels');
    tr.innerHTML = '';
    let th1 = document.createElement('th');
    let button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('class', 'btn btn-danger');
    button.innerHTML = 'X';
    button.addEventListener('click', function(){
        resetLabels();
        setTableLabels();
        addTableData();
    });
    th1.appendChild(button);
    tr.appendChild(th1);
    dataset.labels.forEach(label => {
        let th = document.createElement('th');
        th.innerHTML = label;
        tr.appendChild(th);
    });
}

function addTableData(){
    let tbody = document.getElementById('modal-table-body');
    tbody.innerHTML = '';
    dataset.data.forEach(data => {
        let tr = document.createElement('tr');
        tr.setAttribute('data-name', data.name);
        let td1 = document.createElement('td');
        let button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('class', 'btn btn-danger');
        button.innerHTML = 'X';
        button.setAttribute('data-name', data.name);
        button.addEventListener('click', function(){
            deleteData(this.getAttribute('data-name'));
            setTableLabels();
            addTableData();
        });
        td1.appendChild(button);
        tr.appendChild(td1);

        data.data.forEach(value => {
            let td = document.createElement('td');
            td.innerHTML = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}


function loadModalSaveDatos(column){
    document.getElementById('label-data-name').innerHTML = column;
    setTableLabels();
    addTableData();

    modal.show();
}

function toggleDataName(){
    let data_name = document.getElementById('div-data-name');
    let selector = document.getElementById('data-type-selector').value;
    if(selector == 'labels'){
        data_name.classList.add('d-none');
    }
    else{
        data_name.classList.remove('d-none');
    }
}
document.getElementById('data-type-selector').addEventListener('change', toggleDataName);

function getTableData(column){
    let data = [];
    let rows = document.querySelectorAll('td[data-column="'+column+'"]');
    rows.forEach(row => {
        data.push(row.innerHTML);
    });
    return data;
}

function saveData(){
    let data = getTableData(document.getElementById('label-data-name').innerHTML);
    let type = document.getElementById('data-type-selector').value;

    if(type == 'labels'){
        resetLabels();
        setLabels(data);
    }
    else if(type == 'values'){
        setData(data, document.getElementById('data-name').value);
    }
    setTableLabels();
    addTableData();
}

document.getElementById('btn-save-data').addEventListener('click', saveData);

function downloadCanvasAsImage(canvas_id) {
    let canvas = document.getElementById(canvas_id);
    let link = document.createElement('a');
    link.download = title+'.png';
    link.href = canvas.toDataURL();

    link.click();
    link.remove();
}

document.getElementById('btn-download-canvas').addEventListener('click', () => {
    downloadCanvasAsImage('chart');
});

function getRandomColor(){
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function loadModalConfig(){
    let div_colors = document.getElementById('div-config-data');
    div_colors.innerHTML = '';
    dataset.data.forEach(data => {
        let div = document.createElement('div');
        div.setAttribute('class', 'col-md-6 mb-3');
        let label = document.createElement('label');
        label.innerHTML = 'Color del elemento '+data.name;
        label.setAttribute('class', 'form-label');
        let input = document.createElement('input');
        input.type = 'color';
        input.setAttribute('class', 'form-control');
        input.name = 'color[]';
        input.value = getRandomColor();
        
        div.appendChild(label);
        div.appendChild(input);
        div_colors.appendChild(div);
    });
    modal_config.show();
}
document.getElementById('btn-load-chart').addEventListener('click', loadModalConfig);

function addColumn(){
    let table = document.getElementById('info-table');
    let tr = document.getElementById('table-info-labels');
    let td = document.createElement('td');
    td.classList.add('table-info-cel');
    let input = document.createElement('input');
    input.classList.add('table-info-input');
    input.classList.add('input-label'+'-'+table.rows[0].cells.length);
    input.value = 'Columna '+table.rows[0].cells.length;
    td.appendChild(input);
    tr.appendChild(td);

    for (let i = 1; i < table.rows.length; i++){
        let td = document.createElement('td');
        td.classList.add('table-info-cel');
        let input = document.createElement('input');
        input.classList.add('table-info-input');
        input.classList.add('input-data-'+i);
        td.appendChild(input);
        table.rows[i].appendChild(td);
    }
}

document.getElementById('btn-add-column').addEventListener('click', addColumn);

function addRow(){
    let table = document.getElementById('info-table');
    let tbody = document.getElementById('table-info-body');
    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.classList.add('table-info-cel');
    let input = document.createElement('input');
    input.classList.add('table-info-input');
    input.classList.add('input-name-'+table.rows.length);
    input.value = 'Fila '+table.rows.length;
    td.appendChild(input);
    tr.appendChild(td);
    tbody.appendChild(tr);

    for (let i = 1; i < table.rows[0].cells.length; i++){
        let td = document.createElement('td');
        td.classList.add('table-info-cel');
        let input = document.createElement('input');
        input.classList.add('table-info-input');
        input.classList.add('input-data-'+(table.rows.length-1));
        td.appendChild(input);
        tr.appendChild(td);
    }
}

document.getElementById('btn-add-row').addEventListener('click', addRow);

function loadTableInfoLabels(){
    let table_labels = document.getElementById('table-info-labels');
    table_labels.innerHTML = '';
    let td1 = document.createElement('td');
    td1.classList.add('table-info-cel');
    td1.innerHTML = 'Nombres';
    table_labels.appendChild(td1);
    dataset.labels.forEach(label => {
        let td = document.createElement('td');
        td.classList.add('table-info-cel');
        let input = document.createElement('input');
        input.value = label;
        input.classList.add('table-info-input');
        input.classList.add('input-label'+'-'+(table_labels.cells.length));
        td.appendChild(input);
        table_labels.appendChild(td);
    });
}

function loadTableInfoData(){
    let table_body = document.getElementById('table-info-body');
    table_body.innerHTML = '';
    dataset.data.forEach(data => {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let input1 = document.createElement('input');
        input1.value = data.name;
        input1.classList.add('table-info-input');
        input1.classList.add('input-name-'+(table_body.rows.length+1));
        td1.appendChild(input1);
        td1.classList.add('table-info-cel');
        tr.appendChild(td1);
        data.data.forEach(value => {
            let td = document.createElement('td');
            td.classList.add('table-info-cel');
            let input = document.createElement('input');
            input.value = value;
            input.classList.add('table-info-input');
            input.classList.add('input-data-'+(table_body.rows.length+1));
            td.appendChild(input);
            tr.appendChild(td);
        });
        table_body.appendChild(tr);
    });
}

function loadModalInfo(){
    loadTableInfoLabels();
    loadTableInfoData();

    modal_info.show();
}

document.getElementById('btn-show-info').addEventListener('click', loadModalInfo);

function saveTableInfo(){
    let table_labels = document.getElementById('table-info-labels');
    let table_body = document.getElementById('table-info-body');

    resetLabels();
    resetData();

    let labels_data = [];
    for (let i = 1; i < table_labels.cells.length; i++){
        labels_data.push(document.querySelector('.input-label-'+i).value);
    }
    setLabels(labels_data);

    for (let i = 0; i < table_body.rows.length; i++){
        let data = [];
        let name = document.querySelector('.input-name-'+(i+1)).value;
        for (let j = 1; j < table_body.rows[i].cells.length; j++){
            data.push(document.querySelectorAll('.input-data-'+(i+1))[j-1].value);
        }
        setData(data, name);
    }
}

function closeModalInfo(){
    saveTableInfo();
    modal_info.hide();
}

document.getElementById('btn-close-modal-info').addEventListener('click', closeModalInfo);

function exportDataToJson(){
    let data_str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataset));
    let link = document.createElement('a');
    link.setAttribute('href', data_str);
    link.setAttribute('download', 'data.json');
    link.click();
    link.remove();
}

function exportDataToCsv(){
    let data_str = 'data:text/csv;charset=utf-8,';
    let labels = dataset.labels;
    let data = dataset.data;
    let csv = labels.join(',')+'\n';
    data.forEach(data => {
        csv += data.data.join(',')+'\n';
    });
    data_str += encodeURIComponent(csv);
    let link = document.createElement('a');
    link.setAttribute('href', data_str);
    link.setAttribute('download', 'data.csv');
    link.click();
    link.remove();
}

function exportData(){
    let selector = document.getElementById('export-data-type').value;
    if(selector == 'json'){
        exportDataToJson();
    }
    else if(selector == 'csv'){
        exportDataToCsv();
    }
}
document.getElementById('btn-download-export-data').addEventListener('click', exportData);

function inmportDataFromJson(){
    let input = document.getElementById('import-data');
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e){
        let data = e.target.result;
        let jsonData = JSON.parse(data);
        dataset.labels = jsonData.labels;
        dataset.data = jsonData.data;
    };
    
}

function importDataFromCsv(){
    let input = document.getElementById('import-data');
    let file = input.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e){
        let data = e.target.result;
        let rows = data.split('\n');
        let labels = rows[0].split(',');
        let data_values = [];
        for (let i = 1; i < rows.length-1; i++){
            data_values.push(rows[i].split(','));
        }
        dataset.labels = labels;
        dataset.data = data_values.map(data => ({
            name: 'Data',
            data: data
        }));
        console.log(dataset);
    };
}

function importData(){
    let file = document.getElementById('import-data').files[0];
    let type = file.type;
    if(type == 'application/json'){
        inmportDataFromJson();
    }
    else if(type == 'text/csv'){
        importDataFromCsv();
    }
}

document.getElementById('btn-save-import-data').addEventListener('click', importData);