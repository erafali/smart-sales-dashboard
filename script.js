let salesChartInstance = null;
let productChartInstance = null;
let profitChartInstance = null;


// ONE combined dataset
let allData = [];

document.getElementById('fileInput').addEventListener('change', handleFile);

// CSV Upload
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };

    reader.readAsText(file);
}

function processCSV(data) {
    const rows = data.split('\n').slice(1);

    rows.forEach(row => {
        const cols = row.split(',');

        if (cols.length < 5) return;

        allData.push({
            Date: cols[0].trim(),
            Product: cols[1].trim(),
            Quantity: parseInt(cols[2]),
            Price: parseFloat(cols[3]),
            Cost: parseFloat(cols[4])
        });
    });

    processAllData();
}

// Manual Entry
function addData() {
    const date = document.getElementById('date').value;
    const product = document.getElementById('product').value;
    const qty = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const cost = parseFloat(document.getElementById('cost').value);

    if (!date || !product || !qty || !price || !cost) {
        alert("Please fill all fields");
        return;
    }

    allData.push({
        Date: date,
        Product: product,
        Quantity: qty,
        Price: price,
        Cost: cost
    });

    processAllData();
}

// MAIN PROCESS FUNCTION
function processAllData() {
    let salesByDate = {};
    let productSales = {};
    let profitByDate = {};

    allData.forEach(row => {
        const revenue = row.Quantity * row.Price;
        const cost = row.Quantity * row.Cost;
        const profit = revenue - cost;

        salesByDate[row.Date] = (salesByDate[row.Date] || 0) + revenue;
        productSales[row.Product] = (productSales[row.Product] || 0) + row.Quantity;
        profitByDate[row.Date] = (profitByDate[row.Date] || 0) + profit;
    });

    drawSalesChart(salesByDate);
    drawProductChart(productSales);
    drawProfitChart(profitByDate);
    generateInsights(productSales);
    updateTable();
}

// Charts
function drawSalesChart(data) {
    if (salesChartInstance) salesChartInstance.destroy();

    salesChartInstance = new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Sales',
                data: Object.values(data),
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
}

function drawProductChart(data) {
    if (productChartInstance) productChartInstance.destroy();

    productChartInstance = new Chart(document.getElementById('productChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Products',
                data: Object.values(data)
            }]
        }
    });
}

function drawProfitChart(data) {
    if (profitChartInstance) profitChartInstance.destroy();

    profitChartInstance = new Chart(document.getElementById('profitChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Profit',
                data: Object.values(data)
            }]
        }
    });
}

function updateTable() {
    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    allData.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.Date}</td>
            <td>${row.Product}</td>
            <td>${row.Quantity}</td>
            <td>${row.Price}</td>
            <td>${row.Cost}</td>
        `;

        tbody.appendChild(tr);
    });
}

function downloadCSV() {
    let csv = "Date,Product,Quantity,Price,Cost\n";

    allData.forEach(row => {
        csv += `${row.Date},${row.Product},${row.Quantity},${row.Price},${row.Cost}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_report.csv";
    a.click();
}

// Insights
function generateInsights(productSales) {
    const insightsList = document.getElementById('insights');
    insightsList.innerHTML = "";

    let entries = Object.entries(productSales);

    if (entries.length === 0) return;

    entries.sort((a, b) => b[1] - a[1]);

    const top = entries[0];
    const low = entries[entries.length - 1];

    insightsList.innerHTML += `<li>🏆 Top product: <b>${top[0]}</b></li>`;
    insightsList.innerHTML += `<li>📉 Low performing product: <b>${low[0]}</b></li>`;
}