define(['lib/karaokeLibrary'], function (helper) {
  class AddTrack{
    constructor(props) {
      var btn = $('<button title="Add to Queue">');
      btn.addClass('mdiButton addToQueueButton mdi-plus');
      btn.css('align-content', 'center');
      btn.on('click', (e)=>{
        this.fireEvent('add_track',this.grid.getRow(this.rowKey));
      });
      this.rowKey = props.rowKey;
      this.grid = props.grid;
      this.btn = btn;
      this.render(props);
    }
    getElement (){
      return this.btn[0];
    }

    fireEvent(event) {
      this.btn.trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    render(props) {
    }
  }

  return class Search
  {
    constructor()
    {
      var searchContainer = helper.createDOMObject('<div id="search-container" class="search-container">');
      searchContainer.attr('display', 'none');
      var searchToolBar = helper.createDOMObject('<div>', 'db-search-toolbar',
        'searchToolbar');
      var searchLabel = helper.createDOMObject(
        '<label htmlFor="search" class="inputLabel">Search</label>');
      var searchInput = helper.createDOMObject(' <input type="text"/>',
        'search', 'searchBox');
      var searchTypeDiv = helper.createDOMObject('<div class="searchTypeDiv" style="display:block;align-content:center">');
      var titleLabel = helper.createDOMObject(
        '<label htmlFor="searchType" class="inputLabel">Title</label>');
      var titleType = helper.createDOMObject(
        '<input type="radio" name="searchType" value="title">');
      var artistLabel = helper.createDOMObject(
        '<label htmlFor="searchType" class="inputLabel">Artist</label>');
      var artistType = helper.createDOMObject(
        '<input type="radio" name="searchType" value="artist" checked>');
      var singerLabel = helper.createDOMObject(
        '<label htmlFor="singer" class="inputLabel">Singer</label>', null,
        'singerLabel');
      var singerInput = helper.createDOMObject(' <input type="text"/>',
        'singer', 'singerBox');
      var searchButton = helper.createDOMObject(
        '<button class="mdiButton mdi-database-search" title="Search">',
        'doSearchBtn', 'searchButton');
      searchToolBar.append(searchLabel);
      searchToolBar.append(searchInput);
      searchTypeDiv.append(artistLabel);
      searchTypeDiv.append(artistType);
      searchTypeDiv.append(titleLabel);
      searchTypeDiv.append(titleType);
      searchToolBar.append(searchTypeDiv);
      searchToolBar.append(singerLabel);
      searchToolBar.append(singerInput);
      searchToolBar.append(searchButton);
      searchContainer.append(searchToolBar);
      this.searchContainer = searchContainer;
      this.searchGrid = new tui.Grid({
        el: searchContainer[0],
        columns: [
          {
            header: " ",
            name: "id",
            renderer: {
              type: AddTrack,
              options: {}
            },
            width:40,
            align:"center"
          },
          {name: 'title', header: 'Title', minWidth: 400},
          {name: 'artist', header: 'Artist', minWidth: 200},
        ]
      });
      searchButton.on('click', ()=>this.doSearch());
      searchInput.on('keypress', (e)=>{
        if(e.keyCode === 13) {
          this.doSearch();
        }
      });
    }

    doSearch() {
      var search = this.searchContainer.find('#search').val();
      var type = $('input[name="searchType"]:checked').val();
      $.ajax('/api/assets/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': helper.getXSRFToken()
        },
        data: JSON.stringify({searchString: search, type: type}),
        contentType: 'application/json',
        success: function (data) {
          if (data.length > 0) {
            this.searchGrid.resetData(data);
          }
        }.bind(this)
      });
    }

    show()
    {
      this.searchContainer.dialog({
        autoOpen: true,
        height: 300,
        width: 900,
        title: 'Search',
        modal: true,
        resizable: false,
        closeOnEscape: false,
        close: function (event, ui) {
          $(this).off();
          $(this).dialog('destroy');
          $(this).remove();
        }
      });
    }

    fireEvent(event) {
      this.searchContainer.trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    addEventListener(event, callback) {
      this.searchContainer.on(event, callback);
    }

    search()
    {
      fetch('/api/search')
        .then(response => response.json())
        .then(data => {
          this.searchGrid.resetData(data);
        });
    }
  }
});
