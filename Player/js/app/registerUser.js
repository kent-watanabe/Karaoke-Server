$(()=> {
  var jQueryDoc = $(document);
  jQueryDoc.on('click', '#register', registerUser);
  jQueryDoc.find('input[name="_csrf"]').val(csrfToken);
});

function registerUser() {
  fetch('/api/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
      username: $('#username').val(),
      password: $('#password').val(),
      name: $('#name').val(),
      email: $('#email').val(),
    }),
  }).then(resp => {
    if (resp.status === 200) {
      window.location.href = '/login';
    } else {
      resp.text().then(text => {
        alert(text);
      });
    }
  });
}
