document.getElementById('logSearch').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#logs-table tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
});

document.getElementById('reportSearch').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#reports-table tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
});

function openResolveReport(reportId) {
  const ResolveReportPopup = document.getElementById('resolve-report-popup');
  const ResolveReportOverlay = ResolveReportPopup.querySelector('.overlay');
  ResolveReportPopup.classList.add('show');
  ResolveReportOverlay.classList.add('show');
  var subjectBox = document.querySelector('#subject-box');
    fetch(`/report/${reportId}`)
    .then(res =>  res.json())
    .then(data => {
        document.getElementById('report-id').innerHTML = reportId;
        document.getElementById('report-user').innerHTML = `<span onclick="window.location.href='/u/${data.report.user?.username}'">${data.report.user?.username || '-'}</span>`;
        document.getElementById('report-time').innerHTML = new Date(data.report.createdAt).toLocaleString("en-IN");
        subjectBox.innerHTML = `<b>Subject: </b> ${data.report.subject}`
        document.getElementById('report-details').textContent = data.report.details;
        document.querySelector('#report-id-input').value = reportId;
    }).catch(err=>console.log(err))
}

function closeResolveReport(){
  var ResolveReportPopup = document.getElementById('resolve-report-popup');
  var ResolveReportOverlay = ResolveReportPopup.querySelector('.overlay');
  ResolveReportPopup.classList.remove('show');
  ResolveReportOverlay.classList.remove('show');
}

document.getElementById("resolve-report-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("resolve-report-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'><span> &nbsp;Resolving report...";
  var reportId = document.getElementById('report-id-input').value;
  fetch("/admin/report/resolve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        resolution: document.querySelector('#resolution').value,
        reportId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = "<i class='fal fa-check-circle'></i> &nbsp;Report resolved and email sent to user!";
        document.querySelector(`#report-${reportId}`).style.display = 'none'
        setTimeout(()=> closeResolveReport(), 2000)
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to resolve report.'}`;
      }
    })
    .catch(err => {
        console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});



let dayOffset = 0;

function loadLogs() {
  fetch(`/admin/logs?dayOffset=${dayOffset}`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#logs-table tbody');
      if (data.logs && data.logs.length) {

        data.logs.forEach(log => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${log.system ? '<span style="color: yellow;">System</span>' : log.user?.username || 'Unknown'}</td>
            <td>${log.action}</td>
            <td>${log.detail || '-'}</td>
            <td>${new Date(log.createdAt).toLocaleString('en-IN')}</td>
          `;
          tbody.appendChild(row);
        });
      } else {
        document.querySelector('#loadMoreLogsBtn').style.display = 'none';
        tbody.innerHTML += `<tr><td colspan="5" style="text-align: center; color:grey">No more logs found.</td></tr>`
      }
    })
    .catch(err => {
      console.error(err);
      alert('Failed to load logs! Check console for more details.')
    });
}

document.getElementById('loadMoreLogsBtn').addEventListener('click', () => {
  dayOffset++;
  loadLogs();
});

loadLogs()
