
const parseMap = {};
const iconMap = {};
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
                contentContainer.innerHTML = parseContentLinks(html);
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    }
}

// Parse the content html and replace strings that match the parseMap keys with a content-link to the related page
function parseContentLinks(html) {
    for (const key in parseMap) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        const path = parseMap[key]
        const icon = iconMap[key + "_small"] || '';

        if (icon) {
            html = html.replace(regex, `<button content-path="${path}" class="content-link inline-link"><img src="https://raw.githubusercontent.com/Janvrin/SolarJetmanResources/${icon}" alt="${key}" /> ${key}</button>`);
        } else {
            html = html.replace(regex, `<button content-path="${path}" class="content-link inline-link">${key}</button>`);
        }
    }
    return html;
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

    fetch(`${repoUrl}/main/config/autolinks.json`)
        .then(response => response.json())
        .then(json => {
            Object.assign(parseMap, json);
        })
        .catch(error => {
            console.error('Error loading autolinks:', error);
        });
    
    fetch(`${repoUrl}/main/config/page_icons.json`)
        .then(response => response.json())
        .then(json => {
            Object.assign(iconMap, json);
        })
        .catch(error => {
            console.error('Error loading icons:', error);
        });
});