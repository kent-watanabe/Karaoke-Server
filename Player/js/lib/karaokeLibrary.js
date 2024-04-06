define([],function () {
  return class SharedLibrary {
    static createDOMObject(markup, id, className) {
      var div = $(markup);
      if(id) {
        div.attr('id', id);
      }
      if(className) {
        div.addClass(className);
      }
      return div;
    }

    static getID(id) {
      if(id == null || id === ''){
        return this.containerID;
      }

      return this.containerID + "-" + id;
    }

    static getJquerySelector(id) {
      return "#" + this.getID(id);
    }

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
