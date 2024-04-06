define(['grid', 'karaokeLibrary'], function (Grid, helper) {
  return class Queue {
    constructor() {
      var queueElement = $('#queue');
      var queueToolBar = helper.createDOMObject('<div>', 'queue-search-toolbar',
        'queueToolbar');
      queueElement.append(queueToolBar);
      var searchButton = helper.createDOMObject(
        '<button class="mdiButton mdi-database-search" title="Search">',
        'addTrack', 'searchButton');
      var joinButton = helper.createDOMObject(
        '<button class="mdiButton mdi-location-enter" title="Join another party">');
      var qrCode = helper.createDOMObject(
        '<button class="mdiButton mdi-qrcode" title="Share Link">');
      queueToolBar.append(searchButton);
      queueToolBar.append(joinButton);
      queueToolBar.append(qrCode);
      this.queue = new Grid({
        containerID: 'queue',
        cssPrefix: 'queue',
        width: 600,
        height: 486,
        columns: [
          {propertyName: 'title', label: 'Title', width: 300},
          {propertyName: 'artist', label: 'Artist', width: 300},
          {propertyName: 'singer', label: 'Singer', width: 100},
          {propertyName: 'duration', label: 'Duration', width: 50}
        ]
      });
      searchButton.on('click', this.search.bind(this));
      joinButton.on('click', this.joinParty.bind(this));
      qrCode.on('click', this.createQRCode.bind(this));
      if (!localStorage.getItem('queueId')) {
        var params = helper.parseURLParams(location.href);
        if(params.get('queueId')) {
          localStorage.setItem('queueId', params.get('queueId'));
        }
        else
        {
          this.joinParty();
        }
      }
    }

    createQRCode() {
      fetch(
        '/api/queue/' + localStorage.getItem('queueId') + '/QRCode',{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': helper.getXSRFToken()
          },
          body: JSON.stringify({url: document.URL})
        })
      .then((response) => response.blob())
      .then((data) => {
          var img = $('<img>');
          img.attr('src',URL.createObjectURL(data));
          var div = $('<div>');
          div.append(img);
          div.dialog({
            autoOpen: true,
            height: 300,
            width: 300,
            modal: true,
            resizable: false,
            closeOnEscape: false,
            title: 'QR Code',
            close: function (event, ui) {
              div.dialog('destroy');
              div.remove();
            }
          });
        }
      );
    }

    search() {
      var searchContainer = helper.createDOMObject('<div>', 'search-container');
      searchContainer.attr('display', 'none');
      var searchToolBar = helper.createDOMObject('<div>', 'db-search-toolbar',
        'searchToolbar');
      var searchLabel = helper.createDOMObject(
        '<label htmlFor="search" class="inputLabel">Search</label>');
      var searchInput = helper.createDOMObject(' <input type="text"/>',
        'search', 'searchBox');
      var searchTypeDiv = helper.createDOMObject('<div class="searchTypeDiv">');
      searchTypeDiv.css('display', 'block');
      searchTypeDiv.css('align-content', 'center');
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
      $(document.body).append(searchContainer);
      this.searchGrid = new Grid({
        containerID: 'search-container',
        width: 600,
        height: 486,
        cssPrefix: 'search',
        alternateRowColors: true,
        columns: [
          {
            button: {cssClass: 'mdiButton mdi-plus'},
            width: '1em',
            handler: this.addTrack.bind(this)
          },
          {propertyName: 'title', label: 'Title', width: 300},
          {propertyName: 'artist', label: 'Artist', width: 300},
          {propertyName: 'duration', label: 'Duration', width: 50}
        ]
      });
      searchButton.on('click', this.doSearch.bind(this, searchContainer));
      searchContainer.dialog({
        autoOpen: true,
        height: 300,
        width: 900,
        modal: true,
        resizable: false,
        closeOnEscape: false,
        close: function (event, ui) {
          searchContainer.dialog('destroy');
          searchContainer.remove();
        }
      });
    }

    sendPlayTrackMessage() {
      postMessageToWorker(
        {
          messageType: 'PLAY_TRACK',
          data: JSON.stringify(this.queue.getFirstRow()),
          queueId: localStorage.getItem('queueId')
        });
    }

    setData(data) {
      if(data) {
        this.queue.setData(data);
        if (this.queue.getRowCount() > 0) {
          this.sendPlayTrackMessage();
        }
      }
    }

    playNextTrack() {
      var track = this.queue.removeFirstRow();
      if(track) {
        postMessageToWorker(
          {
            messageType: 'TRACK_PLAYED',
            data: JSON.stringify(track),
            queueId: localStorage.getItem('queueId')
          }, () => {
            if (this.queue.getRowCount() === 0) {
              this.fireEvent('stop');
              return;
            }
            this.sendPlayTrackMessage();
          });
      }
    }

    addItemToQueue(data) {
      this.queue.addRow(data);
      if (this.queue.getRowCount() === 1) {
        this.sendPlayTrackMessage();
      }
    }

    removeItemFromQueue(data) {
      this.queue.removeRow(data);
      if (this.queue.getRowCount() === 0) {
        this.fireEvent('stop');
      }
      else
      {
        this.sendPlayTrackMessage();
      }
    }
    addListener(event, callback) {
      $('#queue').on(event, callback);
    }

    fireEvent(event) {
      $('#queue').trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    joinParty() {
      var joinContainer = helper.createDOMObject('<div>', 'join-container');
      joinContainer.attr('display', 'none');
      var queueIdLabel = helper.createDOMObject('<label htmlFor="queueId" class="inputLabel">Queue ID</label>');
      var queueIdInput = helper.createDOMObject(' <input type="text"/>', 'queueId', 'queueIdBox');
      var joinButton = helper.createDOMObject('<button class="mdiButton mdi-location-enter" title="Join">');
      joinButton.css('margin-left', '1em');
      joinButton.on('click', function () {
        localStorage.setItem('queueId', queueIdInput.val());
        joinContainer.dialog('close');
      });
      joinContainer.append(queueIdLabel);
      joinContainer.append(queueIdInput);
      joinContainer.append(joinButton);
      joinContainer.dialog({
        autoOpen: true,
        height: 100,
        width: 400,
        modal: true,
        resizable: false,
        closeOnEscape: false,
        title: 'Join Party',
        close: function (event, ui) {
          joinContainer.dialog('destroy');
          joinContainer.remove();
        }
      });
    }

    addTrack(event) {
      var tr = $(event.target).parents('tr');
      var dataToSend = this.searchGrid.find(tr.attr('data-id'));
      var queueId = localStorage.getItem('queueId');
      $.ajax('/api/queue/' + queueId + '/add', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': helper.getXSRFToken()
        },
        data: JSON.stringify({
          id: dataToSend.id,
          title: dataToSend.title,
          artist: dataToSend.artist,
          duration: 0,
          singer: $('#singer').val()
        }),
        success: function (data) {
        }
      });
    }

    doSearch(searchContainer) {
      var search = searchContainer.find('#search').val();
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
            this.searchGrid.setData(data);
          }
        }.bind(this)
      });
    }
  }
});
