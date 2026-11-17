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

async function enrich(path) {
    addPageTitle(path);
    addBreadcrumbs(path);
    await Promise.all([
        addMetadataTables(),
        addDataTables()
    ]);
    addIconsToLinks();
}

function addPageTitle(path) {
    const title = pageTitles[path] || path.split('/').pop();
    const icon = pageIcons[path] ? `<img src="${repoUrl}/main/${pageIcons[path]["large"]}" alt="${title} icon"> ` : '';

    contentContainer.prepend("<h1>" + icon + title + "</h1>");
}

function addBreadcrumbs(path) {
    var html = "<div>";

    const parts = path == "/index" ? [""] : path.split('/');

    var currentPath = '';

    for (var i = 0; i < parts.length; i++) {

        var part = parts[i];

        currentPath += (currentPath === "/" ? "" : "/") + parts[i];

        const title = pageTitles[currentPath] || parts[i];

        html += `<span content-path="${currentPath}" class="content-link inline-link">${title}</span>`;
        if (i < parts.length - 1) {
            html += '  /  ';
        }
    }

    html += "</div>";
    contentContainer.prepend(html);
}

async function addMetadataTables() {
    const metadataTables = contentContainer.find('div.metadata-table').toArray();
    const requests = metadataTables.map(async (table) => {
        const path = $(table).data('path');
        const response = await fetch(`${repoUrl}/main/data${path}`);

        if (!response.ok) {
            console.error('Error loading metadata:', response.statusText);
            return;
        }

        const metadata = await response.json();

        let tableHtml = '<table class="data-table">';
        for (const key in metadata) {
            tableHtml += `<tr><th>${key}</th><td>${metadata[key]}</td></tr>`;
        }
        tableHtml += '</table>';

        $(table).html(tableHtml);

        console.log('Metadata loaded for', path);
    });
    await Promise.all(requests);
}

async function addDataTables() {
    const dataTables = contentContainer.find('div.data-table').toArray();
    const requests = dataTables.map(async (table) => {
        const path = $(table).data('path');
        const response = await fetch(`${repoUrl}/main/data${path}`);

        if (!response.ok) {
            console.error('Error loading data:', response.statusText);
            return;
        }

        const data = await response.json();

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

        console.log('Data loaded for', path);
    });
    await Promise.all(requests);
}

function addIconsToLinks() {
    console.log(pageIcons);
    contentContainer.find('.content-link').each(function() {
        const link = $(this);
        const contentPath = link.attr('content-path');
        console.log(contentPath);
        const icon = pageIcons[contentPath] ? `<img src="${repoUrl}/main/media/icons/${pageIcons[contentPath]["small"]}" alt=""> ` : '';
        link.prepend(icon);
    });
}

$(document).ready(async function() {

    await $.getJSON(`${repoUrl}/main/config/page_titles.json`, function(data) {
        pageTitles = data;
    });
    await $.getJSON(`${repoUrl}/main/config/page_icons.json`, function(data) {
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