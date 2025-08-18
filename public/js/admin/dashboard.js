document.getElementById('logSearch').addEventListener('input', function () {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#logs-table tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});
if (document.getElementById('reportSearch')) {
  document.getElementById('reportSearch').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const rows = document.querySelectorAll('#reports-table tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? '' : 'none';
    });
  });
}

function openResolveReport(reportId) {
  const ResolveReportPopup = document.getElementById('resolve-report-popup');
  const ResolveReportOverlay = ResolveReportPopup.querySelector('.overlay');
  ResolveReportPopup.classList.add('show');
  ResolveReportOverlay.classList.add('show');
  var subjectBox = document.querySelector('#subject-box');
  fetch(`/admin/report/${reportId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('report-id').innerHTML = reportId;
      document.getElementById('report-user').innerHTML = `<span onclick="window.location.href='/${data.report.user?.username}'">${data.report.user?.username || '-'}</span>`;
      document.getElementById('report-time').innerHTML = new Date(data.report.createdAt).toLocaleString("en-IN");
      subjectBox.innerHTML = `<b>Subject: </b> ${data.report.subject}`
      document.getElementById('report-details').textContent = data.report.details;
      document.querySelector('#report-id-input').value = reportId;
    }).catch(err => console.log(err))
}

function closeResolveReport() {
  var ResolveReportPopup = document.getElementById('resolve-report-popup');
  var ResolveReportOverlay = ResolveReportPopup.querySelector('.overlay');
  ResolveReportPopup.classList.remove('show');
  ResolveReportOverlay.classList.remove('show');
}


function openSendNotification() {
  const SendNotificationPopup = document.getElementById('send-notification-popup');
  const SendNotificationOverlay = SendNotificationPopup.querySelector('.overlay');
  SendNotificationPopup.classList.add('show');
  SendNotificationOverlay.classList.add('show');
}

function closeSendNotification() {
  var SendNotificationPopup = document.getElementById('send-notification-popup');
  var SendNotificationOverlay = SendNotificationPopup.querySelector('.overlay');
  SendNotificationPopup.classList.remove('show');
  SendNotificationOverlay.classList.remove('show');
}

function openSendEmail() {
  const SendEmailPopup = document.getElementById('send-email-popup');
  const SendEmailOverlay = SendEmailPopup.querySelector('.overlay');
  SendEmailPopup.classList.add('show');
  SendEmailOverlay.classList.add('show');
}

function closeSendEmail() {
  var SendEmailPopup = document.getElementById('send-email-popup');
  var SendEmailOverlay = SendEmailPopup.querySelector('.overlay');
  SendEmailPopup.classList.remove('show');
  SendEmailOverlay.classList.remove('show');
}


document.getElementById("resolve-report-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("resolve-report-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'></span> &nbsp;Resolving report...";
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
        setTimeout(() => closeResolveReport(), 2000)
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
  fetch(`/logs?dayOffset=${dayOffset}`, {
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
        <td>${log.activity || '-'}</td>
        <td>${new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
        `;
          tbody.appendChild(row);
        });
      } else {
        tbody.innerHTML += `<tr><td colspan="5" style="text-align: center; color:grey">No logs found for ${new Date(data.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' })}.</td></tr>`
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

function openNewsLetter() {
  var NewsLetterPopup = document.getElementById('newsletter-popup');
  var NewsLetterOverlay = NewsLetterPopup.querySelector('.overlay');
  NewsLetterPopup.classList.add('show');
  NewsLetterOverlay.classList.add('show');
}

function closeNewsLetter() {
  var NewsLetterPopup = document.getElementById('newsletter-popup');
  var NewsLetterOverlay = NewsLetterPopup.querySelector('.overlay');
  NewsLetterPopup.classList.remove('show');
  NewsLetterOverlay.classList.remove('show');
}

function convertToddmmyyyy(inputDateStr) {
  // inputDateStr is in 'yyyy-mm-dd' format from input type="date"
  const utcDate = new Date(inputDateStr + 'T00:00:00Z'); // Treat input as UTC start of day

  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format as dd/mm/yyyy
  const day = String(istDate.getDate()).padStart(2, '0');
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const year = istDate.getFullYear();

  return `${day}/${month}/${year}`;
}

document.getElementById("newsletter-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var statusBox = document.getElementById("newsletter-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'></span> &nbsp;Saving newsletter...";
  fetch("/admin/newsletter/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: document.querySelector('#newsletter-title').value,
      newsLetterContent: document.querySelector('#newsletter-content').value,
      scheduledAt: convertToddmmyyyy(document.querySelector('#newsletter-scheduledAt').value)
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = `<i class='fal fa-check-circle'></i> &nbsp;${data.message}`;
        setTimeout(closeNewsLetter, 2000)
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to save newsletter.'}`;
      }
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});


document.getElementById("send-notification-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var conf = confirm("Are you sure you want to send this notification?")
  if (!conf) return;
  var statusBox = document.getElementById("send-notification-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'></span> &nbsp;Sending notification...";
  fetch("/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: document.querySelector('#send-notification-title').value,
      body: document.querySelector('#send-notification-body').value,
      url: document.querySelector('#send-notification-url').value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = `<i class='fal fa-check-circle'></i> &nbsp;${data.message}`;
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to send notification.'}`;
      }
      document.querySelector('#send-notification-form').reset();
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});

document.getElementById("send-email-form").addEventListener("submit", function (e) {
  e.preventDefault();
  var conf = confirm("Are you sure you want to send this email?")
  if (!conf) return;
  var statusBox = document.getElementById("send-email-status");
  statusBox.style.color = "green";
  statusBox.innerHTML = "<span class='fal fa-rotate fa-circle-notch'></span> &nbsp;Sending email...";
  fetch("/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: document.querySelector('#send-email-to').value,
      heading: document.querySelector('#send-email-heading').value,
      body: document.querySelector('#send-email-body').value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        statusBox.innerHTML = `<i class='fal fa-check-circle'></i> &nbsp;${data.message}`;
      } else {
        statusBox.style.color = "red";
        statusBox.innerHTML = `<i class='fal fa-times-circle'></i> &nbsp;${data.message || 'Failed to send email.'}`;
      }
      document.querySelector('#send-email-form').reset();
    })
    .catch(err => {
      console.log(err);
      statusBox.style.color = "red";
      statusBox.innerHTML = "<i class='fal fa-times-circle'></i> &nbsp;Something went wrong.";
    });
});