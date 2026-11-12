
const repoUrl = 'https://raw.githubusercontent.com/Janvrin/SolarJetmanResources';

function loadContent() {
    let path = window.location.pathname;

    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    if (path === '') {
        path = '/index';
    }

    const contentContainer = document.querySelector('main');
    if (contentContainer) {
        fetch(`${repoUrl}/main/content${path}.html`)
            .then(response => response.text())
            .then(html => {
                contentContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    }
}

$(document).ready(function() {
    loadContent();
    $('.content-link').on('click', function(e) {
        e.preventDefault();
        const contentPath = $(this).attr('content-path');
        history.pushState(null, '', contentPath);
        loadContent();
    });
    window.addEventListener('popstate', loadContent);
});