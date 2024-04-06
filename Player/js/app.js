var player;
var isFullScreen = false;
var myWorker;
var queueId = '66035bd85b32e32671fb80a9';
var queueItems = [];
const octiveAmount =1.0594631;

var correlationMap = {};

requirejs.config({
  baseUrl: '../vendor'
});

function getXSRFToken() {
 return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, '$1');
}

function postMessageToWorker(msg, fn) {
  if (fn) {
    msg.correlationId = new Date().getTime();
    correlationMap[msg.correlationId] = fn;
  }
  myWorker.postMessage(msg);
}

function processCorrelation(correlationId) {
  if (correlationId && correlationMap[correlationId]) {
    correlationMap[correlationId]();
    delete correlationMap[correlationId];
  }
}


$(function () {
    myWorker = new Worker("js/karaokews.js");

    //Set the webworker queueID
    postMessageToWorker({
      messageType: 'queueId',
      queueId: queueId,
      correlationId: new Date().getTime()
    });


    function addTrackRow(track, rowNum) {
      var alternate = rowNum % 2 === 0;
      var tr = $("<tr>");
      if (track.playing) {
        tr.addClass('playing');
      } else {
        tr.addClass(alternate ? 'asset-even' : 'asset-odd');
      }
      tr.attr("data-value", track.id);
      var td = $("<td>");
      td.text(rowNum);
      tr.append(td);
      td = $("<td>");
      td.text(track.title);
      tr.append(td);
      td = $("<td>");
      td.text(track.artist);
      tr.append(td);
      td = $("<td>");
      td.text(track.singer);
      tr.append(td);
      td = $("<td>");
      var date = new Date(track.duration);
      td.text(date.getMinutes() + ":" + date.getSeconds());
      tr.append(td);
      return tr;
    }

    function renderQueue() {
      var rowNum = 1;
      var playListBody = $('#playListBody');
      playListBody.empty();
      queueItems.forEach(track => playListBody.append(addTrackRow(track, rowNum++)));
    }

    function primeCDGPlayer() {
      player.loadTrack({
        mediaPath: "/api/assets/id/",
        cdgFilePrefix: 'empty',
        audioFilePrefix: 'empty'
      });
    }

    function nextTrackFn() {
      var track = queueItems.shift();
      if (track) {
        delete track.playing;
        postMessageToWorker(
          {
            messageType: 'TRACK_PLAYED',
            data: JSON.stringify(track),
            queueId: queueId
          }, () => {
            if (queueItems.length === 0) {
              player.stop();
              primeCDGPlayer();
              renderQueue();
              return;
            }
            playTrack(queueItems[0]);
          });
      }

    }

    function playTrack(track) {
      player.loadTrack({
        mediaPath: "/api/assets/id/",
        cdgFilePrefix: track.id,
        audioFilePrefix: track.id
      });
      track.playing = true;
      renderQueue();
    }

    myWorker.addEventListener("message", function handleMessageFromWorker(msg) {
      var message = msg.data;
      if (message.messageType === "QUEUE_REFRESH") {
        queueItems = JSON.parse(message.data).queueItems;
      } else if (message.messageType === "TRACK_ADDED") {
        queueItems.push(JSON.parse(message.data));
        if (queueItems.length === 1) {
          playTrack(queueItems[0]);
        }
      } else if (["TRACK_REMOVED", "TRACK_PLAYED"].includes(message.messageType)) {
        var track = JSON.parse(message.data);
        for (item in queueItems) {
          if (item.id === track.id) {
            queueItems.splice(item, 1);
            break;
          }
        }
      }
      renderQueue();
      proceesCorrelation(message.correlationId);
    });

    require(['cdg'], function (cdg) {
      var customButtonDiv = $("<span id='player-custom' class='customButtons'>");
      var nextTrackBtn = $("<button id='next-track' class='mdiButton mdi-skip-next'></button>");
      nextTrackBtn.on("click", nextTrackFn);
      customButtonDiv.append(nextTrackBtn);
      var octiveUpBtn = $("<button id='octiveUp' class='mdiButton mdi-music-note-plus'></button>");
      octiveUpBtn.on("click", ()=>{
        $('audio')[0].playbackRate=$('audio')[0].playbackRate*octiveAmount;
        console.log('playbackRate = '+$('audio')[0].playbackRate);
      });
      customButtonDiv.append(octiveUpBtn);
      var octiveDownBtn = $("<button id='octiveDown' class='mdiButton mdi-music-note-minus'></button>");
      octiveDownBtn.on("click",  ()=>{
        $('audio')[0].playbackRate=$('audio')[0].playbackRate/octiveAmount;
        console.log('playbackRate = '+$('audio')[0].playbackRate);
      });
      customButtonDiv.append(octiveDownBtn);
      player = cdg.init("player-cdg", {
        autoplay: true,
        showControls: true,
        nextTrack: {
          el: customButtonDiv[0]
        }
      });
      primeCDGPlayer();
      $('audio').on('ended',nextTrackFn);
    });

    $("#player-cdg").on("dblclick", function () {
      if (!isFullScreen) {
        this.requestFullscreen().then(() => {
          var width = window.innerWidth;
          var height = window.innerHeight;
          $("#player-cdg-border").css({width: width, height: height});
          $("#player-cdg-canvas").css({width: width - 48, height: height, padding: 24});
          $("#player-buttonPanel").css({width: width, height: 54});
          if ($('#next-track').length) {
            var nextTrackWidth = $('#next-track').width();
            $("#player-cdg-audio").css({width: (width * .95) - nextTrackWidth});
          } else {
            $("#player-cdg-audio").css({width: width});
          }

          isFullScreen = true;
        });

      } else {
        document.exitFullscreen().then(() => {
          $("#player-cdg-border").css({width: 324 + "px", height: 216 + "px"});
          $("#player-cdg-canvas").css({width: 288 + "px", height: 192 + "px", padding: 12 + "px"});
          $("#player-buttonPanel").css({width: 324 + "px"});
          if ($('#next-track').length) {
            $("#player-cdg-audio").css({width: (324 - $('#next-track').width())});
          } else {
            $("#player-cdg-audio").css({width: 324 + "px"});
          }
          isFullScreen = false;
        });
      }
    });

    function addTrackHandler(e) {
      var tr = $(e.target).parents('tr');
      var xstfToken =
      $.ajax('/api/queue/' + queueId + '/add', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': getXSRFToken()
        },
        data: JSON.stringify({
          id: tr[0].data.id,
          title: tr[0].data.title,
          artist: tr[0].data.artist,
          duration: 0,
          singer: $('#singer').val()
        }),
        success: function (data) {
        }
      });
    }

    function renderSearchList(listData) {
      var table = $('#searchListBody');
      table.empty();
      var alternate = false;
      listData.forEach((asset)=> {
        var tr = $("<tr>");
        tr.addClass(alternate ? 'asset-even' : 'asset-odd');
        alternate = !alternate;
        tr[0].data = asset;
        var td = $("<td>");
        var addTrackBtn = $("<button>");
        addTrackBtn.addClass(['addTrackBtn','mdiButton','mdi-plus']);
        addTrackBtn.on('click', addTrackHandler);
        td.append(addTrackBtn);
        tr.append(td);
        td = $("<td>");
        td.text(asset.title);
        tr.append(td);
        td = $("<td>");
        td.text(asset.artist);
        tr.append(td);
        td = $("<td>");
        td.text(asset.duration);
        tr.append(td);
        table.append(tr);
      });
    }


    $('#doSearchBtn').on('click', function () {
      var search = $('#searchText').val();
      var type = $('input[name="searchType"]:checked').val();
      $.ajax('/api/assets/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': getXSRFToken()
        },
        data: JSON.stringify({searchString: search, type: type}),
        contentType: 'application/json',
        success: function (data) {
          if (data.length > 0) {
            renderSearchList(data);
          }
        }
      });
    });

  $('#searchText').on('keyup', function (e) {
    if (e.keyCode === 13) {
      $('#doSearchBtn').click();
    }
  });

    postMessageToWorker(
      {
        messageType: 'QUEUE_REFRESH',
        dataMimeType: 'application/json',
        queueId: queueId
      }, () => {
        if (queueItems.length > 0) {
          console.log('Audio is paused ' + $('audio')[0].paused);
          playTrack(queueItems[0]);
        }
      });
  }
)
;
