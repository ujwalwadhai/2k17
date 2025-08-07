async function updateOnlineUsers() {
    try {
        const res = await fetch('/api/analytics/online-users');
        const data = await res.json();
        const users = data.activeUsers;
        const users1hr = data.activeUsers1hr;
        document.querySelector('#active-1hr').textContent = users1hr.length;
        document.querySelector('#last1hrUserList').innerHTML = ''
        document.querySelector('#activeUserList').innerHTML = ''
        document.querySelector('#active-now').textContent = users.length;
        if (users1hr.length == 0) {
            document.querySelector('#last1hrUserList').innerHTML = 'No data available';
        } else {
            users1hr.forEach(u => {
                if (u.name) {
                    document.querySelector('#last1hrUserList').innerHTML += `<a href="/${u.username}">${u.name.split(' ')[0]}</a>, `;
                } else {
                    document.querySelector('#last1hrUserList').innerHTML += ' Guest, ';
                }
            })
        }
        if (users.length == 0) {
            document.querySelector('#activeUserList').innerHTML = 'No data available';
        } else {
            users.forEach(u => {
                if (u.user?.name) {
                    document.querySelector('#activeUserList').innerHTML += `<a href="/${u.user.username}">${u.user.name.split(' ')[0]}</a>, `;
                } else {
                    document.querySelector('#activeUserList').innerHTML += ' Guest, ';
                }
            })
        }
        const tbody = document.getElementById('online-users-body');
        tbody.innerHTML = users.length ? '' : '<tr><td colspan="4" style="color: grey; text-align: center">No active users</td></tr>';
        document.querySelector('#online-users-count').innerHTML = users.length;

        users.forEach(u => {
            const tr = document.createElement('tr');
            let secondTd;
            if (u.profileOwnerName) {
                secondTd = `<a href="/${u.profileOwnerName}">${u.profileOwnerName}'s Profile</a>`;
            } else if (u.postOwnerName) {
                secondTd = `<a href="/post/${u.postId}">Post by ${u.postOwnerName}</a>`;
            } else if(u.file){
                secondTd = `<a href="/memories/file/${u.file._id}"><span class="fal fa-image"></span>&nbsp; ${u.file.name.split('.')[0]}</a>`;
            } else if(u.folder){
                secondTd = `<a href="/memories/folder/${u.folder._id}"><span class="fal fa-folder-open"></span>&nbsp; ${u.folder.name}</a>`;
            } else {
                secondTd = u.current_route;
            }
            tr.innerHTML = `
                        <td>${u.user?.name ? u.user.name.split(' ')[0] : 'Guest'}</td>
                        <td>${secondTd}</td>
                    `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load online users', err);
    }
}

async function updateTodayUsers() {
    try {
        const res = await fetch('/api/analytics/daily-users');
        const { sessionTimeData, result:{ total = '--', guests = '--', known = '--'} } = await res.json();
        document.querySelector('#active-today').innerHTML = total;
        document.querySelector('#avgTime').innerHTML = sessionTimeData.today.avgTime;
        document.querySelector('#collectiveTime').innerHTML = sessionTimeData.today.collectiveTime;
        let avgTimeChange = ''
        if(sessionTimeData.change.avgTime >= 0){
            avgTimeChange = `<span style="color: #6fdc6f">+${sessionTimeData.change.avgTime}</span> minutes than yesterday`
        } else {
            avgTimeChange = `<span style="color: #ff6f6f">${sessionTimeData.change.avgTime}</span> minutes than yesterday`
        }
        let collectiveTimeChange = ''
        if(sessionTimeData.change.collectiveTime >= 0){
            collectiveTimeChange = `<span style="color: #6fdc6f">+${sessionTimeData.change.collectiveTime}</span> minutes than yesterday`
        } else {
            collectiveTimeChange = `<span style="color: #ff6f6f">${sessionTimeData.change.collectiveTime}</span> minutes than yesterday`
        }
        document.querySelector('#avgTimeChange').innerHTML = avgTimeChange;
        document.querySelector('#collectiveTimeChange').innerHTML = collectiveTimeChange;
        var guestPercent = guests > 0 ? ((guests / total) * 100).toFixed(0) : 0;
        var knownPercent = known > 0 ? ((known / total) * 100).toFixed(0) : 0;
        document.querySelector('#usersTodayList').textContent = `${guestPercent}% guests, ${knownPercent}% known`;
    } catch (err) {
        console.error('Failed to load unique user stats', err);
    }
}

let dailyRouteChart;
let isUpdatingChart = false;

function animateBarHeights(chart, newData, duration = 600) {
    const oldData = chart.data.datasets[0].data.slice();

    chart.data.datasets[0].data = newData.map((val, i) => oldData[i] ?? 0);
    chart.update();
}

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

function startRealtimeUpdates() {
    updateOnlineUsers();
    updateTodayUsers();

    const dateInput = document.getElementById('daily-route-date');
    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;

    setInterval(() => {
        updateOnlineUsers();
        updateTodayUsers();
        updateDailyRouteChart(dateInput.value)
    }, 5000);


    dateInput.addEventListener('change', () => {
        updateDailyRouteChart(dateInput.value);
    });

    updateDailyRouteChart(today);
}

startRealtimeUpdates();

async function loadMonthlySummary() {
    try {
        const res = await fetch('/api/analytics/monthly-users');
        const data = await res.json();

        const { current, sessionData, change, visits, platform_breakdown } = data;
        if(Object.keys(platform_breakdown).length > 0){
            loadPlatformPieChart(platform_breakdown)
        } else {
            document.querySelector('#no-data').textContent = 'No data available';
        }

        document.getElementById('monthly-unique').textContent = current.total;
        document.querySelector('#monthly-unique + .percentage-change span').innerHTML = formatChange(change.total);

        document.getElementById('monthly-visits').textContent = visits.current;
        document.querySelector('#monthly-visits + .percentage-change span').innerHTML = formatChange(visits.change);

        document.getElementById('monthly-guest-known').textContent =
            `${current.known} known / ${current.guests} guests`;
        document.querySelector('#monthly-guest-known + .percentage-change span').innerHTML =
            formatChange(change.known) + ' known, ' + formatChange(change.guests) + ' guests ';

        document.querySelector("#monthAvgTime").innerHTML = sessionData.thisMonth.avgTime;
        let monthAvgTimeChange = ''
        if(sessionData.change.avgTime >= 0){
            monthAvgTimeChange = `<span style="color: #6fdc6f">+${sessionData.change.avgTime}</span>`
        } else {
            monthAvgTimeChange = `<span style="color: #ff6f6f">${sessionData.change.avgTime}</span>`
        }
        document.querySelector("#monthAvgTimeChange").innerHTML = monthAvgTimeChange;

        const monthlyOverviewTbody = document.querySelector('#monthly-overview-body');
        var topUser = data.topUser ? `<a href='/${data.topUser.username}'>${data.topUser.name.split(' ')[0]} ${data.topUser.name.split(' ')[1][0]}.</a>` : '<span class="grey-1">No data</span>';

        monthlyOverviewTbody.innerHTML = `
                        <tr>
                            <td>Most active user</td>
                            <td>${topUser}</td>
                        </tr>
                        <tr>
                            <td>Most visited route</td>
                            <td>${data.topRoute ? `<a href='${data.topRoute}'>${data.topRoute}</a>` : '<span class="grey-1">No data available</span>'}</td>
                        </tr>
                        <tr>
                            <td>Most viewed folder</td>
                            <td>${data.topFolder ? `<a href='${data.topFolder._id}'>${data.topFolder.name}</a>` : '<span class="grey-1">No data available</span>'}</td>
                        </tr>
                        <tr>
                            <td>Most viewed file</td>
                            <td>${data.topFile ? `<a href='${data.topFile._id}'>${data.topFile.name}</a>` : '<span class="grey-1">No data available</span>'}</td>
                        </tr>
                        `

    } catch (err) {
        console.error('Failed to load monthly summary:', err);
    }
}

function formatChange(value) {
    const rounded = Math.round(value * 10) / 10;
    const sign = rounded >= 0 ? '+' : '';
    const cls = rounded < 0 ? 'negative' : 'positive';
    return `<span class="${cls}">${sign}${rounded}%</span>`;
}

loadMonthlySummary();

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