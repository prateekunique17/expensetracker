let savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

function toggleTheme() {
    let body = document.body;
    body.classList.toggle('light-mode');
    
    let btn = document.getElementById('themeToggle');
    
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        if (btn) btn.textContent = 'Dark Mode';
    } else {
        localStorage.setItem('theme', 'dark');
        if (btn) btn.textContent = 'Light Mode';
    }
}

window.onload = function() {
    let btn = document.getElementById('themeToggle');
    if (btn) {
        if (document.body.classList.contains('light-mode')) {
            btn.textContent = 'Dark Mode';
        } else {
            btn.textContent = 'Light Mode';
        }
    }
}
