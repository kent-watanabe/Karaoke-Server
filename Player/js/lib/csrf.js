var csrfToken = '';
fetch(document.location.href, {method: 'HEAD'}).then(resp => {
  const headers = Object.fromEntries(resp.headers.entries());
  csrfToken = headers['_csrf'];
});
