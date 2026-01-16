import Chart from 'chart.js/auto';

let kanalChart, compareChart, brandChart, brandStackedChart, categoryChart;

export function initCharts() {
    // Initial empty charts or placeholders if needed
}

export function updateCharts(data) {
    updateKanalChart(data.kanalData);
    updateCompareChart(data.metrics);
    updateBrandChart(data.marka);
    updateBrandStackedChart(data.marka);
    updateCategoryChart(data.kategori);
}

function updateKanalChart(kanalData) {
    const ctx = document.getElementById('kanalChart');
    if (!ctx) return;

    if (kanalChart) kanalChart.destroy();

    kanalChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: kanalData.map(k => k.kanal),
            datasets: [{
                data: kanalData.map(k => k.asin),
                backgroundColor: ['#ff9900', '#00a8e8', '#2ecc71'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8b9dc3', padding: 15 } }
            }
        }
    });
}

function updateCompareChart(metrics) {
    const ctx = document.getElementById('compareChart');
    if (!ctx) return;

    if (compareChart) compareChart.destroy();

    compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['FBA', 'DF'],
            datasets: [
                {
                    label: 'Tutar',
                    data: [metrics.fbaTutar, metrics.dfTutar],
                    backgroundColor: ['#ff9900', '#00a8e8'],
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: 'Adet',
                    data: [metrics.fbaAdet, metrics.dfAdet],
                    type: 'line',
                    borderColor: ['#ff9900', '#00a8e8'],
                    backgroundColor: ['#ff9900', '#00a8e8'],
                    pointBackgroundColor: ['#ff9900', '#00a8e8'],
                    borderWidth: 3,
                    pointRadius: 8,
                    yAxisID: 'y1',
                    order: 1
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.dataset.label === 'Tutar' ? '₺' + ctx.raw.toLocaleString('tr-TR') : ctx.raw.toLocaleString('tr-TR') + ' adet'
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#8b9dc3', font: { size: 14, weight: 'bold' } } },
                y: {
                    position: 'left',
                    title: { display: true, text: 'Tutar (₺)', color: '#9b59b6' },
                    ticks: { color: '#9b59b6', callback: v => '₺' + (v / 1e6).toFixed(1) + 'M' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y1: {
                    position: 'right',
                    title: { display: true, text: 'Adet', color: '#2ecc71' },
                    ticks: { color: '#2ecc71' },
                    grid: { display: false }
                }
            }
        }
    });
}

function updateBrandChart(markaData) {
    const ctx = document.getElementById('brandChart');
    if (!ctx) return;

    if (brandChart) brandChart.destroy();

    // Sort top 15 by total tutar
    const top15 = [...markaData].sort((a, b) => b.toplamTutar - a.toplamTutar).slice(0, 15);

    brandChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top15.map(d => d.marka),
            datasets: [{
                data: top15.map(d => d.toplamTutar),
                backgroundColor: top15.map((_, i) => `rgba(155, 89, 182, ${1 - i * 0.05})`),
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => '₺' + ctx.raw.toLocaleString('tr-TR') } }
            },
            scales: {
                x: { ticks: { color: '#8b9dc3', callback: v => '₺' + (v / 1e6).toFixed(1) + 'M' } },
                y: { ticks: { color: '#8b9dc3', font: { size: 10 } } }
            }
        }
    });
}

function updateBrandStackedChart(markaData) {
    const ctx = document.getElementById('brandStackedChart');
    if (!ctx) return;

    if (brandStackedChart) brandStackedChart.destroy();

    const top10 = [...markaData].sort((a, b) => b.toplamTutar - a.toplamTutar).slice(0, 10);

    brandStackedChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(d => d.marka),
            datasets: [
                { label: 'FBA', data: top10.map(d => d.fbaTutar), backgroundColor: '#ff9900' },
                { label: 'DF', data: top10.map(d => d.dfTutar), backgroundColor: '#00a8e8' }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, ticks: { color: '#8b9dc3', maxRotation: 45 } },
                y: { stacked: true, ticks: { color: '#8b9dc3', callback: v => '₺' + (v / 1e6).toFixed(1) + 'M' } }
            }
        }
    });
}

function updateCategoryChart(katData) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChart) categoryChart.destroy();

    categoryChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: katData.map(d => d.kategori),
            datasets: [{
                data: katData.map(d => d.toplamTutar),
                backgroundColor: [
                    'rgba(155,89,182,0.8)', 'rgba(255,153,0,0.8)', 'rgba(0,168,232,0.8)',
                    'rgba(46,204,113,0.8)', 'rgba(241,196,15,0.8)', 'rgba(231,76,60,0.8)',
                    'rgba(52,152,219,0.8)', 'rgba(26,188,156,0.8)', 'rgba(149,165,166,0.7)',
                    'rgba(192,57,43,0.7)', 'rgba(39,174,96,0.7)', 'rgba(41,128,185,0.7)'
                ]
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#8b9dc3', font: { size: 9 }, padding: 6 } },
                tooltip: { callbacks: { label: ctx => ctx.label + ': ₺' + ctx.raw.toLocaleString('tr-TR') } }
            },
            scales: { r: { ticks: { display: false } } }
        }
    });
}
