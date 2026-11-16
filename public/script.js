var pageIcons = {};
var pageTitles = {};
var contentContainer = null
const repoUrl = 'https://raw.githubusercontent.com/Janvrin/SolarJetmanResources';

function loadContent() {
    let path = window.location.pathname;

    if (path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    if (path === '') {
        path = '/index';
    }

    if (contentContainer) {
        fetch(`${repoUrl}/main/content${path}.html`)
            .then(response => response.text())
            .then(html => {
                contentContainer.html(html);
                enrich(path);
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    }
}

function enrich(path) {
    addPageTitle(path);
    addBreadcrumbs(path);
    addMetadataTables();
    addDataTables();
    addLinks();
}

function addPageTitle(path) {
    const title = pageTitles[path] || path.split('/').pop();
    const icon = pageIcons[path] ? `<img src="${repoUrl}/main/${pageIcons[path]}" alt="${title} icon"> ` : '';

    contentContainer.prepend("<h2>" + icon + title + "</h2>");
}

function addBreadcrumbs(path) {
    var html = "<div>";

    const parts = path == "/index" ? [""] : path.split('/');

    var currentPath = '';

    for (var i = 0; i < parts.length; i++) {

        var part = parts[i];

        currentPath += (currentPath === "/" ? "" : "/") + parts[i];

        const title = pageTitles[currentPath] || parts[i];

        html += `<button content-path="${currentPath}" class="content-link inline-link">${title}</button>`;
        if (i < parts.length - 1) {
            html += ' / ';
        }
    }

    html += "</div>";
    contentContainer.prepend(html);
}

function addMetadataTables() {
    contentContainer.find('div.metadata-table').each(function() {
        const table = this;
        const path = $(table).data('path');
        fetch(`${repoUrl}/main/data${path}`)
            .then(response => response.json())
            .then(metadata => {
                let tableHtml = '<table class="data-table">';
                for (const key in metadata) {
                    tableHtml += `<tr><th>${key}</th><td>${metadata[key]}</td></tr>`;
                }
                tableHtml += '</table>';

                $(table).html(tableHtml);
            })
            .catch(error => {
                console.error('Error loading metadata:', error);
            });
    });
}

function addDataTables() {
    contentContainer.find('div.data-table').each(function() {
        const table = this;
        const path = $(table).data('path');
        fetch(`${repoUrl}/main/data${path}`)
            .then(response => response.json())
            .then(data => {
                let tableHtml = '<table class="data-table"><thead><tr>';
                for (const header of data["headers"]) {
                    tableHtml += `<th>${header}</th>`;
                }
                tableHtml += '</tr></thead><tbody>';
                for (const row of data["rows"]) {
                    tableHtml += '<tr>';
                    for (const cell of row) {
                        tableHtml += `<td>${cell}</td>`;
                    }
                    tableHtml += '</tr>';
                }
                tableHtml += '</tbody></table>';

                $(table).html(tableHtml);
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    });
}

function addLinks() {
}

$(document).ready(function() {

    $.getJSON(`${repoUrl}/main/config/page_titles.json`, function(data) {
        pageTitles = data;
    });
    $.getJSON(`${repoUrl}/main/config/page_icons.json`, function(data) {
        pageIcons = data;
    });
    contentContainer = $('#content');

    loadContent();
    $('body').on('click', '.content-link', function(e) {
        e.preventDefault();
        const contentPath = $(this).attr('content-path');
        history.pushState(null, '', contentPath);
        loadContent();
    });
    window.addEventListener('popstate', loadContent);
});