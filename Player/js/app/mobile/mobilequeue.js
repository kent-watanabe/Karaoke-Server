var queue = null;
var myWorker = null;
var correlationMap = {};

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

define(['lib/karaokeLibrary', 'components/queue'],
  function (KaraokeLibrary, Queue) {
    $(document).ready(function () {
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
          }
        });
    });
  });
