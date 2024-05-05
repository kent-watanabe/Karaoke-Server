define([],function () {
  return class SharedLibrary {
    static getXSRFToken() {
      return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    }

    static parseURLParams(url) {
      var searchParams = new URLSearchParams((new URL(url)).search);
      var params = new Map();
      for (let pair of searchParams.entries()) {
        params.set(pair[0], pair[1]);
      }
      return params;
    }
  }
});
