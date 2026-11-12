


function loadContent() {
    const path = window.location.pathname;
    const contentContainer = document.querySelector('main');
    if (contentContainer) {
        fetch(`${repoUrl}/raw/main/content${path}`)
            .then(response => response.text())
            .then(html => {
                contentContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading content:', error);
            });
    }
}

$(document).ready(loadContent);
$('.content-link').on('click', function(e) {
    e.preventDefault();
    const href = $(this).attr('href');
    history.pushState(null, '', href);
    loadContent();
});
window.addEventListener('popstate', loadContent);