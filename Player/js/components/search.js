define(['lib/karaokeLibrary'], function (helper) {
  class AddTrack{
    constructor(props) {
      var btn = $('<button title="Add to Queue" class="mdi addToQueueButton mdi-plus">');
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
      var searchContainer = $('<div id="search-container" class="container-fluid" style="width:60vw;height:40vh">');
      searchContainer.attr('display', 'none');
      var searchToolBar = $('<div id="db-search-toolbar" class="navbar navbar-expand-sm flex-row">');
      var searchInput = $('<input type="text" id="search" class="form-control m-2" placeholder="Artist-Title"/>');
      var searchTypeDiv = $('<div class="input-control border-1">');
      var titleDiv = $('<div class="form-check m-1">');
      titleDiv.html('<label htmlFor="searchType" class="form-check-label">Title</label><input type="radio" name="searchType" value="title" class="form-check-input">');
      var artistDiv = $('<div class="form-check">');
      artistDiv.html('<label htmlFor="searchType" class="form-check-label">Artist</label><input type="radio" name="searchType" value="artist" class="form-check-input" checked>');
      var singerInput = $('<input type="text" id="singer" class="form-control m-2" style="width:10em;"/>');
      var searchButton = $('<button class="btn btn-primary mdi mdi-database-search" title="Search" id="doSearchBtn">');
      if(currentUser)
      {
        singerInput.val(currentUser.username);
      }

      searchToolBar.append(searchInput);
      searchTypeDiv.append(artistDiv);
      searchTypeDiv.append(titleDiv);
      searchToolBar.append(searchTypeDiv);
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
          {name: 'title', header: 'Title', minWidth: 300},
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
        height: 350,
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
