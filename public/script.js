var pageIcons = {};
var pageTitles = {};
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
                contentContainer.innerHTML = createBreadcrumbs(path) + createPageTitle(path) + html;
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    }
}

function createBreadcrumbs(path) {
    const html = "<div>";

    const parts = path.split('/');

    var currentPath = '';

    for (var i = 0; i < parts.length; i++) {
        currentPath += '/' + parts[i];
        html += `<button content-path="${currentPath}" class="content-link inline-link">${parts[i]}</button>`;
        if (i < parts.length - 1) {
            html += ' / ';
        }
    }

    html += "</div>";
    return html;
}

function createPageTitle(path) {
    const title = pageTitles[path] || path.split('/').pop();
    const icon = pageIcons[path] ? `<img src="${repoUrl}/main/${pageIcons[path]}" alt="${title} icon"> ` : '';

    return "<h2>" + icon + title + "</h2>";
}

$(document).ready(function() {
    loadContent();
    $('body').on('click', '.content-link', function(e) {
        e.preventDefault();
        const contentPath = $(this).attr('content-path');
        history.pushState(null, '', contentPath);
        loadContent();
    });
    window.addEventListener('popstate', loadContent);

    $.getJSON(`${repoUrl}/main/config/page_titles.json`, function(data) {
        pageTitles = data;
    });
    $.getJSON(`${repoUrl}/main/config/page_icons.json`, function(data) {
        pageIcons = data;
    });
});