let isUpdatingChart =false;
let dailyRouteChart;
async function updateDailyRouteChart(dateStr) {
    if (isUpdatingChart) return;
    isUpdatingChart = true;

    try {
        const res = await fetch(`/api/analytics/daily-route-views?date=${dateStr}`);
        const data = await res.json();

        const canvasEl = document.getElementById('daily-route-chart');
        if (!canvasEl) {
            console.error('Canvas element #daily-route-chart not found');
            return;
        }
        if (!canvasEl.offsetHeight) {
            console.warn('Canvas is not visible yet');
            return;
        }
        if (typeof ChartDataLabels === 'undefined') {
            console.error('ChartDataLabels plugin is not loaded');
            return;
        }

        const ctx = canvasEl.getContext('2d');

        if (dailyRouteChart?.destroyed) {
            dailyRouteChart = null;
        }

        if (!Array.isArray(data) || !data.length) {
            console.warn('No data to display');
            document.querySelector('#top-page .value').textContent = '--';

            if (dailyRouteChart) {
                dailyRouteChart.data.labels = [];
                dailyRouteChart.data.datasets[0].data = [];
                dailyRouteChart.update();
            } else {
                dailyRouteChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: `Visits (${dateStr})`,
                                data: [],
                                backgroundColor: '#4120bb',
                                categoryPercentage: 0.9,
                                barPercentage: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: { bottom: 20 }
                        },
                        interaction: {
                            mode: 'index',
                            intersect: false
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: ctx => ` ${ctx.parsed.y} visits`
                                }
                            },
                            datalabels: {
                                anchor: 'start',
                                align: 'end',
                                rotation: -90,
                                formatter: (value, ctx) => ctx.chart.data.labels[ctx.dataIndex],
                                color: 'white',
                                font: {
                                    size: 12,
                                    weight: 'normal'
                                },
                                clip: true
                            }
                        },
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {

                                    color: '#ccc'
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            }

            return;
        }

        const labels = data.map(d => d.route);
        const values = data.map(d => d.total);

        document.querySelector('#top-page .value').textContent = data[0]?.route || '--';

        if (dailyRouteChart) {
            dailyRouteChart.data.labels = labels;
            dailyRouteChart.data.datasets[0].data = values;
            dailyRouteChart.data.datasets[0].label = `Visits (${dateStr})`;
            dailyRouteChart.update();
        } else {
            dailyRouteChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: `Visits (${dateStr})`,
                            data: values,
                            backgroundColor: themeColor,
                            categoryPercentage: 0.9,
                            barPercentage: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { bottom: 20 }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: ctx => ` ${ctx.parsed.y} visits`
                            }
                        },
                        datalabels: {
                            anchor: 'start',
                            align: 'end',
                            rotation: -90,
                            formatter: (value, ctx) => ctx.chart.data.labels[ctx.dataIndex],
                            color: 'white',
                            font: {
                                size: 12,
                                weight: 'normal'
                            },
                            clip: true
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#ccc'
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }
    } catch (err) {
        console.error('Failed to load daily route chart', err);
    } finally {
        isUpdatingChart = false;
    }
}


let platformChart;

async function loadPlatformPieChart(data) {
    try {
        const labels = Object.keys(data);
        const values = Object.values(data);

        const ctx = document.getElementById('platform-pie-chart').getContext('2d');

        if (platformChart) {
            platformChart.data.labels = labels;
            platformChart.data.datasets[0].data = values;
            platformChart.update();
        } else {
            platformChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: [themeColor, '#4dd0e1', '#81c784', '#ffb74d'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#ccc', padding: 10 }
                        },
                        tooltip: {
                            callbacks: {
                                label: ctx => ` ${ctx.parsed} users`
                            }
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.error('Failed to load platform breakdown', err);
    }
}

function showAnalytics(date){
    window.location.href = `/admin/analytics/${date.split('-').reverse().join('-')}`
}