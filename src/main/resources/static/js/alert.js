window.showAlert = function(message, type = "info", duration = 2500) {
    const container = document.getElementById("alert-container");

    const alert = document.createElement("div");
    alert.className = `alert-message ${type}`;
    let icon = "fa-info-circle", title = "Info";
    if(type==="success"){ icon="fa-check-circle"; title="Success"; }
    if(type==="error"){ icon="fa-exclamation-circle"; title="Error"; }
    if(type==="warning"){ icon="fa-exclamation-triangle"; title="Warning"; }

    alert.innerHTML = `
        <i class="fas ${icon} alert-icon"></i>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-text">${message}</div>
        </div>
        <button class="alert-close">&times;</button>
        <div class="progress-bar"></div>
    `;

    container.appendChild(alert);

    const closeBtn = alert.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => closeAlert(alert));

    const timeoutId = setTimeout(() => closeAlert(alert), duration);
    alert.timeoutId = timeoutId;

    function closeAlert(alert) {
        clearTimeout(alert.timeoutId);
        alert.classList.add('hide');
        alert.addEventListener('animationend', () => {
            if(alert.parentNode) container.removeChild(alert);
        });
    }
};
