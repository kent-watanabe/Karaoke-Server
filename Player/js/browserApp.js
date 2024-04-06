requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../browserApp'
  }
});

requirejs(['../app/main']);
