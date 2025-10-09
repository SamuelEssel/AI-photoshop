document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', function() {
            if (notificationPanel.style.display === 'none' || notificationPanel.style.display === '') {
                notificationPanel.style.display = 'block';
            } else {
                notificationPanel.style.display = 'none';
            }
        });
    }

    if (closeNotificationsBtn && notificationPanel) {
        closeNotificationsBtn.addEventListener('click', function() {
            notificationPanel.style.display = 'none';
        });
    }

    // Close the dropdown if the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (notificationPanel && notificationBtn && !notificationPanel.contains(event.target) && !notificationBtn.contains(event.target)) {
            notificationPanel.style.display = 'none';
        }
    });
});
