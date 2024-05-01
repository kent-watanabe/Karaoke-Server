var karaokePlayer = null;
var queue = null;
var myWorker = null;
var correlationMap = {};
var currentUser = null;

fetch('/whoami',{method: 'GET'}).then((response)=> {
  response.text().then(text => {
    currentUser = JSON.parse(text);
  });
});

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

define(['components/karaokePlayer', 'lib/karaokeLibrary', 'components/queue'],
  function (KaraokePlayer, helper, Queue) {
    $(document).ready(function () {
      $('#greeting').text('Logged in as: ' + currentUser.username);
      karaokePlayer = new KaraokePlayer({
        width: 600,
        height: 486,
        showControls: true
      });

      queue = new Queue();
      myWorker = new Worker("js/karaokews.js");
      postMessageToWorker(
        {
          messageType: 'queueId',
          queueId: localStorage.getItem('queueId')
        });

      postMessageToWorker(
        {
          messageType: 'QUEUE_REFRESH',
          dataMimeType: 'application/json',
          queueId: localStorage.getItem('queueId')
        });
      queue.addListener('stop', (event) => karaokePlayer.stop());
      karaokePlayer.addListener('TrackEnded',(event,id) => queue.trackEnded());
      karaokePlayer.addListener('TrackStarted',(event,id) => queue.trackStarted(id));
      karaokePlayer.addListener('nextTrack',(event) => queue.playNextTrack());

      $('#logoutBtn').on('click', ()=>window.location.href = '/logout');

      myWorker.addEventListener("message",
        function handleMessageFromWorker(msg) {
          var message = msg.data;
          if (message.messageType === "QUEUE_REFRESH") {
            var queueItems = JSON.parse(message.data).queueItems;
            queue.setData(queueItems);
          } else if (message.messageType === "TRACK_ADDED") {
            queue.handleTrackAdded(JSON.parse(message.data));
          } else if (["TRACK_REMOVED", "TRACK_PLAYED"].includes(message.messageType)) {
            var track = JSON.parse(message.data);
            queue.handleTrackPlayed(track);
          } else if (message.messageType === "PLAY_TRACK") {
            var track = JSON.parse(message.data);
            karaokePlayer.playTrack(track);
          }
        });
    });
  });
