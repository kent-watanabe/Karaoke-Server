define(['lib/karaokeLibrary', "components/search", "components/joinParty","components/newParty"], function (helper, Search,JoinPartyDlg,NewPartyDlg) {
  return class Queue {
    constructor() {
      var queueElement = $('#queue');
      var queueToolBar = $("<nav id='queue-search-toolbar' class='navbar navbar-expand-sm navbar-light bg-light'>");
      queueElement.append(queueToolBar);
      var ul = $('<ul class="navbar-nav flex-row">');
      var searchButton = $('<button class="nav-pills toolbarButton mdi mdi-database-search bg-light" id="addTrack" title="Search">');
      var partyButton = $('<li class="nav-item dropdown">');
      var partyButtonLink = $('<a class="nav-item dropdown-toggle toolbarButton mdi mdi-party-popper" style="color:black !important" title="Party Actions" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">');
      var partyButtonMenu = $('<ul class="dropdown-menu" aria-labelledby="partyActions">');
      var joinPartyButton = $('<li><a class="dropdown-item" href="#">Join Party</a></li>');
      var newPartyButton = $('<li><a class="dropdown-item" href="#">Create New Party</a></li>');
      partyButton.append(partyButtonLink);
      partyButton.append(partyButtonMenu);
      partyButtonMenu.append(joinPartyButton);
      partyButtonMenu.append(newPartyButton);
      var qrCode = $('<button class="nav-pills toolbarButton mdi mdi-qrcode bg-light" title="Share Link">');
      queueToolBar.append(ul);
      ul.append(searchButton);
      ul.append(partyButton);
      ul.append(qrCode);

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
      joinPartyButton.on('click', this.joinParty.bind(this));
      newPartyButton.on('click', this.createParty.bind(this));
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
        if (item.internalQueueItemId === data.internalQueueItemId) {
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
      var joinParty = new JoinPartyDlg();
      joinParty.open();
    }

    createParty() {
      var newParty = new NewPartyDlg();
      newParty.open();
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
