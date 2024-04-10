requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../bootstrap'
  }
});

requirejs(['../app/browserApp']);
