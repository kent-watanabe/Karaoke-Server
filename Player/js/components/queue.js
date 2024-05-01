define(['lib/karaokeLibrary', "components/search"], function (helper, Search) {
  return class Queue {
    constructor() {
      var queueElement = $('#queue');
      var queueToolBar = helper.createDOMObject('<div>', 'queue-search-toolbar',
        'queueToolbar');
      queueElement.append(queueToolBar);
      var searchButton = helper.createDOMObject(
        '<button class="mdiButton toolbarButton mdi-database-search" title="Search">',
        'addTrack', 'searchButton');
      var joinButton = helper.createDOMObject(
        '<button class="mdiButton toolbarButton mdi-location-enter" title="Join another party">');
      var qrCode = helper.createDOMObject(
        '<button class="mdiButton toolbarButton mdi-qrcode" title="Share Link">');
      queueToolBar.append(searchButton);
      queueToolBar.append(joinButton);
      queueToolBar.append(qrCode);
      tui.Grid.applyTheme('striped');
      this.queue = new tui.Grid({
        el: queueElement[0],
        bodyHeight: 'auto',
        columns: [
          {name: 'title', header: 'Title'},
          {name: 'artist', header: 'Artist'},
          {name: 'singer', header: 'Singer'},
          {name: 'duration', header: 'Duration'}
        ]
      });
      searchButton.on('click', this.displaySearch.bind(this));
      joinButton.on('click', this.joinParty.bind(this));
      qrCode.on('click', this.createQRCode.bind(this));
      if (!localStorage.getItem('queueId')) {
        var params = helper.parseURLParams(location.href);
        if (params.get('queueId')) {
          localStorage.setItem('queueId', params.get('queueId'));
        } else {
          this.joinParty();
        }
      }
    }

    createQRCode() {
      fetch(
        '/api/queue/' + localStorage.getItem('queueId') + '/QRCode', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': helper.getXSRFToken()
          }
        })
      .then((response) => response.blob())
      .then((data) => {
          var img = $('<img>');
          img.attr('src', URL.createObjectURL(data));
          var div = $('<div class="qrCodeDialog">');
          div.append(img);
          div.dialog({
            autoOpen: true,
            width: 'auto',
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

    displaySearch() {
      var search = new Search();
      search.addEventListener('add_track', this.addTrack.bind(this));
      search.show();
    }

    handleTrackPlayed(track) {
      if (track) {
        this.removeItemFromQueue(track);
        if (this.queue.getRowCount() > 0) {
          this.sendPlayTrackMessage(this.queue.getRowAt(0));
        } else {
          this.fireEvent('stop');
        }
      }
    }

    sendPlayTrackMessage(queueItem) {
      console.debug(JSON.stringify(queueItem));

      postMessageToWorker(
        {
          messageType: 'PLAY_TRACK',
          data: JSON.stringify(queueItem),
          queueId: localStorage.getItem('queueId')
        });
    }

    setData(data) {
      if (data) {
        this.queue.resetData(data);
        if (this.queue.getRowCount() > 0) {
          this.sendPlayTrackMessage(this.queue.getRowAt(0));
        }
      }
    }

    trackEnded() {
      var track = this.queue.getRowAt(0);
      if (track) {
        postMessageToWorker(
          {
            messageType: 'TRACK_PLAYED',
            data: JSON.stringify(track),
            queueId: localStorage.getItem('queueId')
          });
      }
    }

    playNextTrack() {
      this.trackEnded();
    }

    trackStarted(id) {
      this.queue.getData().forEach(function (item) {
        if (item.id === id) {
          item._attributes = {
            className: {
              row: ['red']
            }
          };
        }
      });
    }

    handleTrackAdded(track) {
      this.addItemToQueue(track);
    }

    addItemToQueue(data) {
      this.queue.appendRow(data);
    }

    removeItemFromQueue(data) {
      this.queue.getData().forEach(function (item, index) {
        if (item.id === data.id) {
          this.queue.removeRow(item.rowKey);
        }
      }.bind(this));
    }

    addListener(event, callback) {
      $('#queue').on(event, callback);
    }

    fireEvent(event) {
      $('#queue').trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    joinParty() {
      var joinContainer = helper.createDOMObject('<div>', 'join-container',"join-container");
      var queueIdLabel = helper.createDOMObject(
        '<label htmlFor="queueId" class="inputLabel">Queue ID</label>');
      var queueIdInput = helper.createDOMObject(' <input type="text"/>',
        'queueId', 'queueIdBox');
      var joinButton = helper.createDOMObject(
        '<button class="mdiButton mdi-location-enter" title="Join">');
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

    addTrack(event, dataToSend) {
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
        })
      });
    }
  }
});
